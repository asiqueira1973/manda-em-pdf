import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Schema do banco local (seção 7 do spec).
 *
 * CONVENÇÃO (18.1): tabelas, colunas e valores de enum em PORTUGUÊS,
 * snake_case. O código em volta é em inglês; a fronteira de idioma fica aqui.
 *
 * O modelo é deliberadamente pequeno: o app é ferramenta de passagem (P1).
 * A montagem em andamento vive em memória — só o PDF finalizado é persistido
 * (trade-off declarado em 7.5).
 */

/** Valores possíveis de `documentos.tipo_documento` (7.2). */
export const TIPOS_DOCUMENTO = [
  'livre',
  'contrato',
  'imovel',
  'procuracao',
  'nota_fiscal',
  'boleto',
  'rg',
  'cnh',
  'certidao',
  'recibo',
  'comprovante',
] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const ORIENTACOES = ['retrato', 'paisagem'] as const;
export type Orientacao = (typeof ORIENTACOES)[number];

export const TAMANHOS_PAPEL = ['a4', 'carta'] as const;
export type TamanhoPapel = (typeof TAMANHOS_PAPEL)[number];

/**
 * Histórico dos PDFs gerados. Uma linha por PDF que o app produziu.
 * Exclusão é HARD DELETE e apaga o arquivo do disco junto (regra 11.8).
 */
export const documentos = sqliteTable(
  'documentos',
  {
    id: text('id').primaryKey(),
    nome_arquivo: text('nome_arquivo').notNull(),
    /** Caminho RELATIVO dentro do diretório de documentos do app (regra 11.8). */
    caminho_arquivo: text('caminho_arquivo').notNull().unique(),
    total_paginas: integer('total_paginas').notNull(),
    tamanho_bytes: integer('tamanho_bytes').notNull(),
    tipo_documento: text('tipo_documento').$type<TipoDocumento>().notNull().default('livre'),
    /** 0 ou 1 — 1 quando o PDF tem camada de texto pesquisável. */
    tem_ocr: integer('tem_ocr').notNull().default(0),
    orientacao: text('orientacao').$type<Orientacao>().notNull().default('retrato'),
    tamanho_papel: text('tamanho_papel').$type<TamanhoPapel>().notNull().default('a4'),
    /** Epoch em milissegundos. Ordenação padrão do histórico. */
    criado_em: integer('criado_em')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index('idx_documentos_criado_em').on(t.criado_em),
    // Constraints da seção 7.2 — um PDF sempre tem pelo menos uma página e
    // um arquivo real no disco.
    check('documentos_total_paginas_min', sql`${t.total_paginas} >= 1`),
    check('documentos_tamanho_bytes_min', sql`${t.tamanho_bytes} > 0`),
    check('documentos_tem_ocr_bool', sql`${t.tem_ocr} in (0, 1)`),
  ],
);

/** Configuração do app em chave-valor (7.3). Não se apaga linha: sobrescreve-se. */
export const preferencias = sqliteTable('preferencias', {
  chave: text('chave').primaryKey(),
  valor: text('valor').notNull(),
  atualizado_em: integer('atualizado_em')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type Documento = typeof documentos.$inferSelect;
export type NovoDocumento = typeof documentos.$inferInsert;

/** Chaves previstas de `preferencias` e seus defaults (tabela da seção 7.3). */
export const CHAVES_PREFERENCIA = {
  onboarding_visto: '0',
  compra_liberada: '0',
  tamanho_papel_padrao: 'a4',
  filtro_padrao: 'original',
  total_pdfs_gerados: '0',
  /**
   * Se o pedido de avaliação na loja já foi feito. A regra 11.12 exige
   * "nunca foi pedido antes", e sem esta chave não haveria como cumprir —
   * a tabela 7.3 do spec foi corrigida junto (ver DECISOES.md).
   */
  avaliacao_pedida: '0',
} as const;
export type ChavePreferencia = keyof typeof CHAVES_PREFERENCIA;
