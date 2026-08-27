# Manda em PDF — Especificação de Software (SDD)

| Campo | Valor |
|---|---|
| **Versão do documento** | 1.5 |
| **Responsável de produto** | Alexandre Siqueira (Dab Lab) |
| **Status** | rascunho — aguardando revisão da seção 24 |
| **Data** | 26 de agosto de 2026 |
| **Mudanças na 1.1** | Stack fixada em **Expo SDK 56** (era 57) — nova seção 4.5 com o porquê; piso iOS 16.4; requisitos de máquina (Xcode 26.4, Node 20.19.4, TS 6.0.3); pegadinhas do SDK 56 na tabela 4.2; assunção A13 |
| **Mudanças na 1.5** | Exceção declarada na regra de cor: ação de deslizar-para-apagar usa o padrão do iOS (vermelho preenchido) · §10.1 e §11.6 deixam explícito que **Novo PDF** é o caminho sem preset e que não existe cartão "Outros" |
| **Mudanças na 1.4** | **Reposicionamento:** o foco sai de documento de identidade e vai para **papel que ninguém digitaliza por você** — contrato, imóvel, procuração, nota fiscal e boleto. CPF e título de eleitor saíram; RG e CNH continuam, em segundo plano. §1, §3, §7.2, §8.7, §11.1, §11.6, §11.10 e §15 reescritas · **presets passaram a ser gratuitos** (§11.1) — o que se paga é capacidade, e presets são só pré-configuração · nova regra 11.10.1: piso de compressão do boleto por causa do código de barras |
| **Mudanças na 1.3** | Stack fixada em **Expo SDK 55** (era 56) — o SDK 56 exige Xcode 26.4, que exige macOS Tahoe, que o Alexandre não tem; §4.5 reescrita · piso iOS 15.1 · pegadinhas trocadas para as do SDK 55 · §16 alinhada aos tokens reais do design system (raio 14, margem 20, cinzas do Hora do Remédio) |
| **Mudanças na 1.2** | **Paleta e tipografia trocadas para o padrão nativo da Apple** (§16, azul de sistema no lugar do vermelho de marca) · **Ajustes de saída viraram opcionais** — o caminho principal perdeu uma tela (§8.4, §10.6) · princípio P2 e §1 reescritos em torno de compartilhar, que é a razão de ser do app |
| **Plataformas** | iOS e Android (React Native / Expo) |

---

## Como usar este documento

Este é o documento-fonte do app **Manda em PDF**. Ele existe para ser colado num agente de código (Claude Code) e implementado sem que o agente precise inventar decisão nenhuma.

- Quem consome: Claude Code, na pasta `~/manda-em-pdf`.
- O que manda: quando código e spec divergirem, o spec vence — ou o spec é atualizado antes.
- **Leia a seção 24 (Assunções declaradas) antes de gerar qualquer código.** São decisões que eu tomei sem perguntar. Assunção não revisada vira verdade no minuto em que o agente começa a codar.
- A numeração das seções é estável. Conversas futuras vão dizer "regra 11.3", "épico 8.7" — não renumere.

---

## 0. Princípios não-negociáveis

Estas são as regras de desempate. Diante de qualquer dúvida de UX, de copy ou de trade-off técnico, resolva a favor destes princípios.

| # | Princípio | O que significa na prática |
|---|---|---|
| **P1** | **Ferramenta de passagem, não cofre** | O app é usado, resolve e sai do caminho. Não organiza, não classifica, não pede cadastro, não vira biblioteca. Toda feature que peça manutenção do usuário está fora. |
| **P2** | **Do abrir ao compartilhar em até 4 toques** | Abrir → Novo PDF → escanear → **Compartilhar**. Toda tela do caminho principal precisa justificar por que não cabe num passo já existente — e a resposta padrão é que não cabe: **corte a tela**. Configuração é sempre opcional e nunca fica no caminho. O produto não compete em recurso, compete em **atrito**. |
| **P3** | **O documento nunca sai do aparelho** | Zero upload, zero servidor, zero conta. Processamento 100% on-device. É requisito de produto, não só de privacidade: é o que permite mandar RG e contrato sem pensar duas vezes. |
| **P4** | **Nunca bloquear quem não pagou** | A versão gratuita funciona para sempre, sem contador e sem marca d'água. O que se compra é capacidade a mais (mais páginas, presets, OCR, compressão), nunca o direito de usar. |
| **P5** | **Simplicidade antes de complexidade prematura** | Sem estado global elaborado, sem abstração antecipada, sem dependência que faça só um pouco mais do que precisamos. Menos peça é mais app editável por prompt daqui a seis meses. |

---

## 1. Visão e problema

**Manda em PDF** transforma documento de papel ou foto em PDF pronto para enviar, em segundos, sem que nada saia do aparelho.

O problema é um pedido cotidiano e específico: *"me manda o RG em PDF"*, *"anexe o contrato em PDF, máximo 5 MB"*, *"o comprovante tem que ser um arquivo só"*. Hoje a pessoa resolve isso mal — tira uma foto torta e manda JPG que o site recusa, ou instala um scanner genérico cheio de recurso que ela nunca vai usar, com anúncio e assinatura. A dor não é organizar documento; é **entregar um arquivo no formato certo, agora**.

O recorte do produto é **o papel que ninguém digitaliza por você**: contrato, escritura e matrícula de imóvel, procuração, nota fiscal, boleto, certidão, recibo. Documento com foto (RG, CNH) continua atendido, mas **não é o centro**.

**Por que não é o centro.** O RG e a CNH já saem prontos em PDF do **gov.br**, da **CNH Digital** e da Carteira de Trabalho Digital. Competir ali é competir com o emissor oficial do documento, que sempre vai ganhar. O contrato assinado à mão, a escritura que veio do cartório, a procuração, a nota fiscal em papel térmico e o boleto impresso não têm emissor digital nenhum do lado do usuário — são papel, e continuam papel.

**Por que este app existe, se já dá para resolver de outro jeito.** Dá para mandar a foto para um chatbot e pedir o PDF, e existem dezenas de scanners na loja. O que nenhum deles entrega é o **caminho curto**: o pedido chega pelo WhatsApp, e a resposta precisa voltar pelo WhatsApp em segundos, com o documento enquadrado e num arquivo só. O produto não ganha por ter mais recurso — ganha por ter **menos passo entre o documento na mão e o arquivo enviado**. Toda decisão de escopo se subordina a isso: **escanear rápido e compartilhar fácil** (WhatsApp, AirDrop, e-mail, o que o sistema oferecer).

### Anti-escopo — o que o Manda em PDF explicitamente não é

- **Não é cofre de documentos.** Não guarda, não organiza em pastas, não tem busca, não tem senha, não tem cofre biométrico. O histórico existe só para reenviar o que acabou de ser gerado.
- **Não é lembrete de vencimento.** Isso é o app **Quando Vence?**, que continua sendo produto separado. O Manda em PDF não trata datas de validade.
- **Não é editor de PDF.** Não abre PDF de terceiro para anotar, assinar ou preencher formulário.
- **Não é conversor de formatos de escritório.** Nada de DOC, XLS, PPT — nem entrada, nem saída. Só imagem e PDF.
- **Não é app de assinatura digital.** Sem assinatura desenhada, sem carimbo, sem certificado ICP-Brasil.
- **Não tem conta, login, nuvem ou sincronização.**

---

## 2. Personas e cenários de uso

### Persona única: a pessoa comum resolvendo burocracia

Não é profissional de escritório. É quem, algumas vezes por ano, precisa entregar um documento digitalizado — e nesse dia precisa muito.

### Cenário A — o pedido no WhatsApp *(caminho principal)*
Alguém pede o RG. A pessoa está de pé, com o documento na mão e o celular na outra. Precisa de frente e verso, num arquivo só, agora. **É o cenário que define o desenho**: uma mão, pressa, sem paciência para configurar nada.

### Cenário B — o upload que recusa o arquivo
Site de concurso, banco ou prefeitura: "PDF, máximo 5 MB". A pessoa já tem as fotos, já tentou mandar e foi recusada. Chega ao app **frustrada e no meio de outra tarefa** — o app precisa resolver e devolvê-la para o navegador.

### Cenário C — o contrato de 12 páginas
Sentada à mesa, com um documento longo. Aqui a tolerância a passos é maior, mas o volume é o desafio: escanear em lote sem reordenar página por página.

### Momento mais difícil de uso
O Cenário A, em pé e com pressa. É por causa dele que a captura precisa ser a **primeira coisa** que acontece ao abrir o app, e que o preset de RG existe.

---

## 3. Escopo do MVP

### 3.1 Dentro do MVP

| # | Item |
|---|---|
| D1 | Captura por câmera com detecção automática de bordas e correção de perspectiva (scanner nativo) |
| D2 | Importar imagens da galeria de fotos |
| D3 | Importar imagens e PDFs do app Arquivos |
| D4 | Montagem do documento: reordenar, girar, recortar e excluir páginas |
| D5 | Filtros de digitalização: original, preto e branco, escala de cinza, clarear |
| D6 | Geração do PDF (A4 e Carta, retrato e paisagem) |
| D7 | Compartilhar via folha nativa do sistema e salvar em Arquivos |
| D8 | Histórico simples dos PDFs gerados, com reenviar e apagar |
| D9 | Presets de documento (contrato, imóvel, procuração, nota fiscal, boleto, RG, CNH) — cada um já com filtro, papel e nome certos *(grátis)*; a fusão de frente e verso numa página só é *(pago)* |
| D10 | Multipágina acima de 2 páginas *(pago)* |
| D11 | OCR com camada de texto invisível — PDF pesquisável *(pago)* |
| D12 | Compressão com alvo de tamanho (2 / 5 / 10 MB) *(pago)* |
| D13 | Compra vitalícia única, com restaurar compra, nas duas lojas |
| D14 | Modo escuro |
| D15 | Publicação na App Store e na Google Play |

### 3.2 Fora do MVP

| Item | Destino | Motivo / dependência |
|---|---|---|
| Assinatura e carimbo no documento | **Descartado** | É outro produto (editor de PDF). Fere P1 e o anti-escopo. |
| Conversão para DOC / XLS / PPT | **Descartado** | Exige servidor ou biblioteca pesada — fere P3 e P5. É o item que mais infla app de scanner sem ser usado. |
| Leitor de QR Code | **Descartado** | Nada a ver com a dor. Câmera do sistema já faz. |
| Extração de dados de recibo (valor, data, CNPJ) | **Adiado — v2** | Ver 28.1. Depende de o OCR do MVP provar qualidade em nota fiscal brasileira. |
| Pastas, busca e organização do histórico | **Adiado — v3** | Ver 28.2. Só entra se o histórico simples se mostrar insuficiente no uso real. |
| Trava biométrica do histórico | **Adiado — v2** | Ver 28.3. Barato de fazer (`expo-local-authentication`), mas fora do caminho principal do MVP. |
| Reeditar um PDF já gerado | **Adiado — v2** | Ver 28.4. Exige persistir as páginas de origem, não só o PDF final — muda o modelo de dados (seção 7). |
| Marca d'água na versão gratuita | **Descartado** | Fere P4 e é inaceitável em documento pessoal: ninguém envia um RG carimbado com propaganda. |
| Idiomas além de português | **Adiado — v2** | Ver 28.5. Depende de o app provar tração no Brasil primeiro. |
| Versão iPad / tablet | **Adiado — v3** | Ver 28.6. O uso é de mão, em pé; tablet não é o cenário. |

---

## 4. Arquitetura

### 4.1 Projeto de referência

**Hora do Remédio** (`~/hora-do-remedio`) é o projeto de referência: mesmo dono de conta Expo (`alexsiq`), mesma organização de pastas, mesmo padrão de `spec.md` + `DOCUMENTACAO-TECNICA.md` + `SCHEMA.md`, mesmo fluxo de build e submissão via EAS. Reaproveite convenções de lá sempre que couber, ajustando o que a seção 4.2 muda de propósito.

Diferença central: o Hora do Remédio é **iOS-only, SDK 54**. O Manda em PDF é **iOS + Android, SDK 55**.

### 4.2 Stack

| Camada | Escolha | Versão-alvo | Por quê | Alternativa descartada |
|---|---|---|---|---|
| Framework | **Expo (com prebuild / dev client)** | **SDK 55** | Um código, duas lojas. Alexandre já opera EAS pelo Hora do Remédio. Escolhido por 4.5: é o SDK mais novo que **roda na máquina dele hoje**. | React Native puro — perde EAS, config plugins e o caminho de submissão já conhecido. **SDK 57** e **SDK 56** — descartados por 4.5 (exigem Xcode 26.4+, que exige macOS Tahoe). **SDK 54** — descartado: lançado em 10/09/2025, perde suporte na próxima release. |
| Runtime | React Native | 0.83 (vem no SDK 55) · React 19.2 | Acompanha o SDK. New Architecture ligada por padrão. | — |
| Linguagem | TypeScript | a que o SDK 55 traz (5.9.x) | Versão amarrada ao SDK, não escolha nossa. **Atenção:** no SDK 55, `app.config.ts` passa a ser transpilado pelo TypeScript do projeto. | — |
| Navegação | `expo-router` | 55.0.x | Mesmo padrão do Hora do Remédio. | React Navigation cru — mais boilerplate sem ganho. |
| Banco local | `expo-sqlite` + **Drizzle ORM** | 55.0.x / drizzle 0.45+ | Mesmo par do projeto de referência; migrations versionadas. | AsyncStorage — sem consulta nem migration para o histórico. |
| Scanner | **`react-native-document-scanner-plugin`** | 2.0.4+ | Usa **VisionKit** no iOS e **ML Kit Document Scanner** no Android — mesma qualidade dos apps nativos, sem custo. Suporta New Architecture e tem uso documentado com Expo. | `@dariyd/react-native-document-scanner` (2.0.19) — mais recente e com Fabric no iOS, mas **sem config plugin de Expo documentado**. Mantido como plano B (ver risco R1). |
| Geração de PDF | **`expo-print`** (`printToFileAsync`) | 55.0.x | Nativo, sem polyfill, sem dependência morta. Renderiza HTML → PDF, o que também viabiliza a camada de texto invisível do OCR (regra 11.9). | `react-native-pdf-lib` — **abandonado, último release em fev/2020**. `@cantoo/pdf-lib` — vivo, mas exige polyfills de Buffer/base64 em RN; fica como plano B se precisarmos de manipulação fina de PDF. |
| OCR | **`expo-text-extractor`** | 2.0.0+ | Módulo Expo que usa **Apple Vision** no iOS e **ML Kit** no Android, on-device. Exige SDK 52+. | `@react-native-ml-kit/text-recognition` — força ML Kit também no iOS, aumentando o binário sem ganho. |
| Imagem | `expo-image-manipulator` | 55.0.x | Rotação, recorte, redimensionamento e qualidade JPEG — base da compressão com alvo (regra 11.10). | Biblioteca de terceiro — desnecessária. |
| Arquivos | `expo-file-system` | 55.0.x | Sandbox do app, escrita e leitura dos PDFs. | — |
| Compartilhar | `expo-sharing` | 55.0.x | Folha nativa do sistema nas duas plataformas. | — |
| Origem: fotos | `expo-image-picker` | 55.0.x | Galeria. | — |
| Origem: arquivos | `expo-document-picker` | 55.0.x | App Arquivos / SAF. | — |
| Compra | **`expo-iap`** | 5.4.0+ | Produto não-consumível nas duas lojas, sem servidor. Ativíssimo (release em 26/08/2026). | RevenueCat (`react-native-purchases`) — excelente, mas é serviço externo, conta a mais e complexidade de assinatura que não temos (P5). Reavaliar só se o modelo virar assinatura. |
| Ícones | `@expo/vector-icons` | 15.x | Igual ao projeto de referência. | — |

