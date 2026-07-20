"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Vehicles", icon: "🚗" },
  { href: "/services", label: "History", icon: "🛠" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-text">Vehicle Tracker</p>
          <p className="truncate text-xs text-text-subtle">
            {user?.username ?? "there"}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary-soft text-primary"
                  : "text-text-muted hover:bg-surface-muted",
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-soft"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs",
              isActive(item.href) ? "text-primary" : "text-text-subtle",
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setLogoutOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-danger"
        >
          <span className="text-lg">🚪</span>
          Log Out
        </button>
      </nav>

      <ConfirmDialog
        open={logoutOpen}
        title="Log out?"
        description="You will be signed out of this account."
        confirmLabel="Log Out"
        destructive
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
        }}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}
