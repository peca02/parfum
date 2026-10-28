"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PiArrowRightBold } from "react-icons/pi";
import { createScrollTimeline } from "@/components/ScrollReveal";
import type { ScrollRange } from "@/lib/scrollSections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ROLL_DURATION_S = 0.5;
const ROLL_STAGGER_S = 0.02;

type ScrollCtaProps = {
  price: string;
  label: string;
  href: string;
  enter: ScrollRange;
};

export function ScrollCta({ price, label, href, enter }: ScrollCtaProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const chars = Array.from(label);

  useGSAP(
    () => {
      const link = linkRef.current;
      if (!link) return;

      const [enterStart, enterEnd] = enter;
      const enterDuration = enterEnd - enterStart;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const riseDuration = enterDuration * 0.5;

        // Every tween states its start values, because invalidateOnRefresh re-reads
        // the start values of to() tweens from whatever state the elements are in.
        // The price and label get separate tweens instead of a stagger, because a staggered
        // tween in a scrubbed timeline doesn't render the start state of its later targets.
        createScrollTimeline()
          .fromTo(
            rowRef.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: "none", duration: enterDuration * 0.1 },
            enterStart,
          )
          .fromTo(
            "[data-cta-line]",
            { scaleX: 0 },
            { scaleX: 1, ease: "power1.out", duration: enterDuration * 0.5 },
            enterStart,
          )
          .fromTo(
            "[data-cta-price]",
            { yPercent: 100 },
            { yPercent: 0, ease: "power1.out", duration: riseDuration },
            enterStart + enterDuration * 0.4,
          )
          .fromTo(
            "[data-cta-label]",
            { yPercent: 100 },
            { yPercent: 0, ease: "power1.out", duration: riseDuration },
            enterStart + enterDuration * 0.5,
          );

        // The clone sits right below the label, so both copies move up together.
        const rollStep = {
          yPercent: -100,
          ease: "power3.inOut",
          duration: ROLL_DURATION_S,
          stagger: ROLL_STAGGER_S,
        };
        const roll = gsap
          .timeline({ paused: true })
          .to("[data-roll-char]", rollStep, 0)
          .to("[data-roll-clone-char]", rollStep, 0);

        const playRoll = () => roll.play();
        const reverseRoll = () => roll.reverse();

        link.addEventListener("mouseenter", playRoll);
        link.addEventListener("focus", playRoll);
        link.addEventListener("mouseleave", reverseRoll);
        link.addEventListener("blur", reverseRoll);

        return () => {
          link.removeEventListener("mouseenter", playRoll);
          link.removeEventListener("focus", playRoll);
          link.removeEventListener("mouseleave", reverseRoll);
          link.removeEventListener("blur", reverseRoll);
        };
      });
    },
    { scope: rowRef },
  );

  return (
    // ScrollReveal leaves this row out of its line split, because it runs its own entrance.
    <div
      ref={rowRef}
      data-reveal-ignore
      className="mt-[1.5em] flex items-baseline gap-[1em] text-lead font-bold"
    >
      <p className="overflow-y-clip text-copy-muted">
        <span data-cta-price className="block">
          {price}
        </span>
      </p>
      <Link
        ref={linkRef}
        href={href}
        className="group relative pb-[0.25em] text-copy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copy"
      >
        <span className="block overflow-y-clip">
          <span data-cta-label className="flex items-center gap-[0.5em]">
            {/* Single characters can read letter by letter, so screen readers get the sr-only label. */}
            <span aria-hidden="true" className="relative flex overflow-y-clip">
              {chars.map((char, index) => (
                <span
                  key={index}
                  data-roll-char
                  className="inline-block whitespace-pre"
                >
                  {char}
                </span>
              ))}
              <span className="absolute top-full left-0 flex">
                {chars.map((char, index) => (
                  <span
                    key={index}
                    data-roll-clone-char
                    className="inline-block whitespace-pre"
                  >
                    {char}
                  </span>
                ))}
              </span>
            </span>
            <PiArrowRightBold
              aria-hidden="true"
              className="size-[0.75em] transition-transform duration-300 group-hover:translate-x-[0.25em] group-focus-visible:translate-x-[0.25em]"
            />
          </span>
        </span>
        <span className="sr-only">{label}</span>
        <span
          data-cta-line
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-current"
        />
      </Link>
    </div>
  );
}