### 4.3 Onde roda e onde vive

- **Repositório:** `~/manda-em-pdf`, git local + repositório **privado** no GitHub (`asiqueira1973/manda-em-pdf`), no mesmo padrão dos demais apps.
- **Backend:** **não existe.** Nenhum servidor, nenhuma API, nenhum banco remoto. Todo dado vive no aparelho (P3).
- **Build:** EAS Build para as duas plataformas.
- **Submissão:** App Store Connect e Google Play Console, seguindo `~/roteiro-publicar-play-store.md` no Android.
- **Bundle / applicationId:** `com.dablab.mandaempdf` nas duas plataformas.
- **Conta Apple:** Dab Lab. **Conta Google Play:** organização Dab Lab Developer (usuário `u/1`).
- **Mínimos do app:** iOS **15.1** (piso do SDK 55); Android **API 24** (7.0) — mas o ML Kit Document Scanner exige **Google Play Services**, ver risco R2.
- **Mínimos da máquina de desenvolvimento (SDK 55):** **Xcode 26+**, **Node 20.19.4+ / 22.13+ / 24.3+**.
  - ✅ **Verificado em 26/08/2026 na máquina do Alexandre: Xcode 26.1.1 e Node 22.20.0 — ambos atendem.** Nada a atualizar antes de começar.
- **Android:** o SDK 55 torna o **edge-to-edge obrigatório** ao mirar Android 16+ — as telas precisam respeitar as áreas seguras desde o primeiro épico, não como acerto no fim.

### 4.5 Por que SDK 55

Decisão registrada para não ser revertida em silêncio daqui a três meses.

| SDK | Lançamento | Xcode mínimo | Veredito |
|---|---|---|---|
| 54 | 10/09/2025 | 16.1 | **Descartado.** É o do Hora do Remédio, mas vai fazer um ano e perde as correções críticas na próxima release. |
| **55** | **25/02/2026** | **26** | **Adotado.** |
| 56 | 20/05/2026 | 26.4 | Descartado — ver abaixo. |
| 57 | 30/06/2026 | 26.4+ | Descartado — ver abaixo. |

Três motivos, nesta ordem:

1. **É o SDK mais novo que roda na máquina do Alexandre hoje.** Isto foi verificado, não suposto: a máquina está em **macOS 15.7.2 Sequoia** com **Xcode 26.1.1** (instalado pela Mac App Store). O **Xcode 26.4 em diante exige macOS Tahoe 26.2+** — até o 26.3 roda no Sequoia, do 26.4 em diante não. Como o SDK 56 pede Xcode 26.4, adotá-lo obrigaria a **subir o sistema operacional inteiro antes de escrever a primeira linha**. O SDK 55 pede apenas Xcode 26. Não custa nada e começa hoje.
2. **É a política do Alexandre.** No `spec.md` do Hora do Remédio está escrito, com todas as letras: *"fixar — não usar a mais recente"*. O 55 satisfaz isso com folga.
3. **Reduz o risco R1.** O `react-native-document-scanner-plugin` foi publicado em **02/01/2026** — é da era do SDK 55. Ele é a **função principal do app**; sem scanner não há produto. É o SDK com maior chance de já ter sido exercitado com esse plugin.

**O que isso NÃO bloqueia:** publicar. Quem compila o iOS é o **EAS Build na nuvem**, como já acontece no Hora do Remédio — o Xcode local só importa para rodar o Simulador durante o desenvolvimento.

**Quando reavaliar:** quando o Alexandre subir para o macOS Tahoe por outro motivo, ou quando o SDK 55 estiver a um release de perder suporte. O app é pequeno e sem backend — o upgrade de SDK é dos mais simples que existem.

### 4.4 Premissas a validar antes de qualquer tela *(bloqueantes)*

| # | Premissa | Como validar |
|---|---|---|
| **V1** | `react-native-document-scanner-plugin` funciona em Expo SDK 55 com New Architecture, nas duas plataformas | App de teste mínimo: prebuild, rodar no simulador iOS e no emulador Android, escanear e obter os caminhos das imagens |
| **V2** | `expo-print` gera PDF multipágina com imagens em base64 sem estourar memória em 15 páginas | Gerar PDF de 15 páginas de 3 MB cada e medir tempo e pico de memória |
| **V3** | Texto com `color: transparent` no HTML sobrevive como texto **selecionável** no PDF do `expo-print`, nas duas plataformas | Gerar PDF de teste e abrir no Preview do macOS e no Drive, buscando por uma palavra |
| **V4** | `expo-text-extractor` retorna **bounding boxes**, não só a string do texto | Sem boxes, a camada invisível do OCR não é posicionável — cai o item D11 como especificado (ver risco R3) |

**Nenhum épico depois do 8.1 começa antes de V1 a V4 estarem respondidas.** Se alguma falhar, pare e reporte antes de improvisar.

---

## 5. Perfis de usuário e matriz de permissões

**Não se aplica.** O app tem um único perfil (a pessoa dona do aparelho), sem login, sem conta, sem servidor e sem dado compartilhado entre usuários. Não existe autorização a modelar.

A única distinção de capacidade é **gratuito vs. comprado**, e ela não é permissão de segurança — é gate de produto, especificado na seção 11.1. Registrado aqui explicitamente para não parecer esquecimento.

## 6. Autenticação e identidade

**Não se aplica.** Não há login, cadastro, senha, recuperação de senha nem sessão. O único estado de identidade do app é "comprou ou não comprou", e ele vem da loja (Apple / Google), associado à conta da loja da pessoa — não a uma conta nossa.

Consequência prática, que precisa estar clara: **trocar de aparelho não perde a compra** (é só usar "Restaurar compra" com o mesmo Apple ID / conta Google), mas **trocar de plataforma perde** — quem comprou no iPhone e migrou para Android compra de novo. É limitação das lojas quando não há conta própria; é o preço de não ter servidor (P3, P5). O texto da seção 15 deixa isso explícito na tela de compra.

---

## 7. Modelo de dados

Banco local **SQLite** (`expo-sqlite`) acessado por **Drizzle ORM**. Nomes de tabelas, colunas e enums em **português**, `snake_case` (seção 18).

O modelo é deliberadamente pequeno: o app é ferramenta de passagem (P1). **A montagem do documento em andamento vive em memória, não no banco** — só o PDF finalizado é persistido.

### 7.1 Diagrama de relacionamento

```
┌──────────────────────┐        ┌──────────────────────┐
│     documentos       │        │    preferencias      │
│  (histórico de PDFs) │        │  (chave → valor)     │
└──────────────────────┘        └──────────────────────┘
        (sem relação)                  (sem relação)
```

Não há relacionamento entre as tabelas. `documentos` é o histórico; `preferencias` é um armazenamento chave-valor de configuração do app. **Isto é intencional** e é consequência de o app não guardar as páginas de origem — ver o trade-off em 7.5.

### 7.2 Tabela `documentos`

Histórico dos PDFs gerados. Uma linha por PDF que o app produziu.

| Coluna | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `id` | `text` (uuid) | não | gerado no app | Chave primária. |
| `nome_arquivo` | `text` | não | — | Nome exibido e nome do arquivo no disco, com extensão `.pdf`. Regra de formação em 11.7. |
| `caminho_arquivo` | `text` | não | — | Caminho **relativo** dentro do diretório de documentos do app. Nunca absoluto — ver 11.8. |
| `total_paginas` | `integer` | não | — | Quantidade de páginas do PDF. |
| `tamanho_bytes` | `integer` | não | — | Tamanho do arquivo no disco, em bytes. |
| `tipo_documento` | `tipo_documento` | não | `'livre'` | Preset usado na geração. `'livre'` quando não houve preset. |
| `tem_ocr` | `integer` (0/1) | não | `0` | `1` se o PDF tem camada de texto pesquisável. |
| `orientacao` | `orientacao` | não | `'retrato'` | Orientação das páginas. |
| `tamanho_papel` | `tamanho_papel` | não | `'a4'` | Tamanho do papel usado. |
| `criado_em` | `integer` (epoch ms) | não | agora | Momento da geração. Ordenação padrão do histórico é por este campo, decrescente. |

**Enums**

```
tipo_documento : livre | contrato | imovel | procuracao | nota_fiscal | boleto | rg | cnh | certidao | recibo | comprovante
orientacao     : retrato | paisagem
tamanho_papel  : a4 | carta
```

**Constraints e índices**
- `PRIMARY KEY (id)`
- `UNIQUE (caminho_arquivo)` — dois registros nunca apontam para o mesmo arquivo.
- `CHECK (total_paginas >= 1)`
- `CHECK (tamanho_bytes > 0)`
- Índice `idx_documentos_criado_em` em `criado_em DESC` — é a única ordenação usada.

**Estratégia de exclusão: hard delete.** Nada referencia `documentos`, o registro não tem valor histórico, e manter linha órfã de um arquivo apagado contraria P1. **Apagar a linha apaga o arquivo do disco na mesma transação lógica** — a regra 11.8 define a ordem.

### 7.3 Tabela `preferencias`

Armazenamento chave-valor da configuração do app. Uma linha por chave.

| Coluna | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `chave` | `text` | não | — | Chave primária. |
| `valor` | `text` | não | — | Valor serializado como texto. O código converte na leitura. |
| `atualizado_em` | `integer` (epoch ms) | não | agora | Última escrita. |

**Chaves previstas**

| Chave | Valores | Default | Para que serve |
|---|---|---|---|
| `onboarding_visto` | `'0'` \| `'1'` | `'0'` | Se a tela de boas-vindas já foi exibida. |
| `compra_liberada` | `'0'` \| `'1'` | `'0'` | **Cache local** do estado da compra. Ver 11.4 — a loja é a fonte de verdade, isto é só otimização para não travar a UI enquanto a loja responde. |
| `tamanho_papel_padrao` | `'a4'` \| `'carta'` | `'a4'` | Último tamanho escolhido. |
| `filtro_padrao` | `'original'` \| `'pb'` \| `'cinza'` \| `'clarear'` | `'original'` | Último filtro escolhido. |
| `total_pdfs_gerados` | número como texto | `'0'` | Contador acumulado, só para decidir quando pedir avaliação na loja (regra 11.12). **Nunca usado como gate de pagamento** (P4). |
| `avaliacao_pedida` | `'0'` \| `'1'` | `'0'` | Se o pedido de avaliação já foi feito. A regra 11.12 exige "nunca foi pedido antes" — sem esta chave a regra não teria como ser cumprida. |

**Exclusão:** não se apaga linha de `preferencias`; sobrescreve-se o valor. "Apagar tudo" (épico 8.10) restaura os defaults.

### 7.4 Migrations e seed

- Migrations versionadas por **Drizzle Kit** (`npm run db:generate`), aplicadas na abertura do app, igual ao Hora do Remédio.
- **Seed:** na primeira execução, inserir as seis chaves de `preferencias` com os defaults da tabela acima. `documentos` nasce vazia.

### 7.5 Trade-off declarado — não guardamos as páginas de origem

Só o PDF final é persistido; as imagens capturadas são descartadas depois da geração.

- **Ganho:** modelo mínimo, sem tabela de páginas, sem gestão de arquivos órfãos, e muito menos espaço ocupado no aparelho — coerente com P1 e P5.
- **Custo:** **não dá para reeditar um PDF já gerado.** Trocar uma página exige escanear tudo de novo.
- **O que isso impede no futuro:** o item "reeditar PDF" (28.4) exigirá uma tabela `paginas_documento` e mudança nesta seção. É uma migration aditiva, não uma reescrita.

---

## 8. Épicos e critérios de aceite

Implementar **nesta ordem**. Cada épico só começa quando o anterior passou em todos os seus critérios. Critério de aceite aqui é binário: ou passa, ou não passa.

### 8.1 Fundação do projeto

**Objetivo:** projeto Expo rodando nas duas plataformas, com banco, navegação, tema e as premissas da seção 4.4 validadas.

**Escopo:** criação do projeto SDK 55 com prebuild; `expo-router`; `expo-sqlite` + Drizzle com as duas tabelas da seção 7 e o seed; tema claro/escuro da seção 16; `CLAUDE.md`, `README.md`, `.gitignore`; scripts `typecheck`, `lint`, `test`, `db:generate`; **e os quatro experimentos de validação V1–V4**.

