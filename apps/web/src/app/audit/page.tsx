import { apiGet } from "@/lib/api";
import type { AuditLog, PaginatedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  let logs: AuditLog[];

  try {
    const page = await apiGet<PaginatedResponse<AuditLog>>("/audit-logs?per_page=200");
    logs = page.data;
  } catch {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Audit</p>
          <h1 className="font-display mt-2 text-2xl">Audit Trail</h1>
        </section>
        <div className="border-b border-[var(--stroke)] pb-8 text-center">
          <p className="font-display text-lg">Unable to load audit logs</p>
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
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Audit</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display mt-2 text-2xl">Audit Trail</h1>
            <p className="text-[var(--muted)] mt-1 max-w-2xl text-[13px]">
              Immutable log of approvals, compliance actions, and issuance events.
            </p>
          </div>
          <a
            href="/api/audit/export"
            className="rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-4 py-2 text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
          >
            Export CSV
          </a>
        </div>
      </section>

      {/* Audit rows */}
      <section className="py-6">
        <div className="flex flex-col">
          {logs.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">No audit entries yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border-b border-[var(--stroke)] py-3 transition-colors hover:bg-[var(--surface-hover)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium">{log.action}</p>
                  <span className="status-badge">{log.entity_type}</span>
                </div>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Actor: {log.actor?.email ?? "system"} · {log.created_at}
                </p>
                {log.metadata_json && (
                  <pre className="mt-2 rounded-md bg-[var(--surface)] p-2 text-[11px] text-[var(--muted)] whitespace-pre-wrap">
                    {JSON.stringify(log.metadata_json, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
