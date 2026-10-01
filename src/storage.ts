import type { CartaoTerceiro, CartaoTerceiroPagamento, FinanceData } from "./types";

const STORAGE_KEY = "controle-financeiro-jose-paulo:v1";

// Converte um lançamento de Cartão Terceiros para o formato atual
// (nome + valorTotal + pagamentos[]). Lançamentos salvos pela versão
// anterior do app (um registro por compra, com `valor`/`pago`/
// `periodicidade`) são migrados automaticamente: o valor vira valorTotal e,
// se já estava marcado como pago, vira um pagamento único na data do
// lançamento.
function normalizeCartaoTerceiro(raw: unknown): CartaoTerceiro | null {
  const c = raw as Record<string, unknown>;
  if (!c || typeof c !== "object") return null;
  const id = typeof c.id === "string" ? c.id : null;
  const nome = typeof c.nome === "string" ? c.nome : null;
  const cartao = typeof c.cartao === "string" ? c.cartao : null;
  const data = typeof c.data === "string" ? c.data : null;
  if (!id || !nome || !cartao || !data) return null;

  if (Array.isArray(c.pagamentos)) {
    const valorTotal = typeof c.valorTotal === "number" ? c.valorTotal : 0;
    const pagamentos = c.pagamentos.filter(
      (p): p is CartaoTerceiroPagamento =>
        !!p &&
        typeof p === "object" &&
        typeof (p as CartaoTerceiroPagamento).id === "string" &&
        typeof (p as CartaoTerceiroPagamento).valor === "number" &&
        typeof (p as CartaoTerceiroPagamento).data === "string"
    );
    return { id, nome, cartao: cartao as CartaoTerceiro["cartao"], valorTotal, data, pagamentos };
  }

  // Formato antigo: um registro por compra, com valor/pago.
  const valorTotal = typeof c.valor === "number" ? c.valor : 0;
  const pagamentos: CartaoTerceiroPagamento[] =
    c.pago === true
      ? [{ id: `${id}-migrado`, valor: valorTotal, data }]
      : [];
  return { id, nome, cartao: cartao as CartaoTerceiro["cartao"], valorTotal, data, pagamentos };
}

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
      ? parsed.cartaoTerceiros
          .map((c) => normalizeCartaoTerceiro(c))
          .filter((c): c is CartaoTerceiro => c !== null)
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
