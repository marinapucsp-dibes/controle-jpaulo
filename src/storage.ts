import type { FinanceData } from "./types";

const STORAGE_KEY = "controle-financeiro-jose-paulo:v1";

function emptyData(): FinanceData {
  return {
    receitas: [],
    despesas: [],
    pagamentos: [],
    cartaoTerceiros: [],
    valeRecebimentos: [],
    valeUtilizacoes: [],
  };
}

// Preenche com [] qualquer coleção ausente/inválida — protege contra dados
// salvos (localStorage ou nuvem) por uma versão anterior do app, que ainda
// não tinha algum dos campos mais novos de FinanceData.
export function normalizeFinanceData(raw: unknown): FinanceData {
  const parsed = (raw ?? {}) as Partial<Record<keyof FinanceData, unknown>>;
  return {
    receitas: Array.isArray(parsed.receitas) ? (parsed.receitas as FinanceData["receitas"]) : [],
    despesas: Array.isArray(parsed.despesas) ? (parsed.despesas as FinanceData["despesas"]) : [],
    pagamentos: Array.isArray(parsed.pagamentos)
      ? (parsed.pagamentos as FinanceData["pagamentos"])
      : [],
    cartaoTerceiros: Array.isArray(parsed.cartaoTerceiros)
      ? (parsed.cartaoTerceiros as FinanceData["cartaoTerceiros"])
      : [],
    valeRecebimentos: Array.isArray(parsed.valeRecebimentos)
      ? (parsed.valeRecebimentos as FinanceData["valeRecebimentos"])
      : [],
    valeUtilizacoes: Array.isArray(parsed.valeUtilizacoes)
      ? (parsed.valeUtilizacoes as FinanceData["valeUtilizacoes"])
      : [],
  };
}

export function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    return normalizeFinanceData(JSON.parse(raw));
  } catch {
    return emptyData();
  }
}

export function saveData(data: FinanceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const CODIGO_SYNC_KEY = "controle-financeiro-jose-paulo:sync-codigo";

export function loadCodigoSync(): string | null {
  return localStorage.getItem(CODIGO_SYNC_KEY);
}

export function saveCodigoSync(codigo: string): void {
  localStorage.setItem(CODIGO_SYNC_KEY, codigo);
}

export function clearCodigoSync(): void {
  localStorage.removeItem(CODIGO_SYNC_KEY);
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
