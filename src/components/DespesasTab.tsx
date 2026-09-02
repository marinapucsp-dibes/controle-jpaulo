import { useMemo, useState } from "react";
import type { Despesa, MetodoPagamento } from "../types";
import { METODOS, categoriaLabel, subcategoriaLabel } from "../categories";
import { formatBRL, formatDateBR, monthOf } from "../format";
import DespesaForm, { despesaBadge } from "./DespesaForm";
import type { NovaDespesa } from "../useFinanceStore";

interface DespesasTabProps {
  despesas: Despesa[];
  monthKey: string;
  onAdd: (input: NovaDespesa) => void;
  onRemove: (id: string) => void;
  onRemoveGroup: (groupId: string) => void;
}

export default function DespesasTab({
  despesas,
  monthKey,
  onAdd,
  onRemove,
  onRemoveGroup,
}: DespesasTabProps) {
  const [metodo, setMetodo] = useState<MetodoPagamento>("cartao_casas_bahia");

  const despesasDoMes = useMemo(
    () => despesas.filter((d) => monthOf(d.dataGasto) === monthKey),
    [despesas, monthKey]
  );

  const totaisPorMetodo = useMemo(() => {
    const totals = {} as Record<MetodoPagamento, number>;
    for (const m of METODOS) totals[m.id] = 0;
    for (const d of despesasDoMes) totals[d.metodo] += d.valor;
    return totals;
  }, [despesasDoMes]);

  const totalGeral = METODOS.reduce((sum, m) => sum + totaisPorMetodo[m.id], 0);

  const listaFiltrada = useMemo(
    () =>
      despesasDoMes
        .filter((d) => d.metodo === metodo)
        .sort((a, b) => (a.dataGasto < b.dataGasto ? 1 : -1)),
    [despesasDoMes, metodo]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {METODOS.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {m.label}
            </p>
            <p className="mt-1 text-base font-semibold text-rose-700">
              {formatBRL(totaisPorMetodo[m.id])}
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-600">
            Total do mês
          </p>
          <p className="mt-1 text-base font-semibold text-rose-800">
            {formatBRL(totalGeral)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-print">
        {METODOS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetodo(m.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              metodo === m.id
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <DespesaForm metodo={metodo} onAdd={onAdd} />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">
            {METODOS.find((m) => m.id === metodo)?.label} — lançamentos do mês
          </h3>
        </div>
        {listaFiltrada.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            Nenhum lançamento neste mês.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {listaFiltrada.map((d) => {
              const badge = despesaBadge(d);
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">
                      {d.nome}
                      {badge && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {badge}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      {categoriaLabel(d.categoria)}
                      {d.subcategoria &&
                        ` · ${subcategoriaLabel(d.categoria, d.subcategoria)}`}
                      {" · "}
                      {formatDateBR(d.dataGasto)}
                      {d.dataVencimento &&
                        d.dataVencimento !== d.dataGasto &&
                        ` (venc. ${formatDateBR(d.dataVencimento)})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-rose-700">
                      {formatBRL(d.valor)}
                    </span>
                    <div className="flex flex-col items-end gap-1 no-print">
                      <button
                        onClick={() => onRemove(d.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
                      >
                        Remover
                      </button>
                      {d.periodicidade !== "unica" && (
                        <button
                          onClick={() => onRemoveGroup(d.groupId)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-slate-50"
                        >
                          Remover série
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
