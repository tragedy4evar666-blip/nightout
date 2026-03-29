import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import AgeVerificationGate from "./components/AgeVerificationGate";
import Navigation from "./components/Navigation";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailPage from "./pages/EventDetailPage";
import FriendsPage from "./pages/FriendsPage";
import GroupsPage from "./pages/GroupsPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

const rootRoute = createRootRoute({
  component: () => (
    <AgeVerificationGate>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Outlet />
        <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()}. Built with{" "}
            <span className="text-accent">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </AgeVerificationGate>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const eventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/event/$id",
  component: EventDetailPage,
});

const createEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateEventPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups",
  component: GroupsPage,
});

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/friends",
  component: FriendsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  eventDetailRoute,
  createEventRoute,
  profileRoute,
  groupsRoute,
  friendsRoute,
]);
