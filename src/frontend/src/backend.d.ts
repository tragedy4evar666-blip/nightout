import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfileView {
    age: bigint;
    bio: string;
    username: string;
    preferredCategories: Array<EventCategory>;
}
export interface EventView {
    id: bigint;
    title: string;
    creator: Principal;
    maxAttendees?: bigint;
    createdAt: bigint;
    description: string;
    state: EventState;
    timestamp: bigint;
    attendees: Array<Principal>;
    category: EventCategory;
    location: string;
}
export interface PersistentGroupView {
    creator: Principal;
    members: Array<Principal>;
    name: string;
    createdAt: bigint;
    description: string;
}
export enum EventCategory {
    bar = "bar",
    concert = "concert",
    other = "other",
    dining = "dining",
    party = "party",
    sports = "sports"
}
export enum EventState {
    upcoming = "upcoming",
    cancelled = "cancelled",
    past = "past",
    ongoing = "ongoing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(fromUser: Principal): Promise<void>;
    areFriends(user1: Principal, user2: Principal): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEvent(input: EventView): Promise<bigint>;
    createGroup(group: PersistentGroupView): Promise<bigint>;
    getAllGroups(): Promise<Array<PersistentGroupView>>;
    getAllUserProfiles(): Promise<Array<UserProfileView>>;
    getCallerUserProfile(): Promise<UserProfileView | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEventAttendees(eventId: bigint): Promise<Array<Principal>>;
    getEventCategories(): Promise<Array<EventCategory>>;
    getEvents(): Promise<Array<EventView>>;
    getEventsAttending(user: Principal): Promise<Array<EventView>>;
    getEventsByCategory(category: EventCategory): Promise<Array<EventView>>;
    getEventsCreated(user: Principal): Promise<Array<EventView>>;
    getFriends(): Promise<Array<Principal>>;
    getFriendsOfUser(user: Principal): Promise<Array<Principal>>;
    getGroup(groupId: bigint): Promise<PersistentGroupView | null>;
    getGroupMembers(groupId: bigint): Promise<Array<Principal>>;
    getIncomingFriendRequests(): Promise<Array<Principal>>;
    getUpcomingEvents(): Promise<Array<EventView>>;
    getUserGroups(user: Principal): Promise<Array<bigint>>;
    getUserProfile(user: Principal): Promise<UserProfileView | null>;
    isAgeVerified(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isUserAgeVerified(user: Principal): Promise<boolean>;
    joinGroup(groupId: bigint): Promise<void>;
    leaveGroup(groupId: bigint): Promise<void>;
    rejectFriendRequest(fromUser: Principal): Promise<void>;
    removeFriend(friend: Principal): Promise<void>;
    rsvpEvent(id: bigint, join: boolean): Promise<EventView>;
    saveCallerUserProfile(profile: UserProfileView): Promise<void>;
    sendFriendRequest(toUser: Principal): Promise<void>;
}
