/* ============================================================
   ARQUIVO: sidebar.js
   O QUE E:
   O "cérebro" da interface. Este arquivo roda dentro do
   painel lateral (sidebar.html) e cuida de toda a interação:
   trocar de tela, validar o checklist, calcular o semáforo,
   preencher a minuta e copiar o texto.

   COMO ESTA ORGANIZADO:
   1. Navegacao entre as 3 telas
   2. Aviso temporario (toast)
   3. TELA 1 - Menu inicial
   4. TELA 2 - Triagem guiada (checklist e validacao)
   5. TELA 3 - Resultado (semáforo, ação e minuta)
   6. Integracao com a pagina aberta (numero do processo)
   ============================================================ */

/* ------------------------------------------------------------
   1) NAVEGACAO ENTRE AS TELAS
   Todas as telas existem ao mesmo tempo no HTML, mas apenas
   uma fica visivel por vez. A tela visivel tem a classe
   .is-active (veja painel.css).
   ------------------------------------------------------------ */

// Seleciona todas as secoes de tela: home, screening e result.
const views = document.querySelectorAll(".view");

/**
 * Mostra uma tela e esconde as outras.
 * @param {string} nome "home" | "screening" | "result"
 */
function showView(nome) {
  // Percorre todas as telas e deixa .is-active apenas na pedida.
  views.forEach((tela) => {
    tela.classList.toggle("is-active", tela.dataset.view === nome);
  });

  // Rola a area de conteudo de volta ao topo ao trocar de tela,
  // evitando que o usuario comece no meio da pagina.
  const corpo = document.querySelector(
    `.view[data-view="${nome}"] .view-body`
  );
  if (corpo) corpo.scrollTop = 0;
}

/* ------------------------------------------------------------
   2) TOAST - aviso temporario na parte de baixo do painel
   ------------------------------------------------------------ */

const toastEl = document.getElementById("toast");
let toastTimer = null; // Identificador do temporizador atual

/**
 * Exibe uma mensagem curta que desaparece após 2,6 segundos.
 * @param {string} mensagem texto exibido ao usuario
 */
function toast(mensagem) {
  toastEl.textContent = mensagem;
  toastEl.classList.add("is-visible"); // CSS torna visivel

  // Limpa o temporizador anterior para nao "atropellar" avisos.
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("is-visible"); // CSS esconde
  }, 2600);
}

/* ------------------------------------------------------------
   3) TELA 1 - MENU INICIAL
   ------------------------------------------------------------ */

// Botao "Iniciar Nova Triagem": limpa a tela 2 e abre ela.
document.getElementById("btnNewScreening").addEventListener("click", () => {
  // Zera todas as marcacoes, pois e uma triagem nova.
  document
    .querySelectorAll('#view-screening input[type="checkbox"]')
    .forEach((caixa) => {
      caixa.checked = false;
    });

  updateProcessButton(); // Desabilita o botao de processar
  showView("screening");
});

// Botao "Consultar Historico": por enquanto apenas avisa que
// ainda nao ha triagens salvas neste dispositivo.
document.getElementById("btnHistory").addEventListener("click", () => {
  toast("Nenhuma triagem registrada neste dispositivo.");
});

// Todos os botoes com data-back (voltar) da tela 2 e da tela 3.
// O valor do atributo diz para qual tela voltar.
document.querySelectorAll("[data-back]").forEach((botao) => {
  botao.addEventListener("click", () => showView(botao.dataset.back));
});

/* ------------------------------------------------------------
   4) TELA 2 - TRIAGEM GUIADA
   ------------------------------------------------------------ */

const btnProcess = document.getElementById("btnProcess");
const formHint = document.getElementById("formHint");

// Todos os checkboxes da triagem (6 no total: 2 por eixo).
const screeningBoxes = document.querySelectorAll(
  '#view-screening input[type="checkbox"]'
);

