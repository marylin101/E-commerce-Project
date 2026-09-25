import { fetchCart } from '../api/cart.js';
import { createOrder } from '../api/orders.js';
import { isAuthenticated, getCurrentUser } from '../auth/auth.js';

let cartItems = [];
let shippingCost = 65.00;

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
    setupShippingMethodListeners();
    setupPaymentMethodListeners();
    setupPlaceOrderHandler();
});

async function initCheckout() {
    if (!isAuthenticated()) {
        alert('Please log in to proceed with checkout.');
        window.location.href = '../pages/loginRegister.html';
        return;
    }

    const user = getCurrentUser();
    if (user) {
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('emailAddress');
        if (nameInput && !nameInput.value) nameInput.value = user.name || '';
        if (emailInput && !emailInput.value) emailInput.value = user.email || '';
    }

    await loadCheckoutCart();
}

async function loadCheckoutCart() {
    const container = document.getElementById('checkoutItemsList');
    const placeBtn = document.getElementById('placeOrderBtn');

    if (!container) return;

    try {
        const res = await fetchCart();
        const cartData = res?.data?.cart || res?.cart || res?.data || res;
        cartItems = cartData?.items || [];

        if (!cartItems.length) {
            container.innerHTML = `
                <div class="empty-checkout-card" style="padding: 20px; text-align: center;">
                    <p class="empty-title" style="font-weight: 600; font-size: 1.1rem; margin-bottom: 8px;">Your cart is empty</p>
                    <p class="empty-desc" style="color: #666; margin-bottom: 16px;">There are no items currently being checked out.</p>
                    <a href="../pages/productlist.html" class="btn-return-shop" style="color: var(--primary-color, #1a365d); text-decoration: underline;">Browse Products</a>
                </div>
            `;
            document.getElementById('checkoutSubtotal').textContent = 'R 0.00';
            document.getElementById('checkoutShipping').textContent = 'R 0.00';
            document.getElementById('checkoutGrandTotal').textContent = 'R 0.00';
            if (placeBtn) {
                placeBtn.disabled = true;
                placeBtn.textContent = 'Cart is Empty';
                placeBtn.style.opacity = '0.6';
                placeBtn.style.cursor = 'not-allowed';
            }
            return;
        }

        if (placeBtn) {
            placeBtn.disabled = false;
            placeBtn.style.opacity = '1';
            placeBtn.style.cursor = 'pointer';
        }

        container.innerHTML = cartItems.map(item => {
            const name = item.name || item.product?.name || 'Product';
            const price = Number(item.price || item.product?.price || item.priceAtAdd || 0);
            const qty = Number(item.quantity || 1);
            const lineTotal = price * qty;

            return `
                <div class="summary-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.95rem;">
                    <div class="item-details" style="flex: 1; padding-right: 12px;">
                        <span class="item-name" style="font-weight: 600; display: block;">${escapeHtml(name)}</span>
                        <span class="item-meta" style="font-size: 0.85rem; color: #666;">Qty: ${qty} × R ${price.toFixed(2)}</span>
                    </div>
                    <span class="item-price" style="font-weight: 600;">R ${lineTotal.toFixed(2)}</span>
                </div>
            `;
        }).join('');

        calculateTotals();
    } catch (err) {
        console.error('Error loading checkout cart:', err);
        alert('Failed to load cart items for checkout.');
    }
}

