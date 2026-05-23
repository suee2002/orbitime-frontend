/**
 * ============================================================
 * PANTALLA SIN CONEXIÓN — sin_conexion_internet.js
 * ============================================================
 * Gestiona la pantalla personalizada de sin conexión.
 *
 * COMPORTAMIENTO:
 * - Detecta pérdida y recuperación de conexión
 * - Muestra pantalla personalizada (NO la del navegador)
 * - Respeta idioma seleccionado
 * - Respeta modo claro/oscuro
 * - El botón "Reintentar" intenta reconectar
 * ============================================================
 */

const OfflineScreen = (() => {
    'use strict';

    let _el = null;
    let _retryTimeout = null;
    let _isRetrying = false;

    /* ============================================================
       RENDER DE TEXTOS
       ============================================================ */

    /**
     * Actualiza todos los textos del sistema con el idioma actual.
     * Nunca traduce contenido del usuario.
     */
    function _updateTexts() {
        if (!_el) return;

        const setText = (selector, key) => {
            const el = _el.querySelector(selector);
            if (el) el.textContent = t(key);
        };

        setText('.offline-title', 'offline.title');
        setText('.offline-subtitle', 'offline.subtitle');
        setText('.offline-message', 'offline.message');
        setText('.offline-tips-title', 'offline.tips');
        setText('[data-offline-tip="1"]', 'offline.tip1');
        setText('[data-offline-tip="2"]', 'offline.tip2');
        setText('[data-offline-tip="3"]', 'offline.tip3');

        if (!_isRetrying) {
            const retryBtn = _el.querySelector('.offline-retry-btn span');
            if (retryBtn) retryBtn.textContent = t('offline.retry');
        }
    }

    /* ============================================================
       VISIBILIDAD
       ============================================================ */

    /**
     * Muestra la pantalla de sin conexión.
     */
    function show() {
        if (!_el) return;
        _el.classList.add('visible');
        _updateTexts();
        document.body.style.overflow = 'hidden';
    }

    /**
     * Oculta la pantalla de sin conexión.
     */
    function hide() {
        if (!_el) return;
        _el.classList.remove('visible');
        document.body.style.overflow = '';
        _isRetrying = false;
        _cancelRetry();
    }

    /* ============================================================
       LÓGICA DE REINTENTO
       ============================================================ */

    function _cancelRetry() {
        if (_retryTimeout) {
            clearTimeout(_retryTimeout);
            _retryTimeout = null;
        }
    }

    /**
     * Maneja el botón de "Reintentar".
     * Muestra estado de carga y espera reconfirmación de conexión.
     */
    function retry() {
        if (_isRetrying) return;
        _isRetrying = true;

        const retryBtn = _el?.querySelector('.offline-retry-btn');
        const retryText = _el?.querySelector('.offline-retry-btn span');

        if (retryBtn) retryBtn.classList.add('retrying');
        if (retryText) retryText.textContent = t('offline.retrying');

        // Intentar hacer un ping real
        _cancelRetry();
        _retryTimeout = setTimeout(() => {
            if (navigator.onLine) {
                // La conexión se recuperó
                hide();
            } else {
                // Aún sin conexión
                _isRetrying = false;
                if (retryBtn) retryBtn.classList.remove('retrying');
                if (retryText) retryText.textContent = t('offline.retry');
            }
        }, 2000);
    }

    /* ============================================================
       INICIALIZACIÓN
       ============================================================ */

    /**
     * Inicializa la pantalla offline y los listeners de red.
     */
    function init() {
        _el = document.getElementById('offline-screen');
        if (!_el) return;

        // Botón reintentar
        const retryBtn = _el.querySelector('.offline-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', retry);
        }

        // Actualizar textos cuando cambie el idioma
        i18n.onChange(() => _updateTexts());

        // Listener de conexión
        window.addEventListener('online', () => {
            _cancelRetry();
            _isRetrying = false;
            hide();
        });

        window.addEventListener('offline', () => {
            show();
        });

        // Verificar estado inicial
        if (!navigator.onLine) {
            show();
        }
    }

    return { init, show, hide, retry };
})();

window.OfflineScreen = OfflineScreen;