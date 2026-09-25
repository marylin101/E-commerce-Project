jest.mock('../../repositories/orderRepository');
jest.mock('../../repositories/cartRepository');
jest.mock('../../repositories/productRepository');
jest.mock('../../repositories/addressRepository');

const orderRepository = require('../../repositories/orderRepository');
const cartRepository = require('../../repositories/cartRepository');
const productRepository = require('../../repositories/productRepository');

const orderService = require('../../services/orderService');

describe('Order Service Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('UT04 - order total is calculated correctly', async () => {

        cartRepository.getCart.mockResolvedValue({
            items: [
                {
                    productId: 'product123',
                    quantity: 2
                }
            ]
        });

        productRepository.findProductById.mockResolvedValue({
            _id: 'product123',
            name: 'Notebook',
            price: 50,
            stockQty: 10
        });

        const expectedOrder = {
            _id: 'order123',
            totalAmount: 100
        };

        orderRepository.createOrder.mockResolvedValue(expectedOrder);

        productRepository.decreaseStock.mockResolvedValue({
            productId: 'product123',
            stockQty: 8
        });

        cartRepository.clearCart.mockResolvedValue();

        const result = await orderService.createOrder(
            'user123',
            'address123'
        );

        expect(orderRepository.createOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                totalAmount: 100
            })
        );

        expect(result).toEqual(expectedOrder);
    });

});