import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIND_SYNC // TERMINAL OS",
  description: "NEURAL FREQUENCY SYNCHRONIZATION PROTOCOL - HIGH PRECISION DATA PACKET ALIGNMENT",
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
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-mono bg-[#030609] text-[#00ff9d] min-h-screen selection:bg-[#00ff9d] selection:text-[#030609]">
        {children}
      </body>
    </html>
  );
}
