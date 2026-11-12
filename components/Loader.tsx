"use client";

import { useLoader } from "@/components/LoaderProvider";

export function Loader() {
  const { isLoaderVisible, counterRef } = useLoader();
  if (!isLoaderVisible) return null;

  return (
    // data-scroll-lock locks scrolling while the loader is rendered (see globals.css).
    <div
      role="status"
      data-scroll-lock
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay font-sans text-2xl text-overlay-foreground"
    >
      Loading...&nbsp;
      <span aria-hidden="true">
        <span ref={counterRef}>0</span>%
      </span>
    </div>
  );
}
