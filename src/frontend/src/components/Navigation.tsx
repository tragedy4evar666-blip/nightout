import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  User,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Navigation() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/create", label: "Create Event", icon: PlusCircle },
    { to: "/groups", label: "Groups", icon: Users },
    { to: "/friends", label: "Friends", icon: UserPlus },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border glass-card">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 group shimmer-interactive rounded-lg"
          data-ocid="nav.link"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-nightlife glow-purple">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-gradient-nightlife">
            NightOut
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`shimmer-interactive flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                data-ocid="nav.link"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="shimmer-interactive border-border text-muted-foreground hover:border-destructive hover:text-destructive"
              data-ocid="nav.button"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Log Out
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="shimmer-interactive bg-gradient-nightlife text-white hover:opacity-90 glow-purple"
              data-ocid="nav.button"
            >
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              {isLoggingIn ? "Connecting..." : "Log In"}
            </Button>
          )}
        </div>

        <button
          type="button"
          className="shimmer-interactive md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-ocid="nav.toggle"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border glass-card"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`shimmer-interactive flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    data-ocid="nav.link"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-2 pb-1">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    className="shimmer-interactive w-full border-border"
                    data-ocid="nav.button"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    disabled={isLoggingIn}
                    className="shimmer-interactive w-full bg-gradient-nightlife text-white"
                    data-ocid="nav.button"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {isLoggingIn ? "Connecting..." : "Log In"}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
