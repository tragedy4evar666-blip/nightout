import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EventState } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { EventCategory, useCreateEvent } from "../hooks/useQueries";

const CATEGORY_OPTIONS = [
  { value: EventCategory.party, label: "🎉 Party" },
  { value: EventCategory.bar, label: "🍺 Bar" },
  { value: EventCategory.concert, label: "🎵 Concert" },
  { value: EventCategory.sports, label: "⚽ Sports" },
  { value: EventCategory.dining, label: "🍽️ Dining" },
  { value: EventCategory.other, label: "✨ Other" },
];

export default function CreateEventPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();
  const createMutation = useCreateEvent();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: EventCategory.party as EventCategory,
    location: "",
    date: "",
    time: "",
    maxAttendees: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    if (form.maxAttendees && Number(form.maxAttendees) < 1)
      e.maxAttendees = "Must be at least 1";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !identity) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const dateTime = new Date(`${form.date}T${form.time}`);
    const timestamp = BigInt(dateTime.getTime());

    try {
      await createMutation.mutateAsync({
        id: 0n,
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        timestamp,
        createdAt: BigInt(Date.now()),
        attendees: [],
        state: EventState.upcoming,
        creator: identity.getPrincipal(),
        maxAttendees: form.maxAttendees
          ? BigInt(Number.parseInt(form.maxAttendees))
          : undefined,
      });
      toast.success("Event created! 🎉");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to create event. Please try again.");
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
              <PlusCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">
              Create an Event
            </h2>
            <p className="text-muted-foreground mb-6">
              Log in to create events and invite people to join your night out.
            </p>
            <Button
              size="lg"
              className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple w-full"
              onClick={login}
              data-ocid="create.primary_button"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Log In to Continue
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gradient-nightlife mb-2">
            Create Event
          </h1>
          <p className="text-muted-foreground">
            Set up your night out and invite others to join
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          data-ocid="create.modal"
        >
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-semibold">
                Event Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g. Saturday Rooftop Bash"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="shimmer-interactive bg-secondary border-border"
                data-ocid="create.input"
              />
              {errors.title && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="create.error_state"
                >
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="What's the vibe? Describe your event..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="shimmer-interactive bg-secondary border-border min-h-[100px] resize-none"
                data-ocid="create.textarea"
              />
              {errors.description && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="create.error_state"
                >
                  {errors.description}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as EventCategory }))
                }
              >
                <SelectTrigger
                  className="shimmer-interactive bg-secondary border-border"
                  data-ocid="create.select"
                >
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-sm font-semibold">
                Location *
              </Label>
              <Input
                id="location"
                placeholder="e.g. The Rooftop Bar, 123 Main St"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                className="shimmer-interactive bg-secondary border-border"
                data-ocid="create.input"
              />
              {errors.location && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="create.error_state"
                >
                  {errors.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-sm font-semibold">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="shimmer-interactive bg-secondary border-border"
                  data-ocid="create.input"
                />
                {errors.date && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="create.error_state"
                  >
                    {errors.date}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-sm font-semibold">
                  Time *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                  className="shimmer-interactive bg-secondary border-border"
                  data-ocid="create.input"
                />
                {errors.time && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="create.error_state"
                  >
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxAttendees" className="text-sm font-semibold">
                Max Attendees{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="maxAttendees"
                type="number"
                min={1}
                placeholder="Leave empty for unlimited"
                value={form.maxAttendees}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxAttendees: e.target.value }))
                }
                className="shimmer-interactive bg-secondary border-border"
                data-ocid="create.input"
              />
              {errors.maxAttendees && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="create.error_state"
                >
                  {errors.maxAttendees}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={createMutation.isPending}
            className="shimmer-interactive w-full bg-gradient-nightlife text-white hover:opacity-90 glow-purple font-semibold text-base"
            data-ocid="create.submit_button"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Event
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
