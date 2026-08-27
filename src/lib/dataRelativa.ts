import { T } from '@/strings';

/**
 * Data relativa exibida no histórico (regra 11.11 do spec).
 *
 * Fuso e idioma do aparelho. A virada de dia é pelo fuso LOCAL, nunca UTC —
 * é o que faz "Ontem" significar ontem para quem está lendo.
 */

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const p = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${p(d.getHours())}:${p(d.getMinutes())}`;

/** Meia-noite local do dia da data recebida — base da comparação por dia. */
function inicioDoDia(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Recebe: o instante do documento (epoch ms) e o "agora" (injetável para teste).
 * Devolve: o texto da tabela 11.11.
 */
export function dataRelativa(criadoEm: number, agora: Date = new Date()): string {
  const d = new Date(criadoEm);
  const diffMs = agora.getTime() - criadoEm;

  if (diffMs < 60_000) return T.agora;
  if (diffMs < 3_600_000) return `há ${Math.floor(diffMs / 60_000)} min`;

  const diasDeDiferenca = Math.round((inicioDoDia(agora) - inicioDoDia(d)) / 86_400_000);
  if (diasDeDiferenca === 0) return `${T.hoje}, ${hhmm(d)}`;
  if (diasDeDiferenca === 1) return `${T.ontem}, ${hhmm(d)}`;
  if (diasDeDiferenca < 7) return `${DIAS[d.getDay()]}, ${hhmm(d)}`;
  if (d.getFullYear() === agora.getFullYear()) return `${d.getDate()} de ${MESES[d.getMonth()]}`;
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Formata bytes no padrão brasileiro (vírgula decimal), como "4,2 MB". */
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1).replace('.', ',')} MB`;
}
