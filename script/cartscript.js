//this is an example for cart please replace with code
let cart = [];

const SHIPPING_FEE = 65.00;

function renderCart() {
  const emptyView = document.getElementById("emptyCart");
  const activeView = document.getElementById("activeCartView");
  const itemsContainer = document.getElementById("cartItemsList");

  // 1. Check if empty
  if (!cart || cart.length === 0) {
    emptyView.style.display = "block";
    activeView.style.display = "none";
    return;
  }

  // 2. Otherwise display active cart
  emptyView.style.display = "none";
  activeView.style.display = "grid";

  // 3. Populate items
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

  // 4. Update Summary Values
  document.getElementById("totalItemsCount").textContent = `${totalUnits} ${totalUnits === 1 ? 'Item' : 'Items'}`;
  document.getElementById("subtotalVal").textContent = `R ${subtotal.toFixed(2)}`;
  document.getElementById("shippingVal").textContent = `R ${SHIPPING_FEE.toFixed(2)}`;
  document.getElementById("grandTotalVal").textContent = `R ${(subtotal + SHIPPING_FEE).toFixed(2)}`;

  // Save to localStorage if persisting:
  // localStorage.setItem('cart', JSON.stringify(cart));
}

// Handler to increase or decrease count
function changeQuantity(id, change) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += change;

  // If user decreases to 0, prompt removal or delete
  if (item.quantity <= 0) {
    removeItem(id);
  } else {
    renderCart();
  }
}

// Handler to delete an item
function removeItem(id) {
  cart = cart.filter(p => p.id !== id);
  renderCart();
}

// Initial run
document.addEventListener("DOMContentLoaded", renderCart);