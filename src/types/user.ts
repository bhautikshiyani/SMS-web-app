export type UserRole = 'super_admin' | 'admin' | 'org_manager' | 'org_user';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  tenantId: string;
}
