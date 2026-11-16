// ==========================================================================
// DATOS INICIALES (Estado local antes de conectar a PostgreSQL / Express)
// ==========================================================================
let nfcCards = [
  {
    id: 'nfc_01',
    name: 'Mesa 01 — Posavasos Principal',
    group: 'marketing',
    groupLabel: 'Marketing & Menú',
    uid: '04:A2:8F:1C',
    targetUrl: 'https://instagram.com/tu_restaurante_oficial',
    passwordProtected: true,
    scans: 842
  },
  {
    id: 'nfc_02',
    name: 'Caja — Tarjeta Fidelización',
    group: 'fidelizacion',
    groupLabel: 'Tarjeta de Fidelización',
    uid: '04:B9:12:7E',
    targetUrl: 'https://tudominio.com/wallet/fidelizacion',
    passwordProtected: true,
    scans: 1120
  },
  {
    id: 'nfc_03',
    name: 'Salón VIP — Acceso Wi-Fi Directo',
    group: 'accesos',
    groupLabel: 'Accesos & Wi-Fi',
    uid: '04:D4:55:9A',
    targetUrl: 'WIFI:S:Invitados_VIP;T:WPA;P:clave2026;;',
    passwordProtected: true,
    scans: 456
  }
];

let customers = [
  {
    id: 'cust_1',
    name: 'Gibelis M.',
    stamps: '4 / 5 sellos',
    lastVisitDays: 2,
    status: 'A 1 sello del premio'
  },
  {
    id: 'cust_2',
    name: 'Carlos R.',
    stamps: '3 / 5 sellos',
    lastVisitDays: 21,
    status: 'Inactivo (21 días)'
  },
  {
    id: 'cust_3',
    name: 'María F.',
    stamps: '5 / 5 sellos',
    lastVisitDays: 1,
    status: 'Premio disponible'
  }
];

let selectedCardId = 'nfc_01';
let currentFilter = 'all';

// ==========================================================================
// REFERENCIAS AL DOM
// ==========================================================================
const cardsContainer = document.getElementById('nfc-cards-container');
const customerListContainer = document.getElementById('customer-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('card-modal');
const nfcForm = document.getElementById('nfc-form');
const quickRedirectForm = document.getElementById('quick-redirect-form');
const toastEl = document.getElementById('toast');

// ==========================================================================
// FUNCIONES DE RENDERIZADO
// ==========================================================================
function renderCards() {
  cardsContainer.innerHTML = '';

  const filtered = currentFilter === 'all'
    ? nfcCards
    : nfcCards.filter(c => c.group === currentFilter);

  filtered.forEach(card => {
    const isSelected = card.id === selectedCardId;
    const cardEl = document.createElement('article');
    cardEl.className = `neutral-card ${isSelected ? 'selected-card' : ''}`;
    cardEl.innerHTML = `
      <div>
        <div class="card-top-meta">
          <span class="tag-label">${card.groupLabel}</span>
          <span class="uid-badge">UID: ${card.uid}</span>
        </div>
        <h3 class="card-title">${card.name}</h3>
        <div class="card-url">${card.targetUrl}</div>
      </div>
      <div class="card-footer-actions">
        <span class="lock-status">🔒 PWD Activo · ${card.scans} toques</span>
        <div class="card-btn-group">
          <button class="btn-pill btn-ghost btn-sm" onclick="selectForQuickEdit('${card.id}')">Seleccionar</button>
          <button class="btn-pill btn-filled btn-sm" onclick="openEditModal('${card.id}')">Editar</button>
        </div>
      </div>
    `;
    cardsContainer.appendChild(cardEl);
  });
}

function renderCustomers() {
  customerListContainer.innerHTML = '';
  customers.forEach(c => {
    const row = document.createElement('div');
    row.className = 'customer-row';
    row.innerHTML = `
      <div class="customer-info">
        <strong>${c.name}</strong>
        <span>${c.status}</span>
      </div>
      <span class="stamps-badge">${c.stamps}</span>
    `;
    customerListContainer.appendChild(row);
  });
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3200);
}

