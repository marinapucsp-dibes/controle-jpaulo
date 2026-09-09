import { createHash } from "node:crypto";

interface VercelLikeRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelLikeResponse {
  status(code: number): VercelLikeResponse;
  json(body: unknown): void;
}

const MAX_BODY_BYTES = 300_000;
const MIN_CODIGO_LENGTH = 6;

function hashCodigo(codigo: string): string {
  return createHash("sha256").update(codigo).digest("hex");
}

async function upstashCommand(command: unknown[]): Promise<unknown> {
  // Vercel's "Storage -> Upstash for Redis" integration names these
  // KV_REST_API_URL / KV_REST_API_TOKEN (classic "Vercel KV" naming).
  // Connecting an Upstash database directly (upstash.com) instead names
  // them UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Accept either.
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_NOT_CONFIGURED");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) {
    throw new Error(`UPSTASH_HTTP_${res.status}`);
  }

  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) {
    throw new Error(json.error);
  }
  return json.result;
}

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse
) {
  const codigo =
    req.method === "GET"
      ? typeof req.query?.codigo === "string"
        ? req.query.codigo
        : undefined
      : (req.body as { codigo?: unknown } | undefined)?.codigo;

  if (
    !codigo ||
    typeof codigo !== "string" ||
    codigo.length < MIN_CODIGO_LENGTH
  ) {
    res.status(400).json({
      error: `Código de sincronização inválido (mínimo ${MIN_CODIGO_LENGTH} caracteres).`,
    });
    return;
  }

  const key = `controle-jpaulo:sync:${hashCodigo(codigo)}`;

  try {
    if (req.method === "GET") {
      const value = await upstashCommand(["GET", key]);
      res
        .status(200)
        .json({ data: typeof value === "string" ? JSON.parse(value) : null });
      return;
    }

    if (req.method === "POST") {
      const body = req.body as { codigo?: string; data?: unknown };
      const bodyText = JSON.stringify(body?.data ?? {});
      if (bodyText.length > MAX_BODY_BYTES) {
        res.status(413).json({ error: "Dados grandes demais para sincronizar." });
        return;
      }
      await upstashCommand(["SET", key, bodyText]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    if (error instanceof Error && error.message === "UPSTASH_NOT_CONFIGURED") {
      res.status(503).json({
        error:
          "Sincronização indisponível: banco de dados não configurado no projeto (KV_REST_API_URL / KV_REST_API_TOKEN).",
      });
      return;
    }
    res.status(502).json({ error: "Erro ao sincronizar. Tente novamente." });
  }
}
