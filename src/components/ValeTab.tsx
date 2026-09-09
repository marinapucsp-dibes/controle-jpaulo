import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  CategoriaVale,
  TipoVale,
  ValeRecebimento,
  ValeUtilizacao,
} from "../types";
import { CATEGORIAS_VALE, TIPOS_VALE, categoriaValeLabel, tipoValeLabel } from "../categories";
import { formatBRL, formatDateBR, monthOf, todayISO } from "../format";
import Field, { inputClass } from "./Field";
import CurrencyInput from "./CurrencyInput";
import type { NovaValeUtilizacao, NovoValeRecebimento } from "../useFinanceStore";

interface ValeTabProps {
  valeRecebimentos: ValeRecebimento[];
  valeUtilizacoes: ValeUtilizacao[];
  monthKey: string;
  onAddRecebimento: (input: NovoValeRecebimento) => void;
  onUpdateRecebimento: (id: string, patch: NovoValeRecebimento) => void;
  onRemoveRecebimento: (id: string) => void;
  onAddUtilizacao: (input: NovaValeUtilizacao) => void;
  onUpdateUtilizacao: (id: string, patch: NovaValeUtilizacao) => void;
  onRemoveUtilizacao: (id: string) => void;
}

const PALETTE = [
  "#10b981",
  "#f43f5e",
  "#6366f1",
  "#f59e0b",
  "#0ea5e9",
  "#a855f7",
];

export default function ValeTab({
  valeRecebimentos,
  valeUtilizacoes,
  monthKey,
  onAddRecebimento,
  onUpdateRecebimento,
  onRemoveRecebimento,
  onAddUtilizacao,
  onUpdateUtilizacao,
  onRemoveUtilizacao,
}: ValeTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {TIPOS_VALE.map((t) => (
          <ValeSection
            key={t.id}
            tipo={t.id}
            recebimentos={valeRecebimentos.filter((r) => r.tipo === t.id)}
            utilizacoes={valeUtilizacoes.filter((u) => u.tipo === t.id)}
            monthKey={monthKey}
            onAddRecebimento={onAddRecebimento}
            onUpdateRecebimento={onUpdateRecebimento}
            onRemoveRecebimento={onRemoveRecebimento}
            onAddUtilizacao={onAddUtilizacao}
            onUpdateUtilizacao={onUpdateUtilizacao}
            onRemoveUtilizacao={onRemoveUtilizacao}
          />
        ))}
      </div>
      <ValeCategoriaChart utilizacoes={valeUtilizacoes} monthKey={monthKey} />
    </div>
  );
}

interface ValeSectionProps {
  tipo: TipoVale;
  recebimentos: ValeRecebimento[];
  utilizacoes: ValeUtilizacao[];
  monthKey: string;
  onAddRecebimento: (input: NovoValeRecebimento) => void;
  onUpdateRecebimento: (id: string, patch: NovoValeRecebimento) => void;
  onRemoveRecebimento: (id: string) => void;
  onAddUtilizacao: (input: NovaValeUtilizacao) => void;
  onUpdateUtilizacao: (id: string, patch: NovaValeUtilizacao) => void;
  onRemoveUtilizacao: (id: string) => void;
}

