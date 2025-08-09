import { UserRole } from "@/types/user";

export const roleBasedNav: Record<UserRole, string[]> = {
  SuperAdmin: ["Dashboard", "Tenant", "User"],
  Admin: ["Messages", "Contacts", "Voicemail", "Phone", "Settings"],
  OrgManager: ["Messages", "Contacts", "Voicemail", "Phone", "Settings"],
  OrgUser: ["Messages", "Contacts", "Voicemail", "Phone", "Settings"],
};

// Flattened route map by title
export const roleAccessMap: Record<UserRole, string[]> = {
  SuperAdmin: ["/", "/dashboard", "/tenant","/tenant/users", "/tenant/groups", "/tenant/settings", ],
  Admin: ["/", "/messages", "/contacts", "/voicemail", "/phone", "/settings"],
  OrgManager: [
    "/",
    "/messages",
    "/contacts",
    "/voicemail",
    "/phone",
    "/settings",
  ],
  OrgUser: ["/", "/messages", "/contacts", "/voicemail", "/phone", "/settings"],
};
