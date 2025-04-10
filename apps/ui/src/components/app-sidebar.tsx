import {
  Calendar,
  Home,
  Inbox,
  Briefcase,
  StepForward,
  
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../';

// Menu items.
const items = [
  {
    title: 'Home',
    url: '#',
    icon: Home,
  },
  {
    title: 'Drawnings',
    url: '/drawings',
    icon: Inbox,
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: Calendar,
  },
  {
    title: 'Sequences',
    url: '/sequences',
    icon: StepForward,
  },
  {
    title: 'Job Orders',
    url: '/job-orders',
    icon: Briefcase,
  },
];

export function AppSidebar() {
  return (
    <Sidebar side="left" collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
