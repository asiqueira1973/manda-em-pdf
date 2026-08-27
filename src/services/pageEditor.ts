import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { TENTATIVAS } from '@/lib/regras';

/**
 * Transformações geométricas de uma página (seção 13).
 *
 * Cuida de girar, recortar e redimensionar. NÃO cuida de filtro — filtro é
 * função de cor aplicada na renderização, ver `src/lib/filtros.ts`.
 */

export type Pagina = {
  id: string;
  uri: string;
  largura: number;
  altura: number;
  rotacao: number;
};

export type Recorte = { originX: number; originY: number; width: number; height: number };

/** Lado maior padrão antes de a imagem entrar no PDF (tabela 11.3). */
export const LADO_MAIOR_PADRAO = TENTATIVAS[0]!.ladoMaior;
export const QUALIDADE_PADRAO = TENTATIVAS[0]!.qualidade;

/**
 * Gira a página em múltiplos de 90°. Girar 4 vezes devolve ao original
 * (critério 8.3.1) porque o ângulo é sempre normalizado para 0–359.
 */
export async function girar(pagina: Pagina, graus: number): Promise<Pagina> {
  const angulo = ((graus % 360) + 360) % 360;
  if (angulo === 0) return pagina;
  const r = await manipulateAsync(pagina.uri, [{ rotate: angulo }], {
    compress: 1,
    format: SaveFormat.JPEG,
  });
  return { ...pagina, uri: r.uri, largura: r.width, altura: r.height, rotacao: 0 };
}

/** Recorta a página. As coordenadas são em pixels da imagem original. */
export async function recortar(pagina: Pagina, recorte: Recorte): Promise<Pagina> {
  const r = await manipulateAsync(pagina.uri, [{ crop: recorte }], {
    compress: 1,
    format: SaveFormat.JPEG,
  });
  return { ...pagina, uri: r.uri, largura: r.width, altura: r.height };
}

/**
 * Reduz a imagem e devolve o base64 pronto para embutir no HTML do PDF.
 *
 * Recebe: a página, o lado maior alvo em pixels e a qualidade JPEG (0–1).
 * Devolve: o base64 sem o prefixo `data:`.
 *
 * Só reduz — nunca amplia, para não inventar pixel que não existe.
 */
export async function prepararParaPdf(
  pagina: Pagina,
  ladoMaior: number = LADO_MAIOR_PADRAO,
  qualidade: number = QUALIDADE_PADRAO,
): Promise<{ base64: string; largura: number; altura: number }> {
  const maior = Math.max(pagina.largura, pagina.altura);
  const acoes =
    maior > ladoMaior
      ? [
          pagina.largura >= pagina.altura
            ? { resize: { width: ladoMaior } }
            : { resize: { height: ladoMaior } },
        ]
      : [];
  const r = await manipulateAsync(pagina.uri, acoes, {
    compress: qualidade,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return { base64: r.base64 ?? '', largura: r.width, altura: r.height };
}
