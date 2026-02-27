import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { IScenariosWithPagination, IUserScenario } from '@/types/scenario/scenario.type';
import { IPagination } from '@/types/pagination.type';

interface UserScenarioStore {
  items: IUserScenario[];
  pagination: IPagination;
  isLoading: boolean;
  fetchScenarios: (page?: number, limit?: number) => Promise<IUserScenario[]>;
}

export const useUserScenarioStore = create<UserScenarioStore>((set, get) => ({
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  isLoading: false,
  fetchScenarios: async (
    page: number = get().pagination.page,
    limit: number = get().pagination.limit,
  ): Promise<IUserScenario[]> => {
    set({ isLoading: true });
    try {
      let query: string = `?page=${page}&limit=${limit}`;
      const response: IScenariosWithPagination = await apiClient.get('/scenarios' + query);
      set((state) => ({
        ...state,
        items: response.items,
        pagination: response.pagination,
      }));

      return response.items;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
}));
