/* ============================================================
   ARQUIVO: demonstracao.js
   O QUE ELE FAZ:
   Faz o papel de "central de mensagens" entre os dois quadros
   da pagina de demonstracao completa:

   [documento ficticio] --postMessage--> [esta pagina] --postMessage--> [painel]

   Por que passa por esta pagina e nao direto? Porque cada iframe
   so consegue enviar mensagem para a janela que o contem (o
   "pai"). Como os dois quadros sao irmaos, a pagina mãe e quem
   recebe a mensagem de um quadro e repassa para o outro.

   FLUXO COMPLETO:
   1. Usuario seleciona um trecho do documento e escolhe o
      eixo na caixinha (a escolha e do usuario).
   2. O documento envia { tipo: "GAMA_DEMO_ANOTACAO", eixo, texto }.
   3. Aqui recebemos e reenviamos para o quadro do painel como
      { tipo: "ANOTACAO_RECEBIDA", eixo, texto }.
   4. O painel (sidebar.js) abre a caixa de anotacao, onde o
      usuario escolhe o NIVEL de risco (1 a 5) e salva.
   ============================================================ */

(() => {
  /* ------------------------------------------------------------
     1) ELEMENTOS DA PAGINA
     Os dois quadros (iframes) da demonstracao completa.
     ------------------------------------------------------------ */
  const quadroDocumento = document.querySelector(".palco-documento");
  const quadroPainel = document.querySelector(".palco-painel iframe");

  // Protecao: se a pagina mudar de estrutura, nao quebramos.
  if (!quadroDocumento || !quadroPainel) return;

  /* ------------------------------------------------------------
     2) RECEPTOR DE MENSAGENS VINDAS DOS QUADROS
     O evento "message" dispara quando qualquer iframe (ou aba)
     envia uma mensagem com window.parent.postMessage(...).
     ------------------------------------------------------------ */
  window.addEventListener("message", (evento) => {
    // Origem: em demonstracao local (localhost) e no GitHub
    // Pages a origem e a propria pagina, entao aceitamos a
    // mensagem vinda de qualquer origem NESTA pagina de demo.
    const dados = interesse(evento);

    // Interessa apenas o tipo de mensagem da demonstracao.
    if (!dados || dados.tipo !== "GAMA_DEMO_ANOTACAO") return;

    // Confere se a mensagem veio do quadro do documento
    // (event.source e o objeto window que enviou a mensagem).
    if (evento.source !== quadroDocumento.contentWindow) return;

    // Repassa para o quadro do painel no formato que o
    // sidebar.js entende (ANOTACAO_RECEBIDA). O nivel NAO vai:
    // ele sera escolhido pelo usuario dentro do painel.
    quadroPainel.contentWindow.postMessage(
      {
        tipo: "ANOTACAO_RECEBIDA",
        eixo: dados.eixo,   // "geo" | "social" | "ambiental"
        texto: dados.texto, // Trecho completo selecionado
      },
      "*" // Destino aberto: os quadros sao da propria pagina
    );
  });

  /**
   * Extrai os dados validos de uma mensagem recebida.
   * Evita que scripts de outras abas interfiram na demo.
   * @param {MessageEvent} evento mensagem recebida
   * @returns {object|null} dados da mensagem ou null
   */
  function interesse(evento) {
    // Mensagem sem dados uteis (algumas extensoes enviam vazias).
    if (!evento || !evento.data || typeof evento.data !== "object") {
      return null;
    }
    return evento.data;
  }

  /* ------------------------------------------------------------
     3) MARCA O PAINEL COMO PRONTO
     Assim que o iframe do painel termina de carregar,
     marcamos a pagina. Pode ser usado para ajustes visuais
     (por exemplo, esconder um "carregando" inicial).
     ------------------------------------------------------------ */
  quadroPainel.addEventListener("load", () => {
    document.documentElement.setAttribute("data-painel-pronto", "1");
  });
})();
