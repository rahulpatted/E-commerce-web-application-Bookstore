export const API_BASE = "http://127.0.0.1:8000";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const api = {
  get: async (endpoint: string, requiresAuth = false) => {
    return fetchWithInterceptor(endpoint, { method: 'GET' }, requiresAuth);
  },
  post: async (endpoint: string, data: any, requiresAuth = false) => {
    return fetchWithInterceptor(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, requiresAuth);
  },
  put: async (endpoint: string, data: any, requiresAuth = false) => {
    return fetchWithInterceptor(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, requiresAuth);
  },
  delete: async (endpoint: string, requiresAuth = false) => {
    return fetchWithInterceptor(endpoint, { method: 'DELETE' }, requiresAuth);
  }
};

async function fetchWithInterceptor(endpoint: string, options: RequestInit = {}, requiresAuth = false) {
  const headers = new Headers(options.headers || {});
  
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      throw new ApiError(401, 'Authentication required');
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.detail || 'An error occurred';
    throw new ApiError(response.status, message, data);
  }

  return data;
}
