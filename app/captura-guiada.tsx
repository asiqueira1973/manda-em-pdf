import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BotaoPrimario, BotaoSecundario, Tela } from '@/components/base';
import type { TipoDocumento } from '@/db/schema';
import { escanearUma } from '@/services/scanner';
import { useSessao } from '@/features/sessao/SessaoProvider';
import { useCompra } from '@/features/compra/CompraProvider';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, TIPO, useTema } from '@/theme';
import type { Pagina } from '@/services/pageEditor';

/**
 * Captura guiada de frente e verso, para RG e CNH (épico 8.7).
 *
 * A interface da câmera é do SISTEMA e não aceita sobreposição nossa — por
 * isso a orientação aparece nesta tela, ENTRE as duas chamadas do scanner,
 * em vez de flutuar sobre a câmera (ver o comentário em services/scanner.ts).
 *
 * Sem a compra, as duas faces viram duas páginas normais: o app não bloqueia
 * a captura, só não funde (critério 8.7.8).
 */
export default function CapturaGuiada() {
  const { t } = useTema();
  const params = useLocalSearchParams<{ tipo?: string }>();
  const tipo = (params.tipo ?? 'rg') as TipoDocumento;
  const { adicionar, descartar, paginas } = useSessao();
  const { comprado } = useCompra();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [ocupado, setOcupado] = useState(false);

  const capturar = useCallback(async () => {
    setOcupado(true);
    try {
      const r = await escanearUma();
      if (r.cancelado) {
        // Cancelar no meio descarta o que já foi capturado (critério 8.7.10).
        descartar();
        router.dismissTo('/');
        return;
      }
      const novas: Pagina[] = r.paginas.map((uri, i) => ({
        id: `g${Date.now().toString(36)}${i}`,
        uri,
        largura: 0,
        altura: 0,
        rotacao: 0,
      }));
      adicionar(novas);
      if (etapa === 1) setEtapa(2);
      else router.replace('/montagem');
    } catch {
      Alert.alert('', T.cameraNegada);
      router.dismissTo('/');
    } finally {
      setOcupado(false);
    }
  }, [adicionar, descartar, etapa]);

  // Sem compra, avisa antes de seguir que as faces sairão em duas páginas
  // (texto 15.32) — dito ANTES, não depois de a pessoa descobrir sozinha.
  useEffect(() => {
    if (etapa !== 2 || comprado || paginas.length === 0) return;
    Alert.alert('', T.fusaoSemCompraTitulo, [
      { text: T.seguirComDuas, style: 'cancel' },
      { text: T.verVersaoCompleta, onPress: () => router.push('/paywall') },
    ]);
  }, [etapa, comprado, paginas.length]);

  const titulo = etapa === 1 ? T.fotografeFrente : T.agoraOVerso;

  return (
    <Tela>
      <View style={est.centro}>
        <View style={[est.icone, { backgroundColor: t.superficie }]}>
          <Ionicons name={tipo === 'cnh' ? 'car-outline' : 'card-outline'} size={48} color={t.acao} />
        </View>
        <Text style={[TIPO.titulo, { color: t.texto, textAlign: 'center' }]}>{titulo}</Text>
        <Text style={[TIPO.subtitulo, { color: t.textoSecundario }]}>{T.deN(etapa, 2)}</Text>
        <View style={est.pontos}>
          {[1, 2].map((n) => (
            <View
              key={n}
              style={{
                width: n === etapa ? 26 : 8,
                height: 4,
                borderRadius: 2,
                backgroundColor: n === etapa ? t.acao : t.divisor,
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: MARGEM_LATERAL, paddingBottom: ESPACO.sm, gap: ESPACO.md }}>
        <BotaoPrimario titulo={T.escanear} icone="scan-outline" aoTocar={capturar} desabilitado={ocupado} />
        <BotaoSecundario
          titulo={T.cancelar}
          aoTocar={() => {
            descartar();
            router.dismissTo('/');
          }}
        />
      </View>
    </Tela>
  );
}

const est = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ESPACO.lg, paddingHorizontal: 40 },
  icone: { width: 110, height: 110, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  pontos: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingTop: ESPACO.sm },
});
