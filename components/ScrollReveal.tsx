"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Vertical travel as a fraction of the viewport height, on each side of the rest position.
const DRIFT = 0.12;
const SCRUB_SMOOTHING_S = 0.6;
const DESCENDER_ROOM_EM = 0.15;
// Width of the soft mask edge the lines enter through (side) and exit through (top).
const ENTER_FEATHER_EM = 0.5;
const EXIT_FEATHER_EM = 0.3;

// Fractions of the full page scroll, the same progress that drives the video.
type ScrollRange = [start: number, end: number];

type ScrollRevealProps = {
  children: ReactNode;
  from: "left" | "right";
  enter: ScrollRange;
  // Without an exit range the text stays in place until the end of the page.
  exit?: ScrollRange;
  className?: string;
};

// The timeline lasts exactly 1, so its time equals the page scroll progress.
const createScrollTimeline = () =>
  gsap
    .timeline({
      scrollTrigger: {
        start: 0,
        end: "max",
        scrub: SCRUB_SMOOTHING_S,
        invalidateOnRefresh: true,
      },
    })
    .set({}, {}, 1);

export function ScrollReveal({
  children,
  from,
  enter,
  exit,
  className = "",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const [enterStart, enterEnd] = enter;
    const enterDuration = enterEnd - enterStart;
    const direction = from === "left" ? -1 : 1;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      // Splits once, after the font loads. autoSplit isn't needed, because the text sizes
      // are in viewport units, so the line breaks stay the same on resize.
      document.fonts.ready.then(() =>
        context.add(() => {
          const textBlocks = Array.from(container.children);
          const split = SplitText.create(textBlocks, {
            type: "lines",
            mask: "lines",
            // The split lines keep the original text, so screen readers read it unchanged.
            aria: "none",
          });

          // In a flex column the masks' negative margins add up instead of collapsing
          // into the larger one, so they cancel the mask padding exactly.
          gsap.set(textBlocks, { display: "flex", flexDirection: "column" });

          const featherSide = from === "left" ? "Left" : "Right";

          // A gradient mask replaces the hard overflow clip, so the lines fade in and out
          // at the edges. Each mask grows outward by the feather width, so the text at rest
          // stays fully opaque, and negative margins keep the layout unchanged. The bottom
          // grows too, because Satoshi's descenders reach below the tight line height.
          gsap.set(split.masks, {
            overflow: "visible",
            maskImage: `linear-gradient(to ${from === "left" ? "right" : "left"}, transparent, #000 ${ENTER_FEATHER_EM}em), linear-gradient(transparent, #000 ${EXIT_FEATHER_EM}em)`,
            maskComposite: "intersect",
            [`padding${featherSide}`]: `${ENTER_FEATHER_EM}em`,
            [`margin${featherSide}`]: `-${ENTER_FEATHER_EM}em`,
            paddingTop: `${EXIT_FEATHER_EM}em`,
            marginTop: `-${EXIT_FEATHER_EM}em`,
            paddingBottom: `${DESCENDER_ROOM_EM}em`,
            marginBottom: `-${DESCENDER_ROOM_EM}em`,
          });

          const timeline = createScrollTimeline();

          timeline.fromTo(
            container,
            { y: () => window.innerHeight * DRIFT },
            {
              y: () => (exit ? -window.innerHeight * DRIFT : 0),
              ease: "none",
              duration: (exit ? exit[1] : enterEnd) - enterStart,
            },
            enterStart,
          );

          const hiddenLine = {
            xPercent: direction * 100,
            skewX: direction * -12,
            autoAlpha: 0,
            filter: "blur(12px)",
          };

          // A staggered tween in a scrubbed timeline doesn't render the start state of
          // lines whose turn hasn't come yet, so all lines are hidden up front.
          gsap.set(split.lines, hiddenLine);

          // Every tween states its start values, because invalidateOnRefresh re-reads
          // the start values of to() tweens from whatever state the lines are in.
          timeline.fromTo(
            split.lines,
            hiddenLine,
            {
              xPercent: 0,
              skewX: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              ease: "power1.out",
              duration: enterDuration * 0.6,
              stagger: { amount: enterDuration * 0.4 },
            },
            enterStart,
          );

          if (exit) {
            const [exitStart, exitEnd] = exit;
            const exitDuration = exitEnd - exitStart;

            timeline.fromTo(
              split.lines,
              { yPercent: 0, autoAlpha: 1 },
              {
                yPercent: -110,
                autoAlpha: 0,
                immediateRender: false,
                ease: "power1.in",
                duration: exitDuration * 0.6,
                stagger: { amount: exitDuration * 0.4 },
              },
              exitStart,
            );
          }
        }),
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const timeline = createScrollTimeline();

      timeline.fromTo(
        container,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: enterDuration },
        enterStart,
      );

      if (exit) {
        timeline.to(
          container,
          { autoAlpha: 0, duration: exit[1] - exit[0] },
          exit[0],
        );
      }
    });
  });

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
