import { Directory, File, Paths } from 'expo-file-system';

/**
 * Escrita, leitura e remoção dos PDFs no sandbox do app (seção 13).
 *
 * Todo PDF vive em `<documentos>/pdfs/`. O banco guarda apenas o caminho
 * RELATIVO (o nome do arquivo) — nunca o absoluto, porque o container do app
 * muda de caminho entre instalações e atualizações do iOS (regra 7.2).
 */

const PASTA = 'pdfs';

/** Diretório dos PDFs, criado sob demanda. */
function diretorio(): Directory {
  const d = new Directory(Paths.document, PASTA);
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

/** Converte o caminho relativo guardado no banco no URI real do arquivo. */
export function uriDe(caminhoRelativo: string): string {
  return new File(diretorio(), caminhoRelativo).uri;
}

/** Erro de disco cheio — a interface mostra o texto de 15.17 (tabela 12.3). */
export class SemEspacoError extends Error {}

/**
 * Move o PDF recém-gerado (que nasce no cache) para a pasta definitiva.
 *
 * Recebe: o URI temporário e o nome final do arquivo.
 * Devolve: o caminho relativo e o tamanho em bytes, para gravar no banco.
 */
export async function salvarPdf(
  uriTemporario: string,
  nomeArquivo: string,
): Promise<{ caminhoRelativo: string; uri: string; bytes: number }> {
  const origem = new File(uriTemporario);
  if (!origem.exists) throw new Error('PDF gerado não existe no caminho temporário');
  if (Paths.availableDiskSpace < origem.size * 2) throw new SemEspacoError();

  const destino = new File(diretorio(), nomeArquivo);
  if (destino.exists) destino.delete();
  origem.move(destino);
  return { caminhoRelativo: nomeArquivo, uri: destino.uri, bytes: destino.size };
}

/** True quando o arquivo do histórico ainda existe no disco (critério 8.5.4). */
export function existePdf(caminhoRelativo: string): boolean {
  return new File(diretorio(), caminhoRelativo).exists;
}

/** Tamanho em bytes; 0 quando o arquivo sumiu. */
export function tamanhoPdf(caminhoRelativo: string): number {
  const f = new File(diretorio(), caminhoRelativo);
  return f.exists ? f.size : 0;
}

/**
 * Apaga o arquivo do disco. Chamado DEPOIS de apagar a linha do banco —
 * a ordem é obrigatória (regra 11.8). Falhar aqui não é fatal: o arquivo
 * órfão é varrido na próxima abertura.
 */
export function removerPdf(caminhoRelativo: string): void {
  try {
    const f = new File(diretorio(), caminhoRelativo);
    if (f.exists) f.delete();
  } catch {
    // silencioso de propósito — ver regra 11.8
  }
}

/** Apaga todos os PDFs da pasta (épico 8.10, "Apagar todos os PDFs"). */
export function removerTodosOsPdfs(): void {
  for (const item of diretorio().list()) {
    try {
      item.delete();
    } catch {
      // idem 11.8
    }
  }
}

/**
 * Varredura de arquivos órfãos (regra 11.13): apaga o que está no disco e não
 * tem linha correspondente no banco. Roda em segundo plano na abertura e
 * nunca atrasa a primeira tela.
 *
 * Recebe: os caminhos relativos conhecidos pelo banco.
 * Devolve: quantos arquivos foram apagados.
 */
export function varrerOrfaos(caminhosConhecidos: readonly string[]): number {
  const conhecidos = new Set(caminhosConhecidos);
  let apagados = 0;
  for (const item of diretorio().list()) {
    const nome = item.name;
    if (!conhecidos.has(nome)) {
      try {
        item.delete();
        apagados++;
      } catch {
        // idem 11.8
      }
    }
  }
  return apagados;
}

/**
 * Apaga as imagens temporárias da montagem (seção 20.3, item 5).
 * Nunca deixamos página capturada no disco depois da sessão.
 */
export function limparTemporarios(uris: readonly string[]): void {
  for (const uri of uris) {
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // idem
    }
  }
}

/** Espaço livre em bytes — usado para abortar a geração antes de falhar feio. */
export function espacoDisponivel(): number {
  return Paths.availableDiskSpace;
}
