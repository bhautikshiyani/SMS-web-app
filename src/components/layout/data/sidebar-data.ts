import { Contact, LogOut, MessageCircle, Phone, Settings, Voicemail } from 'lucide-react';
import { type SidebarData } from '../types';


export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
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
      title: 'Setting',
      items: [
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings,
        },
         {
          title: 'Logout',
          url: '/auth/login',
          icon: LogOut,
        },
      ],
    },
  ],
};
