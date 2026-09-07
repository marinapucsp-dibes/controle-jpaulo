import { useMemo, useState } from "react";
import type { Pagamento } from "../types";
import { formatBRL, formatDateBR, monthOf, todayISO } from "../format";
import Field, { inputClass } from "./Field";
import CurrencyInput from "./CurrencyInput";
import type { NovoPagamento } from "../useFinanceStore";

interface PagamentosTabProps {
  pagamentos: Pagamento[];
  monthKey: string;
  onAdd: (input: NovoPagamento) => void;
  onUpdate: (
    id: string,
    patch: Omit<NovoPagamento, "parcelado" | "parcelaAtual" | "parcelaTotal">
  ) => void;
  onRemove: (id: string) => void;
  onRemoveGroup: (groupId: string) => void;
}

function statusPagamento(p: Pagamento): { label: string; className: string } {
  if (p.dataPagamento) {
    return { label: "Pago", className: "bg-emerald-100 text-emerald-700" };
  }
  if (p.dataVencimento < todayISO()) {
    return { label: "Atrasado", className: "bg-rose-100 text-rose-700" };
  }
  return { label: "Pendente", className: "bg-amber-100 text-amber-700" };
}

export default function PagamentosTab({
  pagamentos,
  monthKey,
  onAdd,
  onUpdate,
  onRemove,
  onRemoveGroup,
}: PagamentosTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [item, setItem] = useState("");
  const [valorTotal, setValorTotal] = useState(0);
  const [dataVencimento, setDataVencimento] = useState(todayISO());
  const [dataPagamento, setDataPagamento] = useState("");
  const [valorPago, setValorPago] = useState(0);
  const [parcelado, setParcelado] = useState(false);
  const [parcelaAtual, setParcelaAtual] = useState(1);
  const [parcelaTotal, setParcelaTotal] = useState(2);

  const pagamentosDoMes = useMemo(
    () => pagamentos.filter((p) => monthOf(p.dataVencimento) === monthKey),
    [pagamentos, monthKey]
  );

  const totalDoMes = pagamentosDoMes.reduce((s, p) => s + p.valorTotal, 0);
  const totalPago = pagamentosDoMes.reduce((s, p) => s + (p.valorPago ?? 0), 0);
  const totalPendente = totalDoMes - totalPago;

  function resetForm() {
    setEditingId(null);
    setItem("");
    setValorTotal(0);
    setDataVencimento(todayISO());
    setDataPagamento("");
    setValorPago(0);
    setParcelado(false);
    setParcelaAtual(1);
    setParcelaTotal(2);
  }

  function handleEditar(p: Pagamento) {
    setEditingId(p.id);
    setItem(p.item);
    setValorTotal(p.valorTotal);
    setDataVencimento(p.dataVencimento);
    setDataPagamento(p.dataPagamento ?? "");
    setValorPago(p.valorPago ?? 0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim() || valorTotal <= 0 || !dataVencimento) return;

    if (editingId) {
      onUpdate(editingId, {
        item: item.trim(),
        valorTotal,
        dataVencimento,
        dataPagamento: dataPagamento || undefined,
        valorPago: valorPago > 0 ? valorPago : undefined,
      });
      resetForm();
      return;
    }

    onAdd({
      item: item.trim(),
      valorTotal,
      dataVencimento,
      dataPagamento: dataPagamento || undefined,
      valorPago: valorPago > 0 ? valorPago : undefined,
      parcelado,
      parcelaAtual: parcelado ? parcelaAtual : undefined,
      parcelaTotal: parcelado ? parcelaTotal : undefined,
    });
    resetForm();
  }

  const sorted = [...pagamentosDoMes].sort((a, b) =>
    a.dataVencimento < b.dataVencimento ? -1 : 1
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total do mês
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatBRL(totalDoMes)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            Total pago
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-800">
            {formatBRL(totalPago)}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Pendente
          </p>
          <p className="mt-1 text-lg font-semibold text-amber-800">
            {formatBRL(totalPendente)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3"
      >
        {editingId && (
          <p className="col-span-full rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Editando lançamento. O parcelamento não pode ser alterado aqui.
          </p>
        )}
        <Field label="Item" className="sm:col-span-2">
          <input
            type="text"
            className={inputClass}
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Ex.: Cartão Casas Bahia"
            required
          />
        </Field>
        <Field label="Valor total">
          <CurrencyInput value={valorTotal} onChange={setValorTotal} required />
        </Field>

        <Field label="Data de vencimento">
          <input
            type="date"
            className={inputClass}
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            required
          />
        </Field>
        <Field label="Data de pagamento">
          <input
            type="date"
            className={inputClass}
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
          />
        </Field>
        <Field label="Valor pago">
          <CurrencyInput value={valorPago} onChange={setValorPago} />
        </Field>

        {!editingId && (
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-3">
            <input
              type="checkbox"
              checked={parcelado}
              onChange={(e) => setParcelado(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Parcelar valor pendente (lança automaticamente nos meses
            seguintes)
          </label>
        )}

        {!editingId && parcelado && (
          <>
            <Field label="Parcela atual">
              <input
                type="number"
                min={1}
                max={parcelaTotal}
                className={inputClass}
                value={parcelaAtual}
                onChange={(e) => setParcelaAtual(Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Total de parcelas">
              <input
                type="number"
                min={parcelaAtual}
                className={inputClass}
                value={parcelaTotal}
                onChange={(e) => setParcelaTotal(Number(e.target.value))}
                required
              />
            </Field>
            <p className="col-span-full -mt-2 text-xs text-slate-400">
              Ex.: parcela {parcelaAtual}/{parcelaTotal} — o valor total informado
              será lançado como vencimento nos próximos meses até completar as
              parcelas. Data e valor pago se aplicam somente à parcela atual.
            </p>
          </>
        )}

        <div className="flex gap-2 self-end">
          <button
            type="submit"
            className="h-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {editingId ? "Salvar alterações" : "Adicionar pagamento"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="h-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Pagamentos do mês
          </h3>
        </div>
        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            Nenhum pagamento lançado neste mês.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sorted.map((p) => {
              const status = statusPagamento(p);
              const badge =
                p.parcelado && p.parcelaTotal
                  ? `${p.parcelaAtual}/${p.parcelaTotal}`
                  : undefined;
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">
                      {p.item}
                      {badge && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {badge}
                        </span>
                      )}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Vencimento {formatDateBR(p.dataVencimento)}
                      {p.dataPagamento &&
                        ` · Pago em ${formatDateBR(p.dataPagamento)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-slate-800">
                        {formatBRL(p.valorTotal)}
                      </span>
                      {p.valorPago !== undefined && (
                        <span className="text-xs text-emerald-600">
                          pago {formatBRL(p.valorPago)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 no-print">
                      <button
                        onClick={() => handleEditar(p)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onRemove(p.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
                      >
                        Remover
                      </button>
                      {p.parcelado && (
                        <button
                          onClick={() => onRemoveGroup(p.groupId)}
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
