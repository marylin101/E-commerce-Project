import { createOrder, fetchOrderHistory} from '../api/orders.js';

document.addEventListener('DOMContentLoaded', async () => {
    const checkoutForm = document.getElementById('checkout-form');
    const orderHistoryContainer = document.getElementById('order-history');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (event) => {
            event.preventDefault();
        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        const shippingAddress = document.getElementById('shipping-address').value;
        const paymentMethod = document.getElementById('payment-method').value;

        try{
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            const order = await createOrder({ shippingAddress, paymentMethod });
            alert('Order placed successfully!');
            window.location.href = '/order-confirmation.html?id= ${order.id || order._id}';
        } catch (error) {
            alert(error.message || 'An error occurred while placing the order.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Place Order';
        }
    });
}

if (orderHistoryContainer) {
    try {
        orderHistoryContainer.innerHTML = '<p>Loading order history...</p>';
        const orders = await fetchOrderHistory();

        if(!orders || orders.length === 0){
            orderHistoryContainer.innerHTML = '<p>No orders found.</p>';
            return;
        }

        orderHistoryContainer.innerHTML = orders.map(order => `
            <div class="order">
                <h4>Order #${order.id || order._id}</h4>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            </div>
        `).join('');
    } catch (error) {
        orderHistoryContainer.innerHTML = '<p>Error loading order history.</p>';
    }
}
});