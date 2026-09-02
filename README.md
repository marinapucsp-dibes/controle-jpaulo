# Controle Financeiro José Paulo

Aplicativo web de controle financeiro mensal, responsivo (celular e computador), para acompanhar receitas e despesas.

## Funcionalidades

- **Receitas**: lançamentos de Aposentadoria, Loja e Prêmios (valor em R$ e data de recebimento), com total atualizado automaticamente.
- **Despesas**: lançamentos por forma de pagamento — Cartão Casas Bahia, Cartão Caixa, Boleto, Débito e Dinheiro — com categorias (Transporte, Saúde, Alimentação, Manutenção Carro, Manutenção Casa, Gerais Moradia, Lazer, Doação) e subcategorias.
  - Periodicidade: Parcela Única, Parcelado (gera automaticamente as parcelas seguintes nos próximos meses) ou Recorrente (lança automaticamente por 12 meses).
  - Totais por forma de pagamento atualizados em tempo real.
- **Dashboard**: gráfico de pizza por categoria de despesa, gráfico de barras horizontais comparando receitas x despesas e totais por forma de pagamento.
- **Relatório**: geração de relatório com filtros por período, tipo (receitas/despesas) e forma de pagamento, com opção de impressão.
- Navegação mensal (seletor de mês) e dados salvos localmente no dispositivo.

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + Recharts.

## Desenvolvimento

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run preview  # pré-visualização do build
```

## Deploy

Projeto pronto para deploy no [Vercel](https://vercel.com) (framework Vite detectado automaticamente) — basta conectar o repositório.
