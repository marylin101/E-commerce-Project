let activeProduct = null;
let productReviews = [];

function getApiBaseUrl() {
    return '/api';
}

document.addEventListener('DOMContentLoaded', () => {
    const productId = getProductIdFromURL();
    if (productId) {
        loadProductDetails(productId);
    }
    setupQuantityStepper();
    setupTabSwitching();
    setupReviewSubmission();
    setupAddToCart();
});

function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadProductDetails(id) {
    const showcase = document.getElementById('productShowcase');
    const titleEl = document.getElementById('productTitleHeading');
    const tagEl = document.getElementById('productCategoryTag');
    const priceEl = document.getElementById('productPriceValue');
    const stockEl = document.getElementById('stockStatusBadge');
    const descEl = document.getElementById('productDescriptionText');
    const breadcrumbName = document.getElementById('breadcrumbProductName');
    const imageText = document.getElementById('productImageTitleText');

    if (!id) {
        if (titleEl) titleEl.textContent = 'Product Not Found';
        if (descEl) descEl.textContent = 'No product specified in URL.';
        return;
    }

    try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/products/${id}`);
        const text = await res.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error('Server returned non-JSON response. Please ensure backend is running on port 5000.');
        }

        if (!res.ok) {
            throw new Error(data.error?.message || data.message || 'Product not found');
        }

        const found = data.data?.product || data.data || data;
        activeProduct = found;

        const catName = found.categoryName || (found.categoryId?.name) || 'Stationery';
        const price = parseFloat(found.price || 0);
        const stock = found.stockQty !== undefined ? found.stockQty : (found.stock || 0);
        const images = found.images || [];

        if (titleEl) titleEl.textContent = found.name;
        if (tagEl) tagEl.textContent = catName;
        if (priceEl) priceEl.textContent = `R ${price.toFixed(2)}`;
        if (breadcrumbName) breadcrumbName.textContent = found.name;
        if (descEl) descEl.textContent = found.description || 'No detailed description available.';

        const mainImgCont = document.getElementById('mainImagePlaceholder');
        const thumbStrip = document.getElementById('productThumbnails');
        
        const validImages = (images && Array.isArray(images)) ? images.filter(img => typeof img === 'string' && img.trim()) : [];
        if (!validImages.length) {
            validImages.push('../assets/product-placeholder.png');
        }

        const setMainImage = (index) => {
            if (mainImgCont && validImages[index]) {
                mainImgCont.innerHTML = `<img src="${validImages[index]}" alt="${escapeHtml(found.name)}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.onerror=null; this.src='../assets/cart.png';" />`;
            } else if (imageText) {
                imageText.textContent = `[ ${found.name} ]`;
            }
        };

        if (thumbStrip) {
            thumbStrip.innerHTML = validImages.map((_, idx) => `
                <button type="button" class="thumb-btn ${idx === 0 ? 'active' : ''}" data-img-idx="${idx}">
                    <span>View ${idx + 1}</span>
                </button>
            `).join('');

            thumbStrip.querySelectorAll('.thumb-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.imgIdx || '0');
                    thumbStrip.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    setMainImage(idx);
                });
            });
        }

        setMainImage(0);

        if (stockEl) {
            stockEl.textContent = stock > 0 ? `In Stock (${stock} left)` : 'Out of Stock';
            stockEl.className = stock > 0 ? 'stock-status in-stock' : 'stock-status out-of-stock';
        }

        const overviewEl = document.getElementById('overviewText');
        if (overviewEl) {
            overviewEl.textContent = found.description || 'Archival stationery item crafted to meeting high study standards.';
        }

        loadProductReviews(id);
        renderRelatedProducts(id);
    } catch (err) {
        console.error('Failed to load product details:', err);
        if (titleEl) titleEl.textContent = 'Product Not Found';
        if (descEl) descEl.textContent = err.message || 'The requested product could not be loaded from database.';
        if (stockEl) stockEl.style.display = 'none';
    }
}

function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.product-tabs-section .tab-btn');
    const tabOverview = document.getElementById('tabContentOverview');
    const tabSpecs = document.getElementById('tabContentSpecs');
    const tabShipping = document.getElementById('tabContentShipping');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (tabOverview) tabOverview.style.display = 'none';
            if (tabSpecs) tabSpecs.style.display = 'none';
            if (tabShipping) tabShipping.style.display = 'none';

            const target = btn.dataset.tab;
            if (target === 'overview' && tabOverview) tabOverview.style.display = 'block';
            if (target === 'specs' && tabSpecs) tabSpecs.style.display = 'block';
            if (target === 'shipping' && tabShipping) tabShipping.style.display = 'block';
        });
    });
}

function setupQuantityStepper() {
    const decBtn = document.getElementById('qtyDecBtn');
    const incBtn = document.getElementById('qtyIncBtn');
    const input = document.getElementById('qtyInput');

    if (decBtn && input) {
        decBtn.addEventListener('click', () => {
            const current = parseInt(input.value || '1');
            if (current > 1) input.value = current - 1;
        });
    }

    if (incBtn && input) {
        incBtn.addEventListener('click', () => {
            const current = parseInt(input.value || '1');
            const max = activeProduct ? (activeProduct.stockQty !== undefined ? activeProduct.stockQty : 99) : 99;
            if (current < max) input.value = current + 1;
        });
    }
}

function setupAddToCart() {
    const addBtn = document.getElementById('addToCartBtn');
    const buyBtn = document.getElementById('buyNowBtn');

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            if (!activeProduct) return;
            const qty = parseInt(document.getElementById('qtyInput')?.value || '1');
            await addActiveProductToCart(qty);
        });
    }

    if (buyBtn) {
        buyBtn.addEventListener('click', async () => {
            if (!activeProduct) return;
            const qty = parseInt(document.getElementById('qtyInput')?.value || '1');
            const success = await addActiveProductToCart(qty, false);
            if (success) {
                window.location.href = '../pages/checkout.html';
            }
        });
    }
}

async function addActiveProductToCart(qty, showPrompt = true) {
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
        return false;
    }

    const productId = activeProduct._id || activeProduct.id;

    try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: qty })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || data.message || 'Failed to add item to cart');
        }

        if (typeof window.updateHeaderUI === 'function') {
            window.updateHeaderUI();
        }

        if (showPrompt) {
            if (typeof showNotificationPrompt === 'function') {
                showNotificationPrompt('Study Tray Updated', `Added ${qty} × "${activeProduct.name}" to your Study Tray!`, null);
            } else {
                alert(`Added ${qty} × "${activeProduct.name}" to your cart!`);
            }
        }
        return true;
    } catch (err) {
        alert(err.message);
        return false;
    }
}

async function loadProductReviews(productId) {
    try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/products/${productId}/reviews`);
        const data = await res.json();
        productReviews = data.data || data || [];
        renderReviews();
    } catch (err) {
        productReviews = [];
        renderReviews();
    }
}

