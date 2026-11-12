import type { Metadata } from "next";
import Link from "next/link";
import { PiArrowLeftBold } from "react-icons/pi";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "This is just a demo",
    description:
      "Éluvéa is a fictional fragrance and this site is a design template.",
    // A dead end of the demo store, so it stays out of search results.
    robots: { index: false },
  };
}

export default function PaymentPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-[6vw] py-24 text-center text-night-foreground">
      <h1 className="text-display-sm font-black tracking-tight uppercase">
        This is just a demo
      </h1>
      <p className="max-w-prose text-xl text-night-muted">
        Éluvéa is a fictional fragrance and this site is a design template, so
        no purchase can be made. Nothing you entered was saved or sent anywhere.
      </p>
      <Link
        href="/"
        className="mt-4 flex items-center justify-center gap-3 rounded-full bg-night-foreground px-8 py-4 text-lg font-bold text-night uppercase transition-colors hover:bg-night-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-night-foreground"
      >
        <PiArrowLeftBold aria-hidden="true" className="size-5" />
        Back to the start
      </Link>
    </main>
  );
}
