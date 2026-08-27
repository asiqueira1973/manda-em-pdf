import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { RectButton } from 'react-native-gesture-handler';
import * as Sharing from 'expo-sharing';
import { BarraNav, EstadoVazio, Grupo, Separador, Tela, TituloGrande } from '@/components/base';
import { LinhaPdf } from './index';
import { listarDocumentos, removerDocumento } from '@/db/repository';
import type { Documento } from '@/db/schema';
import { existePdf, removerPdf, uriDe } from '@/services/storage';
import { T } from '@/strings';
import { ESPACO, TIPO, useTema } from '@/theme';

/**
 * Histórico (tela 10.10): existe só para reenviar o que acabou de sair (P1).
 * Sem busca, sem pastas, sem renomear — se algum apareceu, está fora de escopo.
 */
export default function Historico() {
  const { t } = useTema();
  const [docs, setDocs] = useState<Documento[]>([]);
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(async () => {
    setDocs(await listarDocumentos());
    setCarregado(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  /** REGRA 11.8: apaga a linha PRIMEIRO, o arquivo depois. */
  const apagar = (d: Documento) => {
    Alert.alert('', T.apagarPdfTitulo, [
      { text: T.cancelar, style: 'cancel' },
      {
        text: T.apagar,
        style: 'destructive',
        onPress: async () => {
          await removerDocumento(d.id);
          removerPdf(d.caminho_arquivo);
          await recarregar();
        },
      },
    ]);
  };

  const compartilhar = async (d: Documento) => {
    if (!(await Sharing.isAvailableAsync())) return;
    await Sharing.shareAsync(uriDe(d.caminho_arquivo), {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  };

  return (
    <Tela>
      <BarraNav esquerda="‹ Início" aoTocarEsquerda={() => router.back()} />
      <TituloGrande>{T.secaoRecentes}</TituloGrande>

      {carregado && docs.length === 0 ? (
        <EstadoVazio icone="document-outline" titulo={T.historicoVazioTitulo} corpo={T.historicoVazioCorpo} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: ESPACO.sm, paddingBottom: ESPACO.xxxl }}>
          <Grupo>
            {docs.map((d, i) => {
              const sumiu = !existePdf(d.caminho_arquivo);
              return (
                <View key={d.id}>
                  {sumiu ? (
                    // Arquivo apagado por fora do app: única ação é tirar da
                    // lista, sem derrubar nada (critério 8.5.4).
                    <View style={est.indisponivel}>
                      <Ionicons name="document-outline" size={20} color={t.textoTerciario} />
                      <View style={{ flex: 1 }}>
                        <Text style={[TIPO.corpo, { color: t.texto }]} numberOfLines={1}>
                          {d.nome_arquivo}
                        </Text>
                        <Text style={[TIPO.subtitulo, { color: t.textoSecundario }]}>{T.indisponivel}</Text>
                      </View>
                      <Text
                        style={[TIPO.subtitulo, { color: t.acao }]}
                        onPress={async () => {
                          await removerDocumento(d.id);
                          await recarregar();
                        }}
                      >
                        {T.removerDaLista}
                      </Text>
                    </View>
                  ) : (
                    <Swipeable
                      renderRightActions={() => (
                        <View style={{ flexDirection: 'row' }}>
                          {/* EXCEÇÃO DECLARADA (16.2): ação de deslizar usa o
                              padrão do sistema — preenchido, com ícone branco. */}
                          <RectButton
                            accessibilityLabel={T.compartilhar}
                            onPress={() => compartilhar(d)}
                            style={[est.acaoSwipe, { backgroundColor: t.acao }]}
                          >
                            <Ionicons name="share-outline" size={22} color={t.sobreAcao} />
                          </RectButton>
                          <RectButton
                            accessibilityLabel={T.apagar}
                            onPress={() => apagar(d)}
                            style={[est.acaoSwipe, { backgroundColor: t.erro }]}
                          >
                            <Ionicons name="trash-outline" size={22} color={t.sobreAcao} />
                          </RectButton>
                        </View>
                      )}
                    >
                      <View style={{ backgroundColor: t.superficie }}>
                        <LinhaPdf documento={d} />
                      </View>
                    </Swipeable>
                  )}
                  {i < docs.length - 1 ? <Separador recuo={64} /> : null}
                </View>
              );
            })}
          </Grupo>
        </ScrollView>
      )}
    </Tela>
  );
}

const est = StyleSheet.create({
  acaoSwipe: { width: 74, alignItems: 'center', justifyContent: 'center' },
  indisponivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACO.md,
    paddingHorizontal: ESPACO.lg - 2,
    paddingVertical: ESPACO.md,
    opacity: 0.7,
  },
});
