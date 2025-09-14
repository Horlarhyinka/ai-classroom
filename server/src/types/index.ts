export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  uploadDate: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  thumbnail?: string;
}

export interface Lecture {
  id: string;
  documentId: string;
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
}

export interface Note {
  id: string;
  lectureId: string;
  sectionId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  lectureId: string;
  sectionId?: string;
  question: string;
  answer: string;
  createdAt: string;
}