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

### ~~Q2~~ — importar PDF ficou de fora · **DECIDIDO: fica fora** (27/08)

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

### ~~Q3~~ — prévia do PDF não renderiza a página · **DECIDIDO: fica como está** (27/08)

A tela 10.11 mostra os dados do arquivo e abre a visualização **no sistema**,
que já tem visualizador nativo. Renderizar dentro do app exige a mesma
dependência de visualizador da Q2. Mesma recomendação: deixar como está.

### ~~Q4~~ — reordenar por arrastar · **DECIDIDO: fica como está por enquanto** (27/08)

A montagem reordena por **setas ◀ ▶** na barra de ferramentas da página
selecionada, não por arrastar. O critério 8.3.2 pede arrastar. Funciona, mas
não é o gesto especificado. Implementar arrastar é ~100 linhas com
`reanimated` + `gesture-handler`, e é difícil de verificar sem device.

### ~~Q5~~ — lançamento e ícone · **DECIDIDO** (27/08)

- **iOS primeiro**, Android depois.
- **Ícone:** folha branca com canto dobrado sobre azul de sistema, com tarja
  vermelha escrita **PDF**. Já está em `assets/icon.png`.
- Continua aberta só a 25.Q5 do spec (menção cruzada ao Quando Vence?), que
  não bloqueia nada.

### Q1 continua aberta — e ganhou uma melhoria

Ver a seção 1 acima. Desde então a camada de OCR passou a **espalhar os
trechos verticalmente na ordem de leitura**, o que faz o realce da busca cair
na altura aproximadamente certa da página em vez de sempre no topo.

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

## 3. Android: três coisas que a máquina precisava

O Android **compila** (`BUILD SUCCESSFUL`, APK gerado, o plugin do scanner
entrou). Mas o caminho até lá teve três obstáculos, todos já resolvidos e
tornados duráveis:

1. **Faltava JDK 17.** A máquina tinha 21 e 25; o `@react-native/gradle-plugin`
   compila com `languageVersion 17` e o build morria antes de começar.
   Instalado via `brew install openjdk@17`.
2. **O plugin foojay-resolver é incompatível com o Gradle 9.** Ele baixaria o
   JDK sozinho, mas usa `JvmVendorSpec.IBM_SEMERU`, removido no Gradle 9 — que
   é o que o Expo SDK 55 fixa. É um **bug upstream do RN 0.83.2**. Desativado
   por patch (`patches/@react-native+gradle-plugin+0.83.2.patch`, aplicado no
   `postinstall` via `patch-package`).
3. **As propriedades de Gradle se perdiam a cada prebuild.** Viraram um config
   plugin próprio, `plugins/withPropriedadesGradle.js`, que aponta os JDKs do
   Homebrew e desliga o download automático. Verificado: sobrevive ao
   `expo prebuild`.

**Ainda não rodou em emulador.** O AVD `Pixel_10` está quebrado — aponta para
uma imagem de sistema (`android-37.2-beta3`) que não existe mais no SDK. O AVD
`iseelife_test` funciona, mas é `android-35/default`, **sem Google Play
Services** — e o ML Kit Document Scanner exige Play Services (risco R2 do
spec). Para testar o scanner no Android é preciso um AVD com Play Store ou um
aparelho real.

O APK debug saiu com **219 MB**, o que é normal em debug (todas as ABIs mais as
ferramentas de desenvolvimento). O limite de 60 MB da §17.4 vale para o
release com split por ABI — a verificar no épico 8.11.

## 4. Pegadinha do ambiente

O CocoaPods desta máquina quebra sem locale UTF-8. **Todo comando que toca
pods precisa de `LANG`:**

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

Sem isso o erro é `Unicode Normalization not appropriate for ASCII-8BIT`, que
não diz nada sobre a causa. Vale colocar `export LANG=en_US.UTF-8` no `~/.zshrc`.

---

## 5. O que foi verificado ao vivo no simulador

