import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "心靈同步 Mind Sync — 多人即時網頁卡牌遊戲",
  description: "基於 Liveblocks 與 Next.js 打造的多人極致默契考驗卡牌遊戲，無溝通按順序出牌！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased font-sans bg-poker-bg text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
