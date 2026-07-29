import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpenText, Heart, LogOut, Settings, User } from "lucide-react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: ReactNode };

export function AppShell({
  children,
  isAdmin,
}: {
  children?: ReactNode;
  isAdmin?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items: NavItem[] = [
    { to: "/devocionais", label: "Devocionais", icon: <BookOpenText className="size-5" /> },
    { to: "/conta", label: "Minha conta", icon: <User className="size-5" /> },
    ...(isAdmin
      ? [{ to: "/admin", label: "Admin", icon: <Settings className="size-5" /> } as NavItem]
      : []),
  ];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="bg-soft min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/devocionais" className="flex items-center gap-2">
            <span className="bg-grace flex size-9 items-center justify-center rounded-full">
              <Heart className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-xl leading-none font-semibold tracking-tight">
              Daily Grace
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(item.to)
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="ml-1 rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Sair"
            >
              <LogOut className="size-4" />
            </button>
          </nav>

          <button
            onClick={signOut}
            className="rounded-full p-2 text-muted-foreground sm:hidden"
            aria-label="Sair"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:pb-14">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium",
                pathname.startsWith(item.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
