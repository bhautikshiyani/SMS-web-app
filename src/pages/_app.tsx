import RootClientLayout from "@/components/layout/root-client-layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <RootClientLayout>
        <Component {...pageProps} />
      </RootClientLayout>
    </Provider>
  );
}
