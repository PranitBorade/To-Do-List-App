export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Work' | 'Personal' | 'Fitness' | 'Study' | 'Other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  dueDate?: string; // ISO string
  completed: boolean;
  createdAt: number;
}
