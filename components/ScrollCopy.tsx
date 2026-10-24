import { ScrollReveal } from "@/components/ScrollReveal";

const displayStyles = "w-min text-display font-black tracking-tight";

export function ScrollCopy() {
  return (
    // All blocks share one grid cell, so each one sits vertically centered over the video.
    <div className="fixed inset-0 z-10 grid items-center px-[6vw] text-copy uppercase">
      <ScrollReveal
        from="left"
        enter={[0.05, 0.16]}
        exit={[0.2, 0.3]}
        className="col-start-1 row-start-1 justify-self-start"
      >
        {/* w-min puts every word on its own line. */}
        <h2 className={displayStyles}>Pure rare yours</h2>
      </ScrollReveal>

      <ScrollReveal
        from="right"
        enter={[0.35, 0.475]}
        exit={[0.525, 0.65]}
        className="col-start-1 row-start-1 justify-self-end text-right"
      >
        <h2 className={displayStyles}>Made to linger</h2>
      </ScrollReveal>

      <ScrollReveal
        from="left"
        enter={[0.8, 0.95]}
        className="col-start-1 row-start-1 max-w-2/5 justify-self-start"
      >
        <h2 className="text-display-sm font-black tracking-tight">
          Quietly bold
        </h2>
        <p className="mt-[0.5em] text-lead font-bold">
          A scent that stays long after you leave.
        </p>
      </ScrollReveal>
    </div>
  );
}
