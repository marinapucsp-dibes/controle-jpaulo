import type { FinanceData } from "./types";

const STORAGE_KEY = "controle-financeiro-jose-paulo:v1";

function emptyData(): FinanceData {
  return { receitas: [], despesas: [], pagamentos: [], cartaoTerceiros: [] };
}

export function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw);
    return {
      receitas: Array.isArray(parsed.receitas) ? parsed.receitas : [],
      despesas: Array.isArray(parsed.despesas) ? parsed.despesas : [],
      pagamentos: Array.isArray(parsed.pagamentos) ? parsed.pagamentos : [],
      cartaoTerceiros: Array.isArray(parsed.cartaoTerceiros)
        ? parsed.cartaoTerceiros
        : [],
    };
  } catch {
    return emptyData();
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
