import {
  PAGINAS_GRATIS,
  PRESETS,
  TENTATIVAS,
  capacidadeDisponivel,
  devePedirAvaliacao,
  geometriaFrenteVerso,
  maxTentativas,
  podeGerar,
  presetDe,
  temPisoDeCompressao,
} from '../regras';

describe('11.1 — gates de capacidade', () => {
  it('gera 1 e 2 páginas sem compra, sempre (princípio P4)', () => {
    expect(podeGerar(1, false)).toBe(true);
    expect(podeGerar(2, false)).toBe(true);
  });

  it('exige compra a partir de 3 páginas', () => {
    expect(podeGerar(3, false)).toBe(false);
    expect(podeGerar(50, false)).toBe(false);
  });

  it('com a compra liberada, gera qualquer quantidade', () => {
    expect(podeGerar(3, true)).toBe(true);
    expect(podeGerar(50, true)).toBe(true);
  });

  it('o limite gratuito é 2 — se este teste quebrar, a métrica M2 mudou de propósito', () => {
    expect(PAGINAS_GRATIS).toBe(2);
  });

  it('toda capacidade paga exige compra', () => {
    for (const c of ['multipagina', 'ocr', 'compressao_alvo', 'fusao_frente_verso'] as const) {
      expect(capacidadeDisponivel(c, false)).toBe(false);
      expect(capacidadeDisponivel(c, true)).toBe(true);
    }
  });
});

describe('11.6 — presets', () => {
  it('estão na ordem da tabela: contrato primeiro, RG e CNH por último', () => {
    expect(PRESETS.map((p) => p.tipo)).toEqual([
      'contrato', 'imovel', 'procuracao', 'nota_fiscal', 'boleto', 'rg', 'cnh',
    ]);
  });

  it('contrato, imóvel e procuração capturam em lote', () => {
    for (const t of ['contrato', 'imovel', 'procuracao'] as const) {
      expect(presetDe(t)?.modo).toBe('lote');
    }
  });

  it('nota fiscal usa alto contraste e não força a proporção A4', () => {
    const nf = presetDe('nota_fiscal');
    expect(nf?.filtro).toBe('alto_contraste');
    expect(nf?.proporcaoLivre).toBe(true);
  });

  it('boleto mantém o original — filtro não pode degradar o código de barras', () => {
    expect(presetDe('boleto')?.filtro).toBe('original');
  });

  it('RG e CNH usam captura guiada de frente e verso', () => {
    expect(presetDe('rg')?.modo).toBe('frente_verso');
    expect(presetDe('cnh')?.modo).toBe('frente_verso');
  });
});

describe('11.6.1 — geometria da fusão frente e verso', () => {
  const A4 = { largura: 595, altura: 842 };
  const cartao = 85.6 / 54; // proporção de um RG/CNH no padrão cartão

  it('as duas faces cabem dentro da área útil da página', () => {
    const { frente, verso } = geometriaFrenteVerso(cartao, cartao);
    for (const r of [frente, verso]) {
      expect(r.x).toBeGreaterThanOrEqual(24);
      expect(r.y).toBeGreaterThanOrEqual(24);
      expect(r.x + r.largura).toBeLessThanOrEqual(A4.largura - 24 + 0.01);
      expect(r.y + r.altura).toBeLessThanOrEqual(A4.altura - 24 + 0.01);
    }
  });

  it('preserva a proporção de cada face', () => {
    const { frente, verso } = geometriaFrenteVerso(cartao, cartao);
    expect(frente.largura / frente.altura).toBeCloseTo(cartao, 3);
    expect(verso.largura / verso.altura).toBeCloseTo(cartao, 3);
  });

  it('a frente fica acima do verso e as duas não se sobrepõem', () => {
    const { frente, verso } = geometriaFrenteVerso(cartao, cartao);
    expect(frente.y).toBeLessThan(verso.y);
    expect(frente.y + frente.altura).toBeLessThanOrEqual(verso.y);
  });

  it('faces de mesma proporção saem com a mesma largura', () => {
    const { frente, verso } = geometriaFrenteVerso(cartao, cartao);
    expect(frente.largura).toBeCloseTo(verso.largura, 5);
  });

  it('centraliza horizontalmente qualquer proporção', () => {
    const { frente } = geometriaFrenteVerso(0.5, cartao);
    expect(frente.x + frente.largura / 2).toBeCloseTo(A4.largura / 2, 5);
  });
});

describe('11.10 / 11.10.1 — compressão', () => {
  it('a tabela tem as 6 tentativas do spec, degradando monotonicamente', () => {
    expect(TENTATIVAS).toHaveLength(6);
    for (let i = 1; i < TENTATIVAS.length; i++) {
      expect(TENTATIVAS[i]!.qualidade).toBeLessThan(TENTATIVAS[i - 1]!.qualidade);
      expect(TENTATIVAS[i]!.ladoMaior).toBeLessThanOrEqual(TENTATIVAS[i - 1]!.ladoMaior);
    }
  });

  it('boleto para na tentativa 3 — abaixo disso o código de barras não é lido', () => {
    expect(maxTentativas('boleto')).toBe(3);
    expect(temPisoDeCompressao('boleto')).toBe(true);
  });

  it('nota fiscal para na tentativa 4', () => {
    expect(maxTentativas('nota_fiscal')).toBe(4);
    expect(temPisoDeCompressao('nota_fiscal')).toBe(true);
  });

  it('documento comum usa as 6 tentativas', () => {
    expect(maxTentativas('contrato')).toBe(6);
    expect(temPisoDeCompressao('contrato')).toBe(false);
  });
});

describe('11.12 — pedido de avaliação', () => {
  const base = { totalGerados: 3, acabouDeCompartilhar: true, jaPediuAntes: false };

  it('pede quando as três condições valem', () => {
    expect(devePedirAvaliacao(base)).toBe(true);
  });

  it('não pede com menos de 3 PDFs gerados', () => {
    expect(devePedirAvaliacao({ ...base, totalGerados: 2 })).toBe(false);
  });

  it('não pede fora de um compartilhamento bem-sucedido', () => {
    expect(devePedirAvaliacao({ ...base, acabouDeCompartilhar: false })).toBe(false);
  });

  it('nunca pede duas vezes', () => {
    expect(devePedirAvaliacao({ ...base, jaPediuAntes: true })).toBe(false);
  });
});
