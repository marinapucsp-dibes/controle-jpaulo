import { useState } from "react";
import type { FinanceData } from "../types";
import type { SyncStatus } from "../useFinanceStore";
import { inputClass } from "./Field";

interface SyncModalProps {
  codigoSync: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  onCheck: (codigo: string) => Promise<FinanceData | null>;
  onConnect: (codigo: string, remoteData: FinanceData | null) => void;
  onDisconnect: () => void;
  onClose: () => void;
}

function contarLancamentos(data: FinanceData | null): number {
  if (!data) return 0;
  return (
    (data.receitas?.length ?? 0) +
    (data.despesas?.length ?? 0) +
    (data.pagamentos?.length ?? 0) +
    (data.cartaoTerceiros?.length ?? 0)
  );
}

const STATUS_LABEL: Record<SyncStatus, { label: string; className: string }> = {
  desconectado: { label: "Desconectado", className: "text-slate-500" },
  sincronizando: { label: "Sincronizando...", className: "text-amber-600" },
  sincronizado: { label: "Sincronizado", className: "text-emerald-600" },
  erro: { label: "Erro na sincronização", className: "text-rose-600" },
};

export default function SyncModal({
  codigoSync,
  syncStatus,
  syncError,
  onCheck,
  onConnect,
  onDisconnect,
  onClose,
}: SyncModalProps) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflito, setConflito] = useState<FinanceData | null>(null);

  async function handleConectar(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.trim().length < 6) {
      setError("O código precisa ter pelo menos 6 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const remote = await onCheck(codigo.trim());
      if (remote && contarLancamentos(remote) > 0) {
        setConflito(remote);
      } else {
        onConnect(codigo.trim(), null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar.");
    } finally {
      setLoading(false);
    }
  }

  function usarDadosDaNuvem() {
    if (conflito) onConnect(codigo.trim(), conflito);
    setConflito(null);
  }

  function manterDadosDoDispositivo() {
    onConnect(codigo.trim(), null);
    setConflito(null);
  }

  const status = STATUS_LABEL[syncStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Sincronização</h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        {!codigoSync ? (
          conflito ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Já existem dados salvos na nuvem com esse código (
                {contarLancamentos(conflito)} lançamentos). O que você quer
                fazer?
              </p>
              <button
                onClick={usarDadosDaNuvem}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Usar os dados da nuvem (substitui os deste dispositivo)
              </button>
              <button
                onClick={manterDadosDoDispositivo}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Manter os dados deste dispositivo (substitui os da nuvem)
              </button>
            </div>
          ) : (
            <form onSubmit={handleConectar} className="flex flex-col gap-3">
              <p className="text-sm text-slate-600">
                Crie ou digite um código de sincronização (mínimo 6
                caracteres). Use o mesmo código em todos os dispositivos onde
                quiser ver os mesmos dados.
              </p>
              <input
                type="text"
                className={inputClass}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex.: joseP2026financas"
                minLength={6}
                required
              />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Conectando..." : "Conectar"}
              </button>
              <p className="text-xs text-slate-400">
                Guarde esse código em lugar seguro — quem tiver o código
                consegue ver e alterar esses dados financeiros.
              </p>
            </form>
          )
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Código conectado</p>
              <p className="font-mono text-sm text-slate-800">{codigoSync}</p>
            </div>
            <p className={`text-sm font-medium ${status.className}`}>
              {status.label}
            </p>
            {syncStatus === "erro" && syncError && (
              <p className="text-sm text-rose-600">{syncError}</p>
            )}
            <button
              onClick={onDisconnect}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Desconectar deste dispositivo
            </button>
            <p className="text-xs text-slate-400">
              Desconectar não apaga os dados da nuvem — só para de
              sincronizar este dispositivo. Para reconectar, use o mesmo
              código.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
