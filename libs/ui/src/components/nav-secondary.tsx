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
          {items.map((item) => {
            const isHelp = item.title.toLowerCase() === 'get help';

            const Badge = isHelp ? (
              <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-700 rounded-full">
                Coming Soon
              </span>
            ) : null;

            return (
              <SidebarMenuItem key={item.title}>
                {item.url === '#' ? (
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => open()}
                      className="flex items-center gap-2 w-full text-left"
                      disabled={item.title === 'Get Help' ? true : false}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      {Badge}
                    </button>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                      {Badge}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
