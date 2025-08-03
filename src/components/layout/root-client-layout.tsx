"use client";

import { ThemeProvider } from "@/components/layout/theme-provider";
import Layout from "./layout";

import { Toaster } from "react-hot-toast";

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster />
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
}
