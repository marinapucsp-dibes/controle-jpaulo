import type { FinanceData } from "./types";

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchRemoteData(
  codigo: string
): Promise<FinanceData | null> {
  const res = await fetch(`/api/sync?codigo=${encodeURIComponent(codigo)}`);
  if (!res.ok) {
    throw new Error(
      await parseErrorMessage(res, "Falha ao buscar dados sincronizados.")
    );
  }
  const body = await res.json();
  return body.data ?? null;
}

export async function pushRemoteData(
  codigo: string,
  data: FinanceData
): Promise<void> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo, data }),
  });
  if (!res.ok) {
    throw new Error(
      await parseErrorMessage(res, "Falha ao enviar dados para sincronização.")
    );
  }
}
