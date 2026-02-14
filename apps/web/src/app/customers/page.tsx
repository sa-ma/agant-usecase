import { addWhitelistAddress, createCustomer, revokeWhitelistAddress, updateKyb } from "@/app/actions";
import ActionForm from "@/app/components/ActionForm";
import { apiGet } from "@/lib/api";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  let customers: Customer[];

  try {
    customers = await apiGet<Customer[]>("/customers");
  } catch {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Customers</p>
          <h1 className="font-display mt-2 text-2xl">KYB & Whitelisting</h1>
        </section>
        <div className="border-b border-[var(--stroke)] pb-8 text-center">
          <p className="font-display text-lg">Unable to load customers</p>
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
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Customers</p>
        <h1 className="font-display mt-2 text-2xl">KYB & Whitelisting</h1>
        <p className="text-[var(--muted)] mt-1 max-w-2xl text-[13px]">
          Manage business verification status and approved withdrawal addresses for each
          customer.
        </p>
      </section>

      {/* Create customer */}
      <section className="border-b border-[var(--stroke)] py-6">
        <h2 className="font-display text-base">Create Customer</h2>
        <ActionForm action={createCustomer} success="Customer created" className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            name="name"
            placeholder="Customer name"
            className="flex-1 rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
            required
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Create
          </button>
        </ActionForm>
      </section>

      {/* Customer list */}
      <section className="py-6">
        {customers.length === 0 ? (
          <p className="text-[13px] text-[var(--muted)]">No customers yet.</p>
        ) : (
          <div className="flex flex-col">
            {customers.map((customer) => (
              <div key={customer.id} className="border-b border-[var(--stroke)] py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-base">{customer.name}</h2>
                    <p className="text-[11px] text-[var(--muted)]">KYB status: {customer.kyb_status}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['approved', 'pending', 'rejected'].map((status) => (
                      <ActionForm key={status} action={updateKyb} success="KYB updated">
                        <input type="hidden" name="id" value={customer.id} />
                        <input type="hidden" name="kyb_status" value={status} />
                        <button
                          type="submit"
                          className={`rounded-md px-3 py-1.5 text-[11px] transition-colors ${
                            status === customer.kyb_status
                              ? 'bg-[var(--accent)] text-white'
                              : 'border border-[var(--stroke)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]'
                          }`}
                        >
                          {status}
                        </button>
                      </ActionForm>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">
                      Whitelisted addresses
                    </p>
                    <div className="mt-3">
                      {customer.addresses?.length ? (
                        customer.addresses.map((address) => (
                          <div
                            key={address.id}
                            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] py-2.5 text-[11px] transition-colors hover:bg-[var(--surface-hover)]"
                          >
                            <span className="text-[var(--ink)]">
                              {address.address}
                              <span className="ml-2 text-[var(--muted)]">· {address.status}</span>
                            </span>
                            <ActionForm action={revokeWhitelistAddress} success="Address revoked">
                              <input type="hidden" name="id" value={address.id} />
                              <button
                                type="submit"
                                className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]"
                              >
                                Revoke
                              </button>
                            </ActionForm>
                          </div>
                        ))
                      ) : (
                        <p className="text-[13px] text-[var(--muted)]">No addresses whitelisted.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Add address</p>
                    <ActionForm action={addWhitelistAddress} success="Address added" className="mt-3 flex flex-col gap-3">
                      <input type="hidden" name="customer_id" value={customer.id} />
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
                        Add
                      </button>
                    </ActionForm>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
