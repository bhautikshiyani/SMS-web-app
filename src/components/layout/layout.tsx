'use client';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { Main } from './main';
import { usePathname } from 'next/navigation';
import { parseJwt } from '@/lib/auth';


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
  const [user, setUser] = useState<any>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY || '');
    const parsed = token ? parseJwt(token) : null;
    setUser(parsed);
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Prevent hydration mismatch: render nothing until after mount
    return null;
  }

  const defaultOpen = Cookies.get('sidebar:state') !== 'true';

  return (
    <SidebarProvider suppressHydrationWarning style={
      {
        "--sidebar-width": 'calc(var(--spacing) * 72)',
        "--header-height": 'calc(var(--spacing) * 12)',
      } as React.CSSProperties
    } defaultOpen={defaultOpen}>
      <AppSidebar user={user} variant="inset" />
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
