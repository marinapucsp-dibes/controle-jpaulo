import { useMemo, useState } from "react";
import type { CartaoProprio, CartaoTerceiro, Periodicidade } from "../types";
import { metodoLabel } from "../categories";
import { formatBRL, formatDateBR, monthOf, todayISO } from "../format";
import Field, { inputClass } from "./Field";
import CurrencyInput from "./CurrencyInput";
import type { NovoCartaoTerceiro } from "../useFinanceStore";

interface CartaoTerceirosTabProps {
  cartaoTerceiros: CartaoTerceiro[];
  monthKey: string;
  onAdd: (input: NovoCartaoTerceiro) => void;
  onUpdate: (
    id: string,
    patch: Omit<
      NovoCartaoTerceiro,
      "periodicidade" | "parcelaAtual" | "parcelaTotal"
    >
  ) => void;
  onRemove: (id: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onTogglePago: (id: string) => void;
}

const CARTOES: CartaoProprio[] = ["cartao_casas_bahia", "cartao_caixa"];

function badgeDe(c: CartaoTerceiro): string | undefined {
  if (c.periodicidade === "parcelado" && c.parcelaTotal) {
    return `${c.parcelaAtual}/${c.parcelaTotal}`;
  }
  if (c.periodicidade === "recorrente") return "recorrente";
  return undefined;
}

export default function CartaoTerceirosTab({
  cartaoTerceiros,
  monthKey,
  onAdd,
  onUpdate,
  onRemove,
  onRemoveGroup,
  onTogglePago,
}: CartaoTerceirosTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [cartao, setCartao] = useState<CartaoProprio>("cartao_casas_bahia");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [data, setData] = useState(todayISO());
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>("unica");
  const [parcelaAtual, setParcelaAtual] = useState(1);
  const [parcelaTotal, setParcelaTotal] = useState(2);

  const doMes = useMemo(
    () => cartaoTerceiros.filter((c) => monthOf(c.data) === monthKey),
    [cartaoTerceiros, monthKey]
  );

  const totalGeral = doMes.reduce((s, c) => s + c.valor, 0);
  const totalPago = doMes
    .filter((c) => c.pago)
    .reduce((s, c) => s + c.valor, 0);
  const totalPendente = totalGeral - totalPago;

  const totalPorNome = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of doMes) {
      map.set(c.nome, (map.get(c.nome) ?? 0) + c.valor);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [doMes]);

  function resetForm() {
    setEditingId(null);
    setNome("");
    setCartao("cartao_casas_bahia");
    setDescricao("");
    setValor(0);
    setData(todayISO());
    setPeriodicidade("unica");
    setParcelaAtual(1);
    setParcelaTotal(2);
  }

  function handleEditar(c: CartaoTerceiro) {
    setEditingId(c.id);
    setNome(c.nome);
    setCartao(c.cartao);
    setDescricao(c.descricao);
    setValor(c.valor);
    setData(c.data);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !descricao.trim() || valor <= 0 || !data) return;

    if (editingId) {
      onUpdate(editingId, {
        nome: nome.trim(),
        cartao,
        descricao: descricao.trim(),
        valor,
        data,
      });
      resetForm();
      return;
    }

    onAdd({
      nome: nome.trim(),
      cartao,
      descricao: descricao.trim(),
      valor,
      data,
      periodicidade,
      parcelaAtual: periodicidade === "parcelado" ? parcelaAtual : undefined,
      parcelaTotal: periodicidade === "parcelado" ? parcelaTotal : undefined,
    });
    resetForm();
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
        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3"
      >
        {editingId && (
          <p className="col-span-full rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Editando lançamento. Periodicidade não pode ser alterada aqui.
          </p>
        )}
        <Field label="Nome">
          <input
            type="text"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
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
        <Field label="Valor">
          <CurrencyInput value={valor} onChange={setValor} required />
        </Field>

        <Field label="Descrição" className="sm:col-span-2">
          <input
            type="text"
            className={inputClass}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Tênis, Jantar..."
            required
          />
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

        {!editingId && (
          <Field label="Periodicidade">
            <select
              className={inputClass}
              value={periodicidade}
              onChange={(e) => setPeriodicidade(e.target.value as Periodicidade)}
            >
              <option value="unica">Parcela Única</option>
              <option value="parcelado">Parcelado</option>
              <option value="recorrente">Recorrente (12 meses)</option>
            </select>
          </Field>
        )}

        {!editingId && periodicidade === "parcelado" && (
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
              Ex.: parcela {parcelaAtual}/{parcelaTotal}. Serão lançadas
              automaticamente as parcelas de {parcelaAtual} até {parcelaTotal}{" "}
              nos meses seguintes.
            </p>
          </>
        )}

        {!editingId && periodicidade === "recorrente" && (
          <p className="col-span-full -mt-2 text-xs text-slate-400">
            Este lançamento será repetido automaticamente pelos próximos 12
            meses.
          </p>
        )}

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
            {totalPorNome.map(([n, total]) => (
              <li
                key={n}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-slate-700">{n}</span>
                <span className="font-semibold text-slate-800">
                  {formatBRL(total)}
                </span>
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
              const badge = badgeDe(c);
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={c.pago}
                      onChange={() => onTogglePago(c.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex flex-col">
                      <span
                        className={`font-medium ${
                          c.pago
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {c.nome} — {c.descricao}
                        {badge && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            {badge}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400">
                        {metodoLabel(c.cartao)} · {formatDateBR(c.data)}
                        {c.pago && " · Pago"}
                      </span>
                    </div>
                  </label>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold ${
                        c.pago ? "text-slate-400" : "text-rose-700"
                      }`}
                    >
                      {formatBRL(c.valor)}
                    </span>
                    <div className="flex flex-col items-end gap-1 no-print">
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
                      {c.periodicidade !== "unica" && (
                        <button
                          onClick={() => onRemoveGroup(c.groupId)}
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
