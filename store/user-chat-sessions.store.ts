import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { IPagination } from '@/types/pagination.type';
import { IChatSession, IChatSessionWithPagination } from '@/types/chat-sessions/chat-session.type';

interface UserChatSessionStore {
  items: IChatSession[];
  pagination: IPagination;
  isLoading: boolean;
  getAllSessions: (page?: number, limit?: number) => Promise<IChatSession[]>;
  evaluateSession: () => Promise<void>;
}

export const useUserChatSessionStore = create<UserChatSessionStore>((set) => ({
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  isLoading: false,
  async getAllSessions(page: number = 1, limit: number = 10): Promise<IChatSession[]> {
    set({ isLoading: true });
    try {
      let query: string = `?page=${page}&limit=${limit}`;
      const data: IChatSessionWithPagination = await apiClient.get('/chat/sessions/all' + query,);
      set({ items: data.items, pagination: data.pagination });
      return data.items;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  async evaluateSession(): Promise<void> {
    try {
    } catch (e) {
      console.log(e);
    }
  },
}));
