# Manda em PDF — documentação técnica

Como o sistema **ficou de fato** ao fim dos épicos 8.1 a 8.10, não como foi
planejado. Para o que ainda precisa de decisão, leia `DECISOES.md`.

Estado em 26/08/2026: épicos 8.1 a 8.10 implementados, 60 testes verdes,
typecheck e lint limpos, build iOS rodando no simulador. Épico 8.11
(publicação) não começou.

---

## 1. Modelo de dados

### `documentos` — o histórico

Uma linha por PDF que o app produziu. Existe para uma coisa só: reenviar o que
acabou de sair. Não é cofre (princípio P1).

| Coluna | O que significa no negócio |
|---|---|
| `id` | Identificador gerado no app na hora de gravar. |
| `nome_arquivo` | O nome que a pessoa vê e o nome no disco. Formado pela regra 11.7: `<base>-<AAAA-MM-DD>.pdf`, com sufixo `-2`, `-3` quando há colisão no mesmo dia. |
| `caminho_arquivo` | Caminho **relativo** dentro de `<documentos>/pdfs/`. Relativo porque o container do app muda de caminho entre instalações do iOS — guardar o absoluto quebraria o histórico numa atualização. |
| `total_paginas` | Páginas do PDF. Na fusão de frente e verso são **duas faces em uma página**, e aqui vai 1. |
| `tamanho_bytes` | Tamanho real do arquivo no disco, medido depois de salvar. |
| `tipo_documento` | O preset usado. `livre` quando a pessoa entrou pelo botão "Novo PDF". O app **nunca adivinha** olhando a imagem. |
| `tem_ocr` | 1 quando o PDF saiu com camada de texto pesquisável. |
| `orientacao`, `tamanho_papel` | O que foi escolhido em Opções, ou o padrão. |
| `criado_em` | Momento da geração, em milissegundos. É por ele que o histórico ordena. |

**Enums em linguagem de negócio:**
`contrato` (contrato assinado), `imovel` (escritura, matrícula, IPTU, planta),
`procuracao`, `nota_fiscal` (inclusive cupom térmico), `boleto`, `rg`, `cnh`,
`livre` (sem preset). `certidao`, `recibo` e `comprovante` existem no enum mas
ainda não têm preset — estão reservados para a v2 (roadmap 28.1).

### `preferencias` — configuração chave-valor

Ver a tabela completa em `SCHEMA.md`. Duas merecem explicação:

- **`compra_liberada` é CACHE, não verdade.** A fonte de verdade é a loja
  (regra 11.4). Este valor existe só para a interface não piscar enquanto a
  loja responde, e **nunca é escrito com `1` sem confirmação da loja**.
- **`total_pdfs_gerados` nunca é gate de pagamento.** Serve só para decidir
  quando pedir avaliação (regra 11.12). Se algum dia virar gate, o princípio
  P4 foi quebrado.

## 2. Relacionamento entre as tabelas

**Não existe nenhum.** `documentos` e `preferencias` são independentes, e isso
é intencional: o app não guarda as páginas de origem, só o PDF final
(trade-off 7.5 do spec). É por isso que **não dá para reeditar um PDF já
gerado** — trocar uma página exige escanear tudo de novo. A tabela
`paginas_documento` que resolveria isso está no roadmap (28.4) e seria uma
migration aditiva.

## 3. Regras de negócio e onde cada uma vive

Não há trigger nem política (é SQLite local). Toda a lógica que a interface
não mostra está nestes arquivos:

| Regra do spec | Onde | Função |
|---|---|---|
| 11.1 — gates de capacidade | `src/lib/regras.ts` | `podeGerar`, `capacidadeDisponivel`, `PAGINAS_GRATIS` |
| 11.2 — produto de compra | `src/services/purchases.ts` | `ID_PRODUTO` |
| 11.3 — limites técnicos | `src/lib/regras.ts` | `MAX_PAGINAS`, `TENTATIVAS[0]` |
| 11.4 — fonte de verdade da compra | `src/features/compra/CompraProvider.tsx` | efeito de inicialização + `salvarCache` |
| 11.5 — preço vem da loja | `src/services/purchases.ts` · `app/paywall.tsx` | `obterProduto`; a tela esconde o botão quando não há produto |
| 11.6 — presets | `src/lib/regras.ts` | `PRESETS`, `presetDe` |
| 11.6.1 — fusão frente e verso | `src/lib/regras.ts` · `src/services/presets.ts` | `geometriaFrenteVerso`, `fundirFrenteVerso` |
| 11.7 — nome do arquivo | `src/lib/nomeArquivo.ts` | `montarNomeArquivo`, `limparNome` |
| 11.8 — ordem de exclusão | `app/historico.tsx` · `app/previa.tsx` | `removerDocumento` e só depois `removerPdf` |
| 11.9 — camada de OCR | `src/services/pdfBuilder.ts` | `htmlCamadaOcr` |
| 11.10 / 11.10.1 — compressão e piso | `src/services/compressor.ts` · `src/lib/regras.ts` | `comprimirAteAlvo`, `maxTentativas` |
| 11.11 — data relativa | `src/lib/dataRelativa.ts` | `dataRelativa` |
| 11.12 — pedido de avaliação | `src/lib/regras.ts` · `app/pronto.tsx` | `devePedirAvaliacao` |
| 11.13 — varredura de órfãos | `src/services/storage.ts` · `app/_layout.tsx` | `varrerOrfaos`, chamada em segundo plano |
| 12.1 — falha não descarta trabalho | `app/montagem.tsx` | o `catch` só mostra alerta; as páginas ficam |
| 14 — formato de saída | `src/services/pdfBuilder.ts` | `montarHtml`, `dimensoesPagina` |
| 20.3 — EXIF removido na importação | `src/services/importer.ts` | `normalizar` reescreve a imagem |

