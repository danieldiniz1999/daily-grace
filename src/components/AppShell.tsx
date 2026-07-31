import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookMarked, BookOpenText, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import logoAsset from "@/assets/daily-grace-logo.png.asset.json";

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
  const [open, setOpen] = useState(false);

  const items: NavItem[] = [
    { to: "/devocionais", label: "Devocionais", icon: <BookOpenText className="size-5" /> },
    { to: "/biblia", label: "Bíblia", icon: <BookMarked className="size-5" /> },
    { to: "/conta", label: "Minha conta", icon: <User className="size-5" /> },
    ...(isAdmin
      ? [{ to: "/admin", label: "Admin", icon: <Settings className="size-5" /> } as NavItem]
      : []),
  ];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="app-inner bg-soft min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/devocionais" className="flex items-center gap-2">
            <img
              src={logoAsset.url}
              alt="Daily Grace"
              className="size-9 object-contain"
            />
            <span className="font-display text-xl leading-none font-semibold tracking-tight">
              Daily Grace
            </span>
          </Link>

          {/* Desktop: hambúrguer sobrepondo a tela */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden rounded-full sm:flex"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col border-none bg-gradient-to-b from-[#CB6CE6] to-[#A740C4] p-0 text-primary-foreground sm:max-w-sm"
            >
              <SheetHeader className="p-6 pb-2 text-left">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center justify-between">
                  <Link
                    to="/devocionais"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={logoAsset.url}
                      alt="Daily Grace"
                      className="size-9 object-contain"
                    />
                    <span className="font-display text-xl leading-none font-semibold tracking-tight text-white">
                      Daily Grace
                    </span>
                  </Link>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      aria-label="Fechar menu"
                    >
                      <X className="size-5" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              <nav className="flex-1 px-6 py-4">
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.to}>
                      <SheetClose asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                            pathname.startsWith(item.to)
                              ? "bg-white/15 text-white shadow-sm"
                              : "text-white/80 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <span className="transition-transform duration-300 group-hover:scale-110">
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="p-6 pt-2">
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-4 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                  aria-label="Sair"
                >
                  <LogOut className="size-5" />
                  Sair da conta
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile: botão de sair (bottom nav cuida da navegação) */}
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

