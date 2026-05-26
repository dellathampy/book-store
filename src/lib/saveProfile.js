async function handleSaveProfile(form, token) {

    if (!token) {
        return 'Authorization token is missing';
    }
  
    if (
      !form ||
      !form.full_name ||
      !form.phone
    ) {
      return 'Invalid form data';
    }
  
    try {
  
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        return data.error || 'Failed';
      }
  
      if (!data) {
        return 'Unexpected API response';
      }
  
      return 'Profile updated successfully';
  
    } catch (error) {
      return 'Network Error';
    }
  }
  
  module.exports = { handleSaveProfile };