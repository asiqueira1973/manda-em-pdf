import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BarraNav, Tela } from '@/components/base';
import { FILTROS_OFERECIDOS, filtroRn } from '@/lib/filtros';
import type { Filtro } from '@/lib/regras';
import { girar } from '@/services/pageEditor';
import { useSessao } from '@/features/sessao/SessaoProvider';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, TIPO, useTema } from '@/theme';

/**
 * Editor de página (tela 10.5): girar, escolher filtro e decidir se ele vale
 * só para esta página ou para todas — a escolha é EXPLÍCITA (critério 8.3.4).
 */
export default function Editor() {
  const { t } = useTema();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const sessao = useSessao();
  const pagina = sessao.paginas.find((p) => p.id === id);
  const indice = sessao.paginas.findIndex((p) => p.id === id);
  const [filtro, setFiltro] = useState<Filtro>(sessao.filtro);
  const [paraTodas, setParaTodas] = useState(true);

  if (!pagina) {
    router.back();
    return null;
  }

  const concluir = () => {
    sessao.definirFiltro(filtro, paraTodas ? undefined : pagina.id);
    router.back();
  };

  const girarAgora = async () => {
    sessao.substituir(pagina.id, await girar(pagina, 90));
  };

  return (
    <Tela agrupado={false} style={{ backgroundColor: t.camera }}>
      <BarraNav
        esquerda={T.cancelar}
        aoTocarEsquerda={() => router.back()}
        titulo={T.paginaN(indice + 1)}
        direita={T.concluir}
        aoTocarDireita={concluir}
      />

      <View style={est.palco}>
        <View style={{ filter: filtroRn(filtro), width: '86%', aspectRatio: 3 / 4 }}>
          <Image source={{ uri: pagina.uri }} resizeMode="contain" style={StyleSheet.absoluteFill} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: MARGEM_LATERAL, gap: ESPACO.sm }}
        style={{ flexGrow: 0, paddingBottom: ESPACO.lg }}
      >
        {FILTROS_OFERECIDOS.map((f) => {
          const ativo = f === filtro;
          return (
            <Pressable
              key={f}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={T.filtros[f as keyof typeof T.filtros]}
              onPress={() => setFiltro(f)}
              style={[est.chip, { backgroundColor: ativo ? t.acao : 'rgba(255,255,255,0.14)' }]}
            >
              <Text style={[TIPO.subtitulo, { color: '#FFFFFF', fontWeight: ativo ? '600' : '400' }]}>
                {T.filtros[f as keyof typeof T.filtros]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={est.linhaTodas}>
        <Text style={[TIPO.subtitulo, { color: 'rgba(255,255,255,0.75)' }]}>{T.aplicarATodas}</Text>
        <Switch
          value={paraTodas}
          onValueChange={setParaTodas}
          trackColor={{ true: t.acao, false: 'rgba(255,255,255,0.22)' }}
        />
      </View>

      <View style={est.ferramentas}>
        <Pressable accessibilityRole="button" accessibilityLabel={T.girar} onPress={girarAgora} style={est.ferramenta}>
          <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
          <Text style={[TIPO.legenda, { color: 'rgba(255,255,255,0.7)' }]}>{T.girar}</Text>
        </Pressable>
      </View>
    </Tela>
  );
}

const est = StyleSheet.create({
  palco: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 16 },
  linhaTodas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MARGEM_LATERAL,
    paddingBottom: ESPACO.md + 2,
  },
  ferramentas: { flexDirection: 'row', justifyContent: 'center', gap: 46, paddingBottom: ESPACO.sm },
  ferramenta: { alignItems: 'center', gap: 5 },
});
