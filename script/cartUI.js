let cart = [];

const SHIPPING_FEE = 65.00;

function renderCart() {
  const emptyView = document.getElementById("emptyCart");
  const activeView = document.getElementById("activeCartView");
  const itemsContainer = document.getElementById("cartItemsList");

  //chick if the cart is empty
  if (!cart || cart.length === 0) {
    emptyView.style.display = "block";
    activeView.style.display = "none";
    return;
  }

  //Otherwise display active cart
  emptyView.style.display = "none";
  activeView.style.display = "grid";

  //Populate items
  itemsContainer.innerHTML = "";
  let subtotal = 0;
  let totalUnits = 0;

  cart.forEach(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    totalUnits += item.quantity;

    const itemElement = document.createElement("article");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div class="item-image-placeholder">
        <span>Item</span>
      </div>
      <div class="item-details">
        <span class="item-category">${item.category}</span>
        <h3 class="item-name">${item.name}</h3>
        <span class="unit-price">R ${item.price.toFixed(2)} each</span>
      </div>
      <div class="item-quantity">
        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
        <span class="qty-val">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
      <div class="item-total">
        <span class="line-price">R ${lineTotal.toFixed(2)}</span>
        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
      </div>
    `;
    itemsContainer.appendChild(itemElement);
  });

  //Update Summary Values
  document.getElementById("totalItemsCount").textContent = `${totalUnits} ${totalUnits === 1 ? 'Item' : 'Items'}`;
  document.getElementById("subtotalVal").textContent = `R ${subtotal.toFixed(2)}`;
  document.getElementById("shippingVal").textContent = `R ${SHIPPING_FEE.toFixed(2)}`;
  document.getElementById("grandTotalVal").textContent = `R ${(subtotal + SHIPPING_FEE).toFixed(2)}`;

}

// Handler to increase or decrease count
function changeQuantity(id, change) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeItem(id);
  } else {
    renderCart();
  }
}

function removeItem(id) {
  cart = cart.filter(p => p.id !== id);
  renderCart();
}

document.addEventListener("DOMContentLoaded", renderCart);

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
