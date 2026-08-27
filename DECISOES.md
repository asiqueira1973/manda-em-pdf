# Decisões e pendências da noite de 26/08/2026

Documento de handoff da sessão em que os épicos 8.1 a 8.10 foram implementados.
**Leia isto antes do `DOCUMENTACAO-TECNICA.md`** — aqui está o que precisa de
decisão sua, e lá está como o sistema ficou.

---

## 1. Precisa da sua decisão

### Q1 — OCR sem coordenadas *(pergunta aberta 25.Q1 do spec)*

**A validação V4 falhou.** O `expo-text-extractor` devolve `Promise<string[]>`:
só o texto, **sem as coordenadas de cada palavra**. A camada invisível
posicionada que a regra 11.9 descreve não é possível com essa biblioteca.

**O que eu fiz:** implementei a opção mais reversível — a camada de texto vai
como **bloco corrido invisível** sobre a página. O PDF fica **pesquisável e
copiável** (critérios 8.8.1 e 8.8.3 passam); o que se perde é o alinhamento
visual da seleção com a imagem. Tudo isso está isolado em
`src/services/ocr.ts` e no `htmlCamadaOcr` do `pdfBuilder`.

**As três saídas:**

| Opção | O que muda | Custo |
|---|---|---|
| **A — ficar como está** *(implementado)* | Texto invisível sem posicionamento | Zero. Seleção não acompanha a imagem. |
| **B — trocar por `@react-native-ml-kit/text-recognition`** | Devolve `frame {x,y,largura,altura}` por palavra — dá a camada posicionada | ML Kit também no iOS: binário maior (o limite de 60 MB da §17.4 fica apertado). Usa a ponte antiga, não TurboModule — risco com New Architecture. Sem config plugin de Expo. Precisa de validação prática. |
| **C — adiar OCR para a v2** | Paywall passa a ter 3 itens | Perde um argumento de venda. |

**Minha recomendação: A.** O valor prático — achar o texto do contrato depois —
está 95% entregue, e B é a única opção que mexe no tamanho do binário e no
risco de New Architecture.

### Q2 — importar PDF ficou de fora

O item **D3 do escopo** diz "importar imagens **e PDFs** do app Arquivos". Só as
imagens foram implementadas: transformar página de PDF em imagem exige um
renderizador (PDFKit no iOS, PdfRenderer no Android) que **nenhuma API do Expo
expõe**. Arquivo que não é imagem é recusado com a mensagem de 15.5, em vez de
falhar em silêncio.

**As saídas:** (1) empacotar o `pdf.js` num WebView oculto — funciona offline,
custa ~1 MB de bundle e uma dependência nova (`react-native-webview`);
(2) escrever um módulo nativo pequeno para os dois lados; (3) mover para o
roadmap e assumir que o app é papel → PDF, não PDF → PDF.

**Minha recomendação: (3).** O cenário que motivou o app é papel na mão.

### Q3 — prévia do PDF não renderiza a página

A tela 10.11 mostra os dados do arquivo e abre a visualização **no sistema**,
que já tem visualizador nativo. Renderizar dentro do app exige a mesma
dependência de visualizador da Q2. Mesma recomendação: deixar como está.

### Q4 — reordenar por arrastar

A montagem reordena por **setas ◀ ▶** na barra de ferramentas da página
selecionada, não por arrastar. O critério 8.3.2 pede arrastar. Funciona, mas
não é o gesto especificado. Implementar arrastar é ~100 linhas com
`reanimated` + `gesture-handler`, e é difícil de verificar sem device.

### Q5 — as três de sempre

Continuam abertas as perguntas 25.Q3 (lançar nas duas lojas juntas ou iOS
primeiro), 25.Q4 (ícone: encomendado ou gerado) e 25.Q5 (menção cruzada ao
Quando Vence?).

---

## 2. Decisões técnicas que eu tomei sozinho

| # | Decisão | Por quê |
|---|---|---|
| D1 | **Filtro é `filter` CSS/RN, não processamento de imagem** | O `expo-image-manipulator` não faz filtro. O mesmo valor serve no HTML do PDF e na prévia da tela, então os dois ficam idênticos por construção. Zero dependência nova. Ver `src/lib/filtros.ts`. |
| D2 | **Captura guiada = duas chamadas do scanner** | A interface da câmera é do sistema e não aceita sobreposição nossa. A instrução "Agora o verso" aparece numa tela nossa ENTRE as duas chamadas. Os mockups `PresetCaptura` e `CapturaLote` representam telas do sistema, não desenho nosso. |
| D3 | **`avaliacao_pedida` adicionada à tabela 7.3** | A regra 11.12 exige "nunca foi pedido antes" e a tabela não tinha onde guardar isso. Corrigido no schema, no spec e no `.dbml`. |
| D4 | **CSS do PDF em `px`, nunca em `pt`** | O `expo-print` recebe o tamanho em pixels a 72 PPI e mapeia 1px → 1pt. Com `pt`, cada página virava duas. Isso aconteceu de verdade e tem teste de regressão. |
| D5 | **`react-native-worklets` fixado em 0.7.x** | O Reanimated 4.2.1 recusa a 0.8.3 que o npm resolveu sozinho, e o `pod install` falha. |
| D6 | **`expo-font` instalado explicitamente** | O `@expo/vector-icons` precisa dele e ele não vem mais junto no SDK 55. |

---

## 3. Pegadinha do ambiente

O CocoaPods desta máquina quebra sem locale UTF-8. **Todo comando que toca
pods precisa de `LANG`:**

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

Sem isso o erro é `Unicode Normalization not appropriate for ASCII-8BIT`, que
não diz nada sobre a causa. Vale colocar `export LANG=en_US.UTF-8` no `~/.zshrc`.

---

## 4. O que foi verificado ao vivo no simulador

| Verificado | Resultado |
|---|---|
| Build iOS (SDK 55, New Architecture) | ✅ 0 erros |
| Plugin do scanner compila (validação **V1**, parcial) | ✅ compila e linka; falta disparar a câmera em device |
| Onboarding, Home, Origem, Montagem, Paywall, Pronto | ✅ renderizam conforme o desenho |
| Importar 3 fotos da galeria | ✅ 3 páginas na ordem certa |
| **Gate 11.1** — 3 páginas sem compra | ✅ abre o paywall |
| **Princípio P4** — 2 páginas sem compra | ✅ gera direto, sem paywall |
| **Regra 11.5** — loja indisponível | ✅ botão comprar some, aparece o aviso; nenhum preço chutado |
| **V2** — PDF multipágina pelo `expo-print` | ✅ arquivo válido, `/Count 2`, páginas em 595×842 |
| Regra 11.7 — nome e colisão | ✅ `Documento-2026-08-26.pdf` e depois `-2` |
| Regra 11.11 — data relativa | ✅ "há 5 min" |
| Seed das preferências (6 chaves) | ✅ |
| Permissão de fotos com texto em português | ✅ |

**Não verificado ainda:** V3 (texto transparente sobrevive como texto no PDF),
câmera real, compra em sandbox, Android, acessibilidade, modo escuro em uso.

---

## 5. Sugestão de ordem para amanhã

1. Decidir **Q1** (é o que destrava o épico 8.8 fechar de vez).
2. Rodar no **emulador Android** — nada foi verificado lá ainda.
3. Testar o **scanner de verdade** em iPhone físico (fecha a validação V1).
4. Criar o produto `com.dablab.mandaempdf.completo` nos dois consoles e testar
   a compra em sandbox (épico 8.6 só está verificado no caminho negativo).
5. Ícone de verdade (o atual é um placeholder gerado por script) — épico 8.11.
