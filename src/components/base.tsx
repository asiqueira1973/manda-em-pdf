import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALTURA_BOTAO, ESPACO, MARGEM_LATERAL, RAIO, TOQUE_MINIMO, TIPO, useTema } from '@/theme';
import { T } from '@/strings';

/**
 * Componentes base da interface, no padrão nativo da Apple (seção 16).
 *
 * REGRA DURA (18.4): nenhuma cor literal fora de `src/theme` e nenhum texto
 * de interface fora de `src/strings`. Estes componentes são o único lugar que
 * traduz os tokens em estilo.
 */

/** Moldura de tela: área segura + fundo do tema. */
export function Tela({
  children,
  agrupado = true,
  style,
}: {
  children: ReactNode;
  /** true usa o fundo de lista agrupada; false usa o fundo liso. */
  agrupado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTema();
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[{ flex: 1, backgroundColor: agrupado ? t.fundoAgrupado : t.fundo }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

/** Título grande no topo da tela (estilo Large Title do iOS). */
export function TituloGrande({ children, acao }: { children: string; acao?: ReactNode }) {
  const { t } = useTema();
  return (
    <View style={est.tituloLinha}>
      <Text style={[TIPO.tituloGrande, { color: t.texto, flexShrink: 1 }]}>{children}</Text>
      {acao}
    </View>
  );
}

/** Barra de navegação com ação à esquerda, título ao centro e ação à direita. */
export function BarraNav({
  esquerda,
  titulo,
  direita,
  aoTocarEsquerda,
  aoTocarDireita,
}: {
  esquerda?: string;
  titulo?: string;
  direita?: string;
  aoTocarEsquerda?: () => void;
  aoTocarDireita?: () => void;
}) {
  const { t } = useTema();
  return (
    <View style={est.nav}>
      <Pressable onPress={aoTocarEsquerda} hitSlop={12} style={est.navLado}>
        <Text style={[TIPO.corpo, { color: t.acao }]}>{esquerda ?? ''}</Text>
      </Pressable>
      <Text numberOfLines={1} style={[TIPO.destaque, { color: t.texto, flex: 1, textAlign: 'center' }]}>
        {titulo ?? ''}
      </Text>
      <Pressable onPress={aoTocarDireita} hitSlop={12} style={[est.navLado, { alignItems: 'flex-end' }]}>
        <Text style={[TIPO.corpo, { color: t.acao }]}>{direita ?? ''}</Text>
      </Pressable>
    </View>
  );
}

/** Botão principal: o elemento mais pesado da tela (16.4). */
export function BotaoPrimario({
  titulo,
  icone,
  aoTocar,
  desabilitado,
}: {
  titulo: string;
  icone?: keyof typeof Ionicons.glyphMap;
  aoTocar: () => void;
  desabilitado?: boolean;
}) {
  const { t } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: !!desabilitado }}
      disabled={desabilitado}
      onPress={aoTocar}
      style={({ pressed }) => [
        est.primario,
        {
          backgroundColor: pressed ? t.acaoPressionada : t.acao,
          opacity: desabilitado ? 0.4 : 1,
        },
      ]}
    >
      {icone ? <Ionicons name={icone} size={20} color={t.sobreAcao} /> : null}
      <Text style={[TIPO.destaque, { color: t.sobreAcao }]}>{titulo}</Text>
    </Pressable>
  );
}

/** Botão secundário, sem preenchimento forte. */
export function BotaoSecundario({ titulo, aoTocar }: { titulo: string; aoTocar: () => void }) {
  const { t } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={aoTocar}
      style={[est.secundario, { backgroundColor: t.superficie }]}
    >
      <Text style={[TIPO.corpo, { color: t.acao }]}>{titulo}</Text>
    </Pressable>
  );
}

/** Título de seção de lista agrupada (caixa alta pequena). */
export function TituloSecao({ children }: { children: string }) {
  const { t } = useTema();
  return (
    <Text
      style={[
        TIPO.rodape,
        {
          color: t.textoSecundario,
          fontWeight: '600',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          paddingHorizontal: MARGEM_LATERAL,
          paddingTop: ESPACO.xxl,
          paddingBottom: ESPACO.sm,
        },
      ]}
    >
      {children}
    </Text>
  );
}

