import { apiGet } from "@/lib/api";
import { formatGBP } from "@/lib/format";
import type { MintRedeemRequest, PaginatedResponse, ReserveSnapshot, TokenStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let requests: MintRedeemRequest[];
  let tokenStatus: TokenStatus;
  let reserves: ReserveSnapshot;

  try {
    const [requestsPage, tokenStatusResult, reservesResult] = await Promise.all([
      apiGet<PaginatedResponse<MintRedeemRequest>>("/requests?per_page=200"),
      apiGet<TokenStatus>("/token/status"),
      apiGet<ReserveSnapshot>("/reserves/snapshot"),
    ]);
    requests = requestsPage.data;
    tokenStatus = tokenStatusResult;
    reserves = reservesResult;
  } catch {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Operational Overview</p>
          <h1 className="font-display mt-2 text-2xl">Issuer Operations Console</h1>
        </section>
        <div className="border-b border-[var(--stroke)] pb-8 text-center">
          <p className="font-display text-lg">Unable to load dashboard data</p>
          <p className="text-[var(--muted)] mt-2 text-[13px]">
            The backend API is unreachable. Please check that the server is
            running and try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  const pendingApprovals = requests.filter((req) => req.status === "created").length;
  const pendingSubmissions = requests.filter((req) => req.status === "approved").length;
  const settled = requests.filter((req) => req.status === "settled").length;
  const recent = requests.slice(0, 5);

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <section className="border-b border-[var(--stroke)] pb-6">
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Operational Overview</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-2xl">Issuer Operations Console</h1>
            <p className="text-[var(--muted)] mt-1 max-w-xl text-[13px]">
              Maintain issuer-grade control over minting, redemption, compliance, and audit
              traceability across fiat and on-chain systems.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`status-dot ${tokenStatus.paused ? "status-dot-paused" : "status-dot-live"}`}></span>
            <span className="text-[13px] font-medium">
              {tokenStatus.paused ? "Paused" : "Live"}
            </span>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-1 border-b border-[var(--stroke)] md:grid-cols-3">
        <div className="border-b border-[var(--stroke)] px-0 py-5 md:border-b-0 md:border-r md:pr-8">
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Circulating supply</p>
          <p className="font-display mt-1 text-2xl">{formatGBP(reserves.circulating_supply_gbp)}</p>
          <p className="text-[11px] text-[var(--muted)] mt-1">Based on settled mint/burn requests.</p>
        </div>
        <div className="border-b border-[var(--stroke)] px-0 py-5 md:border-b-0 md:border-r md:px-8">
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Pending approvals</p>
          <p className="font-display mt-1 text-2xl">{pendingApprovals}</p>
          <p className="text-[11px] text-[var(--muted)] mt-1">Maker items awaiting checker review.</p>
        </div>
        <div className="px-0 py-5 md:pl-8">
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Frozen addresses</p>
          <p className="font-display mt-1 text-2xl">{tokenStatus.frozen_count}</p>
          <p className="text-[11px] text-[var(--muted)] mt-1">Live compliance restrictions.</p>
        </div>
      </section>

      {/* Latest requests + Reserve snapshot */}
      <section className="grid gap-0 border-b border-[var(--stroke)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border-b border-[var(--stroke)] py-6 lg:border-b-0 lg:border-r lg:pr-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base">Latest Requests</h2>
            <span className="accent-badge status-badge">Settled {settled}</span>
          </div>
          <div className="mt-4 flex flex-col">
            {recent.length === 0 ? (
              <p className="text-[13px] text-[var(--muted)]">No requests yet.</p>
            ) : (
              recent.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between border-b border-[var(--stroke)] px-3 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <div>
                    <p className="text-[13px] font-medium">
                      {req.type.toUpperCase()} · {formatGBP(req.amount_gbp)}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {req.address} · {req.customer?.name ?? "Customer"}
                    </p>
                  </div>
                  <span className="status-badge">{req.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="py-6 lg:pl-8">
          <h2 className="font-display text-base">Reserve Snapshot</h2>
          <div className="mt-4 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Cash</span>
              <span className="font-medium">{formatGBP(reserves.cash_gbp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Gov securities</span>
              <span className="font-medium">{formatGBP(reserves.gov_securities_gbp)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--stroke-strong)] pt-3">
              <span className="text-[var(--muted)]">Total reserves</span>
              <span className="font-semibold">{formatGBP(reserves.total_reserves_gbp)}</span>
            </div>
            <div className="text-[11px] text-[var(--muted)]">Snapshot as of {reserves.created_at}</div>
          </div>
        </div>
      </section>

      {/* Pending queue */}
      <section className="py-6">
        <h2 className="font-display text-base">Pending Operational Queue</h2>
        <div className="mt-4 grid gap-0 md:grid-cols-2">
          <div className="border-b border-[var(--stroke)] py-4 md:border-b-0 md:border-r md:pr-8">
            <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Approvals</p>
            <p className="font-display mt-1 text-xl">{pendingApprovals}</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">Maker requests awaiting approval.</p>
          </div>
          <div className="py-4 md:pl-8">
            <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Ready to submit</p>
            <p className="font-display mt-1 text-xl">{pendingSubmissions}</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">Approved requests pending chain submission.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
