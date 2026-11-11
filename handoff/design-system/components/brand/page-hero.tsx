// Ink band used at the top of Events, Book and Village pages: eyebrow + display headline left, lede right, wave edge.
import { Eyebrow } from "./eyebrow";
import { WaveDivider } from "./wave-divider";

export function PageHero({ eyebrow, title, lede }: { eyebrow: string; title: React.ReactNode; lede: React.ReactNode }) {
  return (
    <section className="theme-ink">
      <div className="container-site flex flex-wrap items-end justify-between gap-6 pt-10 pb-16">
        <div className="min-w-0 flex-[999_1_480px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-display-xl">{title}</h1>
        </div>
        <p className="max-w-[540px] flex-[1_1_320px] text-lede text-mist">{lede}</p>
      </div>
      <WaveDivider />
    </section>
  );
}
