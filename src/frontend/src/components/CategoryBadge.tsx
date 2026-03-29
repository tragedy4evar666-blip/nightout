import { Badge } from "@/components/ui/badge";
import { EventCategory } from "../backend.d";

const categoryConfig: Record<
  EventCategory,
  { label: string; className: string }
> = {
  [EventCategory.bar]: {
    label: "Bar",
    className:
      "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
  },
  [EventCategory.concert]: {
    label: "Concert",
    className:
      "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
  },
  [EventCategory.party]: {
    label: "Party",
    className:
      "bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30",
  },
  [EventCategory.sports]: {
    label: "Sports",
    className:
      "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
  },
  [EventCategory.dining]: {
    label: "Dining",
    className:
      "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30",
  },
  [EventCategory.other]: {
    label: "Other",
    className:
      "bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30",
  },
};

interface CategoryBadgeProps {
  category: EventCategory;
  className?: string;
}

export default function CategoryBadge({
  category,
  className = "",
}: CategoryBadgeProps) {
  const config =
    categoryConfig[category] ?? categoryConfig[EventCategory.other];
  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className} text-xs font-semibold uppercase tracking-wide`}
    >
      {config.label}
    </Badge>
  );
}

export { categoryConfig };
