import { useMemo, useState } from "react";
import type { Receita, ReceitaFonte } from "../types";
import { RECEITA_FONTES } from "../categories";
import { formatBRL, formatDateBR, monthOf, todayISO } from "../format";
import Field, { inputClass } from "./Field";
import CurrencyInput from "./CurrencyInput";
import type { NovaReceita } from "../useFinanceStore";

interface ReceitasTabProps {
  receitas: Receita[];
  monthKey: string;
  onAdd: (input: NovaReceita) => void;
  onRemove: (id: string) => void;
}

export default function ReceitasTab({
  receitas,
  monthKey,
  onAdd,
  onRemove,
}: ReceitasTabProps) {
  const [fonte, setFonte] = useState<ReceitaFonte>("aposentadoria");
  const [valor, setValor] = useState(0);
  const [data, setData] = useState(todayISO());

  const receitasDoMes = useMemo(
    () => receitas.filter((r) => monthOf(r.data) === monthKey),
    [receitas, monthKey]
  );

  const totaisPorFonte = useMemo(() => {
    const totals: Record<ReceitaFonte, number> = {
      aposentadoria: 0,
      loja: 0,
      premios: 0,
    };
    for (const r of receitasDoMes) totals[r.fonte] += r.valor;
    return totals;
  }, [receitasDoMes]);

  const totalGeral = totaisPorFonte.aposentadoria + totaisPorFonte.loja + totaisPorFonte.premios;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valor <= 0 || !data) return;
    onAdd({ fonte, valor, data });
    setValor(0);
  }

  const sorted = [...receitasDoMes].sort((a, b) => (a.data < b.data ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {RECEITA_FONTES.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {f.label}
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">
              {formatBRL(totaisPorFonte[f.id])}
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            Total do mês
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-800">
            {formatBRL(totalGeral)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4 sm:items-end"
      >
        <Field label="Fonte">
          <select
            className={inputClass}
            value={fonte}
            onChange={(e) => setFonte(e.target.value as ReceitaFonte)}
          >
            {RECEITA_FONTES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor">
          <CurrencyInput value={valor} onChange={setValor} required />
        </Field>
        <Field label="Data de recebimento">
          <input
            type="date"
            className={inputClass}
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </Field>
        <button
          type="submit"
          className="h-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Adicionar receita
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Receitas lançadas no mês
          </h3>
        </div>
        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            Nenhuma receita lançada neste mês.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sorted.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">
                    {RECEITA_FONTES.find((f) => f.id === r.fonte)?.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDateBR(r.data)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-700">
                    {formatBRL(r.valor)}
                  </span>
                  <button
                    onClick={() => onRemove(r.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 no-print"
                    aria-label="Remover receita"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
