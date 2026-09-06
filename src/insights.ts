import type { CategoriaId, Despesa, MetodoPagamento, Receita } from "./types";
import { categoriaLabel, metodoLabel } from "./categories";
import { monthOf, addMonthsISO } from "./format";

const CATEGORIAS_DISCRICIONARIAS: CategoriaId[] = ["lazer", "doacao"];

export type StatusGeral = "saudavel" | "atencao" | "critico";

export interface CategoriaComprometimento {
  categoria: CategoriaId;
  label: string;
  total: number;
  percentualDespesas: number;
}

export interface MaiorGasto {
  nome: string;
  valor: number;
  categoria: CategoriaId;
  metodo: MetodoPagamento;
  percentualDespesas: number;
}

export interface Insights {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  taxaPoupanca: number; // % da receita que sobrou
  status: StatusGeral;
  porCategoria: CategoriaComprometimento[];
  totalEssencial: number;
  totalDiscricionario: number;
  percentualDiscricionario: number; // % da receita
  comprometimentoParcelasFuturas: number; // soma das parcelas em meses futuros
  comprometimentoRecorrenteFuturo: number; // soma dos recorrentes em meses futuros
  variacaoDespesasMesAnterior: number | null; // % (positivo = aumentou)
  totalDespesasMesAnterior: number | null;
  maioresGastos: MaiorGasto[];
  totalPorMetodo: { metodo: MetodoPagamento; total: number; percentual: number }[];
  recomendacoes: string[];
}

