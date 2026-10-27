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
2. Triagem guiada do processo por checklist estruturado.
3. Análise em três eixos: Geotécnico, Social e Ambiental.

## Matriz de decisão: o semáforo de risco

Cada cor aponta o caminho jurídico mais adequado.

- **Vermelho**: risco à vida. Desocupação assistida urgente.
- **Amarelo**: risco mitigável. Suspensão e saneamento / TAC.
- **Verde**: consolidado. Permanência condicionada / ReurbS.

Critério adotado no MVP, de forma determinística e explicável: qualquer marcação no eixo Geotécnico / Vida resulta em diagnóstico vermelho; na ausência de marcações nesse eixo, marcações no eixo Social resultam em amarelo; marcações restritas ao eixo Ambiental resultam em verde. Cada diagnóstico gera a fundamentação legal, a ação sugerida e a minuta de decisão correspondentes.

## Telas do assistente

A interface é um painel lateral fixo à direita, no formato do painel lateral (side panel) do navegador, com largura máxima de 400 px.

1. **Menu inicial** - apresentação da ferramenta com as ações "Iniciar Nova Triagem" e "Consultar Histórico".
2. **Triagem guiada** - formulário estruturado em três blocos de análise, com legenda do semáforo e validação antes do processamento.
3. **Resultado da matriz** - diagnóstico em semáforo (vermelho, amarelo ou verde), fundamentação legal, ação sugerida e editor com minuta de decisão pré-preenchida, pronta para copiar.

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

O arquivo `documento-demo.html` simula um processo judicial (despacho de instrução) com um laudo pericial interdisciplinar contendo os três eixos de análise, cada um com os níveis de risco de 1 a 5 e um exemplo de texto para cada nível.

Como o visualizador nativo de PDF do navegador não permite a injeção de interfaces, o documento foi criado em HTML com aparência de página impressa e todo o texto selecionável.

Funcionamento:

1. Selecione com o mouse um trecho destacado do texto.
2. Uma caixinha aparece mostrando o eixo daquele texto, o nível de 1 a 5 e um exemplo resumido do nível.
3. Ao clicar na caixinha, o GAMA Assistente abre com o item da triagem correspondente ao eixo já marcado, conforme o nível: nível 1 nenhum item, níveis 2 e 3 um item, níveis 4 e 5 os dois itens do eixo.
4. Na demonstração completa, a caixinha envia a mensagem para a página, que repassa para o painel ao lado, que marca o item em tempo real.
5. Fora da demonstração completa, com a extensão instalada a caixinha marca o item direto no painel lateral; sem a extensão, ela abre a demonstração do painel em uma nova aba com o eixo e o nível na URL.

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
│       ├── sidebar.html          Interface com as três telas
│       ├── sidebar.js            Navegação e regras de negócio
│       ├── css/
│       │   ├── base.css          Variáveis, reset e ícones
│       │   ├── painel.css        Estrutura do painel lateral
│       │   ├── botoes.css        Botões de todas as telas
│       │   ├── tela-inicial.css  Tela 1: menu inicial
│       │   ├── triagem.css       Tela 2: triagem guiada
│       │   ├── resultado.css     Tela 3: matriz de risco
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
├── logo.png                      Logotipo do projeto
├── Modelo_Pitch.md            Apresentação do projeto
├── Modelo_Pitch.pdf           Apresentação do projeto (PDF)
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
- `Ideia_MVP.pdf` - conceito do MVP.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).