/**
 * Verifica se o botao "Processar Matriz de Risco" pode ser
 * clicado. Regra: precisa existir ao menos UMA marcacao na
 * triagem inteira (assim os 3 diagnosticos ficam alcancaveis).
 * @returns {boolean} true se pode processar
 */
function updateProcessButton() {
  // .some() devolve true se a condicao for verdadeira para
  // pelo menos um elemento da lista.
  const pronto = [...screeningBoxes].some((caixa) => caixa.checked);

  btnProcess.disabled = !pronto; // Desabilita se nada foi marcado
  formHint.classList.toggle("is-hidden", pronto); // Esconde a dica
  return pronto;
}

/**
 * Confere se o eixo informado tem ao menos um item marcado.
 * @param {string} eixo "geo" | "social" | "ambiental"
 * @returns {boolean}
 */
function eixoMarcado(eixo) {
  return [...document.querySelectorAll(
    `#view-screening input[data-axis="${eixo}"]`
  )].some((caixa) => caixa.checked);
}

/**
 * REGRA DO SEMAFORO (matriz de decisao):
 * - Vermelho: marcou algo no eixo Geotecnico / Vida
 *   (risco a vida exige desocupacao assistida urgente)
 * - Amarelo: sem marcas no geotecnico, mas marcou no Social
 *   (risco mitigavel: suspensao, saneamento ou TAC)
 * - Verde: apenas marcas no Ambiental
 *   (situacao consolidada: permanencia condicionada / ReurbS)
 * @returns {"red" | "amber" | "green"}
 */
function avaliarDiagnostico() {
  if (eixoMarcado("geo")) return "red";
  if (eixoMarcado("social")) return "amber";
  return "green";
}

// Atualiza o botao sempre que o usuario marca ou desmarca.
screeningBoxes.forEach((caixa) => {
  caixa.addEventListener("change", updateProcessButton);
});

// Botao "Processar Matriz de Risco": calcula o semáforo,
// monta a tela de resultado e troca para ela.
btnProcess.addEventListener("click", () => {
  // Protecao extra: se por algum motivo nada estiver marcado,
  // mostramos um aviso em vez de processar.
  if (!updateProcessButton()) {
    toast("Marque ao menos uma condicao identificada nos autos.");
    return;
  }

  montarResultado(avaliarDiagnostico()); // Preenche a tela 3
  showView("result");                    // Exibe a tela 3
});

// Estado inicial: botao comecar desabilitado (nada marcado).
updateProcessButton();

/* ------------------------------------------------------------
   5) TELA 3 - RESULTADO DA MATRIZ (semáforo e minuta)
   ------------------------------------------------------------ */

// Elementos da tela 3 que o JavaScript atualiza dinamicamente.
const minuta = document.getElementById("minuta");
const charCount = document.getElementById("charCount");
const btnCopy = document.getElementById("btnCopy");
const copyLabel = document.getElementById("copyLabel");

const badge = document.getElementById("diagnosisBadge");
const alertIcon = document.getElementById("alertIcon");
const diagTitle = document.getElementById("diagTitle");
const diagSub = document.getElementById("diagSub");
const actionText = document.getElementById("actionText");
const actionPill = document.getElementById("actionPill");

/* --------------------------------------------------------
     5a) TEXTOS DAS MINUTAS
     Cada cor do semáforo tem um modelo (template) proprio de
     minuta. O texto {PROCESSO} e substituido pelo numero real
     no momento de exibir (veja montarResultado).
     -------------------------------------------------------- */

