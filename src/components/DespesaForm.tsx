import { useEffect, useState } from "react";
import type { Despesa, MetodoPagamento, Periodicidade } from "../types";
import CategoriaSelect from "./CategoriaSelect";
import Field, { inputClass } from "./Field";
import CurrencyInput from "./CurrencyInput";
import type { NovaDespesa } from "../useFinanceStore";
import { todayISO } from "../format";
import type { CategoriaId } from "../types";

interface DespesaFormProps {
  metodo: MetodoPagamento;
  editingDespesa: Despesa | null;
  onAdd: (input: NovaDespesa) => void;
  onUpdate: (
    id: string,
    patch: Omit<
      NovaDespesa,
      "periodicidade" | "parcelaAtual" | "parcelaTotal"
    >
  ) => void;
  onCancelEdit: () => void;
}

const isCartao = (m: MetodoPagamento) =>
  m === "cartao_casas_bahia" || m === "cartao_caixa";

const nomeLabel: Record<MetodoPagamento, string> = {
  cartao_casas_bahia: "Nome do gasto",
  cartao_caixa: "Nome do gasto",
  boleto: "Nome / Instituição",
  debito: "Nome do item e/ou estabelecimento",
  dinheiro: "Nome do item e/ou estabelecimento",
};

const dataGastoLabel: Record<MetodoPagamento, string> = {
  cartao_casas_bahia: "Data do gasto",
  cartao_caixa: "Data do gasto",
  boleto: "Data de vencimento",
  debito: "Data do débito",
  dinheiro: "Data do gasto",
};

export default function DespesaForm({
  metodo,
  editingDespesa,
  onAdd,
  onUpdate,
  onCancelEdit,
}: DespesaFormProps) {
  const [categoria, setCategoria] = useState<CategoriaId>("transporte");
  const [subcategoria, setSubcategoria] = useState<string | undefined>(
    undefined
  );
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(0);
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>("unica");
  const [parcelaAtual, setParcelaAtual] = useState(1);
  const [parcelaTotal, setParcelaTotal] = useState(2);
  const [dataGasto, setDataGasto] = useState(todayISO());
  const [dataVencimento, setDataVencimento] = useState(todayISO());

  const cartao = isCartao(metodo);

  useEffect(() => {
    if (editingDespesa) {
      setCategoria(editingDespesa.categoria);
      setSubcategoria(editingDespesa.subcategoria);
      setNome(editingDespesa.nome);
      setValor(editingDespesa.valor);
      setDataGasto(editingDespesa.dataGasto);
      setDataVencimento(editingDespesa.dataVencimento ?? todayISO());
    } else {
      setCategoria("transporte");
      setSubcategoria(undefined);
      setNome("");
      setValor(0);
      setPeriodicidade("unica");
      setParcelaAtual(1);
      setParcelaTotal(2);
      setDataGasto(todayISO());
      setDataVencimento(todayISO());
    }
  }, [editingDespesa]);

  function resetCommon() {
    setNome("");
    setValor(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || valor <= 0) return;

    if (editingDespesa) {
      onUpdate(editingDespesa.id, {
        metodo,
        categoria,
        subcategoria,
        nome: nome.trim(),
        valor,
        dataGasto: metodo === "boleto" ? dataVencimento : dataGasto,
        dataVencimento:
          metodo === "boleto" || cartao ? dataVencimento : undefined,
      });
      onCancelEdit();
      return;
    }

    const base: NovaDespesa = {
      metodo,
      categoria,
      subcategoria,
      nome: nome.trim(),
      valor,
      periodicidade: cartao ? periodicidade : "unica",
      dataGasto: metodo === "boleto" ? dataVencimento : dataGasto,
      dataVencimento:
        metodo === "boleto" || cartao ? dataVencimento : undefined,
    };

    if (cartao && periodicidade === "parcelado") {
      base.parcelaAtual = parcelaAtual;
      base.parcelaTotal = parcelaTotal;
    }

    onAdd(base);
    resetCommon();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3"
    >
      {editingDespesa && (
        <p className="col-span-full rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Editando lançamento
          {editingDespesa.periodicidade !== "unica" &&
            " (a periodicidade/parcela não pode ser alterada aqui)"}
          .
        </p>
      )}

      <CategoriaSelect
        categoria={categoria}
        subcategoria={subcategoria}
        onCategoriaChange={setCategoria}
        onSubcategoriaChange={setSubcategoria}
      />

      <Field label={nomeLabel[metodo]} className="sm:col-span-2">
        <input
          type="text"
          className={inputClass}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </Field>

      <Field label="Valor">
        <CurrencyInput value={valor} onChange={setValor} required />
      </Field>

      {!editingDespesa && cartao && (
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

      {!editingDespesa && cartao && periodicidade === "parcelado" && (
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

      {!editingDespesa && cartao && periodicidade === "recorrente" && (
        <p className="col-span-full -mt-2 text-xs text-slate-400">
          Este gasto será lançado automaticamente pelos próximos 12 meses.
        </p>
      )}

      {metodo !== "boleto" && (
        <Field label={dataGastoLabel[metodo]}>
          <input
            type="date"
            className={inputClass}
            value={dataGasto}
            onChange={(e) => setDataGasto(e.target.value)}
            required
          />
        </Field>
      )}

      {(cartao || metodo === "boleto") && (
        <Field label="Data de vencimento">
          <input
            type="date"
            className={inputClass}
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            required
          />
        </Field>
      )}

      <div className="flex gap-2 self-end sm:col-span-1">
        <button
          type="submit"
          className="h-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {editingDespesa ? "Salvar alterações" : "Adicionar despesa"}
        </button>
        {editingDespesa && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="h-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export function despesaBadge(d: Despesa): string | undefined {
  if (d.periodicidade === "parcelado" && d.parcelaTotal) {
    return `${d.parcelaAtual}/${d.parcelaTotal}`;
  }
  if (d.periodicidade === "recorrente") return "recorrente";
  return undefined;
}
