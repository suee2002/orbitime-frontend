/**
 * ============================================================
 * CALENDARA — SISTEMA DE INTERNACIONALIZACIÓN (i18n)
 * ============================================================
 * Motor de traducciones profesional y escalable.
 *
 * PRINCIPIOS:
 * - Idioma por defecto: español (es)
 * - Los textos del sistema usan claves de traducción
 * - Los datos de usuario NUNCA se traducen
 * - El idioma seleccionado se persiste en localStorage
 * - Preparado para futura persistencia en backend/DB
 *
 * USO:
 *   t('sidebar.calendar')              → "Mi Calendario"
 *   t('notifications.minutesAgo', 5)  → "hace 5 min"
 *   i18n.setLanguage('en')            → cambia a inglés
 *   i18n.currentLang                  → "es"
 * ============================================================
 */

const i18n = (() => {
    'use strict';

    /* ============================================================
       CONFIGURACIÓN
       ============================================================ */
    const SUPPORTED_LANGS = ['es', 'en', 'pt', 'ca', 'ja'];
    const DEFAULT_LANG = 'es';
    const STORAGE_KEY = 'calendara_lang';

    /* ============================================================
       ESTADO INTERNO
       ============================================================ */
    let _currentLang = DEFAULT_LANG;
    let _translations = {};
    let _onChangeCallbacks = [];

    /* ============================================================
       CARGA DE TRADUCCIONES
       ============================================================ */

    /**
     * Carga el archivo JSON de traducciones para un idioma dado.
     * Retorna una promesa.
     * @param {string} lang - Código de idioma (ej: 'es', 'en')
     * @returns {Promise<object>} - Objeto de traducciones
     */
    async function _loadTranslations(lang) {
        try {
            const response = await fetch(`./i18n/${lang}.json`);
            if (!response.ok) throw new Error(`No se pudo cargar el idioma: ${lang}`);
            return await response.json();
        } catch (err) {
            console.warn(`[i18n] Error cargando "${lang}", usando respaldo.`, err);
            // Si falla, intenta cargar el idioma por defecto
            if (lang !== DEFAULT_LANG) {
                return await _loadTranslations(DEFAULT_LANG);
            }
            return {};
        }
    }

    /* ============================================================
       RESOLUCIÓN DE CLAVES
       ============================================================ */

    /**
     * Resuelve una clave de traducción en el objeto de traducciones.
     * Soporta claves anidadas con punto: 'sidebar.calendar'
     * @param {string} key - Clave de traducción
     * @returns {string|null} - Valor encontrado o null
     */
    function _resolve(key) {
        return key.split('.').reduce((obj, segment) => {
            return obj && typeof obj === 'object' ? obj[segment] : undefined;
        }, _translations) ?? null;
    }

    /* ============================================================
       FUNCIÓN PRINCIPAL DE TRADUCCIÓN
       ============================================================ */

    /**
     * Traduce una clave del sistema.
     * NUNCA usar para contenido de usuarios.
     *
     * @param {string} key - Clave de traducción (ej: 'sidebar.calendar')
     * @param {string|number} [interpolation] - Valor para reemplazar {n}
     * @returns {string} - Texto traducido o la clave si no se encuentra
     */
    function t(key, interpolation) {
        const value = _resolve(key);

        if (value === null || value === undefined) {
            if (process?.env?.NODE_ENV !== 'production') {
                console.warn(`[i18n] Clave no encontrada: "${key}" (lang: ${_currentLang})`);
            }
            return key; // Retorna la clave como fallback visible
        }

        // Interpolación: reemplaza {n} con el valor dado
        if (interpolation !== undefined) {
            return String(value).replace('{n}', interpolation);
        }

        return String(value);
    }

    /* ============================================================
       GETTERS DE CALENDARIOS/FECHAS
       ============================================================ */

    /**
     * Retorna el array de nombres de meses cortos (para el calendario)
     * @returns {string[]}
     */
    function getMonthsShort() {
        const ms = _translations?.calendar?.monthsShort;
        if (!ms) return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return Object.values(ms);
    }

    /**
     * Retorna el array de nombres de meses completos
     * @returns {string[]}
     */
    function getMonths() {
        const m = _translations?.calendar?.months;
        if (!m) return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return Object.values(m);
    }

    /**
     * Retorna el array de días de la semana cortos (Lun, Mar, ...)
     * @returns {string[]}
     */
    function getDaysShort() {
        const d = _translations?.calendar?.days;
        if (!d) return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        return Object.values(d);
    }

    /* ============================================================
       GESTIÓN DE IDIOMA
       ============================================================ */

    /**
     * Cambia el idioma de la aplicación.
     * Actualiza la UI, persiste la selección y notifica a los listeners.
     * @param {string} lang - Código de idioma
     * @returns {Promise<void>}
     */
    async function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`[i18n] Idioma no soportado: "${lang}". Idiomas disponibles: ${SUPPORTED_LANGS.join(', ')}`);
            return;
        }

        const newTranslations = await _loadTranslations(lang);
        _translations = newTranslations;
        _currentLang = lang;

        // Persistir en localStorage
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            console.warn('[i18n] No se pudo guardar idioma en localStorage', e);
        }

        // Actualizar atributo lang del documento
        document.documentElement.lang = lang;

        // Notificar a todos los listeners registrados
        _onChangeCallbacks.forEach(cb => {
            try { cb(lang); } catch (e) { console.error('[i18n] Error en callback de cambio de idioma', e); }
        });
    }

    /**
     * Obtiene el idioma guardado o detecta el del navegador.
     * Orden de prioridad:
     * 1. localStorage (preferencia del usuario)
     * 2. Idioma del navegador
     * 3. Idioma por defecto (es)
     * @returns {string}
     */
    function _detectLanguage() {
        // 1. Preferencia guardada
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
        } catch (e) { /* sin acceso a localStorage */ }

        // 2. Idioma del navegador
        const browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase();
        if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

        // 3. Por defecto
        return DEFAULT_LANG;
    }

    /**
     * Registra un callback que se ejecuta cuando cambia el idioma.
     * Útil para re-renderizar componentes.
     * @param {Function} callback - Función a llamar con el nuevo código de idioma
     */
    function onChange(callback) {
        if (typeof callback === 'function') {
            _onChangeCallbacks.push(callback);
        }
    }

    /**
     * Elimina un callback registrado
     * @param {Function} callback
     */
    function offChange(callback) {
        _onChangeCallbacks = _onChangeCallbacks.filter(cb => cb !== callback);
    }

    /* ============================================================
       INICIALIZACIÓN
       ============================================================ */

    /**
     * Inicializa el sistema de i18n.
     * Debe llamarse antes de usar t() por primera vez.
     * @returns {Promise<void>}
     */
    async function init() {
        const lang = _detectLanguage();
        const translations = await _loadTranslations(lang);
        _translations = translations;
        _currentLang = lang;
        document.documentElement.lang = lang;

        // Persistir el idioma detectado
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* sin acceso */ }

        return lang;
    }

    /* ============================================================
       API PÚBLICA
       ============================================================ */
    return {
        init,
        t,
        setLanguage,
        onChange,
        offChange,
        getMonths,
        getMonthsShort,
        getDaysShort,
        get currentLang() { return _currentLang; },
        get supportedLangs() { return [...SUPPORTED_LANGS]; },
    };
})();

// Disponible globalmente
window.i18n = i18n;

// Alias global para comodidad
window.t = (key, interp) => i18n.t(key, interp);