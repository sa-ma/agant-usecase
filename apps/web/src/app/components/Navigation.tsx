"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/requests", label: "Mint & Redeem" },
  { href: "/customers", label: "Customers" },
  { href: "/transactions", label: "Transactions" },
  { href: "/compliance", label: "Compliance" },
  { href: "/audit", label: "Audit Log" },
  { href: "/reserves", label: "Reserves" }
];

const ROLE_COLORS: Record<string, string> = {
  admin: "var(--accent)",
  approver: "var(--warning)",
  viewer: "var(--muted)",
};

type AuthUser = { name: string; email: string; role: string };

function parseAuthUser(): AuthUser | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_user="));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(parseAuthUser());
  }, []);

  return (
    <nav className="flex h-full flex-col px-3 py-5">
      <div className="mb-6 px-3">
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-live"></span>
          <p className="text-sm font-semibold text-[var(--ink)]">Issuer Console</p>
        </div>
        <p className="mt-1 text-[11px] text-[var(--muted)]">GBP Stablecoin Operations</p>
      </div>
      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                isActive
                  ? "bg-[var(--accent)]/15 text-[var(--accent)] font-medium"
                  : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto px-3 pt-6">
        {user && (
          <div className="mb-4 flex items-center gap-2">
            <span
              className="status-dot"
              style={{ background: ROLE_COLORS[user.role] ?? "var(--muted)" }}
            ></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                {user.name}
              </p>
              <p className="text-[11px] text-[var(--muted)]">{user.role}</p>
            </div>
          </div>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-1.5 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
          >
            Sign out
          </button>
        </form>
        <p className="mt-4 text-[11px] leading-relaxed text-[var(--muted)]">
          Maker / Checker enforced at API layer. Tokens never minted from the UI.
        </p>
      </div>
    </nav>
  );
}
