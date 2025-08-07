import { BadgeQuestionMark, Contact, LogOut, Mail, MessageCircle, Phone, Settings, Voicemail } from 'lucide-react';
import { type SidebarData } from '../types';


export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
         {
          title: 'Dashboard',
          url: '/dashboard',
          icon: MessageCircle,
        },
         {
          title: 'User',
          url: '/users',
          icon: MessageCircle,
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
