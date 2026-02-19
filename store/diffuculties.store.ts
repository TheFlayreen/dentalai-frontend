import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { ICategory } from '@/types/categories/category.type';
import { IDifficulty } from '@/types/difficulties/difficulty.type';

interface DifficultiesStore {
  difficulties: IDifficulty[],
  isLoading: boolean,
  fetchDifficulties: () => Promise<IDifficulty[]>,
}

export const useDifficultiesStore = create<DifficultiesStore>((set) => ({
  difficulties: [],
  isLoading: false,
  fetchDifficulties: async (): Promise<IDifficulty[]> => {
    set({ isLoading: true })
    try {
      const data: ICategory[] = await apiClient.get('/difficulties/all');

      set({ difficulties: data })

      return data;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      set({ isLoading: false })
    }
  }
}));