export function generateInsights(
  receitas: Receita[],
  despesas: Despesa[],
  monthKey: string
): Insights {
  const receitasDoMes = receitas.filter((r) => monthOf(r.data) === monthKey);
  const despesasDoMes = despesas.filter((d) => monthOf(d.dataGasto) === monthKey);

  const totalReceitas = receitasDoMes.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesasDoMes.reduce((s, d) => s + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const taxaPoupanca = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;

  let status: StatusGeral = "saudavel";
  if (saldo < 0) status = "critico";
  else if (taxaPoupanca < 10) status = "atencao";

  const categoriaMap = new Map<CategoriaId, number>();
  for (const d of despesasDoMes) {
    categoriaMap.set(d.categoria, (categoriaMap.get(d.categoria) ?? 0) + d.valor);
  }
  const porCategoria: CategoriaComprometimento[] = Array.from(categoriaMap.entries())
    .map(([categoria, total]) => ({
      categoria,
      label: categoriaLabel(categoria),
      total,
      percentualDespesas: totalDespesas > 0 ? (total / totalDespesas) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const totalDiscricionario = despesasDoMes
    .filter((d) => CATEGORIAS_DISCRICIONARIAS.includes(d.categoria))
    .reduce((s, d) => s + d.valor, 0);
  const totalEssencial = totalDespesas - totalDiscricionario;
  const percentualDiscricionario =
    totalReceitas > 0 ? (totalDiscricionario / totalReceitas) * 100 : 0;

  const mesAnterior = addMonthsISO(`${monthKey}-01`, -1).slice(0, 7);
  const despesasMesAnterior = despesas.filter((d) => monthOf(d.dataGasto) === mesAnterior);
  const totalDespesasMesAnterior =
    despesasMesAnterior.length > 0
      ? despesasMesAnterior.reduce((s, d) => s + d.valor, 0)
      : null;
  const variacaoDespesasMesAnterior =
    totalDespesasMesAnterior && totalDespesasMesAnterior > 0
      ? ((totalDespesas - totalDespesasMesAnterior) / totalDespesasMesAnterior) * 100
      : null;

  const comprometimentoParcelasFuturas = despesas
    .filter((d) => d.periodicidade === "parcelado" && monthOf(d.dataGasto) > monthKey)
    .reduce((s, d) => s + d.valor, 0);

  const comprometimentoRecorrenteFuturo = despesas
    .filter((d) => d.periodicidade === "recorrente" && monthOf(d.dataGasto) > monthKey)
    .reduce((s, d) => s + d.valor, 0);

  const maioresGastos: MaiorGasto[] = [...despesasDoMes]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)
    .map((d) => ({
      nome: d.nome,
      valor: d.valor,
      categoria: d.categoria,
      metodo: d.metodo,
      percentualDespesas: totalDespesas > 0 ? (d.valor / totalDespesas) * 100 : 0,
    }));

  const metodoMap = new Map<MetodoPagamento, number>();
  for (const d of despesasDoMes) {
    metodoMap.set(d.metodo, (metodoMap.get(d.metodo) ?? 0) + d.valor);
  }
  const totalPorMetodo = Array.from(metodoMap.entries())
    .map(([metodo, total]) => ({
      metodo,
      total,
      percentual: totalDespesas > 0 ? (total / totalDespesas) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const recomendacoes = buildRecomendacoes({
    totalReceitas,
    totalDespesas,
    saldo,
    taxaPoupanca,
    porCategoria,
    percentualDiscricionario,
    totalDiscricionario,
    variacaoDespesasMesAnterior,
    comprometimentoParcelasFuturas,
    comprometimentoRecorrenteFuturo,
    maioresGastos,
    totalPorMetodo,
  });

  return {
    totalReceitas,
    totalDespesas,
    saldo,
    taxaPoupanca,
    status,
    porCategoria,
    totalEssencial,
    totalDiscricionario,
    percentualDiscricionario,
    comprometimentoParcelasFuturas,
    comprometimentoRecorrenteFuturo,
    variacaoDespesasMesAnterior,
    totalDespesasMesAnterior,
    maioresGastos,
    totalPorMetodo,
    recomendacoes,
  };
}

interface RecomendacaoInput {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  taxaPoupanca: number;
  porCategoria: CategoriaComprometimento[];
  percentualDiscricionario: number;
  totalDiscricionario: number;
  variacaoDespesasMesAnterior: number | null;
  comprometimentoParcelasFuturas: number;
  comprometimentoRecorrenteFuturo: number;
  maioresGastos: MaiorGasto[];
  totalPorMetodo: { metodo: MetodoPagamento; total: number; percentual: number }[];
}

function buildRecomendacoes(input: RecomendacaoInput): string[] {
  const tips: string[] = [];

  if (input.totalReceitas === 0) {
    return [
      "Nenhuma receita lançada neste mês ainda. Cadastre suas receitas na aba Receitas para que a análise fique completa.",
    ];
  }

  if (input.saldo < 0) {
    tips.push(
      `Suas despesas superaram as receitas em R$ ${Math.abs(input.saldo).toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 }
      )} neste mês. Priorize cortar gastos discricionários (Lazer, compras não essenciais) até equilibrar o saldo.`
    );
  } else if (input.taxaPoupanca < 10) {
    tips.push(
      `Você está guardando apenas ${input.taxaPoupanca.toFixed(
        1
      )}% da sua receita neste mês. Tente reservar pelo menos 10-20% para uma poupança ou reserva de emergência.`
    );
  } else if (input.taxaPoupanca >= 20) {
    tips.push(
      `Ótimo trabalho: você está poupando ${input.taxaPoupanca.toFixed(
        1
      )}% da sua receita este mês. Considere direcionar parte desse valor para uma reserva de emergência ou investimento.`
    );
  }

  const categoriaTopo = input.porCategoria[0];
  if (categoriaTopo && categoriaTopo.percentualDespesas > 35) {
    tips.push(
      `"${categoriaTopo.label}" concentra ${categoriaTopo.percentualDespesas.toFixed(
        0
      )}% de todas as suas despesas do mês (R$ ${categoriaTopo.total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}). Vale revisar os lançamentos dessa categoria e ver o que pode ser reduzido ou renegociado.`
    );
  }

  if (input.percentualDiscricionario > 15) {
    tips.push(
      `Gastos com Lazer e Doação somam ${input.percentualDiscricionario.toFixed(
        0
      )}% da sua receita (R$ ${input.totalDiscricionario.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}). Não é preciso eliminar, mas definir um limite mensal para essas categorias ajuda a manter o orçamento sob controle.`
    );
  }

  if (input.variacaoDespesasMesAnterior !== null) {
    if (input.variacaoDespesasMesAnterior > 15) {
      tips.push(
        `Suas despesas subiram ${input.variacaoDespesasMesAnterior.toFixed(
          0
        )}% em relação ao mês anterior. Verifique se houve algum gasto pontual (ex.: manutenção, presente) ou se é uma tendência que precisa de atenção.`
      );
    } else if (input.variacaoDespesasMesAnterior < -10) {
      tips.push(
        `Suas despesas caíram ${Math.abs(input.variacaoDespesasMesAnterior).toFixed(
          0
        )}% em relação ao mês anterior. Continue mantendo esse ritmo de economia.`
      );
    }
  }

  const comprometimentoFuturo =
    input.comprometimentoParcelasFuturas + input.comprometimentoRecorrenteFuturo;
  if (comprometimentoFuturo > input.totalReceitas * 0.3) {
    tips.push(
      `Você já tem R$ ${comprometimentoFuturo.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })} comprometidos em parcelas e gastos recorrentes nos próximos meses — mais de 30% da sua receita atual. Avalie com cuidado antes de assumir novos parcelamentos.`
    );
  }

  const maiorGasto = input.maioresGastos[0];
  if (maiorGasto && maiorGasto.percentualDespesas > 20) {
    tips.push(
      `O gasto "${maiorGasto.nome}" (R$ ${maiorGasto.valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}) representa sozinho ${maiorGasto.percentualDespesas.toFixed(
        0
      )}% das suas despesas do mês. Se ainda não foi parcelado, considere negociar um parcelamento para aliviar o caixa deste mês.`
    );
  }

  const metodoTopo = input.totalPorMetodo[0];
  if (
    metodoTopo &&
    (metodoTopo.metodo === "cartao_casas_bahia" || metodoTopo.metodo === "cartao_caixa") &&
    metodoTopo.percentual > 50
  ) {
    tips.push(
      `Mais da metade das despesas do mês está concentrada no ${metodoLabel(
        metodoTopo.metodo
      )}. Fique atento ao limite e à fatura para não comprometer os próximos meses com parcelamentos acumulados.`
    );
  }

  if (tips.length === 0) {
    tips.push(
      "Suas finanças estão equilibradas neste mês: receitas cobrem as despesas com folga e nenhuma categoria está fora do padrão. Continue assim!"
    );
  }

  return tips;
}
