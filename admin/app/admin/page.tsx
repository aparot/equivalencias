"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type AppRole = "admin" | "user";
type AppPlan = "free" | "pro" | "enterprise";
type TabKey = "overview" | "resources" | "units" | "equivalences" | "sources" | "users" | "activity";

type Version = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  valid_from: string;
  valid_to?: string | null;
  notes?: string | null;
};

type Resource = {
  id: string;
  version_id: string;
  slug: string;
  name: string;
  category: string;
  base_unit: string;
  factor_kgco2e_per_base_unit: number;
  explanation: string;
};

type Unit = {
  id: string;
  resource_id: string;
  unit_name: string;
  unit_symbol: string;
  to_base_factor: number;
  is_base: boolean;
};

type Equivalence = {
  id: string;
  version_id: string;
  slug: string;
  title: string;
  output_unit: string;
  description: string;
  confidence: "high" | "medium" | "low" | null;
  co2e_ton_per_unit: number;
  formula: string;
  is_demo: boolean;
};

type Source = {
  id: string;
  key: string;
  author: string;
  organization: string;
  title: string;
  year: number;
  url?: string | null;
  doi?: string | null;
  notes?: string | null;
};

type EquivalenceSource = {
  equivalence_id: string;
  source_id: string;
};

type Profile = {
  id: string;
  email?: string | null;
  role: AppRole;
  plan: AppPlan;
  created_at: string;
  updated_at: string;
};

type AuditLog = {
  id: number;
  actor_id?: string | null;
  table_name: string;
  row_id?: string | null;
  action: string;
  created_at: string;
};

