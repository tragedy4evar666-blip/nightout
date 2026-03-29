import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import EventCard from "../components/EventCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  EventCategory,
  useEventsByCategory,
  useRsvpEvent,
} from "../hooks/useQueries";

const CATEGORIES: { value: EventCategory | null; label: string }[] = [
  { value: null, label: "All" },
  { value: EventCategory.party, label: "Party" },
  { value: EventCategory.bar, label: "Bar" },
  { value: EventCategory.concert, label: "Concert" },
  { value: EventCategory.sports, label: "Sports" },
  { value: EventCategory.dining, label: "Dining" },
  { value: EventCategory.other, label: "Other" },
];

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: events = [], isLoading } =
    useEventsByCategory(selectedCategory);
  const rsvpMutation = useRsvpEvent();
  const [loadingId, setLoadingId] = useState<bigint | null>(null);

  const filteredEvents = events.filter((e) =>
    searchQuery
      ? e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  const handleJoin = async (id: bigint) => {
    if (!isAuthenticated) {
      toast.error("Please log in to join events");
      return;
    }
    const event = events.find((e) => e.id === id);
    const isJoined = event?.attendees.some(
      (a) => a.toString() === identity?.getPrincipal().toString(),
    );
    setLoadingId(id);
    try {
      await rsvpMutation.mutateAsync({ id, join: !isJoined });
      toast.success(isJoined ? "Left the event" : "You're going! 🎉");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-nightout.dim_1600x600.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-bg" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-widest">
                Find Your Night
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-none mb-4">
              <span className="text-foreground">Where the</span>{" "}
              <span className="text-gradient-nightlife">Night</span>
              <br />
              <span className="text-foreground">Comes Alive</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Discover bars, concerts, parties, and more happening near you.
              Connect with people who share your vibe.
            </p>
            <Button
              size="lg"
              className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple font-semibold"
              onClick={() =>
                document
                  .getElementById("events-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-ocid="home.primary_button"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="events-section" className="container mx-auto px-4 py-10">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events or locations..."
              className="shimmer-interactive pl-9 bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-ocid="home.search_input"
            />
          </div>
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            data-ocid="home.tab"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`shimmer-interactive shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all border ${
                  selectedCategory === cat.value
                    ? "bg-gradient-nightlife text-white border-transparent glow-purple"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
                data-ocid="home.tab"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="events.loading_state"
          >
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-64 rounded-xl bg-secondary" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="events.empty_state"
          >
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              No events found
            </h3>
            <p className="text-muted-foreground">
              Try a different category or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event, i) => (
              <EventCard
                key={event.id.toString()}
                event={event}
                index={i}
                onJoin={handleJoin}
                isJoined={event.attendees.some(
                  (a) => a.toString() === identity?.getPrincipal().toString(),
                )}
                isLoading={loadingId === event.id}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
