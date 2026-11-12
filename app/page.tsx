import { BuySection } from "@/components/BuySection";
import { CheckoutForm } from "@/components/CheckoutForm";
import { Loader } from "@/components/Loader";
import { LoaderProvider } from "@/components/LoaderProvider";
import { Navigation } from "@/components/Navigation";
import { ScrollCopy } from "@/components/ScrollCopy";
import { ScrollHint } from "@/components/ScrollHint";
import { ScrollVideo } from "@/components/ScrollVideo";

export default function HomePage() {
  return (
    <LoaderProvider>
      <Navigation />
      <main>
        <h1 className="sr-only">Éluvéa Eau de Parfum</h1>
        <BuySection
          screenshot={
            <>
              <ScrollVideo
                src="/videos/cinematic-video-crf23.mp4"
                poster="/videos/cinematic-video-poster.jpg"
              />
              <ScrollCopy />
            </>
          }
        >
          <CheckoutForm />
        </BuySection>
        <ScrollHint />
        {/* Scroll length of the video. */}
        <div className="h-[750vh]" aria-hidden="true" />
        {/* Scroll length of the buy section, which has to match BUY_SCROLL_START in lib/scrollSections.ts. */}
        <div className="h-[200vh]" aria-hidden="true" />
      </main>
      <Loader />
    </LoaderProvider>
  );
}
