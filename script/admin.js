let state = {
    products: [],
    orders: [],
    categories: []
};

function getAuthToken() {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
}

function checkAdminAuth() {
    const token = getAuthToken();
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    let user = null;
    try { user = userStr ? JSON.parse(userStr) : null; } catch (e) {}

    if (!token || !user || user.role !== 'admin') {
        alert('Access denied. Admin portal requires administrative credentials.');
        window.location.href = '../pages/loginRegister.html';
        return false;
    }
    const nameDisplay = document.getElementById('adminNameDisplay');
    if (nameDisplay && user.name) nameDisplay.textContent = user.name;
    return true;
}

async function apiFetch(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };
    const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:5000/api';
    const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error?.message || json.message || 'API Request Failed');
    }
    return json.data !== undefined ? json.data : json;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    initTheme();
    setupAdminLogout();
    setupTabNavigation();
    setupModalHandlers();
    setupImageUploadHandler();
    setupSearchFilters();
    loadAllData();
});

async function loadAllData() {
    try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
            apiFetch('/products?limit=200').catch(() => ({ items: [] })),
            apiFetch('/categories').catch(() => []),
            apiFetch('/orders').catch(() => []),
        ]);

        const productsPayload = productsRes?.products !== undefined ? productsRes.products : productsRes;
        state.products = Array.isArray(productsPayload) ? productsPayload : (productsPayload?.items || []);
        state.categories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.categories || []);
        state.orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.orders || []);

        renderAll();
    } catch (err) {
        console.error('Failed to load admin data:', err);
    }
}

function initTheme() {
    const themeBtn = document.getElementById('adminThemeToggle');
    const icon = document.getElementById('themeToggleIcon');
    if (!themeBtn) return;

    if (localStorage.getItem('adminTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (icon) icon.textContent = 'Light Mode';
    }

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
        if (icon) icon.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });
}

function setupAdminLogout() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const doLogout = () => {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('jwt_token');
                sessionStorage.removeItem('currentUser');
                window.location.href = '../pages/loginRegister.html';
            };

            if (typeof showConfirmPrompt === 'function') {
                showConfirmPrompt('Admin Log Out', 'Are you sure you want to log out of the Admin Management Portal?', doLogout, null);
            } else if (confirm('Are you sure you want to log out of the Admin Portal?')) {
                doLogout();
            }
        });
    }
}

function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const sections = {
        products: document.getElementById('sectionProducts'),
        orders: document.getElementById('sectionOrders'),
        categories: document.getElementById('sectionCategories')
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            Object.values(sections).forEach(sec => {
                if (sec) sec.style.display = 'none';
            });
            const target = sections[btn.dataset.tab];
            if (target) target.style.display = 'block';
        });
    });
}

function renderAll() {
    renderProductsTable();
    renderOrdersTable();
    renderCategoriesTable();
    updateCategorySelectOptions();
    updateMetrics();
}

function updateMetrics() {
    const validOrders = state.orders.filter(o => (o.status || '').toLowerCase() !== 'cancelled');
    const totalRev = validOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount || o.total || 0)), 0);

    const activeOrders = state.orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s !== 'delivered' && s !== 'cancelled';
    }).length;

    const revEl = document.getElementById('metricRevenue');
    const prodEl = document.getElementById('metricProducts');
    const ordEl = document.getElementById('metricOrders');
    const catEl = document.getElementById('metricCategories');

    if (revEl) revEl.textContent = `R ${totalRev.toFixed(2)}`;
    if (prodEl) prodEl.textContent = `${state.products.length} Items`;
    if (ordEl) ordEl.textContent = `${activeOrders} Pending`;
    if (catEl) catEl.textContent = `${state.categories.length} Active`;
}

//Products table
function getCategoryName(catVal) {
    if (!catVal) return 'General';
    if (typeof catVal === 'string') {
        const matched = state.categories.find(c => String(c._id || c.id) === String(catVal) || c.name.toLowerCase() === catVal.toLowerCase());
        return matched ? matched.name : catVal;
    }
    if (catVal._id) return catVal.name || 'General';
    const matched = state.categories.find(c => String(c._id) === String(catVal));
    return matched ? matched.name : 'General';
}

