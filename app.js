'use strict';

/* ============================================================
   I18N ENGINE
   ============================================================ */
const i18n = {
  lang: 'es',
  data: {},

  async load(lang) {
    try {
      const res = await fetch(`./i18n/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json();
      this.lang = lang;
      localStorage.setItem('calendara_lang', lang);
      document.documentElement.setAttribute('lang', lang);
      return true;
    } catch (err) {
      console.warn(`[i18n] Could not load ${lang}:`, err);
      return false;
    }
  },

  t(key, vars = {}) {
    const parts = key.split('.');
    let val = this.data;
    for (const p of parts) {
      if (val == null) return key;
      val = val[p];
    }
    if (val == null) return key;
    let str = String(val);
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  },

  async change(lang) {
    const ok = await this.load(lang);
    if (ok) applyTranslations();
  },

  detect() {
    const saved = localStorage.getItem('calendara_lang');
    if (saved) return saved;
    const browser = (navigator.language || 'es').split('-')[0];
    const supported = ['es', 'en', 'pt', 'ca', 'ja'];
    return supported.includes(browser) ? browser : 'es';
  }
};

function t(key, vars) { return i18n.t(key, vars); }

/* ============================================================
   COLOR THEME ENGINE — paletas embebidas (sin fetch externo)
   ============================================================ */
const _PALETTES = {
  light: { "themes": [{ "id": "green", "label": "Verde esmeralda", "default": true, "colors": { "accent": "#2d6a4f", "accent-soft": "#d8ede4", "accent-hover": "#245c43", "accent-text": "#1a3d2e", "now-line": "#c0392b" } }, { "id": "teal", "label": "Teal profundo", "colors": { "accent": "#0f766e", "accent-soft": "#ccfbf1", "accent-hover": "#0d6b64", "accent-text": "#134e4a", "now-line": "#b5451b" } }, { "id": "sage", "label": "Verde salvia", "colors": { "accent": "#3d6b52", "accent-soft": "#ddeee5", "accent-hover": "#2f5340", "accent-text": "#1e3529", "now-line": "#b5451b" } }, { "id": "forest", "label": "Verde bosque", "colors": { "accent": "#166534", "accent-soft": "#d1fae5", "accent-hover": "#14532d", "accent-text": "#052e16", "now-line": "#b5451b" } }, { "id": "lime", "label": "Lima intenso", "colors": { "accent": "#3f6212", "accent-soft": "#ecfccb", "accent-hover": "#365314", "accent-text": "#1a2e05", "now-line": "#b5451b" } }, { "id": "cyan", "label": "Cian profundo", "colors": { "accent": "#155e75", "accent-soft": "#cffafe", "accent-hover": "#0e4f63", "accent-text": "#083344", "now-line": "#b5451b" } }, { "id": "sky", "label": "Azul cielo", "colors": { "accent": "#075985", "accent-soft": "#e0f2fe", "accent-hover": "#0c4a6e", "accent-text": "#082f49", "now-line": "#7c3aed" } }, { "id": "blue", "label": "Azul real", "colors": { "accent": "#1e40af", "accent-soft": "#dbeafe", "accent-hover": "#1e3a8a", "accent-text": "#172554", "now-line": "#7c3aed" } }, { "id": "indigo", "label": "Índigo", "colors": { "accent": "#3730a3", "accent-soft": "#e0e7ff", "accent-hover": "#312e81", "accent-text": "#1e1b4b", "now-line": "#be185d" } }, { "id": "violet", "label": "Violeta", "colors": { "accent": "#5b21b6", "accent-soft": "#ede9fe", "accent-hover": "#4c1d95", "accent-text": "#2e1065", "now-line": "#be185d" } }, { "id": "purple", "label": "Morado profundo", "colors": { "accent": "#6b21a8", "accent-soft": "#f3e8ff", "accent-hover": "#581c87", "accent-text": "#3b0764", "now-line": "#be185d" } }, { "id": "fuchsia", "label": "Fucsia", "colors": { "accent": "#86198f", "accent-soft": "#fae8ff", "accent-hover": "#701a75", "accent-text": "#4a044e", "now-line": "#c2410c" } }, { "id": "rose", "label": "Rosa intenso", "colors": { "accent": "#9d174d", "accent-soft": "#fce7f3", "accent-hover": "#831843", "accent-text": "#500724", "now-line": "#c2410c" } }, { "id": "crimson", "label": "Carmesí", "colors": { "accent": "#881337", "accent-soft": "#ffe4e6", "accent-hover": "#6b0f2c", "accent-text": "#4c0519", "now-line": "#c2410c" } }, { "id": "orange", "label": "Naranja intenso", "colors": { "accent": "#9a3412", "accent-soft": "#ffedd5", "accent-hover": "#7c2d12", "accent-text": "#431407", "now-line": "#7c3aed" } }, { "id": "amber", "label": "Ámbar oscuro", "colors": { "accent": "#92400e", "accent-soft": "#fef3c7", "accent-hover": "#78350f", "accent-text": "#451a03", "now-line": "#7c3aed" } }, { "id": "brown", "label": "Marrón", "colors": { "accent": "#78350f", "accent-soft": "#fde8d0", "accent-hover": "#5c2a0b", "accent-text": "#3c1408", "now-line": "#6d28d9" } }, { "id": "slate", "label": "Pizarra", "colors": { "accent": "#334155", "accent-soft": "#e2e8f0", "accent-hover": "#1e293b", "accent-text": "#0f172a", "now-line": "#be185d" } }, { "id": "stone", "label": "Piedra", "colors": { "accent": "#44403c", "accent-soft": "#e7e5e4", "accent-hover": "#292524", "accent-text": "#1c1917", "now-line": "#9a3412" } }, { "id": "zinc", "label": "Zinc oscuro", "colors": { "accent": "#3f3f46", "accent-soft": "#e4e4e7", "accent-hover": "#27272a", "accent-text": "#18181b", "now-line": "#9a3412" } }, { "id": "navy", "label": "Azul marino", "colors": { "accent": "#1e3a5f", "accent-soft": "#dce8f7", "accent-hover": "#162d4a", "accent-text": "#0a1628", "now-line": "#9d174d" } }] },
  dark: { "themes": [{ "id": "green", "label": "Verde esmeralda", "default": true, "colors": { "accent": "#4ade80", "accent-soft": "#1a2e20", "accent-hover": "#6ee7a0", "accent-text": "#4ade80", "now-line": "#f87171" } }, { "id": "teal", "label": "Verde azulado", "colors": { "accent": "#2dd4bf", "accent-soft": "#0f2926", "accent-hover": "#5eead4", "accent-text": "#2dd4bf", "now-line": "#34d399" } }, { "id": "sage", "label": "Verde salvia", "colors": { "accent": "#86efac", "accent-soft": "#14231c", "accent-hover": "#bbf7d0", "accent-text": "#86efac", "now-line": "#6ee7b7" } }, { "id": "forest", "label": "Verde bosque", "colors": { "accent": "#4ade80", "accent-soft": "#052e16", "accent-hover": "#86efac", "accent-text": "#4ade80", "now-line": "#22c55e" } }, { "id": "lime", "label": "Lima", "colors": { "accent": "#a3e635", "accent-soft": "#1a2405", "accent-hover": "#bef264", "accent-text": "#a3e635", "now-line": "#84cc16" } }, { "id": "cyan", "label": "Cian", "colors": { "accent": "#22d3ee", "accent-soft": "#0a2030", "accent-hover": "#67e8f9", "accent-text": "#22d3ee", "now-line": "#06b6d4" } }, { "id": "sky", "label": "Cielo", "colors": { "accent": "#38bdf8", "accent-soft": "#0c2030", "accent-hover": "#7dd3fc", "accent-text": "#38bdf8", "now-line": "#0ea5e9" } }, { "id": "blue", "label": "Azul", "colors": { "accent": "#60a5fa", "accent-soft": "#1a2440", "accent-hover": "#93c5fd", "accent-text": "#60a5fa", "now-line": "#818cf8" } }, { "id": "indigo", "label": "Índigo", "colors": { "accent": "#818cf8", "accent-soft": "#1e1a3a", "accent-hover": "#a5b4fc", "accent-text": "#818cf8", "now-line": "#6366f1" } }, { "id": "violet", "label": "Violeta", "colors": { "accent": "#a78bfa", "accent-soft": "#221a3a", "accent-hover": "#c4b5fd", "accent-text": "#a78bfa", "now-line": "#8b5cf6" } }, { "id": "purple", "label": "Morado", "colors": { "accent": "#c084fc", "accent-soft": "#2a1045", "accent-hover": "#d8b4fe", "accent-text": "#c084fc", "now-line": "#a855f7" } }, { "id": "fuchsia", "label": "Fucsia", "colors": { "accent": "#e879f9", "accent-soft": "#30103a", "accent-hover": "#f0abfc", "accent-text": "#e879f9", "now-line": "#d946ef" } }, { "id": "rose", "label": "Rosa", "colors": { "accent": "#fb7185", "accent-soft": "#2e1a24", "accent-hover": "#fda4af", "accent-text": "#fb7185", "now-line": "#f472b6" } }, { "id": "crimson", "label": "Carmesí", "colors": { "accent": "#fca5a5", "accent-soft": "#3a0a0a", "accent-hover": "#fecaca", "accent-text": "#fca5a5", "now-line": "#f87171" } }, { "id": "orange", "label": "Naranja", "colors": { "accent": "#fb923c", "accent-soft": "#2a1a0a", "accent-hover": "#fdba74", "accent-text": "#fb923c", "now-line": "#f97316" } }, { "id": "amber", "label": "Ámbar", "colors": { "accent": "#fbbf24", "accent-soft": "#2a1f08", "accent-hover": "#fcd34d", "accent-text": "#fbbf24", "now-line": "#f59e0b" } }, { "id": "yellow", "label": "Amarillo dorado", "colors": { "accent": "#facc15", "accent-soft": "#27200a", "accent-hover": "#fde047", "accent-text": "#facc15", "now-line": "#eab308" } }, { "id": "slate", "label": "Pizarra", "colors": { "accent": "#94a3b8", "accent-soft": "#1e2533", "accent-hover": "#cbd5e1", "accent-text": "#94a3b8", "now-line": "#64748b" } }, { "id": "stone", "label": "Piedra", "colors": { "accent": "#a8a29e", "accent-soft": "#242120", "accent-hover": "#d6d3d1", "accent-text": "#a8a29e", "now-line": "#78716c" } }, { "id": "zinc", "label": "Zinc", "colors": { "accent": "#a1a1aa", "accent-soft": "#27272a", "accent-hover": "#d4d4d8", "accent-text": "#a1a1aa", "now-line": "#71717a" } }, { "id": "ice", "label": "Hielo", "colors": { "accent": "#7dd3fc", "accent-soft": "#082030", "accent-hover": "#bae6fd", "accent-text": "#7dd3fc", "now-line": "#38bdf8" } }] }
};

const colorTheme = {
  data: { light: null, dark: null },

  selectedLight: 'green',
  selectedDark: 'green',

  /** Carga paletas desde los datos embebidos */
  async loadAll() {
    this.data.light = _PALETTES.light;
    this.data.dark = _PALETTES.dark;
  },

  /** Restaura selecciones guardadas en localStorage */
  restoreSaved() {
    const savedLight = localStorage.getItem('calendara_color_light');
    const savedDark = localStorage.getItem('calendara_color_dark');
    if (savedLight && this._findTheme('light', savedLight)) this.selectedLight = savedLight;
    if (savedDark && this._findTheme('dark', savedDark)) this.selectedDark = savedDark;
  },

  _findTheme(mode, id) {
    const d = this.data[mode];
    if (!d || !d.themes) return null;
    return d.themes.find(t => t.id === id) || null;
  },

  /**
   * Aplica AMBAS paletas simultáneamente inyectando un <style>
   * con los dos selectores. De este modo:
   *  - :root { ... }              → activo en modo CLARO
   *  - [data-theme="dark"] { ... } → activo en modo OSCURO
   * Cada uno tiene su propia paleta independiente y persistida.
   */
  /** Convierte un color hex (#rrggbb o #rgb) en "r, g, b" para usar en rgba() */
  _hexToRgb(hex) {
    if (!hex) return null;
    // Normalizar #rgb → #rrggbb
    const clean = hex.replace(/^#/, '');
    const full = clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean;
    const num = parseInt(full, 16);
    if (isNaN(num)) return null;
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  },

  apply() {
    const light = this._findTheme('light', this.selectedLight);
    const dark = this._findTheme('dark', this.selectedDark);

    // Obtener o crear el elemento <style> dedicado
    let styleEl = document.getElementById('calendara-color-theme');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'calendara-color-theme';
      document.head.appendChild(styleEl);
    }

    const lightRgb = light ? this._hexToRgb(light.colors['accent']) : null;
    const darkRgb = dark ? this._hexToRgb(dark.colors['accent']) : null;

    const lightVars = light ? `
    --accent:       ${light.colors['accent']};
    --accent-soft:  ${light.colors['accent-soft']};
    --accent-hover: ${light.colors['accent-hover']};
    --accent-text:  ${light.colors['accent-text']};
    --now-line-color: ${light.colors['now-line']};${lightRgb ? `\n    --accent-rgb:   ${lightRgb};` : ''}` : '';

    const darkVars = dark ? `
    --accent:       ${dark.colors['accent']};
    --accent-soft:  ${dark.colors['accent-soft']};
    --accent-hover: ${dark.colors['accent-hover']};
    --accent-text:  ${dark.colors['accent-text']};
    --now-line-color: ${dark.colors['now-line']};${darkRgb ? `\n    --accent-rgb:   ${darkRgb};` : ''}` : '';

    // Inyectar ambos selectores con alta especificidad
    styleEl.textContent = `
:root {${lightVars}
}
[data-theme="dark"] {${darkVars}
}`;
  },

  /** Selecciona una paleta para un modo, la persiste y re-aplica */
  select(mode, id) {
    if (!this._findTheme(mode, id)) return;
    if (mode === 'light') this.selectedLight = id;
    else this.selectedDark = id;
    localStorage.setItem(`calendara_color_${mode}`, id);
    this.apply();
    if (state.currentScreen === 'profile') renderProfile();
  },

  getThemes(mode) {
    const d = this.data[mode];
    return (d && d.themes) ? d.themes : [];
  },

  getSelected(mode) {
    return mode === 'dark' ? this.selectedDark : this.selectedLight;
  },
};

/* ============================================================
   STATE
   ============================================================ */
const state = {
  currentScreen: 'calendar',
  calView: 'week',
  currentDate: new Date(),
  theme: 'dark',
  sidebarCollapsed: false,
  notifPanelOpen: false,
  unreadCount: 3,

  user: {
    name: 'Juan Sánchez',
    username: '@juansanchez',
    email: 'juan@ejemplo.com',
    initials: 'JS',
    avatarUrl: null,
    bannerUrl: null,
    birthdate: '',           // YYYY-MM-DD – will auto-create birthday event
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // auto-detected
    country: 'Guatemala'  // user's country
  },

  events: [
    { id: 1, title: 'Reunión de equipo', date: todayStr(), start: '09:00', end: '10:00', color: '#2563eb', emoji: '👥', desc: 'Revisión semanal del sprint', location: 'Sala A', recurrence: { type: 'weekly', days: [1], endType: 'never' }, sharedWith: [], showFrom: 'registration' },
    { id: 2, title: 'Almuerzo con cliente', date: todayStr(), start: '13:00', end: '14:30', color: '#d97706', emoji: '🍽️', desc: 'Propuesta de proyecto nuevo', location: 'Restaurante Centro', recurrence: { type: 'none' }, sharedWith: [1], showFrom: 'current' },
    { id: 3, title: 'Gym', date: todayStr(), start: '07:00', end: '08:00', color: '#dc2626', emoji: '💪', desc: '', location: '', recurrence: { type: 'daily', endType: 'never' }, sharedWith: [], showFrom: 'registration' },
    { id: 4, title: 'Revisión de código', date: offsetDate(1), start: '10:00', end: '11:30', color: '#2563eb', emoji: '💻', desc: 'PR review con el equipo', location: '', recurrence: { type: 'none' }, sharedWith: [], showFrom: 'current' },
    { id: 5, title: 'Clase de inglés', date: offsetDate(2), start: '18:00', end: '19:00', color: '#16a34a', emoji: '📚', desc: '', location: 'Online', recurrence: { type: 'weekly', days: [2, 4], endType: 'never' }, sharedWith: [], showFrom: 'registration' },
    { id: 6, title: 'Cita médica', date: offsetDate(-1), start: '08:30', end: '09:30', color: '#dc2626', emoji: '🦷', desc: 'Chequeo anual', location: 'Clínica San José', recurrence: { type: 'none' }, sharedWith: [], showFrom: 'current' },
    { id: 7, title: 'Cumpleaños - María', date: offsetDate(3), start: '19:00', end: '22:00', color: '#7c3aed', emoji: '🎂', desc: 'Celebración en casa de María', location: '', recurrence: { type: 'yearly', endType: 'never' }, sharedWith: [1, 2], showFrom: 'current' },
    { id: 8, title: 'Presentación proyecto', date: offsetDate(-2), start: '11:00', end: '12:00', color: '#d97706', emoji: '📊', desc: 'Demo para stakeholders', location: 'Sala conferencias', recurrence: { type: 'none' }, sharedWith: [], showFrom: 'current' },
  ],

  goals: [
    {
      id: 1, title: 'Graduarme de la universidad',
      desc: 'Completar todos los créditos y presentar tesis de grado.',
      status: 'progress', priority: 'high', category: 'education',
      horizon: 'year', horizonValue: '2026',
      startDate: '2022-01-15', endDate: '2026-12-31',
      milestones: [
        { id: 'm1', text: 'Completar 60% de créditos', done: true, date: '2024-06-01' },
        { id: 'm2', text: 'Completar 80% de créditos', done: true, date: '2025-01-01' },
        { id: 'm3', text: 'Entregar propuesta de tesis', done: true, date: '2025-06-01' },
        { id: 'm4', text: 'Defender tesis', done: false, date: '2026-06-01' },
        { id: 'm5', text: 'Graduación', done: false, date: '2026-12-01' },
      ],
      color: '#6366f1'
    },
    {
      id: 2, title: 'Tener mi propia casa',
      desc: 'Ahorrar suficiente para el enganche de una propiedad propia.',
      status: 'progress', priority: 'high', category: 'finance',
      horizon: 'longterm', horizonValue: '2030',
      startDate: '2023-01-01', endDate: '2030-12-31',
      milestones: [
        { id: 'm1', text: 'Ahorrar Q50,000 de enganche', done: true, date: '2024-12-01' },
        { id: 'm2', text: 'Mejorar historial crediticio', done: false, date: '2025-12-01' },
        { id: 'm3', text: 'Conseguir preaprobación hipotecaria', done: false, date: '2028-06-01' },
        { id: 'm4', text: 'Comprar la casa', done: false, date: '2030-06-01' },
      ],
      color: '#f59e0b'
    },
    {
      id: 3, title: 'Aprender japonés conversacional',
      desc: 'Alcanzar nivel N3 en el JLPT.',
      status: 'progress', priority: 'medium', category: 'learning',
      horizon: 'year', horizonValue: '2027',
      startDate: '2024-03-01', endDate: '2027-12-01',
      milestones: [
        { id: 'm1', text: 'Aprender hiragana y katakana', done: true, date: '2024-04-01' },
        { id: 'm2', text: 'Completar nivel N5', done: true, date: '2024-12-01' },
        { id: 'm3', text: 'Completar nivel N4', done: false, date: '2026-06-01' },
        { id: 'm4', text: 'Examen N3 JLPT', done: false, date: '2027-12-01' },
      ],
      color: '#ec4899'
    },
    {
      id: 4, title: 'Correr un maratón completo',
      desc: 'Preparar cuerpo y mente para correr 42km.',
      status: 'progress', priority: 'medium', category: 'health',
      horizon: 'month', horizonValue: '2026-09',
      startDate: '2026-01-01', endDate: '2026-09-15',
      milestones: [
        { id: 'm1', text: 'Correr 5km sin parar', done: true, date: '2026-02-01' },
        { id: 'm2', text: 'Correr 10km sin parar', done: true, date: '2026-03-15' },
        { id: 'm3', text: 'Correr 21km (media maratón)', done: false, date: '2026-06-01' },
        { id: 'm4', text: 'Completar el maratón', done: false, date: '2026-09-15' },
      ],
      color: '#22c55e'
    },
    {
      id: 5, title: 'Bautizarme',
      desc: 'Un paso importante en mi fe y comunidad.',
      status: 'pending', priority: 'low', category: 'personal',
      horizon: 'open', horizonValue: '',
      startDate: '', endDate: '',
      milestones: [],
      color: '#a78bfa'
    },
    {
      id: 6, title: 'Leer 24 libros este año',
      desc: 'Dos libros por mes durante todo el año.',
      status: 'done', priority: 'low', category: 'learning',
      horizon: 'year', horizonValue: '2024',
      startDate: '2024-01-01', endDate: '2024-12-31',
      milestones: [
        { id: 'm1', text: 'Leer 6 libros (Q1)', done: true, date: '2024-03-31' },
        { id: 'm2', text: 'Leer 12 libros (Q2)', done: true, date: '2024-06-30' },
        { id: 'm3', text: 'Leer 18 libros (Q3)', done: true, date: '2024-09-30' },
        { id: 'm4', text: 'Leer 24 libros (Q4)', done: true, date: '2024-12-31' },
      ],
      color: '#14b8a6'
    },
    {
      id: 7, title: 'Subir de nivel en videojuego',
      desc: 'Alcanzar el siguiente rango en este fin de semana.',
      status: 'progress', priority: 'low', category: 'personal',
      horizon: 'week', horizonValue: offsetDate(6),
      startDate: todayStr(), endDate: offsetDate(6),
      milestones: [
        { id: 'm1', text: 'Completar 5 partidas clasificatorias', done: true, date: offsetDate(2) },
        { id: 'm2', text: 'Ganar 3 partidas seguidas', done: false, date: offsetDate(5) },
      ],
      color: '#f97316'
    },
    {
      id: 8, title: 'Enviar propuesta al cliente',
      desc: 'Finalizar y enviar la propuesta del nuevo proyecto.',
      status: 'progress', priority: 'high', category: 'career',
      horizon: 'day', horizonValue: offsetDate(2),
      startDate: todayStr(), endDate: offsetDate(2),
      milestones: [
        { id: 'm1', text: 'Redactar sección de costos', done: true, date: offsetDate(1) },
        { id: 'm2', text: 'Revisar con el equipo', done: false, date: offsetDate(2) },
      ],
      color: '#0ea5e9'
    },
  ],

  people: [
    { id: 1, name: 'María López', username: '@marialopez', initials: 'ML', color: '#e879f9', online: true, timezone: 'Europe/Madrid', country: 'España' },
    { id: 2, name: 'Carlos Torres', username: '@ctorres', initials: 'CT', color: '#60a5fa', online: false, timezone: 'America/New_York', country: 'EE.UU.' },
    { id: 3, name: 'Ana García', username: '@anagarcia', initials: 'AG', color: '#4ade80', online: true, timezone: 'Asia/Tokyo', country: 'Japón' },
  ],

  blocked: [
    { id: 10, name: 'Roberto Díaz', username: '@rdiaz', initials: 'RD', color: '#f87171' }
  ],

  notifications: [
    { id: 1, icon: '📅', msg: '<strong>María López</strong> te compartió un evento: <em>Cena de cumpleaños</em>', time: 'hace 5 min', read: false },
    { id: 2, icon: '🎯', msg: 'Tu meta <em>Aprender japonés</em> está al 40% — ¡sigue así!', time: 'hace 2 h', read: false },
    { id: 3, icon: '🔔', msg: '<strong>Carlos Torres</strong> aceptó tu solicitud de conexión', time: 'hace 3 h', read: false },
    { id: 4, icon: '📅', msg: 'Recordatorio: <em>Reunión de equipo</em> en 30 minutos', time: 'ayer', read: true },
    { id: 5, icon: '✅', msg: 'Meta completada: <em>Leer 24 libros este año</em> — ¡Felicitaciones!', time: 'hace 2 días', read: true },
  ],

  selectedPerson: null,
  goalFilter: 'all',
  notifFilter: 'all',
};

/* ============================================================
   HELPERS
   ============================================================ */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date, opts = {}) {
  return date.toLocaleDateString(i18n.lang, opts);
}

function fmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/* ============================================================
   TIMEZONE UTILITIES
   ============================================================ */

/** Returns the current wall-clock time (h, m, s) in a given IANA timezone */
function nowInTz(tz) {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
    }).formatToParts(now);
    const get = type => parseInt(parts.find(p => p.type === type)?.value || '0');
    let h = get('hour');
    if (h === 24) h = 0;
    return { h, m: get('minute'), s: get('second') };
  } catch (e) {
    return { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
  }
}

/** Returns total minutes from midnight in a given IANA timezone */
function nowMinutesInTz(tz) {
  const t = nowInTz(tz);
  return t.h * 60 + t.m;
}

/** Returns exact seconds from midnight for pixel-perfect now-line */
function nowSecondsInTz(tz) {
  const t = nowInTz(tz);
  return t.h * 3600 + t.m * 60 + t.s;
}

/** Converts a date string to its equivalent in a given timezone (for day boundary) */
function dateStrInTz(tz) {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    return parts.find(p => p.type === 'year').value + '-' + parts.find(p => p.type === 'month').value + '-' + parts.find(p => p.type === 'day').value;
  } catch (e) {
    return dateToStr(now);
  }
}

/** Format a timezone name for display */
function fmtTz(tz) {
  try {
    const offset = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;
    return `${tz.replace(/_/g, ' ')} (${offset})`;
  } catch (e) { return tz; }
}

/** Check if user's detected timezone differs from stored timezone */
function detectTimezoneChange() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const stored = state.user.timezone;
  if (detected && stored && detected !== stored) {
    _promptTimezoneChange(detected, stored);
  }
}

function _promptTimezoneChange(detected, stored) {
  // Only prompt once per session
  if (sessionStorage.getItem('tz_prompt_shown')) return;
  sessionStorage.setItem('tz_prompt_shown', '1');

  const el = document.createElement('div');
  el.id = 'tz-change-prompt';
  el.className = 'tz-change-prompt';
  el.innerHTML = `
    <div class="tz-change-card">
      <div class="tz-change-icon">🌍</div>
      <div class="tz-change-body">
        <div class="tz-change-title">Se detectó un cambio de zona horaria</div>
        <div class="tz-change-desc">Tu dispositivo ahora está en <strong>${fmtTz(detected)}</strong>. Antes usabas <strong>${fmtTz(stored)}</strong>.<br>¿Deseas actualizar tu zona horaria y ajustar tus eventos?</div>
        <div class="tz-change-btns">
          <button class="btn-secondary" onclick="document.getElementById('tz-change-prompt').remove()">Mantener ${fmtTz(stored).split(' ')[0]}</button>
          <button class="btn-primary" onclick="_applyTimezoneChange('${detected}')">Actualizar a ${fmtTz(detected).split(' ')[0]}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
}

function _applyTimezoneChange(newTz) {
  state.user.timezone = newTz;
  document.getElementById('tz-change-prompt')?.remove();
  showToast(`Zona horaria actualizada a ${fmtTz(newTz).split('(')[0].trim()}`, '🌍');
  renderCalendar();
}

/* ── Birthday event auto-registration ── */
function ensureBirthdayEvent() {
  const bd = state.user.birthdate;
  if (!bd) return;
  const existing = state.events.find(e => e._isBirthday && e._birthdayOf === 'user');
  if (!existing) {
    const [, mm, dd] = bd.split('-');
    const thisYearBd = `${new Date().getFullYear()}-${mm}-${dd}`;
    state.events.push({
      id: 9000,
      title: '🎂 Mi cumpleaños',
      emoji: '🎂',
      color: '#7c3aed',
      desc: '¡Feliz cumpleaños!',
      date: thisYearBd,
      allDay: true,
      recurrence: { type: 'yearly', endType: 'never' },
      sharedWith: [],
      showFrom: 'registration',
      _isBirthday: true,
      _birthdayOf: 'user',
      start: '00:00', end: '23:59'
    });
  }
}

/* ── Check for conflicts — returns true if slot is free ── */
function isSlotFree(dateStr, startTime, endTime, excludeId = null) {
  const newS = timeToMinutes(startTime);
  const newE = timeToMinutes(endTime);
  const events = getEventsForDate(dateStr).filter(e => e.id !== excludeId && !e.allDay);
  for (const ev of events) {
    const eS = timeToMinutes(ev.start);
    const eE = timeToMinutes(ev.end);
    // Overlap if they share any minute
    if (newS < eE && newE > eS) return false;
  }
  return true;
}

/* ── Layout overlapping events into columns ── */
function layoutEvents(events) {
  // Sort by start
  const sorted = [...events].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const columns = [];
  const result = sorted.map(ev => {
    const s = timeToMinutes(ev.start);
    const e = timeToMinutes(ev.end);
    // Find first column where ev doesn't overlap last event
    let col = columns.findIndex(c => timeToMinutes(c[c.length - 1].end) <= s);
    if (col === -1) { columns.push([]); col = columns.length - 1; }
    columns[col].push(ev);
    return { ev, col, totalCols: 1 };
  });
  // Second pass: set totalCols for each event based on maximum simultaneous overlaps
  result.forEach(item => {
    const s = timeToMinutes(item.ev.start);
    const e = timeToMinutes(item.ev.end);
    const overlapping = result.filter(o => timeToMinutes(o.ev.start) < e && timeToMinutes(o.ev.end) > s);
    const maxCol = Math.max(...overlapping.map(o => o.col)) + 1;
    overlapping.forEach(o => { o.totalCols = Math.max(o.totalCols, maxCol); });
  });
  return result;
}

function getWeekDates(refDate) {
  const d = new Date(refDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(monday);
    nd.setDate(monday.getDate() + i);
    return nd;
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateToStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDaysShort() {
  const c = i18n.data.calendar;
  if (!c) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return [c.days.mon, c.days.tue, c.days.wed, c.days.thu, c.days.fri, c.days.sat, c.days.sun];
}

function getMonths() {
  const c = i18n.data.calendar;
  if (!c) return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return [c.months.january, c.months.february, c.months.march, c.months.april, c.months.may, c.months.june, c.months.july, c.months.august, c.months.september, c.months.october, c.months.november, c.months.december];
}

function getMonthsShort() {
  const c = i18n.data.calendar;
  if (!c) return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return [c.monthsShort.jan, c.monthsShort.feb, c.monthsShort.mar, c.monthsShort.apr, c.monthsShort.may, c.monthsShort.jun, c.monthsShort.jul, c.monthsShort.aug, c.monthsShort.sep, c.monthsShort.oct, c.monthsShort.nov, c.monthsShort.dec];
}

/* ============================================================
   APPLY TRANSLATIONS
   Updates all static DOM elements with translated strings.
   Called on init and on every language change.
   ============================================================ */
function applyTranslations() {
  // ── Sidebar ──
  const secTitles = document.querySelectorAll('.sidebar-section-title');
  if (secTitles[0]) secTitles[0].textContent = t('sidebar.principal');
  if (secTitles[1]) secTitles[1].textContent = t('sidebar.personal');

  setNavLabel('#nav-calendar', t('sidebar.calendar'));
  setNavLabel('#nav-goals', t('sidebar.goals'));
  setNavLabel('#nav-shared', t('sidebar.shared'));
  setNavLabel('#nav-notifications', t('sidebar.notifications'));
  setNavLabel('#nav-profile', t('sidebar.profile'));

  const btnCollapse = document.querySelector('.btn-collapse');
  if (btnCollapse) {
    btnCollapse.setAttribute('aria-label', t('sidebar.collapseMenu'));
    btnCollapse.setAttribute('title', t('sidebar.collapseMenu'));
  }

  // ── Topbar ──
  const btnToday = document.querySelector('.btn-today');
  if (btnToday) btnToday.textContent = t('topbar.today');

  const viewBtns = document.querySelectorAll('.view-btn');
  const vKeys = ['calendar.viewDay', 'calendar.viewWeek', 'calendar.viewMonth'];
  viewBtns.forEach((b, i) => { if (vKeys[i]) b.textContent = t(vKeys[i]); });

  const btnCreate = document.getElementById('btn-create-event');
  if (btnCreate) {
    const labelEl = btnCreate.querySelector('.btn-create-label');
    if (labelEl) labelEl.textContent = t('topbar.newEvent');
  }

  // ── Goals screen ──
  const gfBtns = document.querySelectorAll('#goals-filter-tabs .filter-tab');
  const gfKeys = ['goals.filterAll', 'goals.filterProgress', 'goals.filterDone', 'goals.filterPending'];
  gfBtns.forEach((b, i) => { if (gfKeys[i]) b.textContent = t(gfKeys[i]); });

  const btnNewGoal = document.querySelector('#screen-goals .goals-toolbar .btn-primary');
  if (btnNewGoal) {
    const svgEl = btnNewGoal.querySelector('svg');
    if (svgEl) btnNewGoal.innerHTML = svgEl.outerHTML + ' ' + t('goals.newGoal');
  }

  // ── Shared screen ──
  const peopleH3 = document.querySelector('.people-panel-header h3');
  if (peopleH3) peopleH3.textContent = t('shared.addedPeople');

  const searchInp = document.querySelector('.search-bar input');
  if (searchInp) searchInp.placeholder = t('shared.searchPerson');

  const btnAddPerson = document.querySelector('.btn-add-person');
  if (btnAddPerson) {
    const svgEl = btnAddPerson.querySelector('svg');
    if (svgEl) btnAddPerson.innerHTML = svgEl.outerHTML + ' ' + t('shared.addPerson');
  }

  // ── Notifications screen ──
  const nfBtns = document.querySelectorAll('.notif-filters .filter-tab');
  if (nfBtns[0]) nfBtns[0].textContent = t('notifications.filterAll');
  if (nfBtns[1]) nfBtns[1].textContent = t('notifications.filterUnread');
  if (nfBtns[2]) nfBtns[2].textContent = t('notifications.filterAll'); // 'read' not in JSON

  const btnMarkAll = document.querySelector('.btn-mark-all');
  if (btnMarkAll) btnMarkAll.textContent = t('notifications.markAllRead');

  // ── Notification panel ──
  const notifH3 = document.querySelector('.notif-panel-header h3');
  if (notifH3) notifH3.textContent = t('notifications.title');
  const btnSeeAll = document.querySelector('.btn-see-all');
  if (btnSeeAll) btnSeeAll.textContent = t('notifications.seeAll');

  // ── Bottom nav ──
  const bnItems = document.querySelectorAll('#bottom-nav .bottom-nav-item span');
  if (bnItems[0]) bnItems[0].textContent = t('bottomNav.events');
  if (bnItems[1]) bnItems[1].textContent = t('bottomNav.goals');
  if (bnItems[2]) bnItems[2].textContent = t('bottomNav.social');
  if (bnItems[3]) bnItems[3].textContent = t('profile.title');

  // ── Bottom sheets ──
  setElText('#bottom-sheet-events .sheet-title', t('bottomSheet.eventsTitle'));
  setElText('#bottom-sheet-goals .sheet-title', t('bottomSheet.goalsTitle'));
  setElText('#bottom-sheet-society .sheet-title', t('bottomSheet.socialTitle'));

  const sheetTabs = document.querySelectorAll('#bottom-sheet-events .sheet-tab');
  if (sheetTabs[0]) sheetTabs[0].textContent = t('bottomSheet.today');
  if (sheetTabs[1]) sheetTabs[1].textContent = t('bottomSheet.week');
  if (sheetTabs[2]) sheetTabs[2].textContent = t('bottomSheet.all');

  // ── Event modal — built dynamically, no static translations needed ──

  // ── Goal modal — built dynamically, no static translations needed ──

  // ── Add person modal ──
  setElText('#modal-add-person .modal-title', t('shared.addPerson'));
  const apLbl = document.querySelector('#modal-add-person .form-label');
  if (apLbl) apLbl.textContent = t('auth.username');
  setPlaceholder('add-person-username', t('auth.usernamePlaceholder'));
  setModalFooterBtns('#modal-add-person', [t('shared.cancel'), t('shared.addBtn')]);

  // ── Edit profile modal ──
  setElText('#modal-edit-profile .modal-title', t('profile.editProfile'));
  const epLabels = document.querySelectorAll('#modal-edit-profile .form-label');
  if (epLabels[0]) epLabels[0].textContent = t('profile.fullName');
  if (epLabels[1]) epLabels[1].textContent = t('auth.email');
  if (epLabels[2]) epLabels[2].textContent = t('auth.username');
  setPlaceholder('ep-name', t('auth.namePlaceholder'));
  setPlaceholder('ep-email', t('auth.emailPlaceholder'));
  setPlaceholder('ep-username', t('auth.usernamePlaceholder'));
  setModalFooterBtns('#modal-edit-profile', [t('profile.cancel'), t('profile.save')]);

  // ── Change password modal ──
  setElText('#modal-change-password .modal-title', t('profile.changePassword'));
  const pwdLabels = document.querySelectorAll('#modal-change-password .form-label');
  if (pwdLabels[0]) pwdLabels[0].textContent = t('profile.currentPassword');
  if (pwdLabels[1]) pwdLabels[1].textContent = t('profile.newPassword');
  if (pwdLabels[2]) pwdLabels[2].textContent = t('profile.confirmNewPassword');
  setModalFooterBtns('#modal-change-password', [t('modal.cancel'), t('modal.save')]);

  // ── Topbar title for current screen ──
  const screenTitles = {
    calendar: t('calendar.title'),
    goals: t('goals.title'),
    shared: t('shared.title'),
    notifications: t('notifications.title'),
    profile: t('profile.title')
  };
  setElText('#topbar-title', screenTitles[state.currentScreen] || '');

  // ── Connection status ──
  updateConnectionStatus();

  // ── Re-render dynamic sections ──
  renderMiniCalendar();
  updatePeriodLabel();

  const screen = state.currentScreen;
  if (screen === 'calendar') renderCalendar();
  else if (screen === 'goals') renderGoals();
  else if (screen === 'shared') renderShared();
  else if (screen === 'notifications') renderNotificationsFull();
  else if (screen === 'profile') renderProfile();

  // Sync lang select if it exists (rendered dynamically)
  const langSel = document.querySelector('.lang-select');
  if (langSel) langSel.value = i18n.lang;
}

// ── DOM helpers ──
function setElText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function setNavLabel(navId, text) {
  const el = document.querySelector(`${navId} .sidebar-label`);
  if (el) el.textContent = text;
}

function setLabel(inputId, text) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const fg = input.closest('.form-group');
  if (!fg) return;
  const lbl = fg.querySelector('.form-label');
  if (lbl) lbl.textContent = text;
}

function setPlaceholder(inputId, text) {
  const el = document.getElementById(inputId);
  if (el) el.placeholder = text;
}

function setModalFooterBtns(modalSelector, labels) {
  const btns = document.querySelectorAll(`${modalSelector} .modal-footer button`);
  labels.forEach((label, i) => { if (btns[i]) btns[i].textContent = label; });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));

  state.currentScreen = screen;

  const screenEl = document.getElementById(`screen-${screen}`);
  if (screenEl) screenEl.classList.add('active');

  const navEl = document.getElementById(`nav-${screen}`);
  if (navEl) navEl.classList.add('active');

  const titles = {
    calendar: t('calendar.title'),
    goals: t('goals.title'),
    shared: t('shared.title'),
    notifications: t('notifications.title'),
    profile: t('profile.title')
  };
  const topbarTitle = document.getElementById('topbar-title');
  if (topbarTitle) topbarTitle.textContent = titles[screen] || '';

  const topbar = document.getElementById('topbar');
  const calControls = document.getElementById('cal-nav-controls');
  const viewSwitcher = document.getElementById('view-switcher');
  const btnCreate = document.getElementById('btn-create-event');
  const row2 = document.getElementById('topbar-row-2');

  if (screen === 'calendar') {
    // Two-row mode: row-2 is shown via CSS class; controls live inside it
    topbar.classList.add('tb-two-row');
    // cal-nav-controls and view-switcher are now always inside row-2
    // so we just ensure they're not force-hidden
    if (calControls) calControls.style.display = '';
    if (viewSwitcher) viewSwitcher.style.display = '';
    if (btnCreate) btnCreate.style.display = '';
    const mEl = document.getElementById('mobile-period-label');
    if (mEl) mEl.style.display = '';
  } else {
    // Single-row mode for all other screens
    topbar.classList.remove('tb-two-row');
    // These elements are inside row-2 which hides itself via CSS
    // when tb-two-row is absent — nothing else to do
    const mEl = document.getElementById('mobile-period-label');
    if (mEl) mEl.style.display = 'none';
  }

  if (screen === 'calendar') renderCalendar();
  if (screen === 'goals') renderGoals();
  if (screen === 'shared') renderShared();
  if (screen === 'notifications') renderNotificationsFull();
  if (screen === 'profile') renderProfile();

  closeMobileSidebar();
  if (state.notifPanelOpen) toggleNotifPanel();
}

/* ============================================================
   THEME
   ============================================================ */
/* Resuelve qué modo aplicar según hora del dispositivo (para modo Sistema):
   6:00 – 18:59 → claro | 19:00 – 5:59 → oscuro */
function resolveSystemTheme() {
  const h = new Date().getHours();
  return (h >= 6 && h < 19) ? 'light' : 'dark';
}

function _applyThemeToDOM(resolved) {
  document.documentElement.setAttribute('data-theme', resolved);
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (sun && moon) {
    if (resolved === 'dark') { sun.style.display = 'none'; moon.style.display = 'block'; }
    else { sun.style.display = 'block'; moon.style.display = 'none'; }
  }
  colorTheme.apply();
  if (state.currentScreen === 'profile') renderProfile();
}

function toggleTheme() {
  // Cycle: light → dark → light (ignores system in topbar toggle)
  const next = (state.theme === 'dark') ? 'light' : 'dark';
  state.theme = next;
  localStorage.setItem('calendara_theme', next);
  _applyThemeToDOM(next);
}

/* Called from the Apariencia selector in Profile */
function setAppearanceMode(mode) {
  state.theme = mode;
  localStorage.setItem('calendara_theme', mode);
  const resolved = (mode === 'system') ? resolveSystemTheme() : mode;
  _applyThemeToDOM(resolved);
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function isMobile() {
  return window.innerWidth <= 768;
}

function updateToggleBtn() {
  const btn = document.getElementById('btn-toggle-menu');
  if (!btn) return;
  if (isMobile()) {
    // Mobile: sidebar hidden = arrow right (to open); shown = arrow left (to close)
    const isOpen = document.getElementById('sidebar').classList.contains('mobile-open');
    btn.classList.toggle('arrow-right', !isOpen);
    btn.classList.toggle('arrow-left', isOpen);
    btn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  } else {
    // Desktop: sidebar expanded = arrow left; collapsed = arrow right
    btn.classList.toggle('arrow-right', state.sidebarCollapsed);
    btn.classList.remove('arrow-left');
    btn.setAttribute('aria-label', state.sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú');
  }
}

function handleMenuToggle() {
  if (isMobile()) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('mobile-open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  } else {
    toggleSidebar();
  }
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', state.sidebarCollapsed);
  updateToggleBtn();
}

function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('mobile-overlay').classList.add('show');
  updateToggleBtn();
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('mobile-overlay').classList.remove('show');
  updateToggleBtn();
}

/* ============================================================
   CALENDAR
   ============================================================ */
function setView(v) {
  state.calView = v;
  // Use data-view attribute (set by initTopbarResponsive) or fall back to onclick text.
  // This works both before and after initTopbarResponsive removes onclick.
  document.querySelectorAll('#view-switcher .view-btn').forEach(b => {
    const dv = b.dataset.view;
    const oc = b.getAttribute('onclick') || '';
    const isThis = dv ? dv === v : oc.includes(`'${v}'`);
    b.classList.toggle('active', isThis);
  });
  renderCalendar();
}

function calNav(dir) {
  const d = state.currentDate;
  if (state.calView === 'week') d.setDate(d.getDate() + dir * 7);
  else if (state.calView === 'month') d.setMonth(d.getMonth() + dir);
  else if (state.calView === 'year') d.setFullYear(d.getFullYear() + dir);
  else d.setDate(d.getDate() + dir);
  state.currentDate = new Date(d);
  renderCalendar();
}

function goToday() {
  state.currentDate = new Date();
  renderCalendar();
}

function renderCalendar() {
  document.getElementById('view-week').classList.add('hidden');
  document.getElementById('view-day').classList.add('hidden');
  document.getElementById('view-month').classList.add('hidden');
  document.getElementById('view-year').classList.add('hidden');
  updatePeriodLabel();
  if (state.calView === 'week') renderWeekView();
  else if (state.calView === 'day') renderDayView();
  else if (state.calView === 'year') renderYearView();
  else renderMonthView();
}

function updatePeriodLabel() {
  const d = state.currentDate;
  const MONTHS = getMonths();
  const MONTHS_SHORT = getMonthsShort();
  const ofWord = t('calendar.of');
  let label = '';
  if (state.calView === 'week') {
    const days = getWeekDates(d);
    const first = days[0]; const last = days[6];
    if (first.getMonth() === last.getMonth())
      label = `${first.getDate()} – ${last.getDate()} ${ofWord} ${MONTHS[first.getMonth()]} ${first.getFullYear()}`;
    else
      label = `${first.getDate()} ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`;
  } else if (state.calView === 'month') {
    label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } else if (state.calView === 'year') {
    label = `${d.getFullYear()}`;
  } else {
    label = formatDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  const el = document.getElementById('cal-period-label');
  if (el) el.textContent = label;
  const mEl = document.getElementById('mobile-period-label');
  if (mEl) mEl.textContent = label;
}

/* ---- Week view ---- */
function renderWeekView() {
  const el = document.getElementById('view-week');
  el.classList.remove('hidden');
  const DAYS_SHORT = getDaysShort();
  const today = new Date();
  const days = getWeekDates(state.currentDate);
  const weekStart = days[0];
  const weekEnd = days[6];
  const weekStartStr = dateToStr(weekStart);
  const weekEndStr = dateToStr(weekEnd);
  const userTz = state.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayTzStr = dateStrInTz(userTz);

  // Goals relevant specifically to THIS week
  const weekGoals = state.goals.filter(g => {
    if (g.status === 'done') return false;
    if (g.horizon !== 'week') return false;
    if (!g.endDate) return false;
    return g.endDate >= weekStartStr && g.endDate <= weekEndStr;
  }).slice(0, 5);

  // Goals per day (day-horizon ending on that specific day)
  const dayGoals = {};
  days.forEach(d => {
    const ds = dateToStr(d);
    dayGoals[ds] = state.goals.filter(g =>
      g.status !== 'done' && g.horizon === 'day' && g.endDate === ds
    );
  });

  // All-day events per day (allDay flag or birthday events)
  const allDayEvtsPerDay = {};
  days.forEach(d => {
    const ds = dateToStr(d);
    allDayEvtsPerDay[ds] = getEventsForDate(ds).filter(e => e.allDay);
  });
  const hasAnyAllDay = Object.values(allDayEvtsPerDay).some(a => a.length > 0);

  const headerEl = document.getElementById('week-header-days');
  headerEl.innerHTML = `<div class="week-header-gutter"></div>` +
    days.map((d, i) => {
      const isToday = dateToStr(d) === todayTzStr;
      const dayStr = dateToStr(d);
      const dayEvents = state.events.filter(e => e.date === dayStr);
      const dgs = dayGoals[dayStr] || [];
      return `<div class="week-day-col ${isToday ? 'today' : ''}">
        <div class="week-day-name">${DAYS_SHORT[i]}</div>
        <div class="week-day-num ${isToday ? 'today-num' : ''}" onclick="goToDay(${d.getFullYear()},${d.getMonth()},${d.getDate()})">${d.getDate()}</div>
        ${dayEvents.length > 0 ? `<div class="week-goal-indicators">${dayEvents.slice(0, 3).map(ev => `<div class="goal-chip" style="background:${ev.color || 'var(--accent)'};width:12px;height:3px;border-radius:2px"></div>`).join('')}</div>` : '<div style="height:8px"></div>'}
      </div>`;
    }).join('');

  // Goals banner
  const weekGoalsBanner = weekGoals.length > 0 ? `
    <div class="cal-goals-banner">
      <div class="cal-goals-banner-label">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="6" cy="6" r="2.2" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="6" cy="6" r=".8" fill="currentColor"/></svg>
        Metas de esta semana
      </div>
      <div class="cal-goals-chips">
        ${weekGoals.map(g => {
    const p = computeGoalProgress(g);
    const color = g.color || 'var(--accent)';
    return `<div class="cal-goal-chip" onclick="openGoalDetailModal(${g.id})" title="${g.title} — ${p}%">
            <div class="cal-goal-chip-dot" style="background:${color}"></div>
            <span class="cal-goal-chip-title">${g.title}</span>
            <div class="cal-goal-chip-bar"><div style="width:${p}%;background:${color};height:100%;border-radius:2px;transition:width .4s ease"></div></div>
            <span class="cal-goal-chip-pct" style="color:${color}">${p}%</span>
          </div>`;
  }).join('')}
      </div>
    </div>` : '';

  let banner = document.getElementById('cal-week-goals-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'cal-week-goals-banner';
    el.insertBefore(banner, el.querySelector('.week-body'));
  }
  banner.innerHTML = weekGoalsBanner;

  // All-day events strip
  let alldayStrip = document.getElementById('cal-week-allday-strip');
  if (!alldayStrip) {
    alldayStrip = document.createElement('div');
    alldayStrip.id = 'cal-week-allday-strip';
    alldayStrip.className = 'week-allday-strip';
    el.insertBefore(alldayStrip, el.querySelector('.week-body'));
  }
  if (hasAnyAllDay) {
    alldayStrip.style.display = '';
    alldayStrip.innerHTML = `<div class="week-allday-gutter"><span>Todo el día</span></div>` +
      days.map(d => {
        const ds = dateToStr(d);
        const evts = allDayEvtsPerDay[ds] || [];
        return `<div class="week-allday-col">
          ${evts.map(ev => `<div class="allday-event" style="--evt-color:${ev.color || '#7c3aed'}" onclick="showEventPopup(${JSON.stringify(ev).replace(/"/g, '&quot;')},this)">
            ${ev.emoji || ''}${ev.title}
          </div>`).join('')}
        </div>`;
      }).join('');
  } else {
    alldayStrip.style.display = 'none';
    alldayStrip.innerHTML = '';
  }

  const gridEl = document.getElementById('week-grid');
  gridEl.innerHTML = '';

  // Time gutter: 12-hour format
  const gutter = document.createElement('div');
  gutter.className = 'time-gutter';
  for (let h = 0; h < 24; h++) {
    const lbl = document.createElement('div');
    lbl.className = 'time-slot-label';
    if (h === 0) { lbl.textContent = ''; }
    else {
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? 'pm' : 'am';
      lbl.textContent = `${h12} ${ampm}`;
    }
    gutter.appendChild(lbl);
  }
  gridEl.appendChild(gutter);

  days.forEach((d, di) => {
    const dayStr = dateToStr(d);
    const isToday = dayStr === todayTzStr;
    const col = document.createElement('div');
    col.className = `day-col-body${isToday ? ' is-today-col' : ''}`;
    col.dataset.date = dayStr;

    // Hour & half-hour lines
    for (let h = 0; h < 24; h++) {
      const line = document.createElement('div');
      line.className = 'hour-line';
      line.style.top = `${h * 60}px`;
      col.appendChild(line);
      if (h > 0) {
        const half = document.createElement('div');
        half.className = 'hour-line half';
        half.style.top = `${h * 60 - 30}px`;
        col.appendChild(half);
      }
    }

    // Now-line for today
    if (isToday) {
      col.appendChild(createNowLine(true));
    }

    // Render events with overlap layout
    const timedEvents = getEventsForDate(dayStr).filter(e => !e.allDay);
    const laid = layoutEvents(timedEvents);
    laid.forEach(({ ev, col: colIdx, totalCols }) => {
      const startM = timeToMinutes(ev.start);
      const endM = timeToMinutes(ev.end);
      const height = Math.max(endM - startM, 22);
      const evtEl = document.createElement('div');
      evtEl.className = 'cal-event';
      evtEl.style.top = `${startM}px`;
      evtEl.style.height = `${height}px`;
      // Precise column positioning for overlaps
      const colWidth = 100 / totalCols;
      evtEl.style.left = `${colIdx * colWidth + 1}%`;
      evtEl.style.width = `${colWidth - 2}%`;
      evtEl.style.setProperty('--evt-color', ev.color || '#2563eb');
      evtEl.innerHTML = `<div class="cal-event-title">${ev.emoji ? `<span class="cal-event-emoji">${ev.emoji}</span>` : ''}${ev.title}</div>
        ${height > 30 ? `<div class="cal-event-time">${fmtTime(ev.start)} – ${fmtTime(ev.end)}</div>` : ''}`;
      evtEl.addEventListener('click', (e) => { e.stopPropagation(); showEventPopup(ev, evtEl); });
      col.appendChild(evtEl);
    });

    gridEl.appendChild(col);
  });

  requestAnimationFrame(() => {
    const body = document.getElementById('week-body');
    if (body) {
      // Scroll to current time or 7am
      const userTz2 = state.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const mins = nowMinutesInTz(userTz2);
      body.scrollTop = Math.max(mins - 60, 7 * 60 - 30);
    }
  });

  startNowLineUpdater();
}

/* ---- Day view ---- */
function renderDayView() {
  const el = document.getElementById('view-day');
  el.classList.remove('hidden');
  const d = state.currentDate;
  const dayStr = dateToStr(d);
  const userTz = state.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayTzStr = dateStrInTz(userTz);
  const isToday = dayStr === todayTzStr;

  document.getElementById('day-header-info').innerHTML = `
    <div class="day-big-num" style="${isToday ? 'color:var(--accent)' : ''}">${d.getDate()}</div>
    <div class="day-name-full">${formatDate(d, { weekday: 'long', month: 'long', year: 'numeric' })}</div>`;

  // All-day events for this day
  const allDayEvts = getEventsForDate(dayStr).filter(e => e.allDay);
  const strip = document.getElementById('day-goals-strip');
  if (strip) {
    const dayGoals = state.goals.filter(g => g.status !== 'done' && g.horizon === 'day' && g.endDate === dayStr);
    let stripHtml = '';
    if (allDayEvts.length > 0) {
      stripHtml += `<div class="day-allday-strip">
              <div class="day-allday-label">Todo el día</div>
              <div class="day-allday-events">
                ${allDayEvts.map(ev => `<div class="allday-event" style="--evt-color:${ev.color || '#7c3aed'}" onclick="showEventPopup(${JSON.stringify(ev).replace(/"/g, '&quot;')},this)">${ev.emoji || ''}${ev.title}</div>`).join('')}
              </div>
            </div>`;
    }
    if (dayGoals.length > 0) {
      stripHtml += `<div class="cal-goals-banner">
              <div class="cal-goals-banner-label"><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="6" cy="6" r="2.2" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="6" cy="6" r=".8" fill="currentColor"/></svg>Metas del día</div>
              <div class="cal-goals-chips">
                ${dayGoals.slice(0, 5).map(g => {
        const p = computeGoalProgress(g); const color = g.color || 'var(--accent)';
        return `<div class="cal-goal-chip cal-goal-chip-ending" onclick="openGoalDetailModal(${g.id})">
                  <div class="cal-goal-chip-dot" style="background:${color}"></div>
                  <span class="cal-goal-chip-title">${g.title}</span>
                  <span class="cal-goal-chip-tag">Vence hoy</span>
                  <div class="cal-goal-chip-bar"><div style="width:${p}%;background:${color};height:100%;border-radius:2px"></div></div>
                  <span class="cal-goal-chip-pct" style="color:${color}">${p}%</span></div>`;
      }).join('')}
              </div></div>`;
    }
    strip.innerHTML = stripHtml;
  }

  const inner = document.getElementById('day-scroll-inner');
  inner.innerHTML = '';

  // Gutter with 12-hour format
  const gutter = document.createElement('div');
  gutter.className = 'time-gutter';
  for (let h = 0; h < 24; h++) {
    const lbl = document.createElement('div');
    lbl.className = 'time-slot-label';
    if (h === 0) { lbl.textContent = ''; }
    else { const h12 = h % 12 || 12; const ampm = h >= 12 ? 'pm' : 'am'; lbl.textContent = `${h12} ${ampm}`; }
    gutter.appendChild(lbl);
  }
  inner.appendChild(gutter);

  const evtsCol = document.createElement('div');
  evtsCol.className = 'day-events-col';
  evtsCol.style.minHeight = '1440px';
  evtsCol.style.position = 'relative';

  for (let h = 0; h < 24; h++) {
    const line = document.createElement('div');
    line.className = 'hour-line';
    line.style.top = `${h * 60}px`;
    evtsCol.appendChild(line);
    if (h > 0) {
      const half = document.createElement('div');
      half.className = 'hour-line half';
      half.style.top = `${h * 60 - 30}px`;
      evtsCol.appendChild(half);
    }
  }

  if (isToday) evtsCol.appendChild(createNowLine(true));

  // Render timed events with overlap layout
  const timedEvents = getEventsForDate(dayStr).filter(e => !e.allDay);
  const laid = layoutEvents(timedEvents);
  laid.forEach(({ ev, col: colIdx, totalCols }) => {
    const startM = timeToMinutes(ev.start);
    const endM = timeToMinutes(ev.end);
    const height = Math.max(endM - startM, 24);
    const evtEl = document.createElement('div');
    evtEl.className = 'cal-event';
    evtEl.style.top = `${startM}px`;
    evtEl.style.height = `${height}px`;
    const colWidth = 100 / totalCols;
    evtEl.style.left = `${colIdx * colWidth + 1}%`;
    evtEl.style.width = `${colWidth - 2}%`;
    evtEl.style.setProperty('--evt-color', ev.color || '#2563eb');
    evtEl.innerHTML = `<div class="cal-event-title">${ev.emoji ? `<span class="cal-event-emoji">${ev.emoji}</span>` : ''}${ev.title}</div>
      <div class="cal-event-time">${fmtTime(ev.start)} – ${fmtTime(ev.end)}</div>
      ${ev.location ? `<div class="cal-event-time">📍 ${ev.location}</div>` : ''}`;
    evtEl.addEventListener('click', (e) => { e.stopPropagation(); showEventPopup(ev, evtEl); });
    evtsCol.appendChild(evtEl);
  });

  inner.appendChild(evtsCol);
  requestAnimationFrame(() => {
    const body = document.getElementById('day-body');
    if (body) {
      const mins = isToday ? nowMinutesInTz(userTz) : 7 * 60;
      body.scrollTop = Math.max(mins - 60, 7 * 60 - 30);
    }
  });

  startNowLineUpdater();
}

/* ---- Month view ---- */
function renderMonthView() {
  const el = document.getElementById('view-month');
  el.classList.remove('hidden');
  const DAYS_SHORT = getDaysShort();
  const d = state.currentDate;
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const today = new Date();
  const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  // Goals relevant specifically to THIS month:
  // ONLY goals with horizon 'month' whose horizonValue matches this month (YYYY-MM)
  const monthGoals = state.goals.filter(g => {
    if (g.status === 'done') return false;
    return g.horizon === 'month' && g.horizonValue === monthStr;
  }).slice(0, 4);

  document.getElementById('month-dow-header').innerHTML = DAYS_SHORT.map(d => `<div class="month-dow">${d}</div>`).join('');

  // Month goals strip
  let monthGoalsBanner = document.getElementById('cal-month-goals-banner');
  if (!monthGoalsBanner) {
    monthGoalsBanner = document.createElement('div');
    monthGoalsBanner.id = 'cal-month-goals-banner';
    el.insertBefore(monthGoalsBanner, el.querySelector('.month-dow-header'));
  }
  if (monthGoals.length > 0) {
    monthGoalsBanner.innerHTML = `
        <div class="cal-goals-banner">
          <div class="cal-goals-banner-label">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="6" cy="6" r="2.2" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="6" cy="6" r=".8" fill="currentColor"/></svg>
            Metas de este mes
          </div>
          <div class="cal-goals-chips">
            ${monthGoals.map(g => {
      const p = computeGoalProgress(g);
      const color = g.color || 'var(--accent)';
      return `<div class="cal-goal-chip" onclick="openGoalDetailModal(${g.id})" title="${g.title} — ${p}%">
                <div class="cal-goal-chip-dot" style="background:${color}"></div>
                <span class="cal-goal-chip-title">${g.title}</span>
                <div class="cal-goal-chip-bar">
                  <div style="width:${p}%;background:${color};height:100%;border-radius:2px;transition:width .4s ease"></div>
                </div>
                <span class="cal-goal-chip-pct" style="color:${color}">${p}%</span>
              </div>`;
    }).join('')}
          </div>
        </div>`;
  } else {
    monthGoalsBanner.innerHTML = '';
  }

  const gridEl = document.getElementById('month-grid');
  gridEl.innerHTML = '';

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;
  const startDate = new Date(firstDay);
  startDate.setDate(1 - startDay);

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const isOther = cellDate.getMonth() !== d.getMonth();
    const isToday = isSameDay(cellDate, today);
    const dateStr = dateToStr(cellDate);
    const dayEvents = getEventsForDate(dateStr);

    // Goals with horizon 'day' ending on this specific day
    const endingGoals = state.goals.filter(g => g.endDate === dateStr && g.status !== 'done' && g.horizon === 'day');

    const cell = document.createElement('div');
    cell.className = `month-cell${isOther ? ' other-month' : ''}${isToday ? ' today' : ''}`;
    const extraEvts = dayEvents.length > 2 ? dayEvents.length - 2 : 0;
    const extraGoals = endingGoals.length > 1 ? endingGoals.length - 1 : 0;
    cell.innerHTML = `<div class="month-day-num">${cellDate.getDate()}</div>
      ${dayEvents.slice(0, 2).map(ev => `<div class="month-evt-dot" style="--evt-color:${ev.color || '#2563eb'}">${ev.emoji ? `<span>${ev.emoji}</span>` : ''}<span>${ev.title}</span></div>`).join('')}
      ${endingGoals.slice(0, 1).map(g => `<div class="month-goal-tag" style="border-left:2px solid ${g.color || 'var(--accent)'}" onclick="event.stopPropagation();openGoalDetailModal(${g.id})">
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="5" cy="5" r="1.5" fill="currentColor"/></svg>
        ${g.title}
      </div>`).join('')}
      ${(extraEvts + extraGoals) > 0 ? `<div class="month-more-label">+${extraEvts + extraGoals} más</div>` : ''}`;
    cell.addEventListener('click', () => {
      state.currentDate = new Date(cellDate);
      state.calView = 'day';
      document.querySelectorAll('.view-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('onclick') && b.getAttribute('onclick').includes("'day'"));
      });
      renderCalendar();
    });
    gridEl.appendChild(cell);
  }
}


/* ---- Year view ---- */
function renderYearView() {
  const el = document.getElementById('view-year');
  el.classList.remove('hidden');
  const d = state.currentDate;
  const year = d.getFullYear();
  const today = new Date();
  const MONTHS = getMonths();
  const DAYS_MINI = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Goals relevant specifically to THIS year:
  // ONLY goals with horizon 'year' or 'longterm' whose horizonValue matches this year.
  const yearGoals = state.goals.filter(g => {
    if (g.status === 'done' && g.horizonValue !== String(year)) return false;
    if (g.horizon === 'year' && g.horizonValue === String(year)) return true;
    if (g.horizon === 'longterm' && g.horizonValue === String(year)) return true;
    return false;
  });

  const goalsPanelEl = document.getElementById('year-goals-panel');
  if (goalsPanelEl) {
    if (yearGoals.length > 0) {
      const total = yearGoals.length;
      const done = yearGoals.filter(g => g.status === 'done').length;
      const inProg = yearGoals.filter(g => g.status === 'progress').length;
      goalsPanelEl.innerHTML = `
            <div class="year-goals-header">
              <div class="year-goals-title">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>
                Metas de ${year}
                <span class="year-goals-count">${total} metas · ${done} completadas · ${inProg} en progreso</span>
              </div>
            </div>
            <div class="year-goals-list">
              ${yearGoals.map(g => {
        const p = computeGoalProgress(g);
        const color = g.color || 'var(--accent)';
        const tl = timeLeftLabel(g);
        return `<div class="year-goal-item" onclick="openGoalDetailModal(${g.id})" title="${g.title}">
                  <div class="year-goal-dot" style="background:${color}"></div>
                  <div class="year-goal-info">
                    <div class="year-goal-name">${g.title}</div>
                    <div class="year-goal-progress-track">
                      <div class="year-goal-bar-wrap">
                        <div class="year-goal-bar-fill" style="width:${p}%;background:${color}"></div>
                      </div>
                      <span class="year-goal-pct" style="color:${color}">${p}%</span>
                      ${tl && tl !== '¡Vencida!' ? `<span class="year-goal-timeleft">${tl}</span>` : ''}
                      ${tl === '¡Vencida!' ? `<span class="year-goal-timeleft overdue">⚠ Vencida</span>` : ''}
                    </div>
                  </div>
                </div>`;
      }).join('')}
            </div>`;
    } else {
      goalsPanelEl.innerHTML = `<div class="year-goals-empty">Sin metas para ${year}</div>`;
    }
  }

  // 12-month mini calendar grid
  const gridEl = document.getElementById('year-grid');
  gridEl.innerHTML = '';

  for (let mo = 0; mo < 12; mo++) {
    const firstDay = new Date(year, mo, 1);
    const monthStr = `${year}-${String(mo + 1).padStart(2, '0')}`;
    const isCurrentMonth = (today.getFullYear() === year && today.getMonth() === mo);

    // Events count per day in this month (including recurring)
    const monthFrom = new Date(year, mo, 1); const monthTo = new Date(year, mo + 1, 0);
    const monthEventDates = getEventDatesInRange(monthFrom, monthTo);
    const monthEvts = {};
    monthEventDates.forEach(ds => { if (ds.startsWith(monthStr)) monthEvts[ds] = (monthEvts[ds] || 0) + 1; });
    // Goals with horizon 'month' for this specific month (shown as dots in the mini calendar)
    const monthGoalDays = {};
    state.goals.filter(g => g.horizon === 'month' && g.horizonValue === monthStr && g.status !== 'done').forEach(g => {
      const dotKey = g.endDate || `${monthStr}-01`;
      monthGoalDays[dotKey] = (monthGoalDays[dotKey] || []).concat(g.color || 'var(--accent)');
    });

    const moCard = document.createElement('div');
    moCard.className = `year-month-card${isCurrentMonth ? ' current-month' : ''}`;

    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const daysInMonth = new Date(year, mo + 1, 0).getDate();

    const cellsHtml = [];
    // Day headers
    DAYS_MINI.forEach(dn => {
      cellsHtml.push(`<div class="ym-dow">${dn}</div>`);
    });
    // Empty leading cells
    for (let i = 0; i < startDow; i++) cellsHtml.push('<div class="ym-cell empty"></div>');
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${year}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = (today.getFullYear() === year && today.getMonth() === mo && today.getDate() === day);
      const hasEvt = monthEvts[ds] > 0;
      const goalColors = monthGoalDays[ds] || [];
      cellsHtml.push(`<div class="ym-cell${isToday ? ' today' : ''}${hasEvt ? ' has-evt' : ''}"
              onclick="goToDay(${year},${mo},${day})" title="${ds}">
              <span>${day}</span>
              ${goalColors.length > 0 ? `<div class="ym-goal-dot" style="background:${goalColors[0]}"></div>` : ''}
            </div>`);
    }

    moCard.innerHTML = `
          <div class="year-month-title${isCurrentMonth ? ' active' : ''}" onclick="goToMonth(${year},${mo})">${MONTHS[mo]}</div>
          <div class="year-month-grid">${cellsHtml.join('')}</div>`;
    gridEl.appendChild(moCard);
  }
}

function goToDay(year, month, day) {
  state.currentDate = new Date(year, month, day);
  state.calView = 'day';
  document.querySelectorAll('.view-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick') && b.getAttribute('onclick').includes("'day'"));
  });
  renderCalendar();
}

function goToMonth(year, month) {
  state.currentDate = new Date(year, month, 1);
  state.calView = 'month';
  document.querySelectorAll('.view-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick') && b.getAttribute('onclick').includes("'month'"));
  });
  renderCalendar();
}

let nowLineInterval = null;
function startNowLineUpdater() {
  if (nowLineInterval) clearInterval(nowLineInterval);
  function _tick() {
    // Update user's own now-line (uses user timezone)
    const userTz = state.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userSecs = nowSecondsInTz(userTz);
    const userPx = userSecs / 60;  // 1px per minute, fractions for seconds
    const userDateStr = dateStrInTz(userTz);

    document.querySelectorAll('.now-line[data-tz-own]').forEach(el => {
      el.style.top = `${userPx}px`;
      // Update inline time label
      const label = el.querySelector('.now-line-time');
      if (label) {
        const t = nowInTz(userTz);
        const h12 = t.h % 12 || 12;
        const ampm = t.h >= 12 ? 'pm' : 'am';
        label.textContent = `${h12}:${String(t.m).padStart(2, '0')} ${ampm}`;
      }
    });

    // Update shared-calendar now-lines (each has its person's timezone)
    document.querySelectorAll('.now-line[data-tz]').forEach(el => {
      const tz = el.dataset.tz;
      const secs = nowSecondsInTz(tz);
      el.style.top = `${secs / 60}px`;
      const label = el.querySelector('.now-line-time');
      if (label) {
        const t = nowInTz(tz);
        const h12 = t.h % 12 || 12;
        const ampm = t.h >= 12 ? 'pm' : 'am';
        label.textContent = `${h12}:${String(t.m).padStart(2, '0')} ${ampm}`;
      }
    });
  }
  _tick();
  nowLineInterval = setInterval(_tick, 1000);
}

/** Create a now-line element for the user's own calendar */
function createNowLine(ownCalendar = true, personTz = null) {
  const tz = ownCalendar ? (state.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone) : personTz;
  const secs = nowSecondsInTz(tz);
  const t = nowInTz(tz);
  const h12 = t.h % 12 || 12;
  const ampm = t.h >= 12 ? 'pm' : 'am';

  const el = document.createElement('div');
  el.className = 'now-line';
  el.style.top = `${secs / 60}px`;
  if (ownCalendar) { el.dataset.tzOwn = '1'; }
  else { el.dataset.tz = tz; }
  el.innerHTML = `<div class="now-line-dot"></div><span class="now-line-time">${h12}:${String(t.m).padStart(2, '0')} ${ampm}</span>`;
  return el;
}

/* ============================================================
   EVENT POPUP
   ============================================================ */
let eventPopupEl = null;

function showEventPopup(evt, anchorEl) {
  removeEventPopup();
  const popup = document.createElement('div');
  popup.className = 'event-popup';
  popup.id = 'event-popup';
  const color = evt.color || '#2563eb';
  const emoji = evt.emoji || '📅';
  const rec = evt.recurrence || { type: 'none' };
  const recLabel = { none: '', daily: '🔁 Diario', weekly: '🔁 Semanal', monthly: '🔁 Mensual', yearly: '🔁 Anual' }[rec.type] || '';
  const sharedPeople = (evt.sharedWith || []).map(id => state.people.find(p => p.id === id)).filter(Boolean);
  const times = evt.times || [{ start: evt.start, end: evt.end }];

  popup.innerHTML = `
    <div class="event-popup-color-bar" style="background:${color}"></div>
    <div class="event-popup-header">
      <span class="event-popup-emoji">${emoji}</span>
      <div class="event-popup-title">${evt.title}</div>
    </div>
    <div class="event-popup-times">
      ${times.map(s => `<div class="event-popup-time">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 3.5v3l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        ${fmtTime(s.start)} – ${fmtTime(s.end)}
      </div>`).join('')}
    </div>
    ${evt.location ? `<div class="event-popup-time">📍 ${evt.location}</div>` : ''}
    ${recLabel ? `<div class="event-popup-time">${recLabel}</div>` : ''}
    ${evt.desc ? `<div class="event-popup-desc">${evt.desc}</div>` : ''}
    ${sharedPeople.length > 0 ? `<div class="event-popup-shared">
      ${sharedPeople.map(p => `<span class="event-popup-avatar" style="background:${p.color}22;color:${p.color}" title="${p.name}">${p.initials}</span>`).join('')}
      <span style="font-size:11px;color:var(--text-tertiary)">Compartido</span>
    </div>` : ''}
    <div class="event-popup-actions">
      <button class="btn-small" onclick="editEvent(${evt.id})">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M9 1.5L12.5 5 4.5 13H1v-3.5L9 1.5z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Editar
      </button>
      <button class="btn-small danger" onclick="deleteEvent(${evt.id})">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M3 4l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        Eliminar
      </button>
      <button class="btn-close-modal" onclick="removeEventPopup()" style="margin-left:auto" aria-label="Cerrar">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </button>
    </div>`;

  document.body.appendChild(popup);
  eventPopupEl = popup;

  const rect = anchorEl.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = rect.right + 8;
  let top = rect.top;
  if (left + 300 > vw) left = rect.left - 308;
  if (left < 8) left = 8;
  if (top + 240 > vh) top = vh - 260;
  if (top < 8) top = 8;
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;

  requestAnimationFrame(() => popup.classList.add('show'));
  setTimeout(() => document.addEventListener('click', outsidePopupClose, { once: true }), 50);
}

function outsidePopupClose(e) {
  if (eventPopupEl && !eventPopupEl.contains(e.target)) removeEventPopup();
}

function removeEventPopup() {
  if (eventPopupEl) { eventPopupEl.remove(); eventPopupEl = null; }
}

function deleteEvent(id) {
  state.events = state.events.filter(e => e.id !== id);
  removeEventPopup();
  renderCalendar();
  renderMiniCalendar();
  showToast(t('toast.eventDeleted'), '🗑️');
}

/* ============================================================
   GOALS — Sistema sofisticado con hitos y progreso automático
   ============================================================ */

/* ── Calcular progreso automáticamente ── */
function computeGoalProgress(g) {
  if (g.status === 'done') return 100;
  if (g.status === 'pending') return 0;

  const milestones = g.milestones || [];
  const total = milestones.length;

  // Si no hay hitos, usar progreso temporal si hay fechas
  if (total === 0) {
    if (!g.startDate || !g.endDate) return 0;
    const start = new Date(g.startDate).getTime();
    const end = new Date(g.endDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 95; // no completada pero tiempo cumplido
    const pct = Math.round(((now - start) / (end - start)) * 100);
    return Math.min(pct, 95);
  }

  // Progreso por hitos completados (peso: 70%)
  const doneMilestones = milestones.filter(m => m.done).length;
  const milestonePct = (doneMilestones / total) * 70;

  // Progreso temporal (peso: 30%) — cuánto tiempo transcurrió
  let timePct = 0;
  if (g.startDate && g.endDate) {
    const start = new Date(g.startDate).getTime();
    const end = new Date(g.endDate).getTime();
    const now = Date.now();
    if (now > start && end > start) {
      timePct = Math.min(((now - start) / (end - start)) * 30, 30);
    }
  }

  return Math.min(Math.round(milestonePct + timePct), 99);
}

/* ── Etiqueta de horizonte ── */
function horizonLabel(g) {
  const MONTHS_SHORT = getMonthsShort();
  switch (g.horizon) {
    case 'day':
      if (g.endDate) {
        const d = new Date(g.endDate + 'T12:00:00');
        return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
      }
      return 'Un día específico';
    case 'week':
      if (g.endDate) {
        const d = new Date(g.endDate + 'T12:00:00');
        const wk = getWeekDates(d);
        return `Semana del ${wk[0].getDate()} al ${wk[6].getDate()} ${MONTHS_SHORT[wk[6].getMonth()]}`;
      }
      return 'Una semana';
    case 'month':
      if (g.horizonValue) {
        const [y, m] = g.horizonValue.split('-');
        return `${MONTHS_SHORT[parseInt(m) - 1]} ${y}`;
      }
      return 'Un mes';
    case 'year':
      return g.horizonValue ? `Año ${g.horizonValue}` : 'Un año';
    case 'longterm':
      return g.horizonValue ? `A largo plazo · ${g.horizonValue}` : 'A largo plazo';
    case 'open':
      return 'Sin fecha límite';
    default:
      return '—';
  }
}

/* ── Icono de categoría ── */
function categoryIcon(cat) {
  const icons = {
    education: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 5l5-3 5 3-5 3-5-3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/><path d="M4 6.5v3l2 1 2-1V6.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M11 5v2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    finance: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M1 6h10" stroke="currentColor" stroke-width="1.2"/><circle cx="6" cy="8" r="1" fill="currentColor"/></svg>`,
    health: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 10S1 7 1 4a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 3-5 6-5 6z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>`,
    learning: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v8H2z" stroke="currentColor" stroke-width="1.2" fill="none" rx="1"/><path d="M4 5h4M4 7h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    personal: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M2 10c0-2.5 1.8-4 4-4s4 1.5 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`,
    career: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="4" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M4 4V3a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.2"/></svg>`,
    travel: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 10l4-8 4 8-4-2-4 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/></svg>`,
    social: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="4" cy="4.5" r="1.8" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="8.5" cy="4" r="1.5" stroke="currentColor" stroke-width="1.1" fill="none"/><path d="M1 9.5c0-2 1.3-3 3-3s3 1 3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M8.5 9c0-1.5-.8-2.5-2-3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none"/></svg>`,
  };
  return icons[cat] || icons.personal;
}
function categoryLabel(cat) {
  const labels = { education: 'Educación', finance: 'Finanzas', health: 'Salud', learning: 'Aprendizaje', personal: 'Personal', career: 'Carrera', travel: 'Viajes', social: 'Social' };
  return labels[cat] || 'Personal';
}

