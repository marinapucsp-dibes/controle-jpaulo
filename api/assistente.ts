import Anthropic from "@anthropic-ai/sdk";

interface VercelLikeRequest {
  method?: string;
  body?: unknown;
}

interface VercelLikeResponse {
  status(code: number): VercelLikeResponse;
  json(body: unknown): void;
}

const MODEL = "claude-sonnet-5";
const MAX_SUMMARY_BYTES = 20_000;

interface CategoriaResumo {
  label: string;
  total: number;
  percentualDespesas: number;
}

interface GastoResumo {
  nome: string;
  valor: number;
  percentualDespesas: number;
}

interface ResumoFinanceiro {
  mes: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  taxaPoupanca: number;
  porCategoria: CategoriaResumo[];
  percentualDiscricionario: number;
  variacaoDespesasMesAnterior: number | null;
  comprometimentoParcelasFuturas: number;
  comprometimentoRecorrenteFuturo: number;
  maioresGastos: GastoResumo[];
}

function isValidResumo(value: unknown): value is ResumoFinanceiro {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.mes === "string" &&
    typeof r.totalReceitas === "number" &&
    typeof r.totalDespesas === "number" &&
    typeof r.saldo === "number" &&
    typeof r.taxaPoupanca === "number" &&
    Array.isArray(r.porCategoria) &&
    Array.isArray(r.maioresGastos)
  );
}

function buildPrompt(resumo: ResumoFinanceiro): string {
  return [
    `Mês analisado: ${resumo.mes}`,
    `Total de receitas: R$ ${resumo.totalReceitas.toFixed(2)}`,
    `Total de despesas: R$ ${resumo.totalDespesas.toFixed(2)}`,
    `Saldo: R$ ${resumo.saldo.toFixed(2)}`,
    `Taxa de poupança: ${resumo.taxaPoupanca.toFixed(1)}%`,
    `Gastos discricionários (Lazer + Doação) como % da receita: ${resumo.percentualDiscricionario.toFixed(1)}%`,
    resumo.variacaoDespesasMesAnterior === null
      ? "Sem dados do mês anterior para comparação."
      : `Variação de despesas vs. mês anterior: ${resumo.variacaoDespesasMesAnterior.toFixed(1)}%`,
    `Comprometido em parcelas futuras: R$ ${resumo.comprometimentoParcelasFuturas.toFixed(2)}`,
    `Comprometido em gastos recorrentes futuros: R$ ${resumo.comprometimentoRecorrenteFuturo.toFixed(2)}`,
    "",
    "Despesas por categoria:",
    ...resumo.porCategoria.map(
      (c) =>
        `- ${c.label}: R$ ${c.total.toFixed(2)} (${c.percentualDespesas.toFixed(1)}% das despesas)`
    ),
    "",
    "Maiores gastos individuais do mês:",
    ...resumo.maioresGastos.map(
      (g) => `- ${g.nome}: R$ ${g.valor.toFixed(2)} (${g.percentualDespesas.toFixed(1)}%)`
    ),
  ].join("\n");
}

const SYSTEM_PROMPT = `Você é um assistente financeiro pessoal, gentil, direto e prático, ajudando um usuário a entender o controle financeiro mensal dele (app "Controle Financeiro José Paulo").
Você recebe apenas dados agregados já calculados (totais, percentuais, comparações) — nunca a lista completa de lançamentos.
Escreva uma análise curta em português do Brasil (no máximo 200 palavras), em texto corrido ou bullets curtos, destacando:
1) um resumo objetivo da situação do mês;
2) os 2-3 pontos que mais merecem atenção;
3) sugestões concretas e realistas de melhoria, considerando o que já foi calculado.
Não invente números que não estejam nos dados fornecidos. Não repita a lista bruta de dados — sintetize.`;

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        "IA indisponível: ANTHROPIC_API_KEY não configurada nas variáveis de ambiente do projeto.",
    });
    return;
  }

  const bodyText = JSON.stringify(req.body ?? {});
  if (bodyText.length > MAX_SUMMARY_BYTES) {
    res.status(413).json({ error: "Resumo enviado é grande demais." });
    return;
  }

  if (!isValidResumo(req.body)) {
    res.status(400).json({ error: "Resumo financeiro inválido." });
    return;
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: buildPrompt(req.body) }],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    res.status(200).json({ analysis: text });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      res.status(500).json({ error: "Chave de API inválida." });
    } else if (error instanceof Anthropic.RateLimitError) {
      res
        .status(429)
        .json({ error: "Limite de requisições da IA atingido. Tente novamente em instantes." });
    } else if (error instanceof Anthropic.APIError) {
      res.status(502).json({ error: "Erro ao consultar a IA. Tente novamente." });
    } else {
      res.status(500).json({ error: "Erro inesperado ao gerar a análise." });
    }
  }
}