**Critérios de aceite**
1. `npm run typecheck` termina sem erro.
2. `npx expo run:ios` abre o app no simulador; `npx expo run:android` abre no emulador.
3. Na primeira abertura, o banco é criado e `preferencias` contém exatamente as 6 chaves da seção 7.3 com os valores default.
4. Fechar e reabrir o app não recria nem duplica as linhas de `preferencias`.
5. Alternar o tema do sistema entre claro e escuro troca as cores do app sem reiniciar.
6. **V1** — um botão de teste abre o scanner nativo nas duas plataformas e devolve ao console os caminhos das imagens capturadas.
7. **V2** — um botão de teste gera um PDF de 15 páginas com imagens de ~3 MB; o arquivo abre íntegro e o app não cai.
8. **V3** — o PDF de teste contém texto **selecionável e pesquisável** apesar de invisível, verificado fora do app.
9. **V4** — `expo-text-extractor` devolve, para uma imagem de teste, as **coordenadas** de cada trecho reconhecido, não apenas a string.
10. Qualquer falha em V1–V4 está **escrita no relatório do épico**, com a alternativa proposta, antes de seguir para 8.2.

---

### 8.2 Captura de páginas

**Objetivo:** trazer páginas para dentro do app pelas três origens.

**Fluxo**
1. Home → **Novo PDF**.
2. Abre a folha de origem com três opções: **Escanear**, **Escolher das Fotos**, **Importar de Arquivos**.
3. **Escanear** → abre o scanner nativo (VisionKit / ML Kit), com detecção de borda e correção de perspectiva. Aceita múltiplas capturas na mesma sessão.
4. **Fotos** → seleção múltipla de imagens.
5. **Arquivos** → seleção múltipla de imagens e PDFs. PDF importado entra como uma página por página do original.
6. Terminada a origem, vai para a tela de Montagem (8.3).

**Estados**
- *Carregando:* importando arquivo grande → indicador com contagem ("Importando 3 de 8").
- *Vazio:* usuário cancelou sem capturar nada → volta para a Home, sem mensagem de erro.
- *Erro:* permissão de câmera negada → alerta com texto de 15.4 e botão que abre os Ajustes do sistema.

**Critérios de aceite**
1. Escanear 3 páginas seguidas produz 3 páginas na Montagem, na ordem em que foram capturadas.
2. Detecção de borda recorta e endireita o documento sem intervenção manual, num papel sobre mesa de cor contrastante.
3. Escolher 5 fotos da galeria produz 5 páginas na mesma ordem da seleção.
4. Importar um PDF de 4 páginas produz 4 páginas.
5. Importar um arquivo que não é imagem nem PDF exibe a mensagem de 15.5 e **não** adiciona página.
6. Negar a permissão de câmera não derruba o app e mostra o caminho para os Ajustes.
7. Cancelar o scanner sem capturar volta para a Home sem criar documento.

---

### 8.3 Montagem do documento

**Objetivo:** revisar e ajustar as páginas antes de gerar o PDF.

**Fluxo**
1. Grade de miniaturas numeradas, na ordem atual.
2. Por página: **girar 90°**, **recortar**, **filtro**, **excluir**.
3. Arrastar para reordenar.
4. Botão **Adicionar páginas** volta à folha de origem (8.2) e anexa ao final.
5. Botão **Gerar PDF** vai para os Ajustes de saída (8.4).

**Estados**
- *Vazio:* excluir a última página mostra o estado vazio com o botão de adicionar; **não** volta sozinho para a Home.
- *Carregando:* aplicar filtro ou recorte mostra spinner sobre a miniatura afetada, sem travar a tela.

**Critérios de aceite**
1. Girar uma página 4 vezes devolve a página à orientação original.
2. Reordenar por arrastar altera a numeração das miniaturas imediatamente.
3. Excluir a página 2 de 3 renumera as restantes para 1 e 2.
4. O filtro escolhido pode ser aplicado a **uma página** ou a **todas**, e a escolha aparece explícita na interface.
5. Recortar uma página altera a miniatura e o resultado no PDF final.
6. Adicionar páginas anexa ao final sem alterar a ordem do que já existia.
7. Sair da Montagem pede confirmação (texto de 15.6) e descartar apaga as imagens temporárias do disco.

---

### 8.4 Geração do PDF, compartilhamento e salvamento

**Objetivo:** produzir o arquivo e entregá-lo — é o fim do caminho principal (P2).

**Fluxo (caminho principal — 8.4.a)**
1. Na Montagem, o botão primário **Gerar PDF** gera **direto**, com os padrões guardados em `preferencias`. **Não passa por tela de ajuste.**
2. Tela **Pronto**: prévia da primeira página, nome, número de páginas, tamanho em disco.
3. Ação primária: **Compartilhar** (folha nativa). Secundárias: **Salvar em Arquivos**, **Novo PDF**.
4. O registro entra em `documentos` no momento da geração bem-sucedida.

**Fluxo opcional (8.4.b)** — quem quer configurar toca em **Opções**, ao lado do botão Gerar, e chega à tela de Ajustes de saída: nome do arquivo (pré-preenchido pela regra 11.7), tamanho do papel, orientação e — quando comprado — OCR e compressão. Confirmar volta à Montagem com as escolhas aplicadas àquela geração.

**Por que assim:** a tela de ajuste no caminho principal custava um toque e uma leitura a todo mundo para servir a minoria que muda alguma coisa. Fere P2. O que a pessoa escolhe uma vez vira padrão (`preferencias`) e ela não escolhe de novo.

**Estados**
- *Carregando:* barra de progresso com o texto de 15.7. Acima de 5 páginas, mostrar "página X de Y".
- *Erro:* falha na geração → mensagem de 15.8, com as páginas **preservadas** para nova tentativa. Nunca perder o trabalho do usuário.

**Critérios de aceite**
1. PDF de 2 páginas abre íntegro no Preview do macOS e no visualizador do Android, com as duas páginas na ordem certa.
2. O papel A4 retrato resulta em página de 595 × 842 pt.
3. Escolher paisagem inverte as dimensões da página.
4. Cada imagem cabe na página inteira **preservando a proporção**, sem esticar e sem cortar.
5. Depois de gerar, existe exatamente uma linha nova em `documentos`, com `total_paginas` e `tamanho_bytes` batendo com o arquivo real.
6. Compartilhar abre a folha nativa com o PDF anexado, e o arquivo chega íntegro ao WhatsApp e ao Gmail.
7. Salvar em Arquivos grava o PDF no destino escolhido pelo usuário.
8. Falha de geração mantém as páginas na Montagem e não cria linha em `documentos`.
9. **Do toque em Gerar até a tela Pronto não existe nenhuma tela intermediária** além do progresso.
10. **Home → Compartilhar em 4 toques**, contados num aparelho físico: Novo PDF → concluir a captura → Gerar → Compartilhar.
11. Mudar o tamanho de papel em Opções faz a escolha virar padrão nas próximas gerações, sem o usuário repetir.

---

### 8.5 Histórico

**Objetivo:** reenviar o que acabou de ser gerado, sem reescanear. **Nada além disso** (P1).

**Fluxo**
1. A Home mostra os **5 PDFs mais recentes**; "Ver todos" abre o histórico completo.
2. Cada item: nome, número de páginas, tamanho, data relativa (regra 11.11).
3. Tocar → prévia. Deslizar → **Compartilhar** e **Apagar**.
4. Apagar pede confirmação (texto de 15.9).

**Estados**
- *Vazio:* primeiro uso → ilustração e o texto de 15.10, com o botão Novo PDF em destaque.
- *Erro:* arquivo ausente no disco (usuário apagou por fora) → item marcado como indisponível, com a única ação **Remover da lista**.

**Critérios de aceite**
1. Gerar um PDF faz ele aparecer no topo da Home, sem precisar reabrir o app.
2. O histórico está ordenado por `criado_em` decrescente.
3. Apagar remove a linha do banco **e** o arquivo do disco, nessa ordem (regra 11.8).
4. Apagar o arquivo por fora do app e reabrir mostra o item como indisponível, sem derrubar o app.
5. Não existe busca, filtro, pasta nem renomear no histórico — se algum apareceu, está fora de escopo.

---

### 8.6 Compra vitalícia e gates de capacidade

**Objetivo:** vender a capacidade extra, sem servidor e sem nunca bloquear o uso gratuito (P4).

**Fluxo**
1. Ao tentar usar uma capacidade paga, abre o paywall (tela 10.7).
2. O paywall mostra o preço da loja, **nunca um preço escrito no código** (regra 11.5).
3. **Comprar** → fluxo nativo da loja via `expo-iap`.
4. Sucesso → `preferencias.compra_liberada = '1'`, o paywall fecha e **a ação que o usuário tentou continua sozinha**, sem ele repetir o gesto.
5. **Restaurar compra** disponível no paywall e nos Ajustes.

**Critérios de aceite**
1. Tentar gerar um PDF de 3 páginas sem ter comprado abre o paywall.
2. Gerar PDF de 1 ou 2 páginas **nunca** abre o paywall, em nenhuma circunstância.
3. O preço na tela vem da loja (sandbox), com moeda e formatação locais.
4. Comprar em sandbox libera as quatro capacidades pagas na mesma sessão, sem reiniciar o app.
5. Depois de comprar, a ação interrompida (gerar, aplicar preset, ligar OCR, comprimir) **retoma sozinha**.
6. Reinstalar o app e tocar em **Restaurar compra** com a mesma conta de loja devolve o acesso.
7. Cancelar a compra volta para onde o usuário estava, sem erro e sem estado quebrado.
8. Sem internet, o app **não trava**: o cache `compra_liberada` é respeitado e o paywall informa a indisponibilidade (texto de 15.13).
9. O app **nunca** exibe anúncio, contador de uso, marca d'água ou tela de bloqueio ao abrir.

---

### 8.7 Presets de documento

**Objetivo:** o diferencial do produto — o app já sabe o que é um contrato, uma nota fiscal e um boleto, e entra na captura configurado para cada um.

**Fluxo**
1. Na Home, além de **Novo PDF**, a faixa de presets na ordem da tabela 11.6: **Contrato**, **Imóvel**, **Procuração**, **Nota fiscal**, **Boleto**, **RG**, **CNH**.
2. Tocar num preset abre a captura já com o filtro, o papel e o nome base daquele tipo.
3. **Contrato, Imóvel e Procuração** entram em **captura em lote contínua**: a câmera não fecha entre as páginas, com um contador visível, até o usuário tocar em **Concluir**.
4. **Nota fiscal** e **Boleto** capturam uma página e vão direto para a Montagem.
5. **RG** e **CNH** guiam duas capturas — "Fotografe a frente", "Agora o verso". Com a compra, as duas viram **uma página** (11.6.1); sem a compra, viram **duas páginas** e o paywall é oferecido ali, com a opção de seguir com duas.
6. Em todos os casos, `tipo_documento` é gravado no registro.

**Estados**
- *Carregando:* na captura em lote, o contador ("7 páginas") atualiza a cada disparo, sem travar a câmera.
- *Erro:* falha ao capturar uma página não descarta as anteriores.

**Critérios de aceite**
1. A faixa da Home mostra os sete presets **na ordem da tabela 11.6**, com Contrato primeiro.
2. Nenhum preset abre paywall ao ser tocado — todos são gratuitos (11.1.1).
3. O preset Contrato mantém a câmera aberta entre disparos e o contador acompanha o número real de páginas.
4. Concluir uma captura em lote de 7 páginas leva à Montagem com 7 páginas, na ordem capturada.
5. O preset Nota fiscal aplica o filtro de alto contraste e **não força a proporção A4** no recorte de um cupom estreito e comprido.
6. O preset Boleto aplica o filtro Original e grava `tipo_documento = 'boleto'`.
7. Um boleto gerado com alvo de 2 MB respeita o **piso da regra 11.10.1** — o código de barras continua legível, verificado lendo o PDF com um app de banco.
8. O preset RG **sem compra** produz PDF de 2 páginas e oferece o paywall, com a opção de seguir com duas páginas.
9. O preset RG **com compra** produz PDF de 1 página com as duas faces, na mesma largura e proporção preservada.
10. Cancelar no meio de qualquer preset descarta o que foi capturado e volta à Home.
11. O nome do arquivo sai com a base da tabela 11.7, sem acento e sem espaço.

### 8.8 OCR e PDF pesquisável *(pago)*

**Objetivo:** o PDF gerado tem texto de verdade, pesquisável, sem alterar a aparência.

**Fluxo**
1. Nos Ajustes de saída, o interruptor **Texto pesquisável (OCR)**.
2. Ligado, a geração reconhece o texto de cada página e insere uma camada de texto **invisível** posicionada sobre a imagem (regra 11.9).
3. `tem_ocr = 1` no registro.

**Estados**
- *Carregando:* "Reconhecendo texto — página X de Y". OCR é a etapa mais lenta; o progresso é obrigatório.
- *Erro:* falha do OCR → o PDF é gerado **assim mesmo, sem a camada**, com o aviso de 15.11. Nunca falhar a geração inteira por causa do OCR.

**Critérios de aceite**
1. PDF com OCR permite **buscar uma palavra** do documento no Preview do macOS e no Google Drive.
2. O texto invisível não é visível nem ao imprimir.
3. Selecionar o texto no PDF devolve o conteúdo reconhecido.
4. Reconhecimento em português com acentuação correta.
5. Falha do OCR ainda produz um PDF válido, com `tem_ocr = 0`.
6. Sem compra, o interruptor aparece **visível e desabilitado**, com selo de recurso pago — não escondido.
7. O OCR roda **inteiramente no aparelho**, comprovado gerando um PDF com OCR em modo avião.

---

### 8.9 Compressão com alvo de tamanho *(pago)*

**Objetivo:** resolver o "o site só aceita 5 MB" — o Cenário B da seção 2.

