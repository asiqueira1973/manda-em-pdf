import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { listarDocumentos, lerPreferencia } from '@/db/repository';
import type { Documento, TipoDocumento } from '@/db/schema';
import { dataRelativa, formatarTamanho } from '@/lib/dataRelativa';
import { PRESETS, presetDe } from '@/lib/regras';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, RAIO, TIPO, useTema } from '@/theme';
import { BotaoPrimario, EstadoVazio, Grupo, Separador, Tela, TituloGrande } from '@/components/base';
import { ICONE_PRESET } from '@/features/sessao/icones';
import { useSessao } from '@/features/sessao/SessaoProvider';

/**
 * Home (tela 10.1). O botão "Novo PDF" domina a tela de propósito: ele é o
 * caminho SEM preset, e é o caso geral (regra 11.6). Os presets abaixo são
 * atalhos, não um catálogo fechado — não existe cartão "Outros".
 */
export default function Home() {
  const { t } = useTema();
  const { iniciar } = useSessao();
  const [recentes, setRecentes] = useState<Documento[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    (async () => {
      if ((await lerPreferencia('onboarding_visto')) !== '1') router.replace('/onboarding');
    })();
  }, []);

  // Recarrega ao voltar para a Home, para o PDF recém-gerado aparecer no topo
  // sem reabrir o app (critério 8.5.1).
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      (async () => {
        const docs = await listarDocumentos(5);
        if (!vivo) return;
        setRecentes(docs);
        setCarregado(true);
      })();
      return () => {
        vivo = false;
      };
    }, []),
  );

  const comecar = (tipo: TipoDocumento) => {
    iniciar(tipo);
    // RG e CNH têm captura guiada em duas etapas (regra 11.6): não passam
    // pela folha de origem, vão direto para a primeira face.
    if (presetDe(tipo)?.modo === 'frente_verso') {
      router.push({ pathname: '/captura-guiada', params: { tipo } });
      return;
    }
    router.push({ pathname: '/origem', params: { tipo } });
  };

  return (
    <Tela>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: ESPACO.xxxl }}>
        <TituloGrande
          acao={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={T.ajustes}
              hitSlop={12}
              onPress={() => router.push('/ajustes')}
              style={{ marginBottom: 6 }}
            >
              <Ionicons name="settings-outline" size={24} color={t.acao} />
            </Pressable>
          }
        >
          Manda em PDF
        </TituloGrande>

        <View style={{ paddingHorizontal: MARGEM_LATERAL, paddingTop: ESPACO.md }}>
          <BotaoPrimario titulo={T.novoPdf} icone="scan-outline" aoTocar={() => comecar('livre')} />
        </View>

        <Text style={[TIPO.rodape, est.secao, { color: t.textoSecundario }]}>{T.secaoDocumentos}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: MARGEM_LATERAL, gap: ESPACO.md }}
        >
          {PRESETS.map((p) => (
            <Pressable
              key={p.tipo}
              accessibilityRole="button"
              accessibilityLabel={T.presets[p.tipo as keyof typeof T.presets]}
              onPress={() => comecar(p.tipo)}
              style={({ pressed }) => [
                est.cartao,
                { backgroundColor: t.superficie, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name={ICONE_PRESET[p.tipo] ?? 'document-outline'} size={24} color={t.acao} />
              {/* Duas linhas com entrelinha apertada: "Procuração" e "Nota
                  fiscal" não cabem numa linha só na largura do cartão. */}
              <Text
                numberOfLines={2}
                style={[TIPO.rodape, { color: t.texto, fontWeight: '600', lineHeight: 16 }]}
              >
                {T.presets[p.tipo as keyof typeof T.presets]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {carregado && recentes.length === 0 ? (
          <View style={{ paddingTop: ESPACO.xxxl * 2 }}>
            <EstadoVazio
              icone="document-outline"
              titulo={T.historicoVazioTitulo}
              corpo={T.historicoVazioCorpo}
            />
          </View>
        ) : (
          <>
            <View style={est.linhaRecentes}>
              <Text style={[TIPO.rodape, { color: t.textoSecundario, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' }]}>
                {T.secaoRecentes}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => router.push('/historico')} hitSlop={8}>
                <Text style={[TIPO.subtitulo, { color: t.acao }]}>{T.verTodos}</Text>
              </Pressable>
            </View>
            <Grupo>
              {recentes.map((d, i) => (
                <View key={d.id}>
                  <LinhaPdf documento={d} />
                  {i < recentes.length - 1 ? <Separador recuo={64} /> : null}
                </View>
              ))}
            </Grupo>
          </>
        )}
      </ScrollView>
    </Tela>
  );
}

/** Linha de um PDF no histórico, com nome, metadados e data relativa (11.11). */
export function LinhaPdf({ documento }: { documento: Documento }) {
  const { t } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={documento.nome_arquivo}
      onPress={() => router.push({ pathname: '/previa', params: { id: documento.id } })}
      style={({ pressed }) => [est.linha, { backgroundColor: pressed ? t.preenchimentoSutil : 'transparent' }]}
    >
      <View style={[est.miniatura, { backgroundColor: t.fundoAgrupado, borderColor: t.divisor }]}>
        <Ionicons name="document-text" size={16} color={t.erro} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={[TIPO.corpo, { color: t.texto }]}>
          {documento.nome_arquivo}
        </Text>
        <Text numberOfLines={1} style={[TIPO.subtitulo, { color: t.textoSecundario, marginTop: 1 }]}>
          {T.contadorPaginas(documento.total_paginas)} · {formatarTamanho(documento.tamanho_bytes)} ·{' '}
          {dataRelativa(documento.criado_em)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={t.textoTerciario} />
    </Pressable>
  );
}

const est = StyleSheet.create({
  secao: {
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: MARGEM_LATERAL,
    paddingTop: ESPACO.xxl + ESPACO.xs,
    paddingBottom: ESPACO.sm + 2,
  },
  cartao: {
    width: 104,
    height: 100,
    borderRadius: RAIO.cartao,
    padding: ESPACO.md,
    justifyContent: 'space-between',
  },
  linhaRecentes: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: MARGEM_LATERAL,
    paddingTop: ESPACO.xxl + ESPACO.xs,
    paddingBottom: ESPACO.sm + 2,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACO.md,
    paddingHorizontal: ESPACO.lg - 2,
    paddingVertical: ESPACO.md,
  },
  miniatura: {
    width: 38,
    height: 48,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
