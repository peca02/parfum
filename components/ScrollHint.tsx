"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { PiArrowDownBold, PiMouseSimple } from "react-icons/pi";
import { useLoader } from "@/components/LoaderProvider";

gsap.registerPlugin(useGSAP);

const IDLE_DELAY_S = 5;
const HINT_TEXT = "Scroll to discover";

export function ScrollHint() {
  const hintRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const { isLoaderVisible } = useLoader();

  useGSAP(
    () => {
      const backdrop = backdropRef.current;
      const content = contentRef.current;
      const arrow = arrowRef.current;
      const status = statusRef.current;
      if (isLoaderVisible || !backdrop || !content || !arrow || !status) return;

      // A restored scroll position means the visitor already knows the page scrolls.
      if (window.scrollY > 0) return;

      const isReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let showTimeline: gsap.core.Timeline | null = null;

      const show = () => {
        status.textContent = HINT_TEXT;
        showTimeline = gsap
          .timeline()
          .to(backdrop, { autoAlpha: 1, duration: 0.8, ease: "power2.out" })
          .fromTo(
            content,
            { autoAlpha: 0, y: isReducedMotion ? 0 : 16 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
            "-=0.4",
          );

        if (!isReducedMotion) {
          gsap.to(arrow, {
            y: 12,
            duration: 0.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      };

      const delayedShow = gsap.delayedCall(IDLE_DELAY_S, show);

      const handleScroll = () => {
        window.removeEventListener("scroll", handleScroll);
        delayedShow.kill();
        if (!showTimeline) return;

        // Hides from the current state, so a scroll during the intro doesn't jump.
        showTimeline.kill();
        status.textContent = "";
        gsap
          .timeline({ onComplete: () => gsap.killTweensOf(arrow) })
          .to(content, {
            autoAlpha: 0,
            y: isReducedMotion ? 0 : -8,
            duration: 0.4,
            ease: "power2.in",
          })
          .to(
            backdrop,
            { autoAlpha: 0, duration: 0.6, ease: "power2.out" },
            "-=0.15",
          );
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    },
    { dependencies: [isLoaderVisible], scope: hintRef },
  );

  return (
    // pointer-events-none lets wheel, touch and nav clicks reach the page, so the first scroll dismisses the hint.
    <div ref={hintRef} className="pointer-events-none fixed inset-0 z-45">
      <div
        ref={backdropRef}
        className="invisible absolute inset-0 bg-overlay/60 opacity-0"
      />
      <div
        ref={contentRef}
        aria-hidden="true"
        className="invisible relative flex h-full flex-col items-center justify-center gap-8 px-[6vw] text-overlay-foreground opacity-0 md:gap-10"
      >
        <p className="text-center text-3xl font-bold tracking-widest uppercase md:text-4xl">
          {HINT_TEXT}
        </p>
        <span className="flex flex-col items-center gap-2">
          <PiMouseSimple className="size-16 md:size-20" />
          <span ref={arrowRef}>
            <PiArrowDownBold className="size-10 md:size-12" />
          </span>
        </span>
      </div>
      {/* The visual text stays rendered for the fade-out, so screen readers get their own live region. */}
      <p ref={statusRef} role="status" className="sr-only" />
    </div>
  );
}
