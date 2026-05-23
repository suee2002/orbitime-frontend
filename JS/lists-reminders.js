'use strict';

/* ============================================================
   LISTS & REMINDERS MODULE — Calendara
   ============================================================ */

/* ============================================================
   STATE EXTENSIONS
   ============================================================ */
// Inject into existing state object after it's defined
function initListsRemindersState() {
    if (!state.lists) {
        state.lists = [
            // Shopping list — linked to a recurring event
            {
                id: 1,
                title: 'Lista del supermercado',
                type: 'shopping',
                eventId: 1,          // linked event id
                recurring: true,     // applies to all recurrences
                specificDate: null,  // or 'YYYY-MM-DD' for one-time
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                items: [
                    { id: 'li1', text: 'Leche', price: 12.50, qty: 2, unit: 'litros', done: false, dateScope: 'always' },
                    { id: 'li2', text: 'Pan integral', price: 18.00, qty: 1, unit: 'und', done: false, dateScope: 'always' },
                    { id: 'li3', text: 'Huevos', price: 28.00, qty: 12, unit: 'und', done: true, dateScope: 'always' },
                    { id: 'li4', text: 'Café molido', price: 42.00, qty: 1, unit: 'bolsa', done: false, dateScope: 'always' },
                    { id: 'li5', text: 'Detergente', price: 35.00, qty: 1, unit: 'caja', done: false, dateScope: 'today' },
                ]
            },
            // Activity itinerary — linked to an event, with times and steps
            {
                id: 2,
                title: 'Plan de la cita 💑',
                type: 'itinerary',
                eventId: 7,
                recurring: false,
                specificDate: null,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                items: [
                    { id: 'li6', text: 'Ir al cine — Película a las 6:00 PM', time: '18:00', done: false, dateScope: 'always' },
                    { id: 'li7', text: 'Cena en restaurante italiano', time: '20:30', done: false, dateScope: 'always' },
                    { id: 'li8', text: 'Helados en el parque', time: '22:00', done: false, dateScope: 'always' },
                ]
            },
            // Generic checklist — not linked to any event
            {
                id: 3,
                title: 'Cosas pendientes del trabajo',
                type: 'checklist',
                eventId: null,
                recurring: false,
                specificDate: null,
                createdAt: new Date().toISOString(),
                items: [
                    { id: 'li9', text: 'Revisar correos de la mañana', done: true, dateScope: 'always' },
                    { id: 'li10', text: 'Preparar presentación del viernes', done: false, dateScope: 'always' },
                    { id: 'li11', text: 'Llamar al cliente Torres', done: false, dateScope: 'always' },
                ]
            },
        ];
    }

    if (!state.reminders) {
        state.reminders = [
            // Reminder from María to Juan (own perspective: received)
            {
                id: 1,
                fromUserId: 1,       // María López (person id)
                toUserId: 'me',      // to the current user
                description: 'Recuerda que en el supermercado no compres más bolsas, dejé una dentro del carro. ¡Siempre se te olvida! 😅',
                eventId: 1,
                goalId: null,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            // Reminder from Juan to María (sent)
            {
                id: 2,
                fromUserId: 'me',
                toUserId: 1,
                description: 'Recuérdate pasar por tu medicina antes de que se te acabe. Vi que ya solo queda para tres días.',
                eventId: null,
                goalId: null,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
            // Reminder from Carlos to Juan (received)
            {
                id: 3,
                fromUserId: 2,       // Carlos Torres
                toUserId: 'me',
                description: 'No olvides llevar el informe impreso a la reunión del lunes. El proyector no siempre funciona.',
                eventId: 4,
                goalId: null,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            // Own reminder — not linked to event or goal
            {
                id: 4,
                fromUserId: 'me',
                toUserId: 'me',
                description: 'Llamar al mecánico esta semana para el cambio de aceite del carro.',
                eventId: null,
                goalId: null,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
            // Own reminder — linked to a goal
            {
                id: 5,
                fromUserId: 'me',
                toUserId: 'me',
                description: 'Estudiar vocabulario N4 mínimo 30 minutos diarios si quiero cumplir la meta a tiempo.',
                eventId: null,
                goalId: 3,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
            },
            // From Ana
            {
                id: 6,
                fromUserId: 3,      // Ana García
                toUserId: 'me',
                description: '¡Acuérdate del cumpleaños de mamá este fin de semana! No vayas a olvidarlo como el año pasado 😂',
                eventId: 7,
                goalId: null,
                createdAt: new Date(Date.now() - 43200000).toISOString(),
            },
        ];
    }

    // Track next IDs
    if (!state._listsNextId) state._listsNextId = 10;
    if (!state._remindersNextId) state._remindersNextId = 10;
    if (!state._listItemsNextId) state._listItemsNextId = 100;
}

/* ============================================================
   LIST TYPES CONFIG
   ============================================================ */
const LIST_TYPES = {
    general: {
        label: 'Lista general',
        icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
        description: 'Lista simple de texto, para cualquier propósito.',
        itemFields: ['text'],
        color: 'var(--accent)',
    },
    shopping: {
        label: 'Lista de compras',
        icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h1.5l2 7h5l1.5-4.5H5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="6.5" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="11" r="1" fill="currentColor"/></svg>`,
        description: 'Para ir de compras. Incluye precio, cantidad y unidad.',
        itemFields: ['text', 'qty', 'unit', 'price'],
        color: '#16a34a',
    },
    itinerary: {
        label: 'Itinerario / Actividades',
        icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M7 4v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
        description: 'Pasos o actividades con hora asignada.',
        itemFields: ['text', 'time'],
        color: '#7c3aed',
    },
    checklist: {
        label: 'Checklist / Tareas',
        icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M5 7l2 2 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        description: 'Lista de tareas con casillas de verificación.',
        itemFields: ['text'],
        color: '#d97706',
    },
    packing: {
        label: 'Lista de equipaje',
        icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.3"/><path d="M7 7v2M6 8h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
        description: 'Para viajes. Items a empacar con categorías.',
        itemFields: ['text', 'qty'],
        color: '#0ea5e9',
    },
    ideas: {
        label: 'Ideas / Brainstorm',
        icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="6" r="3.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M5.5 9.5v1a1.5 1.5 0 003 0v-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M7 2.5V1.5M3 4L2 3.5M11 4l1-0.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
        description: 'Registra ideas, notas o puntos de brainstorm.',
        itemFields: ['text'],
        color: '#ec4899',
    },
};

/* ============================================================
   NAVIGATE TO LISTS / REMINDERS (extend navigate())
   ============================================================ */
// Override navigate() after app.js has defined it (no hoisting issue with arrow function)
window.addEventListener('DOMContentLoaded', () => {
    const _origNavigate = window.navigate;
    window.navigate = function (screen) {
        if (screen === 'lists') {
            _navigateLists();
        } else if (screen === 'reminders') {
            _navigateReminders();
        } else {
            // Restore calendar create-event button visibility before delegating
            const btnCreate = document.getElementById('btn-create-event');
            if (btnCreate) btnCreate.style.display = '';
            _origNavigate(screen);
        }
    };
}, { once: true });

function _navigateLists() {
    // 1. Hide all screens and deactivate nav items (same as app.js navigate)
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
    state.currentScreen = 'lists';

    // 2. Show only the lists screen
    const screenEl = document.getElementById('screen-lists');
    if (screenEl) screenEl.classList.add('active');

    const navEl = document.getElementById('nav-lists');
    if (navEl) navEl.classList.add('active');

    // 3. Topbar: single-row mode (no calendar controls)
    const topbar = document.getElementById('topbar');
    if (topbar) topbar.classList.remove('tb-two-row');
    const mEl = document.getElementById('mobile-period-label');
    if (mEl) mEl.style.display = 'none';
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = 'Mis Listas';

    // 4. Hide calendar-specific topbar buttons
    const btnCreate = document.getElementById('btn-create-event');
    if (btnCreate) btnCreate.style.display = 'none';

    // 5. Render content
    renderLists();
    closeMobileSidebar();
    if (state.notifPanelOpen) toggleNotifPanel();
}

function _navigateReminders() {
    // 1. Hide all screens and deactivate nav items
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
    state.currentScreen = 'reminders';

    // 2. Show only the reminders screen
    const screenEl = document.getElementById('screen-reminders');
    if (screenEl) screenEl.classList.add('active');

    const navEl = document.getElementById('nav-reminders');
    if (navEl) navEl.classList.add('active');

    // 3. Topbar: single-row mode
    const topbar = document.getElementById('topbar');
    if (topbar) topbar.classList.remove('tb-two-row');
    const mEl = document.getElementById('mobile-period-label');
    if (mEl) mEl.style.display = 'none';
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = 'Recordatorios';

    // 4. Hide calendar-specific topbar buttons
    const btnCreate = document.getElementById('btn-create-event');
    if (btnCreate) btnCreate.style.display = 'none';

    // 5. Render content
    renderReminders();
    closeMobileSidebar();
    if (state.notifPanelOpen) toggleNotifPanel();
}

/* ============================================================
   LISTS — RENDER MAIN SCREEN
   ============================================================ */
let _listsFilter = 'all'; // 'all' | eventId

function renderLists() {
    // Render toolbar (once per call, so it stays fresh and never duplicates)
    const toolbarWrap = document.getElementById('lists-toolbar-wrap');
    if (toolbarWrap) {
        toolbarWrap.innerHTML = `
        <div class="lists-toolbar">
          <div class="lists-filter-tabs">
            <button class="filter-tab ${_listsFilter === 'all' ? 'active' : ''}"
              onclick="document.querySelectorAll('#lists-toolbar-wrap .filter-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active');_listsFilter='all';renderLists()">
              Todas
            </button>
            <button class="filter-tab ${_listsFilter === 'linked' ? 'active' : ''}"
              onclick="document.querySelectorAll('#lists-toolbar-wrap .filter-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active');_listsFilter='linked';renderLists()">
              Con evento
            </button>
            <button class="filter-tab ${_listsFilter === 'standalone' ? 'active' : ''}"
              onclick="document.querySelectorAll('#lists-toolbar-wrap .filter-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active');_listsFilter='standalone';renderLists()">
              Independientes
            </button>
          </div>
          <button class="btn-primary" onclick="openCreateListModal()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Nueva lista
          </button>
        </div>`;
    }

    const body = document.getElementById('lists-body');
    if (!body) return;

    const lists = _getFilteredLists();

    // Stats
    const total = state.lists.length;
    const linked = state.lists.filter(l => l.eventId).length;
    const totalItems = state.lists.reduce((acc, l) => acc + l.items.length, 0);
    const doneItems = state.lists.reduce((acc, l) => acc + l.items.filter(i => i.done).length, 0);

    const statsHtml = `
    <div class="lr-stats-bar">
      <div class="lr-stat"><div class="lr-stat-num">${total}</div><div class="lr-stat-lbl">Listas</div></div>
      <div class="lr-stat-div"></div>
      <div class="lr-stat"><div class="lr-stat-num">${linked}</div><div class="lr-stat-lbl">Con evento</div></div>
      <div class="lr-stat-div"></div>
      <div class="lr-stat"><div class="lr-stat-num" style="color:var(--accent)">${doneItems}/${totalItems}</div><div class="lr-stat-lbl">Items listos</div></div>
    </div>`;

    if (lists.length === 0) {
        body.innerHTML = statsHtml + `
        <div class="lr-empty">
          <div class="lr-empty-icon">📋</div>
          <h3>Sin listas aún</h3>
          <p>Crea tu primera lista y asóciala a un evento o úsala de forma independiente.</p>
          <button class="btn-primary" onclick="openCreateListModal()" style="margin-top:8px">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Nueva lista
          </button>
        </div>`;
        return;
    }

    body.innerHTML = statsHtml + lists.map(list => _renderListCard(list)).join('');
}

function _getFilteredLists() {
    if (_listsFilter === 'all') return state.lists;
    if (_listsFilter === 'linked') return state.lists.filter(l => l.eventId);
    if (_listsFilter === 'standalone') return state.lists.filter(l => !l.eventId);
    return state.lists;
}

function _renderListCard(list) {
    const typeConf = LIST_TYPES[list.type] || LIST_TYPES.general;
    const linkedEvent = list.eventId ? state.events.find(e => e.id === list.eventId) : null;
    const total = list.items.length;
    const done = list.items.filter(i => i.done).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const color = typeConf.color;

    const dateLabel = list.specificDate
        ? `Solo el ${_fmtDateShort(list.specificDate)}`
        : list.recurring ? 'Permanente (todos los eventos)' : 'Una vez';

    return `
    <div class="lr-card" onclick="openListDetail(${list.id})">
      <div class="lr-card-color-bar" style="background:${color}"></div>
      <div class="lr-card-main">
        <div class="lr-card-header">
          <div class="lr-card-type-icon" style="color:${color}">${typeConf.icon}</div>
          <div class="lr-card-title">${list.title}</div>
          <div class="lr-card-actions" onclick="event.stopPropagation()">
            <button class="lr-icon-btn" onclick="openEditListModal(${list.id})" title="Editar">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 1.5L12.5 5 4.5 13H1v-3.5L9 1.5z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="lr-icon-btn danger" onclick="deleteList(${list.id})" title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M3 4l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
            </button>
          </div>
        </div>

        <div class="lr-card-meta">
          <span class="lr-badge" style="background:${color}22;color:${color}">${typeConf.icon} ${typeConf.label}</span>
          ${linkedEvent ? `<span class="lr-badge" style="background:${linkedEvent.color}22;color:${linkedEvent.color}">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M1 5h10" stroke="currentColor" stroke-width="1.2"/></svg>
            ${linkedEvent.emoji || '📅'} ${linkedEvent.title}
          </span>` : '<span class="lr-badge">Sin evento</span>'}
          ${list.eventId ? `<span class="lr-badge-sm">${dateLabel}</span>` : ''}
        </div>

        <div class="lr-card-progress">
          <div class="lr-card-progress-bar">
            <div class="lr-card-progress-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <span class="lr-card-progress-lbl">${done}/${total} completados · ${pct}%</span>
        </div>

        <div class="lr-card-preview">
          ${list.items.map(item => `
            <div class="lr-card-preview-item ${item.done ? 'done' : ''}">
              <div class="lr-mini-check ${item.done ? 'checked' : ''}">
                ${item.done ? `<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
              </div>
              <span>${item.text}${list.type === 'shopping' && item.price ? ` — Q${Number(item.price).toFixed(2)}` : ''}${list.type === 'itinerary' && item.time ? ` · ${_fmtTime12(item.time)}` : ''}</span>
            </div>`).join('')}
          ${total === 0 ? `<div class="lr-card-more" style="font-style:italic">Sin items aún</div>` : ''}
        </div>
      </div>
    </div>`;
}

/* ============================================================
   LIST DETAIL (full screen overlay)
   ============================================================ */
let _currentListId = null;

function openListDetail(id) {
    _currentListId = id;
    const list = state.lists.find(l => l.id === id);
    if (!list) return;
    _renderListDetailModal(list);
}

function _renderListDetailModal(list) {
    let overlay = document.getElementById('modal-list-detail');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-list-detail';
        overlay.className = 'modal-overlay lr-detail-overlay';
        overlay.addEventListener('click', e => { if (e.target === overlay) closeLrModal('modal-list-detail'); });
        document.body.appendChild(overlay);
    }

    const typeConf = LIST_TYPES[list.type] || LIST_TYPES.general;
    const linkedEvent = list.eventId ? state.events.find(e => e.id === list.eventId) : null;
    const total = list.items.length;
    const done = list.items.filter(i => i.done).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const color = typeConf.color;

    // Total price for shopping lists
    let totalPriceHtml = '';
    if (list.type === 'shopping') {
        const totalPrice = list.items.reduce((acc, item) => {
            const qty = Number(item.qty) || 1;
            const price = Number(item.price) || 0;
            return acc + (qty * price);
        }, 0);
        const pendingPrice = list.items.filter(i => !i.done).reduce((acc, item) => {
            const qty = Number(item.qty) || 1;
            const price = Number(item.price) || 0;
            return acc + (qty * price);
        }, 0);
        totalPriceHtml = `
        <div class="lr-detail-price-summary">
          <div class="lr-price-row">
            <span>Total estimado</span>
            <strong>Q${totalPrice.toFixed(2)}</strong>
          </div>
          <div class="lr-price-row pending">
            <span>Pendiente de compra</span>
            <strong style="color:var(--orange)">Q${pendingPrice.toFixed(2)}</strong>
          </div>
        </div>`;
    }

    overlay.innerHTML = `
    <div class="modal lr-detail-modal" role="dialog" aria-modal="true">
      <div class="lr-detail-color-band" style="background:${color}"></div>
      <div class="modal-header">
        <div class="lr-detail-title-row">
          <span class="lr-detail-type-icon" style="color:${color}">${typeConf.icon}</span>
          <span class="modal-title">${list.title}</span>
          ${list.recurring ? `<span class="lr-badge-sm" style="margin-left:4px">🔁 Permanente</span>` : ''}
          ${list.specificDate ? `<span class="lr-badge-sm" style="margin-left:4px">📅 ${_fmtDateShort(list.specificDate)}</span>` : ''}
        </div>
        <button class="btn-close-modal" onclick="closeLrModal('modal-list-detail')" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="modal-body lr-detail-body">

        ${linkedEvent ? `
        <div class="lr-detail-event-chip">
          <div style="width:10px;height:10px;border-radius:50%;background:${linkedEvent.color};flex-shrink:0"></div>
          ${linkedEvent.emoji || '📅'} ${linkedEvent.title}
          <span style="color:var(--text-tertiary);font-size:11px;margin-left:4px">${linkedEvent.date}</span>
        </div>` : ''}

        <!-- Progress bar -->
        <div class="lr-detail-progress">
          <div class="lr-detail-progress-header">
            <span>${done} de ${total} completados</span>
            <span style="color:${color};font-weight:600">${pct}%</span>
          </div>
          <div class="lr-detail-progress-track">
            <div class="lr-detail-progress-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </div>

        ${totalPriceHtml}

        <!-- Items list -->
        <div class="lr-detail-items" id="lr-detail-items-list">
          ${_renderDetailItems(list)}
        </div>

        <!-- Add item form -->
        <div class="lr-add-item-form" id="lr-add-item-form">
          ${_buildAddItemForm(list.type)}
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-secondary" onclick="markAllListItems(${list.id}, false)">Desmarcar todo</button>
        <button class="btn-secondary" onclick="markAllListItems(${list.id}, true)">Marcar todo</button>
        <button class="btn-primary" onclick="_submitAddItem(${list.id})">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Agregar item
        </button>
      </div>
    </div>`;

    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
}

function _renderDetailItems(list) {
    if (list.items.length === 0) return `<div class="lr-empty-items">Sin items aún. Agrega el primero abajo 👇</div>`;

    const typeConf = LIST_TYPES[list.type] || LIST_TYPES.general;
    const color = typeConf.color;

    // Sort: pending first, done at bottom
    const sorted = [...list.items].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));

    return sorted.map(item => {
        let meta = '';
        if (list.type === 'shopping') {
            const qty = Number(item.qty) || 1;
            const price = Number(item.price) || 0;
            meta = `<div class="lr-item-meta">
              ${item.qty ? `<span class="lr-item-tag">${item.qty} ${item.unit || ''}</span>` : ''}
              ${item.price ? `<span class="lr-item-tag" style="color:var(--accent)">Q${(qty * price).toFixed(2)}</span>` : ''}
              ${item.dateScope === 'today' ? `<span class="lr-item-tag" style="color:var(--orange)">Solo hoy</span>` : ''}
            </div>`;
        } else if (list.type === 'itinerary' && item.time) {
            meta = `<div class="lr-item-meta"><span class="lr-item-tag" style="color:${color}">🕐 ${_fmtTime12(item.time)}</span></div>`;
        } else if (list.type === 'packing' && item.qty) {
            meta = `<div class="lr-item-meta"><span class="lr-item-tag">x${item.qty}</span></div>`;
        }

        return `
        <div class="lr-detail-item ${item.done ? 'done' : ''}" id="lr-item-${item.id}">
          <button class="lr-check-btn ${item.done ? 'checked' : ''}" onclick="toggleListItem(${list.id},'${item.id}')" style="${item.done ? `--chk-color:${color}` : ''}">
            ${item.done ? `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
          </button>
          <div class="lr-item-content">
            <span class="lr-item-text">${item.text}</span>
            ${meta}
          </div>
          <button class="lr-item-del" onclick="removeListItem(${list.id},'${item.id}')" title="Eliminar">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>`;
    }).join('');
}

function _buildAddItemForm(type) {
    const base = `<input type="text" class="form-input lr-add-text" id="lr-add-text" placeholder="${type === 'shopping' ? 'Nombre del producto...' : type === 'itinerary' ? 'Actividad...' : 'Nuevo item...'}" onkeydown="if(event.key==='Enter'){event.preventDefault();_submitAddItem(_currentListId)}">`;

    if (type === 'shopping') {
        return `<div class="lr-add-row">
          ${base}
          <input type="number" class="form-input lr-add-small" id="lr-add-qty" placeholder="Qty" min="1" value="1" style="width:60px">
          <input type="text" class="form-input lr-add-small" id="lr-add-unit" placeholder="und" style="width:70px">
          <input type="number" class="form-input lr-add-small" id="lr-add-price" placeholder="Q0.00" min="0" step="0.01" style="width:80px">
        </div>`;
    }
    if (type === 'itinerary') {
        return `<div class="lr-add-row">
          ${base}
          <input type="time" class="form-input lr-add-small" id="lr-add-time" style="width:110px">
        </div>`;
    }
    if (type === 'packing') {
        return `<div class="lr-add-row">
          ${base}
          <input type="number" class="form-input lr-add-small" id="lr-add-qty" placeholder="x1" min="1" value="1" style="width:60px">
        </div>`;
    }
    return `<div class="lr-add-row">${base}</div>`;
}

function _submitAddItem(listId) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;
    const textEl = document.getElementById('lr-add-text');
    const text = textEl ? textEl.value.trim() : '';
    if (!text) { showToast('Escribe el nombre del item', '⚠️'); return; }

    const newItem = {
        id: `li${state._listItemsNextId++}`,
        text,
        done: false,
        dateScope: 'always',
    };

    if (list.type === 'shopping') {
        newItem.qty = parseFloat(document.getElementById('lr-add-qty')?.value) || 1;
        newItem.unit = document.getElementById('lr-add-unit')?.value.trim() || 'und';
        newItem.price = parseFloat(document.getElementById('lr-add-price')?.value) || 0;
    } else if (list.type === 'itinerary') {
        newItem.time = document.getElementById('lr-add-time')?.value || '';
    } else if (list.type === 'packing') {
        newItem.qty = parseInt(document.getElementById('lr-add-qty')?.value) || 1;
    }

    list.items.push(newItem);

    // Re-render items and form
    const itemsList = document.getElementById('lr-detail-items-list');
    if (itemsList) itemsList.innerHTML = _renderDetailItems(list);

    const addForm = document.getElementById('lr-add-item-form');
    if (addForm) addForm.innerHTML = _buildAddItemForm(list.type);
    if (textEl) textEl.value = '';

    // Update progress
    _refreshDetailProgress(list);
    // Update card list too
    renderLists();

    showToast('Item agregado ✨', '✅');
}

function _refreshDetailProgress(list) {
    const total = list.items.length;
    const done = list.items.filter(i => i.done).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const ph = document.querySelector('.lr-detail-progress-header span');
    const pv = document.querySelector('.lr-detail-progress-header span:last-child');
    const pf = document.querySelector('.lr-detail-progress-fill');
    if (ph) ph.textContent = `${done} de ${total} completados`;
    if (pv) pv.textContent = `${pct}%`;
    if (pf) pf.style.width = `${pct}%`;
}

function toggleListItem(listId, itemId) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;
    const item = list.items.find(i => i.id === itemId);
    if (!item) return;
    item.done = !item.done;

    const itemEl = document.getElementById(`lr-item-${itemId}`);
    if (itemEl) {
        const rerendered = document.getElementById('lr-detail-items-list');
        if (rerendered) rerendered.innerHTML = _renderDetailItems(list);
    }
    _refreshDetailProgress(list);
    renderLists();
}

function removeListItem(listId, itemId) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;
    list.items = list.items.filter(i => i.id !== itemId);
    const itemsList = document.getElementById('lr-detail-items-list');
    if (itemsList) itemsList.innerHTML = _renderDetailItems(list);
    _refreshDetailProgress(list);
    renderLists();
    showToast('Item eliminado', '🗑️');
}

function markAllListItems(listId, done) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;
    list.items.forEach(i => i.done = done);
    const itemsList = document.getElementById('lr-detail-items-list');
    if (itemsList) itemsList.innerHTML = _renderDetailItems(list);
    _refreshDetailProgress(list);
    renderLists();
    showToast(done ? 'Todo marcado ✅' : 'Todo desmarcado', done ? '✅' : '⬜');
}

function deleteList(id) {
    state.lists = state.lists.filter(l => l.id !== id);
    renderLists();
    showToast('Lista eliminada', '🗑️');
}

/* ============================================================
   CREATE / EDIT LIST MODAL
   ============================================================ */
let _editingListId = null;

function openCreateListModal(prefillEventId = null) {
    _editingListId = null;
    _openListModal(null, prefillEventId);
}

function openEditListModal(id) {
    _editingListId = id;
    const list = state.lists.find(l => l.id === id);
    _openListModal(list);
}

function _openListModal(list, prefillEventId = null) {
    let overlay = document.getElementById('modal-create-list');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-create-list';
        overlay.className = 'modal-overlay';
        overlay.addEventListener('click', e => { if (e.target === overlay) closeLrModal('modal-create-list'); });
        document.body.appendChild(overlay);
    }

    const isEdit = !!list;
    const selectedType = list ? list.type : 'general';
    const eventsOptions = state.events.map(e => `<option value="${e.id}" ${list && list.eventId === e.id ? 'selected' : ''}>${e.emoji || '📅'} ${e.title} — ${e.date}</option>`).join('');

    overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" style="max-width:520px">
      <div class="modal-header">
        <span class="modal-title">${isEdit ? 'Editar lista' : 'Nueva lista'}</span>
        <button class="btn-close-modal" onclick="closeLrModal('modal-create-list')" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">

        <div class="form-group">
          <label class="form-label">Nombre de la lista</label>
          <input type="text" class="form-input" id="list-title" placeholder="Ej. Lista del supermercado" value="${list ? list.title : ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de lista</label>
          <div class="lr-type-grid" id="lr-type-grid">
            ${Object.entries(LIST_TYPES).map(([key, conf]) => `
              <div class="lr-type-card ${selectedType === key ? 'selected' : ''}" onclick="_selectListType('${key}')" data-type="${key}">
                <div class="lr-type-card-icon" style="color:${conf.color}">${conf.icon}</div>
                <div class="lr-type-card-label">${conf.label}</div>
                <div class="lr-type-card-desc">${conf.description}</div>
              </div>`).join('')}
          </div>
          <input type="hidden" id="list-type" value="${selectedType}">
        </div>

        <div class="form-group">
          <label class="form-label">Vincular a evento (opcional)</label>
          <select class="form-select" id="list-event-id">
            <option value="">Sin evento</option>
            ${eventsOptions}
          </select>
        </div>

        <div class="form-group" id="list-recurring-group">
          <label class="form-label">Alcance</label>
          <div class="lr-scope-options">
            <label class="lr-radio-opt ${(!list || list.recurring) ? 'active' : ''}" onclick="_setListScope('always', this)">
              <input type="radio" name="list-scope" value="always" ${(!list || list.recurring) ? 'checked' : ''}>
              <span>🔁 Permanente — aplica a todas las ocurrencias del evento</span>
            </label>
            <label class="lr-radio-opt ${list && list.specificDate ? 'active' : ''}" onclick="_setListScope('specific', this)">
              <input type="radio" name="list-scope" value="specific" ${list && list.specificDate ? 'checked' : ''}>
              <span>📅 Solo una fecha específica</span>
            </label>
          </div>
          <div id="list-specific-date-wrap" style="display:${list && list.specificDate ? 'block' : 'none'};margin-top:8px">
            <input type="date" class="form-input" id="list-specific-date" value="${list && list.specificDate ? list.specificDate : ''}">
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeLrModal('modal-create-list')">Cancelar</button>
        <button class="btn-primary" onclick="_saveList()">
          ${isEdit ? 'Guardar cambios' : 'Crear lista'}
        </button>
      </div>
    </div>`;

    // Prefill event if given
    if (prefillEventId) {
        setTimeout(() => {
            const sel = document.getElementById('list-event-id');
            if (sel) sel.value = prefillEventId;
        }, 50);
    }

    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
}

function _selectListType(type) {
    document.querySelectorAll('.lr-type-card').forEach(c => c.classList.toggle('selected', c.dataset.type === type));
    const inp = document.getElementById('list-type');
    if (inp) inp.value = type;
}

function _setListScope(scope, label) {
    document.querySelectorAll('.lr-radio-opt').forEach(l => l.classList.remove('active'));
    label.classList.add('active');
    const wrap = document.getElementById('list-specific-date-wrap');
    if (wrap) wrap.style.display = scope === 'specific' ? 'block' : 'none';
}

function _saveList() {
    const title = document.getElementById('list-title')?.value.trim();
    if (!title) { showToast('El nombre es obligatorio', '⚠️'); return; }

    const type = document.getElementById('list-type')?.value || 'general';
    const eventId = parseInt(document.getElementById('list-event-id')?.value) || null;
    const scopeEl = document.querySelector('input[name="list-scope"]:checked');
    const scope = scopeEl ? scopeEl.value : 'always';
    const specificDate = scope === 'specific' ? (document.getElementById('list-specific-date')?.value || null) : null;
    const recurring = scope === 'always';

    if (_editingListId) {
        const list = state.lists.find(l => l.id === _editingListId);
        if (list) {
            list.title = title;
            list.type = type;
            list.eventId = eventId;
            list.recurring = recurring;
            list.specificDate = specificDate;
        }
    } else {
        state.lists.push({
            id: state._listsNextId++,
            title, type, eventId, recurring, specificDate,
            createdAt: new Date().toISOString(),
            items: [],
        });
    }

    closeLrModal('modal-create-list');
    renderLists();
    showToast(_editingListId ? 'Lista actualizada ✨' : 'Lista creada 🎉', '📋');
}

/* ============================================================
   REMINDERS — RENDER MAIN SCREEN
   ============================================================ */
let _remindersChatUserId = null; // null = show "own" view

function renderReminders() {
    // Render toolbar dynamically (prevents duplication and keeps it scoped to this screen)
    const toolbarWrap = document.getElementById('reminders-toolbar-wrap');
    if (toolbarWrap) {
        toolbarWrap.innerHTML = `
        <div class="reminders-toolbar">
          <div class="reminders-toolbar-desc">
            💬 Los recordatorios aparecen como mensajes por persona. Vincúlalos a eventos o metas.
          </div>
          <button class="btn-primary" onclick="openCreateReminderModal(null)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Nuevo recordatorio
          </button>
        </div>`;
    }

    const el = document.getElementById('reminders-layout');
    if (!el) return;

    // Left: person list (own + each person)
    const contactsHtml = `
    <div class="rmdr-contacts">
      <div class="rmdr-contacts-header">Conversaciones</div>

      <!-- Own reminders -->
      <div class="rmdr-contact-item ${_remindersChatUserId === null ? 'active' : ''}" onclick="selectReminderChat(null)">
        <div class="rmdr-contact-avatar" style="background:var(--accent-soft);color:var(--accent)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M2 14c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>
        </div>
        <div class="rmdr-contact-info">
          <div class="rmdr-contact-name">Mis recordatorios</div>
          <div class="rmdr-contact-preview">${_getOwnRemindersPreview()}</div>
        </div>
        ${_getOwnUnread() > 0 ? `<div class="rmdr-badge">${_getOwnUnread()}</div>` : ''}
      </div>

      ${state.people.map(person => {
        const msgs = _getConversationReminders(person.id);
        const lastMsg = msgs[msgs.length - 1];
        return `
        <div class="rmdr-contact-item ${_remindersChatUserId === person.id ? 'active' : ''}" onclick="selectReminderChat(${person.id})">
          <div class="rmdr-contact-avatar" style="background:${person.color}22;color:${person.color}">
            ${person.initials}
            <div class="rmdr-online-dot ${person.online ? '' : 'offline'}"></div>
          </div>
          <div class="rmdr-contact-info">
            <div class="rmdr-contact-name">${person.name}</div>
            <div class="rmdr-contact-preview">${lastMsg ? lastMsg.description.slice(0, 45) + (lastMsg.description.length > 45 ? '…' : '') : 'Sin recordatorios'}</div>
          </div>
          <div class="rmdr-contact-time">${lastMsg ? _timeAgo(lastMsg.createdAt) : ''}</div>
        </div>`;
    }).join('')}
    </div>`;

    // Right: chat area
    const chatHtml = `
    <div class="rmdr-chat-area" id="rmdr-chat-area">
      ${_renderChatArea()}
    </div>`;

    el.innerHTML = contactsHtml + chatHtml;
}

function _getConversationReminders(personId) {
    return state.reminders.filter(r =>
        (r.fromUserId === personId && r.toUserId === 'me') ||
        (r.fromUserId === 'me' && r.toUserId === personId)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function _getOwnRemindersPreview() {
    const own = state.reminders.filter(r => r.fromUserId === 'me' && r.toUserId === 'me');
    if (own.length === 0) return 'Sin recordatorios propios';
    const last = own[own.length - 1];
    return last.description.slice(0, 45) + (last.description.length > 45 ? '…' : '');
}

function _getOwnUnread() { return 0; } // placeholder

function selectReminderChat(personId) {
    _remindersChatUserId = personId;
    const chatArea = document.getElementById('rmdr-chat-area');
    if (chatArea) chatArea.innerHTML = _renderChatArea();
    // Update active states
    document.querySelectorAll('.rmdr-contact-item').forEach((el, idx) => {
        const isOwn = idx === 0 && personId === null;
        const isPerson = personId !== null && idx > 0 && state.people[idx - 1]?.id === personId;
        el.classList.toggle('active', isOwn || isPerson);
    });
}

function _renderChatArea() {
    if (_remindersChatUserId === null) {
        return _renderOwnRemindersArea();
    }

    const person = state.people.find(p => p.id === _remindersChatUserId);
    if (!person) return '<div class="rmdr-empty">Selecciona una conversación</div>';

    const msgs = _getConversationReminders(person.id);

    return `
    <div class="rmdr-chat-header">
      <div class="rmdr-chat-avatar" style="background:${person.color}22;color:${person.color}">${person.initials}</div>
      <div>
        <div class="rmdr-chat-name">${person.name}</div>
        <div class="rmdr-chat-status">${person.online ? '<span style="color:#22c55e">● En línea</span>' : '<span style="color:var(--text-tertiary)">● Desconectado</span>'}</div>
      </div>
      <button class="btn-primary rmdr-send-btn" onclick="openCreateReminderModal(${person.id})" style="margin-left:auto">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Nuevo recordatorio
      </button>
    </div>

    <div class="rmdr-messages-scroll" id="rmdr-messages">
      ${msgs.length === 0 ? `<div class="rmdr-empty">
        <div style="font-size:32px;margin-bottom:8px">💬</div>
        <p>Sin recordatorios con ${person.name} aún.</p>
        <button class="btn-primary" onclick="openCreateReminderModal(${person.id})" style="margin-top:8px">Enviar primer recordatorio</button>
      </div>` : msgs.map(r => _renderReminderBubble(r, person)).join('')}
    </div>`;
}

function _renderOwnRemindersArea() {
    const own = state.reminders.filter(r => r.fromUserId === 'me' && r.toUserId === 'me')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return `
    <div class="rmdr-chat-header">
      <div class="rmdr-chat-avatar" style="background:var(--accent-soft);color:var(--accent)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M2 14c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>
      </div>
      <div>
        <div class="rmdr-chat-name">Mis recordatorios</div>
        <div class="rmdr-chat-status" style="color:var(--text-tertiary)">Solo visible para ti</div>
      </div>
      <button class="btn-primary rmdr-send-btn" onclick="openCreateReminderModal(null)" style="margin-left:auto">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Nuevo recordatorio
      </button>
    </div>

    <div class="rmdr-messages-scroll" id="rmdr-messages">
      ${own.length === 0 ? `<div class="rmdr-empty">
        <div style="font-size:32px;margin-bottom:8px">🗒️</div>
        <p>No tienes recordatorios propios.</p>
        <button class="btn-primary" onclick="openCreateReminderModal(null)" style="margin-top:8px">Crear recordatorio</button>
      </div>` : own.map(r => _renderOwnReminderCard(r)).join('')}
    </div>`;
}

function _renderReminderBubble(r, person) {
    const isSent = r.fromUserId === 'me';
    const linkedEvent = r.eventId ? state.events.find(e => e.id === r.eventId) : null;
    const linkedGoal = r.goalId ? state.goals.find(g => g.id === r.goalId) : null;

    return `
    <div class="rmdr-bubble-wrap ${isSent ? 'sent' : 'received'}">
      ${!isSent ? `<div class="rmdr-bubble-avatar" style="background:${person.color}22;color:${person.color}">${person.initials}</div>` : ''}
      <div class="rmdr-bubble ${isSent ? 'sent' : 'received'}">
        ${!isSent ? `<div class="rmdr-bubble-sender">${person.name}</div>` : ''}
        <div class="rmdr-bubble-title">🔔 Recordatorio</div>
        <div class="rmdr-bubble-desc">${r.description}</div>
        ${linkedEvent ? `<div class="rmdr-bubble-link" onclick="navigate('calendar')">
          <div style="width:8px;height:8px;border-radius:50%;background:${linkedEvent.color};flex-shrink:0"></div>
          ${linkedEvent.emoji || '📅'} ${linkedEvent.title}
        </div>` : ''}
        ${linkedGoal ? `<div class="rmdr-bubble-link" onclick="navigate('goals')">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="${linkedGoal.color || 'currentColor'}" stroke-width="1.2" fill="none"/><circle cx="6" cy="6" r="2" stroke="${linkedGoal.color || 'currentColor'}" stroke-width="1.2" fill="none"/><circle cx="6" cy="6" r=".7" fill="${linkedGoal.color || 'currentColor'}"/></svg>
          ${linkedGoal.title}
        </div>` : ''}
        <div class="rmdr-bubble-footer">
          <span class="rmdr-bubble-time">${_timeAgo(r.createdAt)}</span>
          ${isSent ? `<button class="rmdr-del-btn" onclick="deleteReminder(${r.id})" title="Eliminar">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>` : `<button class="rmdr-del-btn" onclick="deleteReminder(${r.id})" title="Eliminar">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>`}
        </div>
      </div>
      ${isSent ? `<div class="rmdr-bubble-avatar me" style="background:var(--accent-soft);color:var(--accent)">${state.user.initials}</div>` : ''}
    </div>`;
}

function _renderOwnReminderCard(r) {
    const linkedEvent = r.eventId ? state.events.find(e => e.id === r.eventId) : null;
    const linkedGoal = r.goalId ? state.goals.find(g => g.id === r.goalId) : null;

    return `
    <div class="rmdr-own-card">
      <div class="rmdr-own-icon">🔔</div>
      <div class="rmdr-own-body">
        <div class="rmdr-own-title">Recordatorio</div>
        <div class="rmdr-own-desc">${r.description}</div>
        ${linkedEvent ? `<div class="rmdr-bubble-link" onclick="navigate('calendar')">
          <div style="width:8px;height:8px;border-radius:50%;background:${linkedEvent.color};flex-shrink:0"></div>
          ${linkedEvent.emoji || '📅'} ${linkedEvent.title}
        </div>` : ''}
        ${linkedGoal ? `<div class="rmdr-bubble-link" onclick="navigate('goals')">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="${linkedGoal.color || 'currentColor'}" stroke-width="1.2" fill="none"/><circle cx="6" cy="6" r="2" stroke="${linkedGoal.color || 'currentColor'}" stroke-width="1.2" fill="none"/><circle cx="6" cy="6" r=".7" fill="${linkedGoal.color || 'currentColor'}"/></svg>
          ${linkedGoal.title}
        </div>` : ''}
        <div class="rmdr-own-footer">
          <span class="rmdr-bubble-time">${_timeAgo(r.createdAt)}</span>
          <button class="rmdr-del-btn" onclick="deleteReminder(${r.id})" title="Eliminar">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   CREATE REMINDER MODAL
   ============================================================ */
function openCreateReminderModal(personId = null, prefillEventId = null, prefillGoalId = null) {
    let overlay = document.getElementById('modal-create-reminder');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-create-reminder';
        overlay.className = 'modal-overlay';
        overlay.addEventListener('click', e => { if (e.target === overlay) closeLrModal('modal-create-reminder'); });
        document.body.appendChild(overlay);
    }

    const person = personId ? state.people.find(p => p.id === personId) : null;
    const eventsOptions = state.events.map(e => `<option value="${e.id}">${e.emoji || '📅'} ${e.title} — ${e.date}</option>`).join('');
    const goalsOptions = state.goals.filter(g => g.status !== 'done').map(g => `<option value="${g.id}">${g.title}</option>`).join('');

    overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" style="max-width:480px">
      <div class="modal-header">
        <span class="modal-title">
          ${person ? `Recordatorio para ${person.name}` : 'Recordatorio propio'}
        </span>
        <button class="btn-close-modal" onclick="closeLrModal('modal-create-reminder')" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="modal-body">
        ${person ? `
        <div class="rmdr-modal-recipient">
          <div class="rmdr-modal-avatar" style="background:${person.color}22;color:${person.color}">${person.initials}</div>
          <div>
            <div style="font-weight:500">${person.name}</div>
            <div style="font-size:12px;color:var(--text-tertiary)">${person.username} · ${person.online ? 'En línea' : 'Desconectado'}</div>
          </div>
        </div>` : `
        <div class="rmdr-modal-recipient">
          <div class="rmdr-modal-avatar" style="background:var(--accent-soft);color:var(--accent)">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M2 16c0-4 3-6 7-6s7 2 7 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>
          </div>
          <div>
            <div style="font-weight:500">Para mí mismo</div>
            <div style="font-size:12px;color:var(--text-tertiary)">Visible solo para ti</div>
          </div>
        </div>`}

        <div class="form-group">
          <label class="form-label">Descripción del recordatorio <span style="color:var(--red)">*</span></label>
          <textarea class="form-input" id="rmdr-desc" rows="4" placeholder="Escribe aquí el recordatorio... ej: Recuerda pasar por la medicina antes del martes." style="resize:vertical;min-height:90px"></textarea>
        </div>

        <div class="rmdr-link-section">
          <div class="rmdr-link-title">Vincular a (opcional)</div>
          <div class="lr-scope-options">
            <label class="lr-radio-opt active" onclick="_setRmdrLink('none', this)">
              <input type="radio" name="rmdr-link" value="none" checked>
              <span>Sin vínculo</span>
            </label>
            <label class="lr-radio-opt" onclick="_setRmdrLink('event', this)">
              <input type="radio" name="rmdr-link" value="event">
              <span>📅 Evento</span>
            </label>
            <label class="lr-radio-opt" onclick="_setRmdrLink('goal', this)">
              <input type="radio" name="rmdr-link" value="goal">
              <span>🎯 Meta</span>
            </label>
          </div>
          <div id="rmdr-link-detail" style="margin-top:8px;display:none">
            <div id="rmdr-event-sel" style="display:none">
              <select class="form-select" id="rmdr-event-id">
                <option value="">Selecciona un evento...</option>
                ${eventsOptions}
              </select>
            </div>
            <div id="rmdr-goal-sel" style="display:none">
              <select class="form-select" id="rmdr-goal-id">
                <option value="">Selecciona una meta...</option>
                ${goalsOptions}
              </select>
            </div>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeLrModal('modal-create-reminder')">Cancelar</button>
        <button class="btn-primary" onclick="_saveReminder(${personId || 'null'})">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ${person ? 'Enviar recordatorio' : 'Guardar recordatorio'}
        </button>
      </div>
    </div>`;

    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';

    // Prefill event or goal if provided
    if (prefillEventId || prefillGoalId) {
        setTimeout(() => {
            const type = prefillEventId ? 'event' : 'goal';
            const label = document.querySelector(`#modal-create-reminder input[value="${type}"]`)?.closest('.lr-radio-opt');
            if (label) _setRmdrLink(type, label);
            if (prefillEventId) {
                const sel = document.getElementById('rmdr-event-id');
                if (sel) sel.value = prefillEventId;
            }
            if (prefillGoalId) {
                const sel = document.getElementById('rmdr-goal-id');
                if (sel) sel.value = prefillGoalId;
            }
        }, 50);
    }
}

function _setRmdrLink(type, label) {
    document.querySelectorAll('#modal-create-reminder .lr-radio-opt').forEach(l => l.classList.remove('active'));
    label.classList.add('active');
    const detail = document.getElementById('rmdr-link-detail');
    const evSel = document.getElementById('rmdr-event-sel');
    const goSel = document.getElementById('rmdr-goal-sel');
    if (!detail) return;
    if (type === 'none') {
        detail.style.display = 'none';
    } else {
        detail.style.display = 'block';
        if (evSel) evSel.style.display = type === 'event' ? 'block' : 'none';
        if (goSel) goSel.style.display = type === 'goal' ? 'block' : 'none';
    }
}

function _saveReminder(personId) {
    const desc = document.getElementById('rmdr-desc')?.value.trim();
    if (!desc) { showToast('Escribe el recordatorio', '⚠️'); return; }

    const linkType = document.querySelector('#modal-create-reminder input[name="rmdr-link"]:checked')?.value || 'none';
    const eventId = linkType === 'event' ? (parseInt(document.getElementById('rmdr-event-id')?.value) || null) : null;
    const goalId = linkType === 'goal' ? (parseInt(document.getElementById('rmdr-goal-id')?.value) || null) : null;

    const toUserId = personId || 'me';

    state.reminders.push({
        id: state._remindersNextId++,
        fromUserId: 'me',
        toUserId,
        description: desc,
        eventId,
        goalId,
        createdAt: new Date().toISOString(),
    });

    closeLrModal('modal-create-reminder');
    renderReminders();
    showToast(personId ? `Recordatorio enviado a ${state.people.find(p => p.id === personId)?.name || ''}` : 'Recordatorio guardado', '🔔');

    // Scroll to bottom of messages
    setTimeout(() => {
        const msgs = document.getElementById('rmdr-messages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 100);
}

function deleteReminder(id) {
    state.reminders = state.reminders.filter(r => r.id !== id);
    renderReminders();
    showToast('Recordatorio eliminado', '🗑️');
}

/* ============================================================
   EVENT DETAIL MODAL — reemplaza el mini-popup para eventos
   Muestra todos los detalles del evento, permite editarlo,
   y muestra listas/recordatorios vinculados (solo ver/desvincular).
   ============================================================ */
const _origShowEventPopup = showEventPopup;
function showEventPopup(evt, anchorEl) {
    // En lugar del mini popup flotante, abrimos el modal de detalle completo
    openEventDetailModal(evt.id);
}

function openEventDetailModal(eventId) {
    const evt = state.events.find(e => e.id === eventId);
    if (!evt) return;
    _renderEventDetailModal(evt);
}

function _renderEventDetailModal(evt) {
    let overlay = document.getElementById('modal-event-detail');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-event-detail';
        overlay.className = 'modal-overlay lr-detail-overlay';
        overlay.addEventListener('click', e => { if (e.target === overlay) closeEventDetailModal(); });
        document.body.appendChild(overlay);
    }

    const color = evt.color || '#2563eb';
    const emoji = evt.emoji || '📅';
    const rec = evt.recurrence || { type: 'none' };
    const recLabel = { none: '', daily: '🔁 Diario', weekly: '🔁 Semanal', monthly: '🔁 Mensual', yearly: '🔁 Anual' }[rec.type] || '';
    const sharedPeople = (evt.sharedWith || []).map(id => state.people.find(p => p.id === id)).filter(Boolean);
    const times = evt.times || [{ start: evt.start, end: evt.end }];
    const isShared = sharedPeople.length > 0;

    const eventLists = (state.lists || []).filter(l => l.eventId === evt.id);
    const eventReminders = (state.reminders || []).filter(r => r.eventId === evt.id);

    overlay.innerHTML = `
    <div class="modal lr-detail-modal" role="dialog" aria-modal="true" style="max-width:580px">
      <div class="lr-detail-color-band" style="background:${color}"></div>

      <div class="modal-header">
        <div class="lr-detail-title-row">
          <span style="font-size:20px">${emoji}</span>
          <span class="modal-title" style="flex:1;min-width:0">${evt.title}</span>
          ${isShared ? `<span class="lr-badge-sm" style="background:${color}22;color:${color}">Compartido</span>` : ''}
        </div>
        <button class="btn-close-modal" onclick="closeEventDetailModal()" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="modal-body lr-detail-body">

        <!-- Fecha y hora -->
        <div class="evd-section">
          <div class="evd-section-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M1 5h10" stroke="currentColor" stroke-width="1.2"/><path d="M4 1v2M8 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            Fecha y hora
          </div>
          <div class="evd-section-body">
            <div style="font-size:13px;color:var(--text-primary);font-weight:500">${evt.date}</div>
            ${times.map(s => `<div style="font-size:12.5px;color:var(--text-secondary)">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="vertical-align:middle"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 3.5v3l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              ${fmtTime(s.start)} – ${fmtTime(s.end)}
            </div>`).join('')}
            ${recLabel ? `<div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">${recLabel}</div>` : ''}
          </div>
        </div>

        ${evt.location ? `
        <div class="evd-section">
          <div class="evd-section-label">📍 Ubicación</div>
          <div class="evd-section-body" style="font-size:13px;color:var(--text-primary)">${evt.location}</div>
        </div>` : ''}

        ${evt.desc ? `
        <div class="evd-section">
          <div class="evd-section-label">📝 Descripción</div>
          <div class="evd-section-body" style="font-size:13px;color:var(--text-primary);line-height:1.6">${evt.desc}</div>
        </div>` : ''}

        ${isShared ? `
        <div class="evd-section">
          <div class="evd-section-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="4.5" cy="4" r="1.8" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M1 10c0-2 1.5-3 3.5-3s3.5 1 3.5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><circle cx="9" cy="4" r="1.5" stroke="currentColor" stroke-width="1.1" fill="none"/><path d="M9 9c0-1.4-.7-2.3-2-2.8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none"/></svg>
            Compartido con
          </div>
          <div class="evd-section-body" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            ${sharedPeople.map(p => `<span class="event-popup-avatar" style="background:${p.color}22;color:${p.color};padding:4px 8px;border-radius:99px;font-size:12px;font-weight:600">${p.initials} ${p.name}</span>`).join('')}
          </div>
        </div>` : ''}

        <!-- Listas vinculadas (solo ver y desvincular) -->
        <div class="evd-section">
          <div class="evd-section-label" style="justify-content:space-between">
            <span style="display:flex;align-items:center;gap:5px">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              Listas vinculadas (${eventLists.length})
            </span>
            <button class="evp-add-btn" onclick="closeEventDetailModal();openCreateListModal(${evt.id})" style="font-size:11px">
              + Nueva lista
            </button>
          </div>
          <div class="evd-section-body" id="evd-lists-body">
            ${_renderEventDetailLists(evt.id)}
          </div>
        </div>

        <!-- Recordatorios vinculados (solo ver y desvincular) -->
        <div class="evd-section">
          <div class="evd-section-label" style="justify-content:space-between">
            <span style="display:flex;align-items:center;gap:5px">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1a4 4 0 014 4v2l1 2H1l1-2V5a4 4 0 014-4z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/><path d="M5 10a1 1 0 002 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              Recordatorios vinculados (${eventReminders.length})
            </span>
            <button class="evp-add-btn" onclick="closeEventDetailModal();openCreateReminderModal(null,${evt.id})" style="font-size:11px">
              + Nuevo recordatorio
            </button>
          </div>
          <div class="evd-section-body" id="evd-reminders-body">
            ${_renderEventDetailReminders(evt.id)}
          </div>
        </div>

      </div>

      <div class="modal-footer" style="justify-content:space-between">
        <div style="display:flex;gap:8px">
          ${isShared ? `
          <button class="btn-secondary" style="color:var(--orange);border-color:var(--orange)" onclick="unlinkFromEvent(${evt.id})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 9l-3 3M9 5l3-3M5.5 8.5l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 6a2 2 0 012-2h2M8 10h2a2 2 0 002-2V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            Desvincularme
          </button>` : `
          <button class="btn-secondary danger" onclick="deleteEventFromDetail(${evt.id})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M3 4l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
            Eliminar evento
          </button>`}
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" onclick="closeEventDetailModal()">Cerrar</button>
          <button class="btn-primary" onclick="closeEventDetailModal();editEvent(${evt.id})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 1.5L12.5 5 4.5 13H1v-3.5L9 1.5z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Editar evento
          </button>
        </div>
      </div>
    </div>`;

    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
}

function _renderEventDetailLists(eventId) {
    const eventLists = (state.lists || []).filter(l => l.eventId === eventId);
    if (eventLists.length === 0) {
        return `<div style="font-size:12px;color:var(--text-tertiary);font-style:italic">Sin listas vinculadas</div>`;
    }
    return eventLists.map(l => {
        const done = l.items.filter(i => i.done).length;
        const typeConf = LIST_TYPES[l.type] || LIST_TYPES.general;
        return `
        <div class="evd-linked-item">
          <span style="color:${typeConf.color}">${typeConf.icon}</span>
          <span style="flex:1;min-width:0;font-size:12.5px;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${l.title}">${l.title}</span>
          <span class="lr-badge-sm">${done}/${l.items.length}</span>
          <button class="lr-icon-btn" title="Ver lista" onclick="closeEventDetailModal();navigate('lists');setTimeout(()=>openListDetail(${l.id}),200)" style="opacity:1">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="6" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
          </button>
          <button class="lr-icon-btn danger" title="Desvincular de este evento" onclick="unlinkListFromEvent(${l.id},${eventId})" style="opacity:1">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5 9l-3 3M9 5l3-3M5.5 8.5l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 6a2 2 0 012-2h2M8 10h2a2 2 0 002-2V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>`;
    }).join('');
}

function _renderEventDetailReminders(eventId) {
    const eventReminders = (state.reminders || []).filter(r => r.eventId === eventId);
    if (eventReminders.length === 0) {
        return `<div style="font-size:12px;color:var(--text-tertiary);font-style:italic">Sin recordatorios vinculados</div>`;
    }
    return eventReminders.map(r => {
        const fromPerson = r.fromUserId !== 'me' ? state.people.find(p => p.id === r.fromUserId) : null;
        const toPerson = r.toUserId !== 'me' ? state.people.find(p => p.id === r.toUserId) : null;
        const senderLabel = fromPerson ? `De ${fromPerson.name}` : 'Yo';
        const recipientLabel = toPerson ? ` → ${toPerson.name}` : '';
        return `
        <div class="evd-linked-item">
          <span>🔔</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:2px">${senderLabel}${recipientLabel}</div>
            <div style="font-size:12.5px;color:var(--text-primary);line-height:1.4">${r.description}</div>
          </div>
          <button class="lr-icon-btn danger" title="Desvincular de este evento" onclick="unlinkReminderFromEvent(${r.id},${eventId})" style="opacity:1;flex-shrink:0">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5 9l-3 3M9 5l3-3M5.5 8.5l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 6a2 2 0 012-2h2M8 10h2a2 2 0 002-2V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>`;
    }).join('');
}

function closeEventDetailModal() {
    const overlay = document.getElementById('modal-event-detail');
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function deleteEventFromDetail(id) {
    closeEventDetailModal();
    deleteEvent(id);
}

function unlinkFromEvent(eventId) {
    // Para eventos compartidos: el usuario actual se desvincula (lo quita de sharedWith)
    const evt = state.events.find(e => e.id === eventId);
    if (!evt) return;
    evt.sharedWith = (evt.sharedWith || []).filter(id => id !== 'me');
    // Si ya no queda nadie compartido, también podría eliminarse solo del propio calendario
    // Lo más simple: remover el evento de la vista del usuario actual
    state.events = state.events.filter(e => e.id !== eventId);
    closeEventDetailModal();
    renderCalendar();
    showToast('Te has desvinculado del evento', '👋');
}

function unlinkListFromEvent(listId, eventId) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;
    list.eventId = null;
    list.recurring = false;
    list.specificDate = null;
    // Refresh the lists section inside the modal
    const listsBody = document.getElementById('evd-lists-body');
    if (listsBody) listsBody.innerHTML = _renderEventDetailLists(eventId);
    // Also update label count
    const labels = document.querySelectorAll('#modal-event-detail .evd-section-label span');
    labels.forEach(el => {
        if (el.textContent.includes('Listas vinculadas')) {
            el.textContent = `Listas vinculadas (${(state.lists || []).filter(l => l.eventId === eventId).length})`;
        }
    });
    showToast('Lista desvinculada del evento', '🔗');
}

function unlinkReminderFromEvent(reminderId, eventId) {
    const reminder = state.reminders.find(r => r.id === reminderId);
    if (!reminder) return;
    reminder.eventId = null;
    const remindersBody = document.getElementById('evd-reminders-body');
    if (remindersBody) remindersBody.innerHTML = _renderEventDetailReminders(eventId);
    showToast('Recordatorio desvinculado del evento', '🔗');
}

/* ============================================================
   HELPERS
   ============================================================ */
function closeLrModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function _fmtDateShort(str) {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m) - 1]} ${y}`;
}

function _fmtTime12(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function _timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'ayer';
    return `hace ${days} días`;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initListsRemindersState();
});