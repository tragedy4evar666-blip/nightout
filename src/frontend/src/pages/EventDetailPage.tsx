import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  MapPin,
  UserMinus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import CategoryBadge from "../components/CategoryBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllEvents,
  useEventAttendees,
  useRsvpEvent,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

export default function EventDetailPage() {
  const { id } = useParams({ from: "/event/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: events = [], isLoading: eventsLoading } = useAllEvents();
  const event = events.find((e) => e.id.toString() === id);
  const { data: attendees = [], isLoading: attendeesLoading } =
    useEventAttendees(event?.id);

  const rsvpMutation = useRsvpEvent();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isJoined = attendees.some(
    (a) => a.toString() === identity?.getPrincipal().toString(),
  );

  const isFullyBooked = event?.maxAttendees
    ? attendees.length >= Number(event.maxAttendees)
    : false;

  const handleRsvp = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to join events");
      return;
    }
    if (!event) return;
    setIsSubmitting(true);
    try {
      await rsvpMutation.mutateAsync({ id: event.id, join: !isJoined });
      toast.success(
        isJoined ? "You've left the event" : "You're in! See you there 🎉",
      );
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eventsLoading) {
    return (
      <main
        className="container mx-auto px-4 py-8"
        data-ocid="event_detail.loading_state"
      >
        <Skeleton className="h-8 w-32 bg-secondary mb-6" />
        <Skeleton className="h-64 w-full bg-secondary rounded-2xl mb-6" />
        <Skeleton className="h-40 w-full bg-secondary rounded-xl" />
      </main>
    );
  }

  if (!event) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="event_detail.error_state"
      >
        <h2 className="font-display text-2xl font-bold mb-4">
          Event not found
        </h2>
        <Button
          onClick={() => navigate({ to: "/" })}
          data-ocid="event_detail.button"
        >
          Go Home
        </Button>
      </main>
    );
  }

  const eventDate = new Date(Number(event.timestamp));

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/" })}
          className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
          data-ocid="event_detail.button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          <div className="h-2 w-full bg-gradient-nightlife" />
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryBadge category={event.category} />
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      event.state === "upcoming"
                        ? "border-blue-500/30 text-blue-400"
                        : event.state === "ongoing"
                          ? "border-green-500/30 text-green-400"
                          : "border-muted text-muted-foreground"
                    }`}
                  >
                    {event.state}
                  </Badge>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-2">
                  {event.title}
                </h1>
              </div>
            </div>

            <p className="text-muted-foreground text-base mb-6 leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 glass-card rounded-xl p-3">
                <MapPin className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 glass-card rounded-xl p-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-semibold">
                    {eventDate.toLocaleDateString()}{" "}
                    {eventDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 glass-card rounded-xl p-3">
                <Users className="h-5 w-5 text-chart-4 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Attendees</p>
                  <p className="text-sm font-semibold">
                    {attendees.length}
                    {event.maxAttendees
                      ? ` / ${Number(event.maxAttendees)}`
                      : ""}{" "}
                    going
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleRsvp}
              disabled={isSubmitting || (!isJoined && isFullyBooked)}
              className={`w-full ${
                isJoined
                  ? "bg-secondary text-foreground border border-border hover:bg-destructive/20 hover:text-destructive"
                  : "bg-gradient-nightlife text-white hover:opacity-90 glow-purple"
              }`}
              data-ocid="event_detail.primary_button"
            >
              {isSubmitting ? (
                "Processing..."
              ) : isJoined ? (
                <>
                  <UserMinus className="mr-2 h-5 w-5" />
                  Leave Event
                </>
              ) : isFullyBooked ? (
                "Event is Full"
              ) : (
                <>
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Join Event
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Who's Going ({attendees.length})
          </h2>
          {attendeesLoading ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              data-ocid="attendees.loading_state"
            >
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-12 bg-secondary rounded-lg" />
              ))}
            </div>
          ) : attendees.length === 0 ? (
            <p
              className="text-muted-foreground text-sm text-center py-6"
              data-ocid="attendees.empty_state"
            >
              No attendees yet — be the first to join!
            </p>
          ) : (
            <div className="space-y-2">
              {attendees.map((principal, i) => {
                const principalStr = principal.toString();
                const truncated = `${principalStr.substring(0, 8)}...`;
                const isYou =
                  principalStr === identity?.getPrincipal().toString();
                return (
                  <div
                    key={principalStr}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50"
                    data-ocid={`attendees.item.${i + 1}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-nightlife text-white text-xs font-bold">
                        {principalStr.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-mono text-muted-foreground">
                      {truncated}
                    </span>
                    {isYou && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs border-primary/30 text-primary"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