/* ── Tiempo restante ── */
function timeLeftLabel(g) {
  if (!g.endDate || g.horizon === 'open') return null;
  const end = new Date(g.endDate + 'T23:59:59');
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) return g.status === 'done' ? null : '¡Vencida!';
  const days = Math.ceil(diff / 86400000);
  if (days === 1) return 'Vence mañana';
  if (days <= 7) return `${days} días restantes`;
  if (days <= 30) return `${Math.ceil(days / 7)} semanas restantes`;
  if (days <= 365) return `${Math.ceil(days / 30)} meses restantes`;
  return `${Math.ceil(days / 365)} años restantes`;
}

/* ── Renderizar pantalla de metas ── */
function renderGoals() {
  const body = document.getElementById('goals-body');
  const filter = state.goalFilter;
  let filtered = filter === 'all' ? state.goals : state.goals.filter(g => g.status === filter);

  if (filtered.length === 0) {
    body.innerHTML = `<div class="goals-empty">
      <div class="goals-empty-icon">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke="var(--text-tertiary)" stroke-width="1.5" fill="none"/><circle cx="14" cy="14" r="5" stroke="var(--text-tertiary)" stroke-width="1.5" fill="none"/><circle cx="14" cy="14" r="1.5" fill="var(--text-tertiary)"/></svg>
      </div>
      <h3>${t('goals.noGoals')}</h3>
      <p>${t('goals.noGoalsMsg')}</p>
      ${filter === 'all' ? `<button class="btn-primary" onclick="openCreateGoalModal()" style="margin-top:8px">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Nueva meta
      </button>` : ''}
    </div>`;
    return;
  }

  const statusLabel = { progress: 'En progreso', done: 'Completada', pending: 'Pendiente' };
  const statusBadge = { progress: 'badge-progress', done: 'badge-done', pending: 'badge-pending' };
  const priorityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' };

  // Stats summary
  const total = state.goals.length;
  const done = state.goals.filter(g => g.status === 'done').length;
  const inProgress = state.goals.filter(g => g.status === 'progress').length;
  const avgProgress = state.goals.length ? Math.round(state.goals.reduce((acc, g) => acc + computeGoalProgress(g), 0) / state.goals.length) : 0;

  const statsHtml = filter === 'all' ? `
    <div class="goals-stats-bar">
      <div class="gstat">
        <div class="gstat-num">${total}</div>
        <div class="gstat-lbl">Total</div>
      </div>
      <div class="gstat-divider"></div>
      <div class="gstat">
        <div class="gstat-num" style="color:var(--orange)">${inProgress}</div>
        <div class="gstat-lbl">En progreso</div>
      </div>
      <div class="gstat-divider"></div>
      <div class="gstat">
        <div class="gstat-num" style="color:var(--accent-text, var(--accent))">${done}</div>
        <div class="gstat-lbl">Completadas</div>
      </div>
      <div class="gstat-divider"></div>
      <div class="gstat">
        <div class="gstat-num">${avgProgress}%</div>
        <div class="gstat-lbl">Promedio</div>
      </div>
    </div>` : '';

  body.innerHTML = statsHtml + filtered.map(g => {
    const progress = computeGoalProgress(g);
    const milestones = g.milestones || [];
    const doneMilestones = milestones.filter(m => m.done).length;
    const timeLeft = timeLeftLabel(g);
    const color = g.color || 'var(--accent)';
    const isOverdue = timeLeft === '¡Vencida!';

    // Milestone preview (max 3)
    const msPreview = milestones.slice(0, 4).map(m => `
          <div class="goal-milestone-item ${m.done ? 'done' : ''}" onclick="toggleMilestone(${g.id},'${m.id}',event)">
            <div class="ms-check">${m.done ? `<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}</div>
            <span class="ms-text">${m.text}</span>
          </div>`).join('');

    const hasMoreMs = milestones.length > 4;

    return `
    <div class="goal-card" data-id="${g.id}" style="--goal-color:${color}">
      <div class="goal-color-strip" style="background:${color}"></div>
      <div class="goal-card-inner">
        <div class="goal-card-top">
          <div class="goal-top-left">
            <span class="goal-status-badge ${statusBadge[g.status]}">${statusLabel[g.status]}</span>
            <span class="goal-category-chip">
              ${categoryIcon(g.category || 'personal')}
              ${categoryLabel(g.category || 'personal')}
            </span>
            ${isOverdue ? `<span class="goal-overdue-chip">⚠ Vencida</span>` : ''}
          </div>
          <div class="goal-actions">
            <button class="goal-action-btn complete" onclick="cycleGoalStatus(${g.id},event)" title="${g.status === 'done' ? 'Reabrir' : 'Completar'}">
              <svg viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 6.5l2 2 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="btn-label">${g.status === 'done' ? 'Reabrir' : 'Completar'}</span>
            </button>
            <button class="goal-action-btn" onclick="editGoal(${g.id},event)" title="Editar">
              <svg viewBox="0 0 13 13" fill="none"><path d="M8.5 2l2.5 2.5-6 6H2.5V8L8.5 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
              <span class="btn-label">Editar</span>
            </button>
            <button class="goal-action-btn danger" onclick="deleteGoal(${g.id},event)" title="Eliminar">
              <svg viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 5.5v4M7.5 5.5v4M3 3.5l.5 7h6l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="btn-label">Eliminar</span>
            </button>
          </div>
        </div>

        <div class="goal-info">
          <div class="goal-title">${g.title}</div>
          ${g.desc ? `<div class="goal-desc">${g.desc}</div>` : ''}
        </div>

        ${g.sharedWith && g.sharedWith.length > 0 ? (() => {
        const sharedPeople = g.sharedWith.map(id => state.people.find(p => p.id === id)).filter(Boolean);
        return sharedPeople.length > 0 ? `<div class="goal-shared-with">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="4.5" cy="4" r="1.8" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M1 10c0-2 1.5-3 3.5-3s3.5 1 3.5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><circle cx="9" cy="4" r="1.5" stroke="currentColor" stroke-width="1.1" fill="none"/><path d="M9 9c0-1.4-.7-2.3-2-2.8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none"/></svg>
              Compartida con
              ${sharedPeople.map(p => `<span class="goal-shared-avatar" style="background:${p.color}22;color:${p.color}" title="${p.name}">${p.initials}</span>`).join('')}
            </div>` : '';
      })() : ''}
        <div class="goal-meta">
          <div class="goal-meta-item">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M1 5h10" stroke="currentColor" stroke-width="1.2"/><path d="M4 1v2M8 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            ${horizonLabel(g)}
          </div>
          <div class="goal-meta-item">
            <div class="goal-priority-dot priority-${g.priority}"></div>
            Prioridad ${priorityLabel[g.priority]}
          </div>
          ${timeLeft && !isOverdue ? `<div class="goal-meta-item" style="color:var(--text-secondary)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 3.5v3l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            ${timeLeft}
          </div>` : ''}
        </div>

        ${g.status !== 'pending' ? `
        <div class="goal-progress-section">
          <div class="goal-progress-header">
            <span class="goal-progress-label">Progreso automático</span>
            <span class="goal-progress-pct" style="color:${color}">${progress}%</span>
          </div>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width:${progress}%;background:${color}"></div>
          </div>
          ${milestones.length > 0 ? `<div class="goal-progress-sub">${doneMilestones} de ${milestones.length} hitos completados</div>` : ''}
        </div>` : ''}

        ${milestones.length > 0 ? `
        <div class="goal-milestones">
          <div class="goal-milestones-header">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Hitos
          </div>
          <div class="goal-milestones-list">
            ${msPreview}
            ${hasMoreMs ? `<div class="goal-ms-more" onclick="openGoalDetail(${g.id})">+${milestones.length - 4} más hitos</div>` : ''}
          </div>
        </div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function filterGoals(filter, btn) {
  state.goalFilter = filter;
  document.querySelectorAll('#goals-filter-tabs .filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGoals();
}

/* ── Toggle milestone ── */
function toggleMilestone(goalId, milestoneId, e) {
  e && e.stopPropagation();
  const g = state.goals.find(g => g.id === goalId);
  if (!g) return;
  const m = (g.milestones || []).find(m => m.id === milestoneId);
  if (!m) return;
  m.done = !m.done;
  // Auto-update status if all milestones done
  if (g.milestones.every(ms => ms.done) && g.milestones.length > 0) {
    g.status = 'done';
    showToast('¡Meta completada automáticamente! 🎉', '✅');
  } else if (g.status !== 'done') {
    g.status = 'progress';
  }
  renderGoals();
  if (state.currentScreen === 'calendar') renderCalendar();
}

/* ── Detail view (hitos completos en un panel) ── */
function openGoalDetail(id, e) {
  e && e.stopPropagation();
  const g = state.goals.find(g => g.id === id);
  if (!g) return;
  // For now jump to edit which shows all milestones
  openEditGoalModal(id);
}

/* ── Modal de detalle de meta (desde calendario) ── */
function openGoalDetailModal(id, e) {
  e && e.stopPropagation && e.stopPropagation();
  const g = state.goals.find(g => g.id === id);
  if (!g) return;

  const color = g.color || 'var(--accent)';
  const progress = computeGoalProgress(g);
  const milestones = g.milestones || [];
  const doneMilestones = milestones.filter(m => m.done).length;
  const timeLeft = timeLeftLabel(g);
  const sharedPeople = (g.sharedWith || []).map(pid => state.people.find(p => p.id === pid)).filter(Boolean);
  const isShared = sharedPeople.length > 0;
  const statusLabel = { progress: 'En progreso', done: 'Completada', pending: 'Pendiente' };
  const priorityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' };

  // Recordatorios vinculados a esta meta
  const goalReminders = (state.reminders || []).filter(r => r.goalId === g.id);

  let overlay = document.getElementById('modal-goal-detail');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-goal-detail';
    overlay.className = 'modal-overlay goal-detail-overlay';
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeGoalDetailModal(); });
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="modal goal-detail-modal" role="dialog" aria-modal="true">
      <div class="goal-detail-color-band" style="background:${color}"></div>

      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
          <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></div>
          <span class="modal-title" style="flex:1;min-width:0">${g.title}</span>
          <span class="gd-ownership-badge ${isShared ? 'shared' : 'own'}">
            ${isShared
      ? `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="4.5" cy="4" r="1.8" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M1 10c0-2 1.5-3 3.5-3s3.5 1 3.5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><circle cx="9" cy="4" r="1.5" stroke="currentColor" stroke-width="1.1" fill="none"/><path d="M9 9c0-1.4-.7-2.3-2-2.8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none"/></svg> Compartida`
      : `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M2 11c0-2.5 1.8-4 4-4s4 1.5 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg> Propia`}
          </span>
        </div>
        <button class="btn-close-modal" onclick="closeGoalDetailModal()" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="modal-body goal-detail-body">

        <!-- Estado y metadatos -->
        <div class="gd-section">
          <div class="gd-section-label"><span class="gd-section-label-left">📊 Estado</span></div>
          <div class="gd-section-body" style="flex-direction:row;flex-wrap:wrap;gap:6px">
            <span class="goal-status-badge ${g.status === 'progress' ? 'badge-progress' : g.status === 'done' ? 'badge-done' : 'badge-pending'}">${statusLabel[g.status]}</span>
            <span class="goal-category-chip">${categoryIcon(g.category || 'personal')} ${categoryLabel(g.category || 'personal')}</span>
            <span style="font-size:12px;color:var(--text-secondary);padding:3px 8px;background:var(--bg-surface2);border-radius:99px">Prioridad ${priorityLabel[g.priority || 'medium']}</span>
            ${timeLeft ? `<span style="font-size:12px;color:${timeLeft === '¡Vencida!' ? 'var(--red)' : 'var(--text-secondary)'};padding:3px 8px;background:var(--bg-surface2);border-radius:99px">${timeLeft === '¡Vencida!' ? '⚠ Vencida' : timeLeft}</span>` : ''}
          </div>
        </div>

        <!-- Horizonte / fechas -->
        <div class="gd-section">
          <div class="gd-section-label"><span class="gd-section-label-left">📅 Horizonte</span></div>
          <div class="gd-section-body" style="font-size:13px;color:var(--text-primary)">
            ${horizonLabel(g)}
            ${g.startDate && g.endDate ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${g.startDate} → ${g.endDate}</div>` : ''}
          </div>
        </div>

        ${g.desc ? `
        <div class="gd-section">
          <div class="gd-section-label"><span class="gd-section-label-left">📝 Descripción</span></div>
          <div class="gd-section-body" style="font-size:13px;color:var(--text-primary);line-height:1.6">${g.desc}</div>
        </div>` : ''}

        <!-- Progreso -->
        ${g.status !== 'pending' ? `
        <div class="gd-section">
          <div class="gd-section-label"><span class="gd-section-label-left">📈 Progreso</span></div>
          <div class="gd-section-body">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--text-secondary)">
              <span>${milestones.length > 0 ? `${doneMilestones} de ${milestones.length} hitos` : 'Progreso automático'}</span>
              <strong style="color:${color}">${progress}%</strong>
            </div>
            <div style="height:6px;background:var(--border);border-radius:6px;overflow:hidden">
              <div style="width:${progress}%;height:100%;background:${color};border-radius:6px;transition:width .5s ease"></div>
            </div>
          </div>
        </div>` : ''}

        <!-- Hitos -->
        ${milestones.length > 0 ? `
        <div class="gd-section">
          <div class="gd-section-label"><span class="gd-section-label-left">✅ Hitos (${doneMilestones}/${milestones.length})</span></div>
          <div class="gd-section-body">
            ${milestones.map(m => `
            <div class="gd-milestone-item ${m.done ? 'done' : ''}">
              <div class="ms-check" style="background:${m.done ? color : 'transparent'};border:1.5px solid ${m.done ? color : 'var(--border)'};width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${m.done ? `<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
              </div>
              <span>${m.text}</span>
            </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Compartida con -->
        ${isShared ? `
        <div class="gd-section">
          <div class="gd-section-label"><span class="gd-section-label-left">👥 Compartida con</span></div>
          <div class="gd-section-body" style="flex-direction:row;flex-wrap:wrap;gap:6px">
            ${sharedPeople.map(p => `<span style="display:flex;align-items:center;gap:5px;background:${p.color}22;color:${p.color};padding:4px 10px;border-radius:99px;font-size:12px;font-weight:500"><span>${p.initials}</span>${p.name}</span>`).join('')}
          </div>
        </div>` : ''}

        <!-- Recordatorios vinculados -->
        <div class="gd-section">
          <div class="gd-section-label">
            <span class="gd-section-label-left">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1a4 4 0 014 4v2l1 2H1l1-2V5a4 4 0 014-4z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/><path d="M5 10a1 1 0 002 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              Recordatorios (${goalReminders.length})
            </span>
            <button class="evp-add-btn" onclick="closeGoalDetailModal();openCreateReminderModal(null,null,${g.id})" style="font-size:11px">+ Nuevo</button>
          </div>
          <div class="gd-section-body" id="gd-reminders-body">
            ${_renderGoalDetailReminders(g.id)}
          </div>
        </div>

      </div>

      <div class="modal-footer" style="justify-content:space-between">
        <div style="display:flex;gap:8px">
          ${isShared ? `
          <button class="btn-secondary" style="color:var(--orange);border-color:var(--orange)" onclick="unlinkFromGoal(${g.id})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 9l-3 3M9 5l3-3M5.5 8.5l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 6a2 2 0 012-2h2M8 10h2a2 2 0 002-2V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            Desvincularme
          </button>` : `
          <button class="btn-secondary danger" onclick="deleteGoalFromDetail(${g.id})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M3 4l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
            Eliminar meta
          </button>`}
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" onclick="closeGoalDetailModal()">Cerrar</button>
          <button class="btn-primary" onclick="closeGoalDetailModal();editGoal(${g.id},{stopPropagation:()=>{}})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 1.5L12.5 5 4.5 13H1v-3.5L9 1.5z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Editar meta
          </button>
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => overlay.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function _renderGoalDetailReminders(goalId) {
  const goalReminders = (state.reminders || []).filter(r => r.goalId === goalId);
  if (goalReminders.length === 0) {
    return `<div style="font-size:12px;color:var(--text-tertiary);font-style:italic">Sin recordatorios vinculados</div>`;
  }
  return goalReminders.map(r => {
    const fromPerson = r.fromUserId !== 'me' ? state.people.find(p => p.id === r.fromUserId) : null;
    const toPerson = r.toUserId !== 'me' ? state.people.find(p => p.id === r.toUserId) : null;
    const senderLabel = fromPerson ? `De ${fromPerson.name}` : 'Yo';
    const recipientLabel = toPerson ? ` → ${toPerson.name}` : '';
    return `
        <div class="gd-linked-item">
          <span>🔔</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:2px">${senderLabel}${recipientLabel}</div>
            <div style="font-size:12.5px;color:var(--text-primary);line-height:1.4">${r.description}</div>
          </div>
          <button class="lr-icon-btn danger" title="Desvincular de esta meta" onclick="unlinkReminderFromGoal(${r.id},${goalId})" style="opacity:1;flex-shrink:0">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5 9l-3 3M9 5l3-3M5.5 8.5l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 6a2 2 0 012-2h2M8 10h2a2 2 0 002-2V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>`;
  }).join('');
}

function closeGoalDetailModal() {
  const overlay = document.getElementById('modal-goal-detail');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function deleteGoalFromDetail(id) {
  closeGoalDetailModal();
  state.goals = state.goals.filter(g => g.id !== id);
  renderCalendar();
  showToast(t('toast.goalDeleted'), '🗑️');
}

function unlinkFromGoal(goalId) {
  // El usuario actual se desvincula de la meta compartida
  const g = state.goals.find(g => g.id === goalId);
  if (!g) return;
  g.sharedWith = (g.sharedWith || []).filter(id => id !== 'me');
  state.goals = state.goals.filter(goal => goal.id !== goalId);
  closeGoalDetailModal();
  renderCalendar();
  showToast('Te has desvinculado de la meta', '👋');
}

function unlinkReminderFromGoal(reminderId, goalId) {
  const reminder = state.reminders.find(r => r.id === reminderId);
  if (!reminder) return;
  reminder.goalId = null;
  const remindersBody = document.getElementById('gd-reminders-body');
  if (remindersBody) remindersBody.innerHTML = _renderGoalDetailReminders(goalId);
  showToast('Recordatorio desvinculado de la meta', '🔗');
}

/* ── Cycle status ── */
function cycleGoalStatus(id, e) {
  e.stopPropagation();
  const g = state.goals.find(g => g.id === id);
  if (!g) return;
  const cycle = { pending: 'progress', progress: 'done', done: 'pending' };
  g.status = cycle[g.status];
  if (g.status === 'done' && g.milestones) g.milestones.forEach(m => m.done = true);
  else if (g.status === 'pending' && g.milestones) g.milestones.forEach(m => m.done = false);
  renderGoals();
  if (state.currentScreen === 'calendar') renderCalendar();
  showToast(g.status === 'done' ? '¡Meta completada! 🎉' : 'Estado actualizado', '✅');
}

function deleteGoal(id, e) {
  e.stopPropagation();
  state.goals = state.goals.filter(g => g.id !== id);
  renderGoals();
  if (state.currentScreen === 'calendar') renderCalendar();
  showToast(t('toast.goalDeleted'), '🗑️');
}

/* ============================================================
   GOAL MODAL — Crear / Editar
   ============================================================ */
let _editingGoalId = null;
let _goalMilestones = []; // temp milestones while modal is open

function openCreateGoalModal() {
  _editingGoalId = null;
  _goalMilestones = [];
  _openGoalModal(null);
}

function editGoal(id, e) {
  e && e.stopPropagation();
  _editingGoalId = id;
  const g = state.goals.find(g => g.id === id);
  _goalMilestones = g ? JSON.parse(JSON.stringify(g.milestones || [])) : [];
  _openGoalModal(g);
}

function openEditGoalModal(id) { editGoal(id); }

function _openGoalModal(g) {
  // Build the modal dynamically and inject into existing overlay
  const overlay = document.getElementById('modal-create-goal');
  if (!overlay) return;

  const isEdit = !!g;
  const GOAL_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#14b8a6', '#a78bfa', '#f97316', '#3b82f6', '#ef4444', '#84cc16'];
  const selectedColor = (g && g.color) ? g.color : GOAL_COLORS[0];
  const selectedHorizon = (g && g.horizon) ? g.horizon : 'year';
  const selectedCat = (g && g.category) ? g.category : 'personal';

  const colorSwatches = GOAL_COLORS.map(c => `
      <button type="button" class="goal-color-swatch ${c === selectedColor ? 'active' : ''}"
        style="background:${c}" data-color="${c}"
        onclick="selectGoalColor('${c}', this)"></button>`).join('');

  const msHtml = () => _goalMilestones.map((m, i) => `
      <div class="goal-ms-row" data-ms-idx="${i}">
        <div class="goal-ms-drag">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none"><circle cx="3" cy="3" r="1" fill="currentColor"/><circle cx="7" cy="3" r="1" fill="currentColor"/><circle cx="3" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="3" cy="11" r="1" fill="currentColor"/><circle cx="7" cy="11" r="1" fill="currentColor"/></svg>
        </div>
        <input class="form-input goal-ms-input" value="${m.text}" placeholder="Descripción del hito"
          oninput="_goalMilestones[${i}].text=this.value">
        <input type="date" class="form-input goal-ms-date" value="${m.date || ''}"
          oninput="_goalMilestones[${i}].date=this.value" title="Fecha estimada del hito">
        <button type="button" class="goal-ms-del" onclick="removeGoalMilestone(${i})">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>`).join('');

  // horizon value fields based on selection
  const horizonValueField = (h, val) => {
    if (h === 'year') return `<input type="number" class="form-input" id="goal-horizon-val" placeholder="ej. 2027" value="${val || ''}" min="2020" max="2099" style="flex:1">`;
    if (h === 'month') return `<input type="month" class="form-input" id="goal-horizon-val" value="${val || ''}" style="flex:1">`;
    if (h === 'longterm') return `<input type="number" class="form-input" id="goal-horizon-val" placeholder="Año estimado" value="${val || ''}" min="2020" max="2099" style="flex:1">`;
    if (h === 'day' || h === 'week') return `<input type="date" class="form-input" id="goal-horizon-val" value="${val || ''}" style="flex:1">`;
    return `<input type="text" class="form-input" id="goal-horizon-val" value="" placeholder="—" disabled style="flex:1;opacity:.4">`;
  };

  overlay.innerHTML = `
    <div class="modal goal-modal-full" role="dialog" aria-modal="true">
      <div class="modal-header">
        <span class="modal-title">${isEdit ? 'Editar meta' : 'Nueva meta'}</span>
        <button class="btn-close-modal" onclick="closeModal('modal-create-goal')" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body goal-modal-body">

        <!-- Color picker -->
        <div class="form-group">
          <label class="form-label">Color identificador</label>
          <div class="goal-color-picker" id="goal-color-picker">${colorSwatches}</div>
          <input type="hidden" id="goal-color" value="${selectedColor}">
        </div>

        <!-- Título -->
        <div class="form-group">
          <label class="form-label">Título de la meta <span style="color:var(--red)">*</span></label>
          <input type="text" class="form-input" id="goal-title" placeholder="¿Qué quieres lograr?" autocomplete="off" value="${g ? g.title : ''}">
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label class="form-label">Descripción (opcional)</label>
          <textarea class="form-textarea" id="goal-desc" placeholder="Describe tu meta, motivación, o pasos generales...">${g ? (g.desc || '') : ''}</textarea>
        </div>

        <!-- Categoría + Prioridad -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select class="form-select" id="goal-category">
              <option value="personal" ${selectedCat === 'personal' ? 'selected' : ''}>🧍 Personal</option>
              <option value="education" ${selectedCat === 'education' ? 'selected' : ''}>🎓 Educación</option>
              <option value="finance" ${selectedCat === 'finance' ? 'selected' : ''}>💰 Finanzas</option>
              <option value="health" ${selectedCat === 'health' ? 'selected' : ''}>❤️ Salud</option>
              <option value="learning" ${selectedCat === 'learning' ? 'selected' : ''}>📚 Aprendizaje</option>
              <option value="career" ${selectedCat === 'career' ? 'selected' : ''}>💼 Carrera</option>
              <option value="travel" ${selectedCat === 'travel' ? 'selected' : ''}>✈️ Viajes</option>
              <option value="social" ${selectedCat === 'social' ? 'selected' : ''}>👥 Social</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Prioridad</label>
            <select class="form-select" id="goal-priority">
              <option value="high" ${(g && g.priority === 'high') ? 'selected' : ''}>🔴 Alta</option>
              <option value="medium" ${(!g || g.priority === 'medium') ? 'selected' : ''}>🟡 Media</option>
              <option value="low" ${(g && g.priority === 'low') ? 'selected' : ''}>🟢 Baja</option>
            </select>
          </div>
        </div>

        <!-- Horizonte temporal -->
        <div class="form-group">
          <label class="form-label">¿Cuándo quieres lograrlo?</label>
          <div class="goal-horizon-selector" id="goal-horizon-selector">
            ${['day', 'week', 'month', 'year', 'longterm', 'open'].map(h => {
    const labels = { day: 'Un día', week: 'Una semana', month: 'Un mes', year: 'Un año', longterm: 'Largo plazo', open: 'Sin fecha' };
    return `<button type="button" class="horizon-btn ${h === selectedHorizon ? 'active' : ''}" data-horizon="${h}" onclick="selectGoalHorizon('${h}',this)">${labels[h]}</button>`;
  }).join('')}
          </div>
          <div id="goal-horizon-value-wrap" style="margin-top:8px;display:flex;gap:8px;align-items:center">
            <input type="hidden" id="goal-horizon" value="${selectedHorizon}">
            ${horizonValueField(selectedHorizon, g ? g.horizonValue : '')}
          </div>
        </div>

        <!-- Fechas de seguimiento -->
        <div class="form-row" id="goal-dates-row" style="${selectedHorizon === 'open' ? 'display:none' : ''}">
          <div class="form-group">
            <label class="form-label">Fecha de inicio</label>
            <input type="date" class="form-input" id="goal-start-date" value="${g ? (g.startDate || '') : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha límite</label>
            <input type="date" class="form-input" id="goal-end-date" value="${g ? (g.endDate || '') : ''}">
          </div>
        </div>

        <!-- Estado -->
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select class="form-select" id="goal-status">
            <option value="pending" ${(g && g.status === 'pending') ? 'selected' : ''}>Pendiente</option>
            <option value="progress" ${(!g || g.status === 'progress') ? 'selected' : ''}>En progreso</option>
            <option value="done" ${(g && g.status === 'done') ? 'selected' : ''}>Completada</option>
          </select>
        </div>

        <!-- Hitos -->
        <div class="form-group">
          <label class="form-label" style="display:flex;align-items:center;justify-content:space-between">
            <span>Hitos de seguimiento <span style="color:var(--text-tertiary);font-weight:400">(opcionales)</span></span>
            <button type="button" class="btn-add-ms" onclick="addGoalMilestone()">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              Agregar hito
            </button>
          </label>
          <div class="goal-ms-info">Los hitos calculan automáticamente el progreso de tu meta.</div>
          <div class="goal-ms-list" id="goal-ms-list">${msHtml()}</div>
        </div>

        <!-- Compartir con personas -->
        ${state.people.length > 0 ? `
        <div class="form-group">
          <label class="form-label">Compartir con</label>
          <div class="goal-share-info">Selecciona personas para compartir esta meta. Aparecerá en su calendario también.</div>
          <div class="goal-share-people" id="goal-share-people">
            ${state.people.map(p => {
    const isSelected = g && g.sharedWith && g.sharedWith.includes(p.id);
    return `<div class="goal-share-person ${isSelected ? 'selected' : ''}" data-person-id="${p.id}"
                onclick="toggleGoalSharePerson(${p.id}, this)">
                <div class="goal-share-avatar" style="background:${p.color}22;color:${p.color}">${p.initials}</div>
                <span class="goal-share-name">${p.name.split(' ')[0]}</span>
                <div class="goal-share-check">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </div>`;
  }).join('')}
          </div>
        </div>` : ''}

      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeModal('modal-create-goal')">Cancelar</button>
        <button class="btn-primary" onclick="saveGoal()">
          ${isEdit ? 'Guardar cambios' : 'Crear meta'}
        </button>
      </div>
    </div>`;

  openModal('modal-create-goal');
}

function selectGoalColor(color, btn) {
  document.getElementById('goal-color').value = color;
  document.querySelectorAll('.goal-color-swatch').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectGoalHorizon(horizon, btn) {
  document.getElementById('goal-horizon').value = horizon;
  document.querySelectorAll('.horizon-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const datesRow = document.getElementById('goal-dates-row');
  if (datesRow) datesRow.style.display = horizon === 'open' ? 'none' : '';

  const wrap = document.getElementById('goal-horizon-value-wrap');
  if (!wrap) return;
  const hidden = wrap.querySelector('#goal-horizon');
  const old = wrap.querySelector('[id="goal-horizon-val"]');
  const div = document.createElement('div');
  div.style.flex = '1';
  div.innerHTML = (function () {
    if (horizon === 'year' || horizon === 'longterm')
      return `<input type="number" class="form-input" id="goal-horizon-val" placeholder="${horizon === 'year' ? 'ej. 2027' : 'Año estimado'}" min="2020" max="2099" style="width:100%">`;
    if (horizon === 'month')
      return `<input type="month" class="form-input" id="goal-horizon-val" style="width:100%">`;
    if (horizon === 'day' || horizon === 'week')
      return `<input type="date" class="form-input" id="goal-horizon-val" style="width:100%">`;
    return `<input type="text" class="form-input" id="goal-horizon-val" value="" placeholder="Sin fecha específica" disabled style="opacity:.4;width:100%">`;
  })();
  if (old) old.replaceWith(div.firstElementChild);
}

function addGoalMilestone() {
  _goalMilestones.push({ id: 'ms_' + Date.now(), text: '', done: false, date: '' });
  _refreshMilestoneList();
}

function removeGoalMilestone(idx) {
  _goalMilestones.splice(idx, 1);
  _refreshMilestoneList();
}

function _refreshMilestoneList() {
  const list = document.getElementById('goal-ms-list');
  if (!list) return;
  list.innerHTML = _goalMilestones.map((m, i) => `
      <div class="goal-ms-row">
        <div class="goal-ms-drag">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none"><circle cx="3" cy="3" r="1" fill="currentColor"/><circle cx="7" cy="3" r="1" fill="currentColor"/><circle cx="3" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="3" cy="11" r="1" fill="currentColor"/><circle cx="7" cy="11" r="1" fill="currentColor"/></svg>
        </div>
        <input class="form-input goal-ms-input" value="${m.text}" placeholder="Descripción del hito"
          oninput="_goalMilestones[${i}].text=this.value">
        <input type="date" class="form-input goal-ms-date" value="${m.date || ''}"
          oninput="_goalMilestones[${i}].date=this.value" title="Fecha estimada">
        <button type="button" class="goal-ms-del" onclick="removeGoalMilestone(${i})">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>`).join('');
}

function toggleGoalSharePerson(personId, el) {
  el.classList.toggle('selected');
}

function saveGoal() {
  const title = document.getElementById('goal-title').value.trim();
  if (!title) { showToast('El título es requerido', '⚠️'); return; }

  const horizon = document.getElementById('goal-horizon').value;
  const horizonValEl = document.getElementById('goal-horizon-val');
  const horizonValue = horizonValEl ? horizonValEl.value.trim() : '';

  // Collect selected shared people
  const sharedWith = [];
  document.querySelectorAll('#goal-share-people .goal-share-person.selected').forEach(el => {
    const pid = parseInt(el.dataset.personId);
    if (!isNaN(pid)) sharedWith.push(pid);
  });

  // Clean milestones (remove empty)
  const milestones = _goalMilestones.filter(m => m.text.trim()).map(m => ({
    ...m, text: m.text.trim(),
    done: _editingGoalId ? m.done : false
  }));

  const goalData = {
    title,
    desc: document.getElementById('goal-desc').value.trim(),
    category: document.getElementById('goal-category').value,
    priority: document.getElementById('goal-priority').value,
    status: document.getElementById('goal-status').value,
    horizon,
    horizonValue,
    startDate: (document.getElementById('goal-start-date') || {}).value || '',
    endDate: (document.getElementById('goal-end-date') || {}).value || '',
    milestones,
    color: document.getElementById('goal-color').value || '#6366f1',
    sharedWith,
  };

  if (_editingGoalId) {
    const idx = state.goals.findIndex(g => g.id === _editingGoalId);
    if (idx !== -1) state.goals[idx] = { ...state.goals[idx], ...goalData };
    showToast('Meta actualizada', '✏️');
  } else {
    const newGoal = { id: Date.now(), ...goalData };
    state.goals.unshift(newGoal);
    // If shared, show toast with names
    if (sharedWith.length > 0) {
      const names = sharedWith.map(id => {
        const p = state.people.find(p => p.id === id);
        return p ? p.name.split(' ')[0] : '';
      }).filter(Boolean).join(', ');
      showToast(`¡Meta compartida con ${names}! 🤝`, '🎯');
    } else {
      showToast('¡Meta creada! 🎯', '✅');
    }
  }

  closeModal('modal-create-goal');
  renderGoals();
  if (state.currentScreen === 'calendar') renderCalendar();
}

/* ============================================================
   SHARED CALENDARS
   ============================================================ */
function renderShared() {
  renderPeopleList();
  renderSharedCalArea();
}

function renderPeopleList() {
  const listEl = document.getElementById('people-list');
  if (state.people.length === 0) {
    listEl.innerHTML = `<div class="people-empty"><h4>${t('shared.noPeople')}</h4><p>${t('shared.noPeopleMsg')}</p></div>`;
    return;
  }
  listEl.innerHTML = state.people.map(p => `
    <div class="person-item ${state.selectedPerson?.id === p.id ? 'selected' : ''}" onclick="selectPerson(${p.id})">
      <div class="person-avatar" style="background:${p.color}22;color:${p.color}">
        ${p.initials}
        <div class="online-indicator ${p.online ? '' : 'offline'}"></div>
      </div>
      <div class="person-info">
        <div class="person-name">${p.name}</div>
        <div class="person-handle">${p.username}</div>
      </div>
    </div>`).join('');
}

function filterPeople(query) {
  const q = query.toLowerCase();
  const listEl = document.getElementById('people-list');
  const filtered = state.people.filter(p => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="people-empty"><p>${t('shared.noPeople')}</p></div>`;
    return;
  }
  listEl.innerHTML = filtered.map(p => `
    <div class="person-item ${state.selectedPerson?.id === p.id ? 'selected' : ''}" onclick="selectPerson(${p.id})">
      <div class="person-avatar" style="background:${p.color}22;color:${p.color}">${p.initials}<div class="online-indicator ${p.online ? '' : 'offline'}"></div></div>
      <div class="person-info"><div class="person-name">${p.name}</div><div class="person-handle">${p.username}</div></div>
    </div>`).join('');
}

function selectPerson(id) {
  state.selectedPerson = state.people.find(p => p.id === id);
  renderPeopleList();
  renderSharedCalArea();
}

/* ─── Shared Calendar State ─────────────────────────────────── */
let _sharedCalView = 'week';
let _sharedCalDate = new Date();

function renderSharedCalArea() {
  const area = document.getElementById('shared-cal-area');
  if (!state.selectedPerson && state.people.length === 0) {
    area.innerHTML = `<div class="shared-cal-empty">
      <div class="shared-cal-empty-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="12" cy="10" r="5" stroke="var(--text-tertiary)" stroke-width="1.5" fill="none"/><path d="M4 28c0-5 3.5-8 8-8s8 3 8 8" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="22" cy="10" r="4" stroke="var(--text-tertiary)" stroke-width="1.4" fill="none"/><path d="M25 28c0-3.5-1.5-5.5-4-7" stroke="var(--text-tertiary)" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>
      </div>
      <h3>${t('shared.noPeople')}</h3>
      <p>${t('shared.noPeopleMsg')}</p>
      <button class="btn-primary" onclick="openAddPersonModal()" style="margin-top:8px">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        ${t('shared.addPerson')}
      </button>
    </div>`;
    return;
  }

  if (!state.selectedPerson && state.people.length > 0) {
    state.selectedPerson = state.people[0];
    renderPeopleList();
  }

  const p = state.selectedPerson;
  const personTz = p.timezone || 'UTC';
  const personTodayStr = dateStrInTz(personTz);
  const { h: ph, m: pm } = nowInTz(personTz);
  const ph12 = ph % 12 || 12;
  const pampm = ph >= 12 ? 'pm' : 'am';
  const personTimeStr = `${ph12}:${String(pm).padStart(2, '0')} ${pampm}`;

  // Timezone offset display
  const tzShort = (() => {
    try {
      return new Intl.DateTimeFormat('en', { timeZone: personTz, timeZoneName: 'short' })
        .formatToParts(new Date()).find(pt => pt.type === 'timeZoneName')?.value || personTz;
    } catch (e) { return personTz; }
  })();

  // User's own timezone for diff
  const userTz = state.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userTzShort = (() => {
    try {
      return new Intl.DateTimeFormat('en', { timeZone: userTz, timeZoneName: 'short' })
        .formatToParts(new Date()).find(pt => pt.type === 'timeZoneName')?.value || '';
    } catch (e) { return ''; }
  })();
  const tzDiff = tzShort !== userTzShort ? `<span class="shared-tz-diff">${tzShort}</span>` : '';

  const countryHtml = p.country ? `<span class="shared-person-country">🌍 ${p.country}</span>` : '';

  area.style.display = 'flex';
  area.style.flexDirection = 'column';

  // View switcher buttons HTML
  const views = ['day', 'week', 'month', 'year'];
  const viewLabels = { day: 'Día', week: 'Semana', month: 'Mes', year: 'Año' };
  const vsHtml = views.map(v =>
    `<button class="view-btn ${_sharedCalView === v ? 'active' : ''}" onclick="_sharedSetView('${v}')">${viewLabels[v]}</button>`
  ).join('');

  // Nav arrows + today + block/remove
  const navHtml = `
    <div style="display:flex;gap:4px;align-items:center;">
      <button class="btn-nav-arrow" onclick="_sharedNav(-1)"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="btn-today" onclick="_sharedGoToday()" style="font-size:12px;padding:4px 10px;">Hoy</button>
      <button class="btn-nav-arrow" onclick="_sharedNav(1)"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>`;
  const actionHtml = `
    <div class="shared-header-actions" style="display:flex;gap:6px;">
      <button class="btn-small danger" onclick="blockPerson(${p.id})">${t('shared.block')}</button>
      <button class="btn-small danger" onclick="removePerson(${p.id})">${t('shared.remove')}</button>
    </div>`;

  // ── Responsive header using CSS classes ──
  const headerHtml = `
    <div class="shared-person-header">

      <!-- Top row: info (avatar+name+status) + country/time (right on mobile) -->
      <div class="shared-header-top">
        <div class="shared-person-info">
          <div class="person-avatar" style="width:38px;height:38px;background:${p.color}22;color:${p.color};font-size:14px;font-weight:600;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;">
            ${p.initials}
            <div class="online-indicator ${p.online ? '' : 'offline'}" style="position:absolute;bottom:1px;right:1px"></div>
          </div>
          <div class="shared-person-meta">
            <div class="shared-person-name">${p.name}</div>
            <div class="shared-person-sub">
              <span>${p.username}</span>
              <span class="shared-meta-dot">·</span>
              <span class="${p.online ? 'shared-online' : 'shared-offline'}">${p.online ? t('shared.online') : t('shared.offline')}</span>
            </div>
          </div>
        </div>
        <!-- Country + time: on mobile this appears to the right of info; on desktop/tablet inside row1 -->
        <div class="shared-country-time">
          ${countryHtml}
          <span class="shared-time-row">
            <span class="shared-person-time">🕐 ${personTimeStr}</span>
            ${tzDiff}
          </span>
        </div>
      </div>

      <!-- Controls row: view switcher + nav + block/remove all in one line -->
      <div class="shared-header-right">
        <!-- Row 1 (desktop/tablet only): country + time + tz diff -->
        <div class="shared-header-row1">
          ${countryHtml}
          <span class="shared-person-time">🕐 ${personTimeStr}</span>
          ${tzDiff}
        </div>
        <!-- Row 2: view switcher + nav — all in one line -->
        <div class="shared-header-row2">
          <div class="shared-view-switcher">${vsHtml}</div>
          ${navHtml}
          <!-- Block/Remove: on desktop/tablet inline here; on mobile own row -->
          <span class="shared-actions-inline">${actionHtml}</span>
        </div>
        <!-- Block/Remove: mobile-only row (shown via CSS) -->
        <div class="shared-actions-row">${actionHtml}</div>
      </div>

    </div>`;

  area.innerHTML = headerHtml + `<div id="shared-cal-inner" style="flex:1;overflow:hidden;display:flex;flex-direction:column;"></div>`;
  _renderSharedCalInner(p, personTz, personTodayStr);
}

function _sharedSetView(v) {
  _sharedCalView = v;
  renderSharedCalArea();
}

function _sharedNav(dir) {
  const d = _sharedCalDate;
  if (_sharedCalView === 'week') d.setDate(d.getDate() + dir * 7);
  else if (_sharedCalView === 'month') d.setMonth(d.getMonth() + dir);
  else if (_sharedCalView === 'year') d.setFullYear(d.getFullYear() + dir);
  else d.setDate(d.getDate() + dir);
  _sharedCalDate = new Date(d);
  renderSharedCalArea();
}

function _sharedGoToday() {
  _sharedCalDate = new Date();
  renderSharedCalArea();
}

function _renderSharedCalInner(person, personTz, personTodayStr) {
  const inner = document.getElementById('shared-cal-inner');
  if (!inner) return;

  if (_sharedCalView === 'week') _renderSharedWeek(inner, person, personTz, personTodayStr);
  else if (_sharedCalView === 'day') _renderSharedDay(inner, person, personTz, personTodayStr);
  else if (_sharedCalView === 'year') _renderSharedYear(inner, person, personTz, personTodayStr);
  else _renderSharedMonth(inner, person, personTz, personTodayStr);
}

/* ── Mock events for other person (ready for backend) ── */
function _getPersonEvents(personId) {
  // These are placeholder events that represent what this person's backend would return.
  // When backend is connected, replace this with an API call result.
  const sharedEvts = state.events.filter(e => (e.sharedWith || []).includes(personId));
  // Placeholder personal events for the person (backend will replace these)
  const mockPersonal = [
    { id: 'pm1', title: '☕ Café matutino', color: person_color(personId), emoji: '☕', date: _sharedTodayStr(personId), start: '08:00', end: '08:30', allDay: false, recurrence: { type: 'daily', endType: 'never' }, desc: 'Momento de relax', _isMock: true },
    { id: 'pm2', title: '💼 Trabajo', color: '#2563eb', emoji: '💼', date: _sharedTodayStr(personId), start: '09:00', end: '17:00', allDay: false, recurrence: { type: 'none' }, _isMock: true },
  ];
  return [...sharedEvts, ...mockPersonal];
}

function person_color(id) { return (state.people.find(p => p.id === id) || {}).color || '#60a5fa'; }

function _sharedTodayStr(personId) {
  const p = state.people.find(pp => pp.id === personId);
  if (!p) return dateToStr(new Date());
  return dateStrInTz(p.timezone || 'UTC');
}

function _getPersonEventsForDate(personId, dateStr) {
  const evts = _getPersonEvents(personId);
  return evts.filter(e => {
    if (!e.date) return false;
    if (e.recurrence && e.recurrence.type !== 'none') {
      const d = parseDate(dateStr);
      const base = parseDate(e.date);
      if (e.recurrence.type === 'daily') return true;
      if (e.recurrence.type === 'weekly') return (e.recurrence.days || []).includes(d.getDay());
      if (e.recurrence.type === 'monthly') return d.getDate() === base.getDate();
      if (e.recurrence.type === 'yearly') return d.getMonth() === base.getMonth() && d.getDate() === base.getDate();
    }
    return e.date === dateStr;
  }).filter(e => !e.allDay).sort((a, b) => a.start.localeCompare(b.start));
}

function _renderSharedWeek(container, person, personTz, personTodayStr) {
  const DAYS_SHORT = getDaysShort();
  const days = getWeekDates(_sharedCalDate);

  // Period label
  const MONTHS_SHORT = getMonthsShort();
  const ofWord = t('calendar.of');
  const first = days[0]; const last = days[6];
  let periodLabel = first.getMonth() === last.getMonth()
    ? `${first.getDate()} – ${last.getDate()} ${ofWord} ${getMonths()[first.getMonth()]} ${first.getFullYear()}`
    : `${first.getDate()} ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`;

  container.innerHTML = `
    <div class="shared-cal-period">${periodLabel}</div>
    <div class="calendar-week shared-week-view" style="flex:1;overflow:hidden;">
      <div class="week-header"><div class="week-header-inner" id="shared-week-header-days"></div></div>
      <div class="week-body" id="shared-week-body" style="flex:1;overflow-y:auto;">
        <div class="week-grid" id="shared-week-grid"></div>
      </div>
    </div>`;

  const headerEl = document.getElementById('shared-week-header-days');
  headerEl.innerHTML = `<div class="week-header-gutter"></div>` +
    days.map((d, i) => {
      const ds = dateToStr(d);
      const isToday = ds === personTodayStr;
      return `<div class="week-day-col ${isToday ? 'today' : ''}">
          <div class="week-day-name">${DAYS_SHORT[i]}</div>
          <div class="week-day-num ${isToday ? 'today-num' : ''}">${d.getDate()}</div>
          <div style="height:8px"></div>
        </div>`;
    }).join('');

  const gridEl = document.getElementById('shared-week-grid');
  gridEl.innerHTML = '';

  // Gutter
  const gutter = document.createElement('div');
  gutter.className = 'time-gutter';
  for (let h = 0; h < 24; h++) {
    const lbl = document.createElement('div');
    lbl.className = 'time-slot-label';
    if (h === 0) { lbl.textContent = ''; }
    else { const h12 = h % 12 || 12; const ampm = h >= 12 ? 'pm' : 'am'; lbl.textContent = `${h12} ${ampm}`; }
    gutter.appendChild(lbl);
  }
  gridEl.appendChild(gutter);

  days.forEach(d => {
    const ds = dateToStr(d);
    const isToday = ds === personTodayStr;
    const col = document.createElement('div');
    col.className = `day-col-body shared-day-col${isToday ? ' is-today-col' : ''}`;

    for (let h = 0; h < 24; h++) {
      const line = document.createElement('div');
      line.className = 'hour-line';
      line.style.top = `${h * 60}px`;
      col.appendChild(line);
      if (h > 0) {
        const half = document.createElement('div');
        half.className = 'hour-line half';
        half.style.top = `${h * 60 - 30}px`;
        col.appendChild(half);
      }
    }

    if (isToday) col.appendChild(createNowLine(false, personTz));

    const evts = _getPersonEventsForDate(person.id, ds);
    const laid = layoutEvents(evts);
    laid.forEach(({ ev, col: colIdx, totalCols }) => {
      const startM = timeToMinutes(ev.start);
      const endM = timeToMinutes(ev.end);
      const height = Math.max(endM - startM, 22);
      const evtEl = document.createElement('div');
      evtEl.className = `cal-event${ev._isMock ? ' cal-event-mock' : ''}`;
      evtEl.style.top = `${startM}px`;
      evtEl.style.height = `${height}px`;
      const cw = 100 / totalCols;
      evtEl.style.left = `${colIdx * cw + 1}%`;
      evtEl.style.width = `${cw - 2}%`;
      evtEl.style.setProperty('--evt-color', ev.color || person.color);
      evtEl.title = ev._isMock ? 'Evento de ejemplo (se mostrará el real cuando esté conectado el backend)' : ev.title;
      const shared = !(ev.sharedWith || []).includes; // always render
      evtEl.innerHTML = `<div class="cal-event-title">
              ${ev.emoji ? `<span class="cal-event-emoji">${ev.emoji}</span>` : ''}
              ${ev.title}
              ${ev._isMock ? '<span class="evt-mock-badge">demo</span>' : ''}
            </div>
            ${height > 30 ? `<div class="cal-event-time">${fmtTime(ev.start)} – ${fmtTime(ev.end)}</div>` : ''}`;
      col.appendChild(evtEl);
    });

    gridEl.appendChild(col);
  });

  requestAnimationFrame(() => {
    const body = document.getElementById('shared-week-body');
    if (body) {
      const mins = nowMinutesInTz(personTz);
      body.scrollTop = Math.max(mins - 60, 7 * 60 - 30);
    }
  });

  // Start/update the now-line tick for this person
  startNowLineUpdater();
}

function _renderSharedDay(container, person, personTz, personTodayStr) {
  const d = _sharedCalDate;
  const ds = dateToStr(d);
  const isToday = ds === personTodayStr;

  container.innerHTML = `
    <div class="shared-cal-period" style="padding:10px 16px;font-size:13px;font-weight:500;border-bottom:1px solid var(--border)">
      ${formatDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      ${isToday ? `<span style="margin-left:8px;font-size:11px;background:var(--accent-soft);color:var(--accent);padding:2px 7px;border-radius:99px">Hoy</span>` : ''}
    </div>
    <div class="day-body" id="shared-day-body" style="flex:1;overflow-y:auto;">
      <div class="day-scroll-inner" id="shared-day-inner" style="display:flex;"></div>
    </div>`;

  const inner = document.getElementById('shared-day-inner');
  const gutter = document.createElement('div');
  gutter.className = 'time-gutter';
  for (let h = 0; h < 24; h++) {
    const lbl = document.createElement('div');
    lbl.className = 'time-slot-label';
    if (h === 0) { lbl.textContent = ''; }
    else { const h12 = h % 12 || 12; const ampm = h >= 12 ? 'pm' : 'am'; lbl.textContent = `${h12} ${ampm}`; }
    gutter.appendChild(lbl);
  }
  inner.appendChild(gutter);

  const col = document.createElement('div');
  col.className = 'day-events-col';
  col.style.minHeight = '1440px';
  col.style.position = 'relative';
  col.style.flex = '1';

  for (let h = 0; h < 24; h++) {
    const line = document.createElement('div'); line.className = 'hour-line'; line.style.top = `${h * 60}px`; col.appendChild(line);
    if (h > 0) { const half = document.createElement('div'); half.className = 'hour-line half'; half.style.top = `${h * 60 - 30}px`; col.appendChild(half); }
  }

  if (isToday) col.appendChild(createNowLine(false, personTz));

  const evts = _getPersonEventsForDate(person.id, ds);
  const laid = layoutEvents(evts);
  laid.forEach(({ ev, col: colIdx, totalCols }) => {
    const startM = timeToMinutes(ev.start);
    const endM = timeToMinutes(ev.end);
    const height = Math.max(endM - startM, 24);
    const evtEl = document.createElement('div');
    evtEl.className = `cal-event${ev._isMock ? ' cal-event-mock' : ''}`;
    evtEl.style.top = `${startM}px`; evtEl.style.height = `${height}px`;
    const cw = 100 / totalCols;
    evtEl.style.left = `${colIdx * cw + 1}%`; evtEl.style.width = `${cw - 2}%`;
    evtEl.style.setProperty('--evt-color', ev.color || person.color);
    evtEl.innerHTML = `<div class="cal-event-title">${ev.emoji ? `<span class="cal-event-emoji">${ev.emoji}</span>` : ''}${ev.title}${ev._isMock ? '<span class="evt-mock-badge">demo</span>' : ''}</div>
        ${height > 30 ? `<div class="cal-event-time">${fmtTime(ev.start)} – ${fmtTime(ev.end)}</div>` : ''}`;
    col.appendChild(evtEl);
  });
  inner.appendChild(col);

  requestAnimationFrame(() => {
    const body = document.getElementById('shared-day-body');
    if (body) { const mins = nowMinutesInTz(personTz); body.scrollTop = Math.max(mins - 60, 7 * 60 - 30); }
  });
  startNowLineUpdater();
}

function _renderSharedMonth(container, person, personTz, personTodayStr) {
  const d = _sharedCalDate;
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const MONTHS = getMonths();
  const DAYS_SHORT = getDaysShort();

  container.innerHTML = `
    <div class="shared-cal-period">${MONTHS[d.getMonth()]} ${d.getFullYear()}</div>
    <div class="calendar-month" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;">
      <div class="month-dow-header" id="shared-month-dow"></div>
      <div class="month-grid" id="shared-month-grid"></div>
    </div>`;

  document.getElementById('shared-month-dow').innerHTML = DAYS_SHORT.map(dd => `<div class="month-dow">${dd}</div>`).join('');

  const gridEl = document.getElementById('shared-month-grid');
  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;
  const startDate = new Date(firstDay);
  startDate.setDate(1 - startDay);

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const isOther = cellDate.getMonth() !== d.getMonth();
    const ds = dateToStr(cellDate);
    const isToday = ds === personTodayStr;
    const cell = document.createElement('div');
    cell.className = `month-cell${isOther ? ' other-month' : ''}${isToday ? ' today' : ''}`;
    const evts = _getPersonEventsForDate(person.id, ds).slice(0, 3);
    cell.innerHTML = `<div class="month-day-num">${cellDate.getDate()}</div>
        ${evts.map(ev => `<div class="month-evt-dot" style="--evt-color:${ev.color || person.color}">${ev.emoji ? `<span>${ev.emoji}</span>` : ''}
          <span>${ev.title}</span></div>`).join('')}`;
    gridEl.appendChild(cell);
  }
}

/* ── Shared Year View ── */
function _renderSharedYear(container, person, personTz, personTodayStr) {
  const d = _sharedCalDate;
  const year = d.getFullYear();
  const MONTHS = getMonths();
  const MONTHS_SHORT = getMonthsShort();
  const DAYS_SHORT = getDaysShort();

  container.innerHTML = `
    <div class="shared-cal-period">${year}</div>
    <div class="shared-year-grid" id="shared-year-grid"></div>`;

  const gridEl = document.getElementById('shared-year-grid');

  for (let m = 0; m < 12; m++) {
    const card = document.createElement('div');
    card.className = 'shared-year-card';

    const firstDay = new Date(year, m, 1);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const startDate = new Date(firstDay);
    startDate.setDate(1 - startDow);

    let cellsHtml = DAYS_SHORT.map(dd => `<div class="sym-dow">${dd.slice(0, 1)}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const cd = new Date(startDate);
      cd.setDate(startDate.getDate() + i);
      const isOther = cd.getMonth() !== m;
      const ds = dateToStr(cd);
      const isToday = ds === personTodayStr;
      const evts = _getPersonEventsForDate(person.id, ds);
      const hasDot = evts.length > 0;
      cellsHtml += `<div class="sym-cell${isOther ? ' other' : ''}${isToday ? ' today' : ''}${hasDot ? ' has-evt' : ''}" title="${hasDot ? evts.map(e => e.title).join(', ') : ''}">${cd.getDate()}</div>`;
    }

    card.innerHTML = `<div class="sym-month-name">${MONTHS_SHORT[m]}</div><div class="sym-grid">${cellsHtml}</div>`;
    gridEl.appendChild(card);
  }
}


function openAddPersonModal() { openModal('modal-add-person'); }

function addPerson() {
  const username = document.getElementById('add-person-username').value.trim();
  if (!username) { showToast(t('errors.required'), '⚠️'); return; }
  const colors = ['#e879f9', '#60a5fa', '#4ade80', '#f97316', '#facc15', '#f87171'];
  state.people.push({
    id: Date.now(),
    name: username.replace('@', ''),
    username: username.startsWith('@') ? username : `@${username}`,
    initials: username.replace('@', '').slice(0, 2).toUpperCase(),
    color: colors[Math.floor(Math.random() * colors.length)],
    online: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // default; backend will correct
    country: ''  // backend will fill this
  });
  document.getElementById('add-person-username').value = '';
  closeModal('modal-add-person');
  renderPeopleList();
  showToast(t('toast.personAdded'), '👤');
}

function removePerson(id) {
  state.people = state.people.filter(p => p.id !== id);
  if (state.selectedPerson?.id === id) state.selectedPerson = state.people[0] || null;
  renderShared();
  showToast(t('toast.personRemoved'), '🗑️');
}

function blockPerson(id) {
  const p = state.people.find(p => p.id === id);
  if (!p) return;
  state.people = state.people.filter(pp => pp.id !== id);
  state.blocked.push(p);
  if (state.selectedPerson?.id === id) state.selectedPerson = state.people[0] || null;
  renderShared();
  showToast(t('toast.personBlocked'), '🚫');
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function updateNotifBadge() {
  const count = state.notifications.filter(n => !n.read).length;
  state.unreadCount = count;
  const dot = document.getElementById('notif-dot');
  const badge = document.getElementById('sidebar-notif-badge');
  if (count > 0) {
    dot.classList.remove('hidden');
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    dot.classList.add('hidden');
    badge.classList.add('hidden');
  }
}

function toggleNotifPanel() {
  state.notifPanelOpen = !state.notifPanelOpen;
  const panel = document.getElementById('notif-panel');
  panel.classList.toggle('open', state.notifPanelOpen);
  if (state.notifPanelOpen) {
    // Position panel just below the actual topbar height (works for both 1-row and 2-row)
    const topbar = document.getElementById('topbar');
    const tbH = topbar ? topbar.getBoundingClientRect().height : 56;
    panel.style.top = (tbH + 8) + 'px';
    renderNotifPanel();
  }
}

function renderNotifPanel() {
  const body = document.getElementById('notif-panel-body');
  const recent = state.notifications.slice(0, 5);
  if (recent.length === 0) {
    body.innerHTML = `<div class="notif-panel-empty">${t('notifications.noNotifications')}</div>`;
    return;
  }
  body.innerHTML = recent.map(n => `
    <div class="notif-panel-item ${n.read ? '' : 'unread'}" onclick="openNotif(${n.id})">
      <div class="notif-panel-icon">${n.icon}</div>
      <div class="notif-panel-content">
        <div class="notif-panel-msg">${n.msg}</div>
        <div class="notif-panel-time">${n.time}</div>
      </div>
    </div>`).join('');
}

function openNotif(id) {
  const n = state.notifications.find(n => n.id === id);
  if (n) n.read = true;
  updateNotifBadge();
  if (state.notifPanelOpen) toggleNotifPanel();
  navigate('notifications');
}

function renderNotificationsFull() {
  const listEl = document.getElementById('notif-list-full');
  let filtered = state.notifications;
  if (state.notifFilter === 'unread') filtered = state.notifications.filter(n => !n.read);
  else if (state.notifFilter === 'read') filtered = state.notifications.filter(n => n.read);

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="padding:60px;text-align:center;color:var(--text-tertiary);font-size:13px;">
      <div style="font-size:32px;margin-bottom:12px;">🔔</div>
      <div>${t('notifications.noNotifications')}</div>
    </div>`;
    return;
  }
  listEl.innerHTML = filtered.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markRead(${n.id})">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-content">
        <div class="notif-msg">${n.msg}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      ${!n.read ? `<div style="flex-shrink:0"><div style="width:8px;height:8px;border-radius:50%;background:var(--accent);"></div></div>` : ''}
    </div>`).join('');
}

function filterNotifs(filter, btn) {
  state.notifFilter = filter;
  document.querySelectorAll('.notif-filters .filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNotificationsFull();
}

function markRead(id) {
  const n = state.notifications.find(n => n.id === id);
  if (n) n.read = true;
  updateNotifBadge();
  renderNotificationsFull();
}

function markAllRead() {
  state.notifications.forEach(n => n.read = true);
  updateNotifBadge();
  renderNotificationsFull();
  showToast(t('toast.allRead'), '✅');
}

/* ============================================================
   COLOR THEME SECTION (rendered inside profile settings)
   ============================================================ */
function renderColorThemeSection() {
  const lightThemes = colorTheme.getThemes('light');
  const darkThemes = colorTheme.getThemes('dark');
  const selLight = colorTheme.getSelected('light');
  const selDark = colorTheme.getSelected('dark');

  if (!lightThemes.length && !darkThemes.length) {
    return '<div class="settings-row" style="color:var(--text-tertiary);font-size:13px;justify-content:center;padding:20px;">Cargando paleta de colores\u2026</div>';
  }

  function swatchBtn(mode, th, selected) {
    const isActive = th.id === selected;
    const checkSvg = isActive
      ? '<span class="swatch-check"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
      : '';
    return '<button'
      + ' class="palette-swatch' + (isActive ? ' active' : '') + '"'
      + ' onclick="colorTheme.select(\'' + mode + '\',\'' + th.id + '\')"'
      + ' title="' + th.label + '"'
      + ' style="--swatch-accent:' + th.colors['accent'] + ';--swatch-soft:' + th.colors['accent-soft'] + ';"'
      + ' aria-label="' + th.label + (isActive ? ' (activo)' : '') + '"'
      + ' aria-pressed="' + isActive + '"'
      + '><span class="swatch-circle"></span>' + checkSvg + '</button>';
  }

  function swatchRow(mode, themes, selected) {
    return themes.map(function (th) { return swatchBtn(mode, th, selected); }).join('');
  }

  const mode = state.theme; // 'light' | 'dark' | 'system'

  function appBtn(id, label, previewHtml) {
    const isActive = id === mode;
    const checkMark = isActive
      ? '<span class="appearance-mode-check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
      : '';
    return '<button'
      + ' class="appearance-mode-btn' + (isActive ? ' active' : '') + '"'
      + ' onclick="setAppearanceMode(\'' + id + '\')"'
      + ' aria-pressed="' + isActive + '">'
      + previewHtml
      + '<span class="appearance-mode-label">' + label + '</span>'
      + checkMark
      + '</button>';
  }

  const previewLight =
    '<div class="appearance-mode-preview appearance-preview-light">'
    + '<div class="ap-bar"></div>'
    + '<div class="ap-content"><div class="ap-block"></div><div class="ap-block ap-block-sm"></div></div>'
    + '</div>';

  const previewDark =
    '<div class="appearance-mode-preview appearance-preview-dark">'
    + '<div class="ap-bar"></div>'
    + '<div class="ap-content"><div class="ap-block"></div><div class="ap-block ap-block-sm"></div></div>'
    + '</div>';

  const previewSystem =
    '<div class="appearance-mode-preview appearance-preview-system">'
    + '<div class="ap-half-light"><div class="ap-bar"></div><div class="ap-content"><div class="ap-block"></div></div></div>'
    + '<div class="ap-half-dark"><div class="ap-bar"></div><div class="ap-content"><div class="ap-block"></div></div></div>'
    + '</div>';

  return ''
    + '<div class="color-theme-section">'
    + '<div class="color-theme-label">Apariencia</div>'
    + '<div class="color-theme-desc">Elige c\u00f3mo se ve la interfaz. \u201cSistema\u201d usa la hora del dispositivo: claro de 6\u202fam a 6\u202fpm, oscuro de 7\u202fpm a 5\u202fam.</div>'
    + '<div class="appearance-mode-grid">'
    + appBtn('light', 'Claro', previewLight)
    + appBtn('dark', 'Oscuro', previewDark)
    + appBtn('system', 'Sistema', previewSystem)
    + '</div>'
    + '</div>'

    + '<div class="color-theme-section">'
    + '<div class="color-theme-label">Tema de colores</div>'
    + '<div class="color-theme-desc">Personaliza el color principal de la interfaz. Cada modo tiene su propia paleta independiente.</div>'
    + '<div class="color-theme-panels">'
    + '<div class="color-theme-panel">'
    + '<div class="color-panel-header">'
    + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none">'
    + '<circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.2" fill="none"/>'
    + '<path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'
    + '</svg>'
    + '<span>Modo claro</span>'
    + '</div>'
    + '<div class="swatch-grid">' + swatchRow('light', lightThemes, selLight) + '</div>'
    + '</div>'
    + '<div class="color-theme-panel">'
    + '<div class="color-panel-header">'
    + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none">'
    + '<path d="M11.5 8.5A5 5 0 015.5 2.5a5 5 0 100 9 5 5 0 006-3z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
    + '</svg>'
    + '<span>Modo oscuro</span>'
    + '</div>'
    + '<div class="swatch-grid">' + swatchRow('dark', darkThemes, selDark) + '</div>'
    + '</div>'
    + '</div>'
    + '</div>';
}


/* ============================================================
   PROFILE
   ============================================================ */
function renderProfile() {
  const layout = document.getElementById('profile-layout');
  const u = state.user;

  // Build avatar content: image if set, else initials
  const avatarContent = u.avatarUrl
    ? `<img src="${u.avatarUrl}" alt="${u.name}">`
    : u.initials;

  // Build banner content: image if set, else gradient (styled via CSS)
  const bannerContent = u.bannerUrl
    ? `<img src="${u.bannerUrl}" alt="Portada">`
    : '';

  layout.innerHTML = `
    <!-- Hidden file inputs for image upload -->
    <input type="file" id="input-avatar" class="profile-file-input" accept="image/*" onchange="handleAvatarUpload(event)">
    <input type="file" id="input-banner" class="profile-file-input" accept="image/*" onchange="handleBannerUpload(event)">

    <div class="profile-card">
      <!-- Banner / portada -->
      <div class="profile-banner" onclick="document.getElementById('input-banner').click()" title="Cambiar imagen de portada">
        ${bannerContent}
        <button class="btn-edit-banner" onclick="event.stopPropagation();document.getElementById('input-banner').click()" aria-label="${t('profile.editBanner')}">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="7.5" r="2.2" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M5 3l.8-1.5h2.4L9 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
          ${t('profile.editBanner')}
        </button>
      </div>

      <!-- Card body: info left, avatar right -->
      <div class="profile-card-body">
        <div class="profile-info">
          <div class="profile-name">${u.name}</div>
          <div class="profile-handle">${u.username}</div>
        </div>
        <div class="profile-avatar-wrap" onclick="document.getElementById('input-avatar').click()" title="Cambiar foto de perfil" style="cursor:pointer">
          <div class="profile-avatar">${avatarContent}</div>
          <div class="btn-edit-avatar" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="7" cy="7.5" r="2.2" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M5 3l.8-1.5h2.4L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="var(--text-secondary)" stroke-width="1.3" fill="none"/><path d="M2 14c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="var(--text-secondary)" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>
        <h3>${t('profile.title')}</h3>
      </div>
      <div class="settings-row" onclick="openModal('modal-edit-profile')" style="cursor:pointer">
        <div class="settings-row-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 1.5L12.5 5 4.5 13H1v-3.5L9 1.5z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="settings-row-info"><div class="settings-row-label">${t('profile.editProfile')}</div><div class="settings-row-desc">${t('profile.fullName')}, ${t('auth.email')}</div></div>
        <div class="settings-row-action"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>
      </div>
      <div class="settings-row" onclick="openModal('modal-change-password')" style="cursor:pointer">
        <div class="settings-row-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M4.5 6V4.5a3.5 3.5 0 017 0V6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg></div>
        <div class="settings-row-info"><div class="settings-row-label">${t('profile.changePassword')}</div><div class="settings-row-desc">${t('auth.password')}</div></div>
        <div class="settings-row-action"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>
      </div>
      <div class="settings-row">
        <div class="settings-row-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M7 3v4l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></div>
        <div class="settings-row-info">
          <div class="settings-row-label">Zona horaria</div>
          <div class="settings-row-desc">${fmtTz(u.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)}</div>
        </div>
        <span class="timezone-row-value" style="flex-shrink:0;font-size:11px;">Auto-detectada</span>
      </div>
      ${u.birthdate ? `<div class="settings-row">
        <div class="settings-row-icon">🎂</div>
        <div class="settings-row-info"><div class="settings-row-label">Cumpleaños</div><div class="settings-row-desc">${u.birthdate} · Evento anual creado</div></div>
      </div>` : ''}
    </div>

    <div class="settings-section">
      <div class="settings-section-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="var(--text-secondary)" stroke-width="1.3" fill="none"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42" stroke="var(--text-secondary)" stroke-width="1.3" stroke-linecap="round"/></svg>
        <h3>${t('profile.calendarSettings')}</h3>
      </div>
      <div class="settings-row">
        <div class="settings-row-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10l-3.6 2 .7-4L1.1 5.2l4-.6z" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="settings-row-info"><div class="settings-row-label">${t('profile.language')}</div><div class="settings-row-desc">${t('profile.language')}</div></div>
        <select class="lang-select" onchange="changeLang(this.value)">
          <option value="es" ${i18n.lang === 'es' ? 'selected' : ''}>Español</option>
          <option value="en" ${i18n.lang === 'en' ? 'selected' : ''}>English</option>
          <option value="pt" ${i18n.lang === 'pt' ? 'selected' : ''}>Português</option>
          <option value="ca" ${i18n.lang === 'ca' ? 'selected' : ''}>Català</option>
          <option value="ja" ${i18n.lang === 'ja' ? 'selected' : ''}>日本語</option>
        </select>
      </div>
      <div class="settings-row">
        <div class="settings-row-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 6.5A4.5 4.5 0 116.5 2a4.5 4.5 0 014.5 4.5z" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M13 13L10.5 10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></div>
        <div class="settings-row-info"><div class="settings-row-label">${t('profile.notificationSettings')}</div><div class="settings-row-desc">${t('profile.eventReminders')}</div></div>
        <label class="toggle-switch">
          <input type="checkbox" checked onchange="showToast('${t('toast.saved').replace(/'/g, "\\'")}','💾')">
          <div class="toggle-track"><div class="toggle-thumb"></div></div>
        </label>
      </div>
      ${renderColorThemeSection()}
    </div>

    <div class="settings-section">
      <div class="settings-section-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="var(--text-secondary)" stroke-width="1.3" fill="none"/><path d="M1.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="var(--text-secondary)" stroke-width="1.3" stroke-linecap="round" fill="none"/><circle cx="11" cy="5" r="2" stroke="var(--text-secondary)" stroke-width="1.3" fill="none"/><path d="M13 13c0-1.8-1-3-2.5-3.5" stroke="var(--text-secondary)" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>
        <h3>${t('shared.addedPeople')}</h3>
      </div>
      ${state.people.length === 0
      ? `<div style="padding:16px 20px;color:var(--text-tertiary);font-size:13px;">${t('shared.noPeople')}</div>`
      : `<div class="person-manage-list">${state.people.map(p => `
          <div class="person-manage-item">
            <div class="person-avatar" style="width:32px;height:32px;background:${p.color}22;color:${p.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">${p.initials}</div>
            <div class="person-info"><div class="person-name" style="font-size:13px;font-weight:500;">${p.name}</div><div class="person-handle" style="font-size:11px;color:var(--text-tertiary);">${p.username}</div></div>
            <div class="person-manage-actions">
              <button class="btn-small danger" onclick="blockPersonFromProfile(${p.id})">${t('shared.block')}</button>
              <button class="btn-small danger" onclick="removePersonFromProfile(${p.id})">${t('shared.remove')}</button>
            </div>
          </div>`).join('')}</div>`
    }
      <div style="padding:12px 20px;border-top:1px solid var(--border-subtle);">
        <button class="btn-primary" onclick="navigate('shared');openAddPersonModal()" style="font-size:12.5px;padding:7px 14px;">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          ${t('shared.addPerson')}
        </button>
      </div>
    </div>

    ${state.blocked.length > 0 ? `
    <div class="settings-section">
      <div class="settings-section-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--text-secondary)" stroke-width="1.3" fill="none"/><path d="M4 8h8" stroke="var(--text-secondary)" stroke-width="1.3" stroke-linecap="round"/></svg>
        <h3>${t('shared.blockedUsers')}</h3>
      </div>
      <div class="person-manage-list">${state.blocked.map(p => `
        <div class="person-manage-item">
          <div class="person-avatar" style="width:32px;height:32px;background:var(--red-soft);color:var(--red);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">${p.initials}</div>
          <div class="person-info"><div class="person-name" style="font-size:13px;font-weight:500;">${p.name}</div><div class="person-handle" style="font-size:11px;color:var(--text-tertiary);">${p.username}</div></div>
          <div class="person-manage-actions">
            <button class="btn-small" onclick="unblockPerson(${p.id})">${t('shared.unblock')}</button>
          </div>
        </div>`).join('')}</div>
    </div>` : ''}

    <div class="settings-section">
      <button class="btn-logout" onclick="showToast('${t('auth.logout').replace(/'/g, "\\'")}','👋')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-3.5L10 4M6 8.5h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        ${t('auth.logout')}
      </button>
      <button class="btn-logout btn-delete-account" onclick="confirmDeleteAccount()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M6 7v5M10 7v5M3 4l.8 9.1a1 1 0 001 .9h6.4a1 1 0 001-.9L13 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        ${t('profile.deleteAccount')}
      </button>
    </div>`;
}

function blockPersonFromProfile(id) { blockPerson(id); renderProfile(); }
function removePersonFromProfile(id) { removePerson(id); renderProfile(); }

/* ── Image upload handlers ─────────────────────────────────── */
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Selecciona una imagen válida', '⚠️'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    state.user.avatarUrl = e.target.result;
    renderProfile();
    updateUserChip();
    showToast('Foto de perfil actualizada', '✅');
  };
  reader.readAsDataURL(file);
}

function handleBannerUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Selecciona una imagen válida', '⚠️'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    state.user.bannerUrl = e.target.result;
    renderProfile();
    showToast('Imagen de portada actualizada', '✅');
  };
  reader.readAsDataURL(file);
}

/* ── Delete account ─────────────────────────────────────────── */
function confirmDeleteAccount() {
  // Simple inline confirmation using a toast-style approach
  if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
    showToast('Cuenta eliminada', '🗑️');
  }
}

function unblockPerson(id) {
  const p = state.blocked.find(p => p.id === id);
  if (!p) return;
  state.blocked = state.blocked.filter(pp => pp.id !== id);
  state.people.push({ ...p, online: false });
  renderProfile();
  showToast(t('toast.personUnblocked'), '✅');
}

function saveProfile() {
  const name = document.getElementById('ep-name').value.trim();
  const email = document.getElementById('ep-email').value.trim();
  const username = document.getElementById('ep-username').value.trim();
  const birthdate = (document.getElementById('ep-birthdate') || {}).value || '';
  const country = (document.getElementById('ep-country') || {}).value || '';
  if (name) { state.user.name = name; state.user.initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
  if (email) state.user.email = email;
  if (username) state.user.username = username.startsWith('@') ? username : `@${username}`;
  if (country !== undefined) state.user.country = country;
  if (birthdate && birthdate !== state.user.birthdate) {
    state.user.birthdate = birthdate;
    // Remove old birthday event and re-register
    state.events = state.events.filter(e => !(e._isBirthday && e._birthdayOf === 'user'));
    ensureBirthdayEvent();
    showToast('¡Cumpleaños registrado en tu calendario! 🎂', '🎂');
  }
  closeModal('modal-edit-profile');
  renderProfile();
  updateUserChip();
  showToast(t('toast.profileSaved'), '✅');
}

function updateUserChip() {
  const u = state.user;
  const avatarEl = document.getElementById('sidebar-avatar');
  if (u.avatarUrl) {
    avatarEl.innerHTML = `<img src="${u.avatarUrl}" alt="${u.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    avatarEl.textContent = u.initials;
  }
  document.querySelector('.user-name').textContent = u.name;
  document.querySelector('.user-handle').textContent = u.username;
}

async function changeLang(lang) {
  await i18n.change(lang);
  showToast(t('profile.language') + ': ' + t(`languages.${lang}`), '🌐');
}

/* ============================================================
   MINI CALENDAR
   ============================================================ */
function renderMiniCalendar() {
  const wrap = document.getElementById('mini-calendar');
  if (!wrap) return;
  const DAYS_SHORT = getDaysShort();
  const MONTHS_SHORT = getMonthsShort();
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const today = d.getDate();

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  const startDate = new Date(firstDay);
  startDate.setDate(1 - startDay);

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const eventDateSet = getEventDatesInRange(firstOfMonth, lastOfMonth);

  let cells = '';
  for (let i = 0; i < 35; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const isOther = cellDate.getMonth() !== month;
    const isToday = cellDate.getDate() === today && !isOther;
    const ds = dateToStr(cellDate);
    const hasEvent = !isOther && eventDateSet.has(ds);
    cells += `<div class="mini-cal-day ${isOther ? 'other-month' : ''} ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}">${cellDate.getDate()}</div>`;
  }

  wrap.innerHTML = `
    <div class="mini-cal-header">
      <span class="mini-cal-title">${MONTHS_SHORT[month]} ${year}</span>
    </div>
    <div class="mini-cal-grid">
      ${DAYS_SHORT.map(d => `<div class="mini-cal-dow">${d[0]}</div>`).join('')}
      ${cells}
    </div>`;
}

/* ============================================================
   CREATE / EDIT EVENT — Sistema completo
   ============================================================ */

// — Emojis disponibles para eventos —
const EVENT_EMOJIS = [
  '📅', '📆', '🗓️', '⭐', '🔥', '💡', '🎯', '✅', '📌', '🔔',
  '🎂', '🎉', '🎊', '🎁', '🥳', '🏆', '🥇', '🎖️', '🏅', '🌟',
  '💪', '🏋️', '🧘', '🚴', '🏃', '⚽', '🏀', '🎾', '🏊', '🤸',
  '🍽️', '🍕', '🍔', '☕', '🥗', '🍰', '🍜', '🍣', '🍷', '🥂',
  '💼', '💻', '📊', '📋', '📝', '📎', '🖥️', '📞', '📧', '🗂️',
  '🎓', '📚', '📖', '✏️', '🖊️', '📐', '🔬', '🧮', '🏫', '📜',
  '❤️', '💛', '💙', '💜', '💚', '🧡', '🤍', '💖', '💝', '💞',
  '🌍', '✈️', '🚂', '🚗', '🛳️', '🗺️', '🏖️', '🏔️', '🌄', '🗼',
  '🎵', '🎶', '🎸', '🎹', '🎤', '🎬', '🎮', '🎲', '♟️', '🎭',
  '🦷', '💊', '🏥', '🩺', '💉', '🧬', '🩻', '🩹', '🫀', '🧠',
  '🙏', '⛪', '☮️', '🕯️', '🌿', '🌺', '🌸', '🍀', '🌻', '🦋',
  '👶', '👨‍👩‍👧', '🤝', '👥', '👤', '💑', '👨‍💼', '🧑‍🎓', '👩‍🍳', '🧑‍🔧',
  '🌅', '🌙', '⚡', '🌈', '❄️', '🔑', '🎀', '🎈', '💌', '📿',
];

// — Colores predefinidos para eventos —
const EVENT_COLORS = [
  '#dc2626', // Rojo
  '#9b2335', // Corinto
  '#f97316', // Naranja
  '#eab308', // Amarillo
  '#16a34a', // Verde fuerte
  '#86efac', // Verde claro (usable visualmente sobre fondos oscuros/claros)
  '#2563eb', // Azul
  '#38bdf8', // Celeste
  '#1e3a8a', // Azul profundo
  '#7c3aed', // Morado
  '#ec4899', // Rosado
];

let _editingEventId = null;
let _evtEmojiIndex = 0;
let _evtSelectedColor = EVENT_COLORS[0];
let _evtRepeatTimes = [{ start: '09:00', end: '10:00' }];

function _getEventById(id) { return state.events.find(e => e.id === id); }

function openCreateModal(prefillDate) {
  _editingEventId = null;
  _evtEmojiIndex = 0;
  _evtSelectedColor = EVENT_COLORS[0];
  _evtRepeatTimes = [{ start: '09:00', end: '10:00' }];
  const dateStr = prefillDate || todayStr();
  _openEventModal(null, dateStr);
}

function editEvent(id) {
  removeEventPopup();
  const evt = _getEventById(id);
  if (!evt) return;
  _editingEventId = id;
  _evtEmojiIndex = EVENT_EMOJIS.indexOf(evt.emoji || '📅');
  if (_evtEmojiIndex < 0) _evtEmojiIndex = 0;
  _evtSelectedColor = evt.color || EVENT_COLORS[0];
  _evtRepeatTimes = evt.times ? JSON.parse(JSON.stringify(evt.times)) : [{ start: evt.start || '09:00', end: evt.end || '10:00' }];
  _openEventModal(evt, evt.date);
}

function _openEventModal(evt, dateStr) {
  const isEdit = !!evt;
  const overlay = document.getElementById('modal-create-event');
  if (!overlay) return;

  const selectedEmoji = EVENT_EMOJIS[_evtEmojiIndex] || '📅';
  const rec = evt && evt.recurrence ? evt.recurrence : { type: 'none' };
  const sharedWith = evt && evt.sharedWith ? [...evt.sharedWith] : [];

  // Color swatches
  const colorSwatches = EVENT_COLORS.map(c => `
      <button type="button" class="evt-color-swatch ${c === _evtSelectedColor ? 'active' : ''}"
        style="background:${c}" data-color="${c}"
        onclick="_evtPickColor('${c}',this)" aria-label="Color ${c}"></button>`).join('');

  // People checkboxes
  const peopleHtml = state.people.length === 0
    ? `<p class="evt-no-people">No tienes personas agregadas aún.</p>`
    : state.people.map(p => `
        <label class="evt-person-check ${sharedWith.includes(p.id) ? 'selected' : ''}" id="evtpc-${p.id}">
          <input type="checkbox" value="${p.id}" ${sharedWith.includes(p.id) ? 'checked' : ''}
            onchange="_evtTogglePerson(${p.id},this)">
          <div class="evt-person-avatar" style="background:${p.color}22;color:${p.color}">${p.initials}</div>
          <span>${p.name}</span>
        </label>`).join('');

  // Time slots
  const timeSlotsHtml = () => _evtRepeatTimes.map((slot, i) => `
      <div class="evt-time-slot" data-idx="${i}">
        <div class="evt-time-slot-num">${_evtRepeatTimes.length > 1 ? `#${i + 1}` : ''}</div>
        <div class="evt-time-slot-inputs">
          <input type="time" class="form-input evt-time-inp" value="${slot.start}"
            onchange="_evtRepeatTimes[${i}].start=this.value" aria-label="Hora inicio ${i + 1}">
          <span class="evt-time-sep">→</span>
          <input type="time" class="form-input evt-time-inp" value="${slot.end}"
            onchange="_evtRepeatTimes[${i}].end=this.value" aria-label="Hora fin ${i + 1}">
        </div>
        ${_evtRepeatTimes.length > 1 ? `<button type="button" class="evt-time-del" onclick="_evtRemoveTimeSlot(${i})" aria-label="Eliminar horario">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>` : ''}
      </div>`).join('');

  // Recurrence fields
  const recTypeVal = rec.type || 'none';

  overlay.innerHTML = `
    <div class="modal event-modal-full" role="dialog" aria-modal="true">

      <!-- HEADER con barra de color dinámica -->
      <div class="modal-header evt-modal-header" style="border-bottom: 3px solid ${_evtSelectedColor}20; padding-bottom: 14px;">
        <div class="evt-modal-header-left">
          <div class="evt-modal-badge" style="background:${_evtSelectedColor}18; border: 1.5px solid ${_evtSelectedColor}40; color:${_evtSelectedColor}">
            ${isEdit ? '✏️' : '✨'}
          </div>
          <div>
            <span class="modal-title" style="display:block">${isEdit ? 'Editar evento' : 'Nuevo evento'}</span>
            <span class="evt-modal-subtitle">${isEdit ? 'Modifica los detalles del evento' : 'Añade un nuevo evento a tu calendario'}</span>
          </div>
        </div>
        <button class="btn-close-modal" onclick="closeModal('modal-create-event')" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="modal-body event-modal-body">

        <!-- EMOJI + TÍTULO -->
        <div class="evt-field-section">
          <div class="evt-title-row">
            <button type="button" class="evt-emoji-btn" id="evt-emoji-display" onclick="_evtNextEmoji()" title="Clic para cambiar emoji">
              <span id="evt-emoji-char">${selectedEmoji}</span>
              <div class="evt-emoji-hint">cambiar</div>
            </button>
            <div class="form-group" style="flex:1;margin:0">
              <label class="form-label">Título del evento <span style="color:var(--red)">*</span></label>
              <input type="text" class="form-input evt-title-input" id="evt-title" placeholder="¿Qué tienes planeado?" autocomplete="off" value="${isEdit ? (evt.title || '') : ''}">
            </div>
          </div>
        </div>

        <!-- COLOR — nueva paleta más amplia y visual -->
        <div class="evt-field-section">
          <label class="form-label evt-section-label">
            <svg class="evt-label-icon" width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="2.5" fill="currentColor"/></svg>
            Color del evento
          </label>
          <div class="evt-color-picker evt-color-picker-v2" id="evt-color-picker">${colorSwatches}</div>
          <div class="evt-color-preview-v2" id="evt-color-preview-bar">
            <div class="evt-color-preview-bar-fill" style="background:${_evtSelectedColor};width:100%"></div>
          </div>
        </div>

        <!-- DESCRIPCIÓN -->
        <div class="evt-field-section">
          <label class="form-label evt-section-label">
            <svg class="evt-label-icon" width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 5h5M4.5 7h5M4.5 9h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            Descripción <span class="form-label-opt">opcional</span>
          </label>
          <textarea class="form-textarea" id="evt-desc" placeholder="Añade detalles, notas o recordatorios...">${isEdit ? (evt.desc || '') : ''}</textarea>
        </div>

        <!-- FECHA + MOSTRAR DESDE -->
        <div class="evt-field-section">
          <label class="form-label evt-section-label">
            <svg class="evt-label-icon" width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 6h11" stroke="currentColor" stroke-width="1.2"/><path d="M4.5 1v3M9.5 1v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            Fecha y visibilidad
          </label>
          <div class="form-row evt-date-row">
            <div class="form-group">
              <label class="form-label" style="font-size:11px;opacity:0.75">Fecha del evento</label>
              <div class="evt-input-wrap">
                <svg class="evt-input-icon" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 6h11" stroke="currentColor" stroke-width="1.2"/><path d="M4.5 1v3M9.5 1v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                <input type="date" class="form-input evt-icon-input" id="evt-date" value="${isEdit ? evt.date : dateStr}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:11px;opacity:0.75">Mostrar desde</label>
              <select class="form-select" id="evt-show-from">
                <option value="current" ${(!isEdit || (evt.showFrom === 'current')) ? 'selected' : ''}>Fecha actual en adelante</option>
                <option value="registration" ${(isEdit && evt.showFrom === 'registration') ? 'selected' : ''}>Fecha de registro en adelante</option>
              </select>
            </div>
          </div>
        </div>

        <!-- HORARIOS -->
        <div class="evt-field-section">
          <div class="evt-section-header">
            <label class="form-label evt-section-label">
              <svg class="evt-label-icon" width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3.5l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Horarios del día
            </label>
            <button type="button" class="evt-add-time-btn" onclick="_evtAddTimeSlot()">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Agregar horario
            </button>
          </div>
          <div id="evt-time-slots">${timeSlotsHtml()}</div>
          <p class="evt-hint">Agrega múltiples horarios si el evento ocurre varias veces en el mismo día.</p>
        </div>

        <!-- UBICACIÓN — aquí van los iconos con soporte dark mode -->
        <div class="evt-field-section">
          <label class="form-label evt-section-label">
            <svg class="evt-label-icon" width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5A4 4 0 0111 5.5C11 8.5 7 13 7 13S3 8.5 3 5.5A4 4 0 017 1.5z" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="5.5" r="1.5" fill="currentColor"/></svg>
            Ubicación <span class="form-label-opt">opcional</span>
          </label>
          <div class="evt-input-wrap">
            <svg class="evt-input-icon" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5A4 4 0 0111 5.5C11 8.5 7 13 7 13S3 8.5 3 5.5A4 4 0 017 1.5z" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="7" cy="5.5" r="1.5" fill="currentColor"/></svg>
            <input type="text" class="form-input evt-icon-input" id="evt-location" placeholder="¿Dónde ocurrirá?" value="${isEdit ? (evt.location || '') : ''}">
          </div>
        </div>

        <!-- RECURRENCIA -->
        <div class="evt-field-section">
          <label class="form-label evt-section-label">
            <svg class="evt-label-icon" width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7A5 5 0 0112 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M12 5v2h-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7A5 5 0 012 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2 9V7h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Repetición
          </label>
          <div class="evt-recurrence-wrap">
            <select class="form-select" id="evt-rec-type" onchange="_evtUpdateRecFields()">
              <option value="none" ${recTypeVal === 'none' ? 'selected' : ''}>Sin repetición</option>
              <option value="daily" ${recTypeVal === 'daily' ? 'selected' : ''}>Cada día</option>
              <option value="weekly" ${recTypeVal === 'weekly' ? 'selected' : ''}>Días específicos de la semana</option>
              <option value="monthly" ${recTypeVal === 'monthly' ? 'selected' : ''}>Mensual (mismo día del mes)</option>
              <option value="yearly" ${recTypeVal === 'yearly' ? 'selected' : ''}>Anual (mismo día del año)</option>
            </select>
            <div id="evt-rec-extra" class="evt-rec-extra">${_buildRecExtra(rec)}</div>
          </div>
        </div>

        <!-- COMPARTIR CON PERSONAS -->
        <div class="evt-field-section">
          <label class="form-label evt-section-label">
            <svg class="evt-label-icon" width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 12c0-2 1.6-3.5 3.5-3.5S8.5 10 8.5 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="10.5" cy="4.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M12.5 10.5c0-1.1-.9-2-2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            Compartir con personas
          </label>
          <div class="evt-people-grid" id="evt-people-grid">
            ${peopleHtml}
          </div>
          ${state.people.length > 0 ? '<p class="evt-hint">Las personas seleccionadas también verán este evento en su calendario.</p>' : ''}
        </div>

      </div><!-- /modal-body -->

      <div class="modal-footer evt-modal-footer">
        ${isEdit ? `<button class="btn-secondary danger" onclick="_evtDelete(${evt.id})" style="margin-right:auto">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M3 4l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
          Eliminar
        </button>` : ''}
        <button class="btn-secondary" onclick="closeModal('modal-create-event')">Cancelar</button>
        <button class="btn-primary" onclick="_evtSave()">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ${isEdit ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </div>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Store shared-with state in closure
  overlay._sharedWith = [...sharedWith];
}

function _buildRecExtra(rec) {
  const type = rec.type || 'none';
  if (type === 'none') return '';
  const days = rec.days || [];
  const endType = rec.endType || 'never';
  const endDate = rec.endDate || '';
  const endCount = rec.endCount || '';

  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weekDaysHtml = [0, 1, 2, 3, 4, 5, 6].map(d => `
      <button type="button" class="evt-weekday-btn ${days.includes(d) ? 'active' : ''}"
        onclick="_evtToggleWeekday(${d},this)">${dayLabels[d]}</button>`).join('');

  let extraHtml = '';
  if (type === 'weekly') {
    extraHtml = `<div class="evt-weekdays" id="evt-weekdays">${weekDaysHtml}</div>`;
  }

  const endHtml = `
      <div class="evt-rec-end">
        <label class="form-label" style="margin-bottom:6px">Termina</label>
        <div class="evt-rec-end-opts">
          <label class="evt-radio-opt ${endType === 'never' ? 'active' : ''}">
            <input type="radio" name="evt-end-type" value="never" ${endType === 'never' ? 'checked' : ''} onchange="_evtUpdateEndType('never')">
            Nunca
          </label>
          <label class="evt-radio-opt ${endType === 'date' ? 'active' : ''}">
            <input type="radio" name="evt-end-type" value="date" ${endType === 'date' ? 'checked' : ''} onchange="_evtUpdateEndType('date')">
            En fecha
          </label>
          <label class="evt-radio-opt ${endType === 'count' ? 'active' : ''}">
            <input type="radio" name="evt-end-type" value="count" ${endType === 'count' ? 'checked' : ''} onchange="_evtUpdateEndType('count')">
            Después de N veces
          </label>
        </div>
        <div id="evt-end-detail" class="evt-end-detail">
          ${endType === 'date' ? `<input type="date" class="form-input" id="evt-rec-end-date" value="${endDate}" style="max-width:200px">` : ''}
          ${endType === 'count' ? `<div style="display:flex;align-items:center;gap:8px"><input type="number" class="form-input" id="evt-rec-end-count" value="${endCount}" min="1" max="999" placeholder="Ej. 10" style="max-width:100px"><span style="font-size:13px;color:var(--text-secondary)">veces</span></div>` : ''}
        </div>
      </div>`;

  return extraHtml + endHtml;
}

// ── Helpers del modal de eventos ──

function _evtNextEmoji() {
  _evtEmojiIndex = (_evtEmojiIndex + 1) % EVENT_EMOJIS.length;
  const char = document.getElementById('evt-emoji-char');
  if (char) { char.style.transform = 'scale(1.4)'; char.textContent = EVENT_EMOJIS[_evtEmojiIndex]; setTimeout(() => { char.style.transform = ''; }, 150); }
}

function _evtPickColor(color, btn) {
  _evtSelectedColor = color;
  document.querySelectorAll('.evt-color-swatch').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Legacy bar (backward compat)
  const bar = document.getElementById('evt-color-preview-bar');
  if (bar) {
    bar.style.background = color;
    const fill = bar.querySelector('.evt-color-preview-bar-fill');
    if (fill) fill.style.background = color;
  }
  // Update dynamic header border
  const header = document.querySelector('.evt-modal-header');
  if (header) header.style.borderBottomColor = color + '30';
  // Update badge color
  const badge = document.querySelector('.evt-modal-badge');
  if (badge) {
    badge.style.background = color + '18';
    badge.style.borderColor = color + '40';
    badge.style.color = color;
  }
}

function _evtAddTimeSlot() {
  const last = _evtRepeatTimes[_evtRepeatTimes.length - 1];
  _evtRepeatTimes.push({ start: last.end, end: last.end });
  const slotsEl = document.getElementById('evt-time-slots');
  if (slotsEl) slotsEl.innerHTML = _buildTimeSlotsHtml();
}

function _evtRemoveTimeSlot(i) {
  _evtRepeatTimes.splice(i, 1);
  const slotsEl = document.getElementById('evt-time-slots');
  if (slotsEl) slotsEl.innerHTML = _buildTimeSlotsHtml();
}

function _buildTimeSlotsHtml() {
  return _evtRepeatTimes.map((slot, i) => `
      <div class="evt-time-slot" data-idx="${i}">
        <div class="evt-time-slot-num">${_evtRepeatTimes.length > 1 ? `#${i + 1}` : ''}</div>
        <div class="evt-time-slot-inputs">
          <input type="time" class="form-input evt-time-inp" value="${slot.start}"
            onchange="_evtRepeatTimes[${i}].start=this.value">
          <span class="evt-time-sep">→</span>
          <input type="time" class="form-input evt-time-inp" value="${slot.end}"
            onchange="_evtRepeatTimes[${i}].end=this.value">
        </div>
        ${_evtRepeatTimes.length > 1 ? `<button type="button" class="evt-time-del" onclick="_evtRemoveTimeSlot(${i})">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>` : ''}
      </div>`).join('');
}

function _evtTogglePerson(id, cb) {
  const overlay = document.getElementById('modal-create-event');
  if (!overlay._sharedWith) overlay._sharedWith = [];
  const label = document.getElementById(`evtpc-${id}`);
  if (cb.checked) { if (!overlay._sharedWith.includes(id)) overlay._sharedWith.push(id); if (label) label.classList.add('selected'); }
  else { overlay._sharedWith = overlay._sharedWith.filter(x => x !== id); if (label) label.classList.remove('selected'); }
}

function _evtUpdateRecFields() {
  const type = document.getElementById('evt-rec-type')?.value || 'none';
  const extra = document.getElementById('evt-rec-extra');
  if (extra) extra.innerHTML = _buildRecExtra({ type, days: [], endType: 'never' });
}

function _evtToggleWeekday(d, btn) {
  btn.classList.toggle('active');
}

function _evtUpdateEndType(type) {
  const detail = document.getElementById('evt-end-detail');
  if (!detail) return;
  document.querySelectorAll('.evt-radio-opt').forEach(l => {
    const inp = l.querySelector('input');
    l.classList.toggle('active', inp && inp.value === type);
  });
  if (type === 'date') detail.innerHTML = `<input type="date" class="form-input" id="evt-rec-end-date" style="max-width:200px">`;
  else if (type === 'count') detail.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><input type="number" class="form-input" id="evt-rec-end-count" min="1" max="999" placeholder="Ej. 10" style="max-width:100px"><span style="font-size:13px;color:var(--text-secondary)">veces</span></div>`;
  else detail.innerHTML = '';
}

function _evtDelete(id) {
  state.events = state.events.filter(e => e.id !== id);
  closeModal('modal-create-event');
  if (state.currentScreen === 'calendar') renderCalendar();
  renderMiniCalendar();
  showToast('Evento eliminado', '🗑️');
}

function _evtSave() {
  const title = document.getElementById('evt-title')?.value.trim();
  if (!title) { showToast('El título es obligatorio', '⚠️'); return; }

  // Collect time slots, validate
  const slots = _evtRepeatTimes.filter(s => s.start && s.end);
  if (slots.length === 0) { showToast('Agrega al menos un horario', '⚠️'); return; }
  for (const s of slots) {
    if (s.start >= s.end) { showToast(`Horario inválido: la hora de fin debe ser después del inicio`, '⚠️'); return; }
  }

  // Check for conflicts with existing events
  const dateVal = document.getElementById('evt-date')?.value || todayStr();
  for (const s of slots) {
    if (!isSlotFree(dateVal, s.start, s.end, _editingEventId !== null ? _editingEventId : undefined)) {
      showToast(`Conflicto de horario: ya hay un evento de ${fmtTime(s.start)} a ${fmtTime(s.end)}`, '⚠️');
      return;
    }
  }

  // Recurrence
  const recType = document.getElementById('evt-rec-type')?.value || 'none';
  const recDayBtns = document.querySelectorAll('.evt-weekday-btn.active');
  const recDays = Array.from(recDayBtns).map(b => parseInt(b.textContent === 'Dom' ? 0 : b.textContent === 'Lun' ? 1 : b.textContent === 'Mar' ? 2 : b.textContent === 'Mié' ? 3 : b.textContent === 'Jue' ? 4 : b.textContent === 'Vie' ? 5 : 6));
  if (recType === 'weekly' && recDays.length === 0) { showToast('Selecciona al menos un día de la semana', '⚠️'); return; }
  const endTypeEl = document.querySelector('input[name="evt-end-type"]:checked');
  const endType = endTypeEl ? endTypeEl.value : 'never';
  const endDate = document.getElementById('evt-rec-end-date')?.value || '';
  const endCount = parseInt(document.getElementById('evt-rec-end-count')?.value) || 0;

  const recurrence = { type: recType };
  if (recType === 'weekly') recurrence.days = recDays;
  if (endType !== 'never') { recurrence.endType = endType; if (endType === 'date') recurrence.endDate = endDate; if (endType === 'count') recurrence.endCount = endCount; }
  else recurrence.endType = 'never';

  const overlay = document.getElementById('modal-create-event');
  const sharedWith = (overlay && overlay._sharedWith) ? [...overlay._sharedWith] : [];

  const baseEvt = {
    title,
    emoji: EVENT_EMOJIS[_evtEmojiIndex] || '📅',
    color: _evtSelectedColor,
    desc: document.getElementById('evt-desc')?.value.trim() || '',
    date: document.getElementById('evt-date')?.value || todayStr(),
    showFrom: document.getElementById('evt-show-from')?.value || 'current',
    location: document.getElementById('evt-location')?.value.trim() || '',
    recurrence,
    sharedWith,
    times: slots,
    // For backward compat keep start/end as first slot
    start: slots[0].start,
    end: slots[0].end,
  };

  if (_editingEventId !== null) {
    const idx = state.events.findIndex(e => e.id === _editingEventId);
    if (idx >= 0) state.events[idx] = { ...state.events[idx], ...baseEvt };
  } else {
    state.events.push({ id: Date.now(), ...baseEvt });
  }

  closeModal('modal-create-event');
  if (state.currentScreen === 'calendar') renderCalendar();
  renderMiniCalendar();
  showToast(_editingEventId ? 'Evento actualizado ✨' : 'Evento creado 🎉', '📅');
}

/* ── Compute which dates an event appears on ── */
function getEventOccurrences(evt, fromDate, toDate) {
  const occurrences = [];
  const rec = evt.recurrence || { type: 'none' };
  const showFrom = evt.showFrom === 'registration' ? parseDate(evt.date) : new Date();

  // Single-day event
  if (rec.type === 'none') {
    const d = parseDate(evt.date);
    if (d >= fromDate && d <= toDate && d >= showFrom) occurrences.push(evt.date);
    return occurrences;
  }

  const baseDate = parseDate(evt.date);
  // Max iterations safety
  const maxDays = 1000;
  let cursor = new Date(Math.max(fromDate.getTime(), showFrom.getTime()));
  let count = 0;

  // End constraint
  const endDate = (rec.endType === 'date' && rec.endDate) ? parseDate(rec.endDate) : null;
  const endCount = (rec.endType === 'count' && rec.endCount) ? rec.endCount : null;
  let totalOccurrences = 0;

  while (cursor <= toDate && count < maxDays) {
    count++;
    const ds = dateToStr(cursor);
    let matches = false;

    if (rec.type === 'daily') {
      matches = true;
    } else if (rec.type === 'weekly') {
      const dayOfWeek = cursor.getDay();
      matches = (rec.days || []).includes(dayOfWeek);
    } else if (rec.type === 'monthly') {
      matches = cursor.getDate() === baseDate.getDate();
    } else if (rec.type === 'yearly') {
      matches = cursor.getMonth() === baseDate.getMonth() && cursor.getDate() === baseDate.getDate();
    }

    if (matches && cursor >= showFrom) {
      if (endDate && cursor > endDate) break;
      totalOccurrences++;
      if (endCount && totalOccurrences > endCount) break;
      occurrences.push(ds);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return occurrences;
}

/* ── Get events for a specific date (including recurring) ── */
function getEventsForDate(dateStr) {
  const d = parseDate(dateStr);
  const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);

  const result = [];
  for (const evt of state.events) {
    const occ = getEventOccurrences(evt, dayStart, dayEnd);
    if (occ.length > 0) {
      // Expand into multiple slots if times array
      const times = evt.times || [{ start: evt.start, end: evt.end }];
      for (const slot of times) {
        result.push({ ...evt, _dateStr: dateStr, start: slot.start, end: slot.end });
      }
    }
  }
  return result.sort((a, b) => a.start.localeCompare(b.start));
}

/* ── Get all event dates in a range (for mini calendar dots etc) ── */
function getEventDatesInRange(fromDate, toDate) {
  const dateSet = new Set();
  for (const evt of state.events) {
    const occ = getEventOccurrences(evt, fromDate, toDate);
    occ.forEach(d => dateSet.add(d));
  }
  return dateSet;
}

/* ============================================================
   MODALS
   ============================================================ */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // modal-create-event is built dynamically — only open if already populated
  if (id === 'modal-create-event' && !el.querySelector('.modal')) {
    openCreateModal();
    return;
  }
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (id === 'modal-edit-profile') {
    document.getElementById('ep-name').value = state.user.name;
    document.getElementById('ep-email').value = state.user.email;
    document.getElementById('ep-username').value = state.user.username;
    const bdEl = document.getElementById('ep-birthdate');
    if (bdEl) bdEl.value = state.user.birthdate || '';
    const cEl = document.getElementById('ep-country');
    if (cEl) cEl.value = state.user.country || '';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
  // Clear dynamic modals after animation
  if (id === 'modal-create-event' || id === 'modal-create-goal') {
    setTimeout(() => { if (!el.classList.contains('open')) el.innerHTML = ''; }, 300);
  }
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function (e) {
    if (e.target === this) closeModal(this.id);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    if (state.notifPanelOpen) toggleNotifPanel();
    removeEventPopup();
    ['events', 'goals', 'society'].forEach(s => {
      const el = document.getElementById(`bottom-sheet-${s}`);
      if (el && el.classList.contains('open')) closeBottomSheet(s);
    });
  }
});

/* ============================================================
   BOTTOM SHEETS
   ============================================================ */
function openBottomSheet(name) {
  document.getElementById(`bottom-sheet-${name}`).classList.add('open');
  document.getElementById('mobile-overlay').classList.add('show');
  if (name === 'events') renderSheetEvents('today');
  if (name === 'goals') renderSheetGoals();
  if (name === 'society') renderSheetSociety();
}

function closeBottomSheet(name) {
  document.getElementById(`bottom-sheet-${name}`).classList.remove('open');
  document.getElementById('mobile-overlay').classList.remove('show');
}

document.getElementById('mobile-overlay').addEventListener('click', () => {
  ['events', 'goals', 'society'].forEach(closeBottomSheet);
  closeMobileSidebar();
});

function sheetTabEvt(filter, btn) {
  btn.closest('.sheet-tabs').querySelectorAll('.sheet-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSheetEvents(filter);
}

function renderSheetEvents(filter) {
  const listEl = document.getElementById('sheet-events-list');
  const today = todayStr();
  const now = new Date();
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);

  let evts = [...state.events].sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  if (filter === 'today') evts = evts.filter(e => e.date === today);
  else if (filter === 'week') evts = evts.filter(e => e.date >= today && parseDate(e.date) <= weekEnd);
  else evts = evts.filter(e => e.date >= today);

  if (evts.length === 0) {
    const msgKey = filter === 'today' ? 'bottomSheet.noEventsToday' : filter === 'week' ? 'bottomSheet.noEventsWeek' : 'bottomSheet.noEventsAll';
    listEl.innerHTML = `<div style="text-align:center;color:var(--text-tertiary);padding:40px;font-size:13px;">${t(msgKey)}</div>`;
    return;
  }
  const colorHex = {};
  listEl.innerHTML = evts.map(e => `
    <div class="upcoming-item" onclick="editEvent(${e.id})" style="cursor:pointer">
      <div class="upcoming-color-bar" style="background:${e.color || '#2563eb'}"></div>
      <div class="upcoming-evt-emoji" style="font-size:16px">${e.emoji || '📅'}</div>
      <div class="upcoming-info">
        <div class="upcoming-title">${e.title}</div>
        <div class="upcoming-meta">${e.date !== today ? e.date + ' · ' : ''}${fmtTime(e.start)} – ${fmtTime(e.end)}${e.location ? ' · ' + e.location : ''}${e.recurrence && e.recurrence.type !== 'none' ? ' · 🔁' : ''}</div>
      </div>
    </div>`).join('');
}

function renderSheetGoals() {
  const el = document.getElementById('sheet-goals-content');
  const goals = state.goals.filter(g => g.status !== 'done');
  if (goals.length === 0) {
    el.innerHTML = `<div style="text-align:center;color:var(--text-tertiary);padding:40px;font-size:13px;">${t('bottomSheet.noActiveGoals')}</div>`;
    return;
  }
  const statusLabel = { progress: `⏳ ${t('goals.statusProgress')}`, pending: `🔵 ${t('goals.statusPending')}` };
  el.innerHTML = goals.map(g => `
    <div class="upcoming-item">
      <div class="upcoming-color-bar" style="background:var(--purple)"></div>
      <div class="upcoming-info">
        <div class="upcoming-title">${g.title}</div>
        <div class="upcoming-meta">${statusLabel[g.status] || ''} · ${g.date}${g.progress > 0 ? ` · ${g.progress}%` : ''}</div>
      </div>
    </div>`).join('');
}

function renderSheetSociety() {
  const el = document.getElementById('sheet-society-content');
  if (state.people.length === 0) {
    el.innerHTML = `<div style="text-align:center;color:var(--text-tertiary);padding:40px;font-size:13px;">${t('bottomSheet.noPeople')}</div>`;
    return;
  }
  el.innerHTML = `<div class="society-list">${state.people.map(p => `
    <div class="society-item" onclick="closeBottomSheet('society');navigate('shared');selectPerson(${p.id})">
      <div class="person-avatar" style="width:40px;height:40px;background:${p.color}22;color:${p.color};font-size:15px;font-weight:600;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;">
        ${p.initials}
        <div class="online-indicator ${p.online ? '' : 'offline'}"></div>
      </div>
      <div>
        <div style="font-size:13.5px;font-weight:500;">${p.name}</div>
        <div style="font-size:12px;color:var(--text-tertiary);">${p.username} · ${p.online ? `<span style="color:#22c55e">${t('shared.online')}</span>` : t('shared.offline')}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-left:auto;color:var(--text-tertiary)"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    </div>`).join('')}</div>`;
}

/* ============================================================
   TOAST
   ============================================================ */
let currentToast = null;

function showToast(message, icon = '✨') {
  const container = document.getElementById('toast-container');
  if (currentToast) {
    currentToast.classList.add('out');
    setTimeout(() => { if (currentToast) { currentToast.remove(); currentToast = null; } }, 200);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
  container.appendChild(toast);
  currentToast = toast;
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => { toast.remove(); if (currentToast === toast) currentToast = null; }, 200);
  }, 3000);
}

/* ============================================================
   CONNECTION STATUS
   ============================================================ */
function updateConnectionStatus() {
  const el = document.getElementById('connection-status');
  if (!el) return;
  if (navigator.onLine) {
    el.classList.remove('offline');
    el.innerHTML = `<div class="conn-dot"></div><span class="conn-label">${t('topbar.connectionLive')}</span>`;
  } else {
    el.classList.add('offline');
    el.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M4.5 2A7 7 0 0111 8.5M1 4.5a7 7 0 012-1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><span class="conn-label">${t('topbar.connectionOffline')}</span>`;
  }
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

/* ============================================================
   SIDEBAR KEYBOARD NAVIGATION
   ============================================================ */
document.querySelectorAll('.sidebar-nav-item').forEach(item => {
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
  });
});

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  // Restore saved UI theme (light / dark / system)
  const savedTheme = localStorage.getItem('calendara_theme');
  if (savedTheme) state.theme = savedTheme;
  // Resolve to actual applied mode
  const _resolved = (state.theme === 'system') ? resolveSystemTheme() : state.theme;
  document.documentElement.setAttribute('data-theme', _resolved);

  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (_resolved === 'dark') { sun.style.display = 'none'; moon.style.display = 'block'; }
  else { sun.style.display = 'block'; moon.style.display = 'none'; }

  // Load color palette files and restore saved color theme selection
  await colorTheme.loadAll();
  colorTheme.restoreSaved();
  colorTheme.apply();

  // Detect and load language
  const lang = i18n.detect();
  await i18n.load(lang);

  // Apply all translations to static DOM elements
  applyTranslations();

  // Badges and status
  updateNotifBadge();
  updateConnectionStatus();

  // Ensure birthday event if birthdate set
  ensureBirthdayEvent();

  // Navigate to calendar (renders calendar + sets topbar two-row mode)
  navigate('calendar');

  // Check for timezone changes (after a brief delay so UI is ready)
  setTimeout(detectTimezoneChange, 1500);
}

window.addEventListener('DOMContentLoaded', () => {
  init();
  updateToggleBtn();
  initTopbarResponsive();
});

window.addEventListener('resize', updateToggleBtn);

/* ============================================================
   TOPBAR RESPONSIVE — Progressive compact levels for row 2
   Uses ResizeObserver on #topbar to detect real available width
   and applies tb-compact-N classes progressively.

   In two-row mode (calendar screen) row-2 spans the full topbar
   width, so compacting only triggers on genuinely narrow screens.

   Levels (cumulative):
     tb-compact-1  →  hide "Nuevo evento" text; tighten row-2-right gap
     tb-compact-2  →  hide "En vivo" text; further tighten
     tb-compact-3  →  collapse view-switcher to active-only (cycle on click)
     tb-compact-4  →  hide period date label
   ============================================================ */
function initTopbarResponsive() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  // Thresholds measured against topbar clientWidth.
  // Higher values = levels activate earlier = more room for all elements.
  const THRESHOLDS = {
    1: 780,   // hide new-event label + tighten gaps (6→4px)
    2: 640,   // hide "En vivo" label + tighten gaps (4→2px)
    3: 520,   // collapse view-switcher + tighten gaps (2→1px)
    4: 400,   // hide period label
  };

  function applyCompactLevels() {
    const w = topbar.clientWidth;
    for (let lvl = 1; lvl <= 4; lvl++) {
      topbar.classList.toggle(`tb-compact-${lvl}`, w <= THRESHOLDS[lvl]);
    }

    // En modo compacto: ocultar texto y mostrar ícono calendario; restaurar en modo normal
    const btnCreate = document.getElementById('btn-create-event');
    if (btnCreate) {
      const isCompact = w <= THRESHOLDS[1];
      const iconDesktop = btnCreate.querySelector('.btn-create-icon-desktop');
      const iconMobile = btnCreate.querySelector('.btn-create-icon-mobile');
      const label = btnCreate.querySelector('.btn-create-label');
      if (isCompact) {
        if (label) label.style.display = 'none';
        if (iconDesktop) iconDesktop.style.display = 'none';
        if (iconMobile) iconMobile.style.display = 'block';
      } else {
        if (label) label.style.display = '';
        if (iconDesktop) iconDesktop.style.display = '';
        if (iconMobile) iconMobile.style.display = 'none';
      }
    }
  }

  const ro = new ResizeObserver(() => applyCompactLevels());
  ro.observe(topbar);
  applyCompactLevels();
  // Re-run after first paint so clientWidth is accurate
  requestAnimationFrame(() => applyCompactLevels());

  /* ----------------------------------------------------------
     Compact view-switcher: cycle through views on click when
     only the active button is visible.
     This can happen via two independent mechanisms:
       1. JS: tb-compact-3 class on topbar (topbar width <= 520px)
       2. CSS: @media (max-width: 768px) + tb-two-row hides non-active
          buttons regardless of compact level.
     We detect the collapsed state by checking whether any
     non-active button is actually hidden, covering both cases.
     ---------------------------------------------------------- */
  const viewOrder = ['day', 'week', 'month', 'year'];

  function isSwitcherCollapsed() {
    // Collapsed = only the active button is visible (any non-active is hidden)
    const nonActive = document.querySelector('#view-switcher .view-btn:not(.active)');
    if (!nonActive) return false;
    return getComputedStyle(nonActive).display === 'none';
  }

  function cycleView() {
    const current = state.calView || 'week';
    const idx = viewOrder.indexOf(current);
    const next = viewOrder[(idx + 1) % viewOrder.length];
    setView(next);
  }

  /* ----------------------------------------------------------
     Manejo del clic en modo colapsado para pantallas medianas y angostas.
     Se reemplaza la lógica de capture+stopImmediatePropagation por un
     enfoque directo: cada botón evalúa al clic si el switcher está
     colapsado. Si es así, cicla la vista; si no, aplica la vista del botón.
     Esto cubre tb-compact-3 y @media <=768px+tb-two-row en todos los anchos,
     incluyendo pantallas medianas (tablets).
     ---------------------------------------------------------- */
  document.querySelectorAll('#view-switcher .view-btn').forEach(function (btn) {
    // Extraer la vista del atributo onclick existente (ej: setView('week'))
    var match = (btn.getAttribute('onclick') || '').match(/setView\(['"](\w+)['"]\)/);
    var viewForBtn = match ? match[1] : null;

    // Store as data attribute so setView() can still find the right button
    if (viewForBtn) btn.dataset.view = viewForBtn;

    // Eliminar el manejador inline para reemplazarlo con lógica unificada
    btn.removeAttribute('onclick');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isSwitcherCollapsed()) {
        // En modo colapsado: ciclar al siguiente
        cycleView();
      } else {
        // En modo expandido: ir directamente a la vista del botón
        if (viewForBtn) setView(viewForBtn);
      }
    });
  });
}