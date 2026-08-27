import { geometriaFrenteVerso } from '@/lib/regras';
import type { PaginaParaPdf } from './pdfBuilder';
import { prepararParaPdf, type Pagina } from './pageEditor';
import type { Filtro } from '@/lib/regras';

/**
 * Montagem das páginas de preset (regra 11.6).
 *
 * Hoje só a fusão de frente e verso precisa de montagem própria — os demais
 * presets são pré-configuração (filtro, papel, nome) e não transformam a
 * página.
 */

/**
 * Funde frente e verso numa única página A4 (regra 11.6.1 — capacidade paga).
 *
 * Recebe: as duas páginas capturadas e o filtro escolhido.
 * Devolve: uma página de PDF com as duas faces posicionadas, cada uma
 * preservando a proporção e centralizada horizontalmente.
 */
export async function fundirFrenteVerso(
  frente: Pagina,
  verso: Pagina,
  filtro: Filtro,
): Promise<PaginaParaPdf> {
  const geo = geometriaFrenteVerso(
    frente.largura / frente.altura,
    verso.largura / verso.altura,
  );
  const [f, v] = await Promise.all([prepararParaPdf(frente), prepararParaPdf(verso)]);
  return {
    base64: '',
    largura: 0,
    altura: 0,
    filtro,
    faces: [
      { base64: f.base64, retangulo: geo.frente },
      { base64: v.base64, retangulo: geo.verso },
    ],
  };
}

/**
 * Sem a compra, as duas faces saem como DUAS páginas normais (critério 8.7.8).
 * O app não bloqueia a captura — só não funde.
 */
export async function duasPaginasSeparadas(
  frente: Pagina,
  verso: Pagina,
  filtro: Filtro,
): Promise<PaginaParaPdf[]> {
  const [f, v] = await Promise.all([prepararParaPdf(frente), prepararParaPdf(verso)]);
  return [
    { base64: f.base64, largura: f.largura, altura: f.altura, filtro },
    { base64: v.base64, largura: v.largura, altura: v.altura, filtro },
  ];
}
