

export interface Chapter {
  _id: string;
  docId: string;
  title: string;
  index: number;
  discussion: {_id: string} | string;
  discussionStarted: boolean;
}

export interface Section {
  _id: string;
  title: string;
  body: string;
  index: number;
  docId: string;
  chapter: number;
}

interface Voice {
  id: string;
  name: string;
  category: string;
}

export interface Persona {
  id: string;
  _id: string;
  name: string;
  role: 'teacher' | 'student';
  isUser: boolean;
  voice?: Voice;
}
export interface Message {
  _id: string;
  body: string;
  persona: Persona;
  sent: boolean;
  createdAt: string;
  isOptimistic?: boolean;
  tempId?: string;
}
