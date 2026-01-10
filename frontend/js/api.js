/**
 * API Layer - Application Starter Kit
 * Fetch wrapper with JWT authentication
 * Version: 2.0
 */

const API = {
  baseURL: '/api/v1',
  
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleUnauthorized();
        }
        throw { status: response.status, ...data };
      }
      
      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, message: 'Network error', error };
    }
  },
  
  handleUnauthorized() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/frontend/login.html';
    }
  },
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },
  
  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
  
  // Auth endpoints
  auth: {
    login: (data) => API.post('/auth/login', data),
    register: (data) => API.post('/auth/register', data),
    logout: () => API.post('/auth/logout'),
    me: () => API.get('/auth/me'),
    changePassword: (data) => API.put('/auth/change-password', data),
    forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
    resetPassword: (data) => API.post('/auth/reset-password', data)
  },
  
  // Users endpoints
  users: {
    list: (companyId, params = {}) => {
      const query = new URLSearchParams(params).toString();
      return API.get(`/companies/${companyId}/users${query ? '?' + query : ''}`);
    },
    get: (companyId, userId) => API.get(`/companies/${companyId}/users/${userId}`),
    create: (companyId, data) => API.post(`/companies/${companyId}/users`, data),
    update: (companyId, userId, data) => API.put(`/companies/${companyId}/users/${userId}`, data),
    delete: (companyId, userId) => API.delete(`/companies/${companyId}/users/${userId}`),
    updateRole: (companyId, userId, role) => API.put(`/companies/${companyId}/users/${userId}/role`, { role })
  },
  
  // Companies endpoints
  companies: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return API.get(`/companies${query ? '?' + query : ''}`);
    },
    get: (id) => API.get(`/companies/${id}`),
    create: (data) => API.post('/companies', data),
    update: (id, data) => API.put(`/companies/${id}`, data),
    delete: (id) => API.delete(`/companies/${id}`),
    select: (id) => API.post(`/companies/select/${id}`)
  },
  
  // Permissions endpoints
  permissions: {
    list: () => API.get('/permissions'),
    getByRole: (role) => API.get(`/permissions/role/${role}`),
    check: (data) => API.post('/permissions/check', data)
  },
  
  // Health endpoints
  health: {
    check: () => API.get('/health'),
    ready: () => fetch('/ready').then(r => r.json())
  }
};

window.API = API;
