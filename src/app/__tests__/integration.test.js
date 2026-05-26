const { validateProfile } = require('../../lib/profileValidation');
const { addToCart } = require('../../lib/cartUtils');

describe('Integration Tests', () => {

  test('should validate profile successfully', () => {

    const result = validateProfile(
      'John Doe',
      '1234567890'
    );

    expect(result).toBe('Valid');
  });

  test('should reject invalid profile', () => {

    const result = validateProfile(
      '',
      '123'
    );

    expect(result).toBe('Name is required');
  });

  test('should add product to cart', () => {

    const cart = [];

    const product = {
      id: 1,
      name: 'Book',
      price: 500,
    };

    const result = addToCart(cart, product);

    expect(result.length).toBe(1);
  });

  test('should increase quantity for duplicate product', () => {

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

  test('should reject invalid product', () => {

    const cart = [];

    const result = addToCart(cart, {});

    expect(result).toBe('Invalid product');
  });

});
test('should validate profile and add product to cart together', () => {

    const profileResult = validateProfile(
      'John Doe',
      '1234567890'
    );
  
    expect(profileResult).toBe('Valid');
  
    const cart = [];
  
    const product = {
      id: 2,
      name: 'Notebook',
      price: 250,
    };
  
    const cartResult = addToCart(cart, product);
  
    expect(cartResult.length).toBe(1);
    expect(cartResult[0].name).toBe('Notebook');
  
  });