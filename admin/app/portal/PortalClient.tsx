"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  calculateEquivalences,
  type CalculationResult,
  type Equivalence,
  type Resource,
  type Unit,
  validateQuantity
} from "@ecoequivalencias/shared";

type ResourceWithUnits = Resource & { units: Unit[] };
type AppRole = "admin" | "user";
type AppPlan = "free" | "pro" | "enterprise";

const PLAN_LIMITS: Record<AppPlan, number> = {
  free: 10,
  pro: 50,
  enterprise: 200
};

function toDisplayName(identifier: string): string {
  const normalized = identifier.trim().toLowerCase();
  const base = normalized.includes("@") ? normalized.split("@")[0] : normalized;
  const safe = base.replace(/[._-]+/g, " ").trim() || "usuario";
  return safe.charAt(0).toUpperCase() + safe.slice(1);
}

export default function PortalClient() {
  const [resources, setResources] = useState<ResourceWithUnits[]>([]);
  const [equivalences, setEquivalences] = useState<Equivalence[]>([]);
  const [resourceId, setResourceId] = useState("");
  const [resourceOpen, setResourceOpen] = useState(false);
  const [resourceFilter, setResourceFilter] = useState("");
  const [unitSymbol, setUnitSymbol] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<AppRole>("user");
  const [profilePlan, setProfilePlan] = useState<AppPlan>("free");

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
    }
    void bootstrap();
  }, []);

  const currentResource = useMemo(
    () => resources.find((resource) => resource.id === resourceId) ?? resources[0],
    [resourceId, resources]
  );
  const filteredResources = useMemo(() => {
    const query = resourceFilter.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter((resource) => `${resource.name} ${resource.slug}`.toLowerCase().includes(query));
  }, [resourceFilter, resources]);

  const currentUnits = useMemo(() => {
    const units = currentResource?.units ?? [];
    const seen = new Set<string>();
    return units.filter((unit) => {
      const key = `${unit.symbol}::${unit.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [currentResource]);

  const currentUnit = currentUnits.find((unit) => unit.symbol === unitSymbol) ?? currentUnits[0];

  async function bootstrap() {
    await loadPublishedDataset();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user.id) {
      await loadProfile(session.user.id, session.user.email);
    }
  }

  async function loadProfile(userId: string, fallbackEmail?: string | null) {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("email, role, plan")
      .eq("id", userId)
      .single();
    const finalEmail = data?.email ?? fallbackEmail ?? email;
    if (finalEmail) {
      setProfileName(toDisplayName(finalEmail));
      setEmail(finalEmail);
    }
    if (data?.role) setProfileRole(data.role as AppRole);
    if (data?.plan) setProfilePlan(data.plan as AppPlan);
  }

  async function loadPublishedDataset() {
    if (!supabase) return;
    const [resourceResult, eqResult] = await Promise.all([
      supabase.from("published_resources_with_units").select("*").order("name", { ascending: true }),
      supabase.from("published_equivalences_with_sources").select("*").order("title", { ascending: true })
    ]);

    if (resourceResult.error || eqResult.error || !resourceResult.data || !eqResult.data) {
      return;
    }

    const normalizedResources: ResourceWithUnits[] = resourceResult.data.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      baseUnit: item.base_unit,
      factorKgCo2ePerBaseUnit: Number(item.factor_kgco2e_per_base_unit),
      version: "published",
      validFrom: "2026-01-01",
      citations: item.citations ?? [],
      units: item.units ?? []
    }));

    const normalizedEquivalences: Equivalence[] = eqResult.data.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      outputUnit: item.output_unit,
      description: item.description,
      confidence: item.confidence,
      co2eTonPerUnit: Number(item.co2e_ton_per_unit),
      formula: item.formula,
      version: "published",
      validFrom: "2026-01-01",
      citations: item.citations ?? [],
      isDemo: Boolean(item.is_demo)
    }));

    setResources(normalizedResources);
    setEquivalences(normalizedEquivalences);
    const preferred = normalizedResources.find((item) => {
      const name = item.name.toLowerCase();
      return name.includes("papel mezclado") || name.includes("papel mixto");
    });
    const initialResource = preferred ?? normalizedResources[0];
    setResourceId(initialResource?.id ?? "");
    const preferredUnit =
      initialResource?.units?.find((unit) => unit.symbol.toLowerCase() === "kg") ??
      initialResource?.units?.[0];
    setUnitSymbol(preferredUnit?.symbol ?? "");
  }

  async function signIn() {
    if (!supabase || authLoading) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthNotice(error.message);
      setAuthLoading(false);
      return;
    }
    setAuthNotice(null);
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user.id) {
      await loadProfile(session.user.id, session.user.email);
    }
    setAuthLoading(false);
  }

  async function signUp() {
    if (!supabase || authLoading) return;
    if (password.length < 8) {
      setAuthNotice("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthNotice("Las contraseñas no coinciden.");
      return;
    }
    setAuthLoading(true);
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthNotice(error.message);
      setAuthLoading(false);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    if (data.session?.user?.id) {
      await loadProfile(data.session.user.id, data.session.user.email);
    } else {
      setAuthNotice("Cuenta creada. Revisa tu correo para confirmar el registro.");
    }
    setAuthLoading(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfileName(null);
    setProfileRole("user");
    setProfilePlan("free");
    setPassword("");
  }

  function handleCalculate() {
    if (!currentResource || !currentUnit) return;
    const parsed = validateQuantity(quantity);
    if (!parsed.valid || !parsed.value) {
      setAuthNotice(parsed.error ?? "Cantidad inválida");
      return;
    }
    const maxResults = PLAN_LIMITS[profilePlan];
    const nextResults = calculateEquivalences(
      { resource: currentResource, unit: currentUnit, quantity: parsed.value },
      equivalences,
      maxResults
    );
    setResults(nextResults);
  }

  if (!profileName) {
    return (
      <main className="portal-root">
        <section className="portal-card">
          <p className="eyebrow">EcoEquivalencias</p>
          <h1>Ingresa para calcular tu impacto</h1>
          <p className="muted">Accede con tu cuenta para transformar emisiones en equivalencias claras.</p>
          <div className="portal-toggle">
            <button
              className={authMode === "login" ? "toggle active" : "toggle"}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Ingresar
            </button>
            <button
              className={authMode === "signup" ? "toggle active" : "toggle"}
              onClick={() => setAuthMode("signup")}
              type="button"
            >
              Registrarme
            </button>
          </div>
          <form
            className="portal-form portal-form--auth"
            onSubmit={(event) => {
              event.preventDefault();
              if (authMode === "login") {
                void signIn();
              } else {
                void signUp();
              }
            }}
          >
            <div className="portal-grid" style={{ gridTemplateColumns: "1fr" }}>
              <input
                className="input"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                className="input"
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {authMode === "signup" && (
                <input
                  className="input"
                  placeholder="Confirmar contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              )}
            </div>
            <button className="btn primary" type="submit" disabled={authLoading}>
              {authLoading ? "Procesando..." : authMode === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>
          {authNotice && <p className="alert">{authNotice}</p>}
        </section>
      </main>
    );
  }

  if (profileRole === "admin") {
    if (typeof window !== "undefined") {
      window.location.replace("/admin");
    }
    return null;
  }

  return (
    <main className="portal-root">
      <header className="portal-header">
        <div>
          <p className="eyebrow">EcoEquivalencias</p>
          <h1>Hola, {profileName}</h1>
          <p className="muted">Convierte emisiones en equivalencias claras.</p>
        </div>
        <button className="btn ghost" onClick={signOut}>Cerrar sesión</button>
      </header>

      <section className="portal-card">
        <form
          className="portal-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleCalculate();
          }}
        >
          <div className="portal-grid">
            <label className="field">
              Cantidad
              <input
                className="input"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Ingresa una cantidad"
              />
            </label>
            <label className="field">
              Recurso
              <div className="combo">
                <button
                  className="combo-trigger"
                  type="button"
                  onClick={() => {
                    setResourceOpen((prev) => !prev);
                    setResourceFilter("");
                  }}
                >
                  <span>{currentResource?.name ?? "Selecciona un recurso"}</span>
                  <span className="combo-caret">▾</span>
                </button>
                {resourceOpen && (
                  <div className="combo-panel">
                    <input
                      className="combo-search"
                      placeholder="Buscar recurso..."
                      value={resourceFilter}
                      onChange={(event) => setResourceFilter(event.target.value)}
                    />
                    <div className="combo-list">
                      {filteredResources.map((resource) => (
                        <button
                          key={resource.id}
                          type="button"
                          className="combo-item"
                          onClick={() => {
                            setResourceId(resource.id);
                            setUnitSymbol(resource.units?.[0]?.symbol ?? "");
                            setResourceOpen(false);
                          }}
                        >
                          {resource.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </label>
            <label className="field">
              Unidad
              <select className="input" value={unitSymbol} onChange={(event) => setUnitSymbol(event.target.value)}>
                {currentUnits.map((unit) => (
                  <option key={unit.id} value={unit.symbol}>{unit.name}</option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn primary" type="submit">Calcular equivalencias</button>
        </form>
      </section>

      <section className="portal-card">
        <h2>Resultados</h2>
        {results.length === 0 ? (
          <p className="muted">Ingresa una cantidad y presiona “Calcular equivalencias”.</p>
        ) : (
          <div className="result-list">
            {results.map((item) => (
              <div key={item.equivalenceId} className="result-card">
                <h3>{item.title}</h3>
                <p className="result-value">{item.value.toFixed(2)} {item.outputUnit}</p>
                <p className="equiv-desc">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
