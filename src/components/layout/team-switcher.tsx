
'use client';
import * as React from 'react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ChartBar } from 'lucide-react';

export function TeamSwitcher() {
 
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div
            className={`flex aspect-square items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground size-8`}
          >
              <ChartBar />
            {/* <img className="" alt='logo' src={data?.brand?.logo} /> */}
          </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              Message
            </div>
       
        </SidebarMenuButton>
       
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