function renderProductsTable() {
    const tbody = document.getElementById('adminProductsTbody');
    const countEl = document.getElementById('adminProductsCount');
    const searchVal = (document.getElementById('adminProductSearch')?.value || '').toLowerCase();
    const catFilter = document.getElementById('adminProductCategoryFilter')?.value || 'all';

    if (!tbody) return;

    const filtered = state.products.filter(p => {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const catName = getCategoryName(p.categoryId || p.category).toLowerCase();

        const matchesSearch = name.includes(searchVal) || sku.includes(searchVal);
        const matchesCat = catFilter === 'all' || catName === catFilter.toLowerCase() || String(p.categoryId) === catFilter;
        return matchesSearch && matchesCat;
    });

    if (countEl) countEl.textContent = `Showing ${filtered.length} Products`;

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row-msg">No products found matching criteria. Click "+ Add New Product" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const id = p._id || p.id;
        const catName = getCategoryName(p.categoryId || p.category);
        const price = parseFloat(p.price || 0);
        const stock = parseInt(p.stockQty !== undefined ? p.stockQty : (p.stock || 0));
        const images = p.images || [];
        const imgSrc = (images.length && typeof images[0] === 'string') ? images[0] : '../assets/product-placeholder.png';

        return `
            <tr data-id="${id}">
                <td>
                    <div class="table-img" style="width: 44px; height: 44px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <img src="${imgSrc}" alt="${escapeHtml(p.name)}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='../assets/cart.png';" />
                    </div>
                </td>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>${escapeHtml(p.sku || id)}</td>
                <td><span class="category-tag">${escapeHtml(catName)}</span></td>
                <td>R ${price.toFixed(2)}</td>
                <td>
                    <span class="stock-pill ${stock > 10 ? 'in-stock' : stock > 0 ? 'low-stock' : 'out-of-stock'}">
                        ${stock > 0 ? `${stock} in stock` : 'Out of stock'}
                    </span>
                </td>
                <td>
                    <div class="action-btn-group">
                        <button class="btn-tbl-edit" onclick="openEditProductModal('${id}')">Edit</button>
                        <button class="btn-tbl-delete" onclick="deleteProductRecord('${id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

//orders table
function renderOrdersTable() {
    const tbody = document.getElementById('adminOrdersTbody');
    const countEl = document.getElementById('adminOrdersCount');
    const searchVal = (document.getElementById('adminOrderSearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('adminOrderStatusFilter')?.value || 'all';

    if (!tbody) return;

    const filtered = state.orders.filter(o => {
        const id = String(o._id || o.id || '').toLowerCase();
        const customer = (o.customer || o.userId?.name || o.userId?.email || 'Customer').toLowerCase();
        const status = (o.status || 'Pending').toLowerCase();

        const matchesSearch = id.includes(searchVal) || customer.includes(searchVal);
        const matchesStatus = statusFilter === 'all' || status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (countEl) countEl.textContent = `Showing ${filtered.length} Orders`;

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row-msg">No customer orders recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(o => {
        const id = String(o._id || o.id);
        const shortId = id.length > 8 ? id.substring(id.length - 8).toUpperCase() : id;
        const customer = o.customer || (o.userId?.name || o.userId?.email || 'Customer');
        const dateStr = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : (o.date || 'N/A');
        const itemsCount = o.items ? o.items.length : (o.itemsCount || 1);
        const total = parseFloat(o.totalAmount || o.total || 0);
        const status = o.status || 'Pending';

        return `
            <tr data-order-id="${id}">
                <td><strong>#${escapeHtml(shortId)}</strong></td>
                <td>${escapeHtml(customer)}</td>
                <td>${escapeHtml(dateStr)}</td>
                <td>${itemsCount} Items</td>
                <td>R ${total.toFixed(2)}</td>
                <td><span class="status-pill status-${status.toLowerCase()}">${escapeHtml(status)}</span></td>
                <td>
                    <div class="action-btn-group">
                        <button class="btn-tbl-edit" onclick="cycleOrderStatusRecord('${id}')">Change Status</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/* 3. CATEGORIES TABLE */
function renderCategoriesTable() {
    const tbody = document.getElementById('adminCategoriesTbody');
    const countEl = document.getElementById('adminCategoriesCount');
    const searchVal = (document.getElementById('adminCategorySearch')?.value || '').toLowerCase();

    if (!tbody) return;

    const filtered = state.categories.filter(c => {
        const name = (c.name || '').toLowerCase();
        const slug = (c.slug || '').toLowerCase();
        return name.includes(searchVal) || slug.includes(searchVal);
    });

    if (countEl) countEl.textContent = `Showing ${filtered.length} Categories`;

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-row-msg">No store categories found. Click "+ Add Category" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(c => {
        const id = String(c._id || c.id);
        const shortId = id.length > 6 ? id.substring(id.length - 6) : id;
        return `
            <tr data-cat-id="${id}">
                <td>${escapeHtml(shortId)}</td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td><code>${escapeHtml(c.slug || '')}</code></td>
                <td>${escapeHtml(c.description || '-')}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="btn-tbl-edit" onclick="openEditCategoryModal('${id}')">Edit</button>
                        <button class="btn-tbl-delete" onclick="deleteCategoryRecord('${id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateCategorySelectOptions() {
    const select = document.getElementById('modalProductCategory');
    const filterSelect = document.getElementById('adminProductCategoryFilter');

    if (select) {
        select.innerHTML = state.categories.length
            ? state.categories.map(c => `<option value="${c._id || c.id}">${escapeHtml(c.name)}</option>`).join('')
            : `<option value="Notebooks">Notebooks</option><option value="Writing">Writing</option><option value="Art Supplies">Art Supplies</option><option value="Desk Tools">Desk Tools</option>`;
    }

    if (filterSelect) {
        filterSelect.innerHTML = `<option value="all">All Categories</option>` +
            state.categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
    }
}

//handles uploding of images
function setupImageUploadHandler() {
    const previewCont = document.getElementById('imagePreviewContainer');

    [1, 2, 3].forEach(idx => {
        const fileInput = document.getElementById(`modalProductImageFile${idx}`);
        const urlInput = document.getElementById(`modalProductImageUrl${idx}`);
        const previewImg = document.getElementById(`modalImagePreview${idx}`);

        if (urlInput) {
            urlInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                if (val && previewImg && previewCont) {
                    previewImg.src = val;
                    previewImg.style.display = 'block';
                    previewCont.style.display = 'flex';
                } else if (previewImg) {
                    previewImg.style.display = 'none';
                    updatePreviewContainerDisplay();
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('image', file);

                try {
                    if (urlInput) urlInput.placeholder = 'Uploading image...';
                    const token = getAuthToken();
                    const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:5000/api';
                    const res = await fetch(`${baseUrl}/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData,
                    });
                    const json = await res.json();
                    if (!res.ok) {
                        throw new Error(json.error?.message || json.message || 'Image upload failed');
                    }

                    const uploadedUrl = json.data?.imageUrl || json.imageUrl;
                    if (uploadedUrl) {
                        if (urlInput) urlInput.value = uploadedUrl;
                        if (previewImg && previewCont) {
                            previewImg.src = uploadedUrl;
                            previewImg.style.display = 'block';
                            previewCont.style.display = 'flex';
                        }
                    }
                } catch (err) {
                    alert('Image Upload Error: ' + err.message);
                } finally {
                    if (urlInput) urlInput.placeholder = `Image ${idx} URL`;
                }
            });
        }
    });
}

