import { apiRequest } from './client.js';

export async function fetchProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/products?${query}` : '/products';
    return await apiRequest(url, { method: 'GET' });
}

export async function fetchProductById(productId) {
    return await apiRequest(`/products/${productId}`, { method: 'GET' });
}

export async function submitProductReview(productId, reviewData) {
    return await apiRequest(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
    });
}

export async function createProduct(productData) {
    return await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
    });
}

export async function updateProduct(productId, productData) {
    return await apiRequest(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
    });
}

export async function deleteProduct(productId) {
    return await apiRequest(`/products/${productId}`, {
        method: 'DELETE',
    });
}
