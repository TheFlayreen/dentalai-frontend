import { headers } from 'next/headers';

export async function getCurrentUser() {
  const headersList = await headers();

  const role = headersList.get('x-user-role');
  const id = headersList.get('x-user-id');
  const permissions = headersList.get('x-user-permissions');

  if (!role || !id) return null;

  return {
    id,
    role,
    permissions: permissions ? JSON.parse(permissions) : [],
  };
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser();

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
