# Conectando a dignidade humana e a preservação ambiental em cada decisão

**Hackathon TJCE + UFC - Equipe 11, Desafio 01**

---

## PROBLEMA | DESAFIO 01

Como tratar as ações envolvendo ocupações irregulares em áreas de preservação
ambiental, considerando os limites financeiros, territoriais e sociais dos
municípios, bem como a dignidade e a vida das pessoas envolvidas?

---

## PROBLEMA

- **445,4 mil pessoas** vivendo em unidades de conservação no Ceará -
  8ª maior população do Brasil.
  *(Diário do Nordeste - 11 de julho de 2025)*
- O tempo de solução da sentença é demorado e desgastante para todos os lados.
- O meio ambiente segue se degradando ao longo do tempo de resolução.
- Pessoas ficam em situação de vulnerabilidade social, sem para onde ir.
- O município não tem recursos suficientes para lidar com a situação.

---

## Como manter a balança equilibrada?

---

## NOSSA SOLUÇÃO

- **Análise de processos** com triagem guiada
- **Semáforo de risco** em três eixos: geotécnico, social e ambiental
- **Geração de relatório de análise anonimizado** em um clique
- **Alternativas viáveis** e minuta de decisão pronta para edição

---

## VALIDAÇÃO | PERGUNTAMOS À VEMA, E ELES RESPONDERAM

Durante o desafio, a equipe enviou 14 perguntas à equipe da VEMA.
As respostas moldaram a solução:

| O que perguntamos | O que a VEMA respondeu |
| --- | --- |
| Como é a triagem hoje? | Fila de redistribuição; **não há critérios específicos** de análise |
| Qual o maior gargalo? | **Identificar a fase do processo** (acervo vem de outras unidades) e garantir celeridade |
| O que é verificado primeiro? | **Existência de pedido de tutela de urgência** |
| Existe relatório de análise? | **Não.** Só despachos, decisões e sentenças |
| Quais fontes são consultadas? | CF/88 art. 225, CPC, Código Florestal, Leis 7.347/1985 e 9.605/1998 |
| Dá para exportar dados? | **Sim.** E há restrições de segurança a considerar |

> **Resposta à dúvida da reunião de 28/09 (Bárbara):** confirmado - existem
> sentenças além das de desocupação, na área cível e na criminal:
> anulação de multas, obrigações de fazer e não fazer e ações criminais.
> O GAMA já classifica esses tipos de demanda na triagem.

**O que fizemos com essas respostas:** implementamos exatamente o que
faltava - dados complementares na triagem (tutela de urgência, fase,
tipo de demanda) e o **relatório de análise que hoje ninguém produz**.

---

## VALIDAÇÃO | MATRIZ DE DECISÃO

**O semáforo de risco: cada cor aponta o caminho jurídico mais adequado.**

| Cor | Diagnóstico | Caminho |
| --- | --- | --- |
| Vermelho | Risco à vida | Desocupação assistida urgente |
| Amarelo | Risco mitigável | Suspensão e saneamento / TAC |
| Verde | Consolidado | Permanência condicionada / ReurbS |

Critério determinístico e explicável: qualquer marcação no eixo
Geotécnico/Vida resulta em vermelho; na ausência dele, marcações no eixo
Social resultam em amarelo; marcações restritas ao eixo Ambiental resultam
em verde. Cada diagnóstico gera fundamentação legal, ação sugerida e minuta.

---

## NA TELA

1. **Menu inicial** - iniciar triagem ou consultar histórico.
2. **Triagem guiada** - dados complementares da VEMA + checklist dos três
   eixos, com anotação de trechos e nível de risco de 1 a 5.
3. **Resultado** - semáforo, fundamentação, minuta copiável e
   **Relatório de Análise** (impressão/PDF e JSON, anonimizado).
4. **Histórico** - anotações salvas no próprio dispositivo.

**Demonstre ao vivo:** [insli.github.io/GAMA_Assistente](https://insli.github.io/GAMA_Assistente/)

**Vídeo da demonstração (plano B):** inserir aqui o link do vídeo gravado
(ver `Roteiro_Demo.md` - gravação de tela executando o roteiro).

![QR code da demonstração](qr-demo.png)

---

## INTEGRAÇÃO SEGURA | RESPONDENDO ÀS RESTRIÇÕES DA VEMA

A VEMA confirmou que **existem restrições de segurança** e que a plataforma
permite **importar e exportar** informações.

- A extensão roda **no lado do usuário**, ao lado da plataforma já usada -
  não exige API nem alteração nos sistemas do TJCE.
- **Nada sai da máquina:** triagem, anotações e relatório ficam no
  `localStorage` do dispositivo, sem servidor e sem nuvem.
- Exportação por **arquivo** (JSON/PDF), exatamente o formato que a
  plataforma já permite importar e exportar.
- Complementar por design: **não substitui** a plataforma - soma a ela.

---

## ALINHAMENTO COM A AGENDA DA ONU

- **11** - Cidades e Comunidades Sustentáveis
- **16** - Paz, Justiça e Instituições Eficazes

---

## IMPACTO

- Apoiar decisões que protejam o meio ambiente.
- Garantir a dignidade das pessoas envolvidas.
- Facilitar análises e tomadas de decisão.
- Reduzir o prazo de resolução das demandas.

---

## MODELO DE NEGÓCIO

- **B2G:** adoção institucional pelo TJCE.
- **Valor:** baixo custo - roda como extensão sobre a estrutura já existente
  (PJe, AURI, Sara).
- **Zero:** contratações de servidores e custos de licenciamento.

---

## NOSSOS DIFERENCIAIS

- Foco: ocupações irregulares em **Áreas de Preservação Permanente (APP)**
  no TJCE.
- Proteção de famílias vulneráveis e freio no avanço dos danos ambientais
  durante a tramitação.
- **Checklist estruturado + matriz de decisão em três eixos:**
  geotécnico, social e ambiental.
- **Relatório de análise anonimizado** - o documento que a VEMA confirmou
  não existir hoje, gerado em um clique (PDF e JSON).
- Solução **100% gratuita e offline**: HTML, CSS e JavaScript puros,
  zero dependências.

---

## PRÓXIMOS PASSOS DO NEGÓCIO

| Prazo | Etapa |
| --- | --- |
| **30 dias** | Finalização da extensão web |
| **3 meses** | Parceria institucional e piloto (PoC) na VEMA |
| **6 meses** | Ajustes de integração ao sistema do TJCE (PJe) |
| **9–12 meses** | Implementação de IA para leitura de peças e sugestão de caminhos jurídicos |

*Prazos propostos pelo projeto, a definir em acordo de cooperação técnica
com o TJCE.*

---

## O TIME

- **Carla Nayanna** - Mestranda em Avaliação de Políticas Públicas,
  Assistente Social, Especialista em Políticas Públicas (UFC Campus PICI).
- **Josias Batista** - Engenheiro de Software (UFC Campus Quixadá).
  1º Lugar no Corredores Digitais Bora Criar 2026; 3º Lugar - Trilha Web 3.0
  no hackathon XRP Ledger (XRPL) 2024.
- **Inês Lima** - Engenharia de Computação (UFC Campus Sobral).

---

Porque, diante de um conflito ambiental, proteger o território e respeitar a
dignidade humana precisam fazer parte da mesma busca por soluções.

**Obrigado(a)! Dúvidas?**
