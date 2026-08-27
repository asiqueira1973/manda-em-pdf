import { useEffect, useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { BarraNav, Celula, Grupo, Rolagem, Selo, Separador, Tela, TituloSecao } from '@/components/base';
import { useCompra } from '@/features/compra/CompraProvider';
import {
  lerPreferencia,
  escreverPreferencia,
  removerTodosOsDocumentos,
} from '@/db/repository';
import { removerTodosOsPdfs } from '@/services/storage';
import { FILTROS_OFERECIDOS } from '@/lib/filtros';
import { T } from '@/strings';
import { ESPACO, MARGEM_LATERAL, TIPO, useTema } from '@/theme';

/** Endereços fixos da Dab Lab (mesmos dos outros apps do Alexandre). */
const URL_PRIVACIDADE = 'https://dablab.com.br/privacidade';
const EMAIL_CONTATO = 'mailto:contato@dablab.com.br';

/** Ajustes (tela 10.12): compra, padrões, dados e sobre. */
export default function Ajustes() {
  const { t } = useTema();
  const { comprado, restaurar } = useCompra();
  const [papel, setPapel] = useState('a4');
  const [filtro, setFiltro] = useState('original');

  useEffect(() => {
    (async () => {
      setPapel(await lerPreferencia('tamanho_papel_padrao'));
      setFiltro(await lerPreferencia('filtro_padrao'));
    })();
  }, []);

  const ciclarFiltro = async () => {
    const i = FILTROS_OFERECIDOS.indexOf(filtro as never);
    const proximo = FILTROS_OFERECIDOS[(i + 1) % FILTROS_OFERECIDOS.length]!;
    setFiltro(proximo);
    await escreverPreferencia('filtro_padrao', proximo);
  };

  const ciclarPapel = async () => {
    const proximo = papel === 'a4' ? 'carta' : 'a4';
    setPapel(proximo);
    await escreverPreferencia('tamanho_papel_padrao', proximo);
  };

  const apagarTudo = () => {
    Alert.alert('', T.apagarTudoTitulo, [
      { text: T.cancelar, style: 'cancel' },
      {
        text: T.apagar,
        style: 'destructive',
        onPress: async () => {
          await removerTodosOsDocumentos();
          removerTodosOsPdfs();
        },
      },
    ]);
  };

  const aoRestaurar = async () => {
    const achou = await restaurar();
    if (!achou) Alert.alert('', T.restaurarSemCompra);
  };

  const versao = `${Constants.expoConfig?.version ?? '1.0.0'} (${
    Constants.expoConfig?.ios?.buildNumber ?? '1'
  })`;

  return (
    <Tela>
      <BarraNav titulo={T.ajustes} direita={T.concluir} aoTocarDireita={() => router.back()} />
      <Rolagem>
        <TituloSecao>{T.secaoCompra}</TituloSecao>
        <Grupo>
          <Celula
            titulo={T.paywallTitulo}
            valor={comprado ? 'Ativa' : undefined}
            direita={comprado ? undefined : <Selo />}
            chevron={!comprado}
            aoTocar={comprado ? undefined : () => router.push('/paywall')}
          />
          <Separador />
          <Celula titulo={T.restaurarCompra} acao aoTocar={aoRestaurar} />
        </Grupo>

        <TituloSecao>{T.secaoPadroes}</TituloSecao>
        <Grupo>
          <Celula
            titulo={T.tamanhoPapel}
            valor={papel === 'a4' ? T.papelA4 : T.papelCarta}
            chevron
            aoTocar={ciclarPapel}
          />
          <Separador />
          <Celula
            titulo={T.filtroPadrao}
            valor={T.filtros[filtro as keyof typeof T.filtros] ?? T.filtros.original}
            chevron
            aoTocar={ciclarFiltro}
          />
        </Grupo>

        <TituloSecao>{T.secaoDados}</TituloSecao>
        <Grupo>
          <Celula titulo={T.apagarTodosOsPdfs} destrutiva aoTocar={apagarTudo} />
        </Grupo>

        <TituloSecao>{T.secaoSobre}</TituloSecao>
        <Grupo>
          <Celula titulo={T.politicaPrivacidade} chevron aoTocar={() => Linking.openURL(URL_PRIVACIDADE)} />
          <Separador />
          <Celula titulo={T.contato} chevron aoTocar={() => Linking.openURL(EMAIL_CONTATO)} />
          <Separador />
          <Celula titulo={T.versao} valor={versao} />
        </Grupo>

        <View style={{ paddingHorizontal: MARGEM_LATERAL, paddingTop: ESPACO.lg + 2 }}>
          <Text style={[TIPO.rodape, { color: t.textoSecundario, textAlign: 'center', lineHeight: 18 }]}>
            {T.onboarding[1]!.corpo}
          </Text>
        </View>
      </Rolagem>
    </Tela>
  );
}
