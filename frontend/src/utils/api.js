const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost') {
      return '/api';
    }
  }
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getBaseUrl();

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  
  return headers;
};

export const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  async post(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  async put(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  async delete(endpoint, body = null) {
    try {
      const config = {
        method: 'DELETE',
        headers: getHeaders(),
      };
      if (body) {
        config.body = JSON.stringify(body);
      }
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  async upload(endpoint, formData) {
    try {
      const headers = {};
      if (typeof window !== 'undefined') {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const { token } = JSON.parse(userInfo);
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
      }
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || 'Something went wrong';
    
    // Automatically log out if token is expired/invalid
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('userInfo');
    }
    
    throw new Error(errorMsg);
  }

  return data;
};
