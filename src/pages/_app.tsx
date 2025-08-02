
import RootClientLayout from "@/components/layout/root-client-layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RootClientLayout>
      <Component {...pageProps} />
    </RootClientLayout>
);
}
