import {fetchCart, removeFromCart} from '../api/cart.js';

document.addEventListener('DOMContentLoaded', async () => {
    const cartContainer = document.getElementById('cart-items-list');
    const totalAmountEl = document.getElementById('tcart-total-amount');

    if (cartContainer) {
        try {
            cartContainer.innerHTML = '<p>Loading cart items...</p>';
            const cart = await fetchCart();

            if (!cart || !cart.items || cart.items.length === 0) {
                cartContainer.innerHTML = '<p>Your cart is empty.</p>';
                if (totalAmountEl) totalAmountEl.textContent = '0.00';
                return;
            }

            let totalAmount = 0;
            cartContainer.innerHTML = cart.items.map(item => {
                const itemTotal = item.price * item.quantity;
                totalAmount += itemTotal;
                return `
                <div class="cart-item">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>$${itemTotal.toFixed(2)}</span>
                    <button class="remove-from-cart" data-product-id="${item.productId}">Remove</button>
                </div>`;
            }).join('');

            if (totalAmountEl) totalAmountEl.textContent = `$${totalAmount.toFixed(2)}`;

            document.querySelectorAll('.remove-from-cart').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const itemId = event.target.getAttribute('data-product-id');
                    try {
                        await removeFromCart(itemId);
                        window.location.reload();
                    } catch (error) {
                        alert(error.message || 'Failed to remove item from cart.');
                    }
                });
            });
        } catch (error) {
            cartContainer.innerHTML = '<p>Failed to load cart items.</p>';
        }
    }
});
