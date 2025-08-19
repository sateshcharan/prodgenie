import * as React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { useChatStore } from '@prodgenie/libs/store';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../sidebar';

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { open } = useChatStore();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url === '#' ? (
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => open()}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </button>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
