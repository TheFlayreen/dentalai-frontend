import { IRole } from '@/types/role.type';

export interface IUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  roleId: string;
  role: IRole;
}
