import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "antd/dist/reset.css";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <section className={inter.className}>
      <Component {...pageProps} />
    </section>
  );
}
