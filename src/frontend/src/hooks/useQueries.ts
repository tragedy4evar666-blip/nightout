import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EventCategory,
  type EventView,
  type PersistentGroupView,
  type UserProfileView,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUpcomingEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<EventView[]>({
    queryKey: ["upcomingEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<EventView[]>({
    queryKey: ["allEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEventsByCategory(category: EventCategory | null) {
  const { actor, isFetching } = useActor();
  return useQuery<EventView[]>({
    queryKey: ["eventsByCategory", category],
    queryFn: async () => {
      if (!actor) return [];
      if (!category) return actor.getUpcomingEvents();
      return actor.getEventsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileView | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileView | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useEventsCreated(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<EventView[]>({
    queryKey: ["eventsCreated", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getEventsCreated(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useEventsAttending(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<EventView[]>({
    queryKey: ["eventsAttending", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getEventsAttending(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useEventAttendees(eventId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["eventAttendees", eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === undefined) return [];
      return actor.getEventAttendees(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== undefined,
  });
}

export function useRsvpEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, join }: { id: bigint; join: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rsvpEvent(id, join);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      queryClient.invalidateQueries({ queryKey: ["eventAttendees"] });
      queryClient.invalidateQueries({ queryKey: ["eventsAttending"] });
    },
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: EventView) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      queryClient.invalidateQueries({ queryKey: ["eventsCreated"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfileView) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["ageVerified"] });
    },
  });
}

// Groups
export function useAllGroups() {
  const { actor, isFetching } = useActor();
  return useQuery<PersistentGroupView[]>({
    queryKey: ["allGroups"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGroups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserGroups(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["userGroups", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getUserGroups(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (group: PersistentGroupView) => {
      if (!actor) throw new Error("Not connected");
      return actor.createGroup(group);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allGroups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.joinGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allGroups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
    },
  });
}

export function useLeaveGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.leaveGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allGroups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
    },
  });
}

// Friends
export function useFriends() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Principal[]>({
    queryKey: ["friends"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriends();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useFriendRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Principal[]>({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIncomingFriendRequests();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (toUser: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendFriendRequest(toUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fromUser: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptFriendRequest(fromUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });
}

export function useRejectFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fromUser: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectFriendRequest(fromUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });
}

export function useRemoveFriend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friend: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeFriend(friend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

export function useAllUserProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileView[]>({
    queryKey: ["allUserProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAgeVerified() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["ageVerified"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAgeVerified();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export { EventCategory };
