import { create } from 'zustand/react';
import { IScenarioCounts } from '@/types/scenario/scenario-counts.type';
import { apiClient } from '@/lib/api-client';
import { IScenario, IScenariosWithPagination } from '@/types/scenario/scenario.type';
import { ScenarioStatus } from '@/types/scenario/scenario.enum';
import { IPagination } from '@/types/pagination.type';
import { ICategory } from '@/types/categories/category.type';

interface CategoriesStore {
  categories: ICategory[],
  isLoading: boolean,
  fetchCategories: () => Promise<ICategory[]>,
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  isLoading: false,
  fetchCategories: async (): Promise<ICategory[]> => {
    set({ isLoading: true })
    try {
      const data: ICategory[] = await apiClient.get('/categories/all');

      set({ categories: data })

      return data;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      set({ isLoading: false })
    }
  }
}));
