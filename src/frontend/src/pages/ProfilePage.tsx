import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Edit2,
  Loader2,
  LogIn,
  Save,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EventCard from "../components/EventCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  EventCategory,
  useCallerProfile,
  useEventsAttending,
  useEventsCreated,
  useSaveProfile,
} from "../hooks/useQueries";

const ALL_CATEGORIES: EventCategory[] = [
  EventCategory.party,
  EventCategory.bar,
  EventCategory.concert,
  EventCategory.sports,
  EventCategory.dining,
  EventCategory.other,
];

const CATEGORY_LABELS: Record<EventCategory, string> = {
  [EventCategory.party]: "🎉 Party",
  [EventCategory.bar]: "🍺 Bar",
  [EventCategory.concert]: "🎵 Concert",
  [EventCategory.sports]: "⚽ Sports",
  [EventCategory.dining]: "🍽️ Dining",
  [EventCategory.other]: "✨ Other",
};

export default function ProfilePage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal();

  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: createdEvents = [] } = useEventsCreated(principal);
  const { data: attendingEvents = [] } = useEventsAttending(principal);
  const saveMutation = useSaveProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    age: "",
    preferredCategories: [] as EventCategory[],
  });

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username,
        bio: profile.bio,
        age: Number(profile.age).toString(),
        preferredCategories: profile.preferredCategories,
      });
    }
  }, [profile]);

  const toggleCategory = (cat: EventCategory) => {
    setForm((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(cat)
        ? prev.preferredCategories.filter((c) => c !== cat)
        : [...prev.preferredCategories, cat],
    }));
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        username: form.username,
        bio: form.bio,
        age: BigInt(Number.parseInt(form.age) || 0),
        preferredCategories: form.preferredCategories,
      });
      toast.success("Profile saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-20 max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="glass-card rounded-2xl p-10">
            <div className="h-16 w-16 rounded-full bg-gradient-nightlife mx-auto mb-5 flex items-center justify-center glow-purple">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">
              Your Profile
            </h2>
            <p className="text-muted-foreground mb-6">
              Log in to view and edit your profile, track events you're
              attending, and more.
            </p>
            <Button
              size="lg"
              className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple w-full"
              onClick={login}
              data-ocid="profile.primary_button"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Log In
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  const principalStr = principal?.toString() ?? "";
  const isNewUser = !profile;

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gradient-nightlife mb-8">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8">
          <div className="h-2 bg-gradient-nightlife" />
          <div className="p-6">
            {profileLoading ? (
              <div className="space-y-4" data-ocid="profile.loading_state">
                <Skeleton className="h-16 w-16 rounded-full bg-secondary" />
                <Skeleton className="h-6 w-40 bg-secondary" />
                <Skeleton className="h-4 w-64 bg-secondary" />
              </div>
            ) : (
              <>
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/30">
                      <AvatarFallback className="bg-gradient-nightlife text-white text-xl font-bold">
                        {(form.username || "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-display text-xl font-bold">
                        {form.username ||
                          (isNewUser ? "New User" : "Anonymous")}
                      </h2>
                      <p className="text-xs text-muted-foreground font-mono">
                        {principalStr.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="shimmer-interactive border-border hover:border-primary/50"
                      data-ocid="profile.edit_button"
                    >
                      <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                      {isNewUser ? "Set Up Profile" : "Edit"}
                    </Button>
                  )}
                </div>

                {/* Edit Form or Display */}
                {isEditing || isNewUser ? (
                  <div className="space-y-4" data-ocid="profile.modal">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">
                          Username *
                        </Label>
                        <Input
                          value={form.username}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, username: e.target.value }))
                          }
                          placeholder="Your display name"
                          className="shimmer-interactive bg-secondary border-border"
                          data-ocid="profile.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Age</Label>
                        <Input
                          type="number"
                          min={18}
                          value={form.age}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, age: e.target.value }))
                          }
                          placeholder="Age"
                          className="shimmer-interactive bg-secondary border-border"
                          data-ocid="profile.input"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Bio</Label>
                      <Textarea
                        value={form.bio}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, bio: e.target.value }))
                        }
                        placeholder="Tell people about yourself..."
                        className="shimmer-interactive bg-secondary border-border resize-none"
                        rows={3}
                        data-ocid="profile.textarea"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Preferred Categories
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_CATEGORIES.map((cat) => {
                          const active = form.preferredCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className={`shimmer-interactive rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                                active
                                  ? "bg-gradient-nightlife text-white border-transparent glow-purple"
                                  : "border-border text-muted-foreground hover:border-primary/50"
                              }`}
                              data-ocid="profile.toggle"
                            >
                              {CATEGORY_LABELS[cat]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple"
                        data-ocid="profile.save_button"
                      >
                        {saveMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Profile
                          </>
                        )}
                      </Button>
                      {!isNewUser && (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="shimmer-interactive border-border"
                          data-ocid="profile.cancel_button"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.bio && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {form.bio}
                      </p>
                    )}
                    {form.age && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Age:</span>{" "}
                        {form.age}
                      </p>
                    )}
                    {form.preferredCategories.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" /> Preferred
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {form.preferredCategories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className="border-primary/30 text-primary text-xs"
                            >
                              {CATEGORY_LABELS[cat]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Events Sections */}
        <div className="space-y-8">
          {/* Attending */}
          <section>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Events I'm Attending ({attendingEvents.length})
            </h2>
            {attendingEvents.length === 0 ? (
              <div
                className="glass-card rounded-xl p-8 text-center"
                data-ocid="attending.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  No events yet — go join something!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attendingEvents.map((event, i) => (
                  <EventCard
                    key={event.id.toString()}
                    event={event}
                    index={i}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Created */}
          <section>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Events I've Created ({createdEvents.length})
            </h2>
            {createdEvents.length === 0 ? (
              <div
                className="glass-card rounded-xl p-8 text-center"
                data-ocid="created.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  You haven't created any events yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {createdEvents.map((event, i) => (
                  <EventCard
                    key={event.id.toString()}
                    event={event}
                    index={i}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </main>
  );
}
