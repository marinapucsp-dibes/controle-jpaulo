# Controle Financeiro José Paulo

Aplicativo web de controle financeiro mensal, responsivo (celular e computador), para acompanhar receitas e despesas.

## Funcionalidades

- **Receitas**: lançamentos de Aposentadoria, Loja e Prêmios (valor em R$ e data de recebimento), com total atualizado automaticamente.
- **Despesas**: lançamentos por forma de pagamento — Cartão Casas Bahia, Cartão Caixa, Boleto, Débito e Dinheiro — com categorias (Transporte, Saúde, Alimentação, Manutenção Carro, Manutenção Casa, Gerais Moradia, Lazer, Doação) e subcategorias.
  - Periodicidade: Parcela Única, Parcelado (gera automaticamente as parcelas seguintes nos próximos meses) ou Recorrente (lança automaticamente por 12 meses).
  - Totais por forma de pagamento atualizados em tempo real.
- **Dashboard**: gráfico de pizza por categoria de despesa, gráfico de barras horizontais comparando receitas x despesas e totais por forma de pagamento.
- **Assistente**: análise automática do mês (motor de regras local, sem custo e sem dependência externa) com status geral, recomendações práticas, comprometimento por categoria, maiores gastos individuais e compromissos futuros (parcelas/recorrentes). Botão opcional **"Aprofundar com IA"** que envia só os totais agregados do mês para a API da Anthropic (Claude) gerar uma análise mais elaborada em texto livre — nunca envia a lista de lançamentos individuais.
- **Relatório**: geração de relatório com filtros por período, categoria e forma de pagamento, com opção de incluir Receitas/Despesas/Pagamentos/Cartão Terceiros e imprimir.
- **Sincronização** (opcional): botão "Sincronizar" no topo do app — conecta o dispositivo a um código em comum para ver os mesmos dados em vários navegadores/dispositivos (celular + computador, por exemplo).
- Navegação mensal (seletor de mês) e dados salvos localmente no dispositivo (funciona offline; a sincronização é opcional).

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + Recharts no front-end. Funções serverless (Vercel Functions) em `api/assistente.ts` (análise por IA, usando `@anthropic-ai/sdk`) e `api/sync.ts` (sincronização, usando a REST API do Upstash Redis).

## Desenvolvimento

```bash
npm install
npm run dev      # ambiente de desenvolvimento (front-end apenas — rotas /api não rodam no Vite dev)
npm run build    # build de produção
npm run preview  # pré-visualização do build
```

Para testar a rota `/api/assistente` localmente, use a [Vercel CLI](https://vercel.com/docs/cli) (`vercel dev`) com uma `ANTHROPIC_API_KEY` configurada em `.env.local`.

## Deploy

Projeto pronto para deploy no [Vercel](https://vercel.com) (framework Vite detectado automaticamente) — basta conectar o repositório.

### Ativar o "Aprofundar com IA" (opcional)

1. No painel do Vercel, vá em **Project Settings → Environment Variables**.
2. Adicione `ANTHROPIC_API_KEY` com sua chave da [Anthropic Console](https://console.anthropic.com).
3. Faça um novo deploy (ou redeploy) para a variável entrar em vigor.

Sem essa variável configurada, o app funciona normalmente — o botão de IA apenas mostra um aviso de indisponibilidade.

### Ativar a Sincronização entre dispositivos (opcional)

1. No painel do Vercel, abra o projeto e vá em **Storage**.
2. Clique em **Create Database** → escolha **Upstash for Redis** (tem plano gratuito).
3. Conecte o banco criado a este projeto — o Vercel preenche automaticamente `KV_REST_API_URL` e `KV_REST_API_TOKEN` em **Project Settings → Environment Variables** (essa integração usa a nomenclatura clássica "KV", mesmo sendo Upstash por trás). Se criar o banco direto em upstash.com em vez de pelo Vercel, use `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — o código aceita qualquer um dos dois pares.
4. Faça um novo deploy (ou redeploy) para as variáveis entrarem em vigor.
5. No app, clique em **Sincronizar** no topo, crie um código (mínimo 6 caracteres) e use o mesmo código nos outros dispositivos/navegadores onde quiser ver os mesmos dados.

Sem essas variáveis configuradas, o botão "Sincronizar" mostra um aviso de indisponibilidade e o app continua funcionando normalmente em modo local.

**Sobre segurança:** o código de sincronização funciona como uma senha simples — quem souber o código consegue ver e alterar esses dados financeiros. Não é uma autenticação robusta (não há contas de usuário nem recuperação de senha), então escolha um código que não seja óbvio e não o compartilhe.
