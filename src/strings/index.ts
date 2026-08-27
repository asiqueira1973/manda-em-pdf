/**
 * Todos os textos de interface do app (seção 15 do spec).
 *
 * REGRA DURA (18.4): nenhum texto de interface pode existir fora deste
 * arquivo. Isto é o que torna a tradução (roadmap 28.5) trabalho de
 * tradução e não de garimpo.
 *
 * Este é o texto FINAL, não é placeholder. O número entre parênteses em
 * cada chave é o item da seção 15 do spec.
 */
export const T = {
  // Home (15.1 a 15.3)
  novoPdf: 'Novo PDF',
  secaoDocumentos: 'Documentos',
  secaoRecentes: 'Recentes',
  verTodos: 'Ver todos',

  // Rótulos dos presets (15.2b) — a ordem importa (regra 11.6)
  presets: {
    contrato: 'Contrato',
    imovel: 'Imóvel',
    procuracao: 'Procuração',
    nota_fiscal: 'Nota fiscal',
    boleto: 'Boleto',
    rg: 'RG',
    cnh: 'CNH',
  },

  // Origem
  escanear: 'Escanear',
  escolherDasFotos: 'Escolher das Fotos',
  importarDeArquivos: 'Importar de Arquivos',
  cancelar: 'Cancelar',

  // Erros de captura (15.4, 15.5)
  cameraNegada:
    'Para escanear, o app precisa da câmera. Você pode liberar nos Ajustes do aparelho.',
  arquivoNaoSuportado: 'Esse arquivo não dá para usar. Escolha uma imagem ou um PDF.',

  // Montagem (15.6, 15.23b)
  descartarTitulo: 'Descartar as páginas? O que você capturou vai ser perdido.',
  descartar: 'Descartar',
  continuar: 'Continuar',
  adicionarPaginas: 'Adicionar páginas',
  gerarPdf: 'Gerar PDF',
  opcoes: 'Opções',
  girar: 'Girar',
  recortar: 'Recortar',
  filtro: 'Filtro',
  excluir: 'Excluir',
  aplicarATodas: 'Aplicar a todas as páginas',
  concluir: 'Concluir',
  paginaN: (n: number) => `Página ${n}`,
  contadorPaginas: (n: number) => (n === 1 ? '1 página' : `${n} páginas`),

  // Filtros (nomes exibidos)
  filtros: {
    original: 'Original',
    pb: 'Preto e branco',
    cinza: 'Escala de cinza',
    clarear: 'Clarear',
  },

  // Geração (15.7, 15.8)
  gerando: 'Gerando o PDF…',
  gerandoPagina: (i: number, total: number) => `página ${i} de ${total}`,
  reconhecendoTexto: (i: number, total: number) => `Reconhecendo texto — página ${i} de ${total}`,
  ajustandoTamanho: (tentativa: number) => `Ajustando o tamanho — tentativa ${tentativa}`,
  falhaGeracao: 'Não deu para gerar o PDF. Suas páginas continuam aqui — tente de novo.',

  // Histórico (15.9, 15.10)
  apagarPdfTitulo: 'Apagar este PDF? Não dá para recuperar depois.',
  apagar: 'Apagar',
  historicoVazioTitulo: 'Seus PDFs aparecem aqui',
  historicoVazioCorpo:
    'Escaneie um documento e ele fica salvo para você reenviar quando precisar.',
  indisponivel: 'Indisponível',
  removerDaLista: 'Remover da lista',

  // Avisos (15.11, 15.12, 15.15, 15.17, 15.18, 15.33)
  ocrFalhou: 'O PDF ficou pronto, mas não deu para reconhecer o texto desta vez.',
  alvoNaoAtingido: (tamanho: string) =>
    `O menor tamanho possível foi ${tamanho}. Reduzir mais deixaria o documento ilegível.`,
  boletoNoPiso: (tamanho: string) =>
    `Não dá para reduzir mais sem o código de barras parar de ser lido. O arquivo ficou com ${tamanho}.`,
  limitePaginas: 'O limite é de 50 páginas por PDF.',
  semEspaco: 'Seu aparelho está sem espaço. Libere um pouco e tente de novo.',
  bancoRecriado:
    'Precisamos recriar os dados do app e o histórico foi perdido. Os PDFs que você já compartilhou continuam onde você salvou.',

  // Loja (15.13, 15.14, 15.16)
  lojaIndisponivel: 'Não deu para falar com a loja agora. Verifique a internet e tente de novo.',
  restaurarSemCompra:
    'Não encontramos uma compra nesta conta. A compra vale para a loja onde foi feita — se você comprou em outro sistema, ela não vem junto.',
  compraPendente:
    'Sua compra está aguardando aprovação. Assim que for confirmada, o acesso libera sozinho.',

  // Paywall (15.19 a 15.23)
  paywallTitulo: 'Manda em PDF Completo',
  paywallItens: [
    'Contrato inteiro num arquivo só, com quantas páginas precisar',
    'Ajustar o tamanho para caber no limite do site',
    'PDF com texto pesquisável, dá para buscar depois',
    'RG e CNH frente e verso numa página só',
  ],
  paywallRodape: 'Pagamento único. Sem assinatura, sem mensalidade.',
  comprarPor: (preco: string) => `Comprar por ${preco}`,
  restaurarCompra: 'Restaurar compra',
  seloCompleto: 'Completo',

  // Pronto (15.24, 15.25)
  pronto: 'Pronto',
  compartilhar: 'Compartilhar',
  salvarEmArquivos: 'Salvar em Arquivos',
  fechar: 'Fechar',

  // Onboarding (15.26 a 15.28)
  onboarding: [
    {
      titulo: 'Contrato, escritura, nota, boleto',
      corpo: 'Escaneie o papel e mande em PDF. Sem computador, sem scanner.',
    },
    {
      titulo: 'Nada sai do seu aparelho',
      corpo: 'Seus documentos são processados aqui dentro. Sem nuvem, sem conta, sem upload.',
    },
    {
      titulo: 'Grátis para usar',
      corpo:
        'PDFs de até duas páginas são grátis para sempre. Sem anúncio e sem marca d’água.',
    },
  ],
  comecar: 'Começar',

  // Ajustes (15.29)
  ajustes: 'Ajustes',
  apagarTudoTitulo:
    'Apagar todos os PDFs? O histórico fica vazio e os arquivos são removidos do app.',
  tamanhoPapel: 'Tamanho do papel',
  filtroPadrao: 'Filtro',
  apagarTodosOsPdfs: 'Apagar todos os PDFs',
  politicaPrivacidade: 'Política de privacidade',
  contato: 'Contato',
  versao: 'Versão',
  secaoCompra: 'Compra',
  secaoPadroes: 'Padrões',
  secaoDados: 'Dados',
  secaoSobre: 'Sobre',

  // Preset guiado (15.30, 15.31, 15.32)
  fotografeFrente: 'Fotografe a frente',
  agoraOVerso: 'Agora o verso',
  deN: (i: number, total: number) => `${i} de ${total}`,
  fusaoSemCompraTitulo:
    'Na versão completa, a frente e o verso saem numa página só. Quer seguir com duas páginas?',
  seguirComDuas: 'Seguir com duas',
  verVersaoCompleta: 'Ver a versão completa',

  // Opções de saída
  nomeDoArquivo: 'Nome',
  orientacao: 'Orientação',
  textoPesquisavel: 'Texto pesquisável (OCR)',
  tamanhoMaximo: 'Tamanho máximo',
  semLimite: 'Sem limite',
  papelA4: 'A4',
  papelCarta: 'Carta',
  retrato: 'Retrato',
  paisagem: 'Paisagem',

  // Datas relativas (regra 11.11)
  agora: 'Agora',
  hoje: 'Hoje',
  ontem: 'Ontem',
} as const;
