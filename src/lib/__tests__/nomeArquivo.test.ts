import { baseParaTipo, dataDoNome, limparNome, montarNomeArquivo } from '../nomeArquivo';

const DIA = new Date(2026, 7, 26); // 26/08/2026, fuso local

describe('11.7 — nome do arquivo', () => {
  it('usa a base da tabela para cada preset', () => {
    expect(baseParaTipo('contrato')).toBe('Contrato');
    expect(baseParaTipo('imovel')).toBe('Imovel');
    expect(baseParaTipo('procuracao')).toBe('Procuracao');
    expect(baseParaTipo('nota_fiscal')).toBe('Nota-Fiscal');
    expect(baseParaTipo('boleto')).toBe('Boleto');
    expect(baseParaTipo('rg')).toBe('RG');
    expect(baseParaTipo('cnh')).toBe('CNH');
    expect(baseParaTipo('livre')).toBe('Documento');
  });

  it('nenhuma base tem acento ou espaço — o arquivo viaja por WhatsApp e upload', () => {
    for (const t of ['contrato', 'imovel', 'procuracao', 'nota_fiscal', 'boleto', 'rg', 'cnh', 'livre'] as const) {
      expect(baseParaTipo(t)).toMatch(/^[A-Za-z0-9-]+$/);
    }
  });

  it('formata a data como AAAA-MM-DD no fuso local', () => {
    expect(dataDoNome(DIA)).toBe('2026-08-26');
    expect(dataDoNome(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('monta o nome completo com extensão', () => {
    expect(montarNomeArquivo('contrato', DIA, [])).toBe('Contrato-2026-08-26.pdf');
  });

  it('resolve colisão no mesmo dia com sufixo -2, -3, …', () => {
    expect(montarNomeArquivo('rg', DIA, ['RG-2026-08-26.pdf'])).toBe('RG-2026-08-26-2.pdf');
    expect(montarNomeArquivo('rg', DIA, ['RG-2026-08-26.pdf', 'RG-2026-08-26-2.pdf'])).toBe(
      'RG-2026-08-26-3.pdf',
    );
  });

  it('não colide com nome de outro dia', () => {
    expect(montarNomeArquivo('rg', DIA, ['RG-2026-08-25.pdf'])).toBe('RG-2026-08-26.pdf');
  });

  it('troca caractere inválido por hífen', () => {
    expect(limparNome('Contrato/2026:final')).toBe('Contrato-2026-final');
    expect(limparNome('a*b?c"d<e>f|g\\h')).toBe('a-b-c-d-e-f-g-h');
  });

  it('nome vazio depois da limpeza volta ao padrão', () => {
    expect(limparNome('   ')).toBe('Documento');
    expect(limparNome('', 'Boleto')).toBe('Boleto');
    expect(montarNomeArquivo('boleto', DIA, [], '  ')).toBe('Boleto-2026-08-26.pdf');
  });

  it('respeita o nome digitado pelo usuário', () => {
    expect(montarNomeArquivo('contrato', DIA, [], 'Aluguel Rua Augusta')).toBe(
      'Aluguel Rua Augusta-2026-08-26.pdf',
    );
  });
});
