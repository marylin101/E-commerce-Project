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

document.addEventListener('DOMContentLoaded', () => {
    initPersonalizedGreeting();
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search') || '';
    if (searchTerm) {
        fetchProductsFromDatabase({ search: searchTerm });
    } else {
        fetchProductsFromDatabase();
    }
    setupFilterAndSearchListeners(searchTerm);
});

function initPersonalizedGreeting() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    const nameEl = document.getElementById('customerDisplayName');
    if (!nameEl) return;

    try {
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user.name) {
            nameEl.textContent = user.name;
        } else {
            nameEl.textContent = 'Valued Scholar';
        }
    } catch (e) {
        nameEl.textContent = 'Valued Scholar';
    }
}

async function fetchProductsFromDatabase(queryParams = {}) {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    try {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading products...</p>';
        const baseUrl = getApiBaseUrl();
        const queryString = new URLSearchParams(queryParams).toString();
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

        renderProductGrid(products);
    } catch (error) {
        console.error('Failed to load products from database:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #e11d48;">Error connecting to product catalog server.</p>';
    }
}

function renderProductGrid(products) {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    if (!products || !products.length) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found matching your criteria.</p>';
        return;
    }

    grid.innerHTML = products.map(item => {
        const id = item._id || item.id;
        const price = parseFloat(item.price || 0);
        const stock = item.stockQty !== undefined ? item.stockQty : (item.stock || 0);
        const categoryName = item.categoryName || (item.categoryId?.name) || 'Stationery';
        const images = item.images || [];
        const imgSrc = (images.length && typeof images[0] === 'string') ? images[0] : '../assets/product-placeholder.png';
        const safeNameAttr = escapeHtml(item.name).replace(/'/g, "&#39;");
        const safeNameJs = escapeHtml(item.name).replace(/'/g, "\\'");

        return `
          <div class="item-card" data-product-id="${id}">
            <div class="image-container" style="overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc;">
              <img src="${imgSrc}" alt="${safeNameAttr}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='../assets/cart.png';" />
              <button type="button" class="hover-btn" onclick="addToCartCatalog('${id}', '${safeNameJs}')">+ Add to Tray</button>
            </div>
            <span class="tag">${escapeHtml(categoryName)}</span>
            <div class="title"><a href="../pages/product.html?id=${id}" style="color: inherit; text-decoration: none;">${escapeHtml(item.name)}</a></div>
            <div class="bottom-row">
              <span class="price">R ${price.toFixed(2)}</span>
              <span class="stock ${stock > 0 ? 'in-stock' : 'out-of-stock'}">${stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
            </div>
          </div>
        `;
    }).join('');
}

window.addToCartCatalog = async function(productId, productName) {
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
            throw new Error(data.error?.message || data.message || 'Failed to add item');
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

function setupFilterAndSearchListeners(initialSearch = '') {
    let headerSearch = document.getElementById('searchInput');
    const catalogSearch = document.getElementById('catalogSearchInput');

    let debounceTimer;

    const handleSearch = (e) => {
        const query = e.target.value;
        if (headerSearch && e.target !== headerSearch) {
            headerSearch.value = query;
        }
        if (catalogSearch && e.target !== catalogSearch) {
            catalogSearch.value = query;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchProductsFromDatabase(query ? { search: query } : {});
        }, 300);
    };

    const bindHeader = (el) => {
        if (!el || el.dataset.productListBound) return;
        el.dataset.productListBound = 'true';
        if (initialSearch) el.value = initialSearch;
        el.addEventListener('input', handleSearch);
    };

    if (headerSearch) {
        bindHeader(headerSearch);
    } else {
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            const observer = new MutationObserver(() => {
                const el = document.getElementById('searchInput');
                if (el) {
                    headerSearch = el;
                    bindHeader(el);
                    observer.disconnect();
                }
            });
            observer.observe(placeholder, { childList: true, subtree: true });
        }
    }

    if (catalogSearch) {
        if (initialSearch) catalogSearch.value = initialSearch;
        catalogSearch.addEventListener('input', handleSearch);
    }
}

window.filterProducts = function(category) {
    if (!category || category === 'all') {
        fetchProductsFromDatabase();
    } else {
        fetchProductsFromDatabase({ categoryId: category });
    }
};

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
