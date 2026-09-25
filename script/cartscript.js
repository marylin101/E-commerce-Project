import { fetchCart, updateCartQuantity, removeFromCart } from '../api/cart.js';
import { isAuthenticated } from '../auth/auth.js';

const SHIPPING_FEE = 65.00;
let cartItems = [];

async function loadCart() {
  const emptyView = document.getElementById("emptyCart");
  const activeView = document.getElementById("activeCartView");

  if (!isAuthenticated()) {
    if (emptyView && activeView) {
      emptyView.style.display = "block";
      activeView.style.display = "none";
      const h2 = emptyView.querySelector("h2");
      if (h2) h2.textContent = "Please log in to view your cart";
    }
    return;
  }

  try {
    const res = await fetchCart();
    const cartData = res?.data?.cart || res?.cart || res?.data || res;
    cartItems = cartData?.items || [];

    renderCart();
  } catch (error) {
    console.error('Failed to load cart:', error);
    if (emptyView && activeView) {
      emptyView.style.display = "block";
      activeView.style.display = "none";
    }
  }
}

function renderCart() {
  const emptyView = document.getElementById("emptyCart");
  const activeView = document.getElementById("activeCartView");
  const itemsContainer = document.getElementById("cartItemsList");

  if (!cartItems || cartItems.length === 0) {
    if (emptyView) emptyView.style.display = "block";
    if (activeView) activeView.style.display = "none";
    if (window.updateHeaderCartBadge) window.updateHeaderCartBadge(0);
    return;
  }

  if (emptyView) emptyView.style.display = "none";
  if (activeView) activeView.style.display = "grid";

  if (itemsContainer) itemsContainer.innerHTML = "";
  let subtotal = 0;
  let totalUnits = 0;

  cartItems.forEach(item => {
    const pId = item.productId?._id || item.productId || item.id;
    const name = item.name || item.product?.name || 'Product';
    const price = Number(item.price || item.product?.price || item.priceAtAdd || 0);
    const quantity = Number(item.quantity || 1);
    const category = item.product?.category || item.category || 'School Essentials';

    const images = item.images || item.product?.images || [];
    let imgSrc = '../assets/cart.png';
    if (images && images.length > 0 && typeof images[0] === 'string') {
      imgSrc = images[0];
    }

    const lineTotal = price * quantity;
    subtotal += lineTotal;
    totalUnits += quantity;

    const itemElement = document.createElement("article");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div class="item-image-placeholder" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">
        <img src="${imgSrc}" alt="${name}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.onerror=null; this.src='../assets/cart.png';" />
      </div>
      <div class="item-details">
        <span class="item-category">${category}</span>
        <h3 class="item-name">${name}</h3>
        <span class="unit-price">R ${price.toFixed(2)} each</span>
      </div>
      <div class="item-quantity">
        <button class="qty-btn" data-action="dec" data-id="${pId}">−</button>
        <span class="qty-val">${quantity}</span>
        <button class="qty-btn" data-action="inc" data-id="${pId}">+</button>
      </div>
      <div class="item-total">
        <span class="line-price">R ${lineTotal.toFixed(2)}</span>
        <button class="remove-btn" data-action="remove" data-id="${pId}">Remove</button>
      </div>
    `;
    itemsContainer.appendChild(itemElement);
  });

  // Attach event handlers
  itemsContainer.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const action = btn.dataset.action;
      const pId = btn.dataset.id;
      const currentItem = cartItems.find(i => (i.productId?._id || i.productId || i.id).toString() === pId.toString());

      if (!currentItem) return;

      btn.disabled = true;
      try {
        if (action === 'inc') {
          await updateCartQuantity(pId, currentItem.quantity + 1);
          await loadCart();
        } else if (action === 'dec') {
          if (currentItem.quantity <= 1) {
            await removeFromCart(pId);
          } else {
            await updateCartQuantity(pId, currentItem.quantity - 1);
          }
          await loadCart();
        } else if (action === 'remove') {
          await removeFromCart(pId);
          await loadCart();
        }
      } catch (err) {
        alert(err.message || 'Cart operation failed');
        btn.disabled = false;
      }
    });
  });

  // Update summary values
  const countEl = document.getElementById("totalItemsCount");
  if (countEl) countEl.textContent = `${totalUnits} ${totalUnits === 1 ? 'Item' : 'Items'}`;

  const subtotalEl = document.getElementById("subtotalVal");
  if (subtotalEl) subtotalEl.textContent = `R ${subtotal.toFixed(2)}`;

  const shippingEl = document.getElementById("shippingVal");
  if (shippingEl) shippingEl.textContent = `R ${SHIPPING_FEE.toFixed(2)}`;

  const grandEl = document.getElementById("grandTotalVal");
  if (grandEl) grandEl.textContent = `R ${(subtotal + SHIPPING_FEE).toFixed(2)}`;

  if (window.updateHeaderCartBadge) {
    window.updateHeaderCartBadge(totalUnits);
  }
}

document.addEventListener("DOMContentLoaded", loadCart);