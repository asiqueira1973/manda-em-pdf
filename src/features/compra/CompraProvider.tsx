import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { escreverPreferencia, lerPreferencia } from '@/db/repository';
import * as loja from '@/services/purchases';

/**
 * Estado da compra (épico 8.6 e regra 11.4).
 *
 * REGRA 11.4 — a LOJA é a fonte de verdade; `compra_liberada` é só cache para
 * a interface não piscar. Quatro consequências implementadas aqui:
 *   1. a consulta à loja roda em segundo plano e NUNCA bloqueia a tela;
 *   2. sem internet, vale o cache;
 *   3. resposta negativa da loja só derruba o acesso quando é confiável;
 *   4. o cache nunca é escrito com '1' sem confirmação da loja.
 */

export type EstadoCompra = 'desconhecido' | 'nao_comprado' | 'comprado';

type Contexto = {
  estado: EstadoCompra;
  comprado: boolean;
  produto: loja.ProdutoLoja | null;
  lojaDisponivel: boolean;
  comprar: () => Promise<loja.ResultadoCompra>;
  restaurar: () => Promise<boolean>;
};

const Ctx = createContext<Contexto | null>(null);

export function CompraProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoCompra>('desconhecido');
  const [produto, setProduto] = useState<loja.ProdutoLoja | null>(null);
  const [lojaDisponivel, setLojaDisponivel] = useState(false);
  const cacheCarregado = useRef(false);

  /** Grava o cache local. Só aceita `true` vindo de confirmação da loja (11.4). */
  const salvarCache = useCallback(async (liberado: boolean) => {
    await escreverPreferencia('compra_liberada', liberado ? '1' : '0');
  }, []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      // 1) cache primeiro, para a interface abrir já decidida
      const cache = (await lerPreferencia('compra_liberada')) === '1';
      if (!vivo) return;
      cacheCarregado.current = true;
      setEstado(cache ? 'comprado' : 'nao_comprado');

      // 2) loja em segundo plano, sem travar nada
      const p = await loja.obterProduto();
      if (!vivo) return;
      setProduto(p);
      setLojaDisponivel(p !== null);

      const daLoja = await loja.consultarCompra();
      if (!vivo) return;
      if (daLoja === true) {
        setEstado('comprado');
        await salvarCache(true);
      } else if (daLoja === false && p !== null) {
        // Só confiamos no "não comprou" quando a loja respondeu de verdade
        // (o produto veio junto) — item 4 da regra 11.4.
        setEstado('nao_comprado');
        await salvarCache(false);
      }
      // daLoja === null: rede instável. Mantém o cache, por decisão da 11.4.
    })();
    return () => {
      vivo = false;
    };
  }, [salvarCache]);

  const comprar = useCallback(async () => {
    const r = await loja.comprar();
    if (r.estado === 'comprado') {
      setEstado('comprado');
      await salvarCache(true);
    }
    return r;
  }, [salvarCache]);

  const restaurar = useCallback(async () => {
    const achou = await loja.restaurar();
    if (achou) {
      setEstado('comprado');
      await salvarCache(true);
    }
    return achou;
  }, [salvarCache]);

  const valor = useMemo<Contexto>(
    () => ({ estado, comprado: estado === 'comprado', produto, lojaDisponivel, comprar, restaurar }),
    [estado, produto, lojaDisponivel, comprar, restaurar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useCompra(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCompra precisa estar dentro de CompraProvider');
  return c;
}
