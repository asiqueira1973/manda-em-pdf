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
	CONSTRAINT "documentos_total_paginas_min" CHECK("documentos"."total_paginas" >= 1),
	CONSTRAINT "documentos_tamanho_bytes_min" CHECK("documentos"."tamanho_bytes" > 0),
	CONSTRAINT "documentos_tem_ocr_bool" CHECK("documentos"."tem_ocr" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documentos_caminho_arquivo_unique` ON `documentos` (`caminho_arquivo`);--> statement-breakpoint
CREATE INDEX `idx_documentos_criado_em` ON `documentos` (`criado_em`);--> statement-breakpoint
CREATE TABLE `preferencias` (
	`chave` text PRIMARY KEY NOT NULL,
	`valor` text NOT NULL,
	`atualizado_em` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
