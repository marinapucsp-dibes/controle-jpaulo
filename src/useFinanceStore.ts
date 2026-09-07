import { useCallback, useEffect, useState } from "react";
import type {
  CartaoTerceiro,
  Despesa,
  FinanceData,
  Pagamento,
  Receita,
} from "./types";
import { loadData, newId, saveData } from "./storage";
import { addMonthsISO } from "./format";

export type NovaReceita = Omit<Receita, "id">;
export type NovaDespesa = Omit<Despesa, "id" | "groupId">;
export type NovoPagamento = Omit<Pagamento, "id" | "groupId">;
export type NovoCartaoTerceiro = Omit<CartaoTerceiro, "id" | "groupId" | "pago">;

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

  const updateReceita = useCallback((id: string, patch: NovaReceita) => {
    setData((prev) => ({
      ...prev,
      receitas: prev.receitas.map((r) => (r.id === id ? { ...r, ...patch } : r)),
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

  type DespesaEditavel = Omit<
    Despesa,
    "id" | "groupId" | "periodicidade" | "parcelaAtual" | "parcelaTotal"
  >;

  const updateDespesa = useCallback((id: string, patch: DespesaEditavel) => {
    setData((prev) => ({
      ...prev,
      despesas: prev.despesas.map((d) =>
        d.id === id ? { ...d, ...patch } : d
      ),
    }));
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

  const addPagamento = useCallback((input: NovoPagamento) => {
    const groupId = newId();
    const entries: Pagamento[] = [];

    if (input.parcelado && input.parcelaTotal) {
      const total = input.parcelaTotal;
      const atual = input.parcelaAtual ?? 1;
      for (let parcela = atual; parcela <= total; parcela++) {
        const offset = parcela - atual;
        const isParcelaAtual = parcela === atual;
        entries.push({
          ...input,
          id: newId(),
          groupId,
          parcelaAtual: parcela,
          parcelaTotal: total,
          dataVencimento: addMonthsISO(input.dataVencimento, offset),
          dataPagamento: isParcelaAtual ? input.dataPagamento : undefined,
          valorPago: isParcelaAtual ? input.valorPago : undefined,
        });
      }
    } else {
      entries.push({ ...input, id: newId(), groupId });
    }

    setData((prev) => ({ ...prev, pagamentos: [...prev.pagamentos, ...entries] }));
  }, []);

  type PagamentoEditavel = Omit<
    Pagamento,
    "id" | "groupId" | "parcelado" | "parcelaAtual" | "parcelaTotal"
  >;

  const updatePagamento = useCallback((id: string, patch: PagamentoEditavel) => {
    setData((prev) => ({
      ...prev,
      pagamentos: prev.pagamentos.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }));
  }, []);

  const removePagamento = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      pagamentos: prev.pagamentos.filter((p) => p.id !== id),
    }));
  }, []);

  const removePagamentoGroup = useCallback((groupId: string) => {
    setData((prev) => ({
      ...prev,
      pagamentos: prev.pagamentos.filter((p) => p.groupId !== groupId),
    }));
  }, []);

  const addCartaoTerceiro = useCallback((input: NovoCartaoTerceiro) => {
    const groupId = newId();
    const entries: CartaoTerceiro[] = [];

    if (input.periodicidade === "parcelado" && input.parcelaTotal) {
      const total = input.parcelaTotal;
      const atual = input.parcelaAtual ?? 1;
      for (let parcela = atual; parcela <= total; parcela++) {
        const offset = parcela - atual;
        entries.push({
          ...input,
          id: newId(),
          groupId,
          pago: false,
          parcelaAtual: parcela,
          parcelaTotal: total,
          data: addMonthsISO(input.data, offset),
        });
      }
    } else if (input.periodicidade === "recorrente") {
      for (let offset = 0; offset < 12; offset++) {
        entries.push({
          ...input,
          id: newId(),
          groupId,
          pago: false,
          data: addMonthsISO(input.data, offset),
        });
      }
    } else {
      entries.push({ ...input, id: newId(), groupId, pago: false });
    }

    setData((prev) => ({
      ...prev,
      cartaoTerceiros: [...prev.cartaoTerceiros, ...entries],
    }));
  }, []);

  type CartaoTerceiroEditavel = Omit<
    CartaoTerceiro,
    "id" | "groupId" | "pago" | "periodicidade" | "parcelaAtual" | "parcelaTotal"
  >;

  const updateCartaoTerceiro = useCallback(
    (id: string, patch: CartaoTerceiroEditavel) => {
      setData((prev) => ({
        ...prev,
        cartaoTerceiros: prev.cartaoTerceiros.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      }));
    },
    []
  );

  const removeCartaoTerceiro = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      cartaoTerceiros: prev.cartaoTerceiros.filter((c) => c.id !== id),
    }));
  }, []);

  const removeCartaoTerceiroGroup = useCallback((groupId: string) => {
    setData((prev) => ({
      ...prev,
      cartaoTerceiros: prev.cartaoTerceiros.filter((c) => c.groupId !== groupId),
    }));
  }, []);

  const toggleCartaoTerceiroPago = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      cartaoTerceiros: prev.cartaoTerceiros.map((c) =>
        c.id === id ? { ...c, pago: !c.pago } : c
      ),
    }));
  }, []);

  return {
    data,
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
  };
}
