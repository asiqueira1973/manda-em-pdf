import type { FilterFunction } from 'react-native';
import type { Filtro } from './regras';

/**
 * Filtros de digitalização (item D5 do escopo).
 *
 * DECISÃO TÉCNICA: o filtro NÃO é processamento de imagem — é uma função de
 * cor aplicada na renderização. O mesmo valor serve nos dois lugares onde a
 * página aparece:
 *   - no PDF, como `filter` CSS no <img> que o expo-print renderiza;
 *   - na prévia, como estilo `filter` do React Native (suportado desde a 0.76).
 *
 * Isso evita uma dependência de processamento de imagem só para isso — o
 * expo-image-manipulator não faz filtro — e garante que a prévia e o PDF
 * fiquem idênticos por construção, não por coincidência.
 */

/** Valor do `filter` CSS usado no HTML do PDF. */
export function filtroCss(filtro: Filtro): string {
  switch (filtro) {
    case 'original':
      return 'none';
    case 'pb':
      // Preto e branco "de scanner": satura o contraste depois de dessaturar.
      return 'grayscale(1) contrast(1.9) brightness(1.12)';
    case 'cinza':
      return 'grayscale(1)';
    case 'clarear':
      return 'brightness(1.22) contrast(1.08)';
    case 'alto_contraste':
      // Preset de nota fiscal: papel térmico chega desbotado (regra 11.6).
      return 'grayscale(1) contrast(2.4) brightness(1.2)';
  }
}

/** Mesmo filtro no formato de estilo do React Native, para a prévia na tela. */
export function filtroRn(filtro: Filtro): ReadonlyArray<FilterFunction> {
  switch (filtro) {
    case 'original':
      return [];
    case 'pb':
      return [{ grayscale: 1 }, { contrast: 1.9 }, { brightness: 1.12 }];
    case 'cinza':
      return [{ grayscale: 1 }];
    case 'clarear':
      return [{ brightness: 1.22 }, { contrast: 1.08 }];
    case 'alto_contraste':
      return [{ grayscale: 1 }, { contrast: 2.4 }, { brightness: 1.2 }];
  }
}

/** Ordem dos filtros oferecidos na interface. `alto_contraste` só via preset. */
export const FILTROS_OFERECIDOS: readonly Filtro[] = ['original', 'pb', 'cinza', 'clarear'];