// MINUTA AMARELO - risco mitigavel
const MINUTA_AMARELA = `PROCESSO Nº {PROCESSO}
2ª VARA DA FAZENDA PÚBLICA - COMARCA DE FORTALEZA/CE

Vistos.

1. Trata-se de Ação Civil Pública em que se discute a ocupação de área de preservação permanente (APP) e a supressão de vegetação nativa, com alegado risco à estabilidade da encosta e à incolumidade das pessoas residentes no entorno.

2. A análise técnica realizada mediante o GAMA - Guia de Análise do Meio Ambiente apontou Diagnóstico AMARELO (risco mitigável: suspensão e saneamento / TAC), consubstanciado nos seguintes achados:

   a) risco geotécnico potencializado pelo relevo e pela impermeabilização do solo;
   b) presença de ocupação consolidada com grupos vulneráveis;
   c) APP com capacidade de regeneração natural da vegetação.

3. O referido diagnóstico orienta a atuação do juízo no âmbito da Resolução CNJ nº 345/2020, que institui a Política Nacional de Justiça e Meio Ambiente, e da Resolução CNJ nº 460/2022, que disciplina a atuação do Poder Judiciário na tutela diferenciada do meio ambiente, priorizando medidas restaurativas, o saneamento da área e a solução consensual de conflitos, podendo ser adotado Termo de Ajustamento de Conduta (TAC).

ANTE O EXPOSTO, com fundamento no art. 225 da Constituição Federal, na Lei nº 7.347/1985 e nas Resoluções CNJ nº 345/2020 e nº 460/2022, RESOLVO:

1. SUSPENDER o prosseguimento dos atos exequtórios, até a superação da fase de concertação;

2. ENCAMINHAR as partes ao CEJUSC - Centro Judiciário de Solução de Conflitos e de Mediação, para instauração de procedimento de concertação, no prazo de 180 (cento e oitenta) dias;

3. DETERMINAR a suspensão das atividades na área e o saneamento do local, com possibilidade de celebração de Termo de Ajustamento de Conduta (TAC) junto ao Ministério Público;

4. DETERMINAR a produção de prova pericial técnica específica sobre a estabilidade da encosta e o potencial de regeneração da área;

5. DESIGNAR audiência especial para o 90º (nonagésimo) dia, a fim de avaliar o adimplemento das medidas pactuadas.

Intimem-se.`;

// MINUTA VERMELHO - risco a vida
const MINUTA_VERMELHA = `PROCESSO Nº {PROCESSO}
2ª VARA DA FAZENDA PÚBLICA - COMARCA DE FORTALEZA/CE

Vistos.

1. Trata-se de Ação Civil Pública com pedido de tutela provisória em que se discute a ocupação de área de risco lindeira a curso d'água, com supressão de vegetação nativa e suposto comprometimento da estabilidade da encosta.

2. A análise técnica realizada mediante o GAMA - Guia de Análise do Meio Ambiente apontou Diagnóstico VERMELHO (risco à vida), em razão de marcações no eixo Geotécnico / Vida, quais sejam: risco iminente de desabamento, deslizamento ou inundação e habitações implantadas em área de risco.

3. O risco concreto à incolumidade das pessoas autoriza a adoção de medidas urgentes, incompatíveis com o prosseguimento normal da fase postulatória, nos termos da Resolução CNJ nº 460/2022, que prioriza a proteção da vida e do meio ambiente, e da Resolução CNJ nº 345/2020.

ANTE O EXPOSTO, com fundamento no art. 225 da Constituição Federal, na Lei nº 7.347/1985 e nas Resoluções CNJ nº 345/2020 e nº 460/2022, RESOLVO:

1. DETERMINAR a imediata interdição das edificações expostas a risco, com a cessação de qualquer uso ou permanência nelas;

2. DETERMINAR a desocupação assistida da área, com prioridade absoluta à integridade física dos moradores, mediante apoio da Defensoria Pública, do Ministério Público, da Defesa Civil e dos órgãos de segurança pública;

3. DETERMINAR ao Município que providencie abrigo temporário ou realojamento emergencial das famílias afetadas, sem prejuízo da regularização fundiária posterior;

4. DETERMINAR a produção de prova pericial técnica específica sobre a estabilidade da encosta, a ser produzida no prazo de 30 (trinta) dias;

5. DESIGNAR audiência de urgência no prazo de 15 (quinze) dias, para ciência das partes e das instituições envolvidas.

Intimem-se.`;

