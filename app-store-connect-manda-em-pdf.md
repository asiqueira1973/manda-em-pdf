# App Store Connect — Manda em PDF

Pacote pronto para colar. Gerado a partir de `spec.md` (SDD v1.6) em 27/08/2026.
Campos medidos com `check_limits.py` — resultado no fim do documento.

---

## 1. App Information

| Campo | Valor |
|---|---|
| **Name** | `Manda em PDF` |
| **Subtitle** | `Scanner de documentos` |
| **Bundle ID** | `com.dablab.mandaempdf` |
| **Primary Category** | Utilities |
| **Secondary Category** | Business |
| **Copyright** | `© 2026 Alexandre Siqueira` |
| **Primary Language** | Portuguese (Brazil) |

> **Nota de ASO:** o nome ficou só com a marca, sem descritor, e o termo de busca
> forte ("scanner", "documentos") foi para o subtítulo — que a Apple indexa igual.
> Se quiser priorizar busca sobre marca, a alternativa é `Manda em PDF: Scanner`
> (21 caracteres, cabe), liberando o subtítulo para outra coisa.

---

## 2. Version Information (1.0)

### Promotional Text

```
Contrato, escritura, nota fiscal ou boleto viram PDF em segundos. Sem computador, sem scanner, sem enviar nada para a nuvem.
```

### Description

```
Alguém pediu o contrato em PDF e você só tem o papel na mão.

O Manda em PDF resolve isso em segundos: aponte a câmera, o app endireita a página sozinho e devolve um PDF pronto para mandar no WhatsApp, no e-mail ou anexar naquele site que só aceita PDF.

Nada sai do seu aparelho. Sem nuvem, sem conta, sem cadastro.

O QUE ELE FAZ

- Escaneia com detecção automática de borda e correção de perspectiva
- Junta quantas páginas você precisar num arquivo só
- Deixa o PDF do tamanho certo para caber no limite de upload do site
- Reconhece o texto do documento, para você achar depois pela busca
- Também funciona a partir de fotos que você já tem na galeria

FEITO PARA O PAPEL QUE NINGUÉM DIGITALIZA POR VOCÊ

Contrato assinado à mão. Escritura e matrícula que vieram do cartório. Procuração. Nota fiscal em papel térmico. Boleto impresso. Certidão. Recibo.

RG e CNH também dão certo — inclusive com frente e verso numa página só.

ATALHOS QUE JÁ SABEM O QUE FAZER

Toque em Contrato e a câmera fica aberta entre as páginas, para você escanear as doze de uma vez. Toque em Boleto e o app preserva a qualidade do código de barras. Toque em Nota fiscal e ele reforça o contraste do papel térmico desbotado. Cada atalho já entra com o filtro, o papel e o nome do arquivo certos.

SEUS DOCUMENTOS NÃO VÃO PARA LUGAR NENHUM

Tudo é processado dentro do seu iPhone. O app não tem servidor, não pede login e não manda seus documentos para lugar nenhum — nem para nós. É por isso que dá para escanear RG, contrato e escritura sem pensar duas vezes.

GRÁTIS DE VERDADE

PDFs de até duas páginas são grátis para sempre. Sem anúncio, sem marca d'água, sem contador de uso.

A versão completa é um pagamento único, sem assinatura, e libera:
- Documentos com quantas páginas precisar
- Ajustar o tamanho para caber no limite do site
- PDF com texto pesquisável
- RG e CNH frente e verso numa página só
```

### Keywords

```
contrato,boleto,nota fiscal,escritura,procuracao,digitalizar,imovel,cnh,ocr,certidao,rg
```

### What's New in This Version

```
Primeira versão.

Escaneie contrato, escritura, procuração, nota fiscal, boleto, RG ou CNH e receba um PDF pronto para enviar. Tudo dentro do aparelho, sem nuvem e sem conta.
```

---

## 3. App Privacy

**Resposta: `Data Not Collected`.**

