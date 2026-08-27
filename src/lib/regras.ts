import type { TipoDocumento } from '@/db/schema';

/**
 * Regras de negócio da seção 11 do spec, em código puro e testável.
 * Nenhum número aqui pode ser inventado — todos vêm das tabelas do spec.
 */

// ---------------------------------------------------------------------------
// 11.1 — Gates de capacidade
// ---------------------------------------------------------------------------

/**
 * Páginas que a versão gratuita gera sem paywall, para sempre (tabela 11.1).
 * Este número vive num lugar só do código de propósito: a métrica M2 da seção
 * 21 prevê testá-lo trocando 2 por 1 ou 3, e isso tem que ser uma linha.
 */
export const PAGINAS_GRATIS = 2;

/** Limite técnico de páginas por PDF (tabela 11.3). */
export const MAX_PAGINAS = 50;

/** Capacidades que exigem a compra (tabela 11.1). */
export type CapacidadePaga = 'multipagina' | 'ocr' | 'compressao_alvo' | 'fusao_frente_verso';

/**
 * Decide se uma geração precisa passar pelo paywall (regra 11.1).
 *
 * Recebe: quantidade de páginas e se a compra está liberada.
 * Devolve: true quando pode gerar direto.
 *
 * REGRA DURA (P4): com 1 ou 2 páginas devolve SEMPRE true, em qualquer
 * circunstância. O fluxo gratuito nunca encosta em paywall.
 */
export function podeGerar(paginas: number, comprado: boolean): boolean {
  if (paginas <= PAGINAS_GRATIS) return true;
  return comprado;
}

/** Uma capacidade paga só está disponível com a compra liberada (11.1). */
export function capacidadeDisponivel(_c: CapacidadePaga, comprado: boolean): boolean {
  return comprado;
}

// ---------------------------------------------------------------------------
// 11.6 — Presets de documento
// ---------------------------------------------------------------------------

export type Filtro = 'original' | 'pb' | 'cinza' | 'clarear' | 'alto_contraste';
export type ModoCaptura = 'lote' | 'unica' | 'frente_verso';

export type Preset = {
  tipo: TipoDocumento;
  modo: ModoCaptura;
  filtro: Filtro;
  /** Quando true, o recorte não força a proporção A4 (cupom térmico). */
  proporcaoLivre: boolean;
};

/**
 * Presets na ORDEM da tabela 11.6. A ordem é o que comunica o que o app é:
 * contrato primeiro, RG e CNH por último. São gratuitos (11.1.1).
 */
export const PRESETS: readonly Preset[] = [
  { tipo: 'contrato', modo: 'lote', filtro: 'pb', proporcaoLivre: false },
  { tipo: 'imovel', modo: 'lote', filtro: 'pb', proporcaoLivre: false },
  { tipo: 'procuracao', modo: 'lote', filtro: 'pb', proporcaoLivre: false },
  { tipo: 'nota_fiscal', modo: 'unica', filtro: 'alto_contraste', proporcaoLivre: true },
  { tipo: 'boleto', modo: 'unica', filtro: 'original', proporcaoLivre: false },
  { tipo: 'rg', modo: 'frente_verso', filtro: 'original', proporcaoLivre: false },
  { tipo: 'cnh', modo: 'frente_verso', filtro: 'original', proporcaoLivre: false },
];

export function presetDe(tipo: TipoDocumento): Preset | undefined {
  return PRESETS.find((p) => p.tipo === tipo);
}

// ---------------------------------------------------------------------------
// 11.6.1 — Geometria da fusão de frente e verso
// ---------------------------------------------------------------------------

/** Dimensões de página em pontos (seção 14). */
export const PAPEL = {
  a4: { largura: 595, altura: 842 },
  carta: { largura: 612, altura: 792 },
} as const;

export const MARGEM_PT = 24;
const ESPACO_ENTRE_FACES = 24;

export type Retangulo = { x: number; y: number; largura: number; altura: number };

