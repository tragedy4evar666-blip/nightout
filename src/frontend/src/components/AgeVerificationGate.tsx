import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAgeVerified, useSaveProfile } from "../hooks/useQueries";
import { useCallerProfile } from "../hooks/useQueries";

export default function AgeVerificationGate({
  children,
}: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isVerified, isLoading: verifying } = useIsAgeVerified();
  const { data: profile } = useCallerProfile();
  const saveMutation = useSaveProfile();

  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = Number.parseInt(age);
    if (!ageNum || ageNum < 18) {
      setError("You must be 18 or older to use NightOut.");
      return;
    }
    setError("");
    try {
      await saveMutation.mutateAsync({
        username: profile?.username ?? "",
        bio: profile?.bio ?? "",
        age: BigInt(ageNum),
        preferredCategories: profile?.preferredCategories ?? [],
      });
      toast.success("Age verified! Welcome to NightOut 🎉");
    } catch {
      toast.error("Verification failed. Please try again.");
    }
  };

  // Only show gate if logged in and not verified
  const showGate = isAuthenticated && !verifying && isVerified === false;

  return (
    <>
      {children}
      <AnimatePresence>
        {showGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: "oklch(0.08 0.015 30 / 0.92)",
              backdropFilter: "blur(16px)",
            }}
            data-ocid="age-gate.modal"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-card rounded-2xl p-8 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-nightlife mx-auto mb-4 flex items-center justify-center glow-purple">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-extrabold mb-2">
                  Age Verification Required
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  NightOut is a 18+ platform for discovering nightlife events.
                  Please confirm your age to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Your Age</Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      setError("");
                    }}
                    className="shimmer-interactive bg-secondary border-border text-center text-lg font-bold"
                    data-ocid="age-gate.input"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-destructive text-sm"
                      data-ocid="age-gate.error_state"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={saveMutation.isPending || !age}
                  className="shimmer-interactive w-full bg-gradient-nightlife text-white hover:opacity-90 glow-purple font-semibold"
                  data-ocid="age-gate.submit_button"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>Confirm Age &amp; Continue</>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your age is kept private and used only for verification.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
