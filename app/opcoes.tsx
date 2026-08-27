import { useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { BarraNav, Celula, Grupo, Rolagem, Selo, Separador, Tela, TituloSecao } from '@/components/base';
import { Segmentado } from '@/components/segmentado';
import { useCompra } from '@/features/compra/CompraProvider';
import { useSessao } from '@/features/sessao/SessaoProvider';
import { escreverPreferencia } from '@/db/repository';
import { ALVOS_TAMANHO } from '@/lib/regras';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, TIPO, useTema } from '@/theme';

/**
 * Opções de saída (tela 10.6) — OPCIONAL, fora do caminho principal.
 *
 * Só chega aqui quem toca em "Opções" na Montagem. O que a pessoa escolhe
 * vira padrão nas próximas gerações, para ela não escolher de novo (8.4.11).
 *
 * Recurso pago aparece VISÍVEL E DESABILITADO com o selo, nunca escondido
 * e nunca como parede (regra 11.1 e critérios 8.8.6 / 8.9.5).
 */
export default function Opcoes() {
  const { t } = useTema();
  const { opcoes, definirOpcoes, tipo } = useSessao();
  const { comprado } = useCompra();
  const [nome, setNome] = useState(opcoes.nome ?? '');

  const concluir = async () => {
    definirOpcoes({ nome: nome.trim() || undefined });
    await escreverPreferencia('tamanho_papel_padrao', opcoes.tamanhoPapel);
    router.back();
  };

  const alvoAtual = ALVOS_TAMANHO.find((a) => a.bytes === opcoes.alvoBytes) ?? ALVOS_TAMANHO[0];

  return (
    <Tela>
      <BarraNav
        esquerda={T.cancelar}
        aoTocarEsquerda={() => router.back()}
        titulo={T.opcoes}
        direita={T.concluir}
        aoTocarDireita={concluir}
      />
      <Rolagem>
        <TituloSecao>Arquivo</TituloSecao>
        <Grupo>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: ESPACO.lg, minHeight: 48 }}>
            <Text style={[TIPO.corpo, { color: t.texto, width: 92 }]}>{T.nomeDoArquivo}</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder={T.presets[tipo as keyof typeof T.presets] ?? 'Documento'}
              placeholderTextColor={t.textoTerciario}
              accessibilityLabel={T.nomeDoArquivo}
              style={[TIPO.corpo, { color: t.texto, flex: 1, paddingVertical: ESPACO.md }]}
            />
          </View>
          <Separador />
          <Celula
            titulo={T.tamanhoPapel}
            direita={
              <Segmentado
                opcoes={[
                  { valor: 'a4', rotulo: T.papelA4 },
                  { valor: 'carta', rotulo: T.papelCarta },
                ]}
                valor={opcoes.tamanhoPapel}
                aoMudar={(v) => definirOpcoes({ tamanhoPapel: v })}
              />
            }
          />
          <Separador />
          <Celula
            titulo={T.orientacao}
            direita={
              <Segmentado
                opcoes={[
                  { valor: 'retrato', rotulo: T.retrato },
                  { valor: 'paisagem', rotulo: T.paisagem },
                ]}
                valor={opcoes.orientacao}
                aoMudar={(v) => definirOpcoes({ orientacao: v })}
              />
            }
          />
        </Grupo>

        <TituloSecao>{T.paywallTitulo}</TituloSecao>
        <Grupo>
          <Celula
            titulo={T.textoPesquisavel}
            desabilitada={!comprado}
            aoTocar={!comprado ? () => router.push('/paywall') : undefined}
            direita={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: ESPACO.sm }}>
                {comprado ? null : <Selo />}
                <Switch
                  value={opcoes.ocr && comprado}
                  disabled={!comprado}
                  onValueChange={(v) => definirOpcoes({ ocr: v })}
                  trackColor={{ true: t.acao, false: t.preenchimentoSutil }}
                />
              </View>
            }
          />
          <Separador />
          <Celula
            titulo={T.tamanhoMaximo}
            valor={comprado ? alvoAtual!.rotulo : undefined}
            desabilitada={!comprado}
            aoTocar={
              comprado
                ? () => {
                    const i = ALVOS_TAMANHO.findIndex((a) => a.bytes === opcoes.alvoBytes);
                    const proximo = ALVOS_TAMANHO[(i + 1) % ALVOS_TAMANHO.length]!;
                    definirOpcoes({ alvoBytes: proximo.bytes });
                  }
                : () => router.push('/paywall')
            }
            direita={comprado ? undefined : <Selo />}
            chevron={comprado}
          />
        </Grupo>
        <View style={{ height: MARGEM_LATERAL }} />
      </Rolagem>
    </Tela>
  );
}
