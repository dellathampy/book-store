const { addToCart } = require('../../lib/cartUtils');

describe('addToCart', () => {

  it('should add new product to cart', () => {

    const cart = [];

    const product = {
      id: 1,
      name: 'Book',
      price: 500,
    };

    const result = addToCart(cart, product);

    expect(result.length).toBe(1);
    expect(result[0].quantity).toBe(1);
  });

  it('should increase quantity if product already exists', () => {

    const cart = [
      {
        id: 1,
        name: 'Book',
        quantity: 1,
      },
    ];

    const product = {
      id: 1,
      name: 'Book',
    };

    const result = addToCart(cart, product);

    expect(result[0].quantity).toBe(2);
  });

});