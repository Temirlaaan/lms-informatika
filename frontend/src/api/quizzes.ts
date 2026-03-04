import api from './axios';

export const getQuizByTopic = (topicId: number) => api.get(`/quizzes/topic/${topicId}/`);

export const startQuiz = (quizId: number) => api.post(`/quizzes/${quizId}/start/`);

export const submitQuiz = (quizId: number, answers: { question_id: number; selected_choice_ids: number[] }[]) =>
  api.post(`/quizzes/${quizId}/submit/`, { answers });

export const getAttempts = () => api.get('/quizzes/attempts/');

export const getAttemptDetail = (id: number) => api.get(`/quizzes/attempts/${id}/`);