O app não tem servidor, não tem conta, não usa analytics, não usa crash reporter
e não embute nenhum SDK com acesso à rede além do StoreKit (via `expo-iap`, para
a compra). Documentos, PDFs e preferências ficam no sandbox do aparelho.

A seção 20 do spec é a fonte disso, e o Definition of Done (§26) tem um item que
verifica isso a cada release: nenhuma biblioteca com rede no `package.json`, e um
PDF com OCR gerado em modo avião como prova.

> **Atenção ao manter:** adicionar qualquer SDK com rede (inclusive um crash
> reporter) obriga a rever esta resposta. Hoje ela é verdadeira.

---

## 4. URLs obrigatórias

| Campo | Valor |
|---|---|
| **Support URL** | `https://suportedablab.carrd.co/` |
| **Privacy Policy URL** | documento Notion "Política de Privacidade — Aplicativos da Dab Lab" |
| **Marketing URL** | *(deixar em branco)* |

### Seção nova para adicionar ao documento de Política de Privacidade

> **Importante:** o texto genérico do documento fala em Firebase Authentication,
> Crashlytics/Analytics e permissões de Notificações — **nada disso se aplica a
> este app**. A seção abaixo diz isso explicitamente, para o documento não
> contradizer a resposta "Data Not Collected" da ficha.

```
MANDA EM PDF

1. Coleta de Dados
O Manda em PDF não coleta nenhum dado. O aplicativo não possui servidor, não
exige cadastro, não cria conta e não utiliza ferramentas de análise de uso
(analytics) nem de relatório de falhas. Não há login, anônimo ou identificado:
as seções deste documento que mencionam autenticação, Firebase, Crashlytics ou
Analytics não se aplicam a este aplicativo.

2. Uso dos Dados
Os documentos que você escaneia ou importa são processados inteiramente dentro
do seu aparelho, para gerar o arquivo PDF que você mesmo solicitou. Esse
processamento inclui o reconhecimento de texto (OCR), que também acontece
apenas no aparelho, usando recursos do próprio sistema operacional. Nenhuma
imagem, nenhum texto reconhecido e nenhum PDF é enviado para a Dab Lab nem
para terceiros.

3. Armazenamento e Segurança
Os PDFs gerados e o histórico ficam guardados na área privada do aplicativo no
seu aparelho, protegida pelo sistema operacional. As imagens capturadas durante
a montagem de um documento são apagadas assim que o PDF é gerado ou descartado.
Os dados de localização eventualmente presentes nas fotos importadas da galeria
(EXIF) são removidos antes de a imagem entrar no PDF. Você pode apagar qualquer
documento individualmente, apagar todo o histórico nos Ajustes do aplicativo,
ou desinstalar o aplicativo — em qualquer um dos casos os arquivos são
removidos do aparelho.

O aplicativo solicita acesso à Câmera para escanear documentos e à Galeria de
Fotos para importar imagens que você escolher. Os dois acessos são usados
exclusivamente para produzir o PDF que você pediu, e podem ser recusados — nesse
caso o aplicativo continua funcionando pelas demais formas de importação.

4. Compartilhamento com Terceiros
Não há compartilhamento de dados com terceiros. O aplicativo se comunica pela
internet apenas com a App Store, e apenas para processar e restaurar a compra
da versão completa. Essa comunicação é feita pela Apple; a Dab Lab não recebe
nenhum dado seu nessa operação.

5. Contato
alexandre@dablab.com.br
```

---

## 5. Pricing and Availability

| Campo | Valor |
|---|---|
| **Preço do app** | Grátis (Tier 0) |
| **Availability** | All Countries or Regions |
| **Pre-Orders** | Não |

### In-App Purchase

| Campo | Valor |
|---|---|
| **Reference Name** | Manda em PDF Completo |
| **Product ID** | `com.dablab.mandaempdf.completo` |
| **Type** | Non-Consumable |
| **Price** | R$ 29,90 (tier equivalente no Brasil) |
| **Display Name** | Manda em PDF Completo |
| **Description** | `Pagamento único que libera PDFs com quantas páginas precisar, ajuste de tamanho para caber no limite do site, texto pesquisável no PDF e RG e CNH frente e verso numa página só.` |
| **Review Screenshot** | `capturas/iap-review-tela-de-compra.png` (1242 × 2688) — captura limpa da tela de compra, sem headline nem moldura. É um arquivo **diferente** da captura nº 6 da vitrine, que é peça de marketing. |

