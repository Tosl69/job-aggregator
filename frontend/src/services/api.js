const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const request = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data;
};

export const login = (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (name, email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
export const logout = () => request('/auth/logout', { method: 'POST' });
export const getWidgets = () => request('/widgets');
export const addWidget = (data) => request('/widgets', { method: 'POST', body: JSON.stringify(data) });
export const updateWidget = (id, data) => request(`/widgets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteWidget = (id) => request(`/widgets/${id}`, { method: 'DELETE' });
export const getServices = () => request('/services');
export const getServiceData = (serviceId, widgetType, config) => {
  const params = new URLSearchParams(config).toString();
  return request(`/services/${serviceId}/${widgetType}?${params}`);
};
export const getAdminUsers = () => request('/admin/users');
export const updateUserRole = (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });