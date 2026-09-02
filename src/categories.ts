import type { CategoriaId, MetodoPagamento } from "./types";

export interface Subcategoria {
  id: string;
  label: string;
}

export interface Categoria {
  id: CategoriaId;
  label: string;
  subcategorias?: Subcategoria[];
}

export const CATEGORIAS: Categoria[] = [
  { id: "transporte", label: "Transporte" },
  {
    id: "saude",
    label: "Saúde",
    subcategorias: [
      { id: "remedio_nina", label: "Remédio Nina" },
      { id: "remedio_paulo", label: "Remédio Paulo" },
      { id: "consultas_exames", label: "Consultas ou Exames" },
      { id: "plano", label: "Plano" },
    ],
  },
  {
    id: "alimentacao",
    label: "Alimentação",
    subcategorias: [
      { id: "mistura", label: "Mistura" },
      { id: "cafe_manha", label: "Café da Manhã" },
      { id: "legumes", label: "Legumes" },
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
