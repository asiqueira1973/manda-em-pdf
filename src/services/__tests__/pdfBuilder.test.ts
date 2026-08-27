import { dimensoesPagina, montarHtml } from '../pdfBuilder';

const pagina = (base64 = 'AAA') => ({
  base64,
  largura: 1000,
  altura: 1400,
  filtro: 'original' as const,
});

describe('14 — dimensões da página', () => {
  it('A4 retrato é 595 × 842', () => {
    expect(dimensoesPagina('a4', 'retrato')).toEqual({ largura: 595, altura: 842 });
  });

  it('Carta retrato é 612 × 792', () => {
    expect(dimensoesPagina('carta', 'retrato')).toEqual({ largura: 612, altura: 792 });
  });

  it('paisagem inverte largura e altura', () => {
    expect(dimensoesPagina('a4', 'paisagem')).toEqual({ largura: 842, altura: 595 });
    expect(dimensoesPagina('carta', 'paisagem')).toEqual({ largura: 792, altura: 612 });
  });
});

describe('montarHtml', () => {
  /**
   * REGRESSÃO: o expo-print recebe o tamanho da página em PIXELS a 72 PPI e
   * mapeia 1px do HTML para 1pt do PDF. Se o CSS usar `pt`, 842pt viram
   * 1122px, estouram a altura e cada seção gera DUAS páginas no PDF.
   * Este teste existe porque isso aconteceu de verdade.
   */
  it('não usa a unidade pt em lugar nenhum do CSS', () => {
    const html = montarHtml({
      paginas: [pagina(), pagina()],
      tamanhoPapel: 'a4',
      orientacao: 'retrato',
    });
    expect(html).not.toMatch(/\d(pt)\b/);
    expect(html).toContain('595px');
    expect(html).toContain('842px');
  });

  it('gera uma seção por página', () => {
    const html = montarHtml({
      paginas: [pagina(), pagina(), pagina()],
      tamanhoPapel: 'a4',
      orientacao: 'retrato',
    });
    expect(html.match(/class="pagina"/g)).toHaveLength(3);
  });

  it('embute a imagem como data URI de JPEG', () => {
    const html = montarHtml({ paginas: [pagina('XYZ')], tamanhoPapel: 'a4', orientacao: 'retrato' });
    expect(html).toContain('data:image/jpeg;base64,XYZ');
  });

  it('aplica o filtro escolhido via CSS, sem processar a imagem', () => {
    const html = montarHtml({
      paginas: [{ ...pagina(), filtro: 'pb' }],
      tamanhoPapel: 'a4',
      orientacao: 'retrato',
    });
    expect(html).toContain('filter:grayscale(1) contrast(1.9) brightness(1.12)');
  });

  it('11.9 — a camada de OCR é invisível e fica acima da imagem', () => {
    const html = montarHtml({
      paginas: [{ ...pagina(), textoOcr: 'CONTRATO DE LOCACAO' }],
      tamanhoPapel: 'a4',
      orientacao: 'retrato',
    });
    expect(html).toContain('CONTRATO DE LOCACAO');
    expect(html).toContain('color: transparent');
    expect(html).toContain('z-index: 2');
  });

  it('não cria camada de OCR quando não há texto reconhecido', () => {
    const html = montarHtml({ paginas: [pagina()], tamanhoPapel: 'a4', orientacao: 'retrato' });
    expect(html).not.toContain('class="ocr"');
  });

  it('escapa o texto do OCR para não quebrar a marcação', () => {
    const html = montarHtml({
      paginas: [{ ...pagina(), textoOcr: '<script>alert(1)</script> & "aspas"' }],
      tamanhoPapel: 'a4',
      orientacao: 'retrato',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });

  it('11.6.1 — a página de fusão posiciona as duas faces em px', () => {
    const html = montarHtml({
      paginas: [
        {
          ...pagina(),
          faces: [
            { base64: 'F', retangulo: { x: 24, y: 24, largura: 547, altura: 345 } },
            { base64: 'V', retangulo: { x: 24, y: 433, largura: 547, altura: 345 } },
          ],
        },
      ],
      tamanhoPapel: 'a4',
      orientacao: 'retrato',
    });
    expect(html).toContain('left:24px;top:24px;');
    expect(html).toContain('left:24px;top:433px;');
    expect(html).toContain('data:image/jpeg;base64,F');
    expect(html).toContain('data:image/jpeg;base64,V');
  });
});
