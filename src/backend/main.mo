import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";



actor {
  type EventCategory = {
    #party;
    #bar;
    #concert;
    #sports;
    #dining;
    #other;
  };

  type EventState = {
    #upcoming;
    #past;
    #ongoing;
    #cancelled;
  };

  type PersistentEvent = {
    id : Nat;
    creator : Principal;
    title : Text;
    description : Text;
    category : EventCategory;
    timestamp : Int; // Unix timestamp
    location : Text;
    maxAttendees : ?Nat;
    attendees : Set.Set<Principal>;
    state : EventState;
    createdAt : Int;
  };

  type EventView = {
    id : Nat;
    creator : Principal;
    title : Text;
    description : Text;
    category : EventCategory;
    timestamp : Int; // Unix timestamp
    location : Text;
    maxAttendees : ?Nat;
    attendees : [Principal];
    state : EventState;
    createdAt : Int;
  };

  type PersistentUserProfile = {
    username : Text;
    bio : Text;
    age : Nat;
    preferredCategories : [EventCategory];
  };

  type UserProfileView = {
    username : Text;
    bio : Text;
    age : Nat;
    preferredCategories : [EventCategory];
  };

  module PersistentEvent {
    public func compare(e1 : PersistentEvent, e2 : PersistentEvent) : Order.Order {
      Nat.compare(e1.id, e2.id);
    };
  };

  type PersistentGroup = {
    name : Text;
    description : Text;
    members : Set.Set<Principal>;
    creator : Principal;
    createdAt : Int;
  };

  type PersistentGroupView = {
    name : Text;
    description : Text;
    members : [Principal];
    creator : Principal;
    createdAt : Int;
  };

  type PersistentFriendRequests = {
    sent : Set.Set<Principal>;
    received : Set.Set<Principal>;
  };

  var nextEventId = 1;
  var nextGroupId = 1;

  let events = Map.empty<Nat, PersistentEvent>();
  let userProfiles = Map.empty<Principal, PersistentUserProfile>();
  let groups = Map.empty<Nat, PersistentGroup>();
  let userGroups = Map.empty<Principal, Set.Set<Nat>>();
  let friendships = Map.empty<Principal, Set.Set<Principal>>();
  let friendRequests = Map.empty<Principal, PersistentFriendRequests>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // PROFILE FUNCTIONS

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller).map(toUserProfileView);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfileView) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.age < 18) {
      Runtime.trap(
        "Age verification failed: Must be 18 or older. Please verify your age in your profile and try again. ",
      );
    };
    let persistentProfile = profile;
    userProfiles.add(caller, persistentProfile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileView {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user).map(toUserProfileView);
  };

  public query ({ caller }) func isAgeVerified() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check age verification");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.age >= 18 };
    };
  };

  public query ({ caller }) func isUserAgeVerified(user : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check age verification");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own age verification status");
    };
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.age >= 18 };
    };
  };

  // EVENT FUNCTIONS

  public shared ({ caller }) func createEvent(input : EventView) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Caller has no user profile. Create your user profile first before creating events.");
      };
      case (?profile) {
        if (profile.age < 18) {
          Runtime.trap("Age verification failed: Must be 18 or older. Please verify your age in your profile and try again. ",);
        };
      };
    };

    let newEvent : PersistentEvent = {
      id = nextEventId;
      creator = caller;
      title = input.title;
      description = input.description;
      category = input.category;
      timestamp = input.timestamp;
      location = input.location;
      maxAttendees = input.maxAttendees;
      attendees = Set.singleton<Principal>(caller);
      state = #upcoming;
      createdAt = Time.now();
    };

    events.add(nextEventId, newEvent);
    nextEventId += 1;
    nextEventId - 1;
  };

  public query ({ caller }) func getEvents() : async [EventView] {
    events.values().toArray().map(toEventView);
  };

  public query ({ caller }) func getUpcomingEvents() : async [EventView] {
    events.values().toArray().filter(func(e) { e.timestamp > Time.now() }).map(toEventView);
  };

  public query ({ caller }) func getEventsByCategory(category : EventCategory) : async [EventView] {
    events.values().toArray().filter(func(e) { e.category == category }).map(toEventView);
  };

  // RSVP FUNCTIONS

  public shared ({ caller }) func rsvpEvent(id : Nat, join : Bool) : async EventView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can RSVP to events");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Caller has no user profile. Please create one first.") };
      case (?profile) {
        if (profile.age < 18) {
          Runtime.trap(
            "Age verification failed: Must be 18 or older. Please verify your age in your profile and try again. ",
          );
        };
      };
    };

    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) {
        if (join) {
          event.attendees.add(caller);
        } else {
          event.attendees.remove(caller);
        };
        events.add(id, event);
        toEventView(event);
      };
    };
  };

  public query ({ caller }) func getEventAttendees(eventId : Nat) : async [Principal] {
    switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event.attendees.toArray() };
    };
  };

  public query ({ caller }) func getEventsAttending(user : Principal) : async [EventView] {
    events.values().toArray().filter(func(e) { e.attendees.contains(user) }).map(toEventView);
  };

  public query ({ caller }) func getEventsCreated(user : Principal) : async [EventView] {
    events.values().toArray().filter(func(e) { e.creator == user }).map(toEventView);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfileView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all profiles");
    };
    userProfiles.values().toArray().map(toUserProfileView);
  };

  // GROUP FUNCTIONS (TASK GROUP 1)

  public shared ({ caller }) func createGroup(group : PersistentGroupView) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create groups");
    };
    if (group.name.size() == 0 or group.description.size() == 0) {
      Runtime.trap("Group name and description cannot be empty");
    };
    if (group.name.size() > 30) {
      Runtime.trap("Group name too long. Please choose a shorter name.");
    };
    if (group.description.size() > 300) {
      Runtime.trap("Group description too long. Please shorten your description.");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You need a user profile to create a group. Please create one first.") };
      case (?profile) {
        if (profile.age < 18) { Runtime.trap("You must be 18 or older to create a group.") };
      };
    };

    let groupId = nextGroupId;
    let persistentGroup : PersistentGroup = {
      group with
      members = Set.singleton<Principal>(caller);
      creator = caller;
      createdAt = Time.now();
    };

    groups.add(groupId, persistentGroup);
    nextGroupId += 1;

    // Update userGroups for creator
    let userGroupIds = userGroups.get(caller);
    switch (userGroupIds) {
      case (null) {
        let newSet = Set.singleton<Nat>(groupId);
        userGroups.add(caller, newSet);
      };
      case (?existingSet) {
        existingSet.add(groupId);
        userGroups.add(caller, existingSet);
      };
    };

    groupId;
  };

  public query ({ caller }) func getGroup(groupId : Nat) : async ?PersistentGroupView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view groups");
    };
    groups.get(groupId).map(toPersistentGroupView);
  };

  public query ({ caller }) func getAllGroups() : async [PersistentGroupView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view groups");
    };
    groups.values().toArray().map(toPersistentGroupView);
  };

  public shared ({ caller }) func joinGroup(groupId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join groups");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You need a user profile to join a group. Please create one first.") };
      case (?profile) {
        if (profile.age < 18) { Runtime.trap("You must be 18 or older to join a group.") };
      };
    };

    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) {
        if (group.members.contains(caller)) {
          Runtime.trap("You are already a member of this group");
        };
        group.members.add(caller);
        groups.add(groupId, group);

        // Update userGroups
        let userGroupIds = userGroups.get(caller);
        switch (userGroupIds) {
          case (null) {
            let newSet = Set.singleton<Nat>(groupId);
            userGroups.add(caller, newSet);
          };
          case (?existingSet) {
            existingSet.add(groupId);
            userGroups.add(caller, existingSet);
          };
        };
      };
    };
  };

  public shared ({ caller }) func leaveGroup(groupId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave groups");
    };
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) {
        if (not group.members.contains(caller)) {
          Runtime.trap("You are not a member of this group");
        };
        group.members.remove(caller);
        groups.add(groupId, group);

        // Update userGroups
        switch (userGroups.get(caller)) {
          case (null) {};
          case (?groupIds) {
            groupIds.remove(groupId);
            userGroups.add(caller, groupIds);
          };
        };
      };
    };
  };

  public query ({ caller }) func getGroupMembers(groupId : Nat) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view group members");
    };
    deleteGroupIfEmpty(groupId);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) { group.members.toArray() };
    };
  };

  func deleteGroupIfEmpty(groupId : Nat) {
    switch (groups.get(groupId)) {
      case (null) { () };
      case (?group) { if (group.members.size() == 0) { groups.remove(groupId) } };
    };
  };

  public query ({ caller }) func getUserGroups(user : Principal) : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user groups");
    };
    switch (userGroups.get(user)) {
      case (null) { [] };
      case (?groups) { groups.toArray() };
    };
  };

  // FRIEND FUNCTIONS (TASK GROUP 2)

  public shared ({ caller }) func sendFriendRequest(toUser : Principal) : async () {
    if (caller == toUser) { Runtime.trap("Cannot send friend request to yourself") };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };

    if (areFriendsInternal(caller, toUser)) {
      Runtime.trap("You are already friends with this user");
    };

    let senderRequests = getOrCreateFriendRequests(caller);
    if (senderRequests.sent.contains(toUser)) {
      Runtime.trap("You already sent a friend request to this user");
    };

    let recipientRequests = getOrCreateFriendRequests(toUser);
    if (recipientRequests.received.contains(caller)) {
      Runtime.trap("This user already has a pending friend request from you");
    };

    let updatedSenderRequests = {
      senderRequests with sent = senderRequests.sent;
    };
    updatedSenderRequests.sent.add(toUser);
    friendRequests.add(caller, updatedSenderRequests);

    let updatedRecipientRequests = {
      recipientRequests with received = recipientRequests.received;
    };
    updatedRecipientRequests.received.add(caller);
    friendRequests.add(toUser, updatedRecipientRequests);
  };

  public query ({ caller }) func getIncomingFriendRequests() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friend requests");
    };
    switch (friendRequests.get(caller)) {
      case (null) { [] };
      case (?requests) { requests.received.toArray() };
    };
  };

  public shared ({ caller }) func acceptFriendRequest(fromUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };
    let recipientRequests = getOrCreateFriendRequests(caller);
    if (not recipientRequests.received.contains(fromUser)) {
      Runtime.trap("No incoming friend request from this user");
    };

    let senderRequests = getOrCreateFriendRequests(fromUser);
    if (not senderRequests.sent.contains(caller)) {
      Runtime.trap("This user has not sent you a friend request");
    };

    let senderFriends = getOrCreateFriends(fromUser);
    if (not senderFriends.contains(caller)) {
      senderFriends.add(caller);
      friendships.add(fromUser, senderFriends);
    } else {
      Runtime.trap("Friendship already exists (inconsistent state). Please try again.");
    };

    let recipientFriends = getOrCreateFriends(caller);
    if (not recipientFriends.contains(fromUser)) {
      recipientFriends.add(fromUser);
      friendships.add(caller, recipientFriends);
    } else {
      Runtime.trap("Friendship already exists (inconsistent state). Please try again.");
    };

    senderRequests.sent.remove(caller);
    friendRequests.add(fromUser, senderRequests);

    recipientRequests.received.remove(fromUser);
    friendRequests.add(caller, recipientRequests);
  };

  public shared ({ caller }) func rejectFriendRequest(fromUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject friend requests");
    };
    let senderRequests = getOrCreateFriendRequests(fromUser);
    if (senderRequests.sent.contains(caller)) {
      senderRequests.sent.remove(caller);
      friendRequests.add(fromUser, senderRequests);
    };

    let recipientRequests = getOrCreateFriendRequests(caller);
    if (recipientRequests.received.contains(fromUser)) {
      recipientRequests.received.remove(fromUser);
      friendRequests.add(caller, recipientRequests);
    };
  };

  public shared ({ caller }) func removeFriend(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove friends");
    };
    let callerFriends = getOrCreateFriends(caller);
    if (callerFriends.contains(friend)) {
      callerFriends.remove(friend);
      friendships.add(caller, callerFriends);
    };

    let friendFriends = getOrCreateFriends(friend);
    if (friendFriends.contains(caller)) {
      friendFriends.remove(caller);
      friendships.add(friend, friendFriends);
    };
  };

  public query ({ caller }) func getFriends() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends");
    };
    switch (friendships.get(caller)) {
      case (null) { [] };
      case (?friends) { friends.toArray() };
    };
  };

  public query ({ caller }) func getFriendsOfUser(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends");
    };
    switch (friendships.get(user)) {
      case (null) { [] };
      case (?friends) { friends.toArray() };
    };
  };

  public query ({ caller }) func areFriends(user1 : Principal, user2 : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check friendship status");
    };
    areFriendsInternal(user1, user2);
  };

  func getOrCreateFriendRequests(user : Principal) : PersistentFriendRequests {
    switch (friendRequests.get(user)) {
      case (null) {
        let newRequests : PersistentFriendRequests = {
          sent = Set.empty<Principal>();
          received = Set.empty<Principal>();
        };
        friendRequests.add(user, newRequests);
        newRequests;
      };
      case (?requests) { requests };
    };
  };

  func getOrCreateFriends(user : Principal) : Set.Set<Principal> {
    switch (friendships.get(user)) {
      case (null) {
        let newSet = Set.empty<Principal>();
        friendships.add(user, newSet);
        newSet;
      };
      case (?friends) { friends };
    };
  };

  func areFriendsInternal(user1 : Principal, user2 : Principal) : Bool {
    switch (friendships.get(user1)) {
      case (null) { false };
      case (?friends) { friends.contains(user2) };
    };
  };

  func toEventView(event : PersistentEvent) : EventView {
    {
      event with
      attendees = event.attendees.toArray();
    };
  };

  func toUserProfileView(profile : PersistentUserProfile) : UserProfileView {
    profile;
  };

  func toPersistentGroupView(group : PersistentGroup) : PersistentGroupView {
    {
      group with members = group.members.toArray();
    };
  };

  public query ({ caller }) func getEventCategories() : async [EventCategory] {
    [#party, #bar, #concert, #sports, #dining, #other];
  };
};

