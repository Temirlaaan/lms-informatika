export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'student' | 'teacher';
  grade_class?: string;
  avatar?: string;
}

export interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  icon: string;
  is_published: boolean;
}

export interface Topic {
  id: number;
  section: number;
  title: string;
  order: number;
  is_published: boolean;
}

export interface Lesson {
  id: number;
  topic: number;
  content: string;
  video_url?: string;
}

export interface Quiz {
  id: number;
  topic: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  is_published: boolean;
}

export interface Question {
  id: number;
  quiz: number;
  text: string;
  question_type: 'single' | 'multiple' | 'true_false';
  image?: string;
  points: number;
  order: number;
  choices: Choice[];
}

export interface Choice {
  id: number;
  text: string;
  is_correct?: boolean;
  order: number;
}

export interface QuizAttempt {
  id: number;
  quiz: number;
  score: number;
  total_points: number;
  earned_points: number;
  started_at: string;
  finished_at?: string;
  is_completed: boolean;
}

export interface Grade {
  id: number;
  section: Section;
  score: number;
  grade_value: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  password_confirm: string;
  full_name: string;
  role: 'student' | 'teacher';
  grade_class?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}
