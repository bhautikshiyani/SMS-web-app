import { UserRole } from "@/types/user";

export const roleBasedNav: Record<UserRole, string[]> = {
  SuperAdmin: [ "Tenants", "User","General Settings"],
  Admin: ["Messages", "Contacts", "Voicemail", "Phone", "Settings"],
  OrgManager: ["Messages", "Contacts", "Voicemail", "Phone", "Settings"],
  OrgUser: ["Messages", "Contacts", "Voicemail", "Phone", "Settings"],
};

// Flattened route map by title
export const roleAccessMap: Record<UserRole, string[]> = {
  SuperAdmin: ["/", "/admin/tenant","/admin/tenant/users", "/admin/tenant/groups", "/admin/tenant/settings","/admin/settings", ],
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
