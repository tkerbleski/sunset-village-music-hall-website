// Sunset Village Music Hall wordmark. Put the SVGs from assets/brand/ in /public/brand/.
// on-dark: fog script, sun star + MUSIC HALL  → header, footer, any ink ground.
// on-light: sun script with ink outline, ink star + MUSIC HALL → fog/paper grounds.
// mono: single color via currentColor (inline it with SVGR if you need that; as <img> it renders black).
// Never use the original gradient version. Never recolor outside these variants. Min height 40px.
import Image from "next/image";
import { cn } from "@/lib/utils";

const SRC = { "on-dark": "/brand/wordmark-on-dark.svg", "on-light": "/brand/wordmark-on-light.svg", mono: "/brand/wordmark-mono.svg" } as const;
const RATIO = 1606 / 695;

export function Wordmark({ variant = "on-dark", height = 76, className, priority }: { variant?: keyof typeof SRC; height?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src={SRC[variant]}
      alt="Sunset Village Music Hall"
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      className={cn("block h-auto max-w-full", className)}
      style={{ height }}
    />
  );
}
