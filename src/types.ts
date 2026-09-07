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

export interface Pagamento {
  id: string;
  groupId: string;
  item: string; // ex.: "Cartão Casas Bahia"
  valorTotal: number;
  dataVencimento: string; // yyyy-mm-dd
  dataPagamento?: string; // yyyy-mm-dd
  valorPago?: number;
  parcelado: boolean;
  parcelaAtual?: number;
  parcelaTotal?: number;
}

export type CartaoProprio = "cartao_casas_bahia" | "cartao_caixa";

export interface CartaoTerceiro {
  id: string;
  groupId: string;
  nome: string;
  cartao: CartaoProprio;
  descricao: string;
  valor: number;
  data: string; // yyyy-mm-dd
  pago: boolean;
  periodicidade: Periodicidade;
  parcelaAtual?: number;
  parcelaTotal?: number;
}

export interface FinanceData {
  receitas: Receita[];
  despesas: Despesa[];
  pagamentos: Pagamento[];
  cartaoTerceiros: CartaoTerceiro[];
}
