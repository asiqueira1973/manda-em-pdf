import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Orientacao, TamanhoPapel, TipoDocumento } from '@/db/schema';
import { MAX_PAGINAS, presetDe, type Filtro } from '@/lib/regras';
import { limparTemporarios } from '@/services/storage';
import type { Pagina } from '@/services/pageEditor';

/**
 * A montagem em andamento (seção 7.5: vive em MEMÓRIA, não no banco).
 *
 * Só o PDF finalizado é persistido. Isto é uma decisão de produto — o app é
 * ferramenta de passagem (P1) — e o custo declarado é não poder reeditar um
 * PDF já gerado (roadmap 28.4).
 */

export type OpcoesSaida = {
  nome?: string;
  tamanhoPapel: TamanhoPapel;
  orientacao: Orientacao;
  ocr: boolean;
  /** Alvo de tamanho em bytes; null = sem limite (padrão, regra 11.14). */
  alvoBytes: number | null;
};

type Contexto = {
  paginas: Pagina[];
  tipo: TipoDocumento;
  filtro: Filtro;
  /** Filtro escolhido só para uma página; o resto usa `filtro` (8.3.4). */
  filtroPorPagina: Record<string, Filtro>;
  opcoes: OpcoesSaida;
  /** Quantas páginas ainda cabem antes do limite de 50 (tabela 11.3). */
  restante: number;
  iniciar: (tipo: TipoDocumento) => void;
  adicionar: (novas: Pagina[]) => void;
  substituir: (id: string, pagina: Pagina) => void;
  remover: (id: string) => void;
  reordenar: (de: number, para: number) => void;
  definirFiltro: (f: Filtro, apenasId?: string) => void;
  definirOpcoes: (parcial: Partial<OpcoesSaida>) => void;
  descartar: () => void;
};

const OPCOES_PADRAO: OpcoesSaida = {
  tamanhoPapel: 'a4',
  orientacao: 'retrato',
  ocr: false,
  alvoBytes: null,
};

const Ctx = createContext<Contexto | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [tipo, setTipo] = useState<TipoDocumento>('livre');
  const [filtro, setFiltro] = useState<Filtro>('original');
  const [opcoes, setOpcoes] = useState<OpcoesSaida>(OPCOES_PADRAO);
  /** Filtro por página, quando o usuário aplica só a uma (critério 8.3.4). */
  const [filtroPorPagina, setFiltroPorPagina] = useState<Record<string, Filtro>>({});

  /** Começa uma montagem nova, já com os padrões do preset (regra 11.6). */
  const iniciar = useCallback((novoTipo: TipoDocumento) => {
    const preset = presetDe(novoTipo);
    setPaginas([]);
    setFiltroPorPagina({});
    setTipo(novoTipo);
    setFiltro(preset?.filtro ?? 'original');
    setOpcoes(OPCOES_PADRAO);
  }, []);

  const adicionar = useCallback((novas: Pagina[]) => {
    setPaginas((atuais) => [...atuais, ...novas].slice(0, MAX_PAGINAS));
  }, []);

  const substituir = useCallback((id: string, pagina: Pagina) => {
    setPaginas((atuais) => atuais.map((p) => (p.id === id ? pagina : p)));
  }, []);

  const remover = useCallback((id: string) => {
    setPaginas((atuais) => {
      const alvo = atuais.find((p) => p.id === id);
      if (alvo) limparTemporarios([alvo.uri]);
      return atuais.filter((p) => p.id !== id);
    });
    setFiltroPorPagina(({ [id]: _fora, ...resto }) => resto);
  }, []);

  const reordenar = useCallback((de: number, para: number) => {
    setPaginas((atuais) => {
      if (de === para || de < 0 || para < 0 || de >= atuais.length || para >= atuais.length) {
        return atuais;
      }
      const copia = [...atuais];
      const [movida] = copia.splice(de, 1);
      if (movida) copia.splice(para, 0, movida);
      return copia;
    });
  }, []);

  /** Aplica o filtro a uma página ou a todas — a escolha é explícita (8.3.4). */
  const definirFiltro = useCallback((f: Filtro, apenasId?: string) => {
    if (apenasId) {
      setFiltroPorPagina((atual) => ({ ...atual, [apenasId]: f }));
    } else {
      setFiltro(f);
      setFiltroPorPagina({});
    }
  }, []);

  const definirOpcoes = useCallback((parcial: Partial<OpcoesSaida>) => {
    setOpcoes((atuais) => ({ ...atuais, ...parcial }));
  }, []);

  /** Descarta a montagem e apaga as imagens temporárias do disco (20.3). */
  const descartar = useCallback(() => {
    setPaginas((atuais) => {
      limparTemporarios(atuais.map((p) => p.uri));
      return [];
    });
    setFiltroPorPagina({});
    setTipo('livre');
    setFiltro('original');
    setOpcoes(OPCOES_PADRAO);
  }, []);

  const valor = useMemo<Contexto>(
    () => ({
      paginas,
      tipo,
      filtro,
      filtroPorPagina,
      opcoes,
      restante: MAX_PAGINAS - paginas.length,
      iniciar,
      adicionar,
      substituir,
      remover,
      reordenar,
      definirFiltro,
      definirOpcoes,
      descartar,
    }),
    [paginas, tipo, filtro, filtroPorPagina, opcoes, iniciar, adicionar, substituir, remover, reordenar, definirFiltro, definirOpcoes, descartar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSessao(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSessao precisa estar dentro de SessaoProvider');
  return c;
}

/** Filtro efetivo de uma página: o dela, se houver, senão o do documento. */
export function filtroDaPagina(
  id: string,
  filtroGeral: Filtro,
  porPagina: Record<string, Filtro>,
): Filtro {
  return porPagina[id] ?? filtroGeral;
}
