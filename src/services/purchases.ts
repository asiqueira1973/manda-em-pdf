import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'expo-iap';

/**
 * Compra vitalícia única, nas duas lojas, sem servidor (épico 8.6).
 *
 * REGRA 11.4 — a LOJA é a fonte de verdade. `preferencias.compra_liberada` é
 * só cache para a interface não piscar enquanto a loja responde, e nunca é
 * escrito com '1' sem uma confirmação da loja.
 *
 * REGRA 11.5 — o preço exibido vem SEMPRE do objeto de produto da loja.
 * Nenhum preço é escrito no código; se a consulta falhar, o paywall esconde
 * o botão comprar e mostra o texto de 15.13.
 */

/** Produto não-consumível, mesmo id nas duas lojas (tabela 11.2). */
export const ID_PRODUTO = 'com.dablab.mandaempdf.completo';

export type ProdutoLoja = { id: string; precoFormatado: string; titulo: string };

let conectado = false;

/** Abre a conexão com a loja. Idempotente. */
export async function conectar(): Promise<boolean> {
  if (conectado) return true;
  try {
    await initConnection();
    conectado = true;
    return true;
  } catch {
    return false;
  }
}

export async function desconectar(): Promise<void> {
  if (!conectado) return;
  try {
    await endConnection();
  } finally {
    conectado = false;
  }
}

/**
 * Busca o produto na loja para exibir o preço local (regra 11.5).
 * Devolve `null` quando a loja não respondeu — o paywall então esconde o
 * botão comprar em vez de mostrar preço chutado.
 */
export async function obterProduto(): Promise<ProdutoLoja | null> {
  if (!(await conectar())) return null;
  try {
    const produtos = await fetchProducts({ skus: [ID_PRODUTO], type: 'in-app' });
    const p = Array.isArray(produtos) ? produtos[0] : undefined;
    if (!p) return null;
    return {
      id: p.id,
      precoFormatado: p.displayPrice ?? '',
      titulo: p.title ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Pergunta à loja se esta conta já comprou.
 *
 * Devolve `null` quando não foi possível saber (sem internet, loja fora).
 * Quem chama trata `null` como "mantém o cache" — regra 11.4, item 4: falso
 * negativo por rede instável não pode tirar de alguém o que a pessoa pagou.
 */
export async function consultarCompra(): Promise<boolean | null> {
  if (!(await conectar())) return null;
  try {
    const compras = await getAvailablePurchases();
    const lista = Array.isArray(compras) ? compras : [];
    return lista.some((c) => c.productId === ID_PRODUTO || c.id === ID_PRODUTO);
  } catch {
    return null;
  }
}

export type ResultadoCompra =
  | { estado: 'comprado' }
  | { estado: 'cancelado' }
  | { estado: 'pendente' }
  | { estado: 'erro'; mensagemDaLoja?: string };

/**
 * Dispara o fluxo de compra nativo e espera o desfecho.
 *
 * Devolve o estado da máquina da seção 12.2. A mensagem de erro vem da
 * própria loja — o app não interpreta nem reescreve (tabela 12.2).
 */
export async function comprar(): Promise<ResultadoCompra> {
  if (!(await conectar())) return { estado: 'erro' };

  return new Promise<ResultadoCompra>((resolve) => {
    let resolvido = false;
    const terminar = (r: ResultadoCompra) => {
      if (resolvido) return;
      resolvido = true;
      assinaturaOk.remove();
      assinaturaErro.remove();
      resolve(r);
    };

    const assinaturaOk = purchaseUpdatedListener(async (compra) => {
      if (compra.productId !== ID_PRODUTO && compra.id !== ID_PRODUTO) return;
      try {
        // Não-consumível: finalizar sem consumir, para a compra ficar valendo.
        await finishTransaction({ purchase: compra, isConsumable: false });
      } catch {
        // Mesmo falhando aqui, a loja já registrou — não é motivo para negar.
      }
      terminar({ estado: 'comprado' });
    });

    const assinaturaErro = purchaseErrorListener((erro) => {
      const codigo = String(erro?.code ?? '').toLowerCase();
      if (codigo.includes('cancel')) return terminar({ estado: 'cancelado' });
      if (codigo.includes('pending') || codigo.includes('deferred')) {
        return terminar({ estado: 'pendente' });
      }
      terminar({ estado: 'erro', mensagemDaLoja: erro?.message });
    });

    // A API é por plataforma: Apple usa `sku`, Google usa `skus` (array).
    requestPurchase({
      request: { apple: { sku: ID_PRODUTO }, google: { skus: [ID_PRODUTO] } },
      type: 'in-app',
    }).catch(() => terminar({ estado: 'erro' }));
  });
}

/**
 * Restaura a compra nesta conta de loja (critério 8.6.6).
 * Devolve true quando encontrou; false quando não há compra nesta conta
 * (a interface mostra 15.14, que não é erro).
 */
export async function restaurar(): Promise<boolean> {
  const r = await consultarCompra();
  return r === true;
}
