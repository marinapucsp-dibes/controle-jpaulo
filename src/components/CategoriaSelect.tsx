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
            const novaCategoriaId = e.target.value as CategoriaId;
            onCategoriaChange(novaCategoriaId);
            const novaCategoria = CATEGORIAS.find((c) => c.id === novaCategoriaId);
            // Pré-seleciona a primeira subcategoria para não bloquear o envio
            // do formulário silenciosamente por validação nativa do navegador.
            onSubcategoriaChange(novaCategoria?.subcategorias?.[0]?.id);
          }}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      {cat?.subcategoriaLivre && (
        <Field label="Especifique">
          <input
            type="text"
            className={inputClass}
            value={subcategoria ?? ""}
            onChange={(e) => onSubcategoriaChange(e.target.value || undefined)}
            placeholder="Ex.: Presentes, Assinaturas..."
            required
          />
        </Field>
      )}
      {cat?.subcategorias && (
        <Field label="Subcategoria">
          <select
            className={inputClass}
            value={subcategoria ?? ""}
            onChange={(e) => onSubcategoriaChange(e.target.value || undefined)}
            required
          >
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
