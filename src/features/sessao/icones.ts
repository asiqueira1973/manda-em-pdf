import type { Ionicons } from '@expo/vector-icons';
import type { TipoDocumento } from '@/db/schema';

/** Ícone de cada preset na Home (ordem em `PRESETS`, regra 11.6). */
export const ICONE_PRESET: Partial<Record<TipoDocumento, keyof typeof Ionicons.glyphMap>> = {
  contrato: 'document-text-outline',
  imovel: 'home-outline',
  procuracao: 'ribbon-outline',
  nota_fiscal: 'receipt-outline',
  boleto: 'barcode-outline',
  rg: 'card-outline',
  cnh: 'car-outline',
};
