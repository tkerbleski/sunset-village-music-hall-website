// Section kicker: sparkle + tracked caps. Yellow on ink bands, ink-2 on fog (sparkle in sun).
import { cn } from "@/lib/utils";
import { Sparkle } from "./sparkle";

export function Eyebrow({ children, className, sparkle = true }: { children: React.ReactNode; className?: string; sparkle?: boolean }) {
  return (
    <p className={cn("eyebrow mb-3 flex items-center gap-2.5 text-ink-2 [.theme-ink_&]:text-yellow", className)}>
      {sparkle && <Sparkle size={16} className="text-sun [.theme-ink_&]:text-yellow" />}
      {children}
    </p>
  );
}
