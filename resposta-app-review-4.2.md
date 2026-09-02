# Resposta à rejeição 4.2 — Manda em PDF

**Submission ID:** be90123e-6088-4164-a5b7-d503bfccccfe
**Diretriz:** 4.2 — Design — Minimum Functionality
**Data da revisão:** 02/09/2026 · **Aparelho:** iPad Air 11-inch (M3)

---

## Como usar

1. Cole as **notas de revisão novas** (abaixo) em App Store Connect →
   App Review Information → Notes, substituindo o texto atual.
2. Cole a **resposta** no Resolution Center.
3. Reenvie **o mesmo binário 1.0.0 (3)** — não precisa de build novo.

---

## Resposta para o Resolution Center (colar em inglês)

```
Thank you for the review and for the detailed feedback.

We would like to respectfully ask you to reconsider, because we believe our
own review notes led the review down the least representative path through
the app. Those notes focused on demonstrating that the in-app purchase is
fair, and instructed importing two images from the photo library and
exporting them. That is indeed a minimal interaction, but it is not what the
app is built to do. We have rewritten the notes to correct this.

Manda em PDF is not a generic photo-to-PDF converter. It is built around
specific Brazilian document types, and it changes capture behaviour, image
processing, page layout, file naming and compression per type. All of the
following is available for free, with no purchase:

- Contracts, property deeds and powers of attorney use continuous batch
  capture: the camera stays open between pages, so a 30-page deed is scanned
  in one session rather than page by page.
- Receipts (nota fiscal) get high-contrast processing for faded thermal
  paper, and are not forced into A4 proportions, because Brazilian receipts
  are long and narrow.
- Bills (boleto) are deliberately excluded from aggressive compression. Our
  size-reduction routine stops early for this document type, because past a
  certain point the barcode and the digitable line stop being machine
  readable, and an unreadable bill has no value to the user.
- ID documents use a guided two-step capture and can be merged front and
  back onto a single page.

Text recognition runs locally on device using Apple's Vision framework. The
app has no server, no account and no upload: documents never leave the
device. This can be verified in airplane mode, where the entire app works
except for purchases.

We also noticed the review was performed on an iPad Air. The app is
submitted as iPhone-only, and it is designed for one-handed use with a
physical document in the other hand, which is the situation it was built
for. Testing the scanner with the camera on an iPhone, on an actual paper
document, shows the intended experience.

The updated review notes include a three-minute test script that exercises
the document-type presets and the scanner without requiring any purchase.

We are of course happy to make changes if specific functionality is still
considered insufficient, and we would appreciate any guidance on what would
meet the requirement.
```

---

## Notas de revisão novas

Substituem integralmente as anteriores. **3.016 de 4.000 caracteres.**

O erro das notas antigas, para não se repetir: elas ensinavam o caminho mais
pobre do app — "escolha 1 ou 2 imagens da galeria, gere o PDF, compartilhe" —
e nunca mencionavam os presets, o scanner com detecção de borda, o piso de
compressão do boleto nem a fusão de frente e verso. As novas lideram com o que
diferencia, e tudo o que elas mandam testar é **gratuito**.

O texto está em `notas-revisao-app-store.txt`, ao lado deste arquivo.
