import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { IPagination } from '@/types/pagination.type';
import {
  IChatSession,
  IChatSessionShort,
  IChatSessionWithPagination,
} from '@/types/chat-sessions/chat-session.type';
import { ChatMessage } from '@/hooks/use-chat-socket';

interface ChatSessionStore {
  items: IChatSessionShort[];
  pagination: IPagination;
  isLoading: boolean;
  currentSession: IChatSession | null;
  getSession: (sessionId: string) => Promise<IChatSession | null>;
  getSessionMessages: (sessionId: string) => Promise<ChatMessage[]>;
  getAllSessions: (page?: number, limit?: number, traineeId?: string) => Promise<IChatSessionShort[]>;
  evaluateSession: () => Promise<void>;
}

export const useChatSessionStore = create<ChatSessionStore>((set, get) => ({
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  isLoading: false,
  currentSession: null,
  async getAllSessions(page: number = 1, limit: number = 10, traineeId?: string): Promise<IChatSessionShort[]> {
    set({ isLoading: true });
    try {
      let query: string = `?page=${page}&limit=${limit}`;
      if (traineeId) query += `&traineeId=${traineeId}`;

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

  async getSession(sessionId: string): Promise<IChatSession | null> {
    set({ isLoading: true });
    try {
      if (!sessionId) return null;

      if (get().currentSession?.id === sessionId) return get().currentSession;

      const data: IChatSession = await apiClient.get(`/chat/sessions/${sessionId}`);

      if (!data) return null;

      set({ currentSession: data });

      return data;
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      if (!sessionId) return [];

      const data: ChatMessage[] = await apiClient.get(`/chat/sessions/${sessionId}/messages`);

      if (!data) return [];

      return data;
    } catch (e) {
      console.log(e);
      return [];
    }
  },

  async evaluateSession(): Promise<void> {
    try {
    } catch (e) {
      console.log(e);
    }
  },
}));
