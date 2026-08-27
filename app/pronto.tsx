import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as StoreReview from 'expo-store-review';
import { router, useLocalSearchParams } from 'expo-router';
import { BarraNav, BotaoPrimario, BotaoSecundario, Tela } from '@/components/base';
import { escreverPreferencia, lerPreferencia, obterDocumento } from '@/db/repository';
import type { Documento } from '@/db/schema';
import { formatarTamanho } from '@/lib/dataRelativa';
import { devePedirAvaliacao } from '@/lib/regras';
import { uriDe } from '@/services/storage';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, RAIO, TIPO, useTema } from '@/theme';

/**
 * Pronto (tela 10.9) — o fim do caminho principal.
 *
 * "Compartilhar" domina a tela porque é a razão de ser do app (P2): o pedido
 * chegou pelo WhatsApp e a resposta precisa voltar por lá.
 */
export default function Pronto() {
  const { t } = useTema();
  const { id, aviso } = useLocalSearchParams<{ id?: string; aviso?: string }>();
  const [doc, setDoc] = useState<Documento | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setDoc((await obterDocumento(id)) ?? null);
    })();
  }, [id]);

  useEffect(() => {
    if (!doc || !aviso) return;
    const texto =
      aviso === 'piso'
        ? T.boletoNoPiso(formatarTamanho(doc.tamanho_bytes))
        : aviso === 'tamanho'
          ? T.alvoNaoAtingido(formatarTamanho(doc.tamanho_bytes))
          : aviso === 'ocr'
            ? T.ocrFalhou
            : '';
    if (texto) Alert.alert('', texto);
  }, [doc, aviso]);

  const compartilhar = async () => {
    if (!doc) return;
    if (!(await Sharing.isAvailableAsync())) return;
    await Sharing.shareAsync(uriDe(doc.caminho_arquivo), {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: doc.nome_arquivo,
    });
    await talvezPedirAvaliacao();
  };

  /** Regra 11.12: uma vez só, depois de um compartilhamento bem-sucedido. */
  const talvezPedirAvaliacao = async () => {
    const total = Number(await lerPreferencia('total_pdfs_gerados')) || 0;
    const jaPediu = (await lerPreferencia('avaliacao_pedida').catch(() => '0')) === '1';
    if (!devePedirAvaliacao({ totalGerados: total, acabouDeCompartilhar: true, jaPediuAntes: jaPediu })) return;
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      await escreverPreferencia('avaliacao_pedida', '1');
    }
  };

  return (
    <Tela>
      <BarraNav direita={T.fechar} aoTocarDireita={() => router.dismissTo('/')} />

      <View style={est.centro}>
        <Text style={[TIPO.tituloGrande, { color: t.texto }]}>{T.pronto}</Text>
        <View style={[est.previa, { backgroundColor: t.superficie, borderColor: t.divisor }]}>
          <Ionicons name="document-text-outline" size={56} color={t.textoTerciario} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TIPO.destaque, { color: t.texto }]} numberOfLines={1}>
            {doc?.nome_arquivo ?? ''}
          </Text>
          <Text style={[TIPO.subtitulo, { color: t.textoSecundario, marginTop: 3 }]}>
            {doc ? `${T.contadorPaginas(doc.total_paginas)} · ${formatarTamanho(doc.tamanho_bytes)}` : ''}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: MARGEM_LATERAL, paddingBottom: ESPACO.sm, gap: ESPACO.md }}>
        <BotaoPrimario titulo={T.compartilhar} icone="share-outline" aoTocar={compartilhar} />
        <View style={{ flexDirection: 'row', gap: ESPACO.md }}>
          <BotaoSecundario titulo={T.salvarEmArquivos} aoTocar={compartilhar} />
          <BotaoSecundario titulo={T.novoPdf} aoTocar={() => router.dismissTo('/')} />
        </View>
      </View>
    </Tela>
  );
}

const est = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ESPACO.lg + 2 },
  previa: {
    width: 186,
    height: 248,
    borderRadius: RAIO.miniatura + 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
