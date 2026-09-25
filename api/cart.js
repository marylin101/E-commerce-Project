import { apiRequest } from './client.js';

export async function fetchCart() {
    return await apiRequest('/cart', { method: 'GET' });
}

export async function addToCart(productId, quantity = 1) {
    return await apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: Number(quantity) }),
    });
}

export async function updateCartQuantity(productId, quantity) {
    return await apiRequest(`/cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: Number(quantity) }),
    });
}

export async function removeFromCart(productId) {
    return await apiRequest(`/cart/items/${productId}`, {
        method: 'DELETE',
    });
}

