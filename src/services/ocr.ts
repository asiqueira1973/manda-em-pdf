import { extractTextFromImage, isSupported } from 'expo-text-extractor';

/**
 * Reconhecimento de texto no aparelho (épico 8.8).
 *
 * Usa Apple Vision no iOS e ML Kit no Android — 100% on-device, nada sai do
 * aparelho (princípio P3, seção 20.3). Verificável gerando um PDF com OCR em
 * modo avião (critério 8.8.7).
 *
 * DECISÃO PENDENTE (Q1 do spec, ver DECISOES.md): a biblioteca devolve apenas
 * o texto, SEM as coordenadas de cada palavra. Por isso a camada invisível do
 * PDF vai como bloco corrido: buscar e copiar funcionam, mas a seleção não
 * acompanha visualmente a posição na imagem. Trocar por uma biblioteca com
 * bounding boxes é mexer só neste arquivo e no `htmlCamadaOcr` do pdfBuilder.
 */

export type TrechoOcr = {
  texto: string;
  /** 0–1 quando a biblioteca informa; ausente significa "não sabemos". */
  confianca?: number;
};

export type ResultadoOcr = { disponivel: boolean; texto: string; trechos: TrechoOcr[] };

/** True quando o aparelho suporta reconhecimento de texto. */
export function ocrDisponivel(): boolean {
  return isSupported;
}

/**
 * Reconhece o texto de uma imagem.
 *
 * Recebe: o URI da imagem.
 * Devolve: o texto corrido e os trechos. NUNCA lança — falha de OCR não pode
 * derrubar a geração do PDF (critério 8.8.5): devolve texto vazio e quem
 * chama segue sem a camada, mostrando o aviso de 15.11.
 */
export async function reconhecerTexto(uri: string): Promise<ResultadoOcr> {
  if (!isSupported) return { disponivel: false, texto: '', trechos: [] };
  try {
    const partes = await extractTextFromImage(uri);
    const trechos = partes
      .map((texto) => ({ texto: texto.trim() }))
      .filter((t) => t.texto.length > 0);
    return { disponivel: true, texto: trechos.map((t) => t.texto).join('\n'), trechos };
  } catch {
    return { disponivel: true, texto: '', trechos: [] };
  }
}
