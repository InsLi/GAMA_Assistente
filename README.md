# GAMA Assistente

**Guia de Análise do Meio Ambiente**

Assistente de suporte à tomada de decisão judicial voltado a juízes e servidores do Tribunal de Justiça do Estado do Ceará (TJCE). É uma extensão web que agiliza a análise de processos ambientais, aplica uma matriz de risco em três eixos e gera minutas de decisão prontas para edição.

Projeto desenvolvido no Hackathon TJCE + UFC.

![Logo GAMA](logo.png)

## Problema

As ações envolvendo ocupações irregulares em áreas de preservação ambiental têm tramitação lenta e desgastante para todos os envolvidos. Enquanto a sentença não é proferida:

- O meio ambiente segue se degradando.
- Pessoas permanecem em situação de vulnerabilidade social, sem para onde ir.
- O município não possui recursos suficientes para lidar com a situação.

## Solução

O GAMA Assistente apoia o magistrado na análise e na triagem do processo, acelera a tomada de decisão e indica o caminho jurídico mais adequado, preservando ao mesmo tempo a dignidade humana e a preservação ambiental.

Objetivos do projeto:

- Apoiar decisões que protejam o meio ambiente.
- Garantir a dignidade das pessoas envolvidas.
- Facilitar a análise de processos e a tomada de decisão.
- Reduzir o prazo de resolução das demandas.

## Protótipo / MVP

1. Acionamento discreto no navegador, por meio de extensão lateral que não interrompe a consulta ao processo.
2. Triagem guiada do processo por checklist estruturado, com dados complementares confirmados pela VEMA: pedido de tutela de urgência, fase processual e tipo de demanda.
3. Análise em três eixos: Geotécnico, Social e Ambiental.
4. Relatório de análise anonimizado, exportável em PDF (impressão) e JSON.

## Matriz de decisão: o semáforo de risco

Cada cor aponta o caminho jurídico mais adequado.

- **Vermelho**: risco à vida. Desocupação assistida urgente.
- **Amarelo**: risco mitigável. Suspensão e saneamento / TAC.
- **Verde**: consolidado. Permanência condicionada / ReurbS.

Critério adotado no MVP, de forma determinística e explicável: qualquer marcação no eixo Geotécnico / Vida resulta em diagnóstico vermelho; na ausência de marcações nesse eixo, marcações no eixo Social resultam em amarelo; marcações restritas ao eixo Ambiental resultam em verde. Cada diagnóstico gera a fundamentação legal, a ação sugerida e a minuta de decisão correspondentes.

## Telas do assistente

A interface é um painel lateral fixo à direita, no formato do painel lateral (side panel) do navegador, com largura máxima de 400 px.

1. **Menu inicial** - apresentação da ferramenta com as ações "Iniciar Nova Triagem" e "Consultar Histórico".
2. **Triagem guiada** - bloco de dados complementares (pedido de tutela de urgência em destaque, fase processual e tipo de demanda, conforme a triagem da VEMA) mais formulário estruturado em três blocos de análise, com legenda do semáforo e validação antes do processamento. Quando um trecho chega do documento, uma caixa de anotação aparece no topo com o eixo escolhido e o seletor de nível de risco de 1 a 5.
3. **Resultado da matriz** - diagnóstico em semáforo (vermelho, amarelo ou verde), nota de urgência quando aplicável, fundamentação legal com as fontes consultadas pela VEMA, ação sugerida, editor com minuta de decisão pré-preenchida pronta para copiar e bloco **Relatório de Análise** com exportação em impressão/PDF e JSON, sempre anonimizado.
4. **Histórico de anotações** - lista das anotações salvas (trecho, eixo, nível e data), com remoção item a item e opção de limpar tudo.

## Eixos de análise

- **Eixo Geotécnico / Vida** - risco de desabamento, deslizamento ou inundação e habitações em área de risco.
- **Eixo Social** - grupos vulneráveis, tempo de ocupação consolidado, litígio e conflito de interesses.
- **Eixo Ambiental** - área de preservação permanente (APP) com potencial de regeneração, vegetação nativa, fauna e recursos hídricos.

O eixo escolhido no checklist define a cor do semáforo e, com ela, a fundamentação legal, a ação sugerida e a minuta de decisão apresentadas na tela de resultado. Consulte a seção "Matriz de decisão" acima.

## Demonstração online

Acesse a demonstração pelo navegador, sem instalação:

**https://insli.github.io/GAMA_Assistente/**

A página de entrada leva para a **demonstração completa**, que mostra o documento fictício à esquerda e o painel lateral do GAMA à direita, lado a lado, como se a extensão estivesse aberta ao lado de um leitor de PDF.

Também é possível abrir os arquivos diretamente no navegador:

- `demonstracao.html` - documento e painel lado a lado (página principal).
- `Hackathon_TJCE_GAMA/Assistent/sidebar.html` - apenas o painel com as três telas.

## Documento fictício de demonstração

O arquivo `documento-demo.html` simula um processo judicial (despacho de instrução) com um laudo pericial interdisciplinar contendo os três eixos de análise: geotécnico/vida, social e ambiental.

Como o visualizador nativo de PDF do navegador não permite a injeção de interfaces, o documento foi criado em HTML com aparência de página impressa e todo o texto selecionável. O texto é **normal**, sem marcações pré-definidas: nem eixo nem nível aparecem nele.

Funcionamento:

1. Selecione com o mouse qualquer trecho do texto.
2. Uma caixinha aparece com o recorte do trecho e pergunta "Qual o eixo deste trecho?": **quem define o eixo é o usuário**, pelos três botões (Geotécnico / Vida, Social, Ambiental).
3. Ao escolher o eixo, o trecho vai para o painel do GAMA Assistente, onde fica o **seletor de nível de risco de 1 a 5** (1 irrelevante, 2 baixo, 3 moderado, 4 alto, 5 crítico).
4. Ao salvar, a anotação (trecho, eixo e nível) é gravada no `localStorage` do navegador e os checkboxes do eixo são marcados conforme o nível: nível 1 nenhum item, níveis 2 e 3 um item, níveis 4 e 5 os dois itens do eixo.
5. As anotações salvas ficam no botão **"Consultar Histórico"** da tela inicial, com opção de remover item a limpar tudo.
6. Na demonstração completa, a caixinha envia a mensagem para a página, que repassa para o painel ao lado. Com a extensão instalada, a anotação vai direto para o painel lateral; sem ela, o clique abre a demonstração do painel em uma nova aba com o eixo e o trecho na URL.

Link direto da demonstração do documento: **https://insli.github.io/GAMA_Assistente/documento-demo.html**

## Como instalar a extensão no Google Chrome

1. Baixe ou clone este repositório.
2. Abra a página `chrome://extensions` no Chrome.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar extensão sem compactação** e selecione a pasta `Hackathon_TJCE_GAMA/Assistent`.
5. Clique no ícone GAMA na barra de ferramentas para abrir o painel lateral.

## Estrutura do repositório

```
GAMA_Assistente/
├── Hackathon_TJCE_GAMA/
│   └── Assistent/
│       ├── manifest.json         Manifesto da extensão (Manifest V3)
│       ├── background.js         Comportamento do painel lateral
│       ├── content.js            Detecção do número de processo na página
│       ├── sidebar.html          Interface com as quatro telas
│       ├── sidebar.js            Navegação e regras de negócio
│       ├── css/
│       │   ├── base.css          Variáveis, reset e ícones
│       │   ├── painel.css        Estrutura do painel lateral
│       │   ├── botoes.css        Botões de todas as telas
│       │   ├── tela-inicial.css  Tela 1: menu inicial
│       │   ├── triagem.css       Tela 2: triagem guiada
│       │   ├── anotacao.css      Caixa de anotação e histórico
│       │   ├── resultado.css     Tela 3: matriz de risco
│       │   ├── relatorio.css     Relatório de análise e impressão
│       │   └── conteudo.css      Botão discreto injetado nas páginas
│       └── logo.png              Logotipo do projeto
├── index.html                    Página de entrada da demonstração
├── index.css                     Estilos da página de entrada
├── demonstracao.html             Documento e painel lado a lado
├── demonstracao.css              Layout da demonstração completa
├── demonstracao.js               Repasse de mensagens entre os quadros
├── documento-demo.html           Documento fictício com os três eixos
├── documento-demo.css            Estilos do documento fictício
├── documento-demo.js             Caixinha de seleção e ponte com a extensão
├── fotos-slides/                 Capturas da demonstração para apresentação
├── logo.png                      Logotipo do projeto
├── qr-demo.png                   QR code da demonstração (para o pitch)
├── Modelo_Pitch.md            Apresentação do projeto
├── Modelo_Pitch.pdf           Apresentação do projeto (PDF)
├── Roteiro_Demo.md            Roteiro de 2-3 min + vídeo de fallback
├── Ideia_MVP.pdf              Conceito do MVP
├── LICENSE                    Licença MIT
└── README.md                  Este arquivo
```

## Recursos técnicos

- Extensão para navegador no padrão Manifest V3, com painel lateral (side panel).
- Detecção automática do número do processo na página aberta, com botão discreto do GAMA no canto da tela.
- HTML, CSS e JavaScript puros, sem dependências externas ou bibliotecas.
- CSS dividido em arquivos menores por tela, todos comentados em português.
- Identidade visual institucional: azul marinho `#002E63`, verde natureza `#1E824C` e cabeçalho em tom de menta.
- Layout responsivo dentro dos limites de largura de um painel lateral de extensão.
- Minuta de decisão copiável para a área de transferência.
- **Relatório de análise anonimizado** com duas exportações: impressão/PDF (área de impressão exclusiva) e JSON (download via Blob), ambos sem servidor.
- **Anonimização automática**: número CNJ, CPF, CNPJ e e-mail são mascarados antes de qualquer exportação.
- Dados complementares da triagem da VEMA: pedido de tutela de urgência (com nota no resultado), fase processual e tipo de demanda (desocupação, anulação de multas, obrigação de fazer/não fazer, criminal).
- Fundamentação com as fontes consultadas pela VEMA: CF/88 art. 225, CPC, Código Florestal, Leis nº 7.347/1985 e nº 9.605/1998, além das Resoluções CNJ nº 345/2020 e nº 460/2022.
- Anotação de trechos com eixo escolhido pelo usuário e nível de risco de 1 a 5, gravada no `localStorage` e listada na tela de histórico.
- Dados armazenados localmente no dispositivo.

## Fundamentação

- Resolução CNJ nº 345/2020 - Política Nacional de Justiça e Meio Ambiente.
- Resolução CNJ nº 460/2022 - atuação do Poder Judiciário na tutela diferenciada do meio ambiente.
- Art. 225 da Constituição Federal.

## Equipe

- **Carla Nayanna** - Mestranda em Avaliação de Políticas Públicas, Assistente Social, Especialista em Políticas Públicas.
- **Josias Batista** - Engenheiro de Software (UFC Campus Quixadá).
- **Inês Lima** - Engenharia de Computação.

## Documentos do projeto

- `Modelo_Pitch.md` e `Modelo_Pitch.pdf` - apresentação do projeto.
- `Roteiro_Demo.md` - roteiro de demonstração de 2 a 3 minutos com plano B em vídeo.
- `Ideia_MVP.pdf` - conceito do MVP.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).