function updatePreviewContainerDisplay() {
    const previewCont = document.getElementById('imagePreviewContainer');
    if (!previewCont) return;
    const imgs = previewCont.querySelectorAll('img');
    const hasVisible = Array.from(imgs).some(img => img.style.display !== 'none');
    previewCont.style.display = hasVisible ? 'flex' : 'none';
}

// Modal handlers and CRUD operations which are connected to the API
function setupModalHandlers() {
    const prodModal = document.getElementById('productModal');
    const catModal = document.getElementById('categoryModal');

    document.getElementById('openProductModalBtn')?.addEventListener('click', () => {
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        document.getElementById('productModalForm').reset();
        document.getElementById('editProductId').value = '';
        const previewCont = document.getElementById('imagePreviewContainer');
        if (previewCont) previewCont.style.display = 'none';
        prodModal.style.display = 'flex';
    });

    document.getElementById('closeProductModalBtn')?.addEventListener('click', () => prodModal.style.display = 'none');
    document.getElementById('cancelProductModalBtn')?.addEventListener('click', () => prodModal.style.display = 'none');

    document.getElementById('openCategoryModalBtn')?.addEventListener('click', () => {
        document.getElementById('categoryModalTitle').textContent = 'Add New Category';
        document.getElementById('categoryModalForm').reset();
        document.getElementById('editCategoryId').value = '';
        catModal.style.display = 'flex';
    });

    document.getElementById('closeCategoryModalBtn')?.addEventListener('click', () => catModal.style.display = 'none');
    document.getElementById('cancelCategoryModalBtn')?.addEventListener('click', () => catModal.style.display = 'none');

    // Save Product Form Handler
    document.getElementById('productModalForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('saveProductBtn');
        const editId = document.getElementById('editProductId').value;
        const name = document.getElementById('modalProductName').value;
        const sku = document.getElementById('modalProductSKU').value;
        const categoryId = document.getElementById('modalProductCategory').value;
        const price = parseFloat(document.getElementById('modalProductPrice').value);
        const stockQty = parseInt(document.getElementById('modalProductStock').value);
        const imgUrl1 = document.getElementById('modalProductImageUrl1')?.value.trim();
        const imgUrl2 = document.getElementById('modalProductImageUrl2')?.value.trim();
        const imgUrl3 = document.getElementById('modalProductImageUrl3')?.value.trim();
        const description = document.getElementById('modalProductDesc').value;

        const imagesList = [imgUrl1, imgUrl2, imgUrl3].filter(Boolean);

        try {
            if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

            const payload = {
                categoryId,
                name,
                sku,
                price,
                stockQty,
                description,
                images: imagesList
            };

            if (editId) {
                await apiFetch(`/products/${editId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                await apiFetch('/products', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }

            prodModal.style.display = 'none';
            await loadAllData();

            if (typeof showNotificationPrompt === 'function') {
                showNotificationPrompt('Product Saved', `Product "${name}" has been saved to MongoDB.`, null);
            }
        } catch (err) {
            alert('Failed to save product: ' + err.message);
        } finally {
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Product'; }
        }
    });

    // Save Category Form Handler
    document.getElementById('categoryModalForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('saveCategoryBtn');
        const editId = document.getElementById('editCategoryId')?.value;
        const name = document.getElementById('modalCatName').value;
        const slug = document.getElementById('modalCatSlug').value;
        const description = document.getElementById('modalCatDesc')?.value || '';

        try {
            if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

            if (editId) {
                await apiFetch(`/categories/${editId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ name, slug, description }),
                });
            } else {
                await apiFetch('/categories', {
                    method: 'POST',
                    body: JSON.stringify({ name, slug, description }),
                });
            }

            catModal.style.display = 'none';
            await loadAllData();

            if (typeof showNotificationPrompt === 'function') {
                showNotificationPrompt('Category Saved', `Category "${name}" has been saved to MongoDB.`, null);
            }
        } catch (err) {
            alert('Failed to save category: ' + err.message);
        } finally {
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Category'; }
        }
    });
}

