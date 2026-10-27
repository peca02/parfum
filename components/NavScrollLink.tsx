"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { VIDEO_SCROLL_TRIGGER_ID } from "@/lib/scrollSections";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const MIN_DURATION_S = 2;
const MAX_DURATION_S = 6;
const DURATION_PER_VIEWPORT_S = 0.8;

type NavScrollLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  // Fraction of the video scroll range to land on.
  progress: number;
};

export function NavScrollLink({ progress, ...linkProps }: NavScrollLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const videoTrigger = ScrollTrigger.getById(VIDEO_SCROLL_TRIGGER_ID);
    if (!videoTrigger) return;
    event.preventDefault();

    // Measured from the video range, not the page end, so content after the video doesn't shift it.
    const target =
      videoTrigger.start + progress * (videoTrigger.end - videoTrigger.start);
    const viewports = Math.abs(target - window.scrollY) / window.innerHeight;
    const isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Scrolling the window itself, instead of jumping, plays the video and the text animations on the way.
    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
      duration: isReducedMotion
        ? 0
        : gsap.utils.clamp(
            MIN_DURATION_S,
            MAX_DURATION_S,
            viewports * DURATION_PER_VIEWPORT_S,
          ),
      ease: "power2.inOut",
      overwrite: true,
    });
  };

  return <Link {...linkProps} onClick={handleClick} />;
}
