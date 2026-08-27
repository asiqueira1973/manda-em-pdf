import type { TipoDocumento } from '@/db/schema';

/**
 * Formação do nome do arquivo PDF (regra 11.7 do spec).
 *
 * Formato: `<base>-<AAAA-MM-DD>.pdf`. Sem acento e sem espaço — o arquivo
 * viaja por WhatsApp, e-mail e sistemas de upload que ainda tropeçam nisso.
 */

/** Base do nome por preset (tabela 11.7). */
const BASE_POR_TIPO: Record<TipoDocumento, string> = {
  livre: 'Documento',
  contrato: 'Contrato',
  imovel: 'Imovel',
  procuracao: 'Procuracao',
  nota_fiscal: 'Nota-Fiscal',
  boleto: 'Boleto',
  rg: 'RG',
  cnh: 'CNH',
  certidao: 'Certidao',
  recibo: 'Recibo',
  comprovante: 'Comprovante',
};

const INVALIDOS = /[/\\:*?"<>|]/g;

/** Devolve a base do nome para um tipo de documento (tabela 11.7). */
export function baseParaTipo(tipo: TipoDocumento): string {
  return BASE_POR_TIPO[tipo] ?? BASE_POR_TIPO.livre;
}

/** Formata uma data como AAAA-MM-DD no fuso local (regra 11.7). */
export function dataDoNome(quando: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${quando.getFullYear()}-${p(quando.getMonth() + 1)}-${p(quando.getDate())}`;
}

/**
 * Limpa um nome digitado pelo usuário: troca caractere inválido por hífen e,
 * se sobrar vazio, volta ao padrão (regra 11.7).
 *
 * Recebe: o texto digitado e a base padrão. Devolve: o nome utilizável.
 */
export function limparNome(digitado: string, padrao = 'Documento'): string {
  const limpo = digitado.replace(INVALIDOS, '-').trim();
  return limpo.length > 0 ? limpo : padrao;
}

/**
 * Monta o nome final, resolvendo colisão no mesmo dia com sufixo -2, -3, …
 *
 * Recebe: o tipo do documento, a data e os nomes já existentes no histórico.
 * Devolve: o nome de arquivo com extensão, único dentro dessa lista.
 */
export function montarNomeArquivo(
  tipo: TipoDocumento,
  quando: Date,
  jaExistentes: readonly string[],
  baseCustomizada?: string,
): string {
  const base = baseCustomizada ? limparNome(baseCustomizada, baseParaTipo(tipo)) : baseParaTipo(tipo);
  const raiz = `${base}-${dataDoNome(quando)}`;
  const usados = new Set(jaExistentes);
  if (!usados.has(`${raiz}.pdf`)) return `${raiz}.pdf`;
  for (let i = 2; i < 1000; i++) {
    const tentativa = `${raiz}-${i}.pdf`;
    if (!usados.has(tentativa)) return tentativa;
  }
  // Improvável na prática; evita laço infinito.
  return `${raiz}-${Date.now()}.pdf`;
}
