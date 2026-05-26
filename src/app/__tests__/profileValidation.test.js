const { validateProfile } = require('../../lib/profileValidation');

describe('validateProfile', () => {
  it('should return "Name is required" if name is empty', () => {
    expect(validateProfile('', '1234567890')).toBe('Name is required');
    expect(validateProfile('   ', '1234567890')).toBe('Name is required');
  });

  it('should return "Invalid phone number" if phone is not 10 digits', () => {
    expect(validateProfile('John Doe', '123')).toBe('Invalid phone number');
    expect(validateProfile('John Doe', '123456789')).toBe('Invalid phone number');
    expect(validateProfile('John Doe', '12345678901')).toBe('Invalid phone number');
  });

  it('should return "Valid" for a valid name and phone number', () => {
    expect(validateProfile('John Doe', '1234567890')).toBe('Valid');
  });

  it('should handle null or undefined name', () => {
    expect(validateProfile(null, '1234567890')).toBe('Name is required');
    expect(validateProfile(undefined, '1234567890')).toBe('Name is required');
  });

  it('should handle null or undefined phone', () => {
    expect(validateProfile('John Doe', null)).toBe('Invalid phone number');
    expect(validateProfile('John Doe', undefined)).toBe('Invalid phone number');
  });

  it('should handle non-string name', () => {
    expect(validateProfile(123, '1234567890')).toBe('Name is required');
    expect(validateProfile({}, '1234567890')).toBe('Name is required');
    expect(validateProfile([], '1234567890')).toBe('Name is required');
  });

  it('should handle non-string phone', () => {
    expect(validateProfile('John Doe', 1234567890)).toBe('Invalid phone number');
    expect(validateProfile('John Doe', {})).toBe('Invalid phone number');
    expect(validateProfile('John Doe', [])).toBe('Invalid phone number');
  });

  it('should handle special characters in name', () => {
    expect(validateProfile('John@Doe', '1234567890')).toBe('Valid');
    expect(validateProfile('John-Doe', '1234567890')).toBe('Valid');
  });

  it('should handle special characters in phone', () => {
    expect(validateProfile('John Doe', '123-456-7890')).toBe('Invalid phone number');
    expect(validateProfile('John Doe', '(123)4567890')).toBe('Invalid phone number');
  });
});