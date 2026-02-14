"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiPatch, apiPost, apiRequestWithToken } from "@/lib/api";

export type ActionState = { error: string | null };

function getValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return "";
  }
  return value;
}

function extractError(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      return parsed.error ?? parsed.message ?? fallback;
    } catch {
      return err.message || fallback;
    }
  }
  return fallback;
}

// --- Auth actions ---

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");

  let result: { token: string; user: { name: string; email: string; role: string } };
  try {
    result = await apiRequestWithToken<{
      token: string;
      user: { name: string; email: string; role: string };
    }>("/auth/login", "", { method: "POST", body: { email, password } });
  } catch (err) {
    return { error: extractError(err, "Invalid email or password") };
  }

  const cookieStore = await cookies();
  cookieStore.set("auth_token", result.token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  cookieStore.set("auth_user", JSON.stringify({
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
  }), {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
  });

  redirect("/");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_user");
  redirect("/login");
}

// --- Request actions ---

export async function createRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const payload = {
    type: getValue(formData, "type"),
    customer_id: Number(getValue(formData, "customer_id")),
    address: getValue(formData, "address"),
    amount_gbp: getValue(formData, "amount_gbp")
  };

  try {
    await apiPost("/requests", payload, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to create request") };
  }
  revalidatePath("/");
  revalidatePath("/requests");
  return { error: null };
}

export async function approveRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = getValue(formData, "id");
  try {
    await apiPost(`/requests/${id}/approve`, {}, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to approve request") };
  }
  revalidatePath("/requests");
  revalidatePath("/");
  return { error: null };
}

export async function submitRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = getValue(formData, "id");
  try {
    await apiPost(`/requests/${id}/submit`, {}, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to submit request") };
  }
  revalidatePath("/requests");
  revalidatePath("/");
  return { error: null };
}

export async function settleRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = getValue(formData, "id");
  try {
    await apiPost(`/requests/${id}/settle`, {}, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to settle request") };
  }
  revalidatePath("/requests");
  revalidatePath("/transactions");
  revalidatePath("/");
  return { error: null };
}

// --- Customer actions ---

export async function updateKyb(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = getValue(formData, "id");
  const kyb_status = getValue(formData, "kyb_status");
  try {
    await apiPatch(`/customers/${id}/kyb`, { kyb_status });
  } catch (err) {
    return { error: extractError(err, "Failed to update KYB status") };
  }
  revalidatePath("/customers");
  return { error: null };
}

export async function createCustomer(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = getValue(formData, "name");
  try {
    await apiPost("/customers", { name }, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to create customer") };
  }
  revalidatePath("/customers");
  return { error: null };
}

export async function addWhitelistAddress(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const customerId = getValue(formData, "customer_id");
  const address = getValue(formData, "address");
  try {
    await apiPost(`/customers/${customerId}/addresses`, { address }, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to add address") };
  }
  revalidatePath("/customers");
  return { error: null };
}

export async function revokeWhitelistAddress(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = getValue(formData, "id");
  try {
    await apiPatch(`/addresses/${id}/revoke`, {});
  } catch (err) {
    return { error: extractError(err, "Failed to revoke address") };
  }
  revalidatePath("/customers");
  return { error: null };
}

// --- Compliance actions ---

export async function pauseToken(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  try {
    await apiPost("/token/pause", {}, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to pause token") };
  }
  revalidatePath("/compliance");
  revalidatePath("/");
  return { error: null };
}

export async function unpauseToken(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  try {
    await apiPost("/token/unpause", {}, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to unpause token") };
  }
  revalidatePath("/compliance");
  revalidatePath("/");
  return { error: null };
}

export async function freezeAddress(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const address = getValue(formData, "address");
  try {
    await apiPost("/token/freeze", { address }, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to freeze address") };
  }
  revalidatePath("/compliance");
  return { error: null };
}

export async function unfreezeAddress(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const address = getValue(formData, "address");
  try {
    await apiPost("/token/unfreeze", { address }, randomUUID());
  } catch (err) {
    return { error: extractError(err, "Failed to unfreeze address") };
  }
  revalidatePath("/compliance");
  return { error: null };
}
