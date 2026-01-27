import type { Metadata } from "next";
import Script from "next/script";
import ClientLayout from "@/components/ClientLayout";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI Fullstack Lab",
  description: "Next.js + Express Monorepo Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="afterInteractive"
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
