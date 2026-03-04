import api from './axios';

export const getMyGrades = () => api.get('/grades/my/');

export const getGradebook = () => api.get('/grades/journal/');

export const getStudentGrades = (studentId: number) => api.get(`/grades/student/${studentId}/`);

export const getStatistics = () => api.get('/grades/statistics/');
