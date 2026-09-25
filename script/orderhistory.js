import { fetchOrderHistory } from '../api/orders.js';
import { getCurrentUser, logoutUser, isAuthenticated } from '../auth/auth.js';

let userOrders = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    initUserProfile();
    setupCustomerLogout();
    setupStatusTabFiltering();
    await loadOrders();
});

function initUserProfile() {
    if (!isAuthenticated()) {
        window.location.href = '../pages/loginRegister.html';
        return;
    }

    const user = getCurrentUser();
    const nameEl = document.getElementById('accountCustomerName');
    const emailEl = document.getElementById('accountCustomerEmail');
    const initialsEl = document.getElementById('avatarInitials');

    if (user && user.name) {
        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email || 'customer@example.com';
        if (initialsEl) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            initialsEl.textContent = initials.substring(0, 2) || 'CS';
        }
    } else {
        if (nameEl) nameEl.textContent = 'Valued Customer';
        if (emailEl) emailEl.textContent = 'customer@example.com';
        if (initialsEl) initialsEl.textContent = 'CS';
    }
}

function setupCustomerLogout() {
    const logoutBtn = document.getElementById('customerLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out of your account?')) {
                logoutUser();
            }
        });
    }
}

async function loadOrders() {
    const container = document.getElementById('orderHistoryList');
    if (!container) return;

    try {
        const res = await fetchOrderHistory();
        const rawOrders = res?.data?.orders || res?.orders || res?.data || res;
        userOrders = Array.isArray(rawOrders) ? rawOrders : [];

        renderOrderHistory(currentFilter);
    } catch (err) {
        console.error('Error fetching order history:', err);
        container.innerHTML = `
            <div class="empty-orders-card" style="padding: 30px; text-align: center;">
                <h3 style="margin: 10px 0;">Failed to load order history</h3>
                <p>${escapeHtml(err.message || 'Error communicating with server')}</p>
            </div>
        `;
    }
}

function renderOrderHistory(filterStatus = 'all') {
    const container = document.getElementById('orderHistoryList');
    const totalCountEl = document.getElementById('totalOrdersCount');
    const activeCountEl = document.getElementById('activeOrdersCount');

    if (totalCountEl) totalCountEl.textContent = userOrders.length;
    if (activeCountEl) {
        const active = userOrders.filter(o => {
            const st = (o.status || '').toLowerCase();
            return st !== 'delivered' && st !== 'cancelled';
        }).length;
        activeCountEl.textContent = active;
    }

    if (!container) return;

    const filtered = filterStatus === 'all'
        ? userOrders
        : userOrders.filter(o => {
            const st = (o.status || '').toLowerCase();
            if (filterStatus === 'processing') return st === 'pending' || st === 'processing' || st === 'paid';
            return st === filterStatus.toLowerCase();
        });

    if (!filtered.length) {
        const statusLabel = filterStatus === 'all' ? 'orders' : `${filterStatus} orders`;
        container.innerHTML = `
            <div class="empty-orders-card" style="padding: 30px; text-align: center;">
                <h3 style="margin-bottom: 8px;">No ${escapeHtml(statusLabel)} found</h3>
                <p style="color: #666; margin-bottom: 20px;">There are currently no items or orders listed under this status filter.</p>
                <a href="../pages/productlist.html" class="btn-shop-now" style="display: inline-block; padding: 10px 20px; background-color: #1a365d; color: #fff; text-decoration: none; border-radius: 6px;">Start Shopping</a>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(order => {
        const orderId = order._id || order.id || 'N/A';
        const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';
        const status = order.status || 'Pending';
        const statusClass = status.toLowerCase();
        const items = order.items || [];
        const total = Number(order.totalAmount || order.total || 0);

        return `
            <article class="order-card" data-order-id="${orderId}">
                <div class="order-card-header">
                    <div class="order-meta-group">
                        <span class="order-id">Order #${escapeHtml(orderId)}</span>
                        <span class="order-date">Placed on ${escapeHtml(dateStr)}</span>
                    </div>
                    <div class="order-status-group">
                        <span class="status-pill status-${escapeHtml(statusClass)}">${escapeHtml(status)}</span>
                    </div>
                </div>

                <div class="order-card-body">
                    ${items.map(item => {
                        const name = item.nameSnapshot || item.name || 'Product Item';
                        const price = Number(item.priceSnapshot || item.price || 0);
                        const qty = Number(item.quantity || 1);
                        const lineTotal = price * qty;

                        return `
                            <div class="order-item-row">
                                <div class="item-thumb"><span>[ ${escapeHtml(name)} ]</span></div>
                                <div class="item-info">
                                    <h4 class="item-title">${escapeHtml(name)}</h4>
                                    <span class="item-qty">Qty: ${qty} × R ${price.toFixed(2)}</span>
                                </div>
                                <span class="item-total">R ${lineTotal.toFixed(2)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="order-card-footer">
                    <div class="order-total-summary">
                        <span>Order Total:</span>
                        <strong class="total-price">R ${total.toFixed(2)}</strong>
                    </div>
                    <div class="order-actions">
                        <button type="button" class="btn-action-outline" data-action="invoice" data-id="${orderId}">Invoice</button>
                        <button type="button" class="btn-action-primary" data-action="reorder" data-id="${orderId}">Reorder Items</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    // Attach event listeners to order action buttons
    container.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            const orderId = btn.dataset.id;
            if (action === 'invoice') {
                alert(`Invoice for Order #${orderId} has been generated and sent to your email.`);
            } else if (action === 'reorder') {
                alert(`Redirecting to cart to reorder items from Order #${orderId}...`);
                window.location.href = '../pages/cart.html';
            }
        });
    });
}

function setupStatusTabFiltering() {
    const tabBtns = document.querySelectorAll('#orderStatusTabs .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.status;
            renderOrderHistory(currentFilter);
        });
    });
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
