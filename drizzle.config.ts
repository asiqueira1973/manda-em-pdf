import type { Config } from 'drizzle-kit';

/**
 * Configuração do Drizzle Kit — gera as migrations SQL a partir do schema.
 * Rodar com `npm run db:generate` sempre que src/db/schema.ts mudar (seção 7.4).
 */
export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
