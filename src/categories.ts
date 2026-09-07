import type { CategoriaId, MetodoPagamento } from "./types";

export interface Subcategoria {
  id: string;
  label: string;
}

export interface Categoria {
  id: CategoriaId;
  label: string;
  subcategorias?: Subcategoria[];
  /** Quando true, a subcategoria é um texto livre digitado pelo usuário em vez de uma lista fixa. */
  subcategoriaLivre?: boolean;
}

export const CATEGORIAS: Categoria[] = [
  {
    id: "transporte",
    label: "Transporte",
    subcategorias: [
      { id: "gasolina", label: "Gasolina" },
      { id: "aplicativo", label: "Aplicativo (Uber, 99)" },
    ],
  },
  {
    id: "saude",
    label: "Saúde",
    subcategorias: [
      { id: "remedio_nina", label: "Remédio Nina" },
      { id: "remedio_paulo", label: "Remédio Paulo" },
      { id: "consultas_exames", label: "Consultas ou Exames" },
      { id: "plano", label: "Plano" },
      { id: "outros", label: "Outros" },
    ],
  },
  {
    id: "alimentacao",
    label: "Alimentação",
    subcategorias: [
      { id: "mistura", label: "Mistura" },
      { id: "cafe_manha", label: "Café da Manhã" },
      { id: "legumes", label: "Legumes" },
      { id: "diversos", label: "Diversos" },
    ],
  },
  {
    id: "manutencao_carro",
    label: "Manutenção Carro",
    subcategorias: [
      { id: "fiesta", label: "Fiesta" },
      { id: "palio", label: "Palio" },
    ],
  },
  { id: "manutencao_casa", label: "Manutenção Casa" },
  { id: "gerais_moradia", label: "Gerais Moradia" },
  { id: "lazer", label: "Lazer" },
  { id: "doacao", label: "Doação" },
  { id: "tucpb", label: "TUCPB" },
  { id: "outros", label: "Outros", subcategoriaLivre: true },
];

export function categoriaLabel(id: CategoriaId): string {
  return CATEGORIAS.find((c) => c.id === id)?.label ?? id;
}

export function subcategoriaLabel(
  categoriaId: CategoriaId,
  subId?: string
): string | undefined {
  if (!subId) return undefined;
  const cat = CATEGORIAS.find((c) => c.id === categoriaId);
  return cat?.subcategorias?.find((s) => s.id === subId)?.label ?? subId;
}

export const METODOS: { id: MetodoPagamento; label: string }[] = [
  { id: "cartao_casas_bahia", label: "Cartão Casas Bahia" },
  { id: "cartao_caixa", label: "Cartão Caixa" },
  { id: "boleto", label: "Boleto" },
  { id: "debito", label: "Débito" },
  { id: "dinheiro", label: "Dinheiro" },
];

export function metodoLabel(id: MetodoPagamento): string {
  return METODOS.find((m) => m.id === id)?.label ?? id;
}

export const RECEITA_FONTES: { id: "aposentadoria" | "loja" | "premios"; label: string }[] = [
  { id: "aposentadoria", label: "Aposentadoria" },
  { id: "loja", label: "Loja" },
  { id: "premios", label: "Prêmios" },
];