/**
 * Calcula onde cada face entra na página A4 na fusão frente e verso (11.6.1).
 *
 * Recebe: proporção (largura/altura) da frente e do verso.
 * Devolve: os dois retângulos em pontos, já centralizados horizontalmente.
 *
 * A área útil é dividida em duas faixas de 385 pt; cada face é escalada para
 * caber na sua faixa PRESERVANDO a proporção, limitada por largura ou altura,
 * o que vier primeiro.
 */
export function geometriaFrenteVerso(
  proporcaoFrente: number,
  proporcaoVerso: number,
): { frente: Retangulo; verso: Retangulo } {
  const { largura: lp, altura: ap } = PAPEL.a4;
  const utilLargura = lp - MARGEM_PT * 2;
  const utilAltura = ap - MARGEM_PT * 2;
  const faixaAltura = (utilAltura - ESPACO_ENTRE_FACES) / 2;

  const encaixar = (proporcao: number, topo: number): Retangulo => {
    let largura = utilLargura;
    let altura = largura / proporcao;
    if (altura > faixaAltura) {
      altura = faixaAltura;
      largura = altura * proporcao;
    }
    return {
      x: MARGEM_PT + (utilLargura - largura) / 2,
      y: topo + (faixaAltura - altura) / 2,
      largura,
      altura,
    };
  };

  return {
    frente: encaixar(proporcaoFrente, MARGEM_PT),
    verso: encaixar(proporcaoVerso, MARGEM_PT + faixaAltura + ESPACO_ENTRE_FACES),
  };
}

// ---------------------------------------------------------------------------
// 11.3 / 11.10 — Compressão
// ---------------------------------------------------------------------------

export type TentativaCompressao = { qualidade: number; ladoMaior: number };

/** Tabela de 6 tentativas da regra 11.10, na ordem. */
export const TENTATIVAS: readonly TentativaCompressao[] = [
  { qualidade: 0.75, ladoMaior: 2400 },
  { qualidade: 0.6, ladoMaior: 2400 },
  { qualidade: 0.5, ladoMaior: 2000 },
  { qualidade: 0.4, ladoMaior: 1600 },
  { qualidade: 0.3, ladoMaior: 1600 },
  { qualidade: 0.25, ladoMaior: 1200 },
];

/**
 * Quantas tentativas de compressão são permitidas para um tipo de documento.
 *
 * REGRA 11.10.1 — piso do boleto: abaixo da tentativa 3 o código de barras e a
 * linha digitável deixam de ser lidos, e boleto ilegível não é boleto. Nota
 * fiscal em papel térmico já chega com pouco contraste, então para na 4.
 */
export function maxTentativas(tipo: TipoDocumento): number {
  if (tipo === 'boleto') return 3;
  if (tipo === 'nota_fiscal') return 4;
  return TENTATIVAS.length;
}

/** True quando o tipo tem piso próprio (muda a mensagem exibida — 15.33). */
export function temPisoDeCompressao(tipo: TipoDocumento): boolean {
  return maxTentativas(tipo) < TENTATIVAS.length;
}

/** Alvos de tamanho oferecidos na tela de Opções (épico 8.9). */
export const ALVOS_TAMANHO = [
  { rotulo: 'Sem limite', bytes: null },
  { rotulo: '2 MB', bytes: 2 * 1024 * 1024 },
  { rotulo: '5 MB', bytes: 5 * 1024 * 1024 },
  { rotulo: '10 MB', bytes: 10 * 1024 * 1024 },
] as const;

// ---------------------------------------------------------------------------
// 11.9 — Camada de OCR
// ---------------------------------------------------------------------------

/** Trecho abaixo desta confiança é descartado: texto errado é pior que ausente. */
export const CONFIANCA_MINIMA_OCR = 0.3;

// ---------------------------------------------------------------------------
// 11.12 — Pedido de avaliação na loja
// ---------------------------------------------------------------------------

/**
 * Decide se o app pode pedir avaliação agora (regra 11.12).
 * As três condições são obrigatórias e o pedido acontece UMA vez só.
 */
export function devePedirAvaliacao(params: {
  totalGerados: number;
  acabouDeCompartilhar: boolean;
  jaPediuAntes: boolean;
}): boolean {
  return params.totalGerados >= 3 && params.acabouDeCompartilhar && !params.jaPediuAntes;
}
