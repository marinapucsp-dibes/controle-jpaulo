export type ReceitaFonte = "aposentadoria" | "loja" | "premios";

export interface Receita {
  id: string;
  fonte: ReceitaFonte;
  valor: number;
  data: string; // yyyy-mm-dd
}

export type MetodoPagamento =
  | "cartao_casas_bahia"
  | "cartao_caixa"
  | "boleto"
  | "debito"
  | "dinheiro";

export type CategoriaId =
  | "transporte"
  | "saude"
  | "alimentacao"
  | "manutencao_carro"
  | "manutencao_casa"
  | "gerais_moradia"
  | "lazer"
  | "doacao"
  | "tucpb"
  | "outros";

export type Periodicidade = "unica" | "parcelado" | "recorrente";

export interface Despesa {
  id: string;
  groupId: string;
  metodo: MetodoPagamento;
  categoria: CategoriaId;
  subcategoria?: string;
  nome: string;
  valor: number;
  periodicidade: Periodicidade;
  parcelaAtual?: number;
  parcelaTotal?: number;
  dataGasto: string; // yyyy-mm-dd
  dataVencimento?: string; // yyyy-mm-dd
}

export interface FinanceData {
  receitas: Receita[];
  despesas: Despesa[];
}
