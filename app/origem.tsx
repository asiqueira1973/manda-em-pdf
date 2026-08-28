import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { TipoDocumento } from '@/db/schema';
import { presetDe } from '@/lib/regras';
import { escanear } from '@/services/scanner';
import { medirImagem } from '@/services/pageEditor';
import { importarDasFotos, importarDeArquivos } from '@/services/importer';
import { useSessao } from '@/features/sessao/SessaoProvider';
import { T } from '@/strings';
import { ESPACO, RAIO, TIPO, useTema } from '@/theme';
import type { Pagina } from '@/services/pageEditor';

/**
 * Folha de origem (tela 10.2): as três formas de trazer páginas para dentro
 * do app (épico 8.2). Aparece e sai rápido — é passo de caminho, não tela.
 */
export default function Origem() {
  const { t } = useTema();
  const { adicionar, restante, paginas } = useSessao();
  const params = useLocalSearchParams<{ tipo?: string }>();
  const tipo = (params.tipo ?? 'livre') as TipoDocumento;
  const [ocupado, setOcupado] = useState(false);

  const seguir = (novas: Pagina[]) => {
    if (novas.length === 0) {
      // Cancelou sem capturar: volta para a Home, sem mensagem de erro
      // (critério 8.2.7).
      router.back();
      return;
    }
    adicionar(novas);
    router.replace('/montagem');
  };

  const comScanner = async () => {
    setOcupado(true);
    try {
      // Contrato, imóvel e procuração capturam em lote: o scanner nativo fica
      // aberto entre as páginas (regra 11.6). Os demais capturam uma.
      const preset = presetDe(tipo);
      const max = preset?.modo === 'unica' ? 1 : restante;
      const r = await escanear(max);
      if (r.cancelado) return router.back();
      // Medir na entrada: o scanner nativo devolve só o caminho, e sem
      // dimensão a redução da regra 11.3 não acontece.
      seguir(
        await Promise.all(
          r.paginas.map(async (uri, i) => ({
            id: `s${Date.now().toString(36)}${i}`,
            uri,
            ...(await medirImagem(uri)),
            rotacao: 0,
          })),
        ),
      );
    } catch {
      Alert.alert('', T.cameraNegada);
      router.back();
    } finally {
      setOcupado(false);
    }
  };

  const comFotos = async () => {
    setOcupado(true);
    try {
      const r = await importarDasFotos(restante);
      if (r.cancelado) return router.back();
      seguir(r.paginas);
    } finally {
      setOcupado(false);
    }
  };

  const comArquivos = async () => {
    setOcupado(true);
    try {
      const r = await importarDeArquivos(restante);
      if (r.cancelado) return router.back();
      if (r.recusados > 0 && r.paginas.length === 0) {
        Alert.alert('', T.arquivoNaoSuportado);
        return router.back();
      }
      if (r.recusados > 0) Alert.alert('', T.arquivoNaoSuportado);
      seguir(r.paginas);
    } finally {
      setOcupado(false);
    }
  };

  const opcoes = [
    { icone: 'scan-outline' as const, titulo: T.escanear, aoTocar: comScanner },
    { icone: 'images-outline' as const, titulo: T.escolherDasFotos, aoTocar: comFotos },
    { icone: 'folder-outline' as const, titulo: T.importarDeArquivos, aoTocar: comArquivos },
  ];

  return (
    <View style={[est.fundo, { backgroundColor: t.scrim }]}>
      <Pressable style={{ flex: 1 }} onPress={() => router.back()} accessibilityLabel={T.cancelar} />
      <View style={[est.folha, { backgroundColor: t.superficie }]}>
        {opcoes.map((o, i) => (
          <View key={o.titulo}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={o.titulo}
              disabled={ocupado}
              onPress={o.aoTocar}
              style={({ pressed }) => [
                est.item,
                { backgroundColor: pressed ? t.preenchimentoSutil : 'transparent', opacity: ocupado ? 0.5 : 1 },
              ]}
            >
              <Ionicons name={o.icone} size={22} color={t.acao} />
              <Text style={[TIPO.corpo, { color: t.texto }]}>{o.titulo}</Text>
            </Pressable>
            {i < opcoes.length - 1 ? (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.divisor, marginLeft: 50 }} />
            ) : null}
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={T.cancelar}
        onPress={() => router.back()}
        style={[est.cancelar, { backgroundColor: t.superficie }]}
      >
        <Text style={[TIPO.destaque, { color: t.acao }]}>{T.cancelar}</Text>
      </Pressable>
      {paginas.length > 0 ? null : null}
    </View>
  );
}

const est = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', padding: 10 },
  folha: { borderRadius: RAIO.folha, overflow: 'hidden', marginBottom: ESPACO.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: ESPACO.lg - 2, padding: ESPACO.lg },
  cancelar: { borderRadius: RAIO.folha, padding: ESPACO.lg, alignItems: 'center', marginBottom: ESPACO.xxl },
});
