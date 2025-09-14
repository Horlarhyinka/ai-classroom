export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Document {
  _id: string;
  name: string;
  url: string;
  size: number;
  status: 'pending' | 'success' | 'failed';
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningSimulation {
  id: string;
  documentId: string;
  title: string;
  status: 'pending' | 'success' | 'failed';
  sections: LectureSection[];
  createdAt: string;
  updatedAt: string;
  error?: string;
  progress?: number; // 0-100 for generation progress
}

export interface Lecture {
  id: string;
  documentId: string;
  simulationId: string;
  title: string;
  sections: LectureSection[];
  createdAt: string;
  updatedAt: string;
}

export interface LectureSection {
  id: string;
  title: string;
  content: string;
  order: number;
  aiGenerated?: {
    teacherExplanation?: string;
    studentQuestions?: string[];
    keyPoints?: string[];
  };
}

export interface Note {
  id: string;
  simulationId: string;
  sectionId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  simulationId: string;
  sectionId?: string;
  question: string;
  answer: string;
  createdAt: string;
}