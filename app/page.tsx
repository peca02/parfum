import { ScrollVideo } from "@/components/ScrollVideo";

export default function HomePage() {
  return (
    <main>
      <ScrollVideo
        src="/videos/cinematic-video-crf23.mp4"
        poster="/videos/cinematic-video-poster.jpg"
      />
      {/* Temporary spacer that provides scroll length until real content is added. */}
      <div className="h-[500vh]" aria-hidden="true" />
    </main>
  );
}