**Fluxo**
1. Nos Ajustes de saída, **Tamanho máximo**: Sem limite / 2 MB / 5 MB / 10 MB.
2. Com alvo definido, o app reduz qualidade e resolução das imagens iterativamente até o PDF caber (regra 11.10).
3. A tela Pronto mostra o tamanho final e a redução obtida.

**Estados**
- *Carregando:* "Ajustando o tamanho — tentativa X".
- *Erro:* alvo inatingível no limite mínimo de qualidade → entrega o menor PDF possível com o aviso de 15.12, informando o tamanho real. **Não falha.**

**Critérios de aceite**
1. Um documento de 10 páginas com alvo de 5 MB produz PDF de até 5 MB.
2. O PDF comprimido continua **legível** — o texto do corpo de um documento comum permanece reconhecível na tela.
3. Alvo inatingível entrega arquivo e avisa, sem erro fatal.
4. "Sem limite" não aplica compressão nenhuma.
5. Sem compra, a opção aparece visível e desabilitada, com selo de recurso pago.

---

### 8.10 Ajustes, onboarding e acessibilidade

**Objetivo:** fechar as pontas do app.

**Escopo:** onboarding de 3 telas na primeira abertura (só uma vez); tela de Ajustes com restaurar compra, tamanho de papel padrão, filtro padrão, apagar todo o histórico, política de privacidade, contato e versão; acessibilidade da seção 17.3; pedido de avaliação pela regra 11.12.

**Critérios de aceite**
1. O onboarding aparece uma vez e nunca mais; `onboarding_visto = '1'`.
2. **Apagar todo o histórico** pede confirmação, e depois `documentos` está vazia e o diretório de PDFs também.
3. Todo elemento tocável tem área mínima de 44 × 44 pt.
4. Com o tamanho de fonte do sistema no máximo, nenhuma tela corta texto nem sobrepõe botão.
5. VoiceOver (iOS) e TalkBack (Android) leem rótulo e função de todos os botões do caminho principal.
6. O app funciona **inteiro** em modo avião, exceto comprar e restaurar compra.
7. O pedido de avaliação aparece no máximo uma vez, conforme a regra 11.12.

---

### 8.11 Publicação nas duas lojas

**Objetivo:** app aprovado e disponível na App Store e na Google Play.

**Escopo:** ícone e splash; capturas de tela das duas lojas; ficha das lojas (usar o skill `app-store-dablab` no iOS e `~/roteiro-publicar-play-store.md` no Android); produto não-consumível criado nos dois consoles; política de privacidade; build de produção via EAS; envio.

**Critérios de aceite**
1. Build de produção instala e roda em **aparelho físico** nas duas plataformas.
2. A compra funciona em **sandbox** nas duas lojas, em aparelho físico.
3. `CFBundleIconName` declarado e ícone 1024 opaco (ver `~/.claude/.../reference_cfbundleiconname_xcodegen.md` — a pegadinha vale igual em Expo com Info.plist customizado).
4. `TARGETED_DEVICE_FAMILY = 1` (iPhone-only) no iOS.
5. A validação de cada loja passa sem erro.
6. As duas fichas declaram o mesmo que o app faz — sem promessa de recurso que não existe.

---

## 9. Fluxos principais ponta a ponta

### 9.1 Fluxo principal — "me manda o RG em PDF" *(Cenário A)*

1. Abre o app → Home.
2. Toca no atalho **RG**.
3. *(Se não comprou)* → paywall → compra → **retoma no passo 4 sozinho**.
4. Scanner: "Fotografe a frente" → captura.
5. Scanner: "Agora o verso" → captura.
6. Montagem: 1 página com as duas faces. Confere.
7. **Gerar PDF** → Ajustes de saída (já preenchidos) → **Gerar**.
8. Tela Pronto → **Compartilhar** → WhatsApp.

**Caminho de exceção:** cancelar entre a frente e o verso descarta tudo e volta à Home — nada de meio documento salvo.

### 9.2 Fluxo do arquivo grande demais *(Cenário B)*

1. Abre o app → **Novo PDF** → **Escolher das Fotos** → seleciona 6 fotos.
2. Montagem: confere e aplica o filtro P&B em todas.
3. **Gerar PDF** → em Ajustes de saída, **Tamanho máximo: 5 MB**.
4. *(Se não comprou)* → paywall → compra → retoma.
5. Geração com compressão iterativa → Pronto, mostrando "4,2 MB".
6. **Salvar em Arquivos** → volta ao navegador e envia.

**Caminho de exceção:** alvo inatingível → entrega o menor PDF possível e avisa o tamanho real (15.12). O usuário decide se serve.

### 9.3 Fluxo gratuito completo — nunca esbarra em nada

1. Abre → **Novo PDF** → **Escanear** → 1 página.
2. Montagem → **Gerar PDF** → **Gerar**.
3. Pronto → **Compartilhar**.

**Nenhum paywall, nenhum contador, nenhuma marca d'água, para sempre** (P4). Este fluxo é o teste vivo do princípio P4 e deve ser verificado em toda release.

### 9.4 Fluxo de quem já comprou e trocou de aparelho

1. Instala o app no aparelho novo → onboarding.
2. Tenta um recurso pago → paywall.
3. **Restaurar compra** → loja confirma → acesso liberado, a ação retoma.

**Caminho de exceção:** trocou de plataforma (iPhone → Android). A loja não reconhece a compra. O texto de 15.14 explica que a compra é por loja e que será preciso comprar de novo — dito com clareza, sem esconder.

---

## 10. Inventário de telas

Perfil único, sem login — o rótulo indica o momento de uso, não permissão.

| # | Tela | O que mostra | Ações | Lê | Escreve |
|---|---|---|---|---|---|
| 10.1 | **Home** | Botão Novo PDF (dominante — é o caminho **sem preset**), faixa com os 7 atalhos de preset, 5 PDFs mais recentes | Novo PDF, preset, abrir PDF, ver todos, Ajustes | `documentos`, `preferencias` | — |
| 10.2 | **Origem** *(folha inferior)* | Escanear / Fotos / Arquivos | Escolher origem, cancelar | — | — |
| 10.3 | **Scanner** *(tela do sistema)* | Câmera nativa com detecção de borda | Capturar, refazer, concluir, cancelar | — | — |
| 10.4 | **Montagem** | Grade de miniaturas numeradas | Girar, recortar, filtro, excluir, reordenar, adicionar, gerar | *(memória)* | *(memória)* |
| 10.5 | **Editor de página** | Página em tela cheia | Girar, recortar, filtro, aplicar a todas, confirmar | *(memória)* | *(memória)* |
| 10.6 | **Opções de saída** *(opcional — fora do caminho principal)* | Nome, papel, orientação, OCR *(pago)*, tamanho máximo *(pago)* | Editar nome, escolher opções, confirmar | `preferencias` | `preferencias` |
| 10.7 | **Paywall** | O que a compra libera, preço da loja | Comprar, restaurar, fechar | `preferencias` | `preferencias` |
| 10.8 | **Gerando** *(modal)* | Progresso e etapa atual | Cancelar | — | — |
| 10.9 | **Pronto** | Prévia, nome, páginas, tamanho | Compartilhar, salvar, novo PDF, fechar | `documentos` | `documentos` |
| 10.10 | **Histórico** | Lista completa | Abrir, compartilhar, apagar | `documentos` | `documentos` |
| 10.11 | **Prévia do PDF** | PDF em tela cheia | Compartilhar, apagar, fechar | `documentos` | `documentos` |
| 10.12 | **Ajustes** | Compra, padrões, dados, sobre | Restaurar, mudar padrões, apagar tudo, privacidade, contato | `preferencias`, `documentos` | `preferencias`, `documentos` |
| 10.13 | **Onboarding** | 3 telas de boas-vindas | Avançar, começar | `preferencias` | `preferencias` |

**Navegação:** pilha simples do `expo-router`, sem abas e sem menu lateral. A Home é a raiz e o caminho principal é uma pilha linear até **Pronto**, que volta à Home.

**Caminho principal (só estas telas):** Home → Origem → Scanner → Montagem → *Gerando* → Pronto → folha de compartilhamento do sistema. **Opções de saída (10.6) não faz parte dele** — é desvio voluntário.

---

## 11. Regras de negócio

### 11.1 Gates de capacidade — gratuito vs. comprado

| Capacidade | Gratuito | Comprado |
|---|---|---|
| Gerar PDF de **1 ou 2 páginas** | ✅ ilimitado, para sempre | ✅ |
| Gerar PDF de **3 páginas ou mais** | ❌ paywall | ✅ até o limite de 11.3 |
| Escanear, importar de Fotos e de Arquivos | ✅ | ✅ |
| Girar, recortar, reordenar, excluir, filtros | ✅ | ✅ |
| Compartilhar e salvar | ✅ | ✅ |
| Histórico | ✅ ilimitado | ✅ |
| **Presets de documento** (contrato, imóvel, procuração, nota fiscal, boleto, RG, CNH) | ✅ **grátis** — ver 11.1.1 | ✅ |
| **Fundir frente e verso numa página só** (RG, CNH) | ❌ paywall | ✅ |
| **OCR / PDF pesquisável** | ❌ paywall | ✅ |
| **Compressão com alvo de tamanho** | ❌ paywall | ✅ |
| Marca d'água | **nunca**, em nenhum caso | — |
| Anúncio | **nunca**, em nenhum caso | — |
| Contador de uso | **não existe** no produto | — |

#### 11.1.1 Por que os presets são gratuitos

Na v1.2 do spec os presets eram pagos. **Mudou na 1.4**, e o motivo importa:

- Um preset é **pré-configuração** — filtro, papel, nome do arquivo. Não é capacidade nova, e cobrar por isso é cobrar por conveniência, não por valor.
- Os dois presets de uso mais frequente — **nota fiscal e boleto** — produzem **uma página**. Paywall neles bloquearia justamente o caso que a regra 11.1 já declara gratuito para sempre, contradizendo P4 dentro do próprio produto.
- O preset de **contrato**, **imóvel** e **procuração** leva a pessoa direto ao muro real (mais de 2 páginas), sem precisar de trava própria. Ele **aumenta** a conversão em vez de atrapalhar: mostra o valor primeiro e cobra no ponto de dor.
- O que continua pago é o que é **transformação de verdade**: fundir frente e verso numa página, OCR, compressão com alvo, multipágina.

**Onde é aplicado:** frontend. Não há servidor e não há o que proteger — o gate é decisão de produto, não de segurança. Não invente validação de recibo no aparelho além do que o `expo-iap` já entrega.

### 11.2 Produto de compra

| Campo | Valor |
|---|---|
| Tipo | Não-consumível (compra única, vitalícia) |
| ID do produto (as duas lojas) | `com.dablab.mandaempdf.completo` |
| Nome exibido | Manda em PDF Completo |
| Preço-alvo Brasil | **R$ 29,90** |
| Preço | Definido no console de cada loja. **Nunca escrito no código** (11.5). |
| Restaurar compra | Obrigatório, no paywall **e** nos Ajustes |

### 11.3 Limites técnicos

| Limite | Valor | O que acontece ao estourar |
|---|---|---|
| Páginas por PDF | **50** | Mensagem de 15.15; a captura para em 50 |
| Lado maior da imagem antes de entrar no PDF | 2400 px | Redimensiona automático, preservando proporção |
| Qualidade JPEG padrão | 0,75 | — |
| Tamanho máximo de PDF importado | 100 MB | Mensagem de 15.5 |
| Páginas de um PDF importado | 50 | Importa as 50 primeiras e avisa (15.15) |

### 11.4 Fonte de verdade da compra

1. **A loja é a fonte de verdade.** `preferencias.compra_liberada` é só cache, para a interface não piscar enquanto a loja responde.
2. Na abertura do app, consultar a loja em segundo plano e atualizar o cache. **Nunca bloquear a tela por essa consulta.**
3. Sem internet, vale o cache.
4. Se a loja disser que **não** há compra e o cache disser que sim, **vale o cache** até uma resposta positiva de "não comprado" com internet confirmada. Falso negativo por rede instável não pode tirar de alguém o que a pessoa pagou.
5. O cache **nunca** é escrito com `'1'` sem uma confirmação da loja.

### 11.5 Preço na tela

O preço exibido vem **sempre** do objeto de produto devolvido pela loja, com moeda e formatação locais. Se a consulta falhar, o paywall mostra o texto de 15.13 e **esconde o botão comprar** — nunca exibe um preço chutado.

### 11.6 Presets de documento

Um preset **não** é uma capacidade nova: é um atalho que já entra na captura com filtro, papel, nome e tratamento certos, para a pessoa não configurar nada. São gratuitos (11.1.1).

| Preset | `tipo_documento` | Páginas típicas | Filtro padrão | Nome base | Tratamento próprio |
|---|---|---|---|---|---|
| **Contrato** | `contrato` | muitas | Preto e branco | `Contrato` | Captura em lote contínua: a câmera **não fecha** entre páginas, só no "Concluir" |
| **Imóvel** | `imovel` | muitas | Preto e branco | `Imovel` | Idem contrato. Cobre escritura, matrícula, IPTU e planta |
| **Procuração** | `procuracao` | 1 a 3 | Preto e branco | `Procuracao` | Idem contrato |
| **Nota fiscal** | `nota_fiscal` | 1 | **Alto contraste** | `Nota-Fiscal` | Papel térmico desbota e é estreito e comprido: contraste reforçado e recorte que **não força proporção A4** |
| **Boleto** | `boleto` | 1 | Original (cor) | `Boleto` | **Piso de compressão** — regra 11.10.1 |
| **RG** | `rg` | 2 faces → 1 página | Original | `RG` | Fusão frente e verso (11.6.1) — **pago** |
| **CNH** | `cnh` | 2 faces → 1 página | Original | `CNH` | Idem RG — **pago** |

**Ordem na Home:** exatamente a da tabela. Contrato primeiro; RG e CNH por último. É a ordem que comunica o que o app é (11.14).

**O preset não trava nada.** Escolher "Contrato" não impede escanear uma página só, nem escolher "Boleto" impede escanear cinco. Ele define os padrões daquela captura, e o usuário sobrepõe qualquer um em Opções.

