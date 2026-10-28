import { ScrollCta } from "@/components/ScrollCta";
import { ScrollReveal } from "@/components/ScrollReveal";
import { scrollSections } from "@/lib/scrollSections";

const displayStyles = "w-min text-display font-black tracking-tight";

export function ScrollCopy() {
  return (
    // All blocks share one grid cell, so each one sits vertically centered over the video.
    <div className="fixed inset-0 z-10 grid items-center px-[6vw] text-copy uppercase">
      <ScrollReveal
        from="left"
        {...scrollSections.essence}
        className="col-start-1 row-start-1 justify-self-start"
      >
        {/* w-min puts every word on its own line. */}
        <h2 className={displayStyles}>Pure rare yours</h2>
      </ScrollReveal>

      <ScrollReveal
        from="right"
        {...scrollSections.linger}
        className="col-start-1 row-start-1 justify-self-end text-right"
      >
        <h2 className={displayStyles}>Made to linger</h2>
      </ScrollReveal>

      <ScrollReveal
        from="left"
        {...scrollSections.presence}
        className="col-start-1 row-start-1 max-w-2/5 justify-self-start"
      >
        <h2 className="text-display-sm font-black tracking-tight">
          Quietly bold
        </h2>
        <p className="mt-[0.5em] text-lead font-bold text-copy-muted">
          A scent that stays long after you leave.
        </p>
        <ScrollCta
          price="€120"
          label="Shop the scent"
          href="#buy"
          enter={scrollSections.cta.enter}
        />
      </ScrollReveal>
    </div>
  );
}
