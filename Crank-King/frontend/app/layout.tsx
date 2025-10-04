import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/src/components/providers";

export const metadata: Metadata = {
  title: "Crank King",
  description: "Naver keyword flagging dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
