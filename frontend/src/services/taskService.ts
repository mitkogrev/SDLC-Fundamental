import axios from 'axios';
import { Task, TaskFormData } from '../types/Task';

const API_URL = '/api/tasks';

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await axios.get<Task[]>(API_URL);
    return response.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    const response = await axios.get<Task>(`${API_URL}/${id}`);
    return response.data;
  },

  createTask: async (task: TaskFormData): Promise<Task> => {
    const response = await axios.post<Task>(API_URL, task);
    return response.data;
  },

  updateTask: async (id: number, task: TaskFormData): Promise<Task> => {
    const response = await axios.put<Task>(`${API_URL}/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};
