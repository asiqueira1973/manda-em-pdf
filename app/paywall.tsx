import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BotaoPrimario, Tela } from '@/components/base';
import { useCompra } from '@/features/compra/CompraProvider';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, RAIO, TIPO, useTema } from '@/theme';

/**
 * Paywall (tela 10.7).
 *
 * REGRA 11.5 — o preço vem SEMPRE da loja. Se a consulta falhar, o botão
 * comprar some e aparece o texto de 15.13. Nunca exibimos preço chutado.
 *
 * Ao comprar, a tela fecha e a ação que o usuário tentou continua sozinha
 * (critério 8.6.5) — quem chamou o paywall reavalia o gate ao voltar.
 */
export default function Paywall() {
  const { t } = useTema();
  const { produto, lojaDisponivel, comprar, restaurar } = useCompra();
  const [ocupado, setOcupado] = useState(false);

  const aoComprar = async () => {
    setOcupado(true);
    try {
      const r = await comprar();
      if (r.estado === 'comprado') return router.back();
      if (r.estado === 'pendente') return Alert.alert('', T.compraPendente);
      if (r.estado === 'erro') Alert.alert('', r.mensagemDaLoja ?? T.lojaIndisponivel);
      // 'cancelado' volta ao ponto anterior sem mensagem (tabela 12.2).
    } finally {
      setOcupado(false);
    }
  };

  const aoRestaurar = async () => {
    setOcupado(true);
    try {
      const achou = await restaurar();
      if (achou) return router.back();
      Alert.alert('', T.restaurarSemCompra);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Tela agrupado={false}>
      <View style={est.topo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={T.fechar}
          hitSlop={12}
          onPress={() => router.back()}
          style={[est.fechar, { backgroundColor: t.preenchimentoSutil }]}
        >
          <Ionicons name="close" size={16} color={t.textoSecundario} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingTop: ESPACO.md }}>
        <View style={[est.icone, { backgroundColor: t.seloFundo }]}>
          <Ionicons name="document-text" size={32} color={t.acao} />
        </View>
        <Text style={[TIPO.titulo, { color: t.texto, fontSize: 28, lineHeight: 34 }]}>
          {T.paywallTitulo}
        </Text>
        <View style={{ paddingTop: ESPACO.lg }}>
          {T.paywallItens.map((item) => (
            <View key={item} style={est.item}>
              <Ionicons name="checkmark" size={21} color={t.acao} />
              <Text style={[TIPO.corpo, { color: t.texto, flex: 1, lineHeight: 23 }]}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: MARGEM_LATERAL, paddingBottom: ESPACO.sm, gap: ESPACO.md }}>
        {ocupado ? <ActivityIndicator color={t.acao} /> : null}
        {lojaDisponivel && produto ? (
          <BotaoPrimario
            titulo={T.comprarPor(produto.precoFormatado)}
            aoTocar={aoComprar}
            desabilitado={ocupado}
          />
        ) : (
          <Text style={[TIPO.subtitulo, { color: t.textoSecundario, textAlign: 'center' }]}>
            {T.lojaIndisponivel}
          </Text>
        )}
        <Pressable accessibilityRole="button" onPress={aoRestaurar} disabled={ocupado} hitSlop={8}>
          <Text style={[TIPO.corpo, { color: t.acao, textAlign: 'center' }]}>{T.restaurarCompra}</Text>
        </Pressable>
        <Text style={[TIPO.rodape, { color: t.textoSecundario, textAlign: 'center' }]}>
          {T.paywallRodape}
        </Text>
      </View>
    </Tela>
  );
}

const est = StyleSheet.create({
  topo: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: ESPACO.lg, height: 44, alignItems: 'center' },
  fechar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  icone: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: ESPACO.lg + 2 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: ESPACO.md, paddingVertical: 10 },
});
