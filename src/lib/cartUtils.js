function addToCart(cart, product) {

    if (!product || !product.id) {
      return 'Invalid product';
    }
  
    const existing = cart.find(item => item.id === product.id);
  
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }
  
    return cart;
  }
  
  module.exports = { addToCart };