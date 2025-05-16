import {
  Home,
  Inbox,
  Calendar,
  StepForward,
  Briefcase,
  Calculator,
  SearchIcon,
  HelpCircleIcon,
  SettingsIcon,
} from 'lucide-react';

import { FileType } from './fileTypes.js';

export const appSidebarItems = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircleIcon,
    },
    {
      title: 'Search',
      url: '#',
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      title: 'Job Cards',
      url: `/dashboard/${FileType.jobCard}`,
      icon: Briefcase,
    },
    {
      title: 'Drawings',
      url: `/dashboard/${FileType.drawing}`,
      icon: Inbox,
    },
    {
      title: 'Templates',
      url: `/dashboard/${FileType.template}`,
      icon: Calendar,
    },
    {
      title: 'Sequences',
      url: `/dashboard/${FileType.sequence}`,
      icon: StepForward,
    },

    {
      title: 'Configs',
      url: `/dashboard/${FileType.config}`,
      icon: Calculator,
    },
  ],
};
