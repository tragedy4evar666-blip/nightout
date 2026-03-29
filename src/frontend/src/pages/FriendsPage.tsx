import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  Loader2,
  LogIn,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptFriendRequest,
  useAllUserProfiles,
  useFriendRequests,
  useFriends,
  useRejectFriendRequest,
  useRemoveFriend,
} from "../hooks/useQueries";

function abbrev(p: Principal) {
  const s = p.toString();
  return `${s.slice(0, 5)}...${s.slice(-4)}`;
}

export default function FriendsPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: requests = [], isLoading: requestsLoading } =
    useFriendRequests();
  const { data: profiles = [], isLoading: profilesLoading } =
    useAllUserProfiles();

  const removeMutation = useRemoveFriend();
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();

  const [pendingPrincipal, setPendingPrincipal] = useState<string | null>(null);

  const handleRemove = async (friend: Principal) => {
    setPendingPrincipal(friend.toString());
    try {
      await removeMutation.mutateAsync(friend);
      toast.success("Friend removed");
    } catch {
      toast.error("Failed to remove friend");
    } finally {
      setPendingPrincipal(null);
    }
  };

  const handleAccept = async (from: Principal) => {
    setPendingPrincipal(from.toString());
    try {
      await acceptMutation.mutateAsync(from);
      toast.success("Friend request accepted! 🎉");
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setPendingPrincipal(null);
    }
  };

  const handleReject = async (from: Principal) => {
    setPendingPrincipal(from.toString());
    try {
      await rejectMutation.mutateAsync(from);
      toast.success("Request declined");
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setPendingPrincipal(null);
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
              Find Friends
            </h2>
            <p className="text-muted-foreground mb-6">
              Log in to connect with people who share your nightlife vibe.
            </p>
            <Button
              size="lg"
              className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple w-full"
              onClick={login}
              data-ocid="friends.primary_button"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Log In
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gradient-nightlife mb-8">
          Friends
        </h1>

        <Tabs defaultValue="friends">
          <TabsList className="bg-secondary border border-border mb-6 w-full">
            <TabsTrigger
              value="friends"
              className="flex-1"
              data-ocid="friends.tab"
            >
              My Friends{" "}
              {friends.length > 0 && (
                <Badge className="ml-1.5 bg-primary/20 text-primary text-xs border-none">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="flex-1"
              data-ocid="friends.tab"
            >
              Requests{" "}
              {requests.length > 0 && (
                <Badge className="ml-1.5 bg-accent/20 text-accent text-xs border-none">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="find"
              className="flex-1"
              data-ocid="friends.tab"
            >
              Find People
            </TabsTrigger>
          </TabsList>

          {/* My Friends */}
          <TabsContent value="friends">
            {friendsLoading ? (
              <div className="space-y-3" data-ocid="friends.loading_state">
                {[1, 2, 3].map((k) => (
                  <Skeleton key={k} className="h-16 rounded-xl bg-secondary" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <div
                className="glass-card rounded-xl p-12 text-center"
                data-ocid="friends.empty_state"
              >
                <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No friends yet — go find some!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend, i) => {
                  const isPending = pendingPrincipal === friend.toString();
                  return (
                    <motion.div
                      key={friend.toString()}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-xl p-4 flex items-center gap-4"
                      data-ocid={`friends.item.${i + 1}`}
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                        <AvatarFallback className="bg-gradient-nightlife text-white text-sm font-bold">
                          {friend.toString().slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {abbrev(friend)}
                        </p>
                        <p className="text-xs text-muted-foreground">Friend</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleRemove(friend)}
                        className="shimmer-interactive border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
                        data-ocid={`friends.delete_button.${i + 1}`}
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserMinus className="h-3 w-3 mr-1" />
                        )}
                        Remove
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Requests */}
          <TabsContent value="requests">
            {requestsLoading ? (
              <div className="space-y-3" data-ocid="requests.loading_state">
                {[1, 2].map((k) => (
                  <Skeleton key={k} className="h-16 rounded-xl bg-secondary" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div
                className="glass-card rounded-xl p-12 text-center"
                data-ocid="requests.empty_state"
              >
                <Check className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No pending friend requests.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req, i) => {
                  const isPending = pendingPrincipal === req.toString();
                  return (
                    <motion.div
                      key={req.toString()}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-xl p-4 flex items-center gap-4"
                      data-ocid={`requests.item.${i + 1}`}
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-accent/30">
                        <AvatarFallback className="bg-secondary text-foreground text-sm font-bold">
                          {req.toString().slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {abbrev(req)}
                        </p>
                        <p className="text-xs text-accent">
                          Wants to be friends
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleAccept(req)}
                          className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 text-xs"
                          data-ocid={`requests.confirm_button.${i + 1}`}
                        >
                          {isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleReject(req)}
                          className="shimmer-interactive border-border text-muted-foreground text-xs"
                          data-ocid={`requests.cancel_button.${i + 1}`}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Find People */}
          <TabsContent value="find">
            {profilesLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-ocid="find.loading_state"
              >
                {[1, 2, 3, 4].map((k) => (
                  <Skeleton key={k} className="h-28 rounded-xl bg-secondary" />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div
                className="glass-card rounded-xl p-12 text-center"
                data-ocid="find.empty_state"
              >
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No users found yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map((profile, i) => (
                  <motion.div
                    key={`${profile.username}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl p-4"
                    data-ocid={`find.item.${i + 1}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-nightlife text-white text-sm font-bold">
                          {(profile.username || "?").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {profile.username || "Anonymous"}
                        </p>
                        {profile.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {profile.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    {profile.preferredCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.preferredCategories.slice(0, 3).map((cat) => (
                          <Badge
                            key={cat}
                            variant="outline"
                            className="text-xs border-primary/30 text-primary"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
