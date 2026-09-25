const { validateCreateReview } = require('../../validators/reviewValidators');

describe('Review Validation Tests', () => {

    test('UT05 - invalid review rating is rejected', () => {

        const result = validateCreateReview({
            rating: 6,
            comment: 'Good product'
        });

        expect(result).toContain(
            'Rating must be a number between 1 and 5.'
        );

    });

});