**O app não é restrito a estes sete tipos.** O caminho **sem preset** é o botão **Novo PDF**, e ele é o elemento mais pesado da Home justamente porque é o caso geral: aceita qualquer papel, grava `tipo_documento = 'livre'` e usa o nome base `Documento` (11.7). Os presets são atalhos para os tipos mais pedidos, não um catálogo fechado.

**Não existe cartão "Outros" na faixa** — seria um segundo caminho para o que o botão Novo PDF já faz, competindo com ele e sugerindo, por contraste, que os presets são obrigatórios. Decisão registrada para não ser "corrigida" depois por parecer falta.

#### 11.6.1 Fusão de frente e verso *(RG e CNH — pago)*

Página A4 retrato: 595 × 842 pt, margem de 24 pt em todos os lados. Área útil: 547 × 794 pt.

1. A área útil é dividida em duas faixas de 385 pt de altura, com 24 pt de espaço entre elas.
2. Cada face é escalada para caber na sua faixa **preservando a proporção**, limitada por largura ou altura, o que vier primeiro.
3. Cada face é centralizada horizontalmente na página.
4. A frente vai na faixa de cima; o verso, na de baixo.
5. **Sem compra**, as duas faces saem como **duas páginas** normais — o app não bloqueia a captura, só não funde. O paywall é oferecido no momento da fusão, não antes.

### 11.7 Nome do arquivo

Formato: `<base>-<AAAA-MM-DD>.pdf`

| Situação | `base` |
|---|---|
| Preset Contrato | `Contrato` |
| Preset Imóvel | `Imovel` |
| Preset Procuração | `Procuracao` |
| Preset Nota fiscal | `Nota-Fiscal` |
| Preset Boleto | `Boleto` |
| Preset RG | `RG` |
| Preset CNH | `CNH` |
| Sem preset | `Documento` |

Sem acento e sem espaço no nome de arquivo — ele viaja por WhatsApp, e-mail e sistemas de upload que ainda tropeçam nisso.

- Colisão de nome no mesmo dia: sufixo `-2`, `-3`, e assim por diante.
- O usuário pode editar o nome nos Ajustes de saída. Caracteres inválidos (`/ \ : * ? " < > |`) viram hífen.
- Nome vazio depois da limpeza volta ao padrão.

### 11.8 Ordem de exclusão

Ao apagar um documento, **nesta ordem**:
1. Apagar a linha de `documentos`.
2. Apagar o arquivo do disco.

Se o passo 2 falhar, a linha **continua apagada** — o histórico é a interface, e item fantasma é pior que arquivo órfão. Arquivos órfãos são varridos na abertura do app (11.13).

### 11.9 Camada de texto invisível do OCR

1. Para cada página, o OCR devolve trechos com texto e coordenadas normalizadas (0–1).
2. Cada trecho vira um elemento posicionado em cima da imagem, com `color: transparent`, tamanho de fonte proporcional à altura do seu retângulo.
3. A camada fica **acima** da imagem na ordem de empilhamento, para que a seleção funcione.
4. Trecho com confiança abaixo de **0,3** é descartado — texto errado é pior que texto ausente.
5. Falha do OCR numa página não interrompe as demais nem a geração.

### 11.10 Compressão com alvo de tamanho

Enquanto o PDF gerado for maior que o alvo, tentar nesta ordem, **regerando e medindo a cada passo**:

| Tentativa | Qualidade JPEG | Lado maior |
|---|---|---|
| 1 | 0,75 | 2400 px |
| 2 | 0,60 | 2400 px |
| 3 | 0,50 | 2000 px |
| 4 | 0,40 | 1600 px |
| 5 | 0,30 | 1600 px |
| 6 | 0,25 | 1200 px |

- Máximo de **6 tentativas**. Se ao fim ainda estiver acima do alvo, entrega o menor resultado obtido com o aviso de 15.12.

#### 11.10.1 Piso de compressão do boleto

Quando `tipo_documento = 'boleto'`, **a compressão para na tentativa 3** (qualidade 0,50 / 2000 px) e nunca desce além disso, mesmo que o alvo não seja atingido.

**Motivo:** abaixo disso o **código de barras e a linha digitável deixam de ser legíveis** — e um boleto que não pode ser lido não é um boleto, é uma imagem. Entregar um arquivo menor e inútil é pior que entregar um arquivo grande. Se o alvo não couber dentro do piso, mostrar o aviso de 15.12 com o tamanho real.

A mesma cautela vale, em menor grau, para `nota_fiscal`: papel térmico já chega com pouco contraste, e o piso é a tentativa 4.
- Parar assim que couber — não continuar degradando à toa.
- Cada tentativa atualiza o contador do progresso.

### 11.11 Data relativa no histórico

| Idade do documento | Exibe |
|---|---|
| Menos de 1 minuto | `Agora` |
| Menos de 1 hora | `há X min` |
| Hoje | `Hoje, HH:mm` |
| Ontem | `Ontem, HH:mm` |
| Menos de 7 dias | `<dia da semana>, HH:mm` |
| Mesmo ano | `DD de <mês>` |
| Anterior | `DD/MM/AAAA` |

Fuso e idioma do aparelho. Virada de dia pelo fuso local, não UTC.

### 11.12 Pedido de avaliação na loja

Pedir avaliação **uma única vez**, quando **todas** forem verdadeiras:
1. `total_pdfs_gerados >= 3`;
2. o pedido acontece logo após um **compartilhamento bem-sucedido**;
3. nunca foi pedido antes.

Usar a API nativa da loja. Nunca pedir depois de erro, nunca no meio do caminho principal.

### 11.13 Varredura de arquivos órfãos

Na abertura do app, comparar os arquivos do diretório de PDFs com `documentos.caminho_arquivo`. Arquivo sem linha correspondente é apagado. Roda em segundo plano e nunca atrasa a primeira tela.

### 11.14 O que **não** é automático

- **Não** classifica o documento sozinho: `tipo_documento` só é preenchido quando o usuário escolhe um preset. O app **não** tenta adivinhar que aquilo é um boleto olhando a imagem.
- **Não** aplica OCR por padrão — é opt-in, porque é lento.
- **Não** comprime por padrão — o default é "Sem limite".
- **Não** apaga histórico sozinho: nem por idade, nem por espaço.
- **Não** renomeia nem reorganiza nada depois de gerado.

---

## 12. Máquinas de estado e tratamento de erro

### 12.1 Documento em montagem *(em memória, não no banco)*

```
    vazio ──adicionar──> com_paginas ──gerar──> gerando ──ok────> gerado ──> (fim, vai pro histórico)
      ^                       │                    │
      │                       │                    └──falha──> com_paginas  (páginas PRESERVADAS)
      └───excluir a última────┘
                              │
                              └──descartar──> vazio  (apaga as imagens temporárias)
```

| Transição | Permitida quando | Proibida |
|---|---|---|
| `vazio → com_paginas` | Pelo menos uma página capturada ou importada | — |
| `com_paginas → gerando` | ≥ 1 página **e** o gate de 11.1 permite | Com 0 páginas |
| `gerando → gerado` | `expo-print` devolveu um arquivo válido e não vazio | — |
| `gerando → com_paginas` | Qualquer falha de geração | **Nunca** vai para `vazio` numa falha |
| `gerando → cancelado` | Usuário cancelou | Volta a `com_paginas`, preservando tudo |
| `gerado → *` | — | Estado final. Alterar exige recomeçar. |

**Regra dura:** falha nunca destrói o trabalho do usuário. De `gerando`, o único caminho de erro é voltar a `com_paginas` com todas as páginas intactas.

### 12.2 Estado da compra

```
    desconhecido ──consulta OK, sem compra──> nao_comprado ──compra OK──> comprado
         │                                          ^                        │
         │                                          └────restaurar OK────────┘
         └──consulta OK, com compra──> comprado
         └──consulta falhou──> usa o cache (regra 11.4)
```

| Falha | O que o app faz |
|---|---|
| Loja indisponível | Mantém o cache; paywall mostra 15.13 e esconde o botão comprar |
| Compra cancelada pelo usuário | Volta ao ponto anterior, sem mensagem de erro |
| Compra recusada (pagamento) | Mensagem da própria loja; o app não interpreta nem reescreve |
| Restaurar não encontra compra | Mensagem 15.14, sem tratar como erro |
| Compra pendente (aprovação familiar) | Estado `nao_comprado` com o aviso 15.16; a liberação chega sozinha quando a loja confirmar |

### 12.3 Erros e o que o usuário vê

| Erro | Tratamento | Perde trabalho? |
|---|---|---|
| Permissão de câmera negada | Alerta 15.4 + atalho para os Ajustes do sistema | Não |
| Sem espaço em disco | Alerta 15.17, geração abortada | Não — páginas preservadas |
| Arquivo importado corrompido | Alerta 15.5, o arquivo é ignorado | Não |
| Falha do OCR | PDF sai sem camada, aviso 15.11 | Não |
| Alvo de compressão inatingível | Entrega o menor possível, aviso 15.12 | Não |
| Falha na geração do PDF | Alerta 15.8, volta à Montagem | Não |
| Arquivo do histórico sumiu | Item marcado indisponível, ação Remover da lista | Não |
| Banco corrompido na abertura | Recria o banco vazio e avisa 15.18 | Sim — o histórico. Inevitável. |

---

## 13. Contratos dos módulos internos

Sem backend (P3), o contrato é entre os módulos do app. Cada um vive em `src/services/`, é a **única** porta para a sua capacidade nativa, e nenhuma tela chama biblioteca nativa direto — é isso que torna a troca de plugin (risco R1) uma alteração de um arquivo.

| Módulo | Responsabilidade | Entrada → Saída |
|---|---|---|
| `scanner` | Abre o scanner nativo | `{ maxPages }` → `{ pages: string[] }` (caminhos locais) ou `{ cancelled: true }` |
| `importer` | Importa de Fotos e de Arquivos, converte PDF em imagens | `{ source: 'photos' \| 'files' }` → `{ pages: string[] }` |
| `pageEditor` | Girar, recortar, filtro, redimensionar | `{ uri, ops[] }` → `{ uri }` |
| `pdfBuilder` | Monta o HTML e gera o PDF | `{ pages[], paperSize, orientation, ocrLayer?, quality, maxWidth }` → `{ uri, sizeBytes, pageCount }` |
| `ocr` | Reconhece texto e devolve trechos com coordenadas | `{ uri }` → `{ blocks: { text, x, y, w, h, confidence }[] }` |
| `compressor` | Executa o laço da regra 11.10 | `{ pages[], targetBytes, buildFn }` → `{ uri, sizeBytes, attempts, reachedTarget }` |
| `presets` | Monta a página de frente e verso (11.6) | `{ preset, front, back? }` → `{ uri }` |
| `purchases` | Envolve o `expo-iap` | `getProduct()`, `buy()`, `restore()`, `isUnlocked()` |
| `storage` | Escreve, lê e apaga PDFs no sandbox | `save()`, `remove()`, `exists()`, `sweepOrphans()` |
| `repository` | Único acesso ao banco (Drizzle) | CRUD de `documentos` e `preferencias` |

**Regra de fronteira:** os tipos que espelham o banco mantêm os nomes de coluna em português (`criado_em`, `total_paginas`). A tradução para o vocabulário de interface acontece na camada de tela, não no repositório (seção 18).

---

## 14. Formato do arquivo de saída

O PDF é o entregável do produto. Especificado com precisão de implementação:

| Item | Regra |
|---|---|
| Formato | PDF 1.4 ou superior, gerado por `expo-print` |
| Tamanho de papel | A4 = 595 × 842 pt · Carta = 612 × 792 pt (retrato) |
| Orientação | Retrato inverte para paisagem trocando largura e altura |
| Margem | 24 pt em todos os lados |
| Ajuste da imagem | Cabe na área útil preservando a proporção (`contain`), centralizada |
| Uma imagem por página | Sempre — exceto o preset frente e verso (11.6) |
| Imagens embutidas | JPEG base64, qualidade da regra 11.3 ou 11.10 |
| Camada de texto | Só quando o OCR está ligado, conforme 11.9 |
| Metadados | Título = nome do arquivo sem extensão. **Sem autor, sem localização, sem identificador de aparelho** (seção 20) |
| Nome do arquivo | Regra 11.7 |
| Destino | Diretório de documentos do app; cópia para onde o usuário escolher ao salvar ou compartilhar |

**Importação aceita:** JPEG, PNG, HEIC, WEBP e PDF. Qualquer outra coisa é recusada com a mensagem 15.5.

**Não há exportação em lote, CSV, backup nem arquivo de dados** — coerente com P1.

---

## 15. Copy e tom de voz

**Tom:** direto, em português do Brasil, na segunda pessoa implícita. Frase curta. Sem exclamação, sem gerundismo, sem "oops", sem infantilizar. O app fala como alguém que está ajudando a resolver uma burocracia chata, não como uma marca animada.

**Este é o texto final, não é placeholder.**

