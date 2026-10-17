import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Parfum",
    description: "Parfum",
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // overflow-hidden locks scrolling from the first paint, before any JavaScript runs;
    // ScrollVideo removes it when its loader hides.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
