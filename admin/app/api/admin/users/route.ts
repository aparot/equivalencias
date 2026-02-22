import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

type AppRole = "admin" | "user";
type AppPlan = "free" | "pro" | "enterprise";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: jsonError("Supabase anon key missing.", 500) };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: jsonError("Missing auth token.", 401) };
  }
  const accessToken = authHeader.slice(7);
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return { error: jsonError("Invalid session.", 401) };
  }

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profileError || profile?.role !== "admin") {
    return { error: jsonError("Admin privileges required.", 403) };
  }

  return { userId: userData.user.id };
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const role = (body.role ?? "user") as AppRole;
  const plan = (body.plan ?? "free") as AppPlan;

  if (!email || !password) {
    return jsonError("Email and password are required.");
  }
  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters.");
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error || !data?.user) {
      return jsonError(error?.message ?? "Failed to create user.");
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ role, plan })
      .eq("id", data.user.id);
    if (profileError) {
      return jsonError(profileError.message);
    }

    return NextResponse.json({ id: data.user.id });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Server error.", 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const id = String(body.id ?? "").trim();
  const password = body.password ? String(body.password) : null;
  const email = body.email ? String(body.email).trim() : null;

  if (!id) {
    return jsonError("User id is required.");
  }

  try {
    const admin = getSupabaseAdmin();
    if (email) {
      const { error } = await admin.auth.admin.updateUserById(id, { email });
      if (error) return jsonError(error.message);
    }
    if (password) {
      if (password.length < 8) {
        return jsonError("Password must be at least 8 characters.");
      }
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return jsonError(error.message);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Server error.", 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const id = String(body.id ?? "").trim();
  if (!id) {
    return jsonError("User id is required.");
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return jsonError(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Server error.", 500);
  }
}
