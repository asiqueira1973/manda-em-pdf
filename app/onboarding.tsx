import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BotaoPrimario, BotaoSecundario, Tela } from '@/components/base';
import { escreverPreferencia } from '@/db/repository';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, TIPO, useTema } from '@/theme';

/** Onboarding (tela 10.13): três telas, exibidas UMA vez só (critério 8.10.1). */
const ICONES = ['scan-outline', 'lock-closed-outline', 'gift-outline'] as const;

export default function Onboarding() {
  const { t } = useTema();
  const [passo, setPasso] = useState(0);
  const conteudo = T.onboarding[passo]!;
  const ultimo = passo === T.onboarding.length - 1;

  const avancar = async () => {
    if (!ultimo) return setPasso(passo + 1);
    await escreverPreferencia('onboarding_visto', '1');
    router.replace('/');
  };

  return (
    <Tela>
      <View style={est.centro}>
        <View style={[est.icone, { backgroundColor: t.superficie }]}>
          <Ionicons name={ICONES[passo]!} size={48} color={t.acao} />
        </View>
        <View>
          <Text style={[TIPO.titulo, { color: t.texto, fontSize: 28, lineHeight: 34, textAlign: 'center' }]}>
            {conteudo.titulo}
          </Text>
          <Text style={[TIPO.corpo, { color: t.textoSecundario, textAlign: 'center', lineHeight: 24, paddingTop: ESPACO.md }]}>
            {conteudo.corpo}
          </Text>
        </View>
      </View>

      <View style={est.pontos}>
        {T.onboarding.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === passo ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === passo ? t.acao : t.divisor,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: MARGEM_LATERAL, paddingBottom: ESPACO.sm }}>
        {ultimo ? (
          <BotaoPrimario titulo={T.comecar} aoTocar={avancar} />
        ) : (
          <BotaoSecundario titulo={T.continuar} aoTocar={avancar} />
        )}
      </View>
    </Tela>
  );
}

const est = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: ESPACO.xxl + 2 },
  icone: { width: 110, height: 110, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  pontos: { flexDirection: 'row', gap: 7, justifyContent: 'center', paddingBottom: ESPACO.xxl + 2 },
});
