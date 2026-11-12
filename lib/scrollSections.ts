import type { ScrollTrigger } from "gsap/ScrollTrigger";

// Fractions of a scroll range, the same progress that drives its animations.
export type ScrollRange = [start: number, end: number];

type ScrollSection = {
  enter: ScrollRange;
  // Without an exit range the text stays in place until the end of its scroll range.
  exit?: ScrollRange;
};

export const VIDEO_SCROLL_TRIGGER_ID = "scroll-video";
export const BUY_SCROLL_TRIGGER_ID = "scroll-buy";

// The buy section takes the last two viewports of the page scroll, so the video ends where it starts.
// The buy spacer in app/page.tsx provides this length and has to change with it.
// ScrollTrigger only reads an offset from "max" inside clamp(); a bare "max-=200%" is misparsed as 0.
const BUY_SCROLL_START = "clamp(max-=200%)";

// The single source of the video scroll range. The texts share it, so they stay in sync
// with the video when content is added below it.
export const videoScrollRange = {
  start: 0,
  end: BUY_SCROLL_START,
} satisfies ScrollTrigger.Vars;

export const buyScrollRange = {
  start: BUY_SCROLL_START,
  end: "max",
} satisfies ScrollTrigger.Vars;

// Fractions of the video scroll range.
export const scrollSections = {
  essence: { enter: [0.05, 0.16], exit: [0.2, 0.3] },
  linger: { enter: [0.35, 0.475], exit: [0.525, 0.65] },
  presence: { enter: [0.8, 0.95] },
  cta: { enter: [0.9, 1] },
} satisfies Record<string, ScrollSection>;

// Fractions of the buy scroll range. The pause at the start holds the last frame for a moment
// before it shrinks, and the pause at the end keeps the form still while it's filled in.
export const buySections = {
  screenshot: { enter: [0.1, 0.5] },
  heading: { enter: [0.45, 0.65] },
  form: { enter: [0.55, 0.85] },
} satisfies Record<string, ScrollSection>;

// The middle of the whole animation, where the drifting text is vertically centered.
export function getSectionMidpoint({ enter, exit }: ScrollSection) {
  return (enter[0] + (exit ? exit[1] : enter[1])) / 2;
}
