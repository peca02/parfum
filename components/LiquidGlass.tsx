"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";

// The largest displacement is half of this value, in px, at the outer edge.
const DISPLACEMENT_SCALE = 70;
// Width of the curved rim, relative to the corner radius.
const BEZEL_TO_RADIUS = 0.9;

type DisplacementMap = {
  url: string;
  width: number;
  height: number;
};

type LiquidGlassProps = {
  children: ReactNode;
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
};

// Only Chromium renders SVG filters in backdrop-filter, and only Chromium has userAgentData.
const subscribe = () => () => {};
const getIsRefractionSupported = () => "userAgentData" in navigator;
const getServerIsRefractionSupported = () => false;

// Encodes a convex lens rim: each pixel points inward along the edge normal,
// strongest at the edge and fading to no displacement past the rim.
function createDisplacementMap(width: number, height: number, radius: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(width, height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const cornerRadius = Math.min(radius, halfWidth, halfHeight);
  const bezel = cornerRadius * BEZEL_TO_RADIUS;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - halfWidth;
      const py = y + 0.5 - halfHeight;
      const qx = Math.abs(px) - (halfWidth - cornerRadius);
      const qy = Math.abs(py) - (halfHeight - cornerRadius);

      let distanceToEdge: number;
      let normalX = 0;
      let normalY = 0;
      if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy);
        distanceToEdge = cornerRadius - length;
        normalX = (qx / length) * Math.sign(px);
        normalY = (qy / length) * Math.sign(py);
      } else if (qx > qy) {
        distanceToEdge = cornerRadius - qx;
        normalX = Math.sign(px);
      } else {
        distanceToEdge = cornerRadius - qy;
        normalY = Math.sign(py);
      }

      const progress = Math.min(Math.max(distanceToEdge / bezel, 0), 1);
      const strength = (1 - progress) ** 2;
      const index = (y * width + x) * 4;
      image.data[index] = 128 - normalX * strength * 127;
      image.data[index + 1] = 128 - normalY * strength * 127;
      image.data[index + 2] = 128;
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

export function LiquidGlass({
  children,
  className = "",
  ref,
}: LiquidGlassProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const glassRef = ref ?? internalRef;
  const filterId = useId();
  const [displacementMap, setDisplacementMap] =
    useState<DisplacementMap | null>(null);
  const isRefractionSupported = useSyncExternalStore(
    subscribe,
    getIsRefractionSupported,
    getServerIsRefractionSupported,
  );

  useEffect(() => {
    const element = glassRef.current;
    if (!isRefractionSupported || !element) return;

    // The map has to match the element's exact size and radius, so it is rebuilt on resize.
    const resizeObserver = new ResizeObserver(() => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius);
      const url = createDisplacementMap(width, height, radius);
      setDisplacementMap(url ? { url, width, height } : null);
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [isRefractionSupported, glassRef]);

  // The blur stays until the map is ready, because a filter that isn't rendered yet hides the backdrop.
  const isRefracting = isRefractionSupported && displacementMap !== null;

  return (
    <>
      {isRefracting && (
        <svg aria-hidden="true" className="absolute size-0">
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="1"
              result="blurred"
            />
            <feImage
              href={displacementMap.url}
              x="0"
              y="0"
              width={displacementMap.width}
              height={displacementMap.height}
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="blurred"
              in2="map"
              scale={DISPLACEMENT_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feColorMatrix type="saturate" values="1.5" />
          </filter>
        </svg>
      )}
      <div
        ref={glassRef}
        className={`bg-glass-tint shadow-glass ${
          isRefracting ? "" : "backdrop-blur-xl backdrop-saturate-150"
        } ${className}`}
        // Chromium drops the refraction when url() is chained with other filter functions,
        // so saturation is applied inside the SVG filter instead.
        style={isRefracting ? { backdropFilter: `url(#${filterId})` } : undefined}
      >
        {children}
      </div>
    </>
  );
}
