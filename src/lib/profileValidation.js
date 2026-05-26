function validateProfile(name, phone) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return 'Name is required';
    }
  
    if (!phone || typeof phone !== 'string' || phone.length !== 10) {
      return 'Invalid phone number';
    }
  
    return 'Valid';
  }
  
  module.exports = { validateProfile };