function calculateTotals() {
    const subtotal = cartItems.reduce((acc, item) => {
        const price = Number(item.price || item.product?.price || item.priceAtAdd || 0);
        const qty = Number(item.quantity || 1);
        return acc + (price * qty);
    }, 0);

    const grandTotal = subtotal + shippingCost;

    const subEl = document.getElementById('checkoutSubtotal');
    const shipEl = document.getElementById('checkoutShipping');
    const totalEl = document.getElementById('checkoutGrandTotal');
    const placeBtn = document.getElementById('placeOrderBtn');

    if (subEl) subEl.textContent = `R ${subtotal.toFixed(2)}`;
    if (shipEl) shipEl.textContent = `R ${shippingCost.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `R ${grandTotal.toFixed(2)}`;
    if (placeBtn) placeBtn.textContent = `Place Order & Pay R ${grandTotal.toFixed(2)}`;
}

function setupShippingMethodListeners() {
    const radios = document.querySelectorAll('input[name="shippingMethod"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            radios.forEach(r => {
                const card = r.closest('.radio-card');
                if (card) card.classList.remove('active');
            });
            const activeCard = e.target.closest('.radio-card');
            if (activeCard) activeCard.classList.add('active');

            shippingCost = e.target.value === 'express' ? 120.00 : 65.00;
            calculateTotals();
        });
    });
}

function setupPaymentMethodListeners() {
    const radios = document.querySelectorAll('input[name="paymentMethod"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            radios.forEach(r => {
                const card = r.closest('.radio-card');
                if (card) card.classList.remove('active');
            });
            const activeCard = e.target.closest('.radio-card');
            if (activeCard) activeCard.classList.add('active');
        });
    });
}

function setupPlaceOrderHandler() {
    const placeBtn = document.getElementById('placeOrderBtn');
    if (!placeBtn) return;

    placeBtn.addEventListener('click', async () => {
        const form = document.getElementById('checkoutForm');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!cartItems.length) {
            alert('Your cart is empty');
            return;
        }

        const street = document.getElementById('streetAddress')?.value || '';
        const city = document.getElementById('city')?.value || '';
        const postal = document.getElementById('postalCode')?.value || '';
        const addressStr = `${street}, ${city}, ${postal}`.trim();
        openPaymentModal();
    });
}

function setupPaymentModal() {
    const cardView = document.getElementById('cardPaymentView');
    const eftView = document.getElementById('eftPaymentView');
    const closeBtn = document.getElementById('modalCloseBtn');
    const cardForm = document.getElementById('cardForm');
    const confirmEftBtn = document.getElementById('confirmEftBtn');
    if (!modal) return;

    closeBtn?.addEventListener('click', closePaymentModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePaymentModal();
    });

    cardForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Demo-only: a real card payment must go through a PCI-compliant
        submitOrder(document.getElementById('confirmCardBtn'), 'Confirm & Pay');
    });

    confirmEftBtn?.addEventListener('click', () => {
        submitOrder(confirmEftBtn, "I've Made the Payment");
    });
}

function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    const cardView = document.getElementById('cardPaymentView');
    const eftView = document.getElementById('eftPaymentView');
    const selected = document.querySelector('input[name="paymentMethod"]:checked');

    cardView.classList.remove('active');
    eftView.classList.remove('active');

    const totalText = document.getElementById('checkoutGrandTotal').textContent.replace('R', '').trim();
    document.querySelectorAll('.modalTotal').forEach(el => {
        el.textContent = el.closest('.bank-row') ? `R ${totalText}` : totalText;
    });

    if (selected?.value === 'eft') {
        eftView.classList.add('active');
        document.getElementById('eftReference').textContent = 'ORD-' + Date.now().toString().slice(-8);
    } else {
        cardView.classList.add('active');
    }

    modal.style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

async function submitOrder(triggerBtn, resetLabel) {
    const street = document.getElementById('streetAddress')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const postal = document.getElementById('postalCode')?.value || '';
    const addressStr = `${street}, ${city}, ${postal}`.trim();

    if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.textContent = 'Processing...';
    }

    try {
        const res = await createOrder({ addressId: addressStr || 'Default Address' });
        const orderObj = res?.data?.order || res?.order || res?.data || res;
        const orderId = orderObj?._id || orderObj?.id || 'Success';

        if (window.updateHeaderCartBadge) {
            window.updateHeaderCartBadge(0);
        }

        closePaymentModal();
        alert(`Order #${orderId} placed successfully! Thank you for your purchase.`);
        window.location.href = '../pages/orderHistory.html';
    } catch (err) {
        console.error('Order placement error:', err);
        alert(err.message || 'Failed to place order. Please try again.');
        if (triggerBtn) {
            triggerBtn.disabled = false;
            triggerBtn.textContent = resetLabel;
        }
    }
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
