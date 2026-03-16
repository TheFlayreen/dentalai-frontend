import { create } from 'zustand/react';
import { apiClient } from '@/lib/api-client';
import { IBaseUser } from '@/types/users/user.type';

interface UsersStore {
  users: IBaseUser[];
  isLoading: boolean;
  getUsers: (role?: 'ADMIN' | 'TRAINEE') => Promise<IBaseUser[]>;
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
}));
