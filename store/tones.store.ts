import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { ICategory } from '@/types/categories/category.type';
import { ITone } from '@/types/tones/tone.type';

interface TonesStore {
  tones: ITone[],
  isLoading: boolean,
  fetchTones: () => Promise<ITone[]>,
}

export const useTonesStore = create<TonesStore>((set) => ({
  tones: [],
  isLoading: false,
  fetchTones: async (): Promise<ITone[]> => {
    set({ isLoading: true })
    try {
      const data: ICategory[] = await apiClient.get('/tones/all');

      set({ tones: data })

      return data;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      set({ isLoading: false })
    }
  }
}));
