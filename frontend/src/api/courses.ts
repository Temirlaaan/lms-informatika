import api from './axios';

export const getSections = () => api.get('/courses/sections/');

export const getSection = (id: number) => api.get(`/courses/sections/${id}/`);

export const getTopic = (id: number) => api.get(`/courses/topics/${id}/`);

export const completeTopic = (id: number) => api.post(`/courses/topics/${id}/complete/`);

export const getProgress = () => api.get('/courses/progress/');