---

## 6. App Review Information

**Sign-in Required:** ❌ Não. O app não tem conta, login nem cadastro.

### Notes

> ⚠️ **As notas originais causaram a rejeição 4.2 de 02/09/2026.** Elas
> ensinavam o revisor a importar duas fotos e exportar — o caminho mais pobre
> do app — e não mencionavam os presets, o scanner nem o piso de compressão do
> boleto. Foram substituídas.
>
> **Texto vigente:** `notas-revisao-app-store.txt`
> **Resposta ao Resolution Center:** `resposta-app-review-4.2.md`

---

## 7. App Encryption Documentation

**Resposta: `None of the algorithms mentioned above`.**

O app não implementa criptografia própria. A única comunicação de rede é com a
App Store, feita pelo StoreKit da Apple. Já está declarado no build via
`ITSAppUsesNonExemptEncryption = false` no `Info.plist`, então o "Missing
Compliance" não deve nem aparecer.

---

## 8. Content Rights

**Resposta: `No, it does not contain, show, or access third-party content`.**

O app só mostra o que o próprio usuário escaneia ou importa. Não há conteúdo
licenciado de terceiros embutido — nem fonte, nem imagem, nem base de dados.

---

## 9. Classificação etária (expectativa)

**Expectativa: 4+.**

Sem conteúdo gerado por usuário visível a terceiros, sem rede social, sem chat,
sem IA generativa, sem conteúdo adulto, violento ou de apostas. O reconhecimento
de texto é determinístico (framework do sistema), não é IA generativa.

---

## 10. Capturas de tela

Prontas em `capturas/`, no formato **6.5" (1242 × 2688)**, na ordem de upload:

| # | Arquivo | Headline |
|---|---|---|
| 1 | `01-pediram-em-pdf.png` | Pediram em PDF |
| 2 | `02-contrato-inteiro.png` | Contrato inteiro, num arquivo só |
| 3 | `03-cabe-no-limite.png` | O site só aceita 5 MB |
| 4 | `04-nao-sai-do-iphone.png` | Não sai do seu iPhone |
| 5 | `05-pronto-pra-mandar.png` | Pronto pra mandar |
| 6 | `06-uma-compra.png` | Uma compra. Pra sempre. |

E, separado da vitrine, `iap-review-tela-de-compra.png` — a captura limpa que
vai no campo **Review Screenshot** do produto de compra (seção 5).

A ordem é um argumento: a dor, o caso de uso principal, a dor específica que
ninguém resolve, a objeção de confiança, o desfecho e o preço. A primeira é a
que quase todo mundo vê; a última, quase ninguém rola até lá.

---

## Medição dos limites

Medido com `check_limits.py` em 27/08/2026 — **todos os campos passam**:

| Campo | Uso | Limite | |
|---|---|---|---|
| Nome | 12 | 30 caracteres | ✅ |
| Subtítulo | 21 | 30 caracteres | ✅ |
| Texto promocional | 124 | 170 caracteres | ✅ |
| Descrição | 1.889 | 4.000 caracteres | ✅ |
| **Keywords** | **87** | **100 bytes** | ✅ |
| Notas da versão | 174 | 4.000 caracteres | ✅ |
| Notas de revisão | 1.886 | 4.000 caracteres | ✅ |

Sobre as keywords: são medidas em **bytes**, não caracteres, e acento consome
mais de um byte. Por isso `procuracao` e `certidao` vão sem cedilha e sem til —
a Apple normaliza acentuação na busca, então não se perde correspondência. Também
não repeti nada que já está no Nome ou no Subtítulo (`pdf`, `manda`, `scanner`,
`documentos`), porque esses campos já são indexados e repetir desperdiça bytes.
