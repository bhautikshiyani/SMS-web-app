'use client';
import Cookies from 'js-cookie';
import React from 'react';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { Main } from './main';
import { usePathname } from 'next/navigation';


const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/resetPassword',
  '/auth/forgotPassword',
  '/404',
];

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get('sidebar:state') !== 'true';



  return (

    <SidebarProvider style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    } defaultOpen={defaultOpen}>
      <AppSidebar variant="inset" />
      <div
        id="content"
        suppressHydrationWarning={true}
        className={"bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm "}
      >
        <Header />


        <Main fixed>{children}</Main>
      </div>
    </SidebarProvider>

  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.includes(pathname);

  return isAuthRoute ? <AuthLayout>{children}</AuthLayout> : <MainLayout>{children}</MainLayout>;
}
