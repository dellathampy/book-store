const { handleSaveProfile } = require('../../lib/saveProfile');

global.fetch = jest.fn();

describe('handleSaveProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save profile successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'success' }),
    });

    const form = {
      full_name: 'John Doe',
      phone: '1234567890',
    };

    const result = await handleSaveProfile(form, 'fake-token');

    expect(result).toBe('Profile updated successfully');
  });

  it('should handle API failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Update failed' }),
    });

    const form = {
      full_name: 'John Doe',
      phone: '1234567890',
    };

    const result = await handleSaveProfile(form, 'fake-token');

    expect(result).toBe('Update failed');
  });

  it('should handle missing token', async () => {
    const form = {
      full_name: 'John Doe',
      phone: '1234567890',
    };

    const result = await handleSaveProfile(form, null);

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toBe('Authorization token is missing');
  });

  it('should handle invalid form data', async () => {
    const form = {
      full_name: '',
      phone: '123',
    };

    const result = await handleSaveProfile(form, 'fake-token');

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toBe('Invalid form data');
  });

  it('should handle network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));

    const form = {
      full_name: 'John Doe',
      phone: '1234567890',
    };

    const result = await handleSaveProfile(form, 'fake-token');

    expect(result).toBe('Network Error');
  });

  it('should handle unexpected API response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const form = {
      full_name: 'John Doe',
      phone: '1234567890',
    };

    const result = await handleSaveProfile(form, 'fake-token');

    expect(result).toBe('Unexpected API response');
  });
});