## 4. Mapa tela → tabelas e serviços

| Tela | Lê | Escreve | Serviços |
|---|---|---|---|
| `app/_layout.tsx` | `documentos`, `preferencias` | `preferencias` (seed) | `db/client`, `storage` |
| `app/index.tsx` (Home) | `documentos` (5), `preferencias` | — | — |
| `app/origem.tsx` | — | *(memória)* | `scanner`, `importer` |
| `app/captura-guiada.tsx` | — | *(memória)* | `scanner` |
| `app/montagem.tsx` | *(memória)* | `documentos` (via `gerar`) | `pageEditor`, `presets`, `geracao/gerar` |
| `app/editor.tsx` | *(memória)* | *(memória)* | `pageEditor` |
| `app/opcoes.tsx` | `preferencias` | `preferencias` | — |
| `app/pronto.tsx` | `documentos`, `preferencias` | `preferencias` | `storage`, `expo-sharing`, `expo-store-review` |
| `app/historico.tsx` | `documentos` | `documentos` | `storage`, `expo-sharing` |
| `app/previa.tsx` | `documentos` | `documentos` | `storage`, `expo-sharing` |
| `app/ajustes.tsx` | `preferencias` | `preferencias`, `documentos` | `storage`, `purchases` |
| `app/paywall.tsx` | — | `preferencias` | `purchases` |
| `app/onboarding.tsx` | — | `preferencias` | — |

## 5. O que acontece em cada ação principal

**Home → Novo PDF ou preset.** `iniciar(tipo)` limpa a sessão e aplica os
padrões do preset. Preset de frente e verso (RG, CNH) pula a folha de origem e
vai para a captura guiada; os demais abrem a folha.

**Origem → Escanear.** Chama `services/scanner`. Contrato, imóvel e procuração
pedem até 50 páginas ao scanner nativo, que fica aberto entre elas; nota fiscal
e boleto pedem 1. Cancelar volta à Home sem mensagem.

**Origem → Fotos / Arquivos.** Cada imagem é **reescrita** antes de entrar —
é isso que remove o EXIF, inclusive a localização. Arquivo que não é imagem é
recusado com a mensagem de 15.5.

**Montagem → Gerar PDF.** Confere o gate (`podeGerar`): com 3+ páginas e sem
compra, abre o paywall e não gera. Passando, chama `features/geracao/gerar`,
que prepara as imagens, roda OCR se pedido, monta o PDF, comprime se há alvo,
move para a pasta definitiva e **só então** grava a linha. Qualquer falha
mostra alerta e **mantém as páginas**.

**Montagem → Opções.** Desvio voluntário, fora do caminho principal. O que a
pessoa escolhe vira padrão nas próximas gerações.

**Pronto → Compartilhar.** Abre a folha nativa. Se as três condições da regra
11.12 valerem, pede avaliação **uma vez só** logo depois.

**Histórico → deslizar.** Compartilhar (azul) e Apagar (vermelho preenchido —
exceção declarada da regra de cor, ver 16.2). Apagar confirma, remove a linha e
**depois** o arquivo. Arquivo sumido por fora do app vira item indisponível com
a única ação "Remover da lista".

**Ajustes → Apagar todos os PDFs.** Confirma, esvazia `documentos` e limpa a
pasta.

## 6. Divergências em relação ao spec

| # | O spec diz | O código faz | Por quê |
|---|---|---|---|
| 1 | D3: importar imagens **e PDFs** | Só imagens | Nenhuma API do Expo renderiza página de PDF. Ver `DECISOES.md` Q2. |
| 2 | 11.9: camada de texto **posicionada** palavra a palavra | Bloco corrido invisível | `expo-text-extractor` não devolve coordenadas. Ver Q1. |
| 3 | 10.11: prévia mostra o PDF em tela cheia | Mostra os dados e abre no visualizador do sistema | Mesma falta de dependência de visualizador. Ver Q3. |
| 4 | 8.3.2: reordenar **por arrastar** | Setas ◀ ▶ na página selecionada | Funciona, mas não é o gesto especificado. Ver Q4. |
| 5 | 7.3: cinco chaves de `preferencias` | Seis | A regra 11.12 exige lembrar que a avaliação já foi pedida. **O spec foi corrigido**, não o contrário. |
| 6 | 16.4: botão principal em **capsule** | Raio 14 | Alinhado ao `RAIO.botao` do Hora do Remédio, para os apps do portfólio ficarem coerentes. |
| 7 | 8.7: captura em lote com contador **nosso** | Contador é do scanner nativo | A UI da câmera é do sistema e não aceita sobreposição. Ver `DECISOES.md` D2. |

**Regra de manutenção:** toda mudança em schema, serviço ou lógica de tela
atualiza este documento no mesmo commit.
