import { useMemo, useState } from "react";
import type { Despesa, Receita } from "../types";
import { buildResumoParaIA, generateInsights, type StatusGeral } from "../insights";
import { metodoLabel } from "../categories";
import { formatBRL, monthLabel } from "../format";

interface AssistenteTabProps {
  receitas: Receita[];
  despesas: Despesa[];
  monthKey: string;
}

const STATUS_INFO: Record<
  StatusGeral,
  { label: string; className: string; description: string }
> = {
  saudavel: {
    label: "Saudável",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    description: "Suas contas estão equilibradas neste mês.",
  },
  atencao: {
    label: "Atenção",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    description: "O saldo está positivo, mas a margem está apertada.",
  },
  critico: {
    label: "Crítico",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    description: "As despesas ultrapassaram as receitas neste mês.",
  },
};

export default function AssistenteTab({
  receitas,
  despesas,
  monthKey,
}: AssistenteTabProps) {
  const insights = useMemo(
    () => generateInsights(receitas, despesas, monthKey),
    [receitas, despesas, monthKey]
  );

  const statusInfo = STATUS_INFO[insights.status];

  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);
  const [iaAnalise, setIaAnalise] = useState<string | null>(null);

  async function handleAprofundarComIA() {
    setIaLoading(true);
    setIaError(null);
    setIaAnalise(null);
    try {
      const resumo = buildResumoParaIA(insights, monthKey);
      const response = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumo),
      });
      const data = await response.json();
      if (!response.ok) {
        setIaError(data.error ?? "Não foi possível gerar a análise agora.");
        return;
      }
      setIaAnalise(data.analysis || "A IA não retornou nenhuma análise.");
    } catch {
      setIaError(
        "Não foi possível conectar ao serviço de IA. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIaLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={`rounded-xl border p-5 shadow-sm ${statusInfo.className}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              Assistente Financeiro · {monthLabel(monthKey)}
            </p>
            <p className="mt-1 text-xl font-bold">Situação: {statusInfo.label}</p>
            <p className="text-sm opacity-80">{statusInfo.description}</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-70">Saldo</p>
              <p className="text-lg font-semibold">{formatBRL(insights.saldo)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide opacity-70">
                Taxa de poupança
              </p>
              <p className="text-lg font-semibold">
                {insights.totalReceitas > 0
                  ? `${insights.taxaPoupanca.toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Recomendações para melhorar suas condições
          </h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {insights.recomendacoes.map((tip, i) => (
            <li key={i} className="flex gap-3 px-4 py-3 text-sm text-slate-700">
              <span className="mt-0.5 text-emerald-600" aria-hidden>
                💡
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Aprofundar com IA
            </h3>
            <p className="text-xs text-slate-400">
              Envia apenas os totais agregados deste mês (sem lançamentos
              individuais) para o Claude gerar uma análise mais detalhada.
            </p>
          </div>
          <button
            onClick={handleAprofundarComIA}
            disabled={iaLoading || insights.totalReceitas === 0}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {iaLoading ? "Analisando..." : "Aprofundar com IA"}
          </button>
        </div>

        {iaError && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {iaError}
          </p>
        )}

        {iaAnalise && (
          <div className="mt-4 whitespace-pre-line rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {iaAnalise}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Comprometimento por categoria
          </h3>
          {insights.porCategoria.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Sem despesas lançadas neste mês.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {insights.porCategoria.map((c) => (
                <li key={c.categoria}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">{c.label}</span>
                    <span>
                      {formatBRL(c.total)} · {c.percentualDespesas.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, c.percentualDespesas)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Maiores gastos individuais
          </h3>
          {insights.maioresGastos.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Sem despesas lançadas neste mês.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {insights.maioresGastos.map((g, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{g.nome}</span>
                    <span className="text-xs text-slate-400">
                      {metodoLabel(g.metodo)}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {formatBRL(g.valor)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Vs. mês anterior
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {insights.variacaoDespesasMesAnterior === null
              ? "Sem dados"
              : `${insights.variacaoDespesasMesAnterior > 0 ? "+" : ""}${insights.variacaoDespesasMesAnterior.toFixed(1)}%`}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Parcelas futuras comprometidas
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatBRL(insights.comprometimentoParcelasFuturas)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Recorrentes futuros
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatBRL(insights.comprometimentoRecorrenteFuturo)}
          </p>
        </div>
      </div>
    </div>
  );
}
