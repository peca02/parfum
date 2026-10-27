import { ScrollCopy } from "@/components/ScrollCopy";
import { ScrollHint } from "@/components/ScrollHint";
import { ScrollVideo } from "@/components/ScrollVideo";

export default function HomePage() {
  return (
    <main>
      <h1 className="sr-only">Éluvéa Eau de Parfum</h1>
      <ScrollVideo
        src="/videos/cinematic-video-crf23.mp4"
        poster="/videos/cinematic-video-poster.jpg"
      />
      <ScrollCopy />
      <ScrollHint />
      {/* Temporary spacer that provides scroll length until real content is added. */}
      <div className="h-[750vh]" aria-hidden="true" />
    </main>
  );
}
