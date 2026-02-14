import { apiGet } from "@/lib/api";
import { formatGBP } from "@/lib/format";
import type { MintRedeemRequest, PaginatedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let transactions: MintRedeemRequest[];

  try {
    const page = await apiGet<PaginatedResponse<MintRedeemRequest>>("/transactions?per_page=200");
    transactions = page.data;
  } catch {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Transactions</p>
          <h1 className="font-display mt-2 text-2xl">On-chain & Fiat History</h1>
        </section>
        <div className="border-b border-[var(--stroke)] pb-8 text-center">
          <p className="font-display text-lg">Unable to load transactions</p>
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
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Transactions</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display mt-2 text-2xl">On-chain & Fiat History</h1>
            <p className="text-[var(--muted)] mt-1 max-w-2xl text-[13px]">
              Reconcile request lifecycle with fiat ledger references and on-chain hashes.
            </p>
          </div>
          <a
            href="/api/transactions/export"
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-4 py-2 text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
          >
            Export CSV
          </a>
        </div>
      </section>

      {/* Transaction rows */}
      <section className="py-6">
        <div className="flex flex-col">
          {transactions.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">No transactions yet.</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col gap-1.5 border-b border-[var(--stroke)] py-3 transition-colors hover:bg-[var(--surface-hover)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium">
                    {tx.type.toUpperCase()} · {formatGBP(tx.amount_gbp)}
                  </p>
                  <span className="status-badge">{tx.status}</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  {tx.customer?.name ?? "Customer"} · {tx.address}
                </p>
                <div className="flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
                  {tx.chain_tx_hash && <span>Tx: {tx.chain_tx_hash}</span>}
                  {tx.fiat_ledger_ref && <span>Fiat ref: {tx.fiat_ledger_ref}</span>}
                  <span>{tx.created_at}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
