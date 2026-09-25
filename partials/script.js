function getApiBaseUrl() {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
        if (window.location.port === '5000') {
            return '/api';
        }
        const protocol = (window.location.protocol && window.location.protocol.startsWith('http')) ? window.location.protocol : 'http:';
        const hostname = window.location.hostname || 'localhost';
        return `${protocol}//${hostname}:5000/api`;
    }
    return 'http://localhost:5000/api';
}
window.getApiBaseUrl = getApiBaseUrl;

async function loadPartial(url, placeholderId) {
    const res = await fetch(url);
    const html = await res.text();
    const elem = document.getElementById(placeholderId);
    if (elem) elem.innerHTML = html;
};


function initMobileNav() {
    const navToggle = document.getElementById('mobileNavToggle');
    const hasCategoryNav = !!document.getElementById('filt-nav-placeholder');

    if (navToggle) {
        if (!hasCategoryNav) {
            // Nothing for the hamburger to open on this page (e.g. cart, checkout)
            navToggle.style.display = 'none';
        } else if (!navToggle.dataset.bound) {
            navToggle.dataset.bound = 'true';
            navToggle.addEventListener('click', () => {
                const isOpen = document.body.classList.toggle('mobile-menu-open');
                navToggle.classList.toggle('active', isOpen);
                navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }
    }

    const searchToggle = document.getElementById('mobileSearchToggle');
    const searchWrap = document.getElementById('searchWrap');
    if (searchToggle && searchWrap && !searchToggle.dataset.bound) {
        searchToggle.dataset.bound = 'true';
        searchToggle.addEventListener('click', () => {
            const isOpen = searchWrap.classList.toggle('mobile-search-open');
            if (isOpen) {
                const input = searchWrap.querySelector('.search-input');
                if (input) input.focus();
            }
        });
    }

    if (!document.body.dataset.mobileNavCloseBound) {
        document.body.dataset.mobileNavCloseBound = 'true';
        document.addEventListener('click', (event) => {
            if (event.target.closest('.nav-item') && document.body.classList.contains('mobile-menu-open')) {
                document.body.classList.remove('mobile-menu-open');
                const btn = document.getElementById('mobileNavToggle');
                if (btn) {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
}

async function updateHeaderUI() {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    let user = null;
    try { user = userStr ? JSON.parse(userStr) : null; } catch (e) {}

    const loginBtns = document.querySelectorAll('.btn-login');
    loginBtns.forEach(btn => {
        if (token && user) {
            const label = user.role === 'admin' ? 'Admin Dashboard' : 'Account';
            btn.title = label;
            btn.setAttribute('aria-label', label);
            btn.href = user.role === 'admin' ? '../pages/adminProducts.html' : '../pages/orderHistory.html';
            const img = btn.querySelector('img');
            if (img) img.alt = label;
        } else {
            btn.title = 'Log in';
            btn.setAttribute('aria-label', 'Log in');
            btn.href = '../pages/loginRegister.html';
            const img = btn.querySelector('img');
            if (img) img.alt = 'Log in';
        }
    });

    const cartBtns = document.querySelectorAll('.btn-cart');
    cartBtns.forEach(btn => {
        btn.title = 'Cart';
        btn.setAttribute('aria-label', 'Cart');
    });

    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        if (token) {
            try {
                const baseUrl = getApiBaseUrl();
                const res = await fetch(`${baseUrl}/cart`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const cart = data.data?.cart || data.data || data;
                    const items = cart.items || [];
                    const totalUnits = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
                    cartBadge.textContent = totalUnits;
                }
            } catch (err) {}
        } else {
            cartBadge.textContent = '0';
        }
    }
}

window.updateHeaderUI = updateHeaderUI;

function initHeaderSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput || searchInput.dataset.bound) return;
    searchInput.dataset.bound = 'true';

    const runSearch = () => {
        if (window.location.pathname.includes('productlist.html')) {
            return;
        }
        const query = searchInput.value.trim();
        if (window.location.pathname.includes('home.html')) {
            if (typeof window.performHomeSearch === 'function') {
                window.performHomeSearch(query);
            } else {
                const targetUrl = query ? `../pages/home.html?search=${encodeURIComponent(query)}` : '../pages/home.html';
                window.location.href = targetUrl;
            }
        } else {
            const targetUrl = query ? `../pages/home.html?search=${encodeURIComponent(query)}` : '../pages/home.html';
            window.location.href = targetUrl;
        }
    };

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearch();
        }
    });

    const searchIcon = document.getElementById('searchIconBtn');
    if (searchIcon) {
        searchIcon.addEventListener('click', runSearch);
    }
}

initMobileNav();
loadPartial('../partials/header.html', 'header-placeholder').then(() => {
    initMobileNav();
    updateHeaderUI();
    initHeaderSearch();
});
loadPartial('../partials/footer.html', 'footer-placeholder');
updateHeaderUI();

const filtPlaceholder = document.getElementById('filt-nav-placeholder');
if (filtPlaceholder) {
    loadPartial('../partials/navigation.html', 'filt-nav-placeholder').then(() => {
        const navCont = document.getElementById('categoryNav');
        if (navCont) {
            navCont.addEventListener('click', (event) => {
                const clickbtn = event.target.closest('.nav-item');
                if (!clickbtn) return;

                navCont.querySelectorAll('.nav-item').forEach(btn => {
                    btn.classList.remove('active');
                });

                clickbtn.classList.add('active');
                const selectCat = clickbtn.dataset.category;
                if (typeof filterProducts === 'function') {
                    filterProducts(selectCat);
                }
            });
        }
    });
}

//In-Website custom prompt and notif modal system
function injectPromptStyles() {
    if (document.getElementById('custom-prompt-styles')) return;
    const style = document.createElement('style');
    style.id = 'custom-prompt-styles';
    style.textContent = `
        .custom-prompt-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 28, 63, 0.6);
            backdrop-filter: blur(4px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            animation: fadeInPrompt 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeInPrompt {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .custom-prompt-dialog {
            background: #ffffff;
            color: #121826;
            border-radius: 16px;
            width: 100%;
            max-width: 440px;
            padding: 1.75rem;
            box-shadow: 0 16px 36px rgba(15, 28, 63, 0.2);
            border: 1px solid #e5e9f2;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            animation: popUpPrompt 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body.dark-mode .custom-prompt-dialog {
            background: #1e293b;
            color: #f8fafc;
            border-color: #334155;
        }

        @keyframes popUpPrompt {
            from { transform: scale(0.95) translateY(10px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .prompt-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .prompt-icon-badge {
            width: 42px;
            height: 42px;
            background: #fbf7ec;
            color: #c59b27;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
        }

        .prompt-title {
            font-family: 'Fraunces', serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f1c3f;
            line-height: 1.25;
        }

        body.dark-mode .prompt-title {
            color: #f8fafc;
        }

        .prompt-body-text {
            font-size: 0.92rem;
            color: #5e6b82;
            line-height: 1.55;
        }

        body.dark-mode .prompt-body-text {
            color: #cbd5e1;
        }

        .prompt-actions-row {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 0.5rem;
        }

        .btn-prompt-ok {
            background: #0f1c3f;
            color: #ffffff;
            border: none;
            padding: 0.65rem 1.4rem;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-prompt-ok:hover {
            background: #c59b27;
        }

        .btn-prompt-cancel {
            background: #f1f5f9;
            color: #475569;
            border: none;
            padding: 0.65rem 1.25rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-prompt-cancel:hover {
            background: #e2e8f0;
        }
    `;
    document.head.appendChild(style);
}

// Displays an in-website prompt notification modal which replaces native browser alert

function showNotificationPrompt(title, message, onOk = null, icon = '') {
    injectPromptStyles();
    
    const existing = document.getElementById('customPromptOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-prompt-overlay';
    overlay.id = 'customPromptOverlay';

    const iconHtml = icon ? `<div class="prompt-icon-badge">${icon}</div>` : '';

    overlay.innerHTML = `
        <div class="custom-prompt-dialog" role="dialog" aria-modal="true">
            <div class="prompt-header">
                ${iconHtml}
                <h3 class="prompt-title">${escapePromptHtml(title)}</h3>
            </div>
            <p class="prompt-body-text">${escapePromptHtml(message)}</p>
            <div class="prompt-actions-row">
                <button type="button" class="btn-prompt-ok" id="promptOkBtn">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('promptOkBtn').addEventListener('click', () => {
        overlay.remove();
        if (typeof onOk === 'function') onOk();
    });
}

// Displays an in-website confirmation prompt modal which replaces native browser confirm

function showConfirmPrompt(title, message, onConfirm = null, onCancel = null, icon = '') {
    injectPromptStyles();
    
    const existing = document.getElementById('customPromptOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-prompt-overlay';
    overlay.id = 'customPromptOverlay';

    const iconHtml = icon ? `<div class="prompt-icon-badge">${icon}</div>` : '';

    overlay.innerHTML = `
        <div class="custom-prompt-dialog" role="dialog" aria-modal="true">
            <div class="prompt-header">
                ${iconHtml}
                <h3 class="prompt-title">${escapePromptHtml(title)}</h3>
            </div>
            <p class="prompt-body-text">${escapePromptHtml(message)}</p>
            <div class="prompt-actions-row">
                <button type="button" class="btn-prompt-cancel" id="promptCancelBtn">Cancel</button>
                <button type="button" class="btn-prompt-ok" id="promptConfirmBtn">Confirm</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('promptConfirmBtn').addEventListener('click', () => {
        overlay.remove();
        if (typeof onConfirm === 'function') onConfirm();
    });

    document.getElementById('promptCancelBtn').addEventListener('click', () => {
        overlay.remove();
        if (typeof onCancel === 'function') onCancel();
    });
}

function escapePromptHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
