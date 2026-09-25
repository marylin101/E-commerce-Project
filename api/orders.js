import { apiRequest } from './client.js';

export async function createOrder(orderData) {
    return await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
}

export async function fetchOrderHistory() {
    return await apiRequest('/orders', { method: 'GET' });
}

export async function fetchOrderById(orderId) {
    return await apiRequest(`/orders/${orderId}`, { method: 'GET' });
}