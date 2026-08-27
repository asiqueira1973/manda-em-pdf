import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';
import { CHAVES_PREFERENCIA } from './schema';

const NOME_BANCO = 'mandaempdf.db';

/**
 * Abre o banco local e devolve o cliente Drizzle.
 * Recebe: nada. Devolve: o cliente tipado pelo schema da seção 7.
 */
function abrir() {
  const sqlite = SQLite.openDatabaseSync(NOME_BANCO, { enableChangeListener: true });
  return drizzle(sqlite, { schema });
}

export let db = abrir();

/** Erro lançado quando o banco não pôde ser aberto nem migrado. */
export class BancoRecriadoError extends Error {}

/**
 * Aplica as migrations e semeia as preferências na primeira execução (7.4).
 *
 * Recebe: nada. Devolve: `{ recriado }` — `recriado` é true quando o banco
 * estava corrompido e precisou ser apagado e recriado vazio, caso em que a
 * interface avisa o usuário com o texto de 15.18 (tabela de erros 12.3).
 */
export async function prepararBanco(): Promise<{ recriado: boolean }> {
  try {
    await migrate(db, migrations);
    await semearPreferencias();
    return { recriado: false };
  } catch {
    // Banco corrompido: a única saída é recriar vazio. Perde o histórico —
    // inevitável, e o usuário é avisado (12.3).
    await SQLite.deleteDatabaseAsync(NOME_BANCO).catch(() => undefined);
    db = abrir();
    await migrate(db, migrations);
    await semearPreferencias();
    return { recriado: true };
  }
}

/**
 * Insere as chaves de `preferencias` que ainda não existem, com os defaults
 * da tabela 7.3. É idempotente: reabrir o app não recria nem duplica linhas.
 */
async function semearPreferencias(): Promise<void> {
  const linhas = Object.entries(CHAVES_PREFERENCIA).map(([chave, valor]) => ({ chave, valor }));
  await db.insert(schema.preferencias).values(linhas).onConflictDoNothing();
}
