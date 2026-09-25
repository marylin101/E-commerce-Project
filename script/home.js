function getApiBaseUrl() {
    return '/api';
}

let currentHomeCategory = 'all';
let currentHomeSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentHomeSearch = urlParams.get('search') || '';
    currentHomeCategory = urlParams.get('category') || urlParams.get('categoryId') || 'all';

    syncHomeSearchInput(currentHomeSearch);
    loadHomeProducts(currentHomeCategory, currentHomeSearch);
    setupHomeSearchListeners();
});

function syncHomeSearchInput(searchTerm) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        if (searchTerm) searchInput.value = searchTerm;
    } else {
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            const observer = new MutationObserver(() => {
                const el = document.getElementById('searchInput');
                if (el) {
                    if (searchTerm) el.value = searchTerm;
                    observer.disconnect();
                }
            });
            observer.observe(placeholder, { childList: true, subtree: true });
        }
    }
}

function setupHomeSearchListeners() {
    let searchInput = document.getElementById('searchInput');
    let debounceTimer;

    const handleInput = (e) => {
        currentHomeSearch = e.target.value.trim();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateHomeUrl(currentHomeCategory, currentHomeSearch);
            loadHomeProducts(currentHomeCategory, currentHomeSearch);
        }, 300);
    };

    const bindSearchInput = (el) => {
        if (!el || el.dataset.homeSearchBound) return;
        el.dataset.homeSearchBound = 'true';
        el.addEventListener('input', handleInput);
    };

    if (searchInput) {
        bindSearchInput(searchInput);
    } else {
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            const observer = new MutationObserver(() => {
                const el = document.getElementById('searchInput');
                if (el) {
                    bindSearchInput(el);
                    observer.disconnect();
                }
            });
            observer.observe(placeholder, { childList: true, subtree: true });
        }
    }
}

function updateHomeUrl(category, search) {
    if (typeof window === 'undefined' || !window.history) return;
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('categoryId', category);
    if (search) params.set('search', search);
    const newQuery = params.toString();
    const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState({}, '', newUrl);
}

window.performHomeSearch = function(query) {
    currentHomeSearch = (query || '').trim();
    updateHomeUrl(currentHomeCategory, currentHomeSearch);
    loadHomeProducts(currentHomeCategory, currentHomeSearch);
};

async function loadHomeProducts(categoryFilter = 'all', searchFilter = '') {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    try {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading stationery catalog...</p>';
        const baseUrl = getApiBaseUrl();
        const queryParams = new URLSearchParams();
        if (categoryFilter && categoryFilter !== 'all') {
            queryParams.set('categoryId', categoryFilter);
        }
        if (searchFilter) {
            queryParams.set('search', searchFilter);
        }
        const queryString = queryParams.toString();
        const url = queryString ? `${baseUrl}/products?${queryString}` : `${baseUrl}/products`;
        const res = await fetch(url);
        const text = await res.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error('Server returned non-JSON response. Please ensure backend is running on port 5000.');
        }

        const payload = data.data !== undefined ? data.data : data;
        const productsPayload = payload.products !== undefined ? payload.products : payload;
        const products = Array.isArray(productsPayload) ? productsPayload : (productsPayload.items || []);

        if (!products.length) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products available matching your criteria.</p>';
            return;
        }

        grid.innerHTML = products.map(p => {
            const id = p._id || p.id;
            const price = parseFloat(p.price || 0);
            const stock = p.stockQty !== undefined ? p.stockQty : (p.stock || 0);
            const tag = p.categoryName || (p.categoryId?.name) || 'Stationery';
            const images = p.images || [];
            const imgSrc = (images.length && typeof images[0] === 'string') ? images[0] : '../assets/product-placeholder.png';
            const safeNameAttr = escapeHtml(p.name).replace(/'/g, "&#39;");
            const safeNameJs = escapeHtml(p.name).replace(/'/g, "\\'");

            return `
              <div class="item-card" data-id="${id}">
                <div class="image-container" style="overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc;">
                  <img src="${imgSrc}" alt="${safeNameAttr}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='../assets/cart.png';" />
                  <button type="button" class="hover-btn" onclick="addToCartHome('${id}', '${safeNameJs}')">+ Add to Tray</button>
                </div>
                <span class="tag">${escapeHtml(tag)}</span>
                <div class="title"><a href="../pages/product.html?id=${id}" style="color: inherit; text-decoration: none;">${escapeHtml(p.name)}</a></div>
                <div class="bottom-row">
                  <span class="price">R ${price.toFixed(2)}</span>
                  <span class="stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">${stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
                </div>
              </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load home products:', err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #e11d48;">Unable to connect to product catalog server.</p>';
    }
}

window.addToCartHome = async function(productId, productName) {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    if (!token) {
        if (typeof showNotificationPrompt === 'function') {
            showNotificationPrompt('Sign In Required', 'Please log in to add items to your study tray.', () => {
                window.location.href = '../pages/loginRegister.html';
            });
        } else {
            alert('Please log in to add items to your cart.');
            window.location.href = '../pages/loginRegister.html';
        }
        return;
    }

    try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || data.message || 'Failed to add item to cart');
        }

        if (typeof window.updateHeaderUI === 'function') {
            window.updateHeaderUI();
        }

        if (typeof showNotificationPrompt === 'function') {
            showNotificationPrompt('Added to Tray', `"${productName}" has been added to your study tray.`, null);
        } else {
            alert(`"${productName}" added to cart!`);
        }
    } catch (err) {
        alert(err.message);
    }
};

window.filterProducts = function(category) {
    currentHomeCategory = category || 'all';
    updateHomeUrl(currentHomeCategory, currentHomeSearch);
    loadHomeProducts(currentHomeCategory, currentHomeSearch);
};

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}