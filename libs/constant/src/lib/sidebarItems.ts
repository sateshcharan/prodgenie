import {
  Home,
  Inbox,
  Calendar,
  StepForward,
  Briefcase,
  Calculator,
  HelpCircleIcon,
  SettingsIcon,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  Table2,
} from 'lucide-react';

import { FileType } from './fileTypes.js';

export const appSidebarItems = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
    { title: 'Notifications', url: '/dashboard/notifications', icon: BellIcon },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/dashboard/settings/account',
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircleIcon,
    },
  ],
  navUser: [
    {
      title: 'Account',
      url: '/dashboard/settings/account',
      icon: UserCircleIcon,
    },
    {
      title: 'Billing',
      url: '/dashboard/settings/billing',
      icon: CreditCardIcon,
    },
    {
      title: 'Notifications',
      url: '/dashboard/settings/notification',
      icon: BellIcon,
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
  ],
  configs: [
    {
      title: 'Sequences',
      url: `/dashboard/${FileType.sequence}`,
      icon: StepForward,
    },
    {
      title: 'Templates',
      url: `/dashboard/${FileType.template}`,
      icon: Calendar,
    },
    {
      title: 'Tables',
      url: `/dashboard/${FileType.table}`,
      icon: Table2,
    },
    {
      title: 'Configs',
      url: `/dashboard/${FileType.config}`,
      icon: Calculator,
    },
  ],
  builders: [
    {
      title: 'Sequence',
      url: '/dashboard/sequence/builder',
      icon: StepForward,
    },
    {
      title: 'Template',
      url: '/dashboard/template/builder',
      icon: Calendar,
    },
    {
      title: 'Table',
      url: '/dashboard/table/builder',
      icon: Briefcase,
    },
  ],
  workspaceLogos: [GalleryVerticalEnd, AudioWaveform, Command],
};
