import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Parfum",
    description: "Parfum",
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${satoshi.variable} h-full antialiased`}>
      {/* The dark background also fills the scrollbar gutter, which matches the dark pages. */}
      <body className="min-h-full flex flex-col bg-night">{children}</body>
    </html>
  );
}
