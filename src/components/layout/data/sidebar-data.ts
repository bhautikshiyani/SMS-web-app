import { BadgeQuestionMark, Building2, Contact, LayoutDashboard, LogOut, Mail, MessageCircle, Phone, Settings, Users, Voicemail } from 'lucide-react';
import { type SidebarData } from '../types';


export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
         {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
         {
          title: 'Tenant',
          url: '/tenant',
          icon: Building2,
        },
         {
          title: 'User',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: MessageCircle,
        },
        {
          title: 'Contacts',
          url: '/contacts',
          icon: Contact,
        },
        {
          title: 'Voicemail',
          url: '/voicemail',
          icon: Voicemail,
        },
        {
          title: 'Phone',
          url: '/phone',
          icon: Phone,
        },
      ],
    },
  ],
  footer: [

    {
      title: 'Support Center',
      icon: BadgeQuestionMark,
      items: [
        {
          title: 'Phone Support',
          url: '',
          icon: Phone,
        },
        {
          title: 'Email Support',
          url: '',
          icon: Mail,
        },
      ],
    },
    {
      title: 'Setting',
      items: [
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings,
        },
        
      ],
    },
  ],
};