type UserEntitlement = {
  id: string;
  user_id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

type ResourceForm = Omit<Resource, "id" | "version_id"> & { id?: string };
type UnitForm = Omit<Unit, "id"> & { id?: string };
type EquivalenceForm = Omit<Equivalence, "id" | "version_id"> & { id?: string };
type SourceForm = Omit<Source, "id"> & { id?: string };

const DEFAULT_RESOURCE_FORM: ResourceForm = {
  slug: "",
  name: "",
  category: "Plásticos",
  base_unit: "kg",
  factor_kgco2e_per_base_unit: 0,
  explanation: ""
};

const DEFAULT_UNIT_FORM: UnitForm = {
  resource_id: "",
  unit_name: "",
  unit_symbol: "",
  to_base_factor: 1,
  is_base: false
};

const DEFAULT_EQ_FORM: EquivalenceForm = {
  slug: "",
  title: "",
  output_unit: "",
  description: "",
  confidence: "medium",
  co2e_ton_per_unit: 0,
  formula: "co2e_ton / factor",
  is_demo: false
};

const DEFAULT_SOURCE_FORM: SourceForm = {
  key: "",
  author: "",
  organization: "",
  title: "",
  year: new Date().getFullYear(),
  url: "",
  doi: "",
  notes: ""
};

const TAB_SECTIONS: Array<{ title: string; tabs: Array<{ key: TabKey; label: string }> }> = [
  {
    title: "General",
    tabs: [{ key: "overview", label: "Resumen" }]
  },
  {
    title: "Dataset",
    tabs: [
      { key: "resources", label: "Recursos" },
      { key: "units", label: "Unidades" },
      { key: "equivalences", label: "Equivalencias" },
      { key: "sources", label: "Fuentes" }
    ]
  },
  {
    title: "Control",
    tabs: [
      { key: "users", label: "Usuarios" },
      { key: "activity", label: "Actividad" }
    ]
  }
];

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "/";

function shortDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const [versions, setVersions] = useState<Version[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [equivalences, setEquivalences] = useState<Equivalence[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [equivalenceSources, setEquivalenceSources] = useState<EquivalenceSource[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [entitlements, setEntitlements] = useState<UserEntitlement[]>([]);

  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [newVersionName, setNewVersionName] = useState("");

  const [resourceSearch, setResourceSearch] = useState("");
  const [eqSearch, setEqSearch] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [activitySearch, setActivitySearch] = useState("");

  const [resourceForm, setResourceForm] = useState<ResourceForm>(DEFAULT_RESOURCE_FORM);
  const [unitForm, setUnitForm] = useState<UnitForm>(DEFAULT_UNIT_FORM);
  const [eqForm, setEqForm] = useState<EquivalenceForm>(DEFAULT_EQ_FORM);
  const [sourceForm, setSourceForm] = useState<SourceForm>(DEFAULT_SOURCE_FORM);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("user");
  const [newUserPlan, setNewUserPlan] = useState<AppPlan>("free");
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [selectedUserForEntitlement, setSelectedUserForEntitlement] = useState("");
  const [entitlementKey, setEntitlementKey] = useState("max_results");
  const [entitlementValue, setEntitlementValue] = useState("");

  const [selectedEq, setSelectedEq] = useState("");
  const [selectedSourceForEq, setSelectedSourceForEq] = useState("");

  const resourceFormRef = useRef<HTMLElement | null>(null);
  const unitFormRef = useRef<HTMLElement | null>(null);
  const eqFormRef = useRef<HTMLElement | null>(null);
  const sourceFormRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    void initialize();
  }, []);

  const resourcesInVersion = useMemo(
    () => resources.filter((item) => item.version_id === selectedVersion),
    [resources, selectedVersion]
  );

  const unitsInVersion = useMemo(() => {
    const versionResourceIds = new Set(resourcesInVersion.map((r) => r.id));
    return units.filter((u) => versionResourceIds.has(u.resource_id));
  }, [resourcesInVersion, units]);

  const equivalencesInVersion = useMemo(
    () => equivalences.filter((item) => item.version_id === selectedVersion),
    [equivalences, selectedVersion]
  );

  const filteredResources = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();
    if (!query) return resourcesInVersion;
    return resourcesInVersion.filter((r) => `${r.name} ${r.slug} ${r.category}`.toLowerCase().includes(query));
  }, [resourceSearch, resourcesInVersion]);

  const filteredUnits = useMemo(() => {
    const query = unitSearch.trim().toLowerCase();
    if (!query) return unitsInVersion;
    return unitsInVersion.filter((u) => {
      const resource = resourcesInVersion.find((r) => r.id === u.resource_id);
      const text = `${u.unit_name} ${u.unit_symbol} ${resource?.name ?? ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [unitSearch, unitsInVersion, resourcesInVersion]);

  const filteredEquivalences = useMemo(() => {
    const query = eqSearch.trim().toLowerCase();
    if (!query) return equivalencesInVersion;
    return equivalencesInVersion.filter((e) => `${e.title} ${e.slug} ${e.output_unit}`.toLowerCase().includes(query));
  }, [eqSearch, equivalencesInVersion]);

  const filteredSources = useMemo(() => {
    const query = sourceSearch.trim().toLowerCase();
    if (!query) return sources;
    return sources.filter((s) => `${s.organization} ${s.title} ${s.key}`.toLowerCase().includes(query));
  }, [sourceSearch, sources]);

  const filteredProfiles = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((p) => `${p.email ?? ""} ${p.role} ${p.plan}`.toLowerCase().includes(query));
  }, [userSearch, profiles]);

  const filteredAuditLog = useMemo(() => {
    const query = activitySearch.trim().toLowerCase();
    if (!query) return auditLog;
    return auditLog.filter((entry) => {
      const text = `${entry.action} ${entry.table_name} ${entry.actor_id ?? ""} ${entry.row_id ?? ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [activitySearch, auditLog]);

  const selectedVersionData = useMemo(() => versions.find((v) => v.id === selectedVersion) ?? null, [versions, selectedVersion]);

  const sourceCountByEq = useMemo(() => {
    const map = new Map<string, number>();
    for (const link of equivalenceSources) {
      map.set(link.equivalence_id, (map.get(link.equivalence_id) ?? 0) + 1);
    }
    return map;
  }, [equivalenceSources]);

  async function initialize() {
    if (!supabase) {
      setErrorText("Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en admin/.env.local");
      return;
    }
    setLoading(true);
    setErrorText(null);
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    setSessionEmail(user?.email ?? null);
    if (user?.id) {
      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (error || profile?.role !== "admin") {
        setIsAdmin(false);
      setErrorText("Acceso restringido: necesitas rol admin.");
        await supabase.auth.signOut();
        setSessionEmail(null);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      await loadAll();
    }
    setLoading(false);
  }

  async function loadAll() {
    setErrorText(null);
    const token = await getAccessToken();
    if (!token) {
      setErrorText("Sesión inválida. Vuelve a iniciar sesión.");
      return;
    }

    const res = await fetch("/api/admin/data", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const payload = await res.json();
    if (!res.ok) {
      setErrorText(payload.error ?? "No se pudo cargar el panel.");
      return;
    }

    setVersions(payload.versions ?? []);
    setResources(payload.resources ?? []);
    setUnits(payload.units ?? []);
    setEquivalences(payload.equivalences ?? []);
    setSources(payload.sources ?? []);
    setEquivalenceSources(payload.equivalenceSources ?? []);
    setProfiles((payload.profiles ?? []) as Profile[]);
    setAuditLog((payload.auditLog ?? []) as AuditLog[]);
    setEntitlements((payload.entitlements ?? []) as UserEntitlement[]);

    setSelectedVersion((current) => {
      const list = payload.versions ?? [];
      const published = list.find((item: Version) => item.status === "published");
      if (published?.id) return published.id;
      const hasCurrent = list.some((item: Version) => item.id === current);
      if (hasCurrent) return current;
      return list[0]?.id ?? "";
    });
  }

  function scrollToForm(ref: React.MutableRefObject<HTMLElement | null>) {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stopAction(message?: string) {
    setActionBusy(false);
    const note = message ?? "Acción completada.";
    setActionNote(note);
  }

  function formatError(error: { message?: string } | null, fallback: string) {
    if (!error?.message) return fallback;
    return `${fallback} (${error.message})`;
  }

  async function login() {
    if (!supabase) return;
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorText(formatError(error, "No se pudo iniciar sesión"));
      return;
    }
    const user = data.user;
    setSessionEmail(user?.email ?? null);
    setPassword("");
    if (user?.id) {
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profileError || profile?.role !== "admin") {
        setErrorText("Acceso restringido: necesitas rol admin.");
        await supabase.auth.signOut();
        setSessionEmail(null);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      await loadAll();
    }
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSessionEmail(null);
    setIsAdmin(false);
    if (typeof window !== "undefined") {
      window.location.href = PORTAL_URL;
    }
  }

  async function createVersion() {
    if (!supabase) return;
    if (!newVersionName.trim()) {
      setErrorText("Escribe un nombre para la versión.");
      return;
    }
    setActionBusy(true);
    setActionNote("Creando versión...");
    const payload = {
      name: newVersionName.trim(),
      status: "draft" as const,
      valid_from: new Date().toISOString().slice(0, 10),
      notes: "Creada desde panel admin"
    };
    const { error } = await supabase.from("dataset_versions").insert(payload);
    if (error) {
      setErrorText(formatError(error, "No se pudo crear la versión"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    setNewVersionName("");
    await loadAll();
    stopAction("Versión creada.");
  }

  async function publishVersion(versionId: string) {
    if (!supabase || !versionId) return;
    setActionBusy(true);
    setActionNote("Publicando versión...");
    const { error: archiveError } = await supabase
      .from("dataset_versions")
      .update({ status: "archived", valid_to: new Date().toISOString().slice(0, 10) })
      .neq("id", versionId)
      .eq("status", "published");

    if (archiveError) {
      setErrorText(formatError(archiveError, "No se pudo archivar la versión anterior"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }

    const { error } = await supabase
      .from("dataset_versions")
      .update({ status: "published", valid_to: null, published_at: new Date().toISOString() })
      .eq("id", versionId);

    if (error) {
      setErrorText(formatError(error, "No se pudo publicar la versión"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }

    await loadAll();
    stopAction("Versión publicada.");
  }

  async function saveResource() {
    if (!supabase) return;
    if (!selectedVersion) {
      setErrorText("Selecciona una versión.");
      return;
    }
    setActionBusy(true);
    setActionNote(resourceForm.id ? "Guardando recurso..." : "Creando recurso...");
    const payload = {
      version_id: selectedVersion,
      slug: resourceForm.slug.trim(),
      name: resourceForm.name.trim(),
      category: resourceForm.category.trim() || "Otros",
      base_unit: resourceForm.base_unit.trim() || "kg",
      factor_kgco2e_per_base_unit: Number(resourceForm.factor_kgco2e_per_base_unit),
      explanation: resourceForm.explanation.trim() || "Sin explicación"
    };

    const query = resourceForm.id
      ? supabase.from("resources").update(payload).eq("id", resourceForm.id)
      : supabase.from("resources").insert(payload);

    const { error } = await query;
    if (error) {
      setErrorText(formatError(error, "No se pudo guardar el recurso"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    setResourceForm(DEFAULT_RESOURCE_FORM);
    await loadAll();
    stopAction("Recurso guardado.");
  }

  async function removeResource(id: string) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Eliminando recurso...");
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) {
      setErrorText(formatError(error, "No se pudo eliminar el recurso"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    await loadAll();
    stopAction("Recurso eliminado.");
  }

  async function saveUnit() {
    if (!supabase) return;
    if (!unitForm.resource_id) {
      setErrorText("Selecciona un recurso para la unidad.");
      return;
    }
    setActionBusy(true);
    setActionNote(unitForm.id ? "Guardando unidad..." : "Creando unidad...");
    const payload = {
      resource_id: unitForm.resource_id,
      unit_name: unitForm.unit_name.trim(),
      unit_symbol: unitForm.unit_symbol.trim(),
      to_base_factor: Number(unitForm.to_base_factor),
      is_base: Boolean(unitForm.is_base)
    };

    const query = unitForm.id
      ? supabase.from("resource_units").update(payload).eq("id", unitForm.id)
      : supabase.from("resource_units").insert(payload);

    const { error } = await query;
    if (error) {
      setErrorText(formatError(error, "No se pudo guardar la unidad"));
      stopAction();
      return;
    }
    setUnitForm(DEFAULT_UNIT_FORM);
    await loadAll();
    stopAction("Unidad guardada.");
  }

  async function removeUnit(id: string) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Eliminando unidad...");
    const { error } = await supabase.from("resource_units").delete().eq("id", id);
    if (error) {
      setErrorText(formatError(error, "No se pudo eliminar la unidad"));
      stopAction();
      return;
    }
    await loadAll();
    stopAction("Unidad eliminada.");
  }

  async function saveEquivalence() {
    if (!supabase) return;
    if (!selectedVersion) {
      setErrorText("Selecciona una versión.");
      return;
    }
    setActionBusy(true);
    setActionNote(eqForm.id ? "Guardando equivalencia..." : "Creando equivalencia...");

    const payload = {
      version_id: selectedVersion,
      slug: eqForm.slug.trim(),
      title: eqForm.title.trim(),
      output_unit: eqForm.output_unit.trim(),
      description: eqForm.description.trim(),
      confidence: eqForm.confidence,
      co2e_ton_per_unit: Number(eqForm.co2e_ton_per_unit),
      formula: eqForm.formula.trim(),
      is_demo: Boolean(eqForm.is_demo)
    };

    const query = eqForm.id
      ? supabase.from("equivalences").update(payload).eq("id", eqForm.id)
      : supabase.from("equivalences").insert(payload);

    const { error } = await query;
    if (error) {
      setErrorText(formatError(error, "No se pudo guardar la equivalencia"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    setEqForm(DEFAULT_EQ_FORM);
    await loadAll();
    stopAction("Equivalencia guardada.");
  }

  async function removeEquivalence(id: string) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Eliminando equivalencia...");
    const { error } = await supabase.from("equivalences").delete().eq("id", id);
    if (error) {
      setErrorText(formatError(error, "No se pudo eliminar la equivalencia"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    await loadAll();
    stopAction("Equivalencia eliminada.");
  }

  async function saveSource() {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote(sourceForm.id ? "Guardando fuente..." : "Creando fuente...");

    const payload = {
      key: sourceForm.key.trim(),
      author: sourceForm.author.trim() || sourceForm.organization.trim(),
      organization: sourceForm.organization.trim(),
      title: sourceForm.title.trim(),
      year: Number(sourceForm.year),
      url: sourceForm.url?.trim() || null,
      doi: sourceForm.doi?.trim() || null,
      notes: sourceForm.notes?.trim() || null,
      accessed_at: new Date().toISOString().slice(0, 10),
      is_demo: false
    };

    const query = sourceForm.id
      ? supabase.from("sources").update(payload).eq("id", sourceForm.id)
      : supabase.from("sources").insert(payload);

    const { error } = await query;
    if (error) {
      setErrorText(formatError(error, "No se pudo guardar la fuente"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    setSourceForm(DEFAULT_SOURCE_FORM);
    await loadAll();
    stopAction("Fuente guardada.");
  }

  async function removeSource(id: string) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Eliminando fuente...");
    const { error } = await supabase.from("sources").delete().eq("id", id);
    if (error) {
      setErrorText(formatError(error, "No se pudo eliminar la fuente"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    await loadAll();
    stopAction("Fuente eliminada.");
  }

  async function linkSourceToEquivalence() {
    if (!supabase) return;
    if (!selectedEq || !selectedSourceForEq) {
      setErrorText("Selecciona equivalencia y fuente para vincular.");
      return;
    }
    setActionBusy(true);
    setActionNote("Vinculando fuente...");
    const { error } = await supabase.from("equivalence_sources").insert({
      equivalence_id: selectedEq,
      source_id: selectedSourceForEq
    });
    if (error) {
      setErrorText(formatError(error, "No se pudo vincular la fuente"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    setSelectedSourceForEq("");
    await loadAll();
    stopAction("Fuente vinculada.");
  }

  async function unlinkSourceFromEquivalence(equivalenceId: string, sourceId: string) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Quitando vínculo...");
    const { error } = await supabase
      .from("equivalence_sources")
      .delete()
      .eq("equivalence_id", equivalenceId)
      .eq("source_id", sourceId);
    if (error) {
      setErrorText(formatError(error, "No se pudo quitar el vínculo"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    await loadAll();
    stopAction("Vínculo eliminado.");
  }

  async function updateUserRole(profileId: string, role: AppRole) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Actualizando rol...");
    const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
    if (error) {
      setErrorText(formatError(error, "No se pudo actualizar el rol"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    await loadAll();
    stopAction("Rol actualizado.");
  }

  async function updateUserPlan(profileId: string, plan: AppPlan) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Actualizando plan...");
    const { error } = await supabase.from("profiles").update({ plan }).eq("id", profileId);
    if (error) {
      setErrorText(formatError(error, "No se pudo actualizar el plan"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    await loadAll();
    stopAction("Plan actualizado.");
  }

  async function getAccessToken(): Promise<string | null> {
    if (!supabase) return null;
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token ?? null;
  }

  async function createUser() {
    if (!supabase) return;
    if (!newUserEmail.trim() || !newUserPassword) {
      setErrorText("Completa email y contraseña.");
      return;
    }
    if (newUserPassword.length < 8) {
      setErrorText("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setUserActionLoading(true);
    setActionBusy(true);
    setActionNote("Creando usuario...");
    setErrorText(null);
    const token = await getAccessToken();
    if (!token) {
      setErrorText("Sesión inválida. Vuelve a iniciar sesión.");
      setUserActionLoading(false);
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
        plan: newUserPlan
      })
    });

    const payload = await res.json();
    if (!res.ok) {
      setErrorText(payload.error ?? "No se pudo crear el usuario.");
      setUserActionLoading(false);
      stopAction();
      return;
    }
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("user");
    setNewUserPlan("free");
    await loadAll();
    setUserActionLoading(false);
    stopAction("Usuario creado.");
  }

  async function resetUserPassword(userId: string) {
    if (!supabase) return;
    const nextPassword = window.prompt("Nueva contraseña (mínimo 8 caracteres):");
    if (!nextPassword) return;
    if (nextPassword.length < 8) {
      setErrorText("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setUserActionLoading(true);
    setActionBusy(true);
    setActionNote("Actualizando contraseña...");
    setErrorText(null);
    const token = await getAccessToken();
    if (!token) {
      setErrorText("Sesión inválida. Vuelve a iniciar sesión.");
      setUserActionLoading(false);
      return;
    }
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id: userId, password: nextPassword })
    });
    const payload = await res.json();
    if (!res.ok) {
      setErrorText(payload.error ?? "No se pudo actualizar la contraseña.");
      setUserActionLoading(false);
      stopAction();
      return;
    }
    setUserActionLoading(false);
    stopAction("Contraseña actualizada.");
  }

  async function deleteUser(userId: string) {
    if (!supabase) return;
    const confirmed = window.confirm("¿Eliminar usuario y perfil? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    setUserActionLoading(true);
    setActionBusy(true);
    setActionNote("Eliminando usuario...");
    setErrorText(null);
    const token = await getAccessToken();
    if (!token) {
      setErrorText("Sesión inválida. Vuelve a iniciar sesión.");
      setUserActionLoading(false);
      return;
    }
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id: userId })
    });
    const payload = await res.json();
    if (!res.ok) {
      setErrorText(payload.error ?? "No se pudo eliminar el usuario.");
      setUserActionLoading(false);
      stopAction();
      return;
    }
    await loadAll();
    setUserActionLoading(false);
    stopAction("Usuario eliminado.");
  }

  function handleUserCreateKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void createUser();
    }
  }

  async function updateUserEmail(userId: string) {
    if (!supabase) return;
    const nextEmail = window.prompt("Nuevo email:");
    if (!nextEmail) return;
    setUserActionLoading(true);
    setActionBusy(true);
    setActionNote("Actualizando email...");
    setErrorText(null);
    const token = await getAccessToken();
    if (!token) {
      setErrorText("Sesión inválida. Vuelve a iniciar sesión.");
      setUserActionLoading(false);
      return;
    }
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id: userId, email: nextEmail })
    });
    const payload = await res.json();
    if (!res.ok) {
      setErrorText(payload.error ?? "No se pudo actualizar el email.");
      setUserActionLoading(false);
      stopAction();
      return;
    }
    await loadAll();
    setUserActionLoading(false);
    stopAction("Email actualizado.");
  }

  async function addEntitlement() {
    if (!supabase) return;
    if (!selectedUserForEntitlement || !entitlementKey.trim() || !entitlementValue.trim()) {
      setErrorText("Selecciona usuario y completa key/value.");
      return;
    }
    setActionBusy(true);
    setActionNote("Guardando entitlement...");
    const { error } = await supabase.from("user_entitlements").upsert({
      user_id: selectedUserForEntitlement,
      key: entitlementKey.trim(),
      value: entitlementValue.trim()
    });
    if (error) {
      setErrorText(formatError(error, "No se pudo guardar el entitlement"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    setEntitlementValue("");
    await loadAll();
    stopAction("Entitlement guardado.");
  }

  async function removeEntitlement(entitlementId: string) {
    if (!supabase) return;
    setActionBusy(true);
    setActionNote("Eliminando entitlement...");
    const { error } = await supabase.from("user_entitlements").delete().eq("id", entitlementId);
    if (error) {
      setErrorText(formatError(error, "No se pudo eliminar el entitlement"));
      setActionBusy(false);
      setActionNote(null);
      return;
    }
    await loadAll();
    stopAction("Entitlement eliminado.");
  }

  const headerStats = [
    { label: "Recursos en versión", value: String(resourcesInVersion.length) },
    { label: "Equivalencias en versión", value: String(equivalencesInVersion.length) },
    { label: "Usuarios", value: String(profiles.length) }
  ];

  return (
    <main className="admin-root">
      <header className="top-shell">
        <div>
          <p className="eyebrow">EcoEquivalencias</p>
          <h1>Panel de Administración</h1>
          <p className="muted">Control total de dataset, citas, usuarios, publicaciones y actividad.</p>
        </div>
        <div className="auth-box">
          <p className="muted">Sesión: <strong>{sessionEmail ?? "invitado"}</strong></p>
          {sessionEmail && isAdmin ? (
            <div className="auth-actions">
              <a className="btn ghost" href="/metodo">Método</a>
              <button className="btn ghost" onClick={logout}>Cerrar sesión</button>
            </div>
          ) : (
            <p className="muted">
              Inicia sesión desde el portal principal:{" "}
              <a href={PORTAL_URL} className="link">ir al portal</a>.
            </p>
          )}
        </div>
      </header>

      {errorText && (
        <div className="alert error">
          <span>{errorText}</span>
          <button className="alert-close" onClick={() => setErrorText(null)} aria-label="Cerrar alerta">
            ×
          </button>
        </div>
      )}
      {actionNote && (
        <div className="alert success">
          <span>{actionNote}</span>
          <button className="alert-close" onClick={() => setActionNote(null)} aria-label="Cerrar alerta">
            ×
          </button>
        </div>
      )}

      {isAdmin && (
        <section className="stats-grid">
          {headerStats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </article>
          ))}
        </section>
      )}

      {isAdmin && (
        <section className="admin-shell">
          <aside className="admin-sidebar" aria-label="Navegación admin">
            {TAB_SECTIONS.map((section) => (
              <div key={section.title} className="sidebar-section">
                <p className="sidebar-title">{section.title}</p>
                <div className="sidebar-links">
                  {section.tabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`sidebar-link ${activeTab === tab.key ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div className="admin-main">
      {activeTab === "overview" && (
        <section className="panel">
          <h2>Resumen operativo</h2>
          <div className="summary-grid">
            <article className="panel-card">
              <h3>Estado de versión</h3>
              <p><strong>Seleccionada:</strong> {selectedVersionData?.name ?? "-"}</p>
              <p><strong>Estado:</strong> {selectedVersionData?.status ?? "-"}</p>
              <p><strong>Vigencia:</strong> {selectedVersionData?.valid_from ?? "-"} {selectedVersionData?.valid_to ? `→ ${selectedVersionData.valid_to}` : ""}</p>
            </article>
            <article className="panel-card">
              <h3>Integridad de citas</h3>
              <p>
                Equivalencias sin fuente:
                <strong>
                  {equivalencesInVersion.filter((eq) => (sourceCountByEq.get(eq.id) ?? 0) === 0).length}
                </strong>
              </p>
              <p className="muted">Objetivo: 0 antes de publicar.</p>
            </article>
            <article className="panel-card">
              <h3>Actividad reciente</h3>
              <p><strong>{auditLog.length}</strong> eventos registrados (últimos 200).</p>
              <p className="muted">Incluye inserciones, cambios y eliminaciones.</p>
            </article>
          </div>
        </section>
      )}

      {activeTab === "resources" && (
        <section className="panel" ref={resourceFormRef}>
          <h2>Recursos</h2>
          <div className="form-grid">
            <input placeholder="slug" value={resourceForm.slug} onChange={(e) => setResourceForm({ ...resourceForm, slug: e.target.value })} />
            <input placeholder="nombre" value={resourceForm.name} onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })} />
            <input placeholder="categoría" value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })} />
            <input placeholder="unidad base" value={resourceForm.base_unit} onChange={(e) => setResourceForm({ ...resourceForm, base_unit: e.target.value })} />
            <input
              placeholder="factor kgCO2e/unidad"
              type="number"
              value={resourceForm.factor_kgco2e_per_base_unit}
              onChange={(e) => setResourceForm({ ...resourceForm, factor_kgco2e_per_base_unit: Number(e.target.value) })}
            />
            <textarea placeholder="explicación" value={resourceForm.explanation} onChange={(e) => setResourceForm({ ...resourceForm, explanation: e.target.value })} />
          </div>
          <div className="actions-row">
            <button className="btn primary" onClick={saveResource} disabled={actionBusy}>
              {actionBusy ? "Procesando..." : (resourceForm.id ? "Guardar cambios" : "Crear recurso")}
            </button>
            <button className="btn ghost" onClick={() => setResourceForm(DEFAULT_RESOURCE_FORM)}>Limpiar</button>
            <input className="search" placeholder="Buscar recursos..." value={resourceSearch} onChange={(e) => setResourceSearch(e.target.value)} />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Slug</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Factor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.slug}</td>
                    <td>{item.category}</td>
                    <td>{item.base_unit}</td>
                    <td>{item.factor_kgco2e_per_base_unit}</td>
                    <td className="right">
                      <button
                        className="mini"
                        onClick={() => {
                          setResourceForm({ ...item });
                          scrollToForm(resourceFormRef);
                        }}
                      >
                        Editar
                      </button>
                      <button className="mini danger" onClick={() => void removeResource(item.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "units" && (
        <section className="panel" ref={unitFormRef}>
          <h2>Unidades y conversiones</h2>
          <div className="form-grid">
            <select value={unitForm.resource_id} onChange={(e) => setUnitForm({ ...unitForm, resource_id: e.target.value })}>
              <option value="">Selecciona recurso</option>
              {resourcesInVersion.map((resource) => (
                <option key={resource.id} value={resource.id}>{resource.name}</option>
              ))}
            </select>
            <input placeholder="nombre unidad" value={unitForm.unit_name} onChange={(e) => setUnitForm({ ...unitForm, unit_name: e.target.value })} />
            <input placeholder="símbolo" value={unitForm.unit_symbol} onChange={(e) => setUnitForm({ ...unitForm, unit_symbol: e.target.value })} />
            <input
              placeholder="factor a base"
              type="number"
              value={unitForm.to_base_factor}
              onChange={(e) => setUnitForm({ ...unitForm, to_base_factor: Number(e.target.value) })}
            />
            <select value={unitForm.is_base ? "1" : "0"} onChange={(e) => setUnitForm({ ...unitForm, is_base: e.target.value === "1" })}>
              <option value="0">No base</option>
              <option value="1">Base</option>
            </select>
          </div>
          <div className="actions-row">
            <button className="btn primary" onClick={saveUnit} disabled={actionBusy || !unitForm.resource_id}>
              {actionBusy ? "Procesando..." : (unitForm.id ? "Guardar cambios" : "Crear unidad")}
            </button>
            <button className="btn ghost" onClick={() => setUnitForm(DEFAULT_UNIT_FORM)}>Limpiar</button>
            <input className="search" placeholder="Buscar unidades..." value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Unidad</th>
                  <th>Símbolo</th>
                  <th>Factor</th>
                  <th>Base</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((item) => {
                  const resource = resourcesInVersion.find((r) => r.id === item.resource_id);
                  return (
                    <tr key={item.id}>
                      <td>{resource?.name ?? "-"}</td>
                      <td>{item.unit_name}</td>
                      <td>{item.unit_symbol}</td>
                      <td>{item.to_base_factor}</td>
                      <td>{item.is_base ? "Sí" : "No"}</td>
                      <td className="right">
                        <button
                          className="mini"
                          onClick={() => {
                            setUnitForm({ ...item });
                            scrollToForm(unitFormRef);
                          }}
                        >
                          Editar
                        </button>
                        <button className="mini danger" onClick={() => void removeUnit(item.id)}>Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "equivalences" && (
        <section className="panel" ref={eqFormRef}>
          <h2>Equivalencias</h2>
          <div className="form-grid">
            <input placeholder="slug" value={eqForm.slug} onChange={(e) => setEqForm({ ...eqForm, slug: e.target.value })} />
            <input placeholder="título" value={eqForm.title} onChange={(e) => setEqForm({ ...eqForm, title: e.target.value })} />
            <input placeholder="unidad de salida" value={eqForm.output_unit} onChange={(e) => setEqForm({ ...eqForm, output_unit: e.target.value })} />
            <input
              placeholder="co2e_ton_per_unit"
              type="number"
              value={eqForm.co2e_ton_per_unit}
              onChange={(e) => setEqForm({ ...eqForm, co2e_ton_per_unit: Number(e.target.value) })}
            />
            <select
              value={eqForm.confidence ?? "medium"}
              onChange={(e) => setEqForm({ ...eqForm, confidence: e.target.value as "high" | "medium" | "low" })}
            >
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
            <input placeholder="fórmula" value={eqForm.formula} onChange={(e) => setEqForm({ ...eqForm, formula: e.target.value })} />
            <textarea placeholder="descripción" value={eqForm.description} onChange={(e) => setEqForm({ ...eqForm, description: e.target.value })} />
          </div>
          <div className="actions-row">
            <button className="btn primary" onClick={saveEquivalence} disabled={actionBusy}>
              {actionBusy ? "Procesando..." : (eqForm.id ? "Guardar cambios" : "Crear equivalencia")}
            </button>
            <button className="btn ghost" onClick={() => setEqForm(DEFAULT_EQ_FORM)}>Limpiar</button>
            <input className="search" placeholder="Buscar equivalencias..." value={eqSearch} onChange={(e) => setEqSearch(e.target.value)} />
          </div>

          <div className="linker">
            <h3>Vincular citas</h3>
            <div className="inline-form">
              <select value={selectedEq} onChange={(e) => setSelectedEq(e.target.value)}>
                <option value="">Selecciona equivalencia</option>
                {equivalencesInVersion.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.title}</option>
                ))}
              </select>
              <select value={selectedSourceForEq} onChange={(e) => setSelectedSourceForEq(e.target.value)}>
                <option value="">Selecciona fuente</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>{source.organization} ({source.year})</option>
                ))}
              </select>
              <button className="btn" onClick={linkSourceToEquivalence} disabled={actionBusy}>
                {actionBusy ? "Vinculando..." : "Vincular"}
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Slug</th>
                  <th>Unidad</th>
                  <th>Factor</th>
                  <th>Citas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredEquivalences.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.slug}</td>
                    <td>{item.output_unit}</td>
                    <td>{item.co2e_ton_per_unit}</td>
                    <td>
                      <div className="chips">
                        {equivalenceSources
                          .filter((link) => link.equivalence_id === item.id)
                          .map((link) => {
                            const source = sources.find((s) => s.id === link.source_id);
                            if (!source) return null;
                            return (
                              <button
                                key={`${link.equivalence_id}-${link.source_id}`}
                                className="chip"
                                onClick={() => void unlinkSourceFromEquivalence(link.equivalence_id, link.source_id)}
                                title="Quitar vínculo"
                              >
                                {source.organization} {source.year} ×
                              </button>
                            );
                          })}
                      </div>
                    </td>
                    <td className="right">
                      <button
                        className="mini"
                        onClick={() => {
                          setEqForm({ ...item });
                          scrollToForm(eqFormRef);
                        }}
                      >
                        Editar
                      </button>
                      <button className="mini danger" onClick={() => void removeEquivalence(item.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "sources" && (
        <section className="panel" ref={sourceFormRef}>
          <h2>Fuentes científicas</h2>
          <div className="form-grid">
            <input placeholder="key" value={sourceForm.key} onChange={(e) => setSourceForm({ ...sourceForm, key: e.target.value })} />
            <input placeholder="autor" value={sourceForm.author} onChange={(e) => setSourceForm({ ...sourceForm, author: e.target.value })} />
            <input placeholder="organización" value={sourceForm.organization} onChange={(e) => setSourceForm({ ...sourceForm, organization: e.target.value })} />
            <input placeholder="título" value={sourceForm.title} onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })} />
            <input placeholder="año" type="number" value={sourceForm.year} onChange={(e) => setSourceForm({ ...sourceForm, year: Number(e.target.value) })} />
            <input placeholder="url" value={sourceForm.url ?? ""} onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })} />
            <input placeholder="doi" value={sourceForm.doi ?? ""} onChange={(e) => setSourceForm({ ...sourceForm, doi: e.target.value })} />
            <textarea placeholder="notas" value={sourceForm.notes ?? ""} onChange={(e) => setSourceForm({ ...sourceForm, notes: e.target.value })} />
          </div>
          <div className="actions-row">
            <button className="btn primary" onClick={saveSource} disabled={actionBusy}>
              {actionBusy ? "Procesando..." : (sourceForm.id ? "Guardar cambios" : "Crear fuente")}
            </button>
            <button className="btn ghost" onClick={() => setSourceForm(DEFAULT_SOURCE_FORM)}>Limpiar</button>
            <input className="search" placeholder="Buscar fuentes..." value={sourceSearch} onChange={(e) => setSourceSearch(e.target.value)} />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Organización</th>
                  <th>Título</th>
                  <th>Año</th>
                  <th>URL/DOI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map((item) => (
                  <tr key={item.id}>
                    <td>{item.key}</td>
                    <td>{item.organization}</td>
                    <td>{item.title}</td>
                    <td>{item.year}</td>
                    <td>{item.url ?? item.doi ?? "-"}</td>
                    <td className="right">
                      <button
                        className="mini"
                        onClick={() => {
                          setSourceForm({ ...item });
                          scrollToForm(sourceFormRef);
                        }}
                      >
                        Editar
                      </button>
                      <button className="mini danger" onClick={() => void removeSource(item.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "users" && (
        <section className="panel">
          <h2>Usuarios y roles</h2>
          <div className="actions-row">
            <div className="inline-form" onKeyDown={handleUserCreateKeyDown}>
              <input placeholder="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
              <input
                placeholder="contraseña temporal"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as AppRole)}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <select value={newUserPlan} onChange={(e) => setNewUserPlan(e.target.value as AppPlan)}>
                <option value="free">free</option>
                <option value="pro">pro</option>
                <option value="enterprise">enterprise</option>
              </select>
              <button className="btn" disabled={userActionLoading} onClick={createUser}>
                {userActionLoading ? "Creando..." : "Crear usuario"}
              </button>
            </div>
            <input className="search" placeholder="Buscar usuario..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          </div>
          <div className="actions-row">
            <div className="inline-form">
              <select value={selectedUserForEntitlement} onChange={(e) => setSelectedUserForEntitlement(e.target.value)}>
                <option value="">Usuario para entitlement</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.email ?? profile.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              <input placeholder="key (ej: max_results)" value={entitlementKey} onChange={(e) => setEntitlementKey(e.target.value)} />
              <input placeholder="value (ej: 25)" value={entitlementValue} onChange={(e) => setEntitlementValue(e.target.value)} />
              <button className="btn ghost" onClick={addEntitlement} disabled={actionBusy}>
                {actionBusy ? "Guardando..." : "Guardar entitlement"}
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Plan</th>
                  <th>Entitlements</th>
                  <th>Creado</th>
                  <th>Actualizado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>{profile.email ?? "(sin email)"}</td>
                    <td>
                      <select value={profile.role} onChange={(e) => void updateUserRole(profile.id, e.target.value as AppRole)}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <select value={profile.plan} onChange={(e) => void updateUserPlan(profile.id, e.target.value as AppPlan)}>
                        <option value="free">free</option>
                        <option value="pro">pro</option>
                        <option value="enterprise">enterprise</option>
                      </select>
                    </td>
                    <td>
                      <div className="chips">
                        {entitlements
                          .filter((ent) => ent.user_id === profile.id)
                          .map((ent) => (
                            <button
                              key={ent.id}
                              className="chip"
                              title="Quitar entitlement"
                              onClick={() => void removeEntitlement(ent.id)}
                            >
                              {ent.key}:{ent.value} ×
                            </button>
                          ))}
                        {entitlements.filter((ent) => ent.user_id === profile.id).length === 0 && (
                          <span className="muted">—</span>
                        )}
                      </div>
                    </td>
                    <td>{shortDate(profile.created_at)}</td>
                    <td>{shortDate(profile.updated_at)}</td>
                    <td className="right">
                      <button className="mini" disabled={userActionLoading} onClick={() => void resetUserPassword(profile.id)}>
                        Reset pass
                      </button>
                      <button className="mini" disabled={userActionLoading} onClick={() => void updateUserEmail(profile.id)}>
                        Cambiar email
                      </button>
                      <button className="mini danger" disabled={userActionLoading} onClick={() => void deleteUser(profile.id)}>
                        Eliminar
                      </button>
                      <span className="mini-tag">{profile.id.slice(0, 8)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "activity" && (
        <section className="panel">
          <h2>Actividad de auditoría</h2>
          <p className="muted">Registro de cambios sobre recursos, unidades, equivalencias y fuentes.</p>
          <div className="actions-row">
            <input
              className="search"
              placeholder="Buscar en actividad..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                  <th>Tabla</th>
                  <th>Actor</th>
                  <th>Fila</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLog.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{shortDate(item.created_at)}</td>
                    <td>{item.action}</td>
                    <td>{item.table_name}</td>
                    <td>{item.actor_id?.slice(0, 8) ?? "-"}</td>
                    <td>{item.row_id?.slice(0, 8) ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
          </div>
        </section>
      )}
    </main>
  );
}
