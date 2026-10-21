"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { LiquidGlass } from "@/components/LiquidGlass";
import { useLoader } from "@/components/LoaderProvider";

gsap.registerPlugin(useGSAP);

const INTRO_DELAY_S = 0.4;

type NavigationIntroProps = {
  children: ReactNode;
};

// Links marked with data-nav-link get the hover indicator.
function getNavLink(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const link = target.closest("[data-nav-link]");
  return link instanceof HTMLElement ? link : null;
}

function getDuration(duration: number) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : duration;
}

export function NavigationIntro({ children }: NavigationIntroProps) {
  const navRef = useRef<HTMLElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const { isLoaderVisible } = useLoader();

  useGSAP(
    () => {
      const glass = glassRef.current;
      if (isLoaderVisible || !glass) return;

      const content = [...glass.children].filter(
        (child) => child !== indicatorRef.current,
      );

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const radius = glass.offsetHeight / 2;
        const sideInset = glass.offsetWidth / 2 - radius;

        // Only the glass itself is animated: opacity or clip-path on an ancestor
        // would cut its backdrop-filter off from the video behind it.
        // clip-path is used instead of width, so layout and the refraction map stay untouched.
        gsap
          .timeline({ delay: INTRO_DELAY_S })
          .from(glass, {
            autoAlpha: 0,
            y: -16,
            scale: 0.6,
            duration: 0.5,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          })
          // An explicit end value keeps the radius, otherwise GSAP tweens towards "none" and squares the corners.
          .fromTo(
            glass,
            { clipPath: `inset(0px ${sideInset}px round ${radius}px)` },
            {
              clipPath: `inset(0px 0px round ${radius}px)`,
              duration: 0.9,
              ease: "expo.inOut",
              clearProps: "clipPath",
            },
            "-=0.15",
          )
          .addLabel("spread")
          // Chromium lets a few text pixels leak past the small clip-path circle,
          // so the content stays hidden until the drop has spread.
          .from(
            content,
            {
              autoAlpha: 0,
              duration: 0.5,
              ease: "power2.out",
              clearProps: "opacity,visibility",
            },
            "<0.35",
          )
          // clip-path also cuts off the outer drop shadow, so it fades in once the clip is gone.
          .fromTo(
            glass,
            { "--glass-shadow-strength": 0 },
            {
              "--glass-shadow-strength": 1,
              duration: 0.4,
              ease: "power1.out",
            },
            "spread",
          );
      });
    },
    { dependencies: [isLoaderVisible] },
  );

  useGSAP(
    (_, contextSafe) => {
      const nav = navRef.current;
      const indicator = indicatorRef.current;
      if (!nav || !indicator || !contextSafe) return;

      let isIndicatorVisible = false;

      const moveIndicatorTo = contextSafe((link: HTMLElement) => {
        // The CTA's opaque background would hide the indicator, so around it the indicator
        // grows to the glass edge (the link's top offset equals the glass padding) and shows as a rim.
        const outset = link.hasAttribute("data-nav-cta") ? link.offsetTop : 0;
        // offset* values are relative to the glass and ignore its intro transform.
        const bounds = {
          x: link.offsetLeft - outset,
          y: link.offsetTop - outset,
          width: link.offsetWidth + outset * 2,
          height: link.offsetHeight + outset * 2,
        };

        if (isIndicatorVisible) {
          gsap.to(indicator, {
            ...bounds,
            duration: getDuration(0.45),
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.set(indicator, bounds);
          gsap.to(indicator, {
            autoAlpha: 1,
            duration: getDuration(0.25),
            overwrite: "auto",
          });
        }
        isIndicatorVisible = true;
      });

      const hideIndicator = contextSafe(() => {
        if (!isIndicatorVisible) return;
        gsap.to(indicator, {
          autoAlpha: 0,
          duration: getDuration(0.25),
          overwrite: "auto",
        });
        isIndicatorVisible = false;
      });

      const handlePointerOver = (event: PointerEvent) => {
        const link = getNavLink(event.target);
        if (link) moveIndicatorTo(link);
      };

      const handleFocusIn = (event: FocusEvent) => {
        const link = getNavLink(event.target);
        if (link) {
          moveIndicatorTo(link);
        } else {
          hideIndicator();
        }
      };

      const handleFocusOut = (event: FocusEvent) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !nav.contains(event.relatedTarget)
        ) {
          hideIndicator();
        }
      };

      nav.addEventListener("pointerover", handlePointerOver);
      nav.addEventListener("pointerleave", hideIndicator);
      nav.addEventListener("focusin", handleFocusIn);
      nav.addEventListener("focusout", handleFocusOut);
      return () => {
        nav.removeEventListener("pointerover", handlePointerOver);
        nav.removeEventListener("pointerleave", hideIndicator);
        nav.removeEventListener("focusin", handleFocusIn);
        nav.removeEventListener("focusout", handleFocusOut);
      };
    },
    { scope: navRef },
  );

  return (
    // inert keeps the links out of the tab order while the loader covers them.
    <nav
      ref={navRef}
      aria-label="Primary"
      inert={isLoaderVisible}
      className="pointer-events-auto"
    >
      {/* isolate keeps the indicator's negative z-index behind the links but inside the glass. */}
      <LiquidGlass ref={glassRef} className="relative isolate rounded-full p-1">
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute top-0 left-0 -z-10 rounded-full bg-glass-tint opacity-0 shadow-glass"
        />
        {children}
      </LiquidGlass>
    </nav>
  );
}
