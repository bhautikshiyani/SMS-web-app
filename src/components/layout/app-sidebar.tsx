"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/layout/nav-group";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { sidebarData } from "./data/sidebar-data";
import { ArrowLeft, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { roleBasedNav } from "./data/RolebaseNavigation";
import { UserRole } from "@/types/user";
import dynamic from "next/dynamic";

const LoadingScreen = dynamic(() => import('@/components/common/LoadingScreen'), {
  ssr: false,
});

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: any | null;
}
function injectTenantId(group: any, tenantId: string): any {
  return {
    ...group,
    items: group.items.map((item:any) => ({
      ...item,
      url: item.url.includes('?')
        ? `${item.url}&tenantId=${tenantId}`
        : `${item.url}?tenantId=${tenantId}`,
    })),
  };
}
export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");

  const role = user?.role as UserRole | undefined;
  if (!role) return <LoadingScreen />;

  const handleLogout = () => {
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const filteredNavMain = sidebarData.navGroups
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (roleBasedNav[role]?.includes(item.title)) return true;
        if (item.items) {
          return item.items.some((sub) => roleBasedNav[role]?.includes(sub.title));
        }
        return false;
      });

      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

  const filteredFooter = sidebarData.footer
    .map((footerGroup) => {
      const filteredItems = footerGroup.items.filter((item) =>
        roleBasedNav[role]?.includes(item.title)
      );
      return { ...footerGroup, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);



  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {(role === "SuperAdmin" && tenantId)
          ?
          <>
            <SidebarGroup className="-mb-2.5">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    onClick={() => router.push('/tenant')}
                    tooltip={"Back to Home"}
                  >
                    <ArrowLeft />
                    <span>Back to Tenant</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            {sidebarData.tenantGroups?.map((group) => {
              const updatedGroup = injectTenantId(group, tenantId);
              return <NavGroup key={updatedGroup.title} {...updatedGroup} />;
            })
            }
          </>


          : filteredNavMain.map((group) => (
            <NavGroup key={group.title} {...group} />
          ))}

      </SidebarContent>

      <SidebarFooter>
        {filteredFooter.map((group) => (
          <NavGroup key={group.title} className="p-0" {...group} />
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
