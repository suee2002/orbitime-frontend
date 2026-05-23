/**
 * ============================================================
 * INICIO DE SESIÓN Y REGISTRO — inicio_sesion_registro.js
 * ============================================================
 * Gestiona las pantallas de autenticación de Calendara.
 *
 * IMPORTANTE:
 * - Los textos del sistema usan t() para internacionalización
 * - Los datos de usuario (email, nombre, etc.) NUNCA se traducen
 * - Preparado para futura conexión con backend real
 *
 * ARQUITECTURA FUTURA:
 * - Las funciones _doLogin() y _doRegister() se conectarán
 *   al endpoint de autenticación del backend
 * - El token JWT se guardará de forma segura
 * ============================================================
 */

const AuthScreen = (() => {
    'use strict';

    let _el = null;
    let _currentTab = 'login'; // 'login' | 'register'
    let _onSuccess = null;

    /* ============================================================
       RENDER DE TEXTOS (Sistema i18n)
       ============================================================ */

    /**
     * Actualiza TODOS los textos del sistema con el idioma actual.
     * Los valores de los inputs de usuario NO se tocan.
     */
    function _updateTexts() {
        if (!_el) return;

        const set = (sel, key, attr = 'textContent') => {
            const el = _el.querySelector(sel);
            if (!el) return;
            if (attr === 'textContent') el.textContent = t(key);
            else if (attr === 'placeholder') el.placeholder = t(key);
        };

        // App name
        set('.auth-app-name', 'app.name');

        // Tabs
        const loginTab = _el.querySelector('[data-tab="login"]');
        const registerTab = _el.querySelector('[data-tab="register"]');
        if (loginTab) loginTab.textContent = t('auth.login');
        if (registerTab) registerTab.textContent = t('auth.register');

        // Encabezados según pestaña activa
        _updateHeaderTexts();

        // Labels de campos
        set('[data-label="email"]', 'auth.email');
        set('[data-label="password"]', 'auth.password');
        set('[data-label="confirmPassword"]', 'auth.confirmPassword');
        set('[data-label="name"]', 'auth.name');
        set('[data-label="username"]', 'auth.username');

        // Placeholders
        set('[data-field="email"]', 'auth.emailPlaceholder', 'placeholder');
        set('[data-field="password"]', 'auth.passwordPlaceholder', 'placeholder');
        set('[data-field="confirmPassword"]', 'auth.confirmPasswordPlaceholder', 'placeholder');
        set('[data-field="name"]', 'auth.namePlaceholder', 'placeholder');
        set('[data-field="username"]', 'auth.usernamePlaceholder', 'placeholder');

        // Opciones
        set('[data-auth="rememberMe"]', 'auth.rememberMe');
        set('[data-auth="forgotPassword"]', 'auth.forgotPassword');

        // Botón principal
        const submitBtn = _el.querySelector('.auth-btn-primary span');
        if (submitBtn) {
            submitBtn.textContent = _currentTab === 'login' ? t('auth.loginBtn') : t('auth.registerBtn');
        }

        // Divisor
        set('[data-auth="orWith"]', 'auth.orContinueWith');

        // Botones sociales
        set('[data-auth="googleBtn"]', 'auth.continueWithGoogle');
        set('[data-auth="appleBtn"]', 'auth.continueWithApple');

        // Switch link
        _updateSwitchLink();

        // Términos
        const termsEl = _el.querySelector('[data-auth="terms"]');
        if (termsEl) {
            termsEl.innerHTML = `${t('auth.termsNotice')} <a href="#" onclick="return false;">${t('auth.terms')}</a> ${t('auth.and')} <a href="#" onclick="return false;">${t('auth.privacy')}</a>`;
        }
    }

    function _updateHeaderTexts() {
        const titleEl = _el?.querySelector('.auth-title');
        const subtitleEl = _el?.querySelector('.auth-subtitle');
        if (!titleEl || !subtitleEl) return;

        if (_currentTab === 'login') {
            titleEl.textContent = t('auth.login');
            subtitleEl.textContent = t('app.tagline');
        } else {
            titleEl.textContent = t('auth.register');
            subtitleEl.textContent = t('app.tagline');
        }
    }

    function _updateSwitchLink() {
        const el = _el?.querySelector('.auth-switch-link');
        if (!el) return;
        if (_currentTab === 'login') {
            el.innerHTML = `${t('auth.noAccount')} <button onclick="AuthScreen.switchTab('register')">${t('auth.registerBtn')}</button>`;
        } else {
            el.innerHTML = `${t('auth.hasAccount')} <button onclick="AuthScreen.switchTab('login')">${t('auth.loginBtn')}</button>`;
        }
    }

    /* ============================================================
       GESTIÓN DE PESTAÑAS
       ============================================================ */

    /**
     * Cambia entre login y registro.
     * @param {'login'|'register'} tab
     */
    function switchTab(tab) {
        _currentTab = tab;

        // Actualizar pestañas activas
        _el?.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        // Mostrar/ocultar campos específicos de registro
        const registerFields = _el?.querySelectorAll('[data-register-only]');
        registerFields?.forEach(f => {
            f.style.display = tab === 'register' ? '' : 'none';
        });

        // Limpiar errores
        _clearErrors();

        // Actualizar textos
        _updateHeaderTexts();
        _updateSwitchLink();

        const submitBtn = _el?.querySelector('.auth-btn-primary span');
        if (submitBtn) {
            submitBtn.textContent = tab === 'login' ? t('auth.loginBtn') : t('auth.registerBtn');
        }
    }

    /* ============================================================
       VALIDACIÓN
       ============================================================ */

    function _clearErrors() {
        _el?.querySelectorAll('.auth-field-error').forEach(el => el.classList.remove('visible'));
        _el?.querySelectorAll('.auth-input').forEach(el => el.classList.remove('error'));
        const globalErr = _el?.querySelector('.auth-global-error');
        if (globalErr) globalErr.classList.remove('visible');
    }

    function _showFieldError(field, message) {
        const input = _el?.querySelector(`[data-field="${field}"]`);
        const errEl = _el?.querySelector(`[data-field-error="${field}"]`);
        if (input) input.classList.add('error');
        if (errEl) { errEl.textContent = message; errEl.classList.add('visible'); }
    }

    function _showGlobalError(message) {
        const el = _el?.querySelector('.auth-global-error');
        if (el) { el.textContent = message; el.classList.add('visible'); }
    }

    function _validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function _validateLogin(email, password) {
        let valid = true;
        if (!email || !_validateEmail(email)) {
            _showFieldError('email', t('auth.errorInvalidEmail'));
            valid = false;
        }
        if (!password || password.length < 1) {
            _showFieldError('password', t('errors.required'));
            valid = false;
        }
        return valid;
    }

    function _validateRegister(name, username, email, password, confirmPassword) {
        let valid = true;
        if (!name || name.trim().length < 2) {
            _showFieldError('name', t('errors.tooShort'));
            valid = false;
        }
        if (!username || username.trim().length < 2) {
            _showFieldError('username', t('errors.tooShort'));
            valid = false;
        }
        if (!email || !_validateEmail(email)) {
            _showFieldError('email', t('auth.errorInvalidEmail'));
            valid = false;
        }
        if (!password || password.length < 8) {
            _showFieldError('password', t('auth.errorWeakPassword'));
            valid = false;
        }
        if (password !== confirmPassword) {
            _showFieldError('confirmPassword', t('auth.errorPasswordMismatch'));
            valid = false;
        }
        return valid;
    }

    /* ============================================================
       ACCIONES DE AUTENTICACIÓN
       (Preparadas para backend — actualmente simuladas)
       ============================================================ */

    /**
     * Simula el login.
     * TODO: Conectar con POST /api/auth/login cuando exista el backend.
     */
    async function _doLogin(email, password) {
        // [BACKEND FUTURE] const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({email,password}) });
        // Simulación de delay de red
        await new Promise(r => setTimeout(r, 900));
        // En producción, aquí se verificaría la respuesta del servidor
        return { success: true, user: { email } };
    }

    /**
     * Simula el registro.
     * TODO: Conectar con POST /api/auth/register cuando exista el backend.
     */
    async function _doRegister(name, username, email, password) {
        // [BACKEND FUTURE] const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({name,username,email,password}) });
        await new Promise(r => setTimeout(r, 1100));
        return { success: true, user: { name, username, email } };
    }

    /* ============================================================
       SUBMIT
       ============================================================ */

    async function _handleSubmit() {
        _clearErrors();

        const submitBtn = _el?.querySelector('.auth-btn-primary');
        if (!submitBtn) return;

        // Obtener valores de los campos (datos de usuario — NO se traducen)
        const email = _el?.querySelector('[data-field="email"]')?.value?.trim() || '';
        const password = _el?.querySelector('[data-field="password"]')?.value || '';

        let result;

        if (_currentTab === 'login') {
            if (!_validateLogin(email, password)) return;

            submitBtn.disabled = true;
            try {
                result = await _doLogin(email, password);
                if (result.success) {
                    hide();
                    showToast(t('auth.successLoggedIn'), '✅');
                    _onSuccess?.();
                } else {
                    _showGlobalError(t('auth.errorInvalidCredentials'));
                }
            } catch (e) {
                _showGlobalError(t('errors.generic'));
            } finally {
                submitBtn.disabled = false;
            }

        } else {
            // Registro
            const name = _el?.querySelector('[data-field="name"]')?.value?.trim() || '';
            const username = _el?.querySelector('[data-field="username"]')?.value?.trim() || '';
            const confirmPassword = _el?.querySelector('[data-field="confirmPassword"]')?.value || '';

            if (!_validateRegister(name, username, email, password, confirmPassword)) return;

            submitBtn.disabled = true;
            try {
                result = await _doRegister(name, username, email, password);
                if (result.success) {
                    hide();
                    showToast(t('auth.successRegistered'), '🎉');
                    _onSuccess?.();
                } else {
                    _showGlobalError(t('auth.errorEmailInUse'));
                }
            } catch (e) {
                _showGlobalError(t('errors.generic'));
            } finally {
                submitBtn.disabled = false;
            }
        }
    }

    /* ============================================================
       VISIBILIDAD
       ============================================================ */

    /**
     * Muestra la pantalla de auth.
     * @param {Function} [onSuccess] - Callback al autenticarse correctamente
     */
    function show(onSuccess) {
        _onSuccess = onSuccess || null;
        if (_el) {
            _el.classList.add('visible');
            _updateTexts();
        }
    }

    /**
     * Oculta la pantalla de auth.
     */
    function hide() {
        _el?.classList.remove('visible');
    }

    /* ============================================================
       INICIALIZACIÓN
       ============================================================ */

    /**
     * Inicializa el módulo de autenticación.
     */
    function init() {
        _el = document.getElementById('auth-screen');
        if (!_el) return;

        // Listener de cambio de idioma
        i18n.onChange(() => _updateTexts());

        // Botón submit (enter en inputs o click en botón)
        const submitBtn = _el.querySelector('.auth-btn-primary');
        if (submitBtn) submitBtn.addEventListener('click', _handleSubmit);

        // Enter en inputs
        _el.querySelectorAll('.auth-input').forEach(input => {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') _handleSubmit();
            });
        });
    }

    return { init, show, hide, switchTab };
})();

window.AuthScreen = AuthScreen;