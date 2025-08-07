"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/layout/nav-group";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { sidebarData } from "./data/sidebar-data";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { roleBasedNav } from "./data/RolebaseNavigation";
import { UserRole } from "@/types/user";
import dynamic from "next/dynamic";
const LoadingScreen = dynamic(() => import('@/components/common/LoadingScreen'), {
  ssr: false,
});
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: any | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const router = useRouter();
  
  const handleLogout = () => {
    // dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };
  const role = user?.role as UserRole | undefined;
  if (!role) {
    return <LoadingScreen />;
  }
  const filteredNavMain = sidebarData.navGroups
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (roleBasedNav[role]?.includes(item.title)) {
          return true;
        }

        if (item.items) {
          const hasVisibleSubItem = item.items.some((subItem) =>
            roleBasedNav[role]?.includes(subItem.title)
          );
          return hasVisibleSubItem;
        }

        return false;
      });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
  const filteredFooter = sidebarData.footer
    .map((footerGroup) => {
      const filteredItems = footerGroup.items.filter((item) =>
        roleBasedNav[role]?.includes(item.title)
      );

      return {
        ...footerGroup,
        items: filteredItems,
      };
    })
    .filter((footerGroup) => footerGroup.items.length > 0);
  return (
    <Sidebar 
        suppressHydrationWarning={true}
    
    collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavMain.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {filteredFooter.map((props) => (
          <NavGroup className="p-0" key={props.title} {...props} />
        ))}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer"
              onClick={handleLogout}
              tooltip={"Log out"}
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
