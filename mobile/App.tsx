import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  calculateEquivalences,
  toCsv,
  toSimpleHtmlReport,
  type CalculationResult,
  type Equivalence,
  type Resource,
  type Unit,
  validateQuantity
} from "@ecoequivalencias/shared";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { demoEquivalences, demoResources } from "./src/demoData";
import { supabase } from "./src/supabase";

type ResourceWithUnits = Resource & { units: Unit[] };

type HistoryItem = {
  id: string;
  label: string;
  createdAt: string;
};

type AppRole = "admin" | "user";
type AppPlan = "free" | "pro" | "enterprise";
type Entitlements = Record<string, string>;

const HISTORY_KEY = "ecoequivalencias.history.v1";
const CACHE_KEY = "ecoequivalencias.dataset.v1";
const LAST_QUERY_KEY = "ecoequivalencias.last-query.v1";
const ADMIN_URL = process.env.EXPO_PUBLIC_ADMIN_URL ?? "http://localhost:3000";
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

function isRecyclingResourceName(name: string): boolean {
  const value = name.toLowerCase();
  if (value.includes("energia ahorrada")) {
    return false;
  }
  if (value.includes("agua ahorrada")) {
    return false;
  }
  if (value.includes("arbol")) {
    return false;
  }
  return true;
}