| Verificado | Resultado |
|---|---|
| Build iOS (SDK 55, New Architecture) | ✅ 0 erros |
| Build Android (Gradle 9, JDK 17) | ✅ `BUILD SUCCESSFUL`, APK gerado |
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

| **V1** — scanner com câmera real | ✅ **VERIFICADO em 27/08 pelo Alexandre**, no build 1.0.0(2) via TestFlight. Ficha preenchida à mão: detecção de borda, recorte e correção de perspectiva corretos, texto legível. |
| Redução de imagem (regra 11.3) | ✅ **MEDIDA em aparelho, 27/08.** O mesmo documento, antes e depois da correção: páginas de 3400/3689 px caíram para 2400 px exatos, e o arquivo de 3,56 MB para 1,76 MB — **51% menor, sem perda visível de legibilidade**. Confirma também que a compressão com alvo (11.10) voltou a ter o eixo de resolução. |
| Nome com colisão no mesmo dia (11.7) | ✅ saiu `Contrato-2026-08-27-2.pdf` |
| **V3** — texto transparente vira texto real no PDF | ✅ **VERIFICADO em 27/08.** O PDF sai com Helvetica embutida e 16 blocos de texto invisível; buscar "contrato", "aluguel", "Augusta" e "assinatura" acha todos. O OCR da Apple leu a página de teste quase sem erro. |
| Gate do OCR com a compra ativa | ✅ interruptor habilitado e sem selo |

**Não verificado ainda:** câmera real, compra em sandbox, Android em execução,
acessibilidade, modo escuro em uso.

---

## 5.b Rejeição 4.2 e o que fazer se voltar

**02/09/2026 — rejeitado na diretriz 4.2 (Minimum Functionality)**, revisado
num iPad Air. Causa provável identificada: as notas de revisão originais
ensinavam o caminho mais pobre do app ("importe duas fotos, exporte") e nunca
citavam os presets, o scanner com detecção de borda, o piso de compressão do
boleto nem a fusão frente e verso — tudo gratuito e tudo diferencial.

Notas reescritas (`notas-revisao-app-store.txt`), resposta enviada
(`resposta-app-review-4.2.md`), mesmo binário 1.0.0(3) reenviado.

**Se rejeitar de novo, o caminho é produto, não redação.** Em ordem de força:

1. **Extração de dados de nota fiscal** (roadmap 28.1) — lê valor, data e CNPJ
   do cupom e monta relatório de despesas. É o único que responde "fazer algo
   que não dava para fazer antes" sem espaço para discussão. Depende de o OCR
   ler papel térmico, o que ainda não foi testado.
2. **OCR gratuito** — a capacidade mais "app-like" que já existe pronta, e sai
   de graça em engenharia (muda um gate). Custo: perde um dos quatro itens
   pagos.
3. **Suporte a iPad** — tira o eixo do aparelho em que foi revisado. Não é o
   motivo declarado, então pode ser trabalho sem retorno.

## 5.c Analytics: decidido que NÃO (06/10/2026)

Proposta: registrar uso das principais funcionalidades no Visão de Produto.
**Decisão: não instrumentar este app.**

O motivo não é técnico. O app está publicado com cinco promessas de que não
coleta nada — a declaração "Data Not Collected" na App Store, a política de
privacidade ("não utiliza ferramentas de análise de uso"), a captura nº 4 da
vitrine ("Nem pra gente"), as notas de revisão (funciona em modo avião) e a
regra 14 do CLAUDE.md. Um único evento enviado torna todas falsas, e
declaração de privacidade falsa é motivo de remoção do app.

Além disso: sem servidor, a chave de ingestão iria dentro do binário, de onde
qualquer pessoa consegue extrair e injetar evento falso.

**O que fazer no lugar:** medir pelos painéis das lojas, como a seção 21 do
spec já previa — instalações, conversão da compra, nota e travamentos. Se for
preciso aprender a usar o Visão de Produto, instrumentar um app em que
privacidade não seja o argumento de venda.

## 6. Versão iOS — o que já está pronto e o que depende de você