// MINUTA VERDE - situacao consolidada
const MINUTA_VERDE = `PROCESSO Nº {PROCESSO}
2ª VARA DA FAZENDA PÚBLICA - COMARCA DE FORTALEZA/CE

Vistos.

1. Trata-se de Ação Civil Pública em que se discute a ocupação de área com vegetação nativa lindeira a curso d'água e a compatibilidade da permanência das famílias com a proteção ambiental do local.

2. A triagem realizada mediante o GAMA - Guia de Análise do Meio Ambiente apontou Diagnóstico VERDE (situação consolidada): ausência de risco iminente à vida e de fatores sociais impeditivos, com marcações restritas ao eixo Ambiental, relativas a área de preservação permanente com potencial de regeneração.

3. A ausência de risco à vida e a ocupação consolidada orientam a solução pela via da regularização, em vez da judicialização do conflito, com fundamento na Resolução CNJ nº 345/2020 e na Resolução CNJ nº 460/2022, que privilegiam a restauração do dano e a afirmação de direitos.

ANTE O EXPOSTO, com fundamento no art. 225 da Constituição Federal, na Lei nº 6.938/1981, na Lei nº 11.445/2007 e nas Resoluções CNJ nº 345/2020 e nº 460/2022, RESOLVO:

1. CONSIDERAR consolidada a situação da ocupação, cuja permanência fica condicionada ao atendimento das condicionantes ambientais a serem fixadas pelo Município;

2. DETERMINAR a regularização fundiária mediante o programa de Regularização Fundiária de Interesse Social (ReurbS), ouvidos os órgãos ambientais estadual e municipal;

3. DETERMINAR a recomposição da vegetação nas áreas exigidas pelo órgão ambiental competente, com plano de recuperação em até 12 (doze) meses;

4. ENCAMINHAR os autos à Secretaria Municipal de Meio Ambiente e de Urbanismo, para emissão das condicionantes e acompanhamento periódico;

5. SEM prejuízo da atuação do Ministério Público, caso verificado o descumprimento das condicionantes fixadas.

Intimem-se.`;

/* --------------------------------------------------------
     5b) ICONE DE CADA DIAGNOSTICO
     SVGs em forma de texto para trocar facilmente o icone:
     triângulo de alerta no vermelho e no amarelo, marca de
     confere no verde.
     -------------------------------------------------------- */
const ICON_TRIANGLE = `<svg viewBox="0 0 24 24" class="ico-lg"><path d="M12 3l10 17H2L12 3z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" class="ico-lg"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.4l2.4 2.4 4.6-5"/></svg>`;

/* --------------------------------------------------------
     5c) CONFIGURACAO DE CADA COR DO SEMAFORO
     Um unico lugar guarda titulo, texto de apoio, acao
     sugerida, etiqueta de prazo, classe do badge, icone e
     modelo de minuta de cada resultado.
     -------------------------------------------------------- */
const DIAGNOSTICOS = {
  // VERMELHO: risco a vida
  red: {
    classeBadge: "alert-badge alert-badge--red",
    icone: ICON_TRIANGLE,
    titulo: "Diagnóstico Vermelho: Desocupação Assistida Urgente",
    subtitulo: "Risco à vida identificado nos autos - prioridade máxima de atuação",
    acao: "Desocupação assistida urgente, com abrigo ou realojamento das famílias",
    etiqueta: "Urgente",
    minuta: MINUTA_VERMELHA,
  },

  // AMARELO: risco mitigavel
  amber: {
    classeBadge: "alert-badge alert-badge--amber",
    icone: ICON_TRIANGLE,
    titulo: "Diagnóstico Amarelo: Suspensão e Concertação",
    subtitulo: "Risco mitigável - suspensão e saneamento / TAC",
    acao: "Suspensão e saneamento da área, com encaminhamento ao CEJUSC",
    etiqueta: "Prazo: 180 dias",
    minuta: MINUTA_AMARELA,
  },

  // VERDE: situacao consolidada
  green: {
    classeBadge: "alert-badge alert-badge--green",
    icone: ICON_CHECK,
    titulo: "Diagnóstico Verde: Permanência Condicionada",
    subtitulo: "Situação consolidada - permanência condicionada / ReurbS",
    acao: "Permanência condicionada, com regularização fundiária (ReurbS)",
    etiqueta: "ReurbS",
    minuta: MINUTA_VERDE,
  },
};

