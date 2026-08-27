# Prompt de design — Manda em PDF (v1.4)

> Cole tudo abaixo da linha no `/design`. Montado a partir das seções 10 (telas), 8 (estados), 15 (copy final) e 16 (direção visual) do `spec.md` v1.2. Toda tela e todo texto vêm literalmente do spec.

---

Desenhe as telas de um app **iOS e Android** chamado **Manda em PDF**.

## O que o app faz

Transforma documento de papel ou foto em PDF pronto para enviar, em segundos, sem que nada saia do aparelho. O recorte é **o papel que ninguém digitaliza por você**: contrato, escritura e matrícula de imóvel, procuração, nota fiscal, boleto, certidão, recibo. RG e CNH continuam atendidos, mas **não são o centro** — esses já saem prontos em PDF do gov.br e da CNH Digital.

**A razão de ser do app é atrito baixo, não quantidade de recurso.** Já existem dezenas de scanners, e dá para mandar a foto a um chatbot e pedir o PDF. O que ninguém entrega é o caminho curto: o pedido chega pelo WhatsApp e a resposta precisa voltar pelo WhatsApp em segundos. **Escanear rápido e compartilhar fácil** — WhatsApp, AirDrop, e-mail, o que o sistema oferecer.

**Meta dura:** da Home até a folha de compartilhamento em **4 toques**. Novo PDF → concluir a captura → Gerar → Compartilhar.

**Cenário que define o desenho:** a pessoa está de pé, com o documento numa mão e o celular na outra, com pressa, porque alguém pediu o RG em PDF no WhatsApp.

É uma **ferramenta de passagem, não um cofre**: abre, resolve e sai. Sem organização, sem pastas, sem busca, sem conta de usuário.

## Formato

- **Celular apenas, retrato apenas.** Sem tablet, sem paisagem, sem web.
- **Navegação em pilha simples. Sem menu lateral e sem abas.** A Home é a raiz.
- Entregue **tema claro e tema escuro** de cada tela.

## Direção visual — padrão nativo da Apple

O app se parece com um app do sistema: fundo neutro, listas agrupadas, **azul de sistema como única cor de ação**, tipografia do sistema, sem identidade visual de marca. O documento do usuário é o conteúdo; a interface some.

**Uma paleta só para as duas plataformas** — o Android recebe o mesmo desenho, não um Material Design paralelo. É decisão declarada, não esquecimento.

### Paleta (cores de sistema da Apple)

| Papel | Cor de sistema | Claro | Escuro |
|---|---|---|---|
| **Ação / primária** | `systemBlue` | `#007AFF` | `#0A84FF` |
| Ação pressionada | — | `#0062CC` | `#3D9BFF` |
| Fundo | `systemBackground` | `#FFFFFF` | `#000000` |
| Fundo de lista agrupada | `systemGroupedBackground` | `#F2F2F7` | `#000000` |
| Cartão / célula | `secondarySystemGroupedBackground` | `#FFFFFF` | `#1C1C1E` |
| Preenchimento sutil | `tertiarySystemFill` | `#F2F2F7` | `#2C2C2E` |
| Texto principal | `label` | `#000000` | `#FFFFFF` |
| Texto secundário | `secondaryLabel` | `#6C6C70` | `#98989E` |
| Texto terciário | `tertiaryLabel` | `#B0B0B5` | `#68686E` |
| Divisor | `separator` | `#C6C6C8` | `#38383A` |

**Semânticas, só para significado:** sucesso `systemGreen` `#34C759` / `#30D158` · alerta `systemOrange` `#FF9500` / `#FF9F0A` · erro e destrutivo `systemRed` `#FF3B30` / `#FF453A`.

**Regras:** azul é ação, vermelho é destruição — nada de vermelho em elemento que não apaga. A única ação destrutiva (apagar) usa **texto** em `systemRed`, no padrão iOS, nunca botão vermelho preenchido. Erro nunca é comunicado só por cor: sempre com ícone e texto.

### Tipografia (estilos nomeados da Apple)

Fonte do sistema — SF Pro no iOS, Roboto no Android. Sem fonte customizada.

| Estilo | Onde | Tamanho | Peso |
|---|---|---|---|
| Large Title | Título da Home e do Histórico | 34 | Bold |
| Title 2 | Título de tela interna | 22 | Bold |
| Headline | Título de célula, rótulo de botão | 17 | Semibold |
| Body | Corpo | 17 | Regular |
| Callout | Apoio | 16 | Regular |
| Subheadline | Metadados de célula | 15 | Regular |
| Footnote | Rodapé, aviso | 13 | Regular |
| Caption 1 | Legenda, selo | 12 | Regular |