/** Caixa de um grupo de células, no padrão de lista agrupada do iOS. */
export function Grupo({ children }: { children: ReactNode }) {
  const { t } = useTema();
  return (
    <View
      style={{
        marginHorizontal: MARGEM_LATERAL,
        backgroundColor: t.superficie,
        borderRadius: RAIO.celula,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

/** Separador fino, alinhado ao texto e não à borda da tela (16.4). */
export function Separador({ recuo = ESPACO.lg }: { recuo?: number }) {
  const { t } = useTema();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.divisor, marginLeft: recuo }} />;
}

/** Selo "Completo" que marca recurso pago (15.23). */
export function Selo() {
  const { t } = useTema();
  return (
    <View style={[est.selo, { backgroundColor: t.seloFundo }]}>
      <Text style={[TIPO.legenda, { color: t.acao, fontWeight: '600' }]}>{T.seloCompleto}</Text>
    </View>
  );
}

/** Linha de lista agrupada. `destrutiva` pinta o texto de vermelho (16.2). */
export function Celula({
  titulo,
  valor,
  chevron,
  destrutiva,
  acao,
  direita,
  desabilitada,
  aoTocar,
}: {
  titulo: string;
  valor?: string;
  chevron?: boolean;
  destrutiva?: boolean;
  /** Pinta o título com a cor de ação (linha que é botão, como "Restaurar compra"). */
  acao?: boolean;
  direita?: ReactNode;
  desabilitada?: boolean;
  aoTocar?: () => void;
}) {
  const { t } = useTema();
  const cor = destrutiva ? t.erro : acao ? t.acao : t.texto;

  const conteudo = (
    <>
      <Text style={[TIPO.corpo, { color: cor, flex: 1 }]} numberOfLines={1}>
        {titulo}
      </Text>
      {valor ? <Text style={[TIPO.corpo, { color: t.textoSecundario }]}>{valor}</Text> : null}
      {direita}
      {chevron ? <Ionicons name="chevron-forward" size={16} color={t.textoTerciario} /> : null}
    </>
  );

  // A célula só vira Pressable quando ela mesma faz alguma coisa. Um Pressable
  // desabilitado em volta engoliria o toque de um filho interativo — foi
  // exatamente isso que travou o interruptor de OCR na tela de Opções.
  if (!aoTocar) {
    return (
      <View style={[est.celula, { opacity: desabilitada ? 0.45 : 1 }]}>{conteudo}</View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: !!desabilitada }}
      disabled={desabilitada}
      onPress={aoTocar}
      style={({ pressed }) => [
        est.celula,
        { backgroundColor: pressed ? t.preenchimentoSutil : 'transparent', opacity: desabilitada ? 0.45 : 1 },
      ]}
    >
      {conteudo}
    </Pressable>
  );
}

/** Estado vazio centralizado, com ícone, título e corpo. */
export function EstadoVazio({
  icone,
  titulo,
  corpo,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  corpo: string;
}) {
  const { t } = useTema();
  return (
    <View style={est.vazio}>
      <View style={[est.vazioIcone, { backgroundColor: t.superficie }]}>
        <Ionicons name={icone} size={34} color={t.textoTerciario} />
      </View>
      <Text style={[TIPO.titulo, { color: t.texto, textAlign: 'center' }]}>{titulo}</Text>
      <Text style={[TIPO.subtitulo, { color: t.textoSecundario, textAlign: 'center', lineHeight: 21 }]}>
        {corpo}
      </Text>
    </View>
  );
}

/** ScrollView com o respiro padrão do rodapé. */
export function Rolagem({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: ESPACO.xxxl }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const est = StyleSheet.create({
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: MARGEM_LATERAL,
    paddingBottom: ESPACO.sm,
    gap: ESPACO.md,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOQUE_MINIMO,
    paddingHorizontal: ESPACO.lg,
    gap: ESPACO.sm,
  },
  navLado: { minWidth: 78, justifyContent: 'center' },
  primario: {
    height: ALTURA_BOTAO,
    borderRadius: RAIO.botao,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACO.sm,
  },
  secundario: {
    height: 48,
    borderRadius: RAIO.botao,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  celula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACO.md,
    paddingHorizontal: ESPACO.lg,
    minHeight: 48,
    paddingVertical: ESPACO.md,
  },
  selo: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  vazio: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
    gap: ESPACO.md,
  },
  vazioIcone: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ESPACO.xs,
  },
});
