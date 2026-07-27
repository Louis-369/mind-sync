import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "心天秤 Kokoro Tenbin",
  description: "透過言語構築，在心的天秤上取得平衡，最純粹的默契卡牌遊戲。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Noto+Serif+JP:wght@600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-ukiyo-bg text-ukiyo-foam min-h-screen">
        {children}
      </body>
    </html>
  );
}
