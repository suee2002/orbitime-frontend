/**
 * ============================================================
 * PANTALLA DE CARGA — pantalla_carga.js
 * ============================================================
 * Gestiona la pantalla splash de inicio de la aplicación.
 *
 * COMPORTAMIENTO:
 * - Se muestra al iniciar la aplicación
 * - Espera a que el i18n esté listo
 * - Se oculta con animación suave cuando la app está lista
 * ============================================================
 */

const SplashScreen = (() => {
    'use strict';

    const SPLASH_MIN_DURATION = 1800; // ms mínimo que se muestra

    let _el = null;
    let _startTime = Date.now();
    let _resolved = false;

    /* ============================================================
       RENDER
       ============================================================ */

    /**
     * Actualiza los textos de la splash screen con el idioma actual.
     * Solo textos del sistema, nunca datos de usuario.
     */
    function _updateTexts() {
        const loadingEl = _el?.querySelector('.splash-loading-text');
        if (loadingEl) loadingEl.textContent = t('splash.loading');

        const nameEl = _el?.querySelector('.splash-app-name');
        if (nameEl) nameEl.textContent = t('app.name');
    }

    /* ============================================================
       CICLO DE VIDA
       ============================================================ */

    /**
     * Inicializa la splash screen.
     * Se llama antes de que i18n esté listo (usar textos literales de respaldo).
     */
    function init() {
        _el = document.getElementById('splash-screen');
        if (!_el) return;

        _startTime = Date.now();

        // Registrar callback para cuando cambie el idioma
        i18n.onChange(() => _updateTexts());
    }

    /**
     * Actualiza textos una vez que i18n esté listo.
     */
    function onI18nReady() {
        _updateTexts();
    }

    /**
     * Oculta la splash screen con animación fluida.
     * Respeta el tiempo mínimo de visualización.
     * @param {Function} [callback] - Función a llamar al terminar
     */
    function hide(callback) {
        if (_resolved) return;
        _resolved = true;

        const elapsed = Date.now() - _startTime;
        const remaining = Math.max(0, SPLASH_MIN_DURATION - elapsed);

        setTimeout(() => {
            if (!_el) {
                callback?.();
                return;
            }

            _el.classList.add('hidden');

            // Eliminar del DOM después de la transición
            _el.addEventListener('transitionend', () => {
                _el.remove();
                callback?.();
            }, { once: true });

            // Fallback por si la transición no dispara
            setTimeout(() => {
                _el?.remove();
                callback?.();
            }, 500);
        }, remaining);
    }

    /**
     * Muestra la splash screen (para casos de recarga manual).
     */
    function show() {
        if (_el) {
            _el.classList.remove('hidden');
            _resolved = false;
            _startTime = Date.now();
        }
    }

    return { init, onI18nReady, hide, show };
})();

window.SplashScreen = SplashScreen;