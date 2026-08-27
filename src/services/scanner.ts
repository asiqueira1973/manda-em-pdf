import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin';
import { MAX_PAGINAS } from '@/lib/regras';

/**
 * Porta única para o scanner nativo (seção 13).
 *
 * Usa VisionKit no iOS e ML Kit Document Scanner no Android, com detecção de
 * borda e correção de perspectiva. É a função principal do app — por isso
 * todo o resto do código fala com ESTE arquivo e nunca com o plugin, para
 * que trocá-lo (risco R1, planos B e C da tabela 23) seja mexer aqui só.
 *
 * LIMITE DO NATIVO: a interface da câmera é do sistema e não aceita
 * sobreposição nossa. Por isso a captura guiada de frente e verso (regra
 * 11.6) é feita com DUAS chamadas de uma página, com a nossa tela de
 * instrução no meio — não com um overlay em cima da câmera.
 */

export type ResultadoScanner =
  | { cancelado: true }
  | { cancelado: false; paginas: string[] };

/**
 * Abre o scanner nativo.
 *
 * Recebe: quantas páginas no máximo (padrão: o limite de 50 da tabela 11.3).
 * Devolve: os caminhos das imagens capturadas, ou `cancelado` quando a
 * pessoa fechou sem capturar nada (critério 8.2.7).
 */
export async function escanear(maxPaginas: number = MAX_PAGINAS): Promise<ResultadoScanner> {
  const r = await DocumentScanner.scanDocument({
    maxNumDocuments: Math.max(1, Math.min(maxPaginas, MAX_PAGINAS)),
    croppedImageQuality: 100,
    responseType: ResponseType.ImageFilePath,
  });
  const paginas = r.scannedImages ?? [];
  if (r.status === 'cancel' || paginas.length === 0) return { cancelado: true };
  return { cancelado: false, paginas };
}

/** Captura exatamente uma página — usado nas duas etapas de frente e verso. */
export async function escanearUma(): Promise<ResultadoScanner> {
  return escanear(1);
}
