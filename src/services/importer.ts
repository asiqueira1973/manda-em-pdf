import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { MAX_PAGINAS } from '@/lib/regras';
import type { Pagina } from './pageEditor';

/**
 * Importação de páginas vindas da galeria e do app Arquivos (épico 8.2).
 *
 * REGRA DE PRIVACIDADE (20.3, item 4): toda imagem importada passa por uma
 * reescrita antes de entrar no app. Isso REMOVE o EXIF — inclusive a
 * localização de onde a foto foi tirada, que jamais pode ir parar no PDF.
 */

/** Formatos de imagem aceitos (seção 14). */
const MIME_ACEITOS = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];

export type ResultadoImportacao =
  | { cancelado: true }
  | { cancelado: false; paginas: Pagina[]; recusados: number };

let contador = 0;
const novoId = () => `p${Date.now().toString(36)}${(contador++).toString(36)}`;

/**
 * Reescreve a imagem para tirar o EXIF e normalizar o formato.
 * Recebe o URI original; devolve a página já pronta para a montagem.
 */
async function normalizar(uri: string): Promise<Pagina> {
  const r = await manipulateAsync(uri, [], { compress: 1, format: SaveFormat.JPEG });
  return { id: novoId(), uri: r.uri, largura: r.width, altura: r.height, rotacao: 0 };
}

/** Importa imagens da galeria de fotos (critério 8.2.3, mantém a ordem). */
export async function importarDasFotos(
  restante: number = MAX_PAGINAS,
): Promise<ResultadoImportacao> {
  const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) return { cancelado: true };

  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: Math.max(1, restante),
    exif: false,
    quality: 1,
  });
  if (r.canceled || r.assets.length === 0) return { cancelado: true };

  const paginas: Pagina[] = [];
  for (const a of r.assets) paginas.push(await normalizar(a.uri));
  return { cancelado: false, paginas, recusados: 0 };
}

/**
 * Importa imagens do app Arquivos (critério 8.2.5).
 *
 * ESCOPO REDUZIDO — ver DECISOES.md: importar PDF ainda não é suportado.
 * Transformar página de PDF em imagem exige renderizador (PDFKit no iOS,
 * PdfRenderer no Android) que nenhuma API do Expo expõe. Arquivo que não é
 * imagem é recusado com a mensagem de 15.5, em vez de falhar em silêncio.
 */
export async function importarDeArquivos(
  restante: number = MAX_PAGINAS,
): Promise<ResultadoImportacao> {
  const r = await DocumentPicker.getDocumentAsync({
    type: MIME_ACEITOS,
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (r.canceled || r.assets.length === 0) return { cancelado: true };

  const paginas: Pagina[] = [];
  let recusados = 0;
  for (const a of r.assets.slice(0, Math.max(1, restante))) {
    if (a.mimeType && !MIME_ACEITOS.includes(a.mimeType)) {
      recusados++;
      continue;
    }
    try {
      paginas.push(await normalizar(a.uri));
    } catch {
      recusados++;
    }
  }
  return { cancelado: false, paginas, recusados };
}