function renderReviews() {
    const list = document.getElementById('reviewsList');
    const countEl = document.getElementById('productReviewCount');

    if (countEl) countEl.textContent = `(${productReviews.length} Customer Reviews)`;
    if (!list) return;

    if (!productReviews.length) {
        list.innerHTML = `<p class="no-reviews">No customer reviews yet. Be the first to leave a review!</p>`;
        return;
    }

    list.innerHTML = productReviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <strong class="reviewer-name">${escapeHtml(r.name || 'Anonymous Customer')}</strong>
                <span class="review-stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</span>
                <span class="review-date">${r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'Recent'}</span>
            </div>
            <p class="review-body">${escapeHtml(r.comment || '')}</p>
        </div>
    `).join('');
}

function setupReviewSubmission() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
        if (!token) {
            alert('Please log in to submit a review.');
            window.location.href = '../pages/loginRegister.html';
            return;
        }
        if (!activeProduct) return;

        const rating = parseInt(document.getElementById('reviewRating')?.value || '5');
        const comment = document.getElementById('reviewComment')?.value || '';

        try {
            const baseUrl = getApiBaseUrl();
            const productId = activeProduct._id || activeProduct.id;
            const res = await fetch(`${baseUrl}/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error?.message || data.message || 'Failed to submit review');
            }

            form.reset();
            await loadProductReviews(productId);

            if (typeof showNotificationPrompt === 'function') {
                showNotificationPrompt('Review Submitted', 'Thank you! Your product review has been successfully saved to MongoDB.', null, '⭐');
            } else {
                alert('Thank you! Your review has been saved.');
            }
        } catch (err) {
            alert(err.message);
        }
    });
}

async function renderRelatedProducts(currentId) {
    const grid = document.getElementById('relatedProductsGrid');
    if (!grid) return;

    try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/products?limit=5`);
        const data = await res.json();
        const items = data.data?.items || data.data?.products?.items || data.data || [];
        const related = items.filter(p => String(p._id || p.id) !== String(currentId));

        if (!related.length) {
            grid.innerHTML = '';
            return;
        }

        grid.innerHTML = related.map(p => {
            const id = p._id || p.id;
            const price = parseFloat(p.price || 0);
            const stock = p.stockQty !== undefined ? p.stockQty : (p.stock || 0);
            const tag = p.categoryName || (p.categoryId?.name) || 'Stationery';

            return `
                <article class="item-card">
                    <div class="image-container">
                        <span>[ ${escapeHtml(p.name)} ]</span>
                        <a href="../pages/product.html?id=${id}" class="hover-btn">View Product Details</a>
                    </div>
                    <span class="tag">${escapeHtml(tag)}</span>
                    <h3 class="title"><a href="../pages/product.html?id=${id}">${escapeHtml(p.name)}</a></h3>
                    <div class="bottom-row">
                        <span class="price">R ${price.toFixed(2)}</span>
                        <span class="stock in-stock">${stock} in stock</span>
                    </div>
                </article>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load related products:', err);
    }
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
