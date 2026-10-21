import type { Metadata } from "next";
import localFont from "next/font/local";
import { LoaderProvider } from "@/components/LoaderProvider";
import { Navigation } from "@/components/Navigation";
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
    // overflow-hidden locks scrolling from the first paint, before any JavaScript runs;
    // ScrollVideo removes it when its loader hides.
    <html
      lang="en"
      className={`${satoshi.variable} h-full overflow-hidden antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LoaderProvider>
          <Navigation />
          {children}
        </LoaderProvider>
      </body>
    </html>
  );
}
