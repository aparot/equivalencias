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
type ResultCategory = "all" | "transportes" | "residuos" | "energia" | "agua" | "materiales" | "otros";

const PLAN_LIMITS: Record<AppPlan, number> = {
  free: 10,
  pro: 50,
  enterprise: 200
};

const RESOURCE_LIMITS: Record<AppPlan, number> = {
  free: 30,
  pro: 80,
  enterprise: 200
};

const GUEST_RESOURCE_LIMIT = 10;
const GUEST_EQ_LIMIT = 3;
const GUEST_RESOURCE_TARGETS: Array<{ label: string; slugs: string[]; fallbackContains?: string[] }> = [
  { label: "Vidrio", slugs: ["vidrio"] },
  { label: "Tetrapak", slugs: ["tetrapak"] },
  { label: "Mezcla de plásticos", slugs: ["mezcla-de-plasticos"] },
  {
    label: "Papel",
    slugs: ["papel-mezclado-general", "papel-mezclado-residencial", "papel-mezclado-oficinas", "papel-de-oficina"],
    fallbackContains: ["papel"]
  },
  { label: "Neumáticos", slugs: ["neumaticos"] },
  { label: "Latas de aluminio", slugs: ["latas-de-aluminio"] },
  { label: "Plástico PET", slugs: ["pet"] },
  { label: "Plástico PP", slugs: ["pp"] },
  { label: "Plástico HDPE", slugs: ["hdpe"] },
  {
    label: "Orgánicos",
    slugs: ["residuos-de-alimentos", "mezcla-organica"],
    fallbackContains: ["organic", "organico", "orgánico"]
  }
];

const RESULT_CATEGORY_LABELS: Record<Exclude<ResultCategory, "all">, string> = {
  transportes: "Transportes",
  residuos: "Residuos",
  energia: "Energía",
  agua: "Agua",
  materiales: "Materiales",
  otros: "Otros"
};

const RESULT_CATEGORY_KEYWORDS: Record<Exclude<ResultCategory, "all">, string[]> = {
  transportes: ["auto", "coche", "vehiculo", "camion", "bus", "vuelo", "avion", "km", "transporte", "metro"],
  residuos: ["residuo", "basura", "vertedero", "recicl", "relleno sanitario", "desecho"],
  energia: ["energia", "electric", "kwh", "diesel", "gasolina", "combustible", "gas", "carbon", "petroleo"],
  agua: ["agua", "ducha", "litro", "riego", "consumo hidrico", "h2o"],
  materiales: ["papel", "carton", "plastico", "vidrio", "acero", "aluminio", "madera", "material", "envase"],
  otros: []
};