function ValeSection({
  tipo,
  recebimentos,
  utilizacoes,
  monthKey,
  onAddRecebimento,
  onUpdateRecebimento,
  onRemoveRecebimento,
  onAddUtilizacao,
  onUpdateUtilizacao,
  onRemoveUtilizacao,
}: ValeSectionProps) {
  const recebimentosDoMes = useMemo(
    () => recebimentos.filter((r) => monthOf(r.data) === monthKey),
    [recebimentos, monthKey]
  );
  const utilizacoesDoMes = useMemo(
    () => utilizacoes.filter((u) => monthOf(u.data) === monthKey),
    [utilizacoes, monthKey]
  );

  const totalRecebido = recebimentosDoMes.reduce((s, r) => s + r.valor, 0);
  const totalUtilizado = utilizacoesDoMes.reduce((s, u) => s + u.valor, 0);
  const saldo = totalRecebido - totalUtilizado;

  // Recebimento form
  const [editingRecebimentoId, setEditingRecebimentoId] = useState<string | null>(null);
  const [valorRecebido, setValorRecebido] = useState(0);
  const [dataRecebido, setDataRecebido] = useState(todayISO());

  function resetRecebimentoForm() {
    setEditingRecebimentoId(null);
    setValorRecebido(0);
    setDataRecebido(todayISO());
  }

  function handleEditarRecebimento(r: ValeRecebimento) {
    setEditingRecebimentoId(r.id);
    setValorRecebido(r.valor);
    setDataRecebido(r.data);
  }

  function handleSubmitRecebimento(e: React.FormEvent) {
    e.preventDefault();
    if (valorRecebido <= 0 || !dataRecebido) return;
    if (editingRecebimentoId) {
      onUpdateRecebimento(editingRecebimentoId, { tipo, valor: valorRecebido, data: dataRecebido });
    } else {
      onAddRecebimento({ tipo, valor: valorRecebido, data: dataRecebido });
    }
    resetRecebimentoForm();
  }

  // Utilização form
  const [editingUtilizacaoId, setEditingUtilizacaoId] = useState<string | null>(null);
  const [valorUso, setValorUso] = useState(0);
  const [dataUso, setDataUso] = useState(todayISO());
  const [local, setLocal] = useState("");
  const [categoria, setCategoria] = useState<CategoriaVale>("mistura");

  function resetUtilizacaoForm() {
    setEditingUtilizacaoId(null);
    setValorUso(0);
    setDataUso(todayISO());
    setLocal("");
    setCategoria("mistura");
  }

  function handleEditarUtilizacao(u: ValeUtilizacao) {
    setEditingUtilizacaoId(u.id);
    setValorUso(u.valor);
    setDataUso(u.data);
    setLocal(u.local);
    setCategoria(u.categoria);
  }

  function handleSubmitUtilizacao(e: React.FormEvent) {
    e.preventDefault();
    if (valorUso <= 0 || !dataUso || !local.trim()) return;
    if (editingUtilizacaoId) {
      onUpdateUtilizacao(editingUtilizacaoId, {
        tipo,
        valor: valorUso,
        data: dataUso,
        local: local.trim(),
        categoria,
      });
    } else {
      onAddUtilizacao({ tipo, valor: valorUso, data: dataUso, local: local.trim(), categoria });
    }
    resetUtilizacaoForm();
  }

  const recebimentosOrdenados = [...recebimentosDoMes].sort((a, b) => (a.data < b.data ? 1 : -1));
  const utilizacoesOrdenadas = [...utilizacoesDoMes].sort((a, b) => (a.data < b.data ? 1 : -1));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">{tipoValeLabel(tipo)}</h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600">Recebido</p>
          <p className="font-semibold text-emerald-800">{formatBRL(totalRecebido)}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
          <p className="text-xs text-rose-600">Utilizado</p>
          <p className="font-semibold text-rose-800">{formatBRL(totalUtilizado)}</p>
        </div>
        <div
          className={`rounded-lg border p-3 ${saldo >= 0 ? "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50"}`}
        >
          <p className={`text-xs ${saldo >= 0 ? "text-slate-500" : "text-amber-600"}`}>Saldo</p>
          <p className={`font-semibold ${saldo >= 0 ? "text-slate-800" : "text-amber-700"}`}>
            {formatBRL(saldo)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmitRecebimento}
        className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-3 sm:items-end"
      >
        <Field label="Valor recebido">
          <CurrencyInput value={valorRecebido} onChange={setValorRecebido} required />
        </Field>
        <Field label="Data">
          <input
            type="date"
            className={inputClass}
            value={dataRecebido}
            onChange={(e) => setDataRecebido(e.target.value)}
            required
          />
        </Field>
        <div className="flex gap-2">
          <button
            type="submit"
            className="h-fit rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {editingRecebimentoId ? "Salvar" : "Adicionar recebimento"}
          </button>
          {editingRecebimentoId && (
            <button
              type="button"
              onClick={resetRecebimentoForm}
              className="h-fit rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {recebimentosOrdenados.length > 0 && (
        <ul className="divide-y divide-slate-100 text-sm">
          {recebimentosOrdenados.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">{formatDateBR(r.data)}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-emerald-700">{formatBRL(r.valor)}</span>
                <button
                  onClick={() => handleEditarRecebimento(r)}
                  className="text-xs font-medium text-slate-500 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => onRemoveRecebimento(r.id)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmitUtilizacao}
        className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2"
      >
        <Field label="Categoria">
          <select
            className={inputClass}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaVale)}
          >
            {CATEGORIAS_VALE.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Local">
          <input
            type="text"
            className={inputClass}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="Ex.: Supermercado, Restaurante..."
            required
          />
        </Field>
        <Field label="Valor">
          <CurrencyInput value={valorUso} onChange={setValorUso} required />
        </Field>
        <Field label="Data">
          <input
            type="date"
            className={inputClass}
            value={dataUso}
            onChange={(e) => setDataUso(e.target.value)}
            required
          />
        </Field>
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            className="h-fit rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            {editingUtilizacaoId ? "Salvar" : "Adicionar utilização"}
          </button>
          {editingUtilizacaoId && (
            <button
              type="button"
              onClick={resetUtilizacaoForm}
              className="h-fit rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {utilizacoesOrdenadas.length === 0 ? (
        <p className="py-2 text-center text-sm text-slate-400">
          Nenhuma utilização lançada neste mês.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 text-sm">
          {utilizacoesOrdenadas.map((u) => (
            <li key={u.id} className="flex items-center justify-between py-1.5">
              <div className="flex flex-col">
                <span className="font-medium text-slate-700">{u.local}</span>
                <span className="text-xs text-slate-400">
                  {categoriaValeLabel(u.categoria)} · {formatDateBR(u.data)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-rose-700">{formatBRL(u.valor)}</span>
                <button
                  onClick={() => handleEditarUtilizacao(u)}
                  className="text-xs font-medium text-slate-500 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => onRemoveUtilizacao(u.id)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ValeCategoriaChart({
  utilizacoes,
  monthKey,
}: {
  utilizacoes: ValeUtilizacao[];
  monthKey: string;
}) {
  const porCategoria = useMemo(() => {
    const map = new Map<CategoriaVale, number>();
    for (const u of utilizacoes) {
      if (monthOf(u.data) !== monthKey) continue;
      map.set(u.categoria, (map.get(u.categoria) ?? 0) + u.valor);
    }
    return CATEGORIAS_VALE.map((c) => ({
      name: c.label,
      valor: map.get(c.id) ?? 0,
    })).filter((c) => c.valor > 0);
  }, [utilizacoes, monthKey]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Utilização por categoria
        </h3>
        {porCategoria.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Sem dados no período.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={porCategoria}
                dataKey="valor"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.name}
                isAnimationActive={false}
              >
                {porCategoria.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatBRL(Number(v ?? 0))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Onde mais se gasta
        </h3>
        {porCategoria.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Sem dados no período.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[...porCategoria].sort((a, b) => b.valor - a.valor)}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <XAxis type="number" tickFormatter={(v) => formatBRL(v)} />
              <YAxis type="category" dataKey="name" width={110} />
              <Tooltip formatter={(v) => formatBRL(Number(v ?? 0))} />
              <Bar dataKey="valor" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {porCategoria.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
