import toast from "react-hot-toast";
import fetchWrapper from "../utils/fetchWrapper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API client configuration
const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  post: async (endpoint: string, data?: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  postFormData: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    },);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// Document API functions
export const documentAPI = {
  getAll: async() =>{
    try{
    const apiRes = await fetchWrapper.get(process.env.NEXT_PUBLIC_API_BASE_URL! + '/docs')
    if(apiRes.status == 200){
      return apiRes.data
    }
    }catch(err: any){
      toast.error(err?.response?.data?.message ?? "Failed to fetch documents")
    }
  },
  getById: (id: string) => apiClient.get(`/documents/${id}`),
  getContent: (id: string) => apiClient.get(`/documents/${id}/content`),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData('/documents/upload', formData);
  },
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
  getChapters: async(id: string) =>{
    try{
      const apiRes = await fetchWrapper.get(`${process.env.NEXT_PUBLIC_API_BASE_URL!}/docs/${id}/chapters`)
      if(apiRes.status.toString().startsWith('2')){
        return apiRes.data
      }else{
        toast.error(apiRes?.data?.message ?? 'Failed to fetch chapters')
      }
      }catch(err: any){
        toast.error(err?.response?.data?.message ?? "Failed to fetch chapters")
    }
  },

    getSections: async(id: string, index: number) =>{
      try{
        const apiRes = await fetchWrapper.get(`${process.env.NEXT_PUBLIC_API_BASE_URL!}/docs/${id}/chapters/${index}`)
        if(apiRes.status.toString().startsWith('2')){
          return apiRes.data
        }else{
          toast.error(apiRes?.data?.message ?? 'Failed to fetch Sections')
        }
        }catch(err: any){
          toast.error(err?.response?.data?.message ?? "Failed to fetch chapters")
      }
    },

   getDiscussions: async(id: string, chapterId: string) =>{
    try{
      const apiRes = await fetchWrapper.get(`${process.env.NEXT_PUBLIC_API_BASE_URL!}/docs/${id}/chapters/${chapterId}/discussions`)
      if(apiRes.status.toString().startsWith('2')){
        return apiRes.data
      }else{
        toast.error(apiRes?.data?.message ?? 'Failed to fetch Discussion')
      }
      }catch(err: any){
        toast.error(err?.response?.data?.message ?? "Failed to fetch Discussion")
    }
  },

  createDiscussion: async(id: string, chapterId: string) =>{
    try{
      const apiRes = await fetchWrapper.post(`${process.env.NEXT_PUBLIC_API_BASE_URL!}/docs/${id}/chapters/${chapterId}/discussions`, {})
      if(apiRes.status.toString().startsWith('2')){
        return apiRes.data
      }else{
        toast.error(apiRes?.data?.message ?? 'Failed to create Discussion')
      }
      }catch(err: any){
        toast.error(err?.response?.data?.message ?? "Failed to create Discussion")
    }
  }
};

// Learning Simulation API functions
export const simulationAPI = {
  getAll: () =>{
    //  apiClient.get('/simulations')
    return []
    },
  getById: (id: string) => apiClient.get(`/simulations/${id}`),
  create: (data: { documentId: string; title: string }) => 
    apiClient.post('/simulations', data),
  regenerate: (id: string) => apiClient.post(`/simulations/${id}/regenerate`),
  delete: (id: string) => apiClient.delete(`/simulations/${id}`),
};

// Lecture API functions (for notes and questions)
export const lectureAPI = {
  getNotes: (simulationId: string) => apiClient.get(`/lectures/${simulationId}/notes`),
  saveNote: (simulationId: string, data: { sectionId?: string; content: string }) =>
    apiClient.post(`/lectures/${simulationId}/notes`, data),
  getQuestions: (simulationId: string) => apiClient.get(`/lectures/${simulationId}/questions`),
  askQuestion: (simulationId: string, data: { sectionId?: string; question: string }) =>
    apiClient.post(`/lectures/${simulationId}/questions`, data),
};

// AI API functions
export const aiAPI = {
  generateTeacherExplanation: (content: string) =>
    apiClient.post('/ai/teacher-explanation', { content }),
  generateStudentQuestion: (content: string) =>
    apiClient.post('/ai/student-question', { content }),
  generateTeacherAnswer: (question: string, context?: string) =>
    apiClient.post('/ai/teacher-answer', { question, context }),
};

// Health check
export const healthCheck = () => apiClient.get('/health');