**Pronto (27/08, de manhã):**

- `eas.json` configurado nos moldes do Hora do Remédio.
- Ficha completa da App Store em `app-store-connect-manda-em-pdf.md`, com todos
  os campos medidos e dentro do limite.
- Seção nova da Política de Privacidade escrita, deixando explícito que Firebase,
  Crashlytics e notificações **não** se aplicam a este app — senão o documento
  compartilhado contradiria a resposta "Data Not Collected" da ficha.
- Ícone com a palavra PDF, 1024 opaco.
- As pegadinhas de submissão conferidas no projeto gerado: `CFBundleIconName`,
  `TARGETED_DEVICE_FAMILY = 1`, `ITSAppUsesNonExemptEncryption` e o
  `PrivacyInfo.xcprivacy`.

**Feito por ele em 27/08:** App ID registrado no portal, app criado no App
Store Connect (`ascAppId 6806063899`, já no `eas.json`), produto de compra
criado, chave `.p8` copiada para `secrets/`.

**Feito por mim:** projeto EAS criado e vinculado
(`bcab83cf-22c4-4b39-af38-41bed641b385`), config de build validada, as seis
capturas 1242×2688 mais a captura limpa da tela de compra para a revisão do IAP.

**O único passo que sobrou para ele:** rodar
`npx eas-cli@latest build --platform ios --profile production` no terminal.
O EAS precisa criar o certificado de distribuição e o perfil de
provisionamento do bundle novo, e isso exige Apple ID + senha + 2FA. É uma
vez só — depois o EAS guarda as credenciais na conta Expo e os builds
seguintes rodam sem interação. O `eas submit` eu consigo rodar sozinho,
porque usa a chave de API, não a senha.

**Risco de segurança corrigido no caminho:** o `eas.json` apontava para
`./secrets/` sem a pasta estar no `.gitignore` — a chave privada da App Store
Connect teria ido para o repositório. Corrigido antes de a chave ser copiada,
e conferido com `git check-ignore`.

**Capturas de tela — pendente, com dois caminhos.** A App Store exige o
conjunto de **6.9" (1320 × 2868)**, maior que o simulador iPhone 16e usado no
desenvolvimento. Compilei e instalei no iPhone 17 Pro Max, mas o simulador não
renderizou (screenshot saindo com 0 byte — problema do simulador, não do app).
Os dois caminhos para hoje à noite:

1. **Capturas cruas do simulador 6.9"** — insistir no Pro Max, que já está com
   o app instalado. É o caminho literal.
2. **Telas de marketing montadas a partir do canvas de design** — que é o que a
   maioria dos apps da loja realmente publica, inclusive o Scanner App que serviu
   de referência (aquelas com "Extract and Edit Text" em cima do aparelho). As 20
   telas do canvas estão em 393 × 852, e a proporção bate quase exatamente com
   1320 × 2868, então escalam limpo. Este caminho dá um resultado melhor na
   vitrine, mas é decisão de produto — que headline vai em cada tela — então
   preferi não escolher sozinho.

**Ainda não dá para submeter sem:** testar a compra em **sandbox num iPhone
físico** (o épico 8.6 só está verificado no caminho negativo, quando a loja não
responde) e testar o **scanner com a câmera de verdade** — o simulador não tem
câmera, então a função principal do app nunca rodou de fato.

## 7. Sugestão de ordem para amanhã

1. Decidir **Q1** (é o que destrava o épico 8.8 fechar de vez).
2. Rodar no **emulador Android** — só o build foi verificado, o app nunca
   abriu. Precisa de um AVD novo **com Google Play Services** (o `Pixel_10`
   está quebrado e o `iseelife_test` não tem Play Services).
3. Testar o **scanner de verdade** em iPhone físico (fecha a validação V1).
4. Criar o produto `com.dablab.mandaempdf.completo` nos dois consoles e testar
   a compra em sandbox (épico 8.6 só está verificado no caminho negativo).
5. Ícone de verdade (o atual é um placeholder gerado por script) — épico 8.11.
