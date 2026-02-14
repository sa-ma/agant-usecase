import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const response = await fetch(`${API_URL}/audit-logs/export.csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store"
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=audit-logs.csv"
    }
  });
}
