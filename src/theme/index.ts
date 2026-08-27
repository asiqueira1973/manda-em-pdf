import { useColorScheme } from 'react-native';

/**
 * Tokens de cor do app (seção 16.2 do spec).
 *
 * São as cores de sistema da Apple, iguais às do `src/theme/colors.ts` do
 * Hora do Remédio, estendidas com os equivalentes de modo escuro.
 *
 * REGRA DURA (16.2): nenhuma cor literal pode existir fora deste arquivo.
 * Azul é ação, vermelho é destruição — vermelho nunca aparece em elemento
 * que não apaga. A única exceção declarada é a ação de deslizar numa lista,
 * que usa o padrão do sistema (vermelho preenchido).
 */
export type Tokens = {
  acao: string;
  acaoPressionada: string;
  fundo: string;
  fundoAgrupado: string;
  superficie: string;
  preenchimentoSutil: string;
  texto: string;
  textoSecundario: string;
  textoTerciario: string;
  divisor: string;
  seloFundo: string;
  sucesso: string;
  alerta: string;
  erro: string;
  scrim: string;
  camera: string;
  sobreAcao: string;
};

const CLARO: Tokens = {
  acao: '#007AFF',
  acaoPressionada: '#0062CC',
  fundo: '#FFFFFF',
  fundoAgrupado: '#F2F2F7',
  superficie: '#FFFFFF',
  preenchimentoSutil: '#E5E5EA',
  texto: '#1C1C1E',
  textoSecundario: '#6E6E73',
  textoTerciario: '#B0B0B5',
  divisor: '#E5E5EA',
  seloFundo: '#E8F1FE',
  sucesso: '#34C759',
  alerta: '#FF9500',
  erro: '#FF3B30',
  scrim: 'rgba(0,0,0,0.4)',
  camera: '#111113',
  sobreAcao: '#FFFFFF',
};

const ESCURO: Tokens = {
  acao: '#0A84FF',
  acaoPressionada: '#3D9BFF',
  fundo: '#000000',
  fundoAgrupado: '#000000',
  superficie: '#1C1C1E',
  preenchimentoSutil: '#39393D',
  texto: '#FFFFFF',
  textoSecundario: '#98989E',
  textoTerciario: '#68686E',
  divisor: '#38383A',
  seloFundo: '#0A2A4D',
  sucesso: '#30D158',
  alerta: '#FF9F0A',
  erro: '#FF453A',
  scrim: 'rgba(0,0,0,0.6)',
  camera: '#111113',
  sobreAcao: '#FFFFFF',
};

/** Escala de espaçamento e forma (seção 16.4). */
export const ESPACO = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const RAIO = { celula: 14, cartao: 14, botao: 14, folha: 14, miniatura: 8 } as const;
export const MARGEM_LATERAL = 20;
export const TOQUE_MINIMO = 44;
export const ALTURA_BOTAO = 52;

/** Estilos de texto nomeados da Apple (seção 16.3). */
export const TIPO = {
  tituloGrande: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  titulo: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  destaque: { fontSize: 17, fontWeight: '600' },
  corpo: { fontSize: 17, fontWeight: '400' },
  apoio: { fontSize: 16, fontWeight: '400' },
  subtitulo: { fontSize: 15, fontWeight: '400' },
  rodape: { fontSize: 13, fontWeight: '400' },
  legenda: { fontSize: 12, fontWeight: '400' },
} as const;

/**
 * Devolve os tokens do tema em vigor, seguindo o ajuste do sistema.
 * Não existe alternador manual no app (16.6).
 */
export function useTema(): { t: Tokens; escuro: boolean } {
  const esquema = useColorScheme();
  const escuro = esquema === 'dark';
  return { t: escuro ? ESCURO : CLARO, escuro };
}

export const TEMAS = { claro: CLARO, escuro: ESCURO };
