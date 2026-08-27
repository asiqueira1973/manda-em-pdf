import type { TipoDocumento } from '@/db/schema';
import { TENTATIVAS, maxTentativas, type TentativaCompressao } from '@/lib/regras';

/**
 * Laço de compressão com alvo de tamanho (regra 11.10 e o piso da 11.10.1).
 *
 * A função é pura em relação ao mundo: recebe uma função que remonta o PDF
 * com uma dada qualidade e devolve o tamanho. Isso a torna testável sem
 * gerar PDF de verdade.
 */

export type ResultadoCompressao = {
  uri: string;
  bytes: number;
  tentativasUsadas: number;
  alvoAtingido: boolean;
  /** True quando parou pelo piso do tipo (boleto/nota), não por falta de tentativa. */
  pararamPeloPiso: boolean;
};

export type Remontar = (t: TentativaCompressao) => Promise<{ uri: string; bytes: number }>;

/**
 * Reduz qualidade e resolução até o PDF caber no alvo.
 *
 * Recebe: o alvo em bytes, o tipo do documento (define o piso) e a função que
 * remonta o PDF.
 * Devolve: o menor PDF obtido e se o alvo foi atingido.
 *
 * Para ASSIM QUE COUBER — não continua degradando à toa (regra 11.10).
 * Para no piso do tipo quando ele existe: abaixo dele o código de barras do
 * boleto deixa de ser lido, e arquivo menor e ilegível é pior que arquivo
 * grande (regra 11.10.1).
 */
export async function comprimirAteAlvo(
  alvoBytes: number,
  tipo: TipoDocumento,
  remontar: Remontar,
  aoTentar?: (tentativa: number) => void,
): Promise<ResultadoCompressao> {
  const limite = maxTentativas(tipo);
  let melhor: { uri: string; bytes: number } | null = null;
  let usadas = 0;

  for (let i = 0; i < limite; i++) {
    const t = TENTATIVAS[i]!;
    usadas = i + 1;
    aoTentar?.(usadas);
    const r = await remontar(t);
    if (!melhor || r.bytes < melhor.bytes) melhor = r;
    if (r.bytes <= alvoBytes) {
      return {
        uri: r.uri,
        bytes: r.bytes,
        tentativasUsadas: usadas,
        alvoAtingido: true,
        pararamPeloPiso: false,
      };
    }
  }

  if (!melhor) throw new Error('compressao nao produziu nenhum arquivo');
  return {
    uri: melhor.uri,
    bytes: melhor.bytes,
    tentativasUsadas: usadas,
    alvoAtingido: false,
    pararamPeloPiso: limite < TENTATIVAS.length,
  };
}
