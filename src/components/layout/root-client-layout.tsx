'use client';


import { ThemeProvider } from '@/components/layout/theme-provider';
import Layout from './layout';




export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
 
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Layout>{children}</Layout>
      </ThemeProvider>
  
  );
}