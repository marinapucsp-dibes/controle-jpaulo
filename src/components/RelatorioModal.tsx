import { useEffect, useMemo, useState } from "react";
import type { CartaoTerceiro, Despesa, Pagamento, Receita } from "../types";
import {
  CATEGORIAS,
  METODOS,
  RECEITA_FONTES,
  categoriaLabel,
  metodoLabel,
} from "../categories";
import { dataReferenciaDespesa, formatBRL, formatDateBR } from "../format";
import { inputClass } from "./Field";

interface RelatorioModalProps {
  receitas: Receita[];
  despesas: Despesa[];
  pagamentos: Pagamento[];
  cartaoTerceiros: CartaoTerceiro[];
  onClose: () => void;
}

export default function RelatorioModal({
  receitas,
  despesas,
  pagamentos,
  cartaoTerceiros,
  onClose,
}: RelatorioModalProps) {
  const [incluirReceitas, setIncluirReceitas] = useState(true);
  const [incluirDespesas, setIncluirDespesas] = useState(true);
  const [incluirPagamentos, setIncluirPagamentos] = useState(false);
  const [incluirCartaoTerceiros, setIncluirCartaoTerceiros] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [metodoFiltro, setMetodoFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");

  useEffect(() => {
    document.body.classList.add("modal-open-print");
    return () => document.body.classList.remove("modal-open-print");
  }, []);

  const receitasFiltradas = useMemo(() => {
    if (!incluirReceitas) return [];
    return receitas
      .filter((r) => (!dataInicio || r.data >= dataInicio) && (!dataFim || r.data <= dataFim))
      .sort((a, b) => (a.data < b.data ? -1 : 1));
  }, [receitas, incluirReceitas, dataInicio, dataFim]);

  const despesasFiltradas = useMemo(() => {
    if (!incluirDespesas) return [];
    return despesas
      .filter((d) => {
        const data = dataReferenciaDespesa(d);
        return (
          (!dataInicio || data >= dataInicio) &&
          (!dataFim || data <= dataFim) &&
          (metodoFiltro === "todos" || d.metodo === metodoFiltro) &&
          (categoriaFiltro === "todas" || d.categoria === categoriaFiltro)
        );
      })
      .sort((a, b) =>
        dataReferenciaDespesa(a) < dataReferenciaDespesa(b) ? -1 : 1
      );
  }, [despesas, incluirDespesas, dataInicio, dataFim, metodoFiltro, categoriaFiltro]);

  const pagamentosFiltrados = useMemo(() => {
    if (!incluirPagamentos) return [];
    return pagamentos
      .filter(
        (p) =>
          (!dataInicio || p.dataVencimento >= dataInicio) &&
          (!dataFim || p.dataVencimento <= dataFim)
      )
      .sort((a, b) => (a.dataVencimento < b.dataVencimento ? -1 : 1));
  }, [pagamentos, incluirPagamentos, dataInicio, dataFim]);

  const cartaoTerceirosFiltrados = useMemo(() => {
    if (!incluirCartaoTerceiros) return [];
    return cartaoTerceiros
      .filter(
        (c) =>
          (!dataInicio || c.data >= dataInicio) && (!dataFim || c.data <= dataFim)
      )
      .sort((a, b) => (a.data < b.data ? -1 : 1));
  }, [cartaoTerceiros, incluirCartaoTerceiros, dataInicio, dataFim]);

  const totalReceitas = receitasFiltradas.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesasFiltradas.reduce((s, d) => s + d.valor, 0);
  const totalPagamentos = pagamentosFiltrados.reduce((s, p) => s + p.valorTotal, 0);
  const totalCartaoTerceiros = cartaoTerceirosFiltrados.reduce(
    (s, c) => s + c.valor,
    0
  );

  const nadaEncontrado =
    receitasFiltradas.length === 0 &&
    despesasFiltradas.length === 0 &&
    pagamentosFiltrados.length === 0 &&
    cartaoTerceirosFiltrados.length === 0;

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

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 no-print">
          <p className="mb-2 text-sm font-medium text-slate-600">Incluir</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Receitas", checked: incluirReceitas, onChange: setIncluirReceitas },
              { label: "Despesas", checked: incluirDespesas, onChange: setIncluirDespesas },
              { label: "Pagamentos", checked: incluirPagamentos, onChange: setIncluirPagamentos },
              {
                label: "Cartão Terceiros",
                checked: incluirCartaoTerceiros,
                onChange: setIncluirCartaoTerceiros,
              },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 no-print sm:grid-cols-4">
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
            <span className="font-medium text-slate-600">Categoria (despesas)</span>
            <select
              className={inputClass}
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              disabled={!incluirDespesas}
            >
              <option value="todas">Todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600">Forma de pagamento</span>
            <select
              className={inputClass}
              value={metodoFiltro}
              onChange={(e) => setMetodoFiltro(e.target.value)}
              disabled={!incluirDespesas}
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

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-600">Total Receitas</p>
            <p className="font-semibold text-emerald-800">{formatBRL(totalReceitas)}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs text-rose-600">Total Despesas</p>
            <p className="font-semibold text-rose-800">{formatBRL(totalDespesas)}</p>
          </div>
          {incluirPagamentos && (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Total Pagamentos</p>
              <p className="font-semibold text-slate-800">{formatBRL(totalPagamentos)}</p>
            </div>
          )}
          {incluirCartaoTerceiros && (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Total Cartão Terceiros</p>
              <p className="font-semibold text-slate-800">
                {formatBRL(totalCartaoTerceiros)}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Saldo (receitas - despesas)</p>
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
          <div className="mb-6">
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
                    <td className="py-1.5">
                      {formatDateBR(dataReferenciaDespesa(d))}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {formatBRL(d.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagamentosFiltrados.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Pagamentos</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Item</th>
                  <th className="py-2">Vencimento</th>
                  <th className="py-2">Pago em</th>
                  <th className="py-2 text-right">Valor Total</th>
                  <th className="py-2 text-right">Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                {pagamentosFiltrados.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-1.5">{p.item}</td>
                    <td className="py-1.5">{formatDateBR(p.dataVencimento)}</td>
                    <td className="py-1.5">
                      {p.dataPagamento ? formatDateBR(p.dataPagamento) : "—"}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {formatBRL(p.valorTotal)}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {p.valorPago !== undefined ? formatBRL(p.valorPago) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cartaoTerceirosFiltrados.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Cartão Terceiros
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Nome</th>
                  <th className="py-2">Cartão</th>
                  <th className="py-2">Descrição</th>
                  <th className="py-2">Data</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {cartaoTerceirosFiltrados.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-1.5">{c.nome}</td>
                    <td className="py-1.5">{metodoLabel(c.cartao)}</td>
                    <td className="py-1.5">{c.descricao}</td>
                    <td className="py-1.5">{formatDateBR(c.data)}</td>
                    <td className="py-1.5">{c.pago ? "Pago" : "Pendente"}</td>
                    <td className="py-1.5 text-right font-medium">
                      {formatBRL(c.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {nadaEncontrado && (
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
