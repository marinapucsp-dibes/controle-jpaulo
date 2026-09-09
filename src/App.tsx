import { useState } from "react";
import { useFinanceStore } from "./useFinanceStore";
import { currentMonthKey, monthLabel } from "./format";
import ReceitasTab from "./components/ReceitasTab";
import DespesasTab from "./components/DespesasTab";
import ValeTab from "./components/ValeTab";
import CartaoTerceirosTab from "./components/CartaoTerceirosTab";
import PagamentosTab from "./components/PagamentosTab";
import DashboardTab from "./components/DashboardTab";
import AssistenteTab from "./components/AssistenteTab";
import RelatorioModal from "./components/RelatorioModal";
import SyncModal from "./components/SyncModal";

type Tab =
  | "receitas"
  | "despesas"
  | "vale"
  | "cartaoTerceiros"
  | "pagamentos"
  | "dashboard"
  | "assistente";

const TABS: { id: Tab; label: string }[] = [
  { id: "receitas", label: "Receitas" },
  { id: "despesas", label: "Despesas" },
  { id: "vale", label: "Vale Refeição/Alimentação" },
  { id: "cartaoTerceiros", label: "Cartão Terceiros" },
  { id: "pagamentos", label: "Pagamentos" },
  { id: "dashboard", label: "Dashboard" },
  { id: "assistente", label: "Assistente" },
];

function App() {
  const {
    data,
    codigoSync,
    syncStatus,
    syncError,
    checkCodigoSync,
    connectSync,
    disconnectSync,
    addReceita,
    updateReceita,
    removeReceita,
    addDespesa,
    updateDespesa,
    removeDespesa,
    removeDespesaGroup,
    addPagamento,
    updatePagamento,
    removePagamento,
    removePagamentoGroup,
    addCartaoTerceiro,
    updateCartaoTerceiro,
    removeCartaoTerceiro,
    removeCartaoTerceiroGroup,
    toggleCartaoTerceiroPago,
    addValeRecebimento,
    updateValeRecebimento,
    removeValeRecebimento,
    addValeUtilizacao,
    updateValeUtilizacao,
    removeValeUtilizacao,
  } = useFinanceStore();
  const [tab, setTab] = useState<Tab>("receitas");
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [syncAberto, setSyncAberto] = useState(false);

  const syncDotClass = !codigoSync
    ? "bg-slate-300"
    : syncStatus === "sincronizado"
      ? "bg-emerald-500"
      : syncStatus === "erro"
        ? "bg-rose-500"
        : "bg-amber-500";

  return (
    <div className="min-h-full">
      <div className="app-shell mx-auto flex min-h-screen max-w-6xl flex-col">
        <header className="no-print border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                Controle Financeiro José Paulo
              </h1>
              <p className="text-sm text-slate-500">
                Lançamentos de {monthLabel(monthKey)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="month"
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <button
                onClick={() => setSyncAberto(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <span className={`h-2 w-2 rounded-full ${syncDotClass}`} />
                Sincronizar
              </button>
              <button
                onClick={() => setRelatorioAberto(true)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Relatório
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900"
              >
                Imprimir
              </button>
            </div>
          </div>

          <nav className="mx-auto flex max-w-6xl gap-1 px-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
                  tab === t.id
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {tab === "receitas" && (
            <ReceitasTab
              receitas={data.receitas}
              monthKey={monthKey}
              onAdd={addReceita}
              onUpdate={updateReceita}
              onRemove={removeReceita}
            />
          )}
          {tab === "despesas" && (
            <DespesasTab
              despesas={data.despesas}
              monthKey={monthKey}
              onAdd={addDespesa}
              onUpdate={updateDespesa}
              onRemove={removeDespesa}
              onRemoveGroup={removeDespesaGroup}
            />
          )}
          {tab === "vale" && (
            <ValeTab
              valeRecebimentos={data.valeRecebimentos}
              valeUtilizacoes={data.valeUtilizacoes}
              monthKey={monthKey}
              onAddRecebimento={addValeRecebimento}
              onUpdateRecebimento={updateValeRecebimento}
              onRemoveRecebimento={removeValeRecebimento}
              onAddUtilizacao={addValeUtilizacao}
              onUpdateUtilizacao={updateValeUtilizacao}
              onRemoveUtilizacao={removeValeUtilizacao}
            />
          )}
          {tab === "cartaoTerceiros" && (
            <CartaoTerceirosTab
              cartaoTerceiros={data.cartaoTerceiros}
              monthKey={monthKey}
              onAdd={addCartaoTerceiro}
              onUpdate={updateCartaoTerceiro}
              onRemove={removeCartaoTerceiro}
              onRemoveGroup={removeCartaoTerceiroGroup}
              onTogglePago={toggleCartaoTerceiroPago}
            />
          )}
          {tab === "pagamentos" && (
            <PagamentosTab
              pagamentos={data.pagamentos}
              monthKey={monthKey}
              onAdd={addPagamento}
              onUpdate={updatePagamento}
              onRemove={removePagamento}
              onRemoveGroup={removePagamentoGroup}
            />
          )}
          {tab === "dashboard" && (
            <DashboardTab
              receitas={data.receitas}
              despesas={data.despesas}
              cartaoTerceiros={data.cartaoTerceiros}
              monthKey={monthKey}
            />
          )}
          {tab === "assistente" && (
            <AssistenteTab
              receitas={data.receitas}
              despesas={data.despesas}
              monthKey={monthKey}
            />
          )}
        </main>

        <footer className="no-print border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-400">
          Controle Financeiro José Paulo ·{" "}
          {codigoSync
            ? "dados sincronizados na nuvem"
            : "dados salvos neste dispositivo"}
        </footer>
      </div>

      {relatorioAberto && (
        <RelatorioModal
          receitas={data.receitas}
          despesas={data.despesas}
          pagamentos={data.pagamentos}
          cartaoTerceiros={data.cartaoTerceiros}
          onClose={() => setRelatorioAberto(false)}
        />
      )}

      {syncAberto && (
        <SyncModal
          codigoSync={codigoSync}
          syncStatus={syncStatus}
          syncError={syncError}
          onCheck={checkCodigoSync}
          onConnect={connectSync}
          onDisconnect={disconnectSync}
          onClose={() => setSyncAberto(false)}
        />
      )}
    </div>
  );
}

export default App;
