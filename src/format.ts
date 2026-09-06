export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Converts raw digit-only input (cents) into a float, e.g. "12345" -> 123.45
export function centsToFloat(digits: string): number {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return 0;
  return parseInt(clean, 10) / 100;
}

export function floatToCentsInput(value: number): string {
  return value.toFixed(2).replace(".", "").replace(/^0+(?=\d)/, "");
}

// yyyy-mm-dd -> dd/mm/aa
export function formatDateBR(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y.slice(2)}`;
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7); // yyyy-mm
}

// Data que define em qual mês uma despesa "conta": a data de vencimento
// quando existir (cartão e boleto — o que decide em qual fatura o gasto cai),
// ou a data do gasto quando não houver vencimento (débito e dinheiro).
export function dataReferenciaDespesa(d: {
  dataGasto: string;
  dataVencimento?: string;
}): string {
  return d.dataVencimento ?? d.dataGasto;
}

export function addMonthsISO(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1 + months, 1);
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth();
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  const mm = String(targetMonth + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${targetYear}-${mm}-${dd}`;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function currentMonthKey(): string {
  return todayISO().slice(0, 7);
}
