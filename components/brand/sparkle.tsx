// The four-point "atomic" star from the wordmark. The site's only decorative motif.
// Uses currentColor. `simple` drops the small diagonal points (for <14px or busy contexts).
import { cn } from "@/lib/utils";

export function Sparkle({ size = 16, simple = false, className }: { size?: number; simple?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" fill="currentColor" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d="M0 -12 L1.7 -1.7 L12 0 L1.7 1.7 L0 12 L-1.7 1.7 L-12 0 L-1.7 -1.7Z" />
      {!simple && <path d="M0 -6 L1 -1 L6 0 L1 1 L0 6 L-1 1 L-6 0 L-1 -1Z" transform="rotate(45)" />}
    </svg>
  );
}
