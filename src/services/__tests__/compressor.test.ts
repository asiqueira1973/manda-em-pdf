import { comprimirAteAlvo } from '../compressor';
import { TENTATIVAS } from '@/lib/regras';

/** Simula a remontagem: quanto menor a qualidade, menor o arquivo. */
function remontarFake(bytesPorQualidade: (q: number) => number) {
  const chamadas: number[] = [];
  const fn = async (t: { qualidade: number; ladoMaior: number }) => {
    chamadas.push(t.qualidade);
    return { uri: `pdf-${t.qualidade}`, bytes: bytesPorQualidade(t.qualidade) };
  };
  return { fn, chamadas };
}

describe('11.10 — laço de compressão', () => {
  it('para assim que couber, sem degradar à toa', async () => {
    // Cabe já na 2ª tentativa (qualidade 0,60).
    const { fn, chamadas } = remontarFake((q) => (q >= 0.75 ? 9_000 : 4_000));
    const r = await comprimirAteAlvo(5_000, 'contrato', fn);
    expect(r.alvoAtingido).toBe(true);
    expect(r.tentativasUsadas).toBe(2);
    expect(chamadas).toHaveLength(2);
  });

  it('usa as 6 tentativas de um documento comum quando nunca cabe', async () => {
    const { fn, chamadas } = remontarFake(() => 50_000);
    const r = await comprimirAteAlvo(1_000, 'contrato', fn);
    expect(r.alvoAtingido).toBe(false);
    expect(r.tentativasUsadas).toBe(TENTATIVAS.length);
    expect(chamadas).toHaveLength(6);
    expect(r.pararamPeloPiso).toBe(false);
  });

  it('11.10.1 — boleto para na 3ª tentativa mesmo sem atingir o alvo', async () => {
    const { fn, chamadas } = remontarFake(() => 50_000);
    const r = await comprimirAteAlvo(1_000, 'boleto', fn);
    expect(r.tentativasUsadas).toBe(3);
    expect(chamadas).toHaveLength(3);
    expect(r.alvoAtingido).toBe(false);
    expect(r.pararamPeloPiso).toBe(true);
    // A qualidade nunca desce abaixo de 0,50 — abaixo disso o código de
    // barras deixa de ser lido.
    expect(Math.min(...chamadas)).toBeGreaterThanOrEqual(0.5);
  });

  it('11.10.1 — nota fiscal para na 4ª tentativa', async () => {
    const { fn, chamadas } = remontarFake(() => 50_000);
    const r = await comprimirAteAlvo(1_000, 'nota_fiscal', fn);
    expect(r.tentativasUsadas).toBe(4);
    expect(r.pararamPeloPiso).toBe(true);
    expect(Math.min(...chamadas)).toBeGreaterThanOrEqual(0.4);
  });

  it('boleto que cabe dentro do piso é entregue normalmente', async () => {
    const { fn } = remontarFake((q) => (q >= 0.6 ? 9_000 : 3_000));
    const r = await comprimirAteAlvo(5_000, 'boleto', fn);
    expect(r.alvoAtingido).toBe(true);
    expect(r.pararamPeloPiso).toBe(false);
  });

  it('quando não atinge o alvo, devolve o MENOR arquivo obtido', async () => {
    const tamanhos: Record<string, number> = { '0.75': 90, '0.6': 70, '0.5': 60 };
    const fn = async (t: { qualidade: number }) => ({
      uri: `pdf-${t.qualidade}`,
      bytes: tamanhos[String(t.qualidade)] ?? 55,
    });
    const r = await comprimirAteAlvo(10, 'boleto', fn);
    expect(r.bytes).toBe(60);
    expect(r.uri).toBe('pdf-0.5');
  });

  it('informa o número da tentativa para a interface mostrar o progresso', async () => {
    const vistos: number[] = [];
    const { fn } = remontarFake(() => 50_000);
    await comprimirAteAlvo(1, 'boleto', fn, (n) => vistos.push(n));
    expect(vistos).toEqual([1, 2, 3]);
  });
});