| # | Onde | Texto |
|---|---|---|
| 15.1 | Home — botão principal | `Novo PDF` |
| 15.2 | Home — título dos presets | `Documentos` |
| 15.2b | Home — rótulos dos presets, nesta ordem | `Contrato` · `Imóvel` · `Procuração` · `Nota fiscal` · `Boleto` · `RG` · `CNH` |
| 15.3 | Home — histórico | `Recentes` · `Ver todos` |
| 15.4 | Permissão de câmera negada | `Para escanear, o app precisa da câmera. Você pode liberar nos Ajustes do aparelho.` |
| 15.5 | Arquivo não suportado | `Esse arquivo não dá para usar. Escolha uma imagem ou um PDF.` |
| 15.6 | Sair da montagem | `Descartar as páginas? O que você capturou vai ser perdido.` · `Descartar` · `Continuar` |
| 15.7 | Gerando | `Gerando o PDF…` |
| 15.8 | Falha na geração | `Não deu para gerar o PDF. Suas páginas continuam aqui — tente de novo.` |
| 15.9 | Apagar documento | `Apagar este PDF? Não dá para recuperar depois.` · `Apagar` · `Cancelar` |
| 15.10 | Histórico vazio | `Seus PDFs aparecem aqui` / `Escaneie um documento e ele fica salvo para você reenviar quando precisar.` |
| 15.11 | OCR falhou | `O PDF ficou pronto, mas não deu para reconhecer o texto desta vez.` |
| 15.12 | Alvo de tamanho não atingido | `O menor tamanho possível foi {tamanho}. Reduzir mais deixaria o documento ilegível.` |
| 15.13 | Loja indisponível | `Não deu para falar com a loja agora. Verifique a internet e tente de novo.` |
| 15.14 | Restaurar sem compra | `Não encontramos uma compra nesta conta. A compra vale para a loja onde foi feita — se você comprou em outro sistema, ela não vem junto.` |
| 15.15 | Limite de páginas | `O limite é de 50 páginas por PDF.` |
| 15.16 | Compra pendente | `Sua compra está aguardando aprovação. Assim que for confirmada, o acesso libera sozinho.` |
| 15.17 | Sem espaço | `Seu aparelho está sem espaço. Libere um pouco e tente de novo.` |
| 15.18 | Banco recriado | `Precisamos recriar os dados do app e o histórico foi perdido. Os PDFs que você já compartilhou continuam onde você salvou.` |
| 15.19 | Paywall — título | `Manda em PDF Completo` |
| 15.20 | Paywall — itens, nesta ordem | `Contrato inteiro num arquivo só, com quantas páginas precisar` / `Ajustar o tamanho para caber no limite do site` / `PDF com texto pesquisável, dá para buscar depois` / `RG e CNH frente e verso numa página só` |
| 15.21 | Paywall — rodapé | `Pagamento único. Sem assinatura, sem mensalidade.` |
| 15.22 | Paywall — botões | `Comprar por {preço}` · `Restaurar compra` |
| 15.23 | Selo de recurso pago | `Completo` |
| 15.23b | Montagem — acesso opcional aos ajustes | `Opções` |
| 15.24 | Pronto — título | `Pronto` |
| 15.25 | Pronto — ações | `Compartilhar` · `Salvar em Arquivos` · `Novo PDF` |
| 15.26 | Onboarding 1 | `Contrato, escritura, nota, boleto` / `Escaneie o papel e mande em PDF. Sem computador, sem scanner.` |
| 15.27 | Onboarding 2 | `Nada sai do seu aparelho` / `Seus documentos são processados aqui dentro. Sem nuvem, sem conta, sem upload.` |
| 15.28 | Onboarding 3 | `Grátis para usar` / `PDFs de até duas páginas são grátis para sempre. Sem anúncio e sem marca d'água.` |
| 15.29 | Ajustes — apagar tudo | `Apagar todos os PDFs? O histórico fica vazio e os arquivos são removidos do app.` |
| 15.30 | Preset RG e CNH — captura | `Fotografe a frente` · `Agora o verso` |
| 15.31 | Preset em lote — durante a captura | `{n} páginas` · `Concluir` |
| 15.32 | Preset RG e CNH sem compra | `Na versão completa, a frente e o verso saem numa página só. Quer seguir com duas páginas?` · `Seguir com duas` · `Ver a versão completa` |
| 15.33 | Boleto no piso de compressão | `Não dá para reduzir mais sem o código de barras parar de ser lido. O arquivo ficou com {tamanho}.` |

---

## 16. Direção visual

App de consumo, celular, navegação em pilha. **O padrão de menu lateral não se aplica** — não existe navegação lateral aqui.

### 16.1 Conceito

**Padrão visual nativo da Apple**, sem identidade própria de marca. O app se parece com um app do sistema: fundo neutro, listas agrupadas, azul de sistema como única cor de ação, tipografia do sistema. O documento do usuário é o conteúdo; a interface some.

**Uma paleta só para as duas plataformas.** O Android recebe o mesmo desenho, não um Material Design paralelo. Motivo: manter dois sistemas visuais num app deste tamanho é custo sem retorno (P5), e o público brasileiro convive bem com o visual iOS. Decisão declarada — não é esquecimento.

**Mesma linha do Hora do Remédio**, que já foi redesenhado para o padrão nativo da Apple com azul de ação.

### 16.2 Paleta — cores de sistema da Apple

Nenhuma cor inventada: todas são cores nomeadas do sistema. Os valores abaixo são os hex correspondentes, para o Android reproduzir o mesmo resultado.

| Papel | Cor de sistema | Claro | Escuro |
|---|---|---|---|
| **Ação / primária** | `systemBlue` | `#007AFF` | `#0A84FF` |
| Ação pressionada | — | `#0062CC` | `#3D9BFF` |
| Fundo | `systemBackground` | `#FFFFFF` | `#000000` |
| Fundo de lista agrupada | `systemGroupedBackground` | `#F2F2F7` | `#000000` |
| Superfície de cartão / célula | `secondarySystemGroupedBackground` | `#FFFFFF` | `#1C1C1E` |
| Preenchimento sutil / interruptor desligado | `tertiarySystemFill` | `#E5E5EA` | `#39393D` |
| Texto principal | `label` | `#1C1C1E` | `#FFFFFF` |
| Texto secundário | `secondaryLabel` | `#6E6E73` | `#98989E` |
| Texto terciário (chevron, placeholder) | `tertiaryLabel` | `#B0B0B5` | `#68686E` |
| Divisor | `separator` | `#E5E5EA` | `#38383A` |
| Fundo do selo "Completo" | — | `#E8F1FE` | `#0A2A4D` |

**Esta tabela é a mesma do `src/theme/colors.ts` do Hora do Remédio** (`acao`, `perigo`, `atencao`, `neutroTexto`, `neutroTextoSecundario`, `neutroFundo`, `neutroSuperficie`, `neutroBorda`), estendida com os equivalentes de modo escuro. Foi conferida contra o código real em 26/08/2026 — não reinvente valores.

**Cor semântica** — só para significado, nunca decorativa:

| Significado | Cor de sistema | Claro | Escuro |
|---|---|---|---|
| Sucesso | `systemGreen` | `#34C759` | `#30D158` |
| Alerta | `systemOrange` | `#FF9500` | `#FF9F0A` |
| Erro / destrutivo | `systemRed` | `#FF3B30` | `#FF453A` |

**Regras de uso**
- **Azul é ação, vermelho é destruição.** Nada de vermelho em elemento que não apaga.
- Ação destrutiva em **botão ou linha de lista** usa **texto** em `systemRed` — nunca botão vermelho preenchido.
- **Exceção declarada — ação de deslizar (swipe):** a ação de deslizar-para-apagar numa lista usa o padrão do sistema, **vermelho preenchido com ícone branco**, e a de compartilhar usa azul preenchido. É o comportamento nativo do iOS e do Android; imitá-lo com texto ficaria estranho e ninguém reconheceria o gesto. A exceção vale **só** para ação de swipe em célula de lista — em nenhum outro lugar.
- Nenhuma informação é comunicada só por cor (17.3): erro sempre vem com ícone e texto.
- **Nenhuma cor literal fora de `src/theme/`** (18.4).

*(Nota de versão: a paleta anterior usava um vermelho de marca "de PDF". Foi trocada pelo padrão da Apple a pedido do Alexandre, o que também eliminou o conflito declarado entre a cor de marca e a cor de erro. Os valores foram então alinhados ao `src/theme` real do Hora do Remédio — os mockups da seção 16.8 já usam estes.)*

### 16.3 Tipografia — estilos de texto da Apple

Fonte do sistema (SF Pro no iOS, Roboto no Android), sem fonte customizada — assim o tamanho do sistema é respeitado de graça (P5). Use os **estilos nomeados da Apple**, não tamanhos avulsos:

| Estilo Apple | Onde | Tamanho | Peso |
|---|---|---|---|
| Large Title | Título da Home e do Histórico | 34 | Bold |
| Title 2 | Título de tela interna | 22 | Bold |
| Headline | Título de célula, rótulo de botão | 17 | Semibold |
| Body | Corpo | 17 | Regular |
| Callout | Apoio | 16 | Regular |
| Subheadline | Metadados de célula | 15 | Regular |
| Footnote | Rodapé, aviso | 13 | Regular |
| Caption 1 | Legenda, selo | 12 | Regular |

Todos escalam com o ajuste de fonte do sistema (17.3).

### 16.4 Forma e espaçamento
- Escala de espaçamento: **4 / 8 / 12 / 16 / 20 / 24 / 32**. Margem lateral padrão: **16** (padrão iOS), não 24.
- Raio: **10** em cartões e campos, **14** em folhas modais, **capsule** (metade da altura) no botão principal.
- **Listas agrupadas no padrão iOS**: célula com fundo `secondarySystemGroupedBackground` sobre `systemGroupedBackground`, separador começando **alinhado ao texto**, não à borda da tela.
- **Hairlines** de 1 px como divisor. Sem borda pesada, sem sombra forte.
- Botão principal da Home: largura total menos as margens, altura **52**, raio 14, `systemBlue`, texto branco em Headline, com o ícone de escanear à esquerda. É o elemento mais pesado da interface, e isso é intencional (P2).
- Chevron `›` em `tertiaryLabel` nas células que navegam, como no iOS.

### 16.5 Referências visuais
**Ajustes do iOS** para a lista agrupada e a densidade; app **Arquivos** da Apple para a grade de miniaturas e a tela de prévia; **Atalhos** da Apple para os cartões de preset na Home; **Hora do Remédio** para o peso do botão principal e o tamanho generoso do toque.

### 16.6 Modo escuro
Obrigatório, seguindo o sistema, sem alternador manual no app. Toda cor sai dos tokens de 16.2 — nenhuma cor literal em componente.

### 16.7 Mockups das telas

As 18 telas desta especificação estão desenhadas e publicadas como canvas navegável, em três páginas — *Caminho principal*, *Telas de apoio* e *Tema escuro*:

**https://claude.ai/code/artifact/be8b7d40-d47c-43ce-a791-0f1ab8e926eb**

Os fontes vivem em `design/` (um `.dc.html` por tela + `canvas.json`). Os mockups usam exatamente os tokens de 16.2 a 16.4 e a copy literal da seção 15. **Onde o mockup e este documento divergirem, este documento vence** — e a divergência deve ser corrigida no mockup.

Duas telas do canvas (`Scanner` e `Compartilhar`) são **representações de telas do sistema**, não desenho nosso: quem as renderiza é o VisionKit/ML Kit e a folha de compartilhamento do iOS/Android. Estão ali só para o fluxo se ler inteiro.

### 16.8 Livre para o agente escolher
Ícones específicos do `@expo/vector-icons`, curvas e durações de animação (limite de 250 ms), microcópia de acessibilidade, ilustração do estado vazio, e o layout fino da grade de miniaturas. Fora isso, siga o que está escrito.

---

## 17. Requisitos não-funcionais

### 17.1 Desempenho

| Métrica | Alvo | Medido em |
|---|---|---|
| Abertura a frio até a Home interativa | < 1,5 s | iPhone 12 / Pixel 6 |
| Home → scanner aberto | < 1,0 s | idem |
| Gerar PDF de 1 página, sem OCR | < 2,0 s | idem |
| Gerar PDF de 10 páginas, sem OCR | < 8,0 s | idem |
| OCR por página | < 2,0 s | idem |
| Aplicar filtro numa página | < 800 ms | idem |
| Pico de memória, PDF de 20 páginas | < 400 MB | idem |

### 17.2 Offline
O app funciona **inteiro** sem internet. As **únicas** operações que exigem rede são comprar e restaurar compra. Nenhuma tela mostra spinner esperando rede no caminho principal.

### 17.3 Acessibilidade
- Área mínima de toque: **44 × 44 pt**.
- Contraste mínimo **4,5:1** para texto, nos dois temas.
- Suporte ao tamanho de fonte do sistema até o maior nível, **sem corte e sem sobreposição**.
- VoiceOver e TalkBack: rótulo e função em todo elemento tocável; miniatura de página anuncia o número ("Página 3 de 7").
- Nenhuma informação comunicada **só** por cor (ver 16.2).
- Respeitar "reduzir movimento" do sistema.

### 17.4 Consumo
- Binário: **< 60 MB** por plataforma (o ML Kit no Android é a maior parcela).
- Sem trabalho em segundo plano, sem serviço persistente, sem notificação.
- Sem uso de rede fora da compra — logo, sem consumo de dados.

### 17.5 Compatibilidade
- **iOS 15.1+**, iPhone apenas (`TARGETED_DEVICE_FAMILY = 1`). O piso é do SDK 55 (4.2), não uma decisão de produto.
- **Android 7.0 (API 24)+**, com **Google Play Services** obrigatório para o scanner e o OCR (risco R2).
- Retrato apenas, nas duas plataformas.

### 17.6 Volume
- Histórico projetado para até **500 documentos** sem degradar a rolagem.
- 50 páginas por documento (11.3).

### 17.7 Idiomas
**Português do Brasil apenas** no MVP. Nada de string solta no código — tudo em um único arquivo de textos, para que a tradução (28.5) seja trabalho de tradução, não de garimpo.

---

## 18. Convenções de código, documentação e estrutura

### 18.1 Idioma — banco em português, código em inglês

- **Banco em português, `snake_case`:** tabelas, colunas e enums exatamente como na seção 7 (`documentos`, `criado_em`, `total_paginas`, `tipo_documento`).
- **Código em inglês:** variáveis, funções, componentes, nomes de arquivo (`pdfBuilder.ts`, `useDocuments`, `PageThumbnail`).
- **A fronteira fica na camada de dados:** os tipos que espelham o banco mantêm os nomes de coluna em português. A tradução para o vocabulário de interface acontece na tela.
- **Textos de interface, comentários e documentação:** português do Brasil.

### 18.2 Comentários obrigatórios

- Toda função, hook e módulo de serviço leva **comentário de cabeçalho em português** dizendo o que faz, o que recebe, o que devolve e **qual regra do spec implementa, com o número da seção**.
- Lógica não óbvia leva comentário inline explicando a **intenção**, não a sintaxe.

