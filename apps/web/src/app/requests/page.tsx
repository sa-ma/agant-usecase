import { approveRequest, createRequest, settleRequest, submitRequest } from "@/app/actions";
import ActionForm from "@/app/components/ActionForm";
import { apiGet } from "@/lib/api";
import { formatGBP } from "@/lib/format";
import type { Customer, MintRedeemRequest, PaginatedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  let requests: MintRedeemRequest[];
  let customers: Customer[];

  try {
    const [requestsPage, customersResult] = await Promise.all([
      apiGet<PaginatedResponse<MintRedeemRequest>>("/requests?per_page=200"),
      apiGet<Customer[]>("/customers")
    ]);
    requests = requestsPage.data;
    customers = customersResult;
  } catch {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Mint & Redeem</p>
          <h1 className="font-display mt-2 text-2xl">Mint and Redeem Requests</h1>
        </section>
        <div className="border-b border-[var(--stroke)] pb-8 text-center">
          <p className="font-display text-lg">Unable to load requests</p>
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
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Mint & Redeem</p>
        <h1 className="font-display mt-2 text-2xl">Mint and Redeem Requests</h1>
        <p className="text-[var(--muted)] mt-1 max-w-2xl text-[13px]">
          Create issuance or redemption requests for approved customers. Maker/checker
          approvals are required before on-chain submission.
        </p>
      </section>

      {/* Create form */}
      <section className="border-b border-[var(--stroke)] py-6">
        <h2 className="font-display text-base">Create Request</h2>
        <ActionForm action={createRequest} success="Request created" className="mt-4 grid gap-3 lg:grid-cols-5">
          <select
            name="type"
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            required
          >
            <option value="mint">Mint</option>
            <option value="redeem">Redeem</option>
          </select>
          <select
            name="customer_id"
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            required
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <input
            name="address"
            placeholder="0x..."
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
            required
          />
          <input
            name="amount_gbp"
            placeholder="Amount (GBP)"
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
            required
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Create Request
          </button>
        </ActionForm>
      </section>

      {/* Requests list */}
      <section className="py-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base">Requests Queue</h2>
          <span className="accent-badge status-badge">{requests.length} total</span>
        </div>
        <div className="mt-4 flex flex-col">
          {requests.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">No requests found.</p>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="border-b border-[var(--stroke)] py-4 transition-colors hover:bg-[var(--surface-hover)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium">
                      {req.type.toUpperCase()} · {formatGBP(req.amount_gbp)}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {req.customer?.name ?? "Customer"} · {req.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-badge">{req.status}</span>
                    {req.chain_tx_hash && (
                      <span className="accent-badge status-badge">On-chain</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted)]">
                  <span>Created: {req.created_at}</span>
                  {req.fiat_ledger_ref && <span>Fiat ref: {req.fiat_ledger_ref}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionForm action={approveRequest} success="Request approved">
                    <input type="hidden" name="id" value={req.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-1.5 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                    >
                      Approve
                    </button>
                  </ActionForm>
                  <ActionForm action={submitRequest} success="Submitted to chain">
                    <input type="hidden" name="id" value={req.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-1.5 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                    >
                      Submit to chain
                    </button>
                  </ActionForm>
                  <ActionForm action={settleRequest} success="Marked as settled">
                    <input type="hidden" name="id" value={req.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-1.5 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                    >
                      Mark settled
                    </button>
                  </ActionForm>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
