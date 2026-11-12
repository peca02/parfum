"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { createScrollTimeline, ScrollReveal } from "@/components/ScrollReveal";
import {
  BUY_SCROLL_TRIGGER_ID,
  buyScrollRange,
  buySections,
} from "@/lib/scrollSections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Corner radius of the finished screenshot, in px on screen.
const SCREENSHOT_RADIUS_PX = 16;
// How far the form items rise while they fade in.
const FORM_RISE_PX = 32;

type BuySectionProps = {
  // The video and its copy. After the video they shrink into a still screenshot.
  screenshot: ReactNode;
  // The form beside the screenshot, as a title and a form. The title shares the first row with
  // the heading, the form the second row with the screenshot. Elements marked with
  // data-buy-reveal enter one by one.
  children: ReactNode;
};

export function BuySection({ screenshot, children }: BuySectionProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const backdrop = backdropRef.current;
    const stage = stageRef.current;
    const section = sectionRef.current;
    const slot = slotRef.current;
    const form = formRef.current;
    if (!backdrop || !stage || !section || !slot || !form) return;

    const root = document.documentElement;
    const formItems = gsap.utils.toArray<HTMLElement>("[data-buy-reveal]", form);
    const [screenshotStart, screenshotEnd] = buySections.screenshot.enter;
    const screenshotDuration = screenshotEnd - screenshotStart;
    const [formStart, formEnd] = buySections.form.enter;
    const formDuration = formEnd - formStart;

    // The screenshot fits into the slot, aligned to its bottom left corner. The stage
    // scales from its top left corner, so x and y place that corner.
    const getScreenshot = () => {
      const bounds = slot.getBoundingClientRect();
      const scale = Math.min(
        bounds.width / stage.offsetWidth,
        bounds.height / stage.offsetHeight,
      );
      return {
        x: bounds.left,
        y: bounds.bottom - stage.offsetHeight * scale,
        scale,
        // The radius is scaled down with the stage, so it is set larger to look the same on screen.
        borderRadius: `${SCREENSHOT_RADIUS_PX / scale}px`,
      };
    };
    const screenshotVars = {
      x: () => getScreenshot().x,
      y: () => getScreenshot().y,
      scale: () => getScreenshot().scale,
      borderRadius: () => getScreenshot().borderRadius,
    };
    const fullSizeVars = { x: 0, y: 0, scale: 1, borderRadius: "0px" };

    // Once the screenshot starts forming it is only a picture, and the form takes the input.
    let isScreenshot = false;
    const setIsScreenshot = (value: boolean) => {
      if (value === isScreenshot) return;
      isScreenshot = value;
      stage.inert = value;
      section.inert = !value;
    };

    const createTimeline = () =>
      createScrollTimeline({
        ...buyScrollRange,
        id: BUY_SCROLL_TRIGGER_ID,
        onUpdate: (self) => setIsScreenshot(self.progress > screenshotStart),
      });

    // The page turns dark while the screenshot shrinks. Blending the navigation colors along
    // would pass them through the same mid tone as the background and hide the navigation, so
    // --theme-dark switches them halfway, where light text reads better, and their color
    // transitions smooth the switch.
    const addThemeChange = (timeline: gsap.core.Timeline, ease: string) =>
      timeline
        .fromTo(
          backdrop,
          { autoAlpha: 1 },
          { autoAlpha: 0, ease, duration: screenshotDuration },
          screenshotStart,
        )
        .fromTo(
          root,
          { "--theme-dark": 0 },
          { "--theme-dark": 1, duration: 0, immediateRender: false },
          screenshotStart + screenshotDuration / 2,
        );

    const addFormEntrance = (
      timeline: gsap.core.Timeline,
      hiddenItem: gsap.TweenVars,
    ) => {
      // A staggered tween in a scrubbed timeline doesn't render the start state of
      // items whose turn hasn't come yet, so all items are hidden up front.
      gsap.set(formItems, hiddenItem);
      timeline.fromTo(
        formItems,
        hiddenItem,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power1.out",
          duration: formDuration * 0.6,
          stagger: { amount: formDuration * 0.4 },
        },
        formStart,
      );
    };

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Every tween states its start values, because invalidateOnRefresh re-reads
      // the start values of to() tweens from whatever state the elements are in.
      const timeline = createTimeline().fromTo(
        stage,
        fullSizeVars,
        {
          ...screenshotVars,
          ease: "power2.inOut",
          duration: screenshotDuration,
        },
        screenshotStart,
      );
      addThemeChange(timeline, "power2.inOut");
      addFormEntrance(timeline, {
        autoAlpha: 0,
        y: FORM_RISE_PX,
        filter: "blur(8px)",
      });

      return () => setIsScreenshot(false);
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const fadeDuration = screenshotDuration / 2;
      const swapTime = screenshotStart + fadeDuration;

      // Without the zoom, the full-size picture fades out and the screenshot fades in at its place.
      // The later tweens don't render up front, so they don't hide or move the stage on load.
      const timeline = createTimeline()
        .fromTo(
          stage,
          { autoAlpha: 1 },
          { autoAlpha: 0, ease: "none", duration: fadeDuration },
          screenshotStart,
        )
        .fromTo(
          stage,
          fullSizeVars,
          { ...screenshotVars, duration: 0, immediateRender: false },
          swapTime,
        )
        .fromTo(
          stage,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            ease: "none",
            duration: fadeDuration,
            immediateRender: false,
          },
          swapTime,
        );
      addThemeChange(timeline, "none");
      addFormEntrance(timeline, { autoAlpha: 0 });

      return () => setIsScreenshot(false);
    });
  });

  return (
    <>
      {/* The light page behind the video, which fades into the dark body while the screenshot shrinks. */}
      <div ref={backdropRef} aria-hidden="true" className="fixed inset-0 bg-day" />

      {/* contain-paint makes the stage the containing block of the fixed video and copy,
          so they scale and clip with it like one picture. */}
      <div
        ref={stageRef}
        className="fixed inset-0 origin-top-left overflow-hidden contain-paint"
      >
        {screenshot}
      </div>

      {/* Inert until the screenshot starts forming, so the hidden form can't be reached.
          Both columns are subgrids, so the heading lines up with the form title, and the
          screenshot with the form, whichever of them is taller. */}
      <section
        ref={sectionRef}
        id="buy"
        aria-labelledby="buy-heading"
        inert
        className="fixed inset-0 grid grid-cols-[auto_1fr] content-end gap-x-[6vw] gap-y-8 px-[6vw] pb-[6vw] text-night-foreground scheme-dark"
      >
        <div className="row-span-2 grid grid-rows-subgrid items-end">
          <ScrollReveal
            from="left"
            {...buySections.heading}
            scrollRange={buyScrollRange}
            drift={false}
          >
            <h2
              id="buy-heading"
              className="text-display-sm font-black tracking-tight uppercase"
            >
              Make it yours
            </h2>
          </ScrollReveal>
          {/* The screenshot lands here. The vw width and vh height keep the viewport's proportions. */}
          <div ref={slotRef} className="h-[42vh] w-[42vw]" />
        </div>

        <div
          ref={formRef}
          className="row-span-2 grid w-full max-w-2xl grid-rows-subgrid items-end justify-self-center"
        >
          {children}
        </div>
      </section>
    </>
  );
}