/**
 * Monta toda a TELA 3 conforme o diagnostico recebido.
 * @param {"red"|"amber"|"green"} chave cor do semáforo
 */
function montarResultado(chave) {
  // Busca a configuracao da cor (ou amarelo, se algo falhar).
  const cfg = DIAGNOSTICOS[chave] || DIAGNOSTICOS.amber;

  // Troca a cor do badge (o CSS define cada visual).
  badge.className = cfg.classeBadge;

  // Insere o icone SVG correspondente.
  alertIcon.innerHTML = cfg.icone;

  // Preenche os textos do diagnostico e da acao sugerida.
  diagTitle.textContent = cfg.titulo;
  diagSub.textContent = cfg.subtitulo;
  actionText.textContent = cfg.acao;
  actionPill.textContent = cfg.etiqueta;

  // Monta a minuta trocando {PROCESSO} pelo numero real.
  minuta.value = cfg.minuta.replace("{PROCESSO}", numeroProcessoAtual);

  // Recalcula a contagem de caracteres exibida na barra.
  atualizarContagemDeCaracteres();
}

/**
 * Atualiza o contador "X caracteres" da barra do editor.
 */
function atualizarContagemDeCaracteres() {
  const total = minuta.value.length;
  // toLocaleString("pt-BR") coloca ponto de milhar no numero.
  charCount.textContent = `${total.toLocaleString("pt-BR")} caracteres`;
}

// Sempre que o usuario digitar na minuta, o contador muda.
minuta.addEventListener("input", atualizarContagemDeCaracteres);

// Contagem inicial (a minuta so e preenchida ao processar).
atualizarContagemDeCaracteres();

/* --------------------------------------------------------
     5d) BOTAO "COPIAR MINUTA DE DECISAO"
     -------------------------------------------------------- */
btnCopy.addEventListener("click", async () => {
  const texto = minuta.value;
  let copiou = true;

  try {
    // Metodo moderno e seguro do navegador (Chrome).
    await navigator.clipboard.writeText(texto);
  } catch (erro) {
    // Plano B: caso a Clipboard API esteja indisponivel,
    // selecionamos a caixa de texto e usamos o comando antigo.
    try {
      minuta.focus();
      minuta.select();
      copiou = document.execCommand("copy");
      minuta.setSelectionRange(0, 0); // Desmarca o texto
    } catch (falha) {
      copiou = false;
    }
  }

  // Se nada deu certo, avisamos o usuario para copiar a mao.
  if (!copiou) {
    toast("Não foi possível copiar. Selecione o texto manualmente.");
    return;
  }

  // Sucesso: o botao fica verde e mostra uma confirmacao.
  btnCopy.classList.add("is-success");
  copyLabel.textContent = "Minuta copiada!";
  toast("Minuta de decisão copiada para a área de transferência.");

  // Depois de 2,2 segundos, o botao volta ao normal.
  setTimeout(() => {
    btnCopy.classList.remove("is-success");
    copyLabel.textContent = "Copiar Minuta de Decisão";
  }, 2200);
});

