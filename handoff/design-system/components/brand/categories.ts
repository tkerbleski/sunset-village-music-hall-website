// Event categories → fill color. Text on these fills is always ink.
export type EventCategory = "music" | "dj" | "community" | "workshop";

export const categoryLabel: Record<EventCategory, string> = {
  music: "Live music",
  dj: "DJ nights",
  community: "Community",
  workshop: "Workshops",
};

export const categoryFill: Record<EventCategory, string> = {
  music: "bg-sun",
  dj: "bg-yellow",
  community: "bg-teal",
  workshop: "bg-pink",
};
