import type { Orientacao, TamanhoPapel, TipoDocumento } from '@/db/schema';
import { incrementarTotalGerados, inserirDocumento, listarDocumentos } from '@/db/repository';
import { montarNomeArquivo } from '@/lib/nomeArquivo';
import { maxTentativas, TENTATIVAS, type Filtro } from '@/lib/regras';
import { comprimirAteAlvo } from '@/services/compressor';
import { reconhecerTexto } from '@/services/ocr';
import { prepararParaPdf, type Pagina } from '@/services/pageEditor';
import { gerarPdf, type PaginaParaPdf } from '@/services/pdfBuilder';
import { salvarPdf } from '@/services/storage';

/**
 * Orquestra a geração do PDF de ponta a ponta (épicos 8.4, 8.8 e 8.9).
 *
 * Ordem: preparar imagens → OCR (se pedido) → montar PDF → comprimir (se há
 * alvo) → mover para a pasta definitiva → gravar a linha no banco.
 *
 * A linha em `documentos` só entra quando a geração deu certo (critério
 * 8.4.8): falhar aqui nunca cria registro nem descarta as páginas do usuário.
 */

export type Etapa =
  | { fase: 'preparando'; pagina: number; total: number }
  | { fase: 'ocr'; pagina: number; total: number }
  | { fase: 'montando' }
  | { fase: 'comprimindo'; tentativa: number };

export type PedidoGeracao = {
  paginas: Pagina[];
  /** Página especial já montada, como a fusão frente e verso (regra 11.6.1). */
  paginasProntas?: PaginaParaPdf[];
  tipo: TipoDocumento;
  filtroDe: (pagina: Pagina) => Filtro;
  tamanhoPapel: TamanhoPapel;
  orientacao: Orientacao;
  ocr: boolean;
  alvoBytes: number | null;
  nomeCustomizado?: string;
};

export type ResultadoGeracao = {
  documentoId: string;
  nomeArquivo: string;
  uri: string;
  bytes: number;
  paginas: number;
  temOcr: boolean;
  /** True quando havia alvo de tamanho e ele não foi alcançado (15.12/15.33). */
  alvoNaoAtingido: boolean;
  pararamPeloPiso: boolean;
  ocrFalhou: boolean;
};

export async function gerar(
  pedido: PedidoGeracao,
  aoProgredir?: (e: Etapa) => void,
): Promise<ResultadoGeracao> {
  const total = pedido.paginasProntas?.length ?? pedido.paginas.length;

  /** Monta as páginas do PDF numa dada qualidade — reusado pela compressão. */
  const montarPaginas = async (qualidade: number, ladoMaior: number): Promise<PaginaParaPdf[]> => {
    if (pedido.paginasProntas?.length) return pedido.paginasProntas;
    const saida: PaginaParaPdf[] = [];
    for (let i = 0; i < pedido.paginas.length; i++) {
      const p = pedido.paginas[i]!;
      aoProgredir?.({ fase: 'preparando', pagina: i + 1, total });
      const img = await prepararParaPdf(p, ladoMaior, qualidade);
      saida.push({
        base64: img.base64,
        largura: img.largura,
        altura: img.altura,
        filtro: pedido.filtroDe(p),
      });
    }
    return saida;
  };

  const base = TENTATIVAS[0]!;
  let paginasPdf = await montarPaginas(base.qualidade, base.ladoMaior);

  // OCR é opt-in e é a etapa mais lenta — por isso tem progresso próprio.
  // Falhar aqui NUNCA derruba a geração (critério 8.8.5).
  let ocrFalhou = false;
  if (pedido.ocr && !pedido.paginasProntas?.length) {
    for (let i = 0; i < pedido.paginas.length; i++) {
      aoProgredir?.({ fase: 'ocr', pagina: i + 1, total });
      const r = await reconhecerTexto(pedido.paginas[i]!.uri);
      if (r.trechos.length > 0) paginasPdf[i]!.trechosOcr = r.trechos.map((t) => t.texto);
      else ocrFalhou = true;
    }
  }

  aoProgredir?.({ fase: 'montando' });
  let pdf = await gerarPdf({
    paginas: paginasPdf,
    tamanhoPapel: pedido.tamanhoPapel,
    orientacao: pedido.orientacao,
  });

  let alvoNaoAtingido = false;
  let pararamPeloPiso = false;

  if (pedido.alvoBytes !== null && pdf.bytes > pedido.alvoBytes) {
    const r = await comprimirAteAlvo(
      pedido.alvoBytes,
      pedido.tipo,
      async (tentativa) => {
        paginasPdf = await montarPaginas(tentativa.qualidade, tentativa.ladoMaior);
        const saida = await gerarPdf({
          paginas: paginasPdf,
          tamanhoPapel: pedido.tamanhoPapel,
          orientacao: pedido.orientacao,
        });
        return { uri: saida.uri, bytes: saida.bytes };
      },
      (tentativa) => aoProgredir?.({ fase: 'comprimindo', tentativa }),
    );
    pdf = { uri: r.uri, bytes: r.bytes, paginas: paginasPdf.length };
    alvoNaoAtingido = !r.alvoAtingido;
    pararamPeloPiso = r.pararamPeloPiso || maxTentativas(pedido.tipo) < TENTATIVAS.length;
  }

  const existentes = (await listarDocumentos()).map((d) => d.nome_arquivo);
  const nomeArquivo = montarNomeArquivo(pedido.tipo, new Date(), existentes, pedido.nomeCustomizado);

  const salvo = await salvarPdf(pdf.uri, nomeArquivo);
  const temOcr = pedido.ocr && !ocrFalhou;

  const doc = await inserirDocumento({
    id: `d${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`,
    nome_arquivo: nomeArquivo,
    caminho_arquivo: salvo.caminhoRelativo,
    total_paginas: pdf.paginas,
    tamanho_bytes: salvo.bytes,
    tipo_documento: pedido.tipo,
    tem_ocr: temOcr ? 1 : 0,
    orientacao: pedido.orientacao,
    tamanho_papel: pedido.tamanhoPapel,
    criado_em: Date.now(),
  });
  await incrementarTotalGerados();

  return {
    documentoId: doc.id,
    nomeArquivo,
    uri: salvo.uri,
    bytes: salvo.bytes,
    paginas: pdf.paginas,
    temOcr,
    alvoNaoAtingido,
    pararamPeloPiso,
    ocrFalhou,
  };
}
