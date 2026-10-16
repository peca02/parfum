"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MIN_LOADER_DURATION_MS = 1000;
// Caps how fast the counter catches up after a jump in load progress (200% per second).
const COUNTER_MAX_SPEED_PER_MS = 0.2;

type ScrollVideoProps = {
  src: string;
  className?: string;
};

export function ScrollVideo({ src, className = "" }: ScrollVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);

  useGSAP(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    let currentTarget = 0;
    let seekPending = false;
    let loadProgress = 0;
    let displayedProgress = 0;
    const loaderStart = performance.now();

    const doSeek = () => {
      seekPending = false;
      video.currentTime = currentTarget;
    };

    const requestSeek = () => {
      if (video.seeking) {
        seekPending = true;
      } else {
        doSeek();
      }
    };

    const scrollTrigger = ScrollTrigger.create({
      // Track the full page scroll range, independent of the <html> element height.
      start: 0,
      end: "max",
      scrub: true,
      onUpdate: (self) => {
        if (!Number.isFinite(video.duration)) return;
        currentTarget = self.progress * video.duration;
        requestSeek();
      },
    });

    const updateBufferProgress = () => {
      if (!Number.isFinite(video.duration) || video.buffered.length === 0) {
        return;
      }
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      loadProgress = Math.max(
        loadProgress,
        (bufferedEnd / video.duration) * 100,
      );
    };

    // Sync the frame with the scroll position the page was loaded at.
    const handleLoadedMetadata = () => {
      currentTarget = scrollTrigger.progress * video.duration;
      requestSeek();
      updateBufferProgress();
    };

    const handleSeeked = () => {
      if (seekPending) doSeek();
    };

    const handleCanPlay = () => {
      loadProgress = 100;
    };

    // The counter follows whichever is slower: the minimum duration or the real load.
    // Uses real elapsed time because gsap.ticker's deltaTime is capped by lag smoothing.
    let lastTick = loaderStart;
    const updateLoader = () => {
      const now = performance.now();
      const timeProgress =
        Math.min((now - loaderStart) / MIN_LOADER_DURATION_MS, 1) * 100;
      const targetProgress = Math.min(timeProgress, loadProgress);
      displayedProgress = Math.min(
        targetProgress,
        displayedProgress + (now - lastTick) * COUNTER_MAX_SPEED_PER_MS,
      );
      lastTick = now;

      if (counterRef.current) {
        counterRef.current.textContent = `${Math.round(displayedProgress)}`;
      }

      if (displayedProgress >= 100) {
        gsap.ticker.remove(updateLoader);
        setIsLoaderVisible(false);
      }
    };

    // iOS Safari won't load or seek a video that has never been played. Muted inline
    // video may play without a gesture; if that is blocked, the touchstart fallback retries.
    const unlockVideo = () => {
      video
        .play()
        .then(() => {
          video.pause();
          window.removeEventListener("touchstart", unlockVideo);
        })
        .catch(() => {});
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("progress", updateBufferProgress);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("canplay", handleCanPlay);
    window.addEventListener("touchstart", unlockVideo, { once: true });
    unlockVideo();
    gsap.ticker.add(updateLoader);

    // Events may have already fired before hydration (e.g. cached video).
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata();
    }
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleCanPlay();
    }

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // A non-axis-aligned transform keeps the browser from snapping the video layer
      // to whole pixels, which shows as jitter during the slow end of the easing.
      gsap.set(wrapper, { rotation: 0.01 });
      const xTo = gsap.quickTo(wrapper, "x", {
        duration: 1.25,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(wrapper, "y", {
        duration: 1.25,
        ease: "power2.out",
      });

      const handleMouseMove = (event: MouseEvent) => {
        const moveX = (event.clientX / window.innerWidth) * 2 - 1;
        const moveY = (event.clientY / window.innerHeight) * 2 - 1;
        xTo(moveX * -15);
        yTo(moveY * -15);
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    });

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("progress", updateBufferProgress);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("canplay", handleCanPlay);
      window.removeEventListener("touchstart", unlockVideo);
      gsap.ticker.remove(updateLoader);
    };
  });

  return (
    <>
      <div
        ref={wrapperRef}
        className={`fixed top-0 left-0 z-0 h-full w-full origin-center scale-105 ${className}`}
      >
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      {isLoaderVisible && (
        <div
          role="status"
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay font-sans text-2xl text-overlay-foreground"
        >
          Loading...&nbsp;
          <span aria-hidden="true">
            <span ref={counterRef}>0</span>%
          </span>
        </div>
      )}
    </>
  );
}