```ts
/**
 * Reduz qualidade e resolução das imagens até o PDF caber no alvo de tamanho.
 * Recebe as páginas, o alvo em bytes e a função que remonta o PDF.
 * Devolve o menor PDF obtido e se o alvo foi atingido.
 * Implementa a regra 11.10 (tabela de 6 tentativas) — parar assim que couber.
 */
```

`// incrementa i` é ruído. `// descarta trecho com confiança < 0,3: texto errado é pior que texto ausente (regra 11.9)` é o que se procura seis meses depois.

### 18.3 Estrutura de pastas

```
manda-em-pdf/
├── app/                        # rotas do expo-router (uma tela por arquivo, seção 10)
├── src/
│   ├── components/             # componentes compartilhados
│   ├── features/               # módulo por feature: componentes + hooks + tipos juntos
│   │   ├── capture/            # 8.2
│   │   ├── assembly/           # 8.3
│   │   ├── output/             # 8.4
│   │   ├── history/            # 8.5
│   │   ├── purchase/           # 8.6
│   │   └── presets/            # 8.7
│   ├── services/               # portas para o nativo (seção 13) — NENHUMA tela chama nativo direto
│   ├── db/                     # schema Drizzle, migrations, repository
│   ├── theme/                  # tokens da seção 16 — nenhuma cor literal fora daqui
│   ├── strings/                # todos os textos da seção 15, em um arquivo só
│   └── lib/                    # utilitários puros (datas, nomes de arquivo, formatação)
├── assets/
├── spec.md
├── SCHEMA.md                   # gerado do banco real
├── DOCUMENTACAO-TECNICA.md     # seção 19
├── CLAUDE.md
└── README.md
```

### 18.4 Documentação viva

- **`SCHEMA.md`** na raiz, gerado a partir do banco real, para spec e código não divergirem.
- **`README.md`**: setup local, como rodar nas duas plataformas, como gerar migrations, como buildar.
- **`CLAUDE.md`** na raiz — o guia que o agente lê a cada sessão. Deve conter: as convenções desta seção; o mapa da arquitetura; os comandos (`npm run typecheck` é obrigatório antes de dar qualquer coisa por pronta); e as **pegadinhas que não podem ser quebradas**:
  - nenhuma tela chama biblioteca nativa direto — sempre via `src/services/`;
  - nenhuma cor literal fora de `src/theme/`;
  - nenhum texto de interface fora de `src/strings/`;
  - nenhum preço escrito no código (11.5);
  - o fluxo gratuito de até 2 páginas nunca pode encostar em paywall (P4);
  - falha de geração nunca descarta as páginas do usuário (12.1).
- **`CLAUDE.md`, `DOCUMENTACAO-TECNICA.md` e `README.md` são atualizados no mesmo commit** da mudança que os afeta.

### 18.5 Variáveis de ambiente

O app **não tem segredo**: sem servidor, sem chave de API, sem analytics. As únicas configurações de build ficam em `app.json` / `eas.json` (bundle, versão, `projectId` do EAS). O ID do produto de compra (11.2) é constante pública no código, não segredo.

Reservado para as próximas releases: nada por enquanto. Se algum dia entrar chave, ela vai para `EXPO_PUBLIC_*` (pública) ou para o EAS Secrets (privada) — **nunca** no repositório.

---

## 19. Documento de documentação técnica *(entregável ao fim da implementação)*

Ao terminar a implementação, gerar **`DOCUMENTACAO-TECNICA.md`** na raiz, em português, descrevendo o sistema **como ele ficou de fato**, não como foi planejado. Conteúdo mínimo, nesta ordem:

1. **Modelo de dados explicado em português** — cada tabela: para que serve, o que cada coluna significa em linguagem de negócio, e o que cada valor de enum quer dizer.
2. **Relacionamento entre as tabelas** — diagrama em texto e uma frase de cardinalidade por relação, no vocabulário do produto. *(Aqui, registrar explicitamente que não há relação e por quê — ver 7.5.)*
3. **Regras que vivem fora da tela** — como não há trigger nem política (é SQLite local), listar as **regras da seção 11 e onde cada uma foi implementada**, com nome de arquivo e função. Deve dar para ler essa lista e entender toda a lógica que a interface não mostra.
4. **Mapa tela → tabelas e serviços** — para cada tela da seção 10: o que lê, o que escreve e quais módulos de `src/services/` usa.
5. **Lógica das principais funcionalidades por tela** — por ação principal: o que é validado, o que é gravado, o que é calculado e onde, e o que o usuário vê no erro.
6. **Divergências em relação ao spec** — o que ficou diferente e por quê. **Sem esta seção o documento envelhece mentindo.**

**Regra de manutenção:** toda mudança em schema ou em lógica de tela atualiza este documento no mesmo commit.

---

## 20. Privacidade, segurança e conformidade

Este app processa **documentos de identidade**. É o dado pessoal mais sensível que um app comum toca. O tratamento aqui não é formalidade.

### 20.1 O que é coletado
**Nada é coletado.** Não há servidor, conta, telemetria, analytics, crash reporter, SDK de terceiro com rede, nem identificador de publicidade.

### 20.2 O que fica no aparelho

| Dado | Onde | Por quanto tempo |
|---|---|---|
| PDFs gerados | Diretório de documentos do app (sandbox) | Até o usuário apagar |
| Registros do histórico | SQLite local | Até o usuário apagar |
| Imagens em montagem | Diretório temporário | Apagadas ao gerar ou descartar |
| Preferências | SQLite local | Até desinstalar |
| Estado da compra | Loja (Apple/Google) + cache local | — |

### 20.3 Regras duras

1. **Nenhuma imagem, texto de OCR ou PDF sai do aparelho**, em nenhuma hipótese. Verificável: o app gera PDF com OCR em modo avião (critério 8.8.7).
2. **Nenhuma biblioteca com acesso à rede** entra no projeto sem decisão explícita registrada aqui. O OCR e o scanner são on-device por escolha de arquitetura (seção 4.2), não por acaso.
3. **Sem metadados de identificação no PDF**: sem autor, sem localização, sem modelo do aparelho (seção 14).
4. **Sem EXIF de localização**: a imagem importada da galeria tem o EXIF removido antes de entrar no PDF.
5. **Imagens temporárias são apagadas** ao gerar ou descartar — nunca ficam no disco depois da sessão.
6. **Nada em log de produção.** Nenhum caminho de arquivo, nenhum texto de OCR, nenhum conteúdo de documento em `console.log` no build de release.
7. **Sem segredo no repositório** (18.5).

### 20.4 Direitos do titular (LGPD)
Como não há tratamento de dado por nós — tudo fica no aparelho da pessoa, sob controle dela — não há titular a atender remotamente. Ainda assim:
- **Exportar:** compartilhar ou salvar em Arquivos, a qualquer momento.
- **Apagar:** item a item, "apagar todo o histórico" nos Ajustes, ou desinstalar o app.
- **Base legal:** não se aplica tratamento por controlador remoto. A política de privacidade declara isso em termos simples.

### 20.5 Ficha de privacidade das lojas
- **Apple — App Privacy:** "Data Not Collected".
- **Google Play — Data Safety:** nenhum dado coletado nem compartilhado; processamento no aparelho.
- **Estas declarações precisam continuar verdadeiras.** Adicionar qualquer SDK com rede obriga a revisar as duas fichas — e a revisar este spec antes.

### 20.6 Sem IA generativa
O app não embute modelo generativo. OCR é reconhecimento determinístico, não geração — não há alucinação a mitigar e não há guardrail a definir.

---

## 21. Métricas de sucesso e telemetria

**Não há telemetria no app** (seção 20.1). As métricas vêm exclusivamente dos painéis das lojas — que é o que o P3 permite, e é suficiente.

| # | Métrica | Alvo | Prazo | Fonte |
|---|---|---|---|---|
| M1 | Instalações nas duas lojas | 1.000 | 90 dias após lançamento | App Store Connect + Play Console |
| M2 | Taxa de conversão para a compra | ≥ 2,5% dos instaladores | 90 dias | Painéis de venda das lojas |
| M3 | Nota média | ≥ 4,5 | 90 dias, com no mínimo 20 avaliações | Lojas |
| M4 | Taxa de travamento | < 0,5% das sessões | contínuo | Painéis de estabilidade das lojas |

**Se a M2 ficar abaixo de 1,5% em 90 dias**, a hipótese principal a testar é o gate de páginas: passar o gratuito de 2 para 1 página, ou o contrário. O número vive num lugar só do código (11.1) exatamente para esse teste ser uma linha.

---

## 22. Estratégia de teste

### 22.1 Teste automatizado *(Jest, `jest-expo`)*

Obrigatório para a lógica pura — é onde mora a regra de negócio e é o que quebra em silêncio:

| Alvo | Regra |
|---|---|
| Gates de capacidade | 11.1 — inclusive o caso "2 páginas nunca abre paywall" |
| Fonte de verdade da compra | 11.4 — em especial o item 4 (falso negativo não tira o acesso) |
| Geometria do preset frente e verso | 11.6 |
| Formação do nome do arquivo | 11.7 — colisão, caracteres inválidos, nome vazio |
| Laço de compressão | 11.10 — para ao caber, respeita o máximo de 6 tentativas |
| Data relativa | 11.11 — inclusive a virada de dia no fuso local |
| Condição do pedido de avaliação | 11.12 |
| Filtro de confiança do OCR | 11.9, item 4 |
| Repositório (Drizzle) | CRUD de `documentos`, ordenação, exclusão |

**Regra:** teste de banco usa uma conexão de teste isolada, nunca o banco do app.

### 22.2 Verificação manual em aparelho físico

O que não dá para automatizar de forma útil:

| Alvo | Como |
|---|---|
| Qualidade da detecção de borda | Documento real sobre mesa, luz boa e luz ruim, nas duas plataformas |
| Legibilidade após compressão | PDF de 5 MB impresso e lido na tela |
| PDF pesquisável | Buscar palavra no Preview do macOS e no Google Drive |
| Compra e restauração | Sandbox das duas lojas, em aparelho físico |
| Acessibilidade | VoiceOver, TalkBack, fonte no maior tamanho |
| Modo avião | Fluxo completo com OCR, sem rede |
| Compartilhar | WhatsApp e Gmail, nas duas plataformas |

### 22.3 Casos de borda a cobrir
Página única; 50 páginas (limite); documento muito escuro; foto tremida; PDF importado protegido por senha; sem espaço em disco; app morto durante a geração; troca de tema no meio da montagem; virada de dia durante o uso; compra pendente por aprovação familiar.

---

## 23. Riscos e mitigação

| # | Risco | Impacto | Probab. | Mitigação |
|---|---|---|---|---|
| **R1** | `react-native-document-scanner-plugin` não funcionar em SDK 55 / New Architecture | **Alto** — é a função principal do app | Média | Validação **V1 no épico 8.1, antes de qualquer tela**. Plano B: `@dariyd/react-native-document-scanner` (2.0.19, Fabric no iOS) escrevendo um config plugin próprio. Plano C: captura pela `expo-camera` com detecção de borda manual — pior UX, mas viável. O módulo `services/scanner` isola a troca num arquivo só (seção 13). |
| **R2** | Android sem Google Play Services (aparelho Huawei, ROM alternativa) fica sem scanner e sem OCR | Médio | Baixa | Detectar na abertura e cair para "escolher das Fotos", com aviso claro. Declarar a exigência na ficha da Play. |
| **R3** | `expo-text-extractor` não devolver bounding boxes | Alto para o item D11 | Média | Validação **V4 no 8.1**. Sem boxes, a camada invisível não é posicionável: alternativas são trocar por `@react-native-ml-kit/text-recognition` ou **adiar o OCR para a v2 e ajustar o paywall para 3 itens**. Decisão do Alexandre, não do agente. |
| **R4** | `expo-print` estourar memória em documento longo | Médio | Média | Validação **V2 no 8.1**. Mitigação: limite de 50 páginas (11.3) e redimensionamento para 2400 px antes de embutir. |
| **R5** | Texto transparente não sobreviver como texto no PDF do `expo-print` | Alto para o item D11 | Média | Validação **V3 no 8.1**. Plano B: montar o PDF com `@cantoo/pdf-lib`, que controla a camada de texto diretamente, ao custo de polyfills. |
| **R6** | Recusa na revisão da App Store por "app de utilidade mínima" (guideline 4.2) | Alto — bloqueia o lançamento | Média | Os presets, o OCR e a compressão são justamente o que tira o app do "mínimo". Nas notas de revisão, descrever o recorte de documento brasileiro. Usar o skill `app-store-dablab`. |
| **R7** | Conversão baixa por o gratuito ser generoso demais | Médio | Média | Aceito conscientemente (P4). O limite de páginas vive num lugar só do código para virar teste de uma linha (M2). |
| **R8** | Qualidade da detecção de borda pior no Android | Médio | Média | Testar cedo nas duas plataformas (8.2, critério 2). ML Kit é maduro; se decepcionar, oferecer ajuste manual dos cantos. |
| **R9** | Categoria lotada — o app não ser encontrado | Alto para a M1 | **Alta** | O nome carrega "PDF", que é o termo de busca. A ficha das lojas ataca o nicho ("RG em PDF", "CNH em PDF"), não o genérico. É risco de marketing, não de produto — e não tem mitigação técnica. |
| **R10** | Compra não migrar entre plataformas gerar avaliação ruim | Baixo | Média | Dizer isso **antes** da compra, no paywall (15.14), em vez de deixar a pessoa descobrir depois. |

---

## 24. Assunções declaradas

**Decisões que eu tomei sem perguntar.** Revise antes de mandar implementar — **assunção não revisada vira verdade no minuto em que o agente começa a codar.**

