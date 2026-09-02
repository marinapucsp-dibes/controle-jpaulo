import { CATEGORIAS } from "../categories";
import type { CategoriaId } from "../types";
import Field, { inputClass } from "./Field";

interface CategoriaSelectProps {
  categoria: CategoriaId;
  subcategoria?: string;
  onCategoriaChange: (categoria: CategoriaId) => void;
  onSubcategoriaChange: (sub: string | undefined) => void;
}

export default function CategoriaSelect({
  categoria,
  subcategoria,
  onCategoriaChange,
  onSubcategoriaChange,
}: CategoriaSelectProps) {
  const cat = CATEGORIAS.find((c) => c.id === categoria);

  return (
    <>
      <Field label="Categoria">
        <select
          className={inputClass}
          value={categoria}
          onChange={(e) => {
            onCategoriaChange(e.target.value as CategoriaId);
            onSubcategoriaChange(undefined);
          }}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      {cat?.subcategorias && (
        <Field label="Subcategoria">
          <select
            className={inputClass}
            value={subcategoria ?? ""}
            onChange={(e) => onSubcategoriaChange(e.target.value || undefined)}
            required
          >
            <option value="" disabled>
              Selecione...
            </option>
            {cat.subcategorias.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      )}
    </>
  );
}
