import { useEffect, useMemo, useState } from "react";
import type { Despesa, Receita } from "../types";
import { METODOS, RECEITA_FONTES, categoriaLabel, metodoLabel } from "../categories";
import { formatBRL, formatDateBR } from "../format";
import { inputClass } from "./Field";

interface RelatorioModalProps {
  receitas: Receita[];
  despesas: Despesa[];
  onClose: () => void;
}

type Tipo = "todos" | "receitas" | "despesas";

export default function RelatorioModal({
  receitas,
  despesas,
  onClose,
}: RelatorioModalProps) {
  const [tipo, setTipo] = useState<Tipo>("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [metodoFiltro, setMetodoFiltro] = useState<string>("todos");

  useEffect(() => {
    document.body.classList.add("modal-open-print");
    return () => document.body.classList.remove("modal-open-print");
  }, []);

  const receitasFiltradas = useMemo(() => {
    if (tipo === "despesas") return [];
    return receitas
      .filter((r) => (!dataInicio || r.data >= dataInicio) && (!dataFim || r.data <= dataFim))
      .sort((a, b) => (a.data < b.data ? -1 : 1));
  }, [receitas, tipo, dataInicio, dataFim]);

  const despesasFiltradas = useMemo(() => {
    if (tipo === "receitas") return [];
    return despesas
      .filter(
        (d) =>
          (!dataInicio || d.dataGasto >= dataInicio) &&
          (!dataFim || d.dataGasto <= dataFim) &&
          (metodoFiltro === "todos" || d.metodo === metodoFiltro)
      )
      .sort((a, b) => (a.dataGasto < b.dataGasto ? -1 : 1));
  }, [despesas, tipo, dataInicio, dataFim, metodoFiltro]);

  const totalReceitas = receitasFiltradas.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesasFiltradas.reduce((s, d) => s + d.valor, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 print:static print:bg-white print:p-0">
      <div className="report-modal print-area w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl print:max-w-none print:rounded-none print:shadow-none">
        <div className="mb-4 flex items-center justify-between no-print">
          <h2 className="text-lg font-bold text-slate-800">
            Relatório — Controle Financeiro José Paulo
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        <div className="mb-6 hidden print:block">
          <h2 className="text-lg font-bold text-slate-800">
            Relatório — Controle Financeiro José Paulo
          </h2>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 no-print sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600">Tipo</span>
            <select
              className={inputClass}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Tipo)}
            >
              <option value="todos">Receitas e Despesas</option>
              <option value="receitas">Somente Receitas</option>
              <option value="despesas">Somente Despesas</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600">De</span>
            <input
              type="date"
              className={inputClass}
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600">Até</span>
            <input
              type="date"
              className={inputClass}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600">Forma de pagamento</span>
            <select
              className={inputClass}
              value={metodoFiltro}
              onChange={(e) => setMetodoFiltro(e.target.value)}
              disabled={tipo === "receitas"}
            >
              <option value="todos">Todas</option>
              {METODOS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-600">Total Receitas</p>
            <p className="font-semibold text-emerald-800">{formatBRL(totalReceitas)}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs text-rose-600">Total Despesas</p>
            <p className="font-semibold text-rose-800">{formatBRL(totalDespesas)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Saldo</p>
            <p className="font-semibold text-slate-800">
              {formatBRL(totalReceitas - totalDespesas)}
            </p>
          </div>
        </div>

        {receitasFiltradas.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Receitas</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Fonte</th>
                  <th className="py-2">Data</th>
                  <th className="py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {receitasFiltradas.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-1.5">
                      {RECEITA_FONTES.find((f) => f.id === r.fonte)?.label}
                    </td>
                    <td className="py-1.5">{formatDateBR(r.data)}</td>
                    <td className="py-1.5 text-right font-medium">
                      {formatBRL(r.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {despesasFiltradas.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Despesas</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Forma</th>
                  <th className="py-2">Categoria</th>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Data</th>
                  <th className="py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {despesasFiltradas.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="py-1.5">{metodoLabel(d.metodo)}</td>
                    <td className="py-1.5">{categoriaLabel(d.categoria)}</td>
                    <td className="py-1.5">{d.nome}</td>
                    <td className="py-1.5">{formatDateBR(d.dataGasto)}</td>
                    <td className="py-1.5 text-right font-medium">
                      {formatBRL(d.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {receitasFiltradas.length === 0 && despesasFiltradas.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            Nenhum lançamento encontrado para os filtros selecionados.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
          >
            Imprimir relatório
          </button>
        </div>
      </div>
    </div>
  );
}
