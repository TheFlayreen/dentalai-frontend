import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { IBaseUser } from '@/types/users/user.type';
import { IProfileStatistic } from '@/types/users/profile-statistic.type';

interface UsersStore {
  users: IBaseUser[];
  isLoading: boolean;
  getUsers: (role?: 'ADMIN' | 'TRAINEE') => Promise<IBaseUser[]>;
  getProfileStats: () => Promise<IProfileStatistic | null>;
}

export const useUsersStore = create<UsersStore>((set) => ({
  users: [],
  isLoading: false,
  currentSession: null,
  async getUsers(role: 'ADMIN' | 'TRAINEE' = 'TRAINEE'): Promise<IBaseUser[]> {
    set({ isLoading: true });
    try {
      let query: string = `?role=${role}`;
      const data: IBaseUser[] = await apiClient.get('/users' + query,);

      if (!data) return [];

      set({ users: data });
      return data;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  async getProfileStats(): Promise<IProfileStatistic | null> {
    try {
      const data: IProfileStatistic =  await apiClient.get('/users/me/statistics');

      if (!data) return null;

      return data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}));
