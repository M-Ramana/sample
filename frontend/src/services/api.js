import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginStaff = (data) => API.post('/auth/login', data);

// Staff
export const getProfile = () => API.get('/staff/profile');
export const updateProfile = (data) => API.put('/staff/profile', data);

// Students
export const getStudents = (params) => API.get('/students', { params });
export const getClasses = () => API.get('/students/classes');

// Marks
export const getMarks = (params) => API.get('/marks', { params });
export const bulkSaveMarks = (data) => API.post('/marks/bulk', data);
export const getMarksSummary = () => API.get('/marks/summary');

// Audit
export const getAudits = () => API.get('/audit');
export const submitAudit = (formData) =>
  API.post('/audit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Research
export const getResearchPapers = () => API.get('/research');
export const uploadResearchPaper = (formData) =>
  API.post('/research', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteResearchPaper = (id) => API.delete(`/research/${id}`);

// Reports
export const getReport = () => API.get('/reports');

export default API;
