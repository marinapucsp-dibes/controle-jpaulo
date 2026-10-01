import { useMemo, useState } from "react";
import type { CartaoProprio, CartaoTerceiro } from "../types";
import { metodoLabel } from "../categories";
import { formatBRL, formatDateBR, monthOf, todayISO } from "../format";
import Field, { inputClass } from "./Field";
import CurrencyInput from "./CurrencyInput";
import type { NovoCartaoTerceiro } from "../useFinanceStore";

interface CartaoTerceirosTabProps {
  cartaoTerceiros: CartaoTerceiro[];
  monthKey: string;
  onAdd: (input: NovoCartaoTerceiro) => void;
  onUpdate: (id: string, patch: NovoCartaoTerceiro) => void;
  onRemove: (id: string) => void;
  onAddPagamento: (
    cartaoTerceiroId: string,
    input: { valor: number; data: string }
  ) => void;
  onRemovePagamento: (cartaoTerceiroId: string, pagamentoId: string) => void;
}

const CARTOES: CartaoProprio[] = ["cartao_casas_bahia", "cartao_caixa"];

function valorPagoDe(c: CartaoTerceiro): number {
  return c.pagamentos.reduce((s, p) => s + p.valor, 0);
}

function statusDe(c: CartaoTerceiro): { label: string; className: string } {
  const pago = valorPagoDe(c);
  if (pago >= c.valorTotal - 0.004) {
    return { label: "Quitado", className: "bg-emerald-100 text-emerald-700" };
  }
  if (pago > 0) {
    return { label: "Parcial", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Pendente", className: "bg-rose-100 text-rose-700" };
}

export default function CartaoTerceirosTab({
  cartaoTerceiros,
  monthKey,
  onAdd,
  onUpdate,
  onRemove,
  onAddPagamento,
  onRemovePagamento,
}: CartaoTerceirosTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [cartao, setCartao] = useState<CartaoProprio>("cartao_casas_bahia");
  const [valorTotal, setValorTotal] = useState(0);
  const [data, setData] = useState(todayISO());

  const [payingId, setPayingId] = useState<string | null>(null);
  const [payValor, setPayValor] = useState(0);
  const [payData, setPayData] = useState(todayISO());

  const doMes = useMemo(
    () => cartaoTerceiros.filter((c) => monthOf(c.data) === monthKey),
    [cartaoTerceiros, monthKey]
  );

  const totalGeral = doMes.reduce((s, c) => s + c.valorTotal, 0);
  const totalPago = doMes.reduce((s, c) => s + valorPagoDe(c), 0);
  const totalPendente = totalGeral - totalPago;

  const totalPorNome = useMemo(() => {
    const map = new Map<string, { total: number; pago: number }>();
    for (const c of doMes) {
      const atual = map.get(c.nome) ?? { total: 0, pago: 0 };
      atual.total += c.valorTotal;
      atual.pago += valorPagoDe(c);
      map.set(c.nome, atual);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [doMes]);

  function resetForm() {
    setEditingId(null);
    setNome("");
    setCartao("cartao_casas_bahia");
    setValorTotal(0);
    setData(todayISO());
  }

  function handleEditar(c: CartaoTerceiro) {
    setEditingId(c.id);
    setNome(c.nome);
    setCartao(c.cartao);
    setValorTotal(c.valorTotal);
    setData(c.data);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || valorTotal <= 0 || !data) return;

    if (editingId) {
      onUpdate(editingId, { nome: nome.trim(), cartao, valorTotal, data });
    } else {
      onAdd({ nome: nome.trim(), cartao, valorTotal, data });
    }
    resetForm();
  }

  function abrirPagar(c: CartaoTerceiro) {
    setPayingId(c.id);
    setPayValor(c.valorTotal - valorPagoDe(c));
    setPayData(todayISO());
  }

  function handlePagar(e: React.FormEvent, cartaoTerceiroId: string) {
    e.preventDefault();
    if (payValor <= 0 || !payData) return;
    onAddPagamento(cartaoTerceiroId, { valor: payValor, data: payData });
    setPayingId(null);
  }

  const sorted = [...doMes].sort((a, b) => (a.data < b.data ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total do mês
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatBRL(totalGeral)}
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
        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4"
      >
        {editingId && (
          <p className="col-span-full rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Editando lançamento. Os pagamentos já registrados não são
            afetados.
          </p>
        )}
        <Field label="Nome">
          <input
            type="text"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Quem deve"
            required
          />
        </Field>
        <Field label="Cartão">
          <select
            className={inputClass}
            value={cartao}
            onChange={(e) => setCartao(e.target.value as CartaoProprio)}
          >
            {CARTOES.map((id) => (
              <option key={id} value={id}>
                {metodoLabel(id)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor total">
          <CurrencyInput value={valorTotal} onChange={setValorTotal} required />
        </Field>
        <Field label="Data">
          <input
            type="date"
            className={inputClass}
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </Field>

        <div className="flex gap-2 sm:col-span-1">
          <button
            type="submit"
            className="h-fit self-end rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {editingId ? "Salvar alterações" : "Adicionar"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="h-fit self-end rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {totalPorNome.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Total por pessoa
            </h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {totalPorNome.map(([n, { total, pago }]) => (
              <li
                key={n}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-slate-700">{n}</span>
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-slate-800">
                    {formatBRL(total)}
                  </span>
                  <span className="text-xs text-slate-400">
                    pago {formatBRL(pago)} · falta {formatBRL(total - pago)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Lançamentos do mês
          </h3>
        </div>
        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            Nenhum lançamento neste mês.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sorted.map((c) => {
              const pago = valorPagoDe(c);
              const restante = c.valorTotal - pago;
              const status = statusDe(c);
              return (
                <li key={c.id} className="flex flex-col gap-3 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">
                        {c.nome}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {metodoLabel(c.cartao)} · {formatDateBR(c.data)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-slate-800">
                          {formatBRL(c.valorTotal)}
                        </span>
                        {pago > 0 && (
                          <span className="text-xs text-emerald-600">
                            pago {formatBRL(pago)}
                            {restante > 0.004 && ` · falta ${formatBRL(restante)}`}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 no-print">
                        {restante > 0.004 && (
                          <button
                            onClick={() => abrirPagar(c)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          onClick={() => handleEditar(c)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onRemove(c.id)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>

                  {payingId === c.id && (
                    <form
                      onSubmit={(e) => handlePagar(e, c.id)}
                      className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3 no-print"
                    >
                      <Field label="Valor pago">
                        <CurrencyInput
                          value={payValor}
                          onChange={setPayValor}
                          required
                        />
                      </Field>
                      <Field label="Data do pagamento">
                        <input
                          type="date"
                          className={inputClass}
                          value={payData}
                          onChange={(e) => setPayData(e.target.value)}
                          required
                        />
                      </Field>
                      <p className="text-xs text-slate-400">
                        Falta {formatBRL(c.valorTotal - pago)} no total.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="h-fit rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Confirmar pagamento
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayingId(null)}
                          className="h-fit rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}

                  {c.pagamentos.length > 0 && (
                    <ul className="flex flex-col gap-1 border-l-2 border-emerald-100 pl-3">
                      {c.pagamentos.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between text-xs text-slate-500"
                        >
                          <span>Pagamento em {formatDateBR(p.data)}</span>
                          <span className="flex items-center gap-2">
                            {formatBRL(p.valor)}
                            <button
                              onClick={() => onRemovePagamento(c.id, p.id)}
                              className="text-red-400 no-print hover:text-red-600"
                            >
                              remover
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
