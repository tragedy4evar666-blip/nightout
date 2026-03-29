import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LogIn, Plus, UserMinus, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PersistentGroupView } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllGroups,
  useCreateGroup,
  useJoinGroup,
  useLeaveGroup,
  useUserGroups,
} from "../hooks/useQueries";

export default function GroupsPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal();

  const { data: allGroups = [], isLoading } = useAllGroups();
  const { data: myGroupIds = [] } = useUserGroups(principal);
  const createMutation = useCreateGroup();
  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [pendingId, setPendingId] = useState<bigint | null>(null);

  // Since PersistentGroupView has members array, check directly
  const isMember = (group: PersistentGroupView) =>
    principal
      ? group.members.some((m) => m.toString() === principal.toString())
      : false;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (!principal) return;
    try {
      await createMutation.mutateAsync({
        name: form.name,
        description: form.description,
        members: [principal],
        creator: principal,
        createdAt: BigInt(Date.now()),
      });
      toast.success("Group created! 🎉");
      setForm({ name: "", description: "" });
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create group");
    }
  };

  const handleJoin = async (group: PersistentGroupView, index: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in first");
      return;
    }
    setPendingId(BigInt(index));
    try {
      await joinMutation.mutateAsync(BigInt(index));
      toast.success(`Joined ${group.name}!`);
    } catch {
      toast.error("Failed to join group");
    } finally {
      setPendingId(null);
    }
  };

  const handleLeave = async (group: PersistentGroupView, index: number) => {
    setPendingId(BigInt(index));
    try {
      await leaveMutation.mutateAsync(BigInt(index));
      toast.success(`Left ${group.name}`);
    } catch {
      toast.error("Failed to leave group");
    } finally {
      setPendingId(null);
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
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">
              Join the Community
            </h2>
            <p className="text-muted-foreground mb-6">
              Log in to discover groups, connect with fellow night owls, and
              create your own crews.
            </p>
            <Button
              size="lg"
              className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple w-full"
              onClick={login}
              data-ocid="groups.primary_button"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Log In
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  const GroupCard = ({
    group,
    index,
  }: { group: PersistentGroupView; index: number }) => {
    const member = isMember(group);
    const isPending = pendingId === BigInt(index);
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card rounded-xl p-5 flex flex-col gap-3"
        data-ocid={`groups.item.${index + 1}`}
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-nightlife flex items-center justify-center shrink-0 glow-purple">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base truncate">
              {group.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {group.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {group.members.length}{" "}
            {group.members.length === 1 ? "member" : "members"}
          </span>
          {member ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleLeave(group, index)}
              className="shimmer-interactive border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
              data-ocid={`groups.delete_button.${index + 1}`}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UserMinus className="h-3 w-3 mr-1" />
              )}
              Leave
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handleJoin(group, index)}
              className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 text-xs"
              data-ocid={`groups.secondary_button.${index + 1}`}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UserPlus className="h-3 w-3 mr-1" />
              )}
              Join
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const memberGroups = allGroups.filter((g) => isMember(g));

  // suppress unused warning — myGroupIds used for useUserGroups hook
  void myGroupIds;

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gradient-nightlife">
            Groups
          </h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple"
                data-ocid="groups.open_modal_button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent
              className="glass-card border-border"
              data-ocid="groups.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Create a New Group
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Group Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Friday Night Crew"
                    className="shimmer-interactive bg-secondary border-border"
                    data-ocid="groups.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="What's this group about?"
                    className="shimmer-interactive bg-secondary border-border resize-none"
                    rows={3}
                    data-ocid="groups.textarea"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="shimmer-interactive border-border"
                    data-ocid="groups.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90"
                    data-ocid="groups.submit_button"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Group"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="discover">
          <TabsList className="bg-secondary border border-border mb-6 w-full">
            <TabsTrigger
              value="discover"
              className="flex-1"
              data-ocid="groups.tab"
            >
              Discover Groups
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1" data-ocid="groups.tab">
              My Groups ({memberGroups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-ocid="groups.loading_state"
              >
                {[1, 2, 3, 4].map((k) => (
                  <Skeleton key={k} className="h-32 rounded-xl bg-secondary" />
                ))}
              </div>
            ) : allGroups.length === 0 ? (
              <div
                className="glass-card rounded-xl p-12 text-center"
                data-ocid="groups.empty_state"
              >
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No groups yet — be the first to create one!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allGroups.map((group, i) => (
                  <GroupCard
                    key={`${group.name}-${i}`}
                    group={group}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine">
            {memberGroups.length === 0 ? (
              <div
                className="glass-card rounded-xl p-12 text-center"
                data-ocid="mygroups.empty_state"
              >
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  You haven't joined any groups yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberGroups.map((group, i) => (
                  <GroupCard
                    key={`my-${group.name}-${i}`}
                    group={group}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