### Forma e espaçamento

- Escala: 4 / 8 / 12 / 16 / 20 / 24 / 32. **Margem lateral padrão: 16.**
- Raio: **10** em cartões e campos, **14** em folhas modais, **capsule** no botão principal.
- **Listas agrupadas no padrão iOS**: célula clara sobre fundo agrupado, separador **alinhado ao texto**, não à borda da tela. Chevron `›` em `tertiaryLabel` nas células que navegam.
- Hairlines de 1 px como divisor. Sem borda pesada, sem sombra forte.
- **Botão principal da Home:** largura total menos as margens, altura **50**, capsule, `systemBlue`, texto branco em Headline. É o elemento mais pesado da interface, e é intencional.
- Área mínima de toque: 44 × 44 pt.

**Referências:** Ajustes do iOS para a lista agrupada e a densidade · app **Arquivos** da Apple para a grade de miniaturas e a prévia · **Atalhos** da Apple para os cartões de preset na Home.

## Caminho principal — desenhe como sequência, não como telas soltas

**Home → Origem → Scanner → Montagem → Gerando → Pronto → folha de compartilhamento do sistema.**

A tela de **Opções de saída** (nº 7) **não faz parte deste caminho** — é desvio voluntário, para quem quer configurar. Quem não toca em Opções nunca a vê.

## Telas

Textos entre aspas são **copy final** — use exatamente como estão, sem reescrever.

### 1. Home
Título Large Title. De cima para baixo:
- Botão dominante **"Novo PDF"** (o elemento mais pesado da tela).
- Seção **"Documentos"** com 7 cartões de preset, **nesta ordem**: **Contrato**, **Imóvel**, **Procuração**, **Nota fiscal**, **Boleto**, **RG**, **CNH**. A ordem comunica o que o app é — Contrato primeiro, RG e CNH por último. **Sem selo: os presets são gratuitos.**
- Seção **"Recentes"** com os 5 PDFs mais recentes e o link **"Ver todos"**. Cada item: nome, número de páginas, tamanho, data relativa (ex.: "Hoje, 14:32").
- Acesso aos Ajustes no canto da barra de navegação.

**Estado vazio** (primeiro uso): ilustração + **"Seus PDFs aparecem aqui"** + **"Escaneie um documento e ele fica salvo para você reenviar quando precisar."**, com o botão Novo PDF em destaque.

### 2. Origem *(folha inferior)*
Três opções: **Escanear**, **Escolher das Fotos**, **Importar de Arquivos**. Mais cancelar. Folha curta — aparece e sai rápido.

### 3. Scanner *(tela do sistema — só represente)*
Câmera nativa com detecção de borda. Não precisa de design próprio; mostre para o fluxo se ler inteiro.

### 4. Montagem
Grade de miniaturas numeradas na ordem atual. Por página: girar, recortar, filtro, excluir. Arrastar para reordenar.

Rodapé com **três** elementos, nesta hierarquia:
- **"Gerar PDF"** — botão primário, dominante. **Gera direto, sem passar por tela de ajuste.**
- **"Opções"** — link discreto ao lado, leva à tela 7.
- **"Adicionar páginas"** — secundário.

**Estados:** vazio (excluiu a última página) mostra o vazio com o botão de adicionar, **sem** voltar sozinho para a Home · carregando mostra spinner sobre a miniatura afetada, sem travar a tela.

**Diálogo ao sair:** **"Descartar as páginas? O que você capturou vai ser perdido."** com **"Descartar"** e **"Continuar"**.

### 5. Editor de página
Página em tela cheia. Girar, recortar, escolher filtro (original, preto e branco, escala de cinza, clarear), e a opção explícita de **aplicar a todas as páginas** ou só a esta. Confirmar.

### 6. Gerando *(modal)*
Progresso com a etapa atual: **"Gerando o PDF…"**. Acima de 5 páginas, "página X de Y". Com OCR ligado, "Reconhecendo texto — página X de Y". Com alvo de tamanho, "Ajustando o tamanho — tentativa X". Botão cancelar.

### 7. Opções de saída *(opcional, fora do caminho principal)*
Lista agrupada no padrão iOS: campo de nome do arquivo (pré-preenchido, editável), tamanho do papel (A4 / Carta), orientação (retrato / paisagem), e dois itens pagos:
- **"Texto pesquisável (OCR)"** — interruptor.
- **"Tamanho máximo"** — Sem limite / 2 MB / 5 MB / 10 MB.

