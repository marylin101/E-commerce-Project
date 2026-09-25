const productRepository = require('../../repositories/productRepository');
const productService = require('../../services/productService');

// Mock the repository so the test does NOT use the real MongoDB database.
jest.mock('../../repositories/productRepository');

describe('Product Service Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('UT01 - valid product validation', async () => {

        // Arrange
        const productData = {
            name: 'Notebook',
            sku: 'NB001',
            categoryId: '507f1f77bcf86cd799439011',
            price: 50,
            stockQty: 20
        };

        const expectedProduct = {
            _id: 'product123',
            ...productData
        };

        productRepository.createProduct.mockResolvedValue(expectedProduct);

        // Act
        const result = await productService.createProduct(productData);

        // Assert
        expect(productRepository.createProduct).toHaveBeenCalledWith({
            ...productData,
            price: 50,
            stockQty: 20
        });

        expect(result).toEqual(expectedProduct);
    });
    test('UT02 - negative product price is rejected', async () => {

        const productData = {
            name: 'Notebook',
            sku: 'NB002',
            categoryId: '507f1f77bcf86cd799439011',
            price: -10,
            stockQty: 20
        };

        await expect(
            productService.createProduct(productData)
        ).rejects.toMatchObject({
            statusCode: 400
        });

        expect(productRepository.createProduct).not.toHaveBeenCalled();
    });
    test('UT06 - missing required product field is rejected', async () => {

        const productData = {
            sku: 'NB003',
            categoryId: '507f1f77bcf86cd799439011',
            price: 50,
            stockQty: 20
        };

        await expect(
                productService.createProduct(productData)
            ).rejects.toMatchObject({
                statusCode: 400
            });

        expect(productRepository.createProduct).not.toHaveBeenCalled();
    });

});