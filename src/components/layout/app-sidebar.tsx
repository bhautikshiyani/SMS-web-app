'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { NavGroup } from '@/components/layout/nav-group';
import { TeamSwitcher } from '@/components/layout/team-switcher';
import { sidebarData } from './data/sidebar-data';


export function AppSidebar({ ...props }) {

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {sidebarData.footer.map((props) => (
          <NavGroup className='p-0' key={props.title} {...props} />
        ))}
      </SidebarFooter>
    </Sidebar>
  );
}
