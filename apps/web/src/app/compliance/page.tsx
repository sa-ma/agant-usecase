import { freezeAddress, pauseToken, unfreezeAddress, unpauseToken } from "@/app/actions";
import ActionForm from "@/app/components/ActionForm";
import { apiGet } from "@/lib/api";
import type { TokenStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  let status: TokenStatus;

  try {
    status = await apiGet<TokenStatus>("/token/status");
  } catch {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Compliance</p>
          <h1 className="font-display mt-2 text-2xl">Issuer Controls</h1>
        </section>
        <div className="border-b border-[var(--stroke)] pb-8 text-center">
          <p className="font-display text-lg">Unable to load compliance data</p>
          <p className="text-[var(--muted)] mt-2 text-[13px]">
            The backend API is unreachable. Please check that the server is running and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <section className="border-b border-[var(--stroke)] pb-6">
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Compliance</p>
        <h1 className="font-display mt-2 text-2xl">Issuer Controls</h1>
        <p className="text-[var(--muted)] mt-1 max-w-2xl text-[13px]">
          Enforce issuer-grade protections including pausing transfers and freezing
          addresses.
        </p>
      </section>

      {/* Controls */}
      <section className="grid gap-0 border-b border-[var(--stroke)] lg:grid-cols-2">
        <div className="border-b border-[var(--stroke)] py-6 lg:border-b-0 lg:border-r lg:pr-8">
          <h2 className="font-display text-base">Token Status</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className={`status-dot ${status.paused ? "status-dot-paused" : "status-dot-live"}`}></span>
            <span className="text-[13px]">{status.paused ? "Paused" : "Active"}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <ActionForm action={pauseToken} success="Token paused">
              <button
                type="submit"
                className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-1.5 text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
              >
                Pause
              </button>
            </ActionForm>
            <ActionForm action={unpauseToken} success="Token unpaused">
              <button
                type="submit"
                className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-1.5 text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
              >
                Unpause
              </button>
            </ActionForm>
          </div>
        </div>

        <div className="py-6 lg:pl-8">
          <h2 className="font-display text-base">Freeze Controls</h2>
          <p className="mt-2 text-[13px] text-[var(--muted)]">
            Frozen addresses: {status.frozen_count}
          </p>
          <ActionForm action={freezeAddress} success="Address frozen" className="mt-4 flex flex-col gap-3">
            <input
              name="address"
              placeholder="0x..."
              className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Freeze address
            </button>
          </ActionForm>
          <ActionForm action={unfreezeAddress} success="Address unfrozen" className="mt-4 flex flex-col gap-3">
            <input
              name="address"
              placeholder="0x..."
              className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
              required
            />
            <button
              type="submit"
              className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-4 py-2 text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
            >
              Unfreeze address
            </button>
          </ActionForm>
        </div>
      </section>

      {/* Frozen addresses list */}
      <section className="py-6">
        <h2 className="font-display text-base">Frozen Addresses</h2>
        <div className="mt-4 flex flex-col">
          {status.frozen_addresses.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">No frozen addresses.</p>
          ) : (
            status.frozen_addresses.map((address) => (
              <div
                key={address}
                className="flex items-center gap-2 border-b border-[var(--stroke)] py-2.5 text-[13px] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <span className="status-dot status-dot-danger"></span>
                {address}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
