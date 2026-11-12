"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { PiArrowDownBold, PiMouseSimple } from "react-icons/pi";
import { useLoader } from "@/components/LoaderProvider";

gsap.registerPlugin(useGSAP);

const IDLE_DELAY_S = 5;

type ScrollZone = [start: number, end: number];

type ScrollHintProps = {
  text: string;
  // Scroll positions in px where the hint waits for the visitor. Scrolling past the end means
  // they found their way on, so the hint doesn't come back until the page reloads.
  getZone?: () => ScrollZone;
};

const getTopZone = (): ScrollZone => [0, 0];

export function ScrollHint({ text, getZone = getTopZone }: ScrollHintProps) {
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

      const isReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let isShown = false;
      let showTimeline: gsap.core.Timeline | null = null;
      let hideTimeline: gsap.core.Timeline | null = null;
      let arrowTween: gsap.core.Tween | null = null;

      const show = () => {
        isShown = true;
        hideTimeline?.kill();
        status.textContent = text;
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
          arrowTween = gsap.fromTo(
            arrow,
            { y: 0 },
            {
              y: 12,
              duration: 0.8,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
          );
        }
      };

      const hide = () => {
        if (!isShown) return;
        isShown = false;

        // Hides from the current state, so a scroll during the intro doesn't jump.
        showTimeline?.kill();
        status.textContent = "";
        const shownArrowTween = arrowTween;
        hideTimeline = gsap
          .timeline({ onComplete: () => shownArrowTween?.kill() })
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

      const delayedShow = gsap.delayedCall(IDLE_DELAY_S, show).pause();

      const update = () => {
        const [start, end] = getZone();
        const scrollY = window.scrollY;

        if (scrollY > end) {
          window.removeEventListener("scroll", update);
          delayedShow.kill();
          hide();
        } else if (scrollY < start) {
          delayedShow.pause();
          hide();
        } else if (!isShown) {
          // Waits for the visitor to stop scrolling, so it doesn't interrupt a slow scroll.
          delayedShow.restart(true);
        }
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      return () => window.removeEventListener("scroll", update);
    },
    { dependencies: [isLoaderVisible], scope: hintRef },
  );

  return (
    // pointer-events-none lets wheel, touch and nav clicks reach the page, so scrolling on dismisses the hint.
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
          {text}
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
