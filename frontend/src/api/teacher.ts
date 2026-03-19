import api from './axios';
import type { Section, Topic, Quiz, Question, Choice } from '../types';

// Sections CRUD
export const getTeacherSections = () => api.get('/courses/teacher/sections/');
export const createSection = (data: Partial<Section>) => api.post('/courses/teacher/sections/', data);
export const updateSection = (id: number, data: Partial<Section>) => api.put(`/courses/teacher/sections/${id}/`, data);
export const deleteSection = (id: number) => api.delete(`/courses/teacher/sections/${id}/`);

// Topics CRUD
export const getTeacherTopics = () => api.get('/courses/teacher/topics/');
export const createTopic = (data: { section: number; title: string; order: number; is_published: boolean }) => api.post('/courses/teacher/topics/', data);
export const updateTopic = (id: number, data: Partial<Topic>) => api.put(`/courses/teacher/topics/${id}/`, data);
export const deleteTopic = (id: number) => api.delete(`/courses/teacher/topics/${id}/`);

// Lessons CRUD
export const getTeacherLessons = () => api.get('/courses/teacher/lessons/');
export const createLesson = (data: { topic: number; content: string; video_url?: string | null }) => api.post('/courses/teacher/lessons/', data);
export const updateLesson = (id: number, data: { content: string; video_url?: string | null }) => api.put(`/courses/teacher/lessons/${id}/`, data);
export const deleteLesson = (id: number) => api.delete(`/courses/teacher/lessons/${id}/`);

// Quizzes CRUD
export const getTeacherQuizzes = () => api.get('/quizzes/teacher/quizzes/');
export const createQuiz = (data: Partial<Quiz>) => api.post('/quizzes/teacher/quizzes/', data);
export const updateQuiz = (id: number, data: Partial<Quiz>) => api.put(`/quizzes/teacher/quizzes/${id}/`, data);
export const deleteQuiz = (id: number) => api.delete(`/quizzes/teacher/quizzes/${id}/`);

// Questions CRUD
export const createQuestion = (data: Partial<Question>) => api.post('/quizzes/teacher/questions/', data);
export const updateQuestion = (id: number, data: Partial<Question>) => api.put(`/quizzes/teacher/questions/${id}/`, data);
export const deleteQuestion = (id: number) => api.delete(`/quizzes/teacher/questions/${id}/`);

// Choices CRUD
export const createChoice = (data: { question: number; text: string; is_correct: boolean; order: number }) => api.post('/quizzes/teacher/choices/', data);
export const updateChoice = (id: number, data: Partial<Choice>) => api.put(`/quizzes/teacher/choices/${id}/`, data);
export const deleteChoice = (id: number) => api.delete(`/quizzes/teacher/choices/${id}/`);

// Lesson Images
export const uploadLessonImage = (data: FormData) =>
  api.post('/courses/teacher/lesson-images/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteLessonImage = (id: number) =>
  api.delete(`/courses/teacher/lesson-images/${id}/`);

// Students
export const getStudents = () => api.get('/auth/students/');
