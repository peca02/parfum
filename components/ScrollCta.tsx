"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { createScrollTimeline } from "@/components/ScrollReveal";
import type { ScrollRange } from "@/lib/scrollSections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Distance from the circle's edge, in px, at which the cursor starts pulling it.
const MAGNET_REACH_PX = 100;
// Shares of the cursor offset the circle and its label follow. The label follows more, for depth.
const CIRCLE_PULL = 0.35;
const LABEL_PULL = 0.5;
// GSAP rounds px values to whole numbers, so a normalized length of 1 would only jump between 0 and 1.
const OUTLINE_LENGTH = 100;
// How long each text stays on screen before the label and the price swap.
const SWAP_DELAY_S = 5;
const ROLL_DURATION_S = 0.5;
const ROLL_STAGGER_S = 0.02;

type ScrollCtaProps = {
  label: string;
  price: string;
  href: string;
  enter: ScrollRange;
};

export function ScrollCta({ label, price, href, enter }: ScrollCtaProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const link = linkRef.current;
      const labelMask = labelRef.current;
      if (!link || !labelMask) return;

      const [enterStart, enterEnd] = enter;
      const enterDuration = enterEnd - enterStart;

      // Swaps the label and the price every few seconds, but only while the entrance is
      // complete. Scrolling back stops the swaps, so the exit runs with the text on screen.
      const startTextSwaps = (
        scrollTimeline: gsap.core.Timeline,
        rollVars: gsap.TweenVars,
      ) => {
        const layerChars = gsap.utils
          .toArray<HTMLElement>("[data-cta-text]", link)
          .map((layer) => gsap.utils.toArray<HTMLElement>("[data-cta-char]", layer));
        let shownIndex = 0;
        let delayedSwap: gsap.core.Tween | null = null;
        let swapTimeline: gsap.core.Timeline | null = null;
        let isHovered = false;
        let isFocused = false;

        gsap.set(layerChars[1], { yPercent: 100 });

        const stopTimer = () => {
          delayedSwap?.kill();
          delayedSwap = null;
        };

        // Every start counts the full delay again.
        const startTimer = () => {
          stopTimer();
          const isEntered = scrollTimeline.progress() === 1;
          if (isEntered && !isHovered && !isFocused) {
            delayedSwap = gsap.delayedCall(SWAP_DELAY_S, swap);
          }
        };

        const swap = () => {
          delayedSwap = null;
          const nextIndex = 1 - shownIndex;
          swapTimeline = gsap
            .timeline({
              onComplete: () => {
                swapTimeline = null;
                startTimer();
              },
            })
            .to(layerChars[shownIndex], { yPercent: -100, ...rollVars }, 0)
            .fromTo(
              layerChars[nextIndex],
              { yPercent: 100 },
              { yPercent: 0, ...rollVars },
              0,
            );
          shownIndex = nextIndex;
        };

        scrollTimeline.eventCallback("onUpdate", () => {
          if (scrollTimeline.progress() < 1) stopTimer();
          else if (!delayedSwap && !swapTimeline) startTimer();
        });

        const handleMouseEnter = () => {
          isHovered = true;
          stopTimer();
        };
        const handleMouseLeave = () => {
          isHovered = false;
          if (!swapTimeline) startTimer();
        };
        // Only keyboard focus holds the text, so a click doesn't keep it held after the cursor leaves.
        const handleFocus = () => {
          isFocused = link.matches(":focus-visible");
          if (isFocused) stopTimer();
        };
        const handleBlur = () => {
          if (!isFocused) return;
          isFocused = false;
          if (!swapTimeline) startTimer();
        };

        link.addEventListener("mouseenter", handleMouseEnter);
        link.addEventListener("mouseleave", handleMouseLeave);
        link.addEventListener("focus", handleFocus);
        link.addEventListener("blur", handleBlur);

        return () => {
          link.removeEventListener("mouseenter", handleMouseEnter);
          link.removeEventListener("mouseleave", handleMouseLeave);
          link.removeEventListener("focus", handleFocus);
          link.removeEventListener("blur", handleBlur);
          stopTimer();
          swapTimeline?.kill();
          // The swaps run outside the matchMedia context, so their transforms are cleared by hand.
          gsap.set(layerChars.flat(), { clearProps: "transform" });
        };
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Every tween states its start values, because invalidateOnRefresh re-reads
        // the start values of to() tweens from whatever state the elements are in.
        // The outline, fill and label follow each other with a slight overlap.
        const scrollTimeline = createScrollTimeline()
          .fromTo(
            link,
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: "none", duration: enterDuration * 0.1 },
            enterStart,
          )
          .fromTo(
            "[data-cta-outline]",
            { strokeDashoffset: OUTLINE_LENGTH },
            {
              strokeDashoffset: 0,
              ease: "power1.out",
              duration: enterDuration * 0.4,
            },
            enterStart,
          )
          .fromTo(
            "[data-cta-fill]",
            { scale: 0 },
            { scale: 1, ease: "power1.out", duration: enterDuration * 0.35 },
            enterStart + enterDuration * 0.35,
          )
          .fromTo(
            "[data-cta-label]",
            { yPercent: 100 },
            { yPercent: 0, ease: "power1.out", duration: enterDuration * 0.35 },
            enterStart + enterDuration * 0.65,
          );

        return startTextSwaps(scrollTimeline, {
          duration: ROLL_DURATION_S,
          ease: "power3.inOut",
          stagger: ROLL_STAGGER_S,
        });
      });

      // Without the entrance, an empty scroll timeline still tells when the end is reached,
      // and the texts swap instantly.
      mm.add("(prefers-reduced-motion: reduce)", () =>
        startTextSwaps(createScrollTimeline(), { duration: 0 }),
      );

      mm.add(
        "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
        () => {
          let isPulled = false;

          const pull = (offsetX: number, offsetY: number) => {
            const pullVars = {
              duration: 0.6,
              ease: "power3.out",
              overwrite: "auto",
            } satisfies gsap.TweenVars;
            gsap.to(link, {
              x: offsetX * CIRCLE_PULL,
              y: offsetY * CIRCLE_PULL,
              ...pullVars,
            });
            // The label sits inside the circle, so it only adds the difference between the pulls.
            gsap.to(labelMask, {
              x: offsetX * (LABEL_PULL - CIRCLE_PULL),
              y: offsetY * (LABEL_PULL - CIRCLE_PULL),
              ...pullVars,
            });
          };

          const release = () => {
            gsap.to([link, labelMask], {
              x: 0,
              y: 0,
              duration: 1,
              ease: "elastic.out(1, 0.4)",
              overwrite: "auto",
            });
          };

          const handlePointerMove = (event: PointerEvent) => {
            // The bounds include the current pull, so it is subtracted to get the resting center.
            const bounds = link.getBoundingClientRect();
            const centerX =
              bounds.left + bounds.width / 2 - Number(gsap.getProperty(link, "x"));
            const centerY =
              bounds.top + bounds.height / 2 - Number(gsap.getProperty(link, "y"));
            const offsetX = event.clientX - centerX;
            const offsetY = event.clientY - centerY;
            const isInReach =
              Math.hypot(offsetX, offsetY) < bounds.width / 2 + MAGNET_REACH_PX;

            if (isInReach) {
              isPulled = true;
              pull(offsetX, offsetY);
            } else if (isPulled) {
              isPulled = false;
              release();
            }
          };

          window.addEventListener("pointermove", handlePointerMove, { passive: true });

          return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            // Leaves the circle at rest when the device stops matching, like on a switch to touch.
            gsap.killTweensOf([link, labelMask]);
            gsap.set([link, labelMask], { x: 0, y: 0 });
          };
        },
      );
    },
    { scope: linkRef },
  );

  return (
    // ScrollReveal leaves this link out of its line split, because it runs its own entrance.
    <Link
      ref={linkRef}
      href={href}
      data-reveal-ignore
      className="relative mt-[1.5em] grid size-[4.5em] place-items-center rounded-full text-lead font-bold text-cta-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copy"
    >
      <span
        data-cta-fill
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-cta"
      />
      {/* An SVG outline instead of a border, so the entrance can draw it. Rotated to start at the top. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full -rotate-90 overflow-visible"
      >
        <circle
          data-cta-outline
          cx="50"
          cy="50"
          r="50"
          fill="none"
          className="stroke-cta"
          // In viewBox units, because a non-scaling stroke makes Chromium ignore pathLength.
          // 1.5 of 100 units is about 2px at a 144px circle.
          strokeWidth="1.5"
          pathLength={OUTLINE_LENGTH}
          strokeDasharray={OUTLINE_LENGTH}
        />
      </svg>
      <span ref={labelRef} className="relative block overflow-y-clip">
        {/* Both texts share one grid cell. The waiting one sits above or below this grid's own clip,
            which moves with the exit, so it never slides into view while the label leaves. */}
        <span data-cta-label className="grid overflow-y-clip">
          {[label, price].map((text, layerIndex) => (
            <span
              key={layerIndex}
              data-cta-text
              aria-hidden="true"
              className="col-start-1 row-start-1 flex justify-center"
            >
              {Array.from(text).map((char, charIndex) => (
                <span
                  key={charIndex}
                  data-cta-char
                  className="inline-block whitespace-pre"
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </span>
      </span>
      {/* The visible texts swap every few seconds, so screen readers get both at once instead. */}
      <span className="sr-only">{`${label} ${price}`}</span>
    </Link>
  );
}
