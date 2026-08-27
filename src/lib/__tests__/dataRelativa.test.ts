import { dataRelativa, formatarTamanho } from '../dataRelativa';

// Quarta-feira, 26/08/2026 às 14:32 no fuso local
const AGORA = new Date(2026, 7, 26, 14, 32, 0);
const min = (n: number) => n * 60_000;
const h = (n: number) => n * 3_600_000;

describe('11.11 — data relativa', () => {
  it('mostra "Agora" abaixo de um minuto', () => {
    expect(dataRelativa(AGORA.getTime() - 30_000, AGORA)).toBe('Agora');
  });

  it('mostra minutos abaixo de uma hora', () => {
    expect(dataRelativa(AGORA.getTime() - min(5), AGORA)).toBe('há 5 min');
    expect(dataRelativa(AGORA.getTime() - min(59), AGORA)).toBe('há 59 min');
  });

  it('mostra "Hoje, HH:mm" no mesmo dia', () => {
    expect(dataRelativa(AGORA.getTime() - h(6), AGORA)).toBe('Hoje, 08:32');
  });

  it('mostra "Ontem, HH:mm" no dia anterior', () => {
    const ontem = new Date(2026, 7, 25, 9, 15).getTime();
    expect(dataRelativa(ontem, AGORA)).toBe('Ontem, 09:15');
  });

  it('a virada de dia é pelo fuso local, não por 24 horas corridas', () => {
    // 23:50 de ontem: menos de 24h atrás, mas é ONTEM para quem lê.
    const ontemTarde = new Date(2026, 7, 25, 23, 50).getTime();
    expect(dataRelativa(ontemTarde, AGORA)).toBe('Ontem, 23:50');
    // 00:10 de hoje: poucas horas atrás e é HOJE.
    const hojeCedo = new Date(2026, 7, 26, 0, 10).getTime();
    expect(dataRelativa(hojeCedo, AGORA)).toBe('Hoje, 00:10');
  });

  it('mostra o dia da semana abaixo de 7 dias', () => {
    const sabado = new Date(2026, 7, 22, 16, 5).getTime();
    expect(dataRelativa(sabado, AGORA)).toBe('sábado, 16:05');
  });

  it('mostra "DD de mês" no mesmo ano', () => {
    const julho = new Date(2026, 6, 11, 10, 0).getTime();
    expect(dataRelativa(julho, AGORA)).toBe('11 de julho');
  });

  it('mostra a data cheia em ano anterior', () => {
    const anoPassado = new Date(2025, 11, 3, 10, 0).getTime();
    expect(dataRelativa(anoPassado, AGORA)).toBe('03/12/2025');
  });
});

describe('formatação de tamanho', () => {
  it('usa vírgula decimal, como o Brasil escreve', () => {
    expect(formatarTamanho(4.2 * 1024 * 1024)).toBe('4,2 MB');
  });

  it('usa KB abaixo de um mega e B abaixo de um kilo', () => {
    expect(formatarTamanho(480 * 1024)).toBe('480 KB');
    expect(formatarTamanho(512)).toBe('512 B');
  });
});
