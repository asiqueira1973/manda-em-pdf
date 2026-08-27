import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, RAIO, TIPO, useTema } from '@/theme';
import { BarraNav, BotaoPrimario, Tela } from '@/components/base';
import { filtroDaPagina, useSessao } from '@/features/sessao/SessaoProvider';
import { useCompra } from '@/features/compra/CompraProvider';
import { filtroRn } from '@/lib/filtros';
import { MAX_PAGINAS, podeGerar, presetDe } from '@/lib/regras';
import { girar } from '@/services/pageEditor';
import { gerar, type Etapa } from '@/features/geracao/gerar';
import { fundirFrenteVerso } from '@/services/presets';
import { SemEspacoError } from '@/services/storage';

/**
 * Montagem (tela 10.4): revisar e ajustar as páginas antes de gerar.
 *
 * O botão "Gerar PDF" gera DIRETO com os padrões — não passa por tela de
 * ajuste (fluxo 8.4.a). Quem quer configurar toca em "Opções", que é desvio
 * voluntário e fica fora do caminho principal (P2).
 */
export default function Montagem() {
  const { t } = useTema();
  const sessao = useSessao();
  const { comprado } = useCompra();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const paginas = sessao.paginas;
  const preset = presetDe(sessao.tipo);
  const ehFrenteVerso = preset?.modo === 'frente_verso';
  // Na fusão, as duas faces viram UMA página — é isso que o gate enxerga.
  const paginasFinais = ehFrenteVerso && comprado ? 1 : paginas.length;

  const sair = () => {
    Alert.alert('', T.descartarTitulo, [
      { text: T.continuar, style: 'cancel' },
      {
        text: T.descartar,
        style: 'destructive',
        onPress: () => {
          sessao.descartar();
          router.dismissTo('/');
        },
      },
    ]);
  };

  const girarPagina = async (id: string) => {
    const p = paginas.find((x) => x.id === id);
    if (!p) return;
    setOcupado(true);
    try {
      sessao.substituir(id, await girar(p, 90));
    } finally {
      setOcupado(false);
    }
  };

  const excluirPagina = (id: string) => {
    sessao.remover(id);
    setSelecionada(null);
  };

  const mover = (id: string, direcao: -1 | 1) => {
    const i = paginas.findIndex((p) => p.id === id);
    if (i < 0) return;
    sessao.reordenar(i, i + direcao);
  };

  const gerarAgora = async () => {
    if (paginas.length === 0) return;
    if (paginas.length > MAX_PAGINAS) return Alert.alert('', T.limitePaginas);

    if (!podeGerar(paginasFinais, comprado)) {
      router.push({ pathname: '/paywall', params: { motivo: 'multipagina' } });
      return;
    }

    setEtapa({ fase: 'montando' });
    try {
      // Fusão de frente e verso (regra 11.6.1): capacidade paga. Sem a compra,
      // as duas faces saem como duas páginas normais (critério 8.7.8).
      const paginasProntas =
        ehFrenteVerso && comprado && paginas[0] && paginas[1]
          ? [await fundirFrenteVerso(paginas[0], paginas[1], sessao.filtro)]
          : undefined;

      const r = await gerar(
        {
          paginas,
          paginasProntas,
          tipo: sessao.tipo,
          filtroDe: (p) => filtroDaPagina(p.id, sessao.filtro, sessao.filtroPorPagina),
          tamanhoPapel: sessao.opcoes.tamanhoPapel,
          orientacao: sessao.opcoes.orientacao,
          ocr: sessao.opcoes.ocr && comprado,
          alvoBytes: comprado ? sessao.opcoes.alvoBytes : null,
          nomeCustomizado: sessao.opcoes.nome,
        },
        setEtapa,
      );
      sessao.descartar();
      router.replace({ pathname: '/pronto', params: { id: r.documentoId, aviso: avisoDe(r) } });
    } catch (e) {
      // Falha NUNCA descarta o trabalho: volta para a montagem com tudo
      // intacto (máquina de estados 12.1).
      Alert.alert('', e instanceof SemEspacoError ? T.semEspaco : T.falhaGeracao);
    } finally {
      setEtapa(null);
    }
  };

  return (
    <Tela>
      <BarraNav
        esquerda={T.cancelar}
        aoTocarEsquerda={sair}
        titulo={T.contadorPaginas(paginas.length)}
      />

      {paginas.length === 0 ? (
        // Excluir a última página mostra o vazio — NÃO volta sozinho para a
        // Home (critério 8.3, estado vazio).
        <View style={est.vazio}>
          <Ionicons name="documents-outline" size={44} color={t.textoTerciario} />
          <BotaoPrimario titulo={T.adicionarPaginas} icone="add" aoTocar={() => router.push('/origem')} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={est.grade}>
          {paginas.map((p, i) => {
            const ativa = selecionada === p.id;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`${T.paginaN(i + 1)} de ${paginas.length}`}
                onPress={() => setSelecionada(ativa ? null : p.id)}
                onLongPress={() => router.push({ pathname: '/editor', params: { id: p.id } })}
                style={[
                  est.miniatura,
                  { backgroundColor: t.superficie, borderColor: ativa ? t.acao : t.divisor, borderWidth: ativa ? 2.5 : StyleSheet.hairlineWidth },
                ]}
              >
                {/* O filtro vai na View e não na Image: no React Native o
                    estilo `filter` existe em ViewStyle, não em ImageStyle. */}
                <View style={{ ...StyleSheet.absoluteFillObject, filter: filtroRn(filtroDaPagina(p.id, sessao.filtro, sessao.filtroPorPagina)) }}>
                  <Image source={{ uri: p.uri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
                </View>
                <View style={est.numero}>
                  <Text style={[TIPO.legenda, { color: '#FFFFFF', fontWeight: '600' }]}>{i + 1}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {selecionada ? (
        <View style={est.ferramentas}>
          <Ferramenta icone="refresh-outline" rotulo={T.girar} aoTocar={() => girarPagina(selecionada)} />
          <Ferramenta
            icone="crop-outline"
            rotulo={T.recortar}
            aoTocar={() => router.push({ pathname: '/editor', params: { id: selecionada } })}
          />
          <Ferramenta icone="arrow-back" rotulo="Mover" aoTocar={() => mover(selecionada, -1)} />
          <Ferramenta icone="arrow-forward" rotulo="Mover" aoTocar={() => mover(selecionada, 1)} />
          <Ferramenta icone="trash-outline" rotulo={T.excluir} destrutiva aoTocar={() => excluirPagina(selecionada)} />
        </View>
      ) : null}

      {paginas.length > 0 ? (
        <View style={{ paddingHorizontal: MARGEM_LATERAL, paddingBottom: ESPACO.sm, gap: ESPACO.md }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={T.adicionarPaginas}
            onPress={() => router.push('/origem')}
            style={[est.adicionar, { backgroundColor: t.superficie }]}
          >
            <Ionicons name="add" size={18} color={t.acao} />
            <Text style={[TIPO.corpo, { color: t.acao }]}>{T.adicionarPaginas}</Text>
          </Pressable>
          <BotaoPrimario titulo={T.gerarPdf} aoTocar={gerarAgora} desabilitado={ocupado} />
          <Pressable accessibilityRole="button" onPress={() => router.push('/opcoes')} hitSlop={8}>
            <Text style={[TIPO.corpo, { color: t.acao, textAlign: 'center' }]}>{T.opcoes}</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal visible={etapa !== null} transparent animationType="fade">
        <View style={[est.modalFundo, { backgroundColor: t.scrim }]}>
          <View style={[est.cartaoProgresso, { backgroundColor: t.superficie }]}>
            <ActivityIndicator color={t.acao} />
            <Text style={[TIPO.destaque, { color: t.texto, textAlign: 'center' }]}>{T.gerando}</Text>
            <Text style={[TIPO.subtitulo, { color: t.textoSecundario, textAlign: 'center' }]}>
              {textoEtapa(etapa)}
            </Text>
          </View>
        </View>
      </Modal>
    </Tela>
  );
}

/** Texto do progresso conforme a etapa (15.7, 15.31 e o épico 8.9). */
function textoEtapa(e: Etapa | null): string {
  if (!e) return '';
  if (e.fase === 'preparando') return T.gerandoPagina(e.pagina, e.total);
  if (e.fase === 'ocr') return T.reconhecendoTexto(e.pagina, e.total);
  if (e.fase === 'comprimindo') return T.ajustandoTamanho(e.tentativa);
  return '';
}

/** Escolhe o aviso a mostrar na tela Pronto (15.11, 15.12, 15.33). */
function avisoDe(r: { alvoNaoAtingido: boolean; pararamPeloPiso: boolean; ocrFalhou: boolean }): string {
  if (r.alvoNaoAtingido && r.pararamPeloPiso) return 'piso';
  if (r.alvoNaoAtingido) return 'tamanho';
  if (r.ocrFalhou) return 'ocr';
  return '';
}

function Ferramenta({
  icone,
  rotulo,
  destrutiva,
  aoTocar,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  destrutiva?: boolean;
  aoTocar: () => void;
}) {
  const { t } = useTema();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={rotulo} onPress={aoTocar} style={est.ferramenta}>
      <Ionicons name={icone} size={22} color={destrutiva ? t.erro : t.acao} />
      <Text style={[TIPO.legenda, { color: t.textoSecundario }]}>{rotulo}</Text>
    </Pressable>
  );
}

const est = StyleSheet.create({
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ESPACO.md + 2,
    padding: MARGEM_LATERAL,
  },
  miniatura: {
    width: 104,
    height: 138,
    borderRadius: RAIO.miniatura,
    overflow: 'hidden',
  },
  numero: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ferramentas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: MARGEM_LATERAL,
    paddingVertical: ESPACO.md,
  },
  ferramenta: { alignItems: 'center', gap: 5, minWidth: 56 },
  adicionar: {
    height: 46,
    borderRadius: RAIO.botao,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ESPACO.xxl, paddingHorizontal: MARGEM_LATERAL },
  modalFundo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cartaoProgresso: {
    width: 270,
    borderRadius: RAIO.folha,
    padding: ESPACO.xxl - 2,
    alignItems: 'center',
    gap: ESPACO.md,
  },
});
