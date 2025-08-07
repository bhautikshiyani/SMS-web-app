export type UserRole = 'SuperAdmin'| 'Admin'| 'OrgManager'| 'OrgUser';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  tenantId: string;
}