Sem compra, os dois aparecem **visíveis e desabilitados**, com o selo **"Completo"** — nunca escondidos. Confirmar volta à Montagem.

### 8. Pronto
Título **"Pronto"**. Prévia da primeira página, nome do arquivo, número de páginas, tamanho em disco.

**"Compartilhar"** é a ação primária e domina a tela — é o fim do trabalho e a razão de ser do app. Secundárias, discretas: **"Salvar em Arquivos"** e **"Novo PDF"**.

**Variante com aviso:** quando o alvo de tamanho não foi atingido, mostrar **"O menor tamanho possível foi 6,4 MB. Reduzir mais deixaria o documento ilegível."**

### 9. Folha de compartilhamento *(tela do sistema — só represente)*
A folha nativa com WhatsApp, AirDrop, Mail e os contatos sugeridos. Represente para deixar claro que é o destino final do fluxo.

### 10. Histórico
Título Large Title. Lista agrupada, do mais recente para o mais antigo. Cada item: nome, páginas, tamanho, data relativa. Deslizar revela **Compartilhar** (azul) e **Apagar** (vermelho).

**Item indisponível** (arquivo apagado por fora do app): marcado como indisponível, com a única ação **Remover da lista**.

**Diálogo de apagar:** **"Apagar este PDF? Não dá para recuperar depois."** com **"Apagar"** e **"Cancelar"**.

### 11. Prévia do PDF
PDF em tela cheia, com compartilhar, apagar e fechar.

### 12. Paywall *(folha modal)*
- Título: **"Manda em PDF Completo"**
- Quatro itens, nesta ordem: **"Contrato inteiro num arquivo só, com quantas páginas precisar"** · **"Ajustar o tamanho para caber no limite do site"** · **"PDF com texto pesquisável, dá para buscar depois"** · **"RG e CNH frente e verso numa página só"**
- Rodapé: **"Pagamento único. Sem assinatura, sem mensalidade."**
- Botões: **"Comprar por R$ 29,90"** (primário) e **"Restaurar compra"** (texto).
- Fechar sempre disponível.
- **Variante loja indisponível:** o botão comprar some e aparece **"Não deu para falar com a loja agora. Verifique a internet e tente de novo."**

### 13. Ajustes
Lista agrupada, densidade dos Ajustes do iOS:
- **Compra:** estado atual e **Restaurar compra**.
- **Padrões:** tamanho de papel padrão, filtro padrão.
- **Dados:** apagar todo o histórico — diálogo **"Apagar todos os PDFs? O histórico fica vazio e os arquivos são removidos do app."**
- **Sobre:** política de privacidade, contato, versão.

### 14. Onboarding — 3 telas, só na primeira abertura
1. **"Contrato, escritura, nota, boleto"** / "Escaneie o papel e mande em PDF. Sem computador, sem scanner."
2. **"Nada sai do seu aparelho"** / "Seus documentos são processados aqui dentro. Sem nuvem, sem conta, sem upload."
3. **"Grátis para usar"** / "PDFs de até duas páginas são grátis para sempre. Sem anúncio e sem marca d'água."

### 15. Captura guiada — RG e CNH *(sobreposição na tela do scanner)*
Instrução em duas etapas: **"Fotografe a frente"** e depois **"Agora o verso"**, com progresso (1 de 2 / 2 de 2).

### 16. Captura em lote — Contrato, Imóvel, Procuração *(sobreposição na tela do scanner)*
A câmera **não fecha** entre as páginas. Contador no topo (**"7 páginas"**), miniatura da última captura no canto inferior esquerdo, e **"Concluir"** no lugar do cancelar.

### 17. Prévia do PDF
PDF em tela cheia sobre fundo cinza, com o nome do arquivo e "1 de 12" na barra, e compartilhar / apagar / fechar.

## O que muda conforme a pessoa comprou

Não há login nem perfis. A única distinção é **gratuito** vs. **comprado**:

| Tela | Gratuito | Comprado |
|---|---|---|
| Home — cartões de preset | **Todos livres, sem selo** — presets são gratuitos | Iguais |
| Opções de saída — OCR e Tamanho máximo | Visíveis e **desabilitados**, com selo **"Completo"** | Habilitados |
| Montagem — Gerar com 3+ páginas | Habilitado, mas abre o paywall | Gera direto |
| Montagem — Gerar com 1 ou 2 páginas | **Gera direto, sempre** | Gera direto |

**Regra que não pode ser quebrada no design:** quem não comprou **nunca** vê anúncio, marca d'água, contador de uso ou tela de bloqueio ao abrir. Recurso pago aparece **desabilitado com selo**, nunca escondido e nunca como parede.
