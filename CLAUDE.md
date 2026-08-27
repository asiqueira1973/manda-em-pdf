# Manda em PDF — guia do agente

App React Native / Expo que transforma papel em PDF pronto para enviar.
Fonte única de verdade: **`spec.md`** (SDD v1.5). Handoff da noite de
26/08/2026 e pendências: **`DECISOES.md`**.

## Comandos

```bash
npm run typecheck    # obrigatório antes de dar qualquer coisa por pronta
npm test             # 60 testes; cobre os alvos da seção 22.1 do spec
npm run lint
npm run db:generate  # regenera as migrations quando src/db/schema.ts muda

LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios      # ver a pegadinha abaixo
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:android
```

## Pegadinhas que não podem ser quebradas

1. **`LANG=en_US.UTF-8` em todo comando que toca CocoaPods.** Sem isso o
   `pod install` morre com `Unicode Normalization not appropriate for
   ASCII-8BIT`, que não diz nada sobre a causa.
2. **O CSS do PDF usa `px`, nunca `pt`.** O `expo-print` recebe o tamanho da
   página em pixels a 72 PPI e mapeia 1px → 1pt. Com `pt`, cada página vira
   duas. Há teste de regressão em `pdfBuilder.test.ts`.
3. **Nenhuma tela chama biblioteca nativa direto** — sempre via
   `src/services/`. É isso que torna trocar o plugin de scanner (risco R1)
   uma alteração de um arquivo.
4. **Nenhuma cor literal fora de `src/theme/`.**
5. **Nenhum texto de interface fora de `src/strings/`.**
6. **Nenhum preço escrito no código** — o preço vem sempre da loja (regra 11.5).
7. **O fluxo gratuito de até 2 páginas nunca encosta em paywall** (princípio
   P4 e regra 11.1). Se um teste disso quebrar, é bug, não é ajuste.
8. **Falha de geração nunca descarta as páginas do usuário** (máquina 12.1).
9. **Apagar documento: linha do banco PRIMEIRO, arquivo depois** (regra 11.8).
10. **Boleto tem piso de compressão** (regra 11.10.1) — comprimir demais mata
    o código de barras.
11. **`react-native-worklets` fica em 0.7.x.** A 0.8.x quebra o Reanimated 4.2.1
    e o `pod install` falha.
12. **Nada de biblioteca com acesso à rede** além do `expo-iap`. Qualquer SDK
    com rede quebra a declaração "Data Not Collected" das duas lojas (§20.5).

## Convenções

- **Banco em português**, `snake_case`: tabelas, colunas e enums exatamente
  como na seção 7 do spec (`documentos`, `criado_em`, `tipo_documento`).
- **Código em inglês**: variáveis, funções, componentes, nomes de arquivo.
  A fronteira de idioma fica na camada de dados — os tipos que espelham o
  banco mantêm os nomes de coluna em português.
- **Comentários, textos de interface e documentação em português.**
- Toda função e módulo de serviço leva **comentário de cabeçalho** dizendo o
  que faz e **qual regra do spec implementa, com o número da seção**.

## Mapa

```
app/              rotas do expo-router (uma tela por arquivo, seção 10 do spec)
src/
  components/     base.tsx (Tela, Celula, Grupo, BotaoPrimario…), segmentado.tsx
  features/
    sessao/       montagem em memória (7.5) + ícones dos presets
    compra/       estado da compra (regra 11.4)
    geracao/      gerar.ts — orquestra preparar → OCR → montar → comprimir → salvar
  services/       ÚNICA porta para o nativo (seção 13)
  db/             schema (7), client, repository, migrations
  lib/            regras.ts (seção 11), filtros, nomeArquivo, dataRelativa
  theme/          tokens da seção 16
  strings/        todos os textos da seção 15
```

## Regra de manutenção

`CLAUDE.md`, `DOCUMENTACAO-TECNICA.md` e `README.md` são atualizados **no
mesmo commit** da mudança que os afeta.
