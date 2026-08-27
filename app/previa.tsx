import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { router, useLocalSearchParams } from 'expo-router';
import { BarraNav, Tela } from '@/components/base';
import { obterDocumento, removerDocumento } from '@/db/repository';
import type { Documento } from '@/db/schema';
import { dataRelativa, formatarTamanho } from '@/lib/dataRelativa';
import { existePdf, removerPdf, uriDe } from '@/services/storage';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, RAIO, TIPO, useTema } from '@/theme';

/**
 * Prévia do PDF (tela 10.11).
 *
 * ESCOPO REDUZIDO — ver DECISOES.md: a página não é renderizada dentro do app.
 * Renderizar PDF exigiria uma dependência de visualizador (react-native-pdf ou
 * WebView com pdf.js) que ainda não entrou. Por ora a tela mostra os dados do
 * arquivo e abre a visualização no sistema, que já tem visualizador nativo.
 */
export default function Previa() {
  const { t } = useTema();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [doc, setDoc] = useState<Documento | null>(null);

  useEffect(() => {
    (async () => {
      if (id) setDoc((await obterDocumento(id)) ?? null);
    })();
  }, [id]);

  const abrirOuCompartilhar = async () => {
    if (!doc || !(await Sharing.isAvailableAsync())) return;
    await Sharing.shareAsync(uriDe(doc.caminho_arquivo), {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: doc.nome_arquivo,
    });
  };

  /** REGRA 11.8: linha primeiro, arquivo depois. */
  const apagar = () => {
    if (!doc) return;
    Alert.alert('', T.apagarPdfTitulo, [
      { text: T.cancelar, style: 'cancel' },
      {
        text: T.apagar,
        style: 'destructive',
        onPress: async () => {
          await removerDocumento(doc.id);
          removerPdf(doc.caminho_arquivo);
          router.back();
        },
      },
    ]);
  };

  const sumiu = doc ? !existePdf(doc.caminho_arquivo) : false;

  return (
    <Tela>
      <BarraNav esquerda={T.fechar} aoTocarEsquerda={() => router.back()} />

      <View style={est.centro}>
        <View style={[est.folha, { backgroundColor: t.superficie, borderColor: t.divisor }]}>
          <Ionicons name="document-text-outline" size={64} color={t.textoTerciario} />
        </View>
        <View style={{ alignItems: 'center', gap: 3 }}>
          <Text style={[TIPO.destaque, { color: t.texto }]} numberOfLines={1}>
            {doc?.nome_arquivo ?? ''}
          </Text>
          <Text style={[TIPO.subtitulo, { color: t.textoSecundario }]}>
            {doc
              ? `${T.contadorPaginas(doc.total_paginas)} · ${formatarTamanho(doc.tamanho_bytes)} · ${dataRelativa(doc.criado_em)}`
              : ''}
          </Text>
          {sumiu ? (
            <Text style={[TIPO.subtitulo, { color: t.alerta }]}>{T.indisponivel}</Text>
          ) : null}
        </View>
      </View>

      <View style={est.acoes}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={T.compartilhar}
          disabled={sumiu}
          onPress={abrirOuCompartilhar}
          style={{ alignItems: 'center', gap: 5, opacity: sumiu ? 0.4 : 1 }}
        >
          <Ionicons name="share-outline" size={24} color={t.acao} />
          <Text style={[TIPO.legenda, { color: t.textoSecundario }]}>{T.compartilhar}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={T.apagar}
          onPress={apagar}
          style={{ alignItems: 'center', gap: 5 }}
        >
          <Ionicons name="trash-outline" size={24} color={t.erro} />
          <Text style={[TIPO.legenda, { color: t.textoSecundario }]}>{T.apagar}</Text>
        </Pressable>
      </View>
    </Tela>
  );
}

const est = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ESPACO.xxl },
  folha: {
    width: 220,
    height: 300,
    borderRadius: RAIO.miniatura,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 56,
    paddingHorizontal: MARGEM_LATERAL,
    paddingBottom: ESPACO.xxl,
  },
});
