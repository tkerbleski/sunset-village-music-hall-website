// Date block with ticket-stub notches. Fill color comes from the event category.
import { cn } from "@/lib/utils";
import { categoryFill, type EventCategory } from "./categories";

export function TicketStub({ dow, day, month, category, className }: { dow: string; day: string | number; month: string; category: EventCategory; className?: string }) {
  return (
    <div className={cn("ticket-stub flex w-[108px] flex-col items-center rounded-[12px] py-3 leading-none text-ink", categoryFill[category], className)}>
      <span className="label-sm tracking-[0.2em]">{dow}</span>
      <span className="my-1 text-[44px] font-extrabold tracking-[-0.03em]">{day}</span>
      <span className="label-sm tracking-[0.2em]">{month}</span>
    </div>
  );
}
