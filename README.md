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

## Telas do assistente

A interface é um painel lateral fixo à direita, exibido ao lado do leitor de processo em PDF.

1. **Menu inicial** — apresentação da ferramenta com as ações "Iniciar Nova Triagem" e "Consultar Histórico".
2. **Triagem guiada** — formulário estruturado em três blocos de análise, com validação por eixo antes do processamento.
3. **Resultado da matriz** — diagnóstico em semáforo, fundamentação legal, ação sugerida e editor com minuta de decisão pré-preenchida, pronta para copiar.

## Eixos de análise

- **Eixo Geotécnico / Vida** — risco de desabamento, deslizamento ou inundação e habitações em área de risco.
- **Eixo Social** — grupos vulneráveis, tempo de ocupação consolidado, litígio e conflito de interesses.
- **Eixo Ambiental** — área de preservação permanente (APP) com potencial de regeneração, vegetação nativa, fauna e recursos hídricos.

O MVP implementa o **Diagnóstico Amarelo: Suspensão e Concertação**, com fundamento nas Resoluções CNJ nº 345/2020 e nº 460/2022 e encaminhamento ao CEJUSC no prazo de 180 dias.

## Demonstração online

Acesse a demonstração pelo navegador, sem instalação:

**https://insli.github.io/GAMA_Assistente/**

Também é possível abrir o arquivo `Hackathon_TJCE_GAMA/Assistent/sidebar.html` diretamente no navegador para testar as três telas.

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
│       ├── manifest.json      Manifesto da extensão (Manifest V3)
│       ├── background.js      Comportamento do painel lateral
│       ├── sidebar.html       Interface com as três telas
│       ├── styles.css         Estilos e identidade visual
│       ├── sidebar.js         Navegação e regras de negócio
│       └── logo.png           Logotipo do projeto
├── logo.png                   Logotipo do projeto
├── Modelo_Pitch.md            Apresentação do projeto
├── Modelo_Pitch.pdf           Apresentação do projeto (PDF)
├── Ideia_MVP.pdf              Conceito do MVP
├── LICENSE                    Licença MIT
└── README.md                  Este arquivo
```

## Recursos técnicos

- Extensão para navegador no padrão Manifest V3, com painel lateral (side panel).
- HTML, CSS e JavaScript puros, sem dependências externas ou bibliotecas.
- Identidade visual institucional: azul marinho `#002E63`, verde natureza `#1E824C` e cabeçalho em tom de menta.
- Layout responsivo dentro dos limites de largura de um painel lateral de extensão.
- Minuta de decisão copiável para a área de transferência.
- Dados armazenados localmente no dispositivo.

## Fundamentação

- Resolução CNJ nº 345/2020 — Política Nacional de Justiça e Meio Ambiente.
- Resolução CNJ nº 460/2022 — atuação do Poder Judiciário na tutela diferenciada do meio ambiente.
- Art. 225 da Constituição Federal.

## Equipe

- **Carla Nayanna** — Mestranda em Avaliação de Políticas Públicas, Assistente Social, Especialista em Políticas Públicas.
- **Josias Batista** — Engenheiro de Software (UFC Campus Quixadá).
- **Inês Lima** — Engenharia de Computação.

## Documentos do projeto

- `Modelo_Pitch.md` e `Modelo_Pitch.pdf` — apresentação do projeto.
- `Ideia_MVP.pdf` — conceito do MVP.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).
