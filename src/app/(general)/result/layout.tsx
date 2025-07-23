import { ReactNode } from "react";
import Head from "./head";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Head />
      {children}
    </div>
  );
}
