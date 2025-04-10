import { Home, Inbox, Calendar, StepForward, Briefcase } from 'lucide-react';

export const sidebarItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Drawings',
    url: '/dashboard/drawings',
    icon: Inbox,
  },
  {
    title: 'Templates',
    url: '/dashboard/templates',
    icon: Calendar,
  },
  {
    title: 'Sequences',
    url: '/dashboard/sequences',
    icon: StepForward,
  },
  {
    title: 'Job Orders',
    url: '/dashboard/job-orders',
    icon: Briefcase,
  },
];
