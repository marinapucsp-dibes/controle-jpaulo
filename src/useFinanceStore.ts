import { useCallback, useEffect, useState } from "react";
import type { Despesa, FinanceData, Receita } from "./types";
import { loadData, newId, saveData } from "./storage";
import { addMonthsISO } from "./format";

export type NovaReceita = Omit<Receita, "id">;
export type NovaDespesa = Omit<Despesa, "id" | "groupId">;

export function useFinanceStore() {
  const [data, setData] = useState<FinanceData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addReceita = useCallback((input: NovaReceita) => {
    setData((prev) => ({
      ...prev,
      receitas: [...prev.receitas, { ...input, id: newId() }],
    }));
  }, []);

  const removeReceita = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      receitas: prev.receitas.filter((r) => r.id !== id),
    }));
  }, []);

  const addDespesa = useCallback((input: NovaDespesa) => {
    const groupId = newId();
    const entries: Despesa[] = [];

    if (input.periodicidade === "parcelado" && input.parcelaTotal) {
      const total = input.parcelaTotal;
      const atual = input.parcelaAtual ?? 1;
      for (let parcela = atual; parcela <= total; parcela++) {
        const offset = parcela - atual;
        entries.push({
          ...input,
          id: newId(),
          groupId,
          parcelaAtual: parcela,
          parcelaTotal: total,
          dataGasto: addMonthsISO(input.dataGasto, offset),
          dataVencimento: input.dataVencimento
            ? addMonthsISO(input.dataVencimento, offset)
            : undefined,
        });
      }
    } else if (input.periodicidade === "recorrente") {
      for (let offset = 0; offset < 12; offset++) {
        entries.push({
          ...input,
          id: newId(),
          groupId,
          dataGasto: addMonthsISO(input.dataGasto, offset),
          dataVencimento: input.dataVencimento
            ? addMonthsISO(input.dataVencimento, offset)
            : undefined,
        });
      }
    } else {
      entries.push({ ...input, id: newId(), groupId });
    }

    setData((prev) => ({ ...prev, despesas: [...prev.despesas, ...entries] }));
  }, []);

  const removeDespesa = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      despesas: prev.despesas.filter((d) => d.id !== id),
    }));
  }, []);

  const removeDespesaGroup = useCallback((groupId: string) => {
    setData((prev) => ({
      ...prev,
      despesas: prev.despesas.filter((d) => d.groupId !== groupId),
    }));
  }, []);

  return {
    data,
    addReceita,
    removeReceita,
    addDespesa,
    removeDespesa,
    removeDespesaGroup,
  };
}
