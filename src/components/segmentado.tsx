import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ESPACO, TIPO, useTema } from '@/theme';

/** Controle segmentado no padrão iOS (16.4), usado em Opções e Ajustes. */
export function Segmentado<V extends string>({
  opcoes,
  valor,
  aoMudar,
  desabilitado,
}: {
  opcoes: { valor: V; rotulo: string }[];
  valor: V;
  aoMudar: (v: V) => void;
  desabilitado?: boolean;
}) {
  const { t, escuro } = useTema();
  return (
    <View
      style={[
        est.trilho,
        { backgroundColor: escuro ? t.preenchimentoSutil : t.divisor, opacity: desabilitado ? 0.45 : 1 },
      ]}
    >
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo, disabled: !!desabilitado }}
            accessibilityLabel={o.rotulo}
            disabled={desabilitado}
            onPress={() => aoMudar(o.valor)}
            style={[est.item, ativo ? { backgroundColor: t.superficie } : null]}
          >
            <Text
              style={[TIPO.rodape, { color: t.texto, fontWeight: ativo ? '600' : '400' }]}
              numberOfLines={1}
            >
              {o.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const est = StyleSheet.create({
  trilho: { flexDirection: 'row', borderRadius: 9, padding: 2, gap: 2 },
  item: { paddingHorizontal: ESPACO.md, paddingVertical: 6, borderRadius: 7, minWidth: 62, alignItems: 'center' },
});
