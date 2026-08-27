# Schema do banco (gerado a partir do banco real)

SQLite local, nomes em português `snake_case` (seção 7 do spec).
Gerado com `npm run db:generate`; migration em `src/db/migrations/`.

```sql
CREATE TABLE `documentos` (
	`id` text PRIMARY KEY NOT NULL,
	`nome_arquivo` text NOT NULL,
	`caminho_arquivo` text NOT NULL,
	`total_paginas` integer NOT NULL,
	`tamanho_bytes` integer NOT NULL,
	`tipo_documento` text DEFAULT 'livre' NOT NULL,
	`tem_ocr` integer DEFAULT 0 NOT NULL,
	`orientacao` text DEFAULT 'retrato' NOT NULL,
	`tamanho_papel` text DEFAULT 'a4' NOT NULL,
	`criado_em` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT `documentos_total_paginas_min` CHECK(`total_paginas` >= 1),
	CONSTRAINT `documentos_tamanho_bytes_min` CHECK(`tamanho_bytes` > 0),
	CONSTRAINT `documentos_tem_ocr_bool` CHECK(`tem_ocr` in (0, 1))
);
CREATE UNIQUE INDEX `documentos_caminho_arquivo_unique` ON `documentos` (`caminho_arquivo`);
CREATE INDEX `idx_documentos_criado_em` ON `documentos` (`criado_em`);

CREATE TABLE `preferencias` (
	`chave` text PRIMARY KEY NOT NULL,
	`valor` text NOT NULL,
	`atualizado_em` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
```

## Valores de enum (guardados como texto)

- `tipo_documento`: `livre` · `contrato` · `imovel` · `procuracao` ·
  `nota_fiscal` · `boleto` · `rg` · `cnh` · `certidao` · `recibo` · `comprovante`
- `orientacao`: `retrato` · `paisagem`
- `tamanho_papel`: `a4` · `carta`

## Chaves de `preferencias` (semeadas na primeira execução)

| Chave | Valores | Default |
|---|---|---|
| `onboarding_visto` | `0` \| `1` | `0` |
| `compra_liberada` | `0` \| `1` | `0` |
| `tamanho_papel_padrao` | `a4` \| `carta` | `a4` |
| `filtro_padrao` | `original` \| `pb` \| `cinza` \| `clarear` | `original` |
| `total_pdfs_gerados` | número como texto | `0` |
| `avaliacao_pedida` | `0` \| `1` | `0` |
