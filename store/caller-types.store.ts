import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { ICategory } from '@/types/categories/category.type';
import { ICallerType } from '@/types/caller-types/caller-type.type';

interface CallerTypesStore {
  callerTypes: ICallerType[],
  isLoading: boolean,
  fetchCallerTypes: () => Promise<ICallerType[]>,
}

export const useCallerTypesStore = create<CallerTypesStore>((set) => ({
  callerTypes: [],
  isLoading: false,
  fetchCallerTypes: async (): Promise<ICallerType[]> => {
    set({ isLoading: true })
    try {
      const data: ICategory[] = await apiClient.get('/caller-types/all');

      set({ callerTypes: data })

      return data;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      set({ isLoading: false })
    }
  }
}));
