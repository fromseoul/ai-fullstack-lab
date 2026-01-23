import type { Metadata } from "next";
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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
