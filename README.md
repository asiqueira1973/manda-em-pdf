# Manda em PDF

App iOS e Android que transforma papel em PDF pronto para enviar: contrato,
escritura, matrícula de imóvel, procuração, nota fiscal, boleto, certidão.
Tudo é processado **no aparelho** — sem servidor, sem conta, sem upload.

- Especificação: [`spec.md`](spec.md) (SDD v1.5)
- Modelo de dados: [`modelo-manda-em-pdf.dbml`](modelo-manda-em-pdf.dbml)
- Telas: [canvas publicado](https://claude.ai/code/artifact/be8b7d40-d47c-43ce-a791-0f1ab8e926eb) · fontes em [`design/`](design)
- Pendências e decisões: [`DECISOES.md`](DECISOES.md)
- Como o sistema ficou: [`DOCUMENTACAO-TECNICA.md`](DOCUMENTACAO-TECNICA.md)

## Stack

Expo **SDK 55** (React Native 0.83, React 19.2), TypeScript, expo-router,
expo-sqlite + Drizzle ORM, expo-print, expo-iap. iOS 15.1+, Android 7.0+.

A escolha do SDK 55 é deliberada e está justificada na seção 4.5 do spec:
o SDK 56+ exige Xcode 26.4, que exige macOS Tahoe.

## Rodar localmente

Requisitos: Node 20.19.4+, Xcode 26+, CocoaPods, Android SDK.

```bash
npm install
npx expo prebuild                                        # gera ios/ e android/
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:android
```

> **`LANG` é obrigatório.** O CocoaPods desta máquina falha sem locale UTF-8,
> com um erro que não diz qual é a causa. Considere pôr
> `export LANG=en_US.UTF-8` no `~/.zshrc`.

O scanner **não funciona no simulador** (não há câmera). Use "Escolher das
Fotos" para exercitar o fluxo, ou rode em aparelho físico.

## Verificar

```bash
npm run typecheck && npm test && npm run lint
```

## Banco de dados

Duas tabelas locais, nomes em português (seção 7 do spec): `documentos`
(histórico dos PDFs) e `preferencias` (chave-valor). Migrations versionadas
pelo Drizzle Kit e aplicadas na abertura do app.

Alterou `src/db/schema.ts`? Rode `npm run db:generate` e atualize o `.dbml`.

## Variáveis de ambiente

**Não existem.** O app não tem servidor, chave de API nem analytics. O id do
produto de compra é constante pública no código, não segredo.

## Publicar

Build e submissão por EAS. O passo a passo da Play Store está em
`~/roteiro-publicar-play-store.md`; a ficha da App Store sai do skill
`app-store-dablab`.