window.openEditProductModal = function(id) {
    const prod = state.products.find(p => String(p._id || p.id) === String(id));
    if (!prod) return;
    document.getElementById('productModalTitle').textContent = 'Edit Product Details';
    document.getElementById('editProductId').value = prod._id || prod.id;
    document.getElementById('modalProductName').value = prod.name || '';
    document.getElementById('modalProductSKU').value = prod.sku || '';
    document.getElementById('modalProductCategory').value = prod.categoryId || prod.category || '';
    document.getElementById('modalProductPrice').value = prod.price || 0;
    document.getElementById('modalProductStock').value = prod.stockQty !== undefined ? prod.stockQty : (prod.stock || 0);
    document.getElementById('modalProductDesc').value = prod.description || '';

    const images = prod.images || [];
    [1, 2, 3].forEach((idx) => {
        const val = images[idx - 1] || '';
        const urlInput = document.getElementById(`modalProductImageUrl${idx}`);
        const previewImg = document.getElementById(`modalImagePreview${idx}`);
        if (urlInput) urlInput.value = val;
        if (val && previewImg) {
            previewImg.src = val;
            previewImg.style.display = 'block';
        } else if (previewImg) {
            previewImg.style.display = 'none';
        }
    });

    updatePreviewContainerDisplay();
    document.getElementById('productModal').style.display = 'flex';
};

