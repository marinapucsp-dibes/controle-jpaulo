import { useMemo } from "react";
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
import type { CategoriaId, Despesa, Receita } from "../types";
import { METODOS, categoriaLabel } from "../categories";
import { formatBRL, monthOf } from "../format";

interface DashboardTabProps {
  receitas: Receita[];
  despesas: Despesa[];
  monthKey: string;
}

const PALETTE = [
  "#10b981",
  "#f43f5e",
  "#6366f1",
  "#f59e0b",
  "#0ea5e9",
  "#a855f7",
  "#84cc16",
  "#ec4899",
];

export default function DashboardTab({
  receitas,
  despesas,
  monthKey,
}: DashboardTabProps) {
  const receitasDoMes = useMemo(
    () => receitas.filter((r) => monthOf(r.data) === monthKey),
    [receitas, monthKey]
  );
  const despesasDoMes = useMemo(
    () => despesas.filter((d) => monthOf(d.dataGasto) === monthKey),
    [despesas, monthKey]
  );

  const totalReceitas = receitasDoMes.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesasDoMes.reduce((s, d) => s + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of despesasDoMes) {
      map.set(d.categoria, (map.get(d.categoria) ?? 0) + d.valor);
    }
    return Array.from(map.entries())
      .map(([id, valor]) => ({
        name: categoriaLabel(id as CategoriaId),
        valor,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [despesasDoMes]);

  const barData = [
    { name: "Receitas", valor: totalReceitas },
    { name: "Despesas", valor: totalDespesas },
  ];

  const porMetodo = useMemo(
    () =>
      METODOS.map((m) => ({
        metodo: m,
        total: despesasDoMes
          .filter((d) => d.metodo === m.id)
          .reduce((s, d) => s + d.valor, 0),
      })),
    [despesasDoMes]
  );

  const porNome = useMemo(() => {
    const groups: Record<string, Map<string, number>> = {};
    for (const m of ["dinheiro", "debito"]) groups[m] = new Map();
    for (const d of despesasDoMes) {
      if (d.metodo === "dinheiro" || d.metodo === "debito") {
        const map = groups[d.metodo];
        map.set(d.nome, (map.get(d.nome) ?? 0) + d.valor);
      }
    }
    return groups;
  }, [despesasDoMes]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            Total Receitas
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-800">
            {formatBRL(totalReceitas)}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-600">
            Total Despesas
          </p>
          <p className="mt-1 text-lg font-semibold text-rose-800">
            {formatBRL(totalDespesas)}
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 shadow-sm ${
            saldo >= 0
              ? "border-slate-200 bg-white"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Saldo do mês
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${
              saldo >= 0 ? "text-slate-800" : "text-amber-700"
            }`}
          >
            {formatBRL(saldo)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Despesas por categoria
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
            Receitas x Despesas
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tickFormatter={(v) => formatBRL(v)} />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip formatter={(v) => formatBRL(Number(v ?? 0))} />
              <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#f43f5e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Totais por forma de pagamento
          </h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {porMetodo.map(({ metodo, total }) => (
            <li key={metodo.id} className="px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {metodo.label.toUpperCase()}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatBRL(total)}
                </span>
              </div>
              {(metodo.id === "dinheiro" || metodo.id === "debito") &&
                porNome[metodo.id].size > 0 && (
                  <ul className="mt-2 space-y-1 border-l-2 border-slate-100 pl-3">
                    {Array.from(porNome[metodo.id].entries()).map(
                      ([nome, valor]) => (
                        <li
                          key={nome}
                          className="flex items-center justify-between text-xs text-slate-500"
                        >
                          <span>{nome}</span>
                          <span>{formatBRL(valor)}</span>
                        </li>
                      )
                    )}
                  </ul>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