function toDisplayName(identifier: string): string {
  const normalized = identifier.trim().toLowerCase();
  const base = normalized.includes("@") ? normalized.split("@")[0] : normalized;
  const safe = base.replace(/[._-]+/g, " ").trim() || "usuario";
  return safe.charAt(0).toUpperCase() + safe.slice(1);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectResultCategory(item: CalculationResult): Exclude<ResultCategory, "all"> {
  const haystack = normalizeText(`${item.title} ${item.description} ${item.outputUnit}`);
  for (const [category, keywords] of Object.entries(RESULT_CATEGORY_KEYWORDS)) {
    if (keywords.some((word) => haystack.includes(word))) {
      return category as Exclude<ResultCategory, "all">;
    }
  }
  return "otros";
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
  const [resultSearch, setResultSearch] = useState("");
  const [resultCategory, setResultCategory] = useState<ResultCategory>("all");
  const [showAuthPanel, setShowAuthPanel] = useState(false);
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

  const isGuest = !profileName;
  const resourceLimit = isGuest ? GUEST_RESOURCE_LIMIT : RESOURCE_LIMITS[profilePlan];
  const equivalenceLimit = isGuest ? GUEST_EQ_LIMIT : PLAN_LIMITS[profilePlan];
  const availableResources = useMemo(() => {
    if (!isGuest) return resources.slice(0, resourceLimit);
    const taken = new Set<string>();
    const selected: ResourceWithUnits[] = [];

    for (const target of GUEST_RESOURCE_TARGETS) {
      let found = resources.find((resource) => target.slugs.includes(resource.slug) && !taken.has(resource.id));
      if (!found && target.fallbackContains?.length) {
        found = resources.find((resource) => {
          const haystack = normalizeText(`${resource.name} ${resource.slug}`);
          return target.fallbackContains?.some((token) => haystack.includes(normalizeText(token))) && !taken.has(resource.id);
        });
      }
      if (found) {
        selected.push(found);
        taken.add(found.id);
      }
    }

    if (selected.length < resourceLimit) {
      for (const resource of resources) {
        if (taken.has(resource.id)) continue;
        selected.push(resource);
        taken.add(resource.id);
        if (selected.length >= resourceLimit) break;
      }
    }

    return selected.slice(0, resourceLimit);
  }, [isGuest, resourceLimit, resources]);
  const currentResource = useMemo(
    () => availableResources.find((resource) => resource.id === resourceId) ?? availableResources[0],
    [resourceId, availableResources]
  );
  const filteredResources = useMemo(() => {
    const query = resourceFilter.trim().toLowerCase();
    if (!query) return availableResources;
    return availableResources.filter((resource) => `${resource.name} ${resource.slug}`.toLowerCase().includes(query));
  }, [resourceFilter, availableResources]);

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
  const categorizedResults = useMemo(
    () => results.map((item) => ({ ...item, category: detectResultCategory(item) })),
    [results]
  );
  const filteredResults = useMemo(() => {
    const query = normalizeText(resultSearch.trim());
    return categorizedResults.filter((item) => {
      if (resultCategory !== "all" && item.category !== resultCategory) return false;
      if (!query) return true;
      const text = normalizeText(`${item.title} ${item.description} ${item.outputUnit}`);
      return text.includes(query);
    });
  }, [categorizedResults, resultCategory, resultSearch]);
  const categoryCounts = useMemo(() => {
    const base: Record<ResultCategory, number> = {
      all: categorizedResults.length,
      transportes: 0,
      residuos: 0,
      energia: 0,
      agua: 0,
      materiales: 0,
      otros: 0
    };
    for (const item of categorizedResults) {
      base[item.category] += 1;
    }
    return base;
  }, [categorizedResults]);

  useEffect(() => {
    if (availableResources.length === 0) {
      setResourceId("");
      setUnitSymbol("");
      return;
    }
    const selected = availableResources.find((resource) => resource.id === resourceId);
    if (!selected) {
      const next = availableResources[0];
      setResourceId(next.id);
      const nextUnit = next.units?.find((unit) => unit.symbol.toLowerCase() === "kg") ?? next.units?.[0];
      setUnitSymbol(nextUnit?.symbol ?? "");
      return;
    }
    if (!selected.units.some((unit) => unit.symbol === unitSymbol)) {
      const nextUnit = selected.units?.find((unit) => unit.symbol.toLowerCase() === "kg") ?? selected.units?.[0];
      setUnitSymbol(nextUnit?.symbol ?? "");
    }
  }, [availableResources, resourceId, unitSymbol]);

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
    const nextResults = calculateEquivalences(
      { resource: currentResource, unit: currentUnit, quantity: parsed.value },
      equivalences,
      equivalenceLimit
    );
    setResults(nextResults);
    setResultCategory("all");
    setResultSearch("");
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
          <h1>{profileName ? `Hola, ${profileName}` : "Calcula tu impacto ahora"}</h1>
          <p className="muted">
            {profileName
              ? "Convierte emisiones en equivalencias claras."
              : "Modo invitado: 10 recursos y 3 ecoequivalencias por cálculo."}
          </p>
        </div>
        {profileName ? (
          <button className="btn ghost" onClick={signOut}>Cerrar sesión</button>
        ) : (
          <div className="auth-actions">
            <button
              className="btn ghost"
              onClick={() => {
                setAuthMode("login");
                setShowAuthPanel(true);
              }}
            >
              Ingresar
            </button>
            <button
              className="btn primary"
              onClick={() => {
                setAuthMode("signup");
                setShowAuthPanel(true);
              }}
            >
              Registrarme
            </button>
          </div>
        )}
      </header>

      {isGuest && (
        <section className="upgrade-banner">
          <p>
            Estás en modo invitado: puedes calcular con <strong>10 recursos</strong> y ver
            <strong> 3 ecoequivalencias</strong>. Inicia sesión o regístrate para desbloquear
            <strong> 30 recursos</strong> y más resultados.
          </p>
          <div className="upgrade-actions">
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setAuthMode("login");
                setShowAuthPanel(true);
              }}
            >
              Ingresar
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setShowAuthPanel(true);
              }}
            >
              Crear cuenta
            </button>
          </div>
        </section>
      )}

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
        <p className="muted">
          Recursos visibles: <strong>{availableResources.length}</strong> de {resources.length}.{" "}
          {isGuest ? "Regístrate para desbloquear más." : "Nivel actual activo."}
        </p>
      </section>

      <section className="portal-card portal-card--results">
        <h2>Resultados</h2>
        {results.length === 0 ? (
          <p className="muted">Ingresa una cantidad y presiona “Calcular equivalencias”.</p>
        ) : (
          <>
            <div className="result-toolbar">
              <div className="result-categories" role="tablist" aria-label="Filtrar resultados por categoría">
                <button
                  type="button"
                  className={`result-chip ${resultCategory === "all" ? "active" : ""}`}
                  onClick={() => setResultCategory("all")}
                >
                  Todas ({categoryCounts.all})
                </button>
                {(Object.keys(RESULT_CATEGORY_LABELS) as Array<Exclude<ResultCategory, "all">>).map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`result-chip ${resultCategory === category ? "active" : ""}`}
                    onClick={() => setResultCategory(category)}
                  >
                    {RESULT_CATEGORY_LABELS[category]} ({categoryCounts[category]})
                  </button>
                ))}
              </div>
              <input
                className="input result-search"
                placeholder="Buscar equivalencia..."
                value={resultSearch}
                onChange={(event) => setResultSearch(event.target.value)}
              />
            </div>
            <div className="result-list">
              {filteredResults.map((item) => (
                <div key={item.equivalenceId} className="result-card">
                  <h3>{item.title}</h3>
                  <p className="result-value">{item.value.toFixed(2)} {item.outputUnit}</p>
                  <p className="equiv-desc">{item.description}</p>
                </div>
              ))}
            </div>
            {filteredResults.length === 0 && (
              <p className="muted">No hay resultados para ese filtro.</p>
            )}
          </>
        )}
      </section>

      {isGuest && showAuthPanel && (
        <div className="auth-modal-backdrop" onClick={() => setShowAuthPanel(false)}>
          <section className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <h2>{authMode === "login" ? "Inicia sesión para desbloquear más" : "Crea tu cuenta para desbloquear más"}</h2>
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
              <div className="auth-actions">
                <button className="btn primary" type="submit" disabled={authLoading}>
                  {authLoading ? "Procesando..." : authMode === "login" ? "Ingresar" : "Crear cuenta"}
                </button>
                <button className="btn ghost" type="button" onClick={() => setShowAuthPanel(false)}>
                  Cerrar
                </button>
              </div>
            </form>
            {authNotice && <p className="alert">{authNotice}</p>}
          </section>
        </div>
      )}

    </main>
  );
}
