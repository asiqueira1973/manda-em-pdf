import * as Print from 'expo-print';
import { File } from 'expo-file-system';
import type { Orientacao, TamanhoPapel } from '@/db/schema';
import { filtroCss } from '@/lib/filtros';
import { MARGEM_PT, PAPEL, type Filtro, type Retangulo } from '@/lib/regras';

/**
 * Montagem e geração do PDF (seção 14 do spec).
 *
 * Motor: `expo-print`, que renderiza HTML em PDF nativo. Foi escolhido em
 * 4.2 por ser nativo, sem polyfill e sem dependência morta — e porque o HTML
 * é o que viabiliza a camada de texto invisível do OCR (regra 11.9).
 */

export type PaginaParaPdf = {
  base64: string;
  largura: number;
  altura: number;
  filtro: Filtro;
  /** Texto reconhecido, quando o OCR rodou (regra 11.9). */
  textoOcr?: string;
  /** Faces já posicionadas, usado só na fusão frente e verso (regra 11.6.1). */
  faces?: { base64: string; retangulo: Retangulo }[];
};

export type OpcoesPdf = {
  paginas: PaginaParaPdf[];
  tamanhoPapel: TamanhoPapel;
  orientacao: Orientacao;
};

/** Escapa texto para entrar em HTML sem quebrar a marcação nem injetar tag. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Dimensões da página em pontos, já considerando a orientação (seção 14). */
export function dimensoesPagina(
  tamanhoPapel: TamanhoPapel,
  orientacao: Orientacao,
): { largura: number; altura: number } {
  const base = PAPEL[tamanhoPapel];
  return orientacao === 'paisagem'
    ? { largura: base.altura, altura: base.largura }
    : { largura: base.largura, altura: base.altura };
}

/**
 * Monta o HTML de uma página comum: a imagem cabe na área útil preservando a
 * proporção (`contain`), centralizada, com margem de 24 pt (seção 14).
 */
function htmlPaginaSimples(p: PaginaParaPdf): string {
  const img =
    `<img src="data:image/jpeg;base64,${p.base64}" ` +
    `style="max-width:100%;max-height:100%;object-fit:contain;` +
    `filter:${filtroCss(p.filtro)};" />`;
  return `<div class="conteudo">${img}</div>`;
}

/**
 * Monta o HTML da página de fusão frente e verso (regra 11.6.1).
 * Cada face vai num retângulo já calculado em pontos por `geometriaFrenteVerso`.
 */
function htmlPaginaFaces(p: PaginaParaPdf): string {
  const faces = (p.faces ?? [])
    .map(
      (f) =>
        `<img src="data:image/jpeg;base64,${f.base64}" style="position:absolute;` +
        `left:${f.retangulo.x}px;top:${f.retangulo.y}px;` +
        `width:${f.retangulo.largura}px;height:${f.retangulo.altura}px;` +
        `object-fit:contain;filter:${filtroCss(p.filtro)};" />`,
    )
    .join('');
  return `<div class="faces">${faces}</div>`;
}

/**
 * Camada de texto invisível sobre a página (regra 11.9).
 *
 * O texto fica com `color:transparent` acima da imagem, então o PDF sai
 * pesquisável e copiável sem alterar a aparência. Trecho vazio não entra.
 *
 * LIMITE CONHECIDO: sem as coordenadas de cada palavra (ver DECISOES.md, Q1),
 * o texto vai como um bloco corrido — a busca e a cópia funcionam, mas a
 * seleção não acompanha visualmente a posição na imagem.
 */
function htmlCamadaOcr(texto?: string): string {
  if (!texto || texto.trim().length === 0) return '';
  return `<div class="ocr">${escapar(texto)}</div>`;
}

/**
 * Monta o documento HTML inteiro. Exportado para poder ser testado.
 *
 * PEGADINHA (custou um bug de páginas duplicadas): o `expo-print` recebe
 * `width`/`height` em PIXELS a 72 PPI e mapeia 1px do HTML para 1pt do PDF.
 * O CSS aqui precisa usar `px`, NÃO `pt` — em CSS 1pt = 96/72 px, então
 * `842pt` viraria 1122px, estouraria a altura da página e cada seção geraria
 * DUAS páginas no PDF. Os números são os mesmos da seção 14; só a unidade
 * muda.
 */
export function montarHtml(opcoes: OpcoesPdf): string {
  const { largura, altura } = dimensoesPagina(opcoes.tamanhoPapel, opcoes.orientacao);
  const util = { largura: largura - MARGEM_PT * 2, altura: altura - MARGEM_PT * 2 };

  const paginas = opcoes.paginas
    .map((p) => {
      const corpo = p.faces?.length ? htmlPaginaFaces(p) : htmlPaginaSimples(p);
      return `<section class="pagina">${corpo}${htmlCamadaOcr(p.textoOcr)}</section>`;
    })
    .join('');

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @page { size: ${largura}px ${altura}px; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${largura}px; }
  .pagina {
    position: relative;
    width: ${largura}px; height: ${altura}px;
    padding: ${MARGEM_PT}px;
    page-break-after: always; break-after: page;
    overflow: hidden;
  }
  .pagina:last-child { page-break-after: auto; break-after: auto; }
  .conteudo {
    width: ${util.largura}px; height: ${util.altura}px;
    display: flex; align-items: center; justify-content: center;
  }
  .faces { position: absolute; inset: 0; }
  .ocr {
    position: absolute;
    left: ${MARGEM_PT}px; top: ${MARGEM_PT}px;
    width: ${util.largura}px; height: ${util.altura}px;
    color: transparent;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 4px; line-height: 1.15;
    overflow: hidden;
    z-index: 2;
  }
</style></head><body>${paginas}</body></html>`;
}

export type ResultadoPdf = { uri: string; bytes: number; paginas: number };

/**
 * Gera o arquivo PDF a partir das páginas já preparadas.
 *
 * Recebe: as páginas (com base64), papel e orientação.
 * Devolve: o URI temporário, o tamanho em bytes e a contagem de páginas.
 *
 * O arquivo nasce no cache; quem chama move para a pasta definitiva com
 * `storage.salvarPdf` só depois de gravar a linha no banco (critério 8.4.5).
 */
export async function gerarPdf(opcoes: OpcoesPdf): Promise<ResultadoPdf> {
  const { largura, altura } = dimensoesPagina(opcoes.tamanhoPapel, opcoes.orientacao);
  const r = await Print.printToFileAsync({
    html: montarHtml(opcoes),
    width: largura,
    height: altura,
    base64: false,
  });
  const f = new File(r.uri);
  if (!f.exists || f.size === 0) throw new Error('expo-print devolveu um arquivo vazio');
  return { uri: r.uri, bytes: f.size, paginas: opcoes.paginas.length };
}
