import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import FloatingChat from "@/components/FloatingChat";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
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
  title: "Flickpick",
  description: "A movie journal that makes you prove you watched it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex justify-between items-center px-6 py-5 max-w-6xl mx-auto">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              flick<span className="text-blush">pick</span>
            </Link>

            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm text-muted hover:text-cream transition-colors cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm px-4 py-2 rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors cursor-pointer">
                    Sign up
                  </button>
                </SignUpButton>
              </Show>

              <Show when="signed-in">
                <Link href="/dashboard" className="text-sm text-muted hover:text-cream transition-colors">
                      Discover
                </Link>
                <Link href="/watchlist" className="text-sm text-muted hover:text-cream transition-colors">
                     Watchlist
                </Link>
          <UserButton />
          </Show>
            </div>
          </header>

          {children}
          <Show when="signed-in">
            <FloatingChat />
          </Show>
        </body>

      </html>
    </ClerkProvider>
  );
}