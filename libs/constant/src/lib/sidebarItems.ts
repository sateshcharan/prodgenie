import {
  Home,
  Inbox,
  Calendar,
  StepForward,
  Briefcase,
  Calculator,
} from 'lucide-react';

// import { FileType } from '@prodgenie/libs/prisma';

const FileType = {
  drawing: 'drawing',
  template: 'template',
  sequence: 'sequence',
  jobCard: 'jobCard',
  calculation: 'calculation',
};

export const appSidebarItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
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
    title: 'Job Cards',
    url: `/dashboard/${FileType.jobCard}`,
    icon: Briefcase,
  },
  {
    title: 'Calculations',
    url: `/dashboard/${FileType.calculation}`,
    icon: Calculator,
  },
];