/* ------------------------------------------------------------
   6) INTEGRACAO COM A PAGINA ABERTA (numero do processo)
   O content.js procura o numero de processo na pagina e
   guarda no armazenamento da extensao. Aqui lemos esse valor
   para preencher o chip da tela 2 e as minutas.

   Observacao: fora da extensao (demonstracao online), a
   variavel "chrome" nao existe. Nesses casos usamos um numero
   de exemplo e o painel funciona normalmente.
   ------------------------------------------------------------ */

// Numero usado nos textos. Comeca com o exemplo do prototipo.
let numeroProcessoAtual = "0801234-56.2026.8.06.0001";

/**
 * Troca o numero do processo exibido no chip da tela 2.
 * @param {string} numero formato CNJ, ex: 0801234-56.2026.8.06.0001
 */
function atualizarNumeroProcesso(numero) {
  if (!numero) return;
  numeroProcessoAtual = numero;
  // O chip aparece uma unica vez, no cabecalho da tela 2.
  const chip = document.querySelector(".process-num");
  if (chip) chip.textContent = numero;
}

// Detecta se estamos rodando como extensao instalada.
const TEM_EXTENSAO =
  typeof chrome !== "undefined" &&
  chrome.runtime &&
  chrome.runtime.id;

if (TEM_EXTENSAO) {
  // 6a) Le o ultimo processo encontrado ao abrir o painel.
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get("processo").then((dados) => {
      if (dados && dados.processo && dados.processo.numero) {
        atualizarNumeroProcesso(dados.processo.numero);
      }
    });
  }

  // 6b) Fica ouvindo mensagens enquanto o painel estiver aberto,
  // para atualizar o numero em tempo real.
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((mensagem) => {
      if (mensagem && mensagem.tipo === "PROCESSO_ENCONTRADO") {
        atualizarNumeroProcesso(mensagem.numero);
      }

      // 6b-i) O documento ficticio sugere um item da triagem.
      if (mensagem && mensagem.tipo === "TRIAGEM_SUGERIDA") {
        aplicarSugestao(mensagem.eixo, mensagem.nivel);
      }
    });
  }

  // 6c) Le uma sugestao guardada pelo background ao abrir o painel.
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get("sugestao").then((dados) => {
      if (dados && dados.sugestao && dados.sugestao.eixo) {
        aplicarSugestao(dados.sugestao.eixo, dados.sugestao.nivel);
        // Limpa a sugestao para ela nao reaparecer em aberturas
        // futuras sem novo clique no documento.
        chrome.storage.local.remove("sugestao");
      }
    });
  }
}

/* ------------------------------------------------------------
   7) SUGESTAO DE TRIAGEM VINDA DO DOCUMENTO FICTICIO
   Quando o usuario seleciona um trecho no documento de
   demonstracao e clica na caixinha, o painel recebe o eixo e o
   nivel (1 a 5). Aqui aplicamos essa sugestao:
   - Troca para a TELA 2 (triagem guiada)
   - Marca automaticamente os checkboxes do eixo indicado,
     conforme o nivel (regra na tabela MAPEAMENTO_NIVEL)
   - Destaca o card do eixo e mostra um aviso (toast)

   REGRA DO MAPEAMENTO (nivel -> itens marcados):
   - Nivel 1: nenhum item marcado (risco irrelevante nao gera
     marcacao, mas o card e aberto para conferencia do juiz)
   - Nivel 2 ou 3: apenas o segundo item do eixo (risco leve
     ou moderado)
   - Nivel 4 ou 5: os dois itens do eixo (risco alto ou critico)
   ------------------------------------------------------------ */

// Tabela fixa: cada nivel indica quais caixas do eixo marcar.
// Os numeros sao as POSICOES das caixas dentro do card do eixo
// (comecando em 0). Nivel 1 = lista vazia = nada marcado.
const MAPEAMENTO_NIVEL = {
  1: [],      // Nenhum item
  2: [1],     // Apenas o segundo item do eixo
  3: [1],     // Apenas o segundo item do eixo
  4: [0, 1],  // Os dois itens do eixo
  5: [0, 1],  // Os dois itens do eixo
};