// ==========================================================================
// ACCIONES INTERACTIVAS
// ==========================================================================
window.selectForQuickEdit = function(id) {
  selectedCardId = id;
  const card = nfcCards.find(c => c.id === id);
  document.getElementById('quick-status').textContent = `Editando destino rápido para: ${card.name}`;
  renderCards();
};

// Cambio dinámico de enlace sin re-escanear NFC
quickRedirectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('quick-url-input');
  let newUrl = input.value.trim();
  if (!newUrl) return;

  if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
    newUrl = 'https://' + newUrl;
  }

  const card = nfcCards.find(c => c.id === selectedCardId);
  if (card) {
    card.targetUrl = newUrl;
    renderCards();
    input.value = '';
    showToast(`✓ Destino actualizado en nube para "${card.name}" sin regrabar el chip.`);
  }
});

// Filtros por grupo
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => {
      b.classList.remove('btn-filled', 'active');
      b.classList.add('btn-ghost');
    });
    btn.classList.remove('btn-ghost');
    btn.classList.add('btn-filled', 'active');
    currentFilter = btn.dataset.group;
    renderCards();
  });
});

// Modal Crear / Editar
function openCreateModal() {
  document.getElementById('modal-title').textContent = 'Nueva Etiqueta NFC';
  document.getElementById('edit-card-id').value = '';
  nfcForm.reset();
  modal.classList.remove('hidden');
}

window.openEditModal = function(id) {
  const card = nfcCards.find(c => c.id === id);
  if (!card) return;
  document.getElementById('modal-title').textContent = 'Editar Etiqueta NFC';
  document.getElementById('edit-card-id').value = card.id;
  document.getElementById('card-name').value = card.name;
  document.getElementById('card-group').value = card.group;
  document.getElementById('card-uid').value = card.uid;
  document.getElementById('card-url').value = card.targetUrl;
  document.getElementById('card-password').value = '1234';
  modal.classList.remove('hidden');
};

document.getElementById('btn-new-tag').addEventListener('click', openCreateModal);
document.getElementById('btn-hero-create').addEventListener('click', openCreateModal);
document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));
document.getElementById('cancel-modal').addEventListener('click', () => modal.classList.add('hidden'));

nfcForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const editId = document.getElementById('edit-card-id').value;
  const name = document.getElementById('card-name').value;
  const group = document.getElementById('card-group').value;
  const uid = document.getElementById('card-uid').value.toUpperCase();
  const targetUrl = document.getElementById('card-url').value;

  const groupLabels = {
    marketing: 'Marketing & Menú',
    fidelizacion: 'Tarjeta de Fidelización',
    accesos: 'Accesos & Wi-Fi'
  };

  if (editId) {
    const idx = nfcCards.findIndex(c => c.id === editId);
    nfcCards[idx] = { ...nfcCards[idx], name, group, groupLabel: groupLabels[group], uid, targetUrl };
    showToast('✓ Configuración y contraseña PWD actualizadas.');
  } else {
    const newCard = {
      id: 'nfc_0' + (nfcCards.length + 1),
      name,
      group,
      groupLabel: groupLabels[group],
      uid,
      targetUrl,
      passwordProtected: true,
      scans: 0
    };
    nfcCards.unshift(newCard);
    showToast('✓ Nueva etiqueta NFC registrada y protegida con PWD.');
  }

  modal.classList.add('hidden');
  renderCards();
});

// Simular escaneo físico NFC
document.getElementById('btn-simulate-scan').addEventListener('click', () => {
  const card = nfcCards.find(c => c.id === selectedCardId) || nfcCards[0];
  card.scans += 1;
  const totalEl = document.getElementById('total-scans');
  const currentTotal = parseInt(totalEl.textContent.replace(',', ''), 10) + 1;
  totalEl.textContent = currentTotal.toLocaleString('en-US');
  renderCards();
  showToast(`📲 Toque NFC detectado en "${card.name}" → Redirigiendo a ${card.targetUrl}`);
});

// Simular envío de notificaciones automáticas de retención
document.getElementById('trigger-retention-btn').addEventListener('click', (e) => {
  e.preventDefault();
  showToast('🔔 Cron Job ejecutado: 2 notificaciones Web Push enviadas (Inactividad + Meta Cercana).');
});

// Inicializar vista
renderCards();
renderCustomers();