function dedupeResources(resources: ResourceWithUnits[]): ResourceWithUnits[] {
  const map = new Map<string, ResourceWithUnits>();
  for (const item of resources) {
    const key = item.slug || item.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

function formatResultValue(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const abs = Math.abs(value);
  if (abs === 0) {
    return "0";
  }
  if (abs < 0.01) {
    return "<0.01";
  }
  if (abs >= 1000) {
    return value.toLocaleString("es-CL", { maximumFractionDigits: 0 });
  }
  if (abs >= 100) {
    return value.toLocaleString("es-CL", { maximumFractionDigits: 1 });
  }
  return value.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function App(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;

  const [resources, setResources] = useState<ResourceWithUnits[]>(demoResources);
  const [equivalences, setEquivalences] = useState<Equivalence[]>(demoEquivalences);
  const [resourceId, setResourceId] = useState(demoResources[0].id);
  const [unitSymbol, setUnitSymbol] = useState(demoResources[0].units[0].symbol);
  const [quantity, setQuantity] = useState("6");
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<AppRole>("user");
  const [profilePlan, setProfilePlan] = useState<AppPlan>("free");
  const [entitlements, setEntitlements] = useState<Entitlements>({});
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [isResourceMenuOpen, setIsResourceMenuOpen] = useState(false);
  const [isUnitMenuOpen, setIsUnitMenuOpen] = useState(false);
  const [resourceSearch, setResourceSearch] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const hasAnyOverlayOpen = isUserMenuOpen || isResourceMenuOpen || isUnitMenuOpen;

  useEffect(() => {
    void bootstrap();
  }, []);

  const currentResource = useMemo(
    () => resources.find((resource) => resource.id === resourceId) ?? resources[0],
    [resourceId, resources]
  );

  const currentUnits = currentResource?.units ?? [];
  const currentUnit = currentUnits.find((unit) => unit.symbol === unitSymbol) ?? currentUnits[0];
  const isGuest = profileName === "Invitado";
  const filteredResourceOptions = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();
    const base = resources.filter((item) => isRecyclingResourceName(item.name));
    if (!query) {
      return base;
    }
    return base.filter((item) => item.name.toLowerCase().includes(query));
  }, [resourceSearch, resources]);

  async function bootstrap() {
    const [cachedDataset, savedHistory] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(HISTORY_KEY)
    ]);
    const lastQuery = await AsyncStorage.getItem(LAST_QUERY_KEY);

    if (cachedDataset) {
      const parsed = JSON.parse(cachedDataset) as { resources: ResourceWithUnits[]; equivalences: Equivalence[] };
      const cachedRecycling = parsed.resources.filter((item) => isRecyclingResourceName(item.name));
      const mergedCached = dedupeResources([...cachedRecycling, ...demoResources.filter((item) => isRecyclingResourceName(item.name))]);
      setResources(mergedCached);
      setEquivalences(parsed.equivalences);
      setResourceId(mergedCached[0]?.id ?? resourceId);
      setUnitSymbol(mergedCached[0]?.units[0]?.symbol ?? unitSymbol);
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory) as HistoryItem[]);
    }

    if (lastQuery) {
      const parsed = JSON.parse(lastQuery) as {
        resourceId: string;
        unitSymbol: string;
        quantity: string;
        results: CalculationResult[];
      };
      setResourceId(parsed.resourceId);
      setUnitSymbol(parsed.unitSymbol);
      setQuantity(parsed.quantity);
      setResults(parsed.results);
    }

    await loadPublishedDataset();

    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const sessionEmail = session?.user.email;
      if (session?.user.id) {
        await loadProfile(session.user.id, sessionEmail);
      } else if (sessionEmail) {
        setProfileName(toDisplayName(sessionEmail));
        setEmail(sessionEmail);
      }
    }
  }

  async function loadProfile(userId: string, fallbackEmail?: string | null) {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("email, role, plan")
      .eq("id", userId)
      .single();
    if (error) return;
    const finalEmail = data?.email ?? fallbackEmail ?? email;
    if (finalEmail) {
      setProfileName(toDisplayName(finalEmail));
      setEmail(finalEmail);
    }
    if (data?.role) setProfileRole(data.role as AppRole);
    if (data?.plan) setProfilePlan(data.plan as AppPlan);
    if (data?.role === "admin") {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = ADMIN_URL;
      } else {
        Alert.alert("Admin", `Este usuario es admin. Abre el panel en ${ADMIN_URL}`);
      }
    }
    const { data: entRows } = await supabase
      .from("user_entitlements")
      .select("key,value")
      .eq("user_id", userId);
    const nextEntitlements: Entitlements = {};
    (entRows ?? []).forEach((row) => {
      nextEntitlements[row.key] = row.value;
    });
    setEntitlements(nextEntitlements);
  }

  async function loadPublishedDataset() {
    if (!supabase) {
      return;
    }

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
    const publishedRecycling = normalizedResources.filter((item) => isRecyclingResourceName(item.name));
    const demoRecycling = demoResources.filter((item) => isRecyclingResourceName(item.name));
    const mergedResources = dedupeResources([...publishedRecycling, ...demoRecycling]);

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

    setResources(mergedResources);
    setEquivalences(normalizedEquivalences);
    setResourceId(mergedResources[0]?.id ?? resourceId);
    setUnitSymbol(mergedResources[0]?.units[0]?.symbol ?? unitSymbol);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ resources: mergedResources, equivalences: normalizedEquivalences })
    );
  }

  function handleCalculate() {
    if (!currentResource || !currentUnit) {
      return;
    }

    const parsed = validateQuantity(quantity);
    if (!parsed.valid || !parsed.value) {
      Alert.alert("Validacion", parsed.error ?? "Cantidad invalida");
      return;
    }

    const entitlementMax = entitlements.max_results ? Number(entitlements.max_results) : null;
    const maxResults = Number.isFinite(entitlementMax ?? NaN)
      ? Math.max(1, Number(entitlementMax))
      : PLAN_LIMITS[profilePlan];

    const nextResults = calculateEquivalences(
      {
        resource: currentResource,
        unit: currentUnit,
        quantity: parsed.value
      },
      equivalences,
      maxResults
    );

    setResults(nextResults);
    void AsyncStorage.setItem(
      LAST_QUERY_KEY,
      JSON.stringify({
        resourceId,
        unitSymbol,
        quantity,
        results: nextResults
      })
    );
    void addToHistory(`${parsed.value} ${currentUnit.symbol} de ${currentResource.name}`);
  }

  async function addToHistory(label: string) {
    const next: HistoryItem[] = [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, label, createdAt: new Date().toISOString() },
      ...history
    ].slice(0, 20);
    setHistory(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  async function exportCsv() {
    if (results.length === 0) {
      Alert.alert("EcoEquivalencias", "Primero realiza un calculo.");
      return;
    }

    const csv = toCsv(results);
    const fileUri = `${FileSystem.cacheDirectory}ecoequivalencias-resultados.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri);
  }

  async function exportPdf() {
    if (results.length === 0) {
      Alert.alert("EcoEquivalencias", "Primero realiza un calculo.");
      return;
    }

    const label = `${quantity} ${currentUnit?.symbol ?? ""} de ${currentResource?.name ?? ""}`;
    const html = toSimpleHtmlReport(label, results);
    const file = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(file.uri);
  }

  async function signIn() {
    if (!supabase) {
      Alert.alert("Auth", "Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    if (authLoading) return;
    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Auth", error.message);
      setAuthLoading(false);
      return;
    }
    setAuthNotice(null);
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user.id) {
      await loadProfile(session.user.id, session.user.email);
    } else {
      setProfileName(toDisplayName(email));
    }
    setAuthLoading(false);
  }

  function continueAsGuest() {
    setProfileName("Invitado");
    setProfileRole("user");
    setProfilePlan("free");
  }

  async function signUp() {
    if (!supabase) {
      Alert.alert("Auth", "Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    if (authLoading) return;
    if (password.length < 8) {
      Alert.alert("Auth", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Auth", "Las contraseñas no coinciden.");
      return;
    }
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert("Auth", error.message);
      setAuthLoading(false);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    if (data.session?.user?.id) {
      await loadProfile(data.session.user.id, data.session.user.email);
      setAuthNotice(null);
      setAuthLoading(false);
      return;
    }
    setAuthNotice("Cuenta creada. Revisa tu correo para confirmar el registro.");
    setAuthLoading(false);
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setProfileName(null);
    setProfileRole("user");
    setProfilePlan("free");
    setEntitlements({});
    setPassword("");
  }

  async function sendPasswordReset() {
    if (!supabase) {
      Alert.alert("Auth", "Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    const target = passwordResetEmail.trim();
    if (!target) {
      Alert.alert("Auth", "Ingresa tu email.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(target);
    if (error) {
      Alert.alert("Auth", error.message);
      return;
    }
    setAuthNotice("Te enviamos un correo para restablecer la contraseña.");
    setShowPasswordReset(false);
  }

  async function changePassword() {
    if (!supabase) return;
    if (newPassword.length < 8) {
      Alert.alert("Auth", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      Alert.alert("Auth", "Las contraseñas no coinciden.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert("Auth", error.message);
      return;
    }
    setNewPassword("");
    setNewPasswordConfirm("");
    setShowPasswordChange(false);
    Alert.alert("Auth", "Contraseña actualizada.");
  }

  function categoryFromResult(result: CalculationResult): string {
    const text = `${result.title} ${result.description}`.toLowerCase();
    if (text.includes("auto") || text.includes("vehic") || text.includes("km")) {
      return "Transporte";
    }
    if (text.includes("kwh") || text.includes("energia") || text.includes("electric")) {
      return "Energia";
    }
    if (text.includes("arbol") || text.includes("bosque") || text.includes("carbono")) {
      return "Naturaleza";
    }
    return "Otros";
  }

  const availableFilters = useMemo(() => {
    const categories = Array.from(new Set(results.map((item) => categoryFromResult(item))));
    return ["Todos", ...categories];
  }, [results]);

  const filteredResults = useMemo(() => {
    const byCategory =
      activeFilter === "Todos" ? results : results.filter((item) => categoryFromResult(item) === activeFilter);
    const query = filterSearch.trim().toLowerCase();
    const bySearch = !query
      ? byCategory
      : byCategory.filter((item) => {
      const text = `${item.title} ${item.description} ${item.outputUnit}`.toLowerCase();
      return text.includes(query);
    });
    return bySearch;
  }, [activeFilter, filterSearch, results]);

  if (!profileName) {
    return (
      <SafeAreaView style={styles.authSafe}>
        <ScrollView contentContainerStyle={styles.authContainer}>
          <View style={styles.authCard}>
            <Text style={styles.authBrand}>EcoEquivalencias</Text>
            <Text style={styles.authTitle}>Ingresa para calcular tu impacto</Text>
            <Text style={styles.authSubtitle}>Selecciona un recurso y transforma su impacto en equivalencias claras.</Text>
            <View style={styles.authToggleRow}>
              <Pressable
                style={[styles.authToggle, authMode === "login" && styles.authToggleActive]}
                onPress={() => setAuthMode("login")}
              >
                <Text style={[styles.authToggleText, authMode === "login" && styles.authToggleTextActive]}>Ingresar</Text>
              </Pressable>
              <Pressable
                style={[styles.authToggle, authMode === "signup" && styles.authToggleActive]}
                onPress={() => setAuthMode("signup")}
              >
                <Text style={[styles.authToggleText, authMode === "signup" && styles.authToggleTextActive]}>Registrarme</Text>
              </Pressable>
            </View>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.authInput}
              autoCapitalize="none"
              onSubmitEditing={() => (authMode === "login" ? signIn() : undefined)}
            />
            <TextInput
              placeholder="Contrasena"
              value={password}
              onChangeText={setPassword}
              style={styles.authInput}
              secureTextEntry
              onSubmitEditing={() => (authMode === "login" ? signIn() : undefined)}
            />
            {authMode === "signup" && (
              <TextInput
                placeholder="Confirmar contrasena"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.authInput}
                secureTextEntry
                onSubmitEditing={signUp}
              />
            )}
            <Pressable style={styles.primaryButton} onPress={authMode === "login" ? signIn : signUp} disabled={authLoading}>
              <Text style={styles.primaryButtonText}>
                {authLoading ? "Procesando..." : authMode === "login" ? "Ingresar" : "Crear cuenta"}
              </Text>
            </Pressable>
            {authNotice && <Text style={styles.authNotice}>{authNotice}</Text>}
            <Pressable style={styles.linkButton} onPress={() => setShowPasswordReset((prev) => !prev)}>
              <Text style={styles.linkButtonText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
            {showPasswordReset && (
              <View style={styles.resetCard}>
                <TextInput
                  placeholder="Email para recuperar"
                  value={passwordResetEmail}
                  onChangeText={setPasswordResetEmail}
                  style={styles.authInput}
                  autoCapitalize="none"
                  onSubmitEditing={sendPasswordReset}
                />
                <Pressable style={styles.ghostButton} onPress={sendPasswordReset}>
                  <Text style={styles.ghostButtonText}>Enviar correo</Text>
                </Pressable>
              </View>
            )}
            <Pressable style={styles.ghostButton} onPress={continueAsGuest}>
              <Text style={styles.ghostButtonText}>Continuar como invitado</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.dashboardSafe}>
      <ScrollView contentContainerStyle={styles.dashboardContainer} scrollEnabled={!hasAnyOverlayOpen}>
        <View style={styles.dashboardFrame}>
          <View style={styles.topBar}>
            <View style={styles.brandBox}>
              <Text style={styles.brandTitle}>EcoEquivalencias</Text>
              <Text style={styles.brandSubtitle}>Calculadora ambiental</Text>
            </View>
            <View style={styles.userMenuWrap}>
              <Pressable
                style={styles.userMenuTrigger}
                onPress={() => {
                  if (isGuest) {
                    return;
                  }
                  setIsUserMenuOpen((prev) => !prev);
                  setIsResourceMenuOpen(false);
                  setIsUnitMenuOpen(false);
                }}
              >
                <Text style={styles.userMenuTitle}>Hola, {profileName}</Text>
              </Pressable>
              {!isGuest && isUserMenuOpen && (
                <View style={styles.userMenuPanel}>
                  <Pressable style={styles.userMenuAction} onPress={() => setShowPasswordChange((prev) => !prev)}>
                    <Text style={styles.userMenuActionText}>Cambiar contrasena</Text>
                  </Pressable>
                  {showPasswordChange && (
                    <View style={styles.passwordCard}>
                      <TextInput
                        placeholder="Nueva contrasena"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={styles.authInput}
                        secureTextEntry
                        onSubmitEditing={changePassword}
                      />
                      <TextInput
                        placeholder="Confirmar contrasena"
                        value={newPasswordConfirm}
                        onChangeText={setNewPasswordConfirm}
                        style={styles.authInput}
                        secureTextEntry
                        onSubmitEditing={changePassword}
                      />
                      <Pressable style={styles.ghostButton} onPress={changePassword}>
                        <Text style={styles.ghostButtonText}>Actualizar</Text>
                      </Pressable>
                    </View>
                  )}
                  <Pressable style={styles.userMenuAction} onPress={signOut}>
                    <Text style={styles.userMenuActionText}>Cerrar sesion</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={styles.controlsCard}>
            <Text style={styles.fieldLabel}>Cantidad</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              style={styles.quantityInput}
              placeholder="Ingresa una cantidad"
              placeholderTextColor="#94a3b8"
            />

            <View style={[styles.selectRow, !isWide && styles.selectRowStack]}>
              <View style={styles.selectField}>
                <Text style={styles.fieldLabel}>Recurso</Text>
                <Pressable
                  style={styles.selectTrigger}
                  onPress={() => {
                    setIsResourceMenuOpen((prev) => !prev);
                    setIsUnitMenuOpen(false);
                    setIsUserMenuOpen(false);
                  }}
                >
                  <Text style={styles.selectTriggerText}>{currentResource?.name ?? "Selecciona un recurso"}</Text>
                  <Text style={styles.selectTriggerIcon}>{isResourceMenuOpen ? "▴" : "▾"}</Text>
                </Pressable>
                {isResourceMenuOpen && (
                  <View style={styles.searchDropdown}>
                    <TextInput
                      value={resourceSearch}
                      onChangeText={setResourceSearch}
                      placeholder="Buscar recurso..."
                      placeholderTextColor="#94a3b8"
                      style={styles.searchInput}
                      autoFocus
                    />
                    <ScrollView
                      style={styles.searchResults}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator
                    >
                      {filteredResourceOptions.map((resource) => (
                        <Pressable
                          key={resource.id}
                          style={[styles.searchResultItem, resource.id === resourceId && styles.searchResultItemActive]}
                          onPress={() => {
                            setResourceId(resource.id);
                            setUnitSymbol(resource.units[0]?.symbol ?? "");
                            setResourceSearch("");
                            setIsResourceMenuOpen(false);
                          }}
                        >
                          <Text style={[styles.searchResultText, resource.id === resourceId && styles.searchResultTextActive]}>
                            {resource.name}
                          </Text>
                        </Pressable>
                      ))}
                      {filteredResourceOptions.length === 0 && <Text style={styles.searchEmptyText}>Sin coincidencias</Text>}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.selectField}>
                <Text style={styles.fieldLabel}>Unidad</Text>
                <Pressable
                  style={styles.selectTrigger}
                  onPress={() => {
                    setIsUnitMenuOpen((prev) => !prev);
                    setIsResourceMenuOpen(false);
                    setIsUserMenuOpen(false);
                  }}
                >
                  <Text style={styles.selectTriggerText}>{currentUnit?.name ?? "Selecciona unidad"}</Text>
                  <Text style={styles.selectTriggerIcon}>{isUnitMenuOpen ? "▴" : "▾"}</Text>
                </Pressable>
                {isUnitMenuOpen && (
                  <View style={styles.searchDropdown}>
                    <ScrollView
                      style={styles.searchResults}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator
                    >
                      {currentUnits.map((unit) => (
                        <Pressable
                          key={unit.id}
                          style={[styles.searchResultItem, unit.symbol === unitSymbol && styles.searchResultItemActive]}
                          onPress={() => {
                            setUnitSymbol(unit.symbol);
                            setIsUnitMenuOpen(false);
                          }}
                        >
                          <Text style={[styles.searchResultText, unit.symbol === unitSymbol && styles.searchResultTextActive]}>
                            {unit.name}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.primaryAction} onPress={handleCalculate}>
                <Text style={styles.primaryActionText}>Calcular equivalencias</Text>
              </Pressable>
              <Pressable style={styles.secondaryAction} onPress={exportCsv}>
                <Text style={styles.secondaryActionText}>CSV</Text>
              </Pressable>
              <Pressable style={styles.secondaryAction} onPress={exportPdf}>
                <Text style={styles.secondaryActionText}>PDF</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filtersBar}>
            <Text style={styles.filtersTitle}>Filtros de equivalencias</Text>
            <TextInput
              value={filterSearch}
              onChangeText={setFilterSearch}
              placeholder='Buscar ecoequivalencia (ej: "gas")'
              placeholderTextColor="#94a3b8"
              style={styles.filterSearchInput}
            />
            <View style={styles.filtersPills}>
              {availableFilters.map((filter) => (
                <Pressable
                  key={filter}
                  style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterPillText, activeFilter === filter && styles.filterPillTextActive]}>{filter}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.resultsGrid}>
            {filteredResults.map((result) => (
              <View key={result.equivalenceId} style={[styles.resultCard, isWide ? styles.resultCardWide : styles.resultCardNarrow]}>
                <Text style={styles.resultTitle}>{result.title}</Text>
                <Text style={styles.resultValue}>{formatResultValue(result.value)} {result.outputUnit}</Text>
                <Text style={styles.resultDescription}>{result.description}</Text>
                {result.citations.slice(0, 1).map((source) => (
                  <Text key={source.id} style={styles.resultSource}>
                    Fuente: {source.organization} ({source.year})
                  </Text>
                ))}
              </View>
            ))}
            {filteredResults.length === 0 && (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>No hay resultados. Ingresa cantidad y presiona "Calcular equivalencias".</Text>
              </View>
            )}
          </View>

          <View style={styles.historyStrip}>
            {history.slice(0, 4).map((item) => (
              <Text key={item.id} style={styles.historyItem}>
                {item.label}
              </Text>
            ))}
            {history.length === 0 && <Text style={styles.historyItem}>Sin historial reciente.</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authSafe: { flex: 1, backgroundColor: "#eef2f6" },
  authContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  authCard: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#dce3ec"
  },
  authBrand: { fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: "#64748b" },
  authTitle: { fontSize: 28, fontWeight: "700", lineHeight: 34, color: "#0f172a" },
  authSubtitle: { fontSize: 14, color: "#64748b", marginBottom: 6 },
  authToggleRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  authToggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cfd8e3",
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#f8fbff"
  },
  authToggleActive: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  authToggleText: { color: "#0f172a", fontWeight: "600" },
  authToggleTextActive: { color: "#ffffff" },
  authInput: { borderWidth: 1, borderColor: "#cfd8e3", borderRadius: 12, padding: 12, backgroundColor: "#f8fbff", color: "#0f172a" },
  primaryButton: { backgroundColor: "#4d948a", borderRadius: 12, padding: 13, alignItems: "center", marginTop: 6 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  ghostButton: { borderWidth: 1, borderColor: "#cfd8e3", borderRadius: 12, padding: 13, alignItems: "center", backgroundColor: "#f8fbff" },
  ghostButtonText: { color: "#334155", fontWeight: "600" },
  authNotice: { fontSize: 13, color: "#0f766e", textAlign: "center" },
  linkButton: { alignItems: "center" },
  linkButtonText: { color: "#0f172a", fontWeight: "600" },
  resetCard: { gap: 10, paddingTop: 4 },
  passwordCard: { gap: 10, paddingVertical: 8 },

  dashboardSafe: { flex: 1, backgroundColor: "#eef2f6" },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20
  },
  dashboardContainer: { width: "100%", padding: 18 },
  dashboardFrame: { width: "100%", maxWidth: 1120, alignSelf: "center", gap: 14, zIndex: 30, overflow: "visible" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, position: "relative", zIndex: 5000 },
  brandBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#dce3ec"
  },
  brandTitle: { fontSize: 20, color: "#0f172a", fontWeight: "700" },
  brandSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  userMenuWrap: { width: 220, position: "relative", zIndex: 6000 },
  userMenuTrigger: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#dce3ec"
  },
  userMenuTitle: { textAlign: "center", color: "#0f172a", fontWeight: "600", fontSize: 16 },
  userMenuPanel: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#dce3ec",
    position: "absolute",
    top: 54,
    right: 0,
    width: "100%",
    zIndex: 7000,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 20
  },
  userMenuAction: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderColor: "#eef2f6" },
  userMenuActionText: { color: "#334155", fontSize: 14 },

  controlsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dce3ec",
    gap: 10,
    position: "relative",
    zIndex: 300,
    overflow: "visible"
  },
  fieldLabel: { fontSize: 13, color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#cfd8e3",
    borderRadius: 12,
    backgroundColor: "#f8fbff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "700"
  },
  selectRow: { flexDirection: "row", gap: 10, position: "relative", zIndex: 800 },
  selectRowStack: { flexDirection: "column" },
  selectField: { flex: 1, gap: 6, position: "relative", zIndex: 900 },
  selectTrigger: {
    borderWidth: 1,
    borderColor: "#cfd8e3",
    borderRadius: 12,
    backgroundColor: "#f8fbff",
    minHeight: 60,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  selectTriggerText: { color: "#0f172a", fontSize: 17, fontWeight: "600", flex: 1, paddingRight: 8 },
  selectTriggerIcon: { color: "#64748b", fontSize: 16, fontWeight: "700" },
  searchDropdown: {
    borderWidth: 1,
    borderColor: "#cfd8e3",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    position: "absolute",
    top: 88,
    left: 0,
    right: 0,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    maxHeight: 320
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a"
  },
  searchResults: { maxHeight: 260, flexGrow: 0 },
  searchResultItem: { paddingHorizontal: 12, paddingVertical: 10 },
  searchResultItemActive: { backgroundColor: "#e6fffb" },
  searchResultText: { color: "#0f172a", fontSize: 14 },
  searchResultTextActive: { color: "#0f766e", fontWeight: "700" },
  searchEmptyText: { paddingHorizontal: 12, paddingVertical: 12, color: "#64748b", fontSize: 13 },
  selectBoxTall: {
    borderWidth: 1,
    borderColor: "#cfd8e3",
    borderRadius: 12,
    backgroundColor: "#f8fbff",
    overflow: "hidden",
    minHeight: 60,
    justifyContent: "center"
  },
  actionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 2, position: "relative", zIndex: 200 },
  primaryAction: { backgroundColor: "#4d948a", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  primaryActionText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  secondaryAction: { backgroundColor: "#e2e8f0", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  secondaryActionText: { color: "#0f172a", fontWeight: "600", fontSize: 14 },

  filtersBar: {
    backgroundColor: "#dbe4ee",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 8,
    position: "relative",
    zIndex: 1
  },
  filtersTitle: { textAlign: "center", color: "#334155", fontSize: 14, fontWeight: "600" },
  filterSearchInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fbff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: "#0f172a",
    fontSize: 14
  },
  filtersPills: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 8 },
  filterPill: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    paddingVertical: 6,
    paddingHorizontal: 11
  },
  filterPillActive: { backgroundColor: "#6ba8bf", borderColor: "#6ba8bf" },
  filterPillText: { color: "#334155", fontSize: 13, fontWeight: "600" },
  filterPillTextActive: { color: "#ffffff" },

  resultsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, position: "relative", zIndex: 0 },
  resultCard: {
    borderWidth: 1,
    borderColor: "#dce3ec",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 4
  },
  resultCardWide: { width: "32.6%" },
  resultCardNarrow: { width: "100%" },
  resultTitle: { color: "#0f172a", fontSize: 18, fontWeight: "700", lineHeight: 23 },
  resultValue: { color: "#5a9f8c", fontSize: 24, fontWeight: "700", lineHeight: 30 },
  resultDescription: { color: "#475569", fontSize: 13, lineHeight: 18 },
  resultSource: { color: "#64748b", fontSize: 12, lineHeight: 16 },
  emptyStateCard: { width: "100%", borderWidth: 1, borderColor: "#dce3ec", borderRadius: 14, backgroundColor: "#ffffff", padding: 14 },
  emptyStateText: { color: "#64748b", fontSize: 14 },

  historyStrip: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce3ec",
    borderRadius: 12,
    padding: 10,
    gap: 6,
    position: "relative",
    zIndex: 0
  },
  historyItem: { color: "#64748b", fontSize: 12 }
});