window.deleteProductRecord = async function(id) {
    const performDelete = async () => {
        try {
            await apiFetch(`/products/${id}`, { method: 'DELETE' });
            await loadAllData();
            if (typeof showNotificationPrompt === 'function') {
                showNotificationPrompt('Product Deleted', 'The product has been removed from MongoDB.', null);
            }
        } catch (err) {
            alert('Failed to delete product: ' + err.message);
        }
    };

    if (typeof showConfirmPrompt === 'function') {
        showConfirmPrompt('Delete Product', 'Are you sure you want to permanently delete this product from MongoDB?', performDelete, null);
    } else if (confirm('Are you sure you want to delete this product?')) {
        performDelete();
    }
};

window.openEditCategoryModal = function(id) {
    const cat = state.categories.find(c => String(c._id || c.id) === String(id));
    if (!cat) return;
    document.getElementById('categoryModalTitle').textContent = 'Edit Category Details';
    document.getElementById('editCategoryId').value = cat._id || cat.id;
    document.getElementById('modalCatName').value = cat.name || '';
    document.getElementById('modalCatSlug').value = cat.slug || '';
    if (document.getElementById('modalCatDesc')) document.getElementById('modalCatDesc').value = cat.description || '';
    document.getElementById('categoryModal').style.display = 'flex';
};

window.deleteCategoryRecord = async function(id) {
    const performDelete = async () => {
        try {
            await apiFetch(`/categories/${id}`, { method: 'DELETE' });
            await loadAllData();
            if (typeof showNotificationPrompt === 'function') {
                showNotificationPrompt('Category Deleted', 'The category has been removed from MongoDB.', null);
            }
        } catch (err) {
            alert('Failed to delete category: ' + err.message);
        }
    };

    if (typeof showConfirmPrompt === 'function') {
        showConfirmPrompt('Delete Category', 'Are you sure you want to permanently delete this category from MongoDB?', performDelete, null);
    } else if (confirm('Are you sure you want to delete this category?')) {
        performDelete();
    }
};

window.cycleOrderStatusRecord = async function(id) {
    const order = state.orders.find(o => String(o._id || o.id) === String(id));
    if (!order) return;
    const statuses = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
    const currentIdx = statuses.findIndex(s => s.toLowerCase() === (order.status || 'pending').toLowerCase());
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    try {
        await apiFetch(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: nextStatus }),
        });
        await loadAllData();
        if (typeof showNotificationPrompt === 'function') {
            showNotificationPrompt('Order Status Updated', `Order status changed to "${nextStatus}".`, null);
        }
    } catch (err) {
        alert('Failed to update status: ' + err.message);
    }
};

function setupSearchFilters() {
    document.getElementById('adminProductSearch')?.addEventListener('input', renderProductsTable);
    document.getElementById('adminProductCategoryFilter')?.addEventListener('change', renderProductsTable);
    document.getElementById('adminOrderSearch')?.addEventListener('input', renderOrdersTable);
    document.getElementById('adminOrderStatusFilter')?.addEventListener('change', renderOrdersTable);
    document.getElementById('adminCategorySearch')?.addEventListener('input', renderCategoriesTable);
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
