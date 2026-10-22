import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "心天秤 Mind Sync",
  description: "心天秤 - 禁言數字，只談價值，最純粹的默契卡牌遊戲。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#090b0e] text-[#f8fafc] min-h-screen selection:bg-[#f59e0b] selection:text-black">
        {children}
      </body>
    </html>
  );
}
