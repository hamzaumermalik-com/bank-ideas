import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GameHud from "@/components/game-hud";
import AiChatbot from "@/components/ai-chatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bank Ideas",
  description: "Submit and browse ideas for improving the bank.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <GameHud />
        <AiChatbot />
      </body>
    </html>
  );
}
