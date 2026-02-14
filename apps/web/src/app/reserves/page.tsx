import { apiGet } from "@/lib/api";
import { formatGBP } from "@/lib/format";
import type { ReserveSnapshot } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReservesPage() {
  let snapshot: ReserveSnapshot;

  try {
    snapshot = await apiGet<ReserveSnapshot>("/reserves/snapshot");
  } catch {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Reserves</p>
          <h1 className="font-display mt-2 text-2xl">Reserve Coverage</h1>
        </section>
        <div className="border-b border-[var(--stroke)] pb-8 text-center">
          <p className="font-display text-lg">Unable to load reserves</p>
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
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Reserves</p>
        <h1 className="font-display mt-2 text-2xl">Reserve Coverage</h1>
        <p className="text-[var(--muted)] mt-1 max-w-2xl text-[13px]">
          Snapshot view of cash and government securities held against circulating supply.
        </p>
      </section>

      {/* Reserve data */}
      <section className="grid gap-0 lg:grid-cols-2">
        <div className="border-b border-[var(--stroke)] py-6 lg:border-b-0 lg:border-r lg:pr-8">
          <h2 className="font-display text-base">Reserve Composition</h2>
          <div className="mt-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] py-3 text-[13px]">
              <span className="text-[var(--muted)]">Cash</span>
              <span className="font-medium">{formatGBP(snapshot.cash_gbp)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--stroke)] py-3 text-[13px]">
              <span className="text-[var(--muted)]">Gov securities</span>
              <span className="font-medium">{formatGBP(snapshot.gov_securities_gbp)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--stroke)] py-3 text-[13px]">
              <span className="text-[var(--muted)]">Total reserves</span>
              <span className="font-semibold">{formatGBP(snapshot.total_reserves_gbp)}</span>
            </div>
          </div>
        </div>
        <div className="py-6 lg:pl-8">
          <div className="rounded-md border border-[var(--accent)] bg-[var(--surface)] p-6">
            <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Circulating supply</p>
            <p className="font-display mt-3 text-3xl text-[var(--accent)]">{formatGBP(snapshot.circulating_supply_gbp)}</p>
            <p className="mt-4 text-[11px] text-[var(--muted)]">Snapshot as of {snapshot.created_at}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
