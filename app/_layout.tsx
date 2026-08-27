import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { prepararBanco } from '@/db/client';
import { listarDocumentos } from '@/db/repository';
import { varrerOrfaos } from '@/services/storage';
import { CompraProvider } from '@/features/compra/CompraProvider';
import { SessaoProvider } from '@/features/sessao/SessaoProvider';
import { T } from '@/strings';
import { useTema } from '@/theme';

void SplashScreen.preventAutoHideAsync();

/**
 * Raiz do app: prepara o banco, varre arquivos órfãos e monta os providers.
 *
 * A varredura de órfãos (regra 11.13) roda em segundo plano e NUNCA atrasa a
 * primeira tela — por isso não é aguardada aqui.
 */
export default function Raiz() {
  const [pronto, setPronto] = useState(false);
  const { t } = useTema();

  useEffect(() => {
    (async () => {
      const { recriado } = await prepararBanco();
      setPronto(true);
      await SplashScreen.hideAsync();

      if (recriado) Alert.alert('', T.bancoRecriado);

      // Segundo plano: apaga PDF no disco sem linha no banco (regra 11.13).
      void (async () => {
        try {
          const docs = await listarDocumentos();
          varrerOrfaos(docs.map((d) => d.caminho_arquivo));
        } catch {
          // varredura é higiene, nunca motivo de erro visível
        }
      })();
    })();
  }, []);

  if (!pronto) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CompraProvider>
          <SessaoProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: t.fundoAgrupado },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
              <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
              <Stack.Screen name="opcoes" options={{ presentation: 'modal' }} />
            </Stack>
          </SessaoProvider>
        </CompraProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
