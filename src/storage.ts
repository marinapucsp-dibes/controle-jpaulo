import type { FinanceData } from "./types";

const STORAGE_KEY = "controle-financeiro-jose-paulo:v1";

export function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { receitas: [], despesas: [], pagamentos: [] };
    const parsed = JSON.parse(raw);
    return {
      receitas: Array.isArray(parsed.receitas) ? parsed.receitas : [],
      despesas: Array.isArray(parsed.despesas) ? parsed.despesas : [],
      pagamentos: Array.isArray(parsed.pagamentos) ? parsed.pagamentos : [],
    };
  } catch {
    return { receitas: [], despesas: [], pagamentos: [] };
  }
}

export function saveData(data: FinanceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
