import type { ScrollTrigger } from "gsap/ScrollTrigger";

// Fractions of the video scroll range, the same progress that drives the video.
export type ScrollRange = [start: number, end: number];

type ScrollSection = {
  enter: ScrollRange;
  // Without an exit range the text stays in place until the end of the video.
  exit?: ScrollRange;
};

export const VIDEO_SCROLL_TRIGGER_ID = "scroll-video";

// The single source of the video scroll range. The texts share it, so they stay in sync
// with the video when content is added below it.
export const videoScrollRange = {
  // The full page scroll range, independent of the <html> element height.
  start: 0,
  end: "max",
} satisfies ScrollTrigger.Vars;

export const scrollSections = {
  essence: { enter: [0.05, 0.16], exit: [0.2, 0.3] },
  linger: { enter: [0.35, 0.475], exit: [0.525, 0.65] },
  presence: { enter: [0.8, 0.95] },
  cta: { enter: [0.9, 1] },
} satisfies Record<string, ScrollSection>;

// The middle of the whole animation, where the drifting text is vertically centered.
export function getSectionMidpoint({ enter, exit }: ScrollSection) {
  return (enter[0] + (exit ? exit[1] : enter[1])) / 2;
}
