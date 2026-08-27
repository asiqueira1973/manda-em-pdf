import { desc, eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { db as bancoPadrao } from './client';
import {
  CHAVES_PREFERENCIA,
  documentos,
  preferencias,
  type ChavePreferencia,
  type Documento,
  type NovoDocumento,
} from './schema';

/**
 * Única porta de acesso ao banco (seção 13). Nenhuma tela fala com o Drizzle
 * direto — assim trocar de ORM ou de banco é mexer só neste arquivo.
 *
 * Todas as funções aceitam um cliente opcional para que os testes usem uma
 * conexão isolada, nunca o banco do app (regra da seção 22.1).
 */
type Cliente = ExpoSQLiteDatabase<Record<string, unknown>>;
const cli = (c?: Cliente) => (c ?? bancoPadrao) as Cliente;

/**
 * Lista o histórico, do mais recente para o mais antigo (critério 8.5.2).
 * Recebe: limite opcional. Devolve: os documentos ordenados por `criado_em` desc.
 */
export async function listarDocumentos(limite?: number, c?: Cliente): Promise<Documento[]> {
  const q = cli(c).select().from(documentos).orderBy(desc(documentos.criado_em));
  return limite ? await q.limit(limite) : await q;
}

/** Busca um documento pelo id. Devolve `undefined` quando não existe. */
export async function obterDocumento(id: string, c?: Cliente): Promise<Documento | undefined> {
  const r = await cli(c).select().from(documentos).where(eq(documentos.id, id)).limit(1);
  return r[0];
}

/**
 * Grava um PDF recém-gerado no histórico (critério 8.4.5).
 * Recebe: a linha completa. Devolve: o documento gravado.
 */
export async function inserirDocumento(novo: NovoDocumento, c?: Cliente): Promise<Documento> {
  const r = await cli(c).insert(documentos).values(novo).returning();
  const doc = r[0];
  if (!doc) throw new Error('insercao de documento nao devolveu linha');
  return doc;
}

/**
 * Apaga a linha do histórico. O arquivo do disco é apagado por quem chama,
 * DEPOIS desta função — a ordem é obrigatória (regra 11.8): item fantasma no
 * histórico é pior que arquivo órfão no disco.
 */
export async function removerDocumento(id: string, c?: Cliente): Promise<void> {
  await cli(c).delete(documentos).where(eq(documentos.id, id));
}

/** Esvazia o histórico inteiro (épico 8.10, "Apagar todos os PDFs"). */
export async function removerTodosOsDocumentos(c?: Cliente): Promise<void> {
  await cli(c).delete(documentos);
}

/**
 * Lê uma preferência. Devolve o default da tabela 7.3 quando a chave ainda
 * não foi escrita — nunca `undefined`, para a interface não precisar tratar.
 */
export async function lerPreferencia(chave: ChavePreferencia, c?: Cliente): Promise<string> {
  const r = await cli(c).select().from(preferencias).where(eq(preferencias.chave, chave)).limit(1);
  return r[0]?.valor ?? CHAVES_PREFERENCIA[chave];
}

/** Escreve uma preferência, criando a linha se ainda não existir. */
export async function escreverPreferencia(
  chave: ChavePreferencia,
  valor: string,
  c?: Cliente,
): Promise<void> {
  await cli(c)
    .insert(preferencias)
    .values({ chave, valor, atualizado_em: Date.now() })
    .onConflictDoUpdate({
      target: preferencias.chave,
      set: { valor, atualizado_em: Date.now() },
    });
}

/** Restaura todas as preferências aos defaults da tabela 7.3 (épico 8.10). */
export async function restaurarPreferenciasPadrao(c?: Cliente): Promise<void> {
  for (const [chave, valor] of Object.entries(CHAVES_PREFERENCIA)) {
    await escreverPreferencia(chave as ChavePreferencia, valor, c);
  }
}

/**
 * Incrementa o contador de PDFs gerados (regra 11.12 — pedido de avaliação).
 * NUNCA é usado como gate de pagamento (P4).
 */
export async function incrementarTotalGerados(c?: Cliente): Promise<number> {
  const atual = Number(await lerPreferencia('total_pdfs_gerados', c)) || 0;
  const novo = atual + 1;
  await escreverPreferencia('total_pdfs_gerados', String(novo), c);
  return novo;
}
