import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import type { EventView } from "../backend.d";
import CategoryBadge from "./CategoryBadge";

interface EventCardProps {
  event: EventView;
  index?: number;
  onJoin?: (id: bigint) => void;
  isJoined?: boolean;
  isLoading?: boolean;
}

export default function EventCard({
  event,
  index = 0,
  onJoin,
  isJoined,
  isLoading,
}: EventCardProps) {
  const navigate = useNavigate();
  const eventDate = new Date(Number(event.timestamp));
  const isFullyBooked = event.maxAttendees
    ? event.attendees.length >= Number(event.maxAttendees)
    : false;

  const goToDetail = () => {
    navigate({ to: "/event/$id", params: { id: event.id.toString() } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      data-ocid={`events.item.${index + 1}`}
    >
      <Card className="glass-card border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
        <CardContent className="p-0">
          <div className="h-1 w-full bg-gradient-nightlife" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryBadge category={event.category} />
                  {event.state === "ongoing" && (
                    <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground leading-tight truncate">
                  {event.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {event.description}
            </p>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  {eventDate.toLocaleDateString()} at{" "}
                  {eventDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                <span>
                  {event.attendees.length} going
                  {event.maxAttendees
                    ? ` / ${Number(event.maxAttendees)} max`
                    : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onJoin && (
                <Button
                  size="sm"
                  onClick={() => onJoin(event.id)}
                  disabled={isLoading || (isFullyBooked && !isJoined)}
                  className={`shimmer-interactive flex-1 ${
                    isJoined
                      ? "bg-secondary text-foreground hover:bg-destructive/20 hover:text-destructive border border-border"
                      : "bg-gradient-nightlife text-white hover:opacity-90"
                  }`}
                  variant={isJoined ? "outline" : "default"}
                  data-ocid={`events.primary_button.${index + 1}`}
                >
                  {isLoading
                    ? "..."
                    : isJoined
                      ? "Leave"
                      : isFullyBooked
                        ? "Full"
                        : "Join"}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={goToDetail}
                className="shimmer-interactive text-muted-foreground hover:text-foreground"
                data-ocid={`events.secondary_button.${index + 1}`}
              >
                Details
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
