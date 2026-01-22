import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/hooks/useTelegram";
import { TonProvider } from "@/components/TonProvider";
import { InfoProvider } from "@/context/InfoContext";
import Script from "next/script";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOON | Cricket Prediction Market",
  description: "Trade your knowledge on the ICC 2026 World Cup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505] text-white selection:bg-yellow-500/30`}
      >
        <TonProvider>
          <TelegramProvider>
            <InfoProvider>
              {children}
              <BottomNav />
            </InfoProvider>
          </TelegramProvider>
        </TonProvider>
      </body>
    </html>
  );
}