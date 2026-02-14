"use client";

import { useActionState, useRef } from "react";
import { login } from "@/app/actions";
import type { ActionState } from "@/app/actions";

const DEMO_USERS = [
  {
    label: "Admin",
    email: "admin@issuer.test",
    password: "password",
    description: "Full access — create requests, approve, manage compliance",
    color: "var(--accent)",
  },
  {
    label: "Approver",
    email: "approver@issuer.test",
    password: "password",
    description: "Create & approve requests (maker/checker second user)",
    color: "var(--warning)",
  },
  {
    label: "Viewer",
    email: "viewer@issuer.test",
    password: "password",
    description: "Read-only access to all data",
    color: "var(--muted)",
  },
];

const initialState: ActionState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  function fillAndSubmit(email: string, password: string) {
    if (!formRef.current) return;
    const emailInput = formRef.current.querySelector<HTMLInputElement>('input[name="email"]');
    const passwordInput = formRef.current.querySelector<HTMLInputElement>('input[name="password"]');
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
    formRef.current.requestSubmit();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="status-dot status-dot-live"></span>
            <h1 className="font-display text-xl">Issuer Console</h1>
          </div>
          <p className="text-[13px] text-[var(--muted)]">
            Sign in to GBP Stablecoin Operations
          </p>
        </div>

        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2.5 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2.5 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
          {state.error && (
            <p className="text-[13px] text-[var(--danger)]">{state.error}</p>
          )}
        </form>

        <div className="mt-8">
          <p className="mb-3 text-center text-[11px] uppercase tracking-widest text-[var(--muted)]">
            Quick pick — demo users
          </p>
          <div className="flex flex-col gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                type="button"
                disabled={isPending}
                onClick={() => fillAndSubmit(user.email, user.password)}
                className="flex items-center gap-3 rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
              >
                <span
                  className="status-dot"
                  style={{ background: user.color }}
                ></span>
                <div>
                  <p className="text-[13px] font-medium text-[var(--ink)]">
                    {user.label}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {user.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
