import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

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

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth && auth.error) return auth.error;

  try {
    const admin = getSupabaseAdmin();
    const [v, r, u, e, s, es, p, a, ent] = await Promise.all([
      admin.from("dataset_versions").select("id,name,status,valid_from,valid_to,notes").order("valid_from", { ascending: false }),
      admin
        .from("resources")
        .select("id,version_id,slug,name,category,base_unit,factor_kgco2e_per_base_unit,explanation")
        .order("name"),
      admin.from("resource_units").select("id,resource_id,unit_name,unit_symbol,to_base_factor,is_base").order("unit_name"),
      admin
        .from("equivalences")
        .select("id,version_id,slug,title,output_unit,description,confidence,co2e_ton_per_unit,formula,is_demo")
        .order("title"),
      admin.from("sources").select("id,key,author,organization,title,year,url,doi,notes").order("year", { ascending: false }),
      admin.from("equivalence_sources").select("equivalence_id,source_id"),
      admin.from("profiles").select("id,email,role,plan,created_at,updated_at").order("created_at", { ascending: false }),
      admin.from("audit_log").select("id,actor_id,table_name,row_id,action,created_at").order("id", { ascending: false }).limit(200),
      admin.from("user_entitlements").select("id,user_id,key,value,created_at,updated_at").order("created_at", { ascending: false })
    ]);

    const firstError = v.error ?? r.error ?? u.error ?? e.error ?? s.error ?? es.error ?? p.error ?? a.error ?? ent.error;
    if (firstError) {
      return jsonError(firstError.message, 500);
    }

    return NextResponse.json({
      versions: v.data ?? [],
      resources: r.data ?? [],
      units: u.data ?? [],
      equivalences: e.data ?? [],
      sources: s.data ?? [],
      equivalenceSources: es.data ?? [],
      profiles: p.data ?? [],
      auditLog: a.data ?? [],
      entitlements: ent.data ?? []
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Server error.", 500);
  }
}
