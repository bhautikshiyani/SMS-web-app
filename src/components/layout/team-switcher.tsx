
'use client';
import * as React from 'react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';


export function TeamSwitcher() {
 
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square items-center justify-center rounded-lg group-data-[collapsible=icon]:size-8 size-20">
          <img className="" alt='logo' src='images/logo/top-grade-telecom.png' />
          </div>
           
       
        </SidebarMenuButton>
       
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
