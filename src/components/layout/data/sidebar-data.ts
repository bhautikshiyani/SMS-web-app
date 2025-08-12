import {
  BadgeQuestionMark,
  Building2,
  Contact,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Phone,
  Settings,
  User2,
  Users,
  Voicemail,
} from "lucide-react";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Tenant",
          url: "/admin/tenant",
          icon: Building2,
        },
        {
          title: "Messages",
          url: "/messages",
          icon: MessageCircle,
        },
        {
          title: "Contacts",
          url: "/contacts",
          icon: Contact,
        },
        {
          title: "Voicemail",
          url: "/voicemail",
          icon: Voicemail,
        },
        {
          title: "Phone",
          url: "/phone",
          icon: Phone,
        },
      ],
    },
  ],
  tenantGroups: [
    {
      title: "General",
      items: [
        {
          title: "User",
          url: "/admin/tenant/users",
          icon: User2,
        },
        {
          title: "Groups",
          url: "/admin/tenant/groups",
          icon: Users,
        },
        {
          title: "Settings",
          url: "/admin/tenant/settings",
          icon: Settings,
        },
      ],
    },
  ],

  footer: [
    {
      title: "Support Center",
      icon: BadgeQuestionMark,
      items: [
        {
          title: "Phone Support",
          url: "",
          icon: Phone,
        },
        {
          title: "Email Support",
          url: "",
          icon: Mail,
        },
      ],
    },
    {
      title: "Setting",
      items: [
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
        {
          title: "General Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
};
