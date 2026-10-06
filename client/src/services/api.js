const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('bms_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response;
};

export const api = {
  // Auth
  auth: {
    login: (credentials) =>
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).then(handleResponse),

    register: (userData) =>
      fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    updateProfile: (data) =>
      fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    getDemoUsers: () =>
      fetch(`${API_BASE_URL}/auth/demo-users`).then(handleResponse),
  },

  // Dashboard
  dashboard: {
    getStats: () =>
      fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Species
  species: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/species?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getById: (id) =>
      fetch(`${API_BASE_URL}/species/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE_URL}/species`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/species/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE_URL}/species/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Habitats
  habitats: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/habitats?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getById: (id) =>
      fetch(`${API_BASE_URL}/habitats/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE_URL}/habitats`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/habitats/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE_URL}/habitats/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Locations
  locations: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/locations?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getById: (id) =>
      fetch(`${API_BASE_URL}/locations/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Observations
  observations: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/observations?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getById: (id) =>
      fetch(`${API_BASE_URL}/observations/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE_URL}/observations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/observations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE_URL}/observations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Researchers
  researchers: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/researchers?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getById: (id) =>
      fetch(`${API_BASE_URL}/researchers/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE_URL}/researchers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/researchers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE_URL}/researchers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Threats
  threats: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/threats?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getById: (id) =>
      fetch(`${API_BASE_URL}/threats/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE_URL}/threats`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE_URL}/threats/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE_URL}/threats/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
    link: (data) =>
      fetch(`${API_BASE_URL}/threats/link`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    unlink: (speciesId, threatId) =>
      fetch(`${API_BASE_URL}/threats/unlink/${speciesId}/${threatId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Conservation Programs & Activities
  conservation: {
    getAllPrograms: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/conservation-programs?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getProgramById: (id) =>
      fetch(`${API_BASE_URL}/conservation-programs/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
    createProgram: (data) =>
      fetch(`${API_BASE_URL}/conservation-programs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    updateProgram: (id, data) =>
      fetch(`${API_BASE_URL}/conservation-programs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    deleteProgram: (id) =>
      fetch(`${API_BASE_URL}/conservation-programs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
    createActivity: (data) =>
      fetch(`${API_BASE_URL}/conservation-activities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    deleteActivity: (id) =>
      fetch(`${API_BASE_URL}/conservation-activities/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Reports
  reports: {
    get: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/reports?${query}`, { headers: getAuthHeaders() }).then(handleResponse);
    },
    exportUrl: (reportType) => `${API_BASE_URL}/reports/export/${reportType}`,
  },

  // Search
  search: {
    global: (q) =>
      fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}`, { headers: getAuthHeaders() }).then(handleResponse),
  },

  // DBMS Viva SQL Console
  queries: {
    getList: () =>
      fetch(`${API_BASE_URL}/queries/list`, { headers: getAuthHeaders() }).then(handleResponse),
    execute: (payload) =>
      fetch(`${API_BASE_URL}/queries/execute`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse),
  },

  // Users
  users: {
    getAll: () =>
      fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() }).then(handleResponse),
    updateRole: (id, role) =>
      fetch(`${API_BASE_URL}/users/${id}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },
};
