export interface BlogPost {
  id: string;
  title: string;
  content: string; // Markdown supported
  summary?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export enum ViewState {
  LIST = 'LIST',
  READ = 'READ',
  EDIT = 'EDIT',
  IDEAS = 'IDEAS' // AI Brainstorming
}