| # | Assunção | Por quê | Se você discordar |
|---|---|---|---|
| A1 | **Português apenas, Brasil primeiro** | O nome é em português e o recorte é documento brasileiro. Lançar em inglês exigiria outro nome e outro posicionamento. | Dá para adicionar inglês depois (28.5), mas o nome não acompanha — seria outro app na App Store. |
| A2 | **Gratuito = até 2 páginas** | 2 cobre foto simples e frente-e-verso solto, mas não cobre contrato nem o preset numa página só — que é o que se vende. | Trocar para 1 ou 3 é mudar uma constante. Diga o número e eu ajusto. |
| A3 | **Preço R$ 29,90** | Alinhado ao I See Life, e alto o bastante para não parecer descartável. | Qualquer valor serve — é configuração de console, não código. |
| A4 | **Limite de 50 páginas por PDF** | Cobre contrato e escritura com folga; protege a memória (R4). | Posso subir, ao custo de testar memória de novo. |
| A5 | **iPhone apenas, sem iPad** | O cenário de uso é de mão, em pé, com o documento na outra mão. | iPad entra na v3 (28.6) — é layout, não arquitetura. |
| A6 | **Sem trava biométrica no MVP** | O app não é cofre (P1); o documento fica poucos minutos ali. | É barato adicionar (`expo-local-authentication`) se você achar que o histórico pede proteção. |
| A7 | **Histórico sem limite de idade nem de quantidade** | Apagar sozinho o arquivo de alguém é o pior comportamento possível num app de documento. | Posso adicionar limpeza automática opcional nos Ajustes. |
| A8 | **Presets: RG, CNH, CPF, título, passaporte** | São os cinco pedidos com mais frequência. | Certidão e comprovante de residência são multipágina normal — não ganham preset porque não têm formato fixo. |
| A9 | **`tipo_documento` no banco mesmo sem uso no MVP** | Custa uma coluna e habilita a v2 (28.1) sem migration. | — |
| A10 | **Repositório privado no GitHub** | Igual aos seus outros apps. | — |
| A11 | **Nenhum crash reporter, nem o do Expo** | Qualquer SDK com rede quebra a declaração "Data Not Collected" das lojas (20.5) e o princípio P3. | Se quiser estabilidade instrumentada, dá para usar só os painéis das lojas — é o que a seção 21 já assume. |
| A12 | **Retrato apenas** | O caminho principal é de uma mão só. | Paisagem do *PDF* existe (14); paisagem da *interface* não. |
| A13 | **Expo SDK 55** | Ver 4.5: é o SDK mais novo que roda na máquina do Alexandre sem upgrade de macOS, e honra a regra de não pegar a versão mais recente. | Subir para 56/57 exige macOS Tahoe antes. Decisão tomada em 26/08/2026. |

---

## 25. Perguntas abertas

**O agente de código deve PERGUNTAR, nunca assumir, ao cruzar com qualquer item desta lista.**

| # | Pergunta | Quem decide | Quando precisa estar decidido |
|---|---|---|---|
| **Q1** | Se a validação **V4/R3** falhar (sem bounding boxes), o OCR sai do MVP ou trocamos de biblioteca? | Alexandre | No fim do épico 8.1 — **bloqueia o 8.8** |
| **Q2** | Se a validação **V1/R1** falhar nas duas plataformas, vamos para o plano B (config plugin próprio) ou plano C (captura manual)? | Alexandre | No fim do épico 8.1 — **bloqueia todo o resto** |
| **Q3** | Lançar nas duas lojas ao mesmo tempo, ou iOS primeiro e Android depois de duas semanas de uso real? | Alexandre | Antes do épico 8.11 |
| **Q4** | O ícone é encomendado ou gerado? Qual a direção? | Alexandre | Antes do épico 8.11 |
| **Q5** | O **Quando Vence?** ganha alguma menção cruzada (por exemplo, um item nos Ajustes), ou os apps ficam totalmente independentes? | Alexandre | Antes do épico 8.10 |

---

## 26. Definition of Done

### Funcional
- [ ] Todos os critérios de aceite dos épicos 8.1 a 8.11 verificados, um a um.
- [ ] Os quatro fluxos da seção 9 percorridos em **aparelho físico**, nas duas plataformas.
- [ ] O fluxo gratuito (9.3) percorrido 5 vezes seguidas **sem encostar em paywall** (P4).

### Não-funcional
- [ ] Alvos de desempenho da 17.1 medidos e registrados.
- [ ] App funciona inteiro em **modo avião**, exceto comprar e restaurar.
- [ ] Acessibilidade da 17.3 verificada com VoiceOver e TalkBack.
- [ ] Binário abaixo de 60 MB nas duas plataformas.

### Privacidade
- [ ] Nenhuma biblioteca com acesso à rede no `package.json`, além do `expo-iap`.
- [ ] PDF gerado com OCR **em modo avião** — prova de que nada sai do aparelho.
- [ ] PDF inspecionado: sem autor, sem localização, sem identificador de aparelho.
- [ ] Nenhum `console.log` com conteúdo de documento no build de release.
- [ ] Fichas de privacidade das duas lojas preenchidas conforme a 20.5.

### Compra
- [ ] Compra e restauração testadas em **sandbox das duas lojas**, em aparelho físico.
- [ ] Preço exibido vem da loja; **nenhum preço no código** (grep confirma).
- [ ] Reinstalar e restaurar devolve o acesso.

### Código e documentação
- [ ] `npm run typecheck` e `npm run lint` limpos.
- [ ] `npm test` verde, cobrindo todos os alvos da 22.1.
- [ ] Banco em português conforme a seção 7 — **nenhuma tabela ou coluna fora do padrão**.
- [ ] Toda função e módulo de serviço com comentário de cabeçalho citando a regra do spec.
- [ ] Nenhuma cor fora de `src/theme/`; nenhum texto de interface fora de `src/strings/`.
- [ ] Nenhuma tela chamando biblioteca nativa direto — tudo por `src/services/`.
- [ ] `DOCUMENTACAO-TECNICA.md` gerado e conferido contra o que foi implementado.
- [ ] `CLAUDE.md`, `SCHEMA.md` e `README.md` em dia.

### Publicação
- [ ] `CFBundleIconName` declarado e ícone 1024 opaco.
- [ ] `TARGETED_DEVICE_FAMILY = 1` no iOS.
- [ ] Validação das duas lojas sem erro.
- [ ] Produto `com.dablab.mandaempdf.completo` criado e ativo nos dois consoles.

---

## 27. Próximos passos operacionais

1. **Alexandre revisa a seção 24** e responde as questões Q3 a Q5 da seção 25 (Q1 e Q2 só depois do épico 8.1).
2. Criar o repositório privado `asiqueira1973/manda-em-pdf` e o primeiro commit com este spec.
3. Rodar o **épico 8.1**, incluindo as validações V1–V4 — e **parar** para reportar o resultado antes de seguir.
4. Decidir Q1 e Q2 com base no resultado das validações.
5. Implementar os épicos 8.2 a 8.10, validando cada um contra seus critérios.
6. Criar o produto de compra nos dois consoles antes do épico 8.6, para poder testar em sandbox.
7. Gerar `DOCUMENTACAO-TECNICA.md`.
8. Épico 8.11: preparar as fichas com o skill `app-store-dablab` (iOS) e `~/roteiro-publicar-play-store.md` (Android).
9. Alexandre faz o envio final nos dois consoles.

---

## 28. Roadmap: próximas releases

### 28.1 v2 — Extração de dados de recibo
Ler cupom fiscal e nota e extrair **data, estabelecimento, CNPJ, valor total e imposto** para uma lista de despesas, com exportação em CSV. **Depende de** o OCR do MVP provar qualidade em nota fiscal brasileira (papel térmico, fonte ruim). A coluna `tipo_documento` (7.2) já prevê `recibo`. O CSV, quando existir, precisa sair em **UTF-8 com BOM**, separador `;`, data `DD/MM/AAAA` e número com vírgula decimal — para abrir no Excel em português sem quebrar.

### 28.2 v3 — Organização do histórico
Pastas, busca por nome e renomear. **Só entra se** o histórico simples se mostrar insuficiente no uso real — hoje é anti-escopo (P1) por decisão, não por esquecimento.

### 28.3 v2 — Trava biométrica
`expo-local-authentication` protegendo o histórico e a prévia. Opcional, desligado por padrão. Barato; ficou fora do MVP por não estar no caminho principal.

### 28.4 v2 — Reeditar um PDF gerado
Trocar, adicionar ou remover página de um PDF do histórico. **Exige** persistir as páginas de origem: nova tabela `paginas_documento` (id, documento_id, ordem, caminho_arquivo, filtro, rotacao) e mudança na seção 7 — migration aditiva, ver o trade-off em 7.5.

### 28.5 v2 — Inglês e espanhol
Traduzir os textos da seção 15. A seção 17.7 já obriga tudo a viver num arquivo só, então é trabalho de tradução, não de garimpo. Os presets mudam por país (documento brasileiro não serve ao mercado americano) — o que torna isto **mais produto do que tradução**.

### 28.6 v3 — iPad e tablet
Layout de duas colunas na montagem, grade maior. Mudança de layout, não de arquitetura.

### 28.7 v2 — Atalho de compartilhamento do sistema
Receber imagem compartilhada de outro app e cair direto na montagem. Elimina passos do Cenário B. Exige extensão de compartilhamento no iOS e intent filter no Android.

---

## 29. Protocolo de mudanças incrementais

Depois do v1 pronto, **não cole este spec inteiro de novo** — isso faz o agente reescrever o app.

1. **Commit de checkpoint** antes de qualquer mudança, para ter um `git diff` confiável.
2. Cole **só o trecho novo ou alterado**, ou um spec adicional só da feature.
3. Escreva como **diff**, não como recomeço: o projeto já existe e funciona.
4. **Delimite nominalmente o que não pode mudar.**
5. Peça a **lista de arquivos** que serão criados ou alterados **antes** do código, e aprove.
6. Revise o `git diff` contra o plano aprovado. Arquivo que passou do escopo: reverta e refaça o pedido mais específico.
7. Exija a atualização do `DOCUMENTACAO-TECNICA.md` **no mesmo commit**.

### Modelo de prompt para colar

```
O app Manda em PDF já está implementado e funcionando em ~/manda-em-pdf.
Leia CLAUDE.md e DOCUMENTACAO-TECNICA.md antes de qualquer coisa.

MUDANÇA:
<descreva só o que muda, citando a seção do spec quando existir>

NÃO PODE MUDAR:
- o fluxo gratuito de até 2 páginas (princípio P4 e regra 11.1)
- a estrutura do banco (seção 7), a menos que a mudança exija — e aí me avise antes
- <liste aqui o que mais precisa ficar intocado>

ANTES DE CODAR: me mostre a lista de arquivos que você vai criar ou alterar,
e espere eu aprovar.

AO TERMINAR: atualize DOCUMENTACAO-TECNICA.md no mesmo commit e rode
npm run typecheck e npm test.
```

---

## Anexo — Fontes

Tudo consultado em **26 de agosto de 2026**.

| Fonte | Para quê |
|---|---|
| [Expo SDK reference](https://docs.expo.dev/versions/latest/) | Existência de `expo-print`, `expo-image-manipulator`, `expo-file-system`, `expo-sharing`, `expo-sqlite`, `expo-camera`, `expo-document-picker`, `expo-image-picker` |
| [Expo SDK 55 — changelog](https://expo.dev/changelog/sdk-55) | **Versão adotada.** RN 0.83, React 19.2, lançado em 25/02/2026. **Xcode mínimo 26**; Node 20.19.4+/22.13+/24.3+; piso iOS 15.1; edge-to-edge obrigatório no Android 16+; `app.config.ts` transpilado pelo TS do projeto |
| [Expo SDK 56 — changelog](https://expo.dev/changelog/sdk-56) | **Descartado** — exige Xcode 26.4 (ver 4.5). RN 0.85, piso iOS 16.4 |
| [Expo SDK 57 — changelog](https://expo.dev/changelog/sdk-57) | Versão atual (RN 0.86), **descartada** — ver 4.5 |
| [Xcode — requisitos de sistema (Apple)](https://developer.apple.com/xcode/system-requirements) · [Xcode 26.4 exige macOS Tahoe 26.2](https://developer.apple.com/documentation/xcode-release-notes/xcode-26_4-release-notes) | **O fato que decidiu a stack:** Xcode 26.4+ exige macOS Tahoe 26.2+; até o 26.3 roda no Sequoia |
| [Expo SDK 54 — changelog](https://expo.dev/changelog/sdk-54) | Versão do projeto de referência (Hora do Remédio) |
| [`expo-iap` no npm](https://www.npmjs.com/package/expo-iap) | 5.4.0, publicado em 26/08/2026 |
| [`react-native-document-scanner-plugin`](https://react-native-document-scanner.js.org/) | VisionKit + ML Kit; 2.0.4, publicado em 02/01/2026 |
| [Usar o plugin de scanner com Expo — Scanbot](https://scanbot.io/techblog/how-to-use-react-native-document-scanner-plugin-with-expo/) | Passo a passo de integração com Expo e New Architecture |
| [`@dariyd/react-native-document-scanner`](https://github.com/dariyd/react-native-document-scanner) | Plano B: 2.0.19 (02/04/2026), Fabric no iOS, iOS 13+/API 21+, sem config plugin de Expo |
| [`expo-text-extractor`](https://github.com/pchalupa/expo-text-extractor) | OCR on-device: Apple Vision + ML Kit, exige SDK 52+; 2.0.0 (28/02/2026) |
| [`@react-native-ml-kit/text-recognition`](https://www.npmjs.com/package/@react-native-ml-kit/text-recognition) | Alternativa de OCR avaliada e descartada |
| Registro npm (`registry.npmjs.org`) | Datas de lançamento dos SDKs: 54 em 10/09/2025 · 55 em 25/02/2026 · 56 em 20/05/2026 · 57 em 30/06/2026. Linha 55 viva: `expo` 55.0.30 em 25/08/2026, e todos os pacotes acima existem em 55.x. Datas de publicação: `react-native-pdf-lib` **1.0.0 em 09/02/2020** (abandonado); `@cantoo/pdf-lib` 2.9.1 (18/08/2026) |
