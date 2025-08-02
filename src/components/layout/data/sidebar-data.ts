import { MessageCircle, Settings } from 'lucide-react';
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
      ],
    },
  ],
};
