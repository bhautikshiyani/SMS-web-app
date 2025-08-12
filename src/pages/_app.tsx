import RootClientLayout from "@/components/layout/root-client-layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/store";
import NextNProgress from 'nextjs-progressbar';
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      
      <RootClientLayout>
        <NextNProgress options={{ showSpinner: false }}  color="#c3c3c3" />
        <Component {...pageProps} />
      </RootClientLayout>
    </Provider>
  );
}
