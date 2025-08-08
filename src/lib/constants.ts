export const roles = [
  { value: "SuperAdmin", label: "Super Administrator" },
  { value: "Admin", label: "Administrator" },
  { value: "OrgManager", label: "Organization Manager" },
  { value: "OrgUser", label: "Organization User" },
] as const;

export type UserRole = typeof roles[number]["value"];