// Rotulos legiveis de cada eixo, usados no aviso (toast).
const ROTULOS_EIXO = {
  geo: "Geotécnico / Vida",
  social: "Social",
  ambiental: "Ambiental",
};

/**
 * Aplica uma sugestao de triagem na TELA 2.
 * @param {string} eixo "geo" | "social" | "ambiental"
 * @param {number|string} nivel de 1 a 5
 */
function aplicarSugestao(eixo, nivel) {
  // Protecao: so aceitamos os 3 eixos conhecidos.
  if (!MAPEAMENTO_NIVEL || !["geo", "social", "ambiental"].includes(eixo)) {
    return;
  }

  // Converte para numero e valida a faixa (1 a 5).
  const nivelNum = Math.min(5, Math.max(1, Number(nivel) || 1));
  const posicoes = MAPEAMENTO_NIVEL[nivelNum];

  // Busca todas as caixas do eixo, na ordem em que aparecem no HTML.
  const caixasDoEixo = [
    ...document.querySelectorAll(`#view-screening input[data-axis="${eixo}"]`),
  ];

  // Primeiro desmarca tudo do eixo (evita marcas de uma sugestao anterior).
  caixasDoEixo.forEach((caixa) => {
    caixa.checked = false;
  });

  // Depois marca as posicoes indicadas pelo nivel.
  posicoes.forEach((posicao) => {
    if (caixasDoEixo[posicao]) caixasDoEixo[posicao].checked = true;
  });

  // Revalida o botao "Processar Matriz de Risco" da tela 2.
  updateProcessButton();

  // Destaca o card do eixo para o usuario ver onde olhar.
  destacaCardDoEixo(eixo);

  // Abre a TELA 2 (triagem guiada) com a sugestao aplicada.
  showView("screening");

  // Avisa o usuario do que foi preenchido automaticamente.
  toast(
    nivelNum === 1
      ? `Sugestão: ${ROTULOS_EIXO[eixo]} com nível 1 (irrelevante). Confira e processe.`
      : `Sugestão aplicada: ${ROTULOS_EIXO[eixo]} nível ${nivelNum}.`
  );
}

/**
 * Aplica a classe de destaque no card do eixo por 2,6 segundos.
 * O CSS do destaque esta em css/triagem.css (.card--destaque).
 * @param {string} eixo "geo" | "social" | "ambiental"
 */
function destacaCardDoEixo(eixo) {
  // A caixa marcada vive dentro do card do eixo. Subindo na
  // arvore com .closest achamos o card correspondente.
  const caixa = document.querySelector(
    `#view-screening input[data-axis="${eixo}"]`
  );
  if (!caixa) return;

  const card = caixa.closest(".card");
  if (!card) return;

  card.classList.add("card--destaque");

  // Remove o destaque depois de um tempo para nao incomodar.
  setTimeout(() => card.classList.remove("card--destaque"), 2600);

  // Leva o card para a area visivel (a tela 2 pode ter rolagem).
  card.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ------------------------------------------------------------
   8) SUGESTAO VIA URL (demonstracao sem extensao instalada)
   Quando a extensao nao esta instalada, a caixinha do documento
   abre este painel em outra aba com os parametros na URL, por
   exemplo: sidebar.html?eixo=geo&nivel=5
   Aqui lemos esses parametros e aplicamos a mesma sugestao.
   ------------------------------------------------------------ */
(() => {
  const parametros = new URLSearchParams(window.location.search);
  const eixo = parametros.get("eixo");
  const nivel = parametros.get("nivel");

  if (eixo && nivel) {
    // Aplica apos a pagina terminar de carregar, garantindo que
    // todos os elementos da tela 2 existam.
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => aplicarSugestao(eixo, nivel),
        { once: true }
      );
    } else {
      aplicarSugestao(eixo, nivel);
    }
  }
})();
