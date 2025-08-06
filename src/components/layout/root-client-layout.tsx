'use client'

import { ThemeProvider } from '@/components/layout/theme-provider'
import Layout from './layout'
import { Toaster } from 'react-hot-toast'
import { TenantProvider } from '@/context/TenantContext'

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster position="top-right" reverseOrder={false} />
      <TenantProvider>
        <Layout>{children}</Layout>
      </TenantProvider>
    </ThemeProvider>
  )
}
