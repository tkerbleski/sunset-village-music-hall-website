// Wavy bottom edge for ink bands (ink → fog page). Place as the last child of an ink section.
// Paints fog behind the ink wave, so it must sit directly above fog content.
import { cn } from "@/lib/utils";

const D = "M0 0 H1440 V14 q-45 26 -90 0 " + "t-90 0 ".repeat(15) + "Z";

export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true" className={cn("block h-10 w-full bg-fog text-ink", className)}>
      <path d={D} fill="currentColor" />
    </svg>
  );
}
