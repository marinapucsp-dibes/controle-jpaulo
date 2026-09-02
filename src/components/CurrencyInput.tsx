import { centsToFloat } from "../format";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  id,
  required,
  placeholder = "R$ 0,00",
}: CurrencyInputProps) {
  const display =
    value > 0
      ? value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "";

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      required={required}
      placeholder={placeholder}
      value={display}
      onChange={(e) => onChange(centsToFloat(e.target.value))}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
    />
  );
}
