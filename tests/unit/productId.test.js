const productService = require('../../services/productService');

describe('Product ID Validation', () => {

    test('UT03 - invalid product ID is rejected', async () => {

        await expect(
            productService.getProductById('this-is-not-a-valid-object-id')
        ).rejects.toMatchObject({
            statusCode: 400
        });

    });

});