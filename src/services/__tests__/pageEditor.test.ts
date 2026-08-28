import { acoesDeRedimensionamento } from '../pageEditor';

/**
 * REGRESSÃO: as páginas vindas do scanner nativo chegavam com dimensão 0,
 * e a condição de redução comparava `0 > 2400` — nunca reduzia. O efeito no
 * mundo real foi um PDF de 2 páginas com 3,56 MB e páginas de 3400 px, e a
 * compressão por resolução (regra 11.10) sem efeito nenhum.
 */
describe('11.3 — redução ao lado maior', () => {
  it('reduz pela largura quando a imagem é deitada', () => {
    expect(acoesDeRedimensionamento(4000, 3000, 2400)).toEqual([{ resize: { width: 2400 } }]);
  });

  it('reduz pela altura quando a imagem é em pé', () => {
    expect(acoesDeRedimensionamento(2356, 3400, 2400)).toEqual([{ resize: { height: 2400 } }]);
  });

  it('não faz nada quando a imagem já cabe', () => {
    expect(acoesDeRedimensionamento(1200, 1600, 2400)).toEqual([]);
    expect(acoesDeRedimensionamento(2400, 2400, 2400)).toEqual([]);
  });

  it('nunca amplia uma imagem pequena', () => {
    expect(acoesDeRedimensionamento(400, 600, 2400)).toEqual([]);
  });

  it('dimensão desconhecida não gera ação — quem chama precisa medir antes', () => {
    expect(acoesDeRedimensionamento(0, 0, 2400)).toEqual([]);
    expect(acoesDeRedimensionamento(0, 3400, 2400)).toEqual([]);
  });

  it('respeita alvos menores, que é como a compressão da 11.10 aperta', () => {
    expect(acoesDeRedimensionamento(2356, 3400, 1600)).toEqual([{ resize: { height: 1600 } }]);
    expect(acoesDeRedimensionamento(2356, 3400, 1200)).toEqual([{ resize: { height: 1200 } }]);
  });
});
