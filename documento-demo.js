/* ============================================================
   ARQUIVO: documento-demo.js
   O QUE ELE FAZ:
   1. Acompanha a selecao de texto feita pelo usuario dentro do
      documento ficticio. O texto e NORMAL: nao ha eixo nem
      nivel marcados nele.
   2. Quando o usuario seleciona qualquer trecho, mostra uma
      caixinha pequena perto da selecao com:
      - o recorte do texto selecionado
      - a pergunta "Qual o eixo deste trecho?"
      - 3 botoes (Geotecnico/Vida, Social, Ambiental) para o
        USUARIO escolher o eixo daquela parte
   3. Ao escolher o eixo, a caixinha envia o trecho e o eixo
      para o painel do GAMA Assistente. O NIVEL de risco (1 a 5)
      NAO e definido aqui: ele fica no painel, onde o usuario
      escolhe e salva a anotacao.

   CAMINHOS DA MENSAGEM (tres situacoes possiveis):
   a) Dentro da demonstracao completa (demonstracao.html):
      envia postMessage para a pagina mae, que repassa para o
      quadro do painel ao lado.
   b) Com a extensao GAMA instalada: dispara o evento
      personalizado gama:abrir, que o content.js captura.
   c) Sozinho, sem extensao: abre sidebar.html em nova aba com
      o eixo e o trecho na URL.
   ============================================================ */

(() => {
  /* ------------------------------------------------------------
     1) TABELAS DE APOIO
     ------------------------------------------------------------ */

  // Nome amigavel de cada eixo (chave = valor dos botoes).
  const NOMES_EIXO = {
    geo: "Eixo Geotécnico / Vida",
    social: "Eixo Social",
    ambiental: "Eixo Ambiental",
  };

  // Tamanho maximo do recorte do texto mostrado na caixinha.
  const LIMITE_RECORTE = 160;

  /* ------------------------------------------------------------
     2) ELEMENTOS DA PAGINA
     ------------------------------------------------------------ */
  const popup = document.getElementById("gamaPopup");
  const popupTrecho = document.getElementById("popupTrecho");

  // Botoes de escolha do eixo (os 3 da caixinha).
  const botoesEixo = popup.querySelectorAll(".eixo-botao");

  // Texto completo do trecho selecionado, guardado no momento
  // da selecao para ser enviado quando o usuario escolher o
  // eixo (a selecao do navegador some ao clicar no botao).
  let textoSelecionado = "";

  /* ------------------------------------------------------------
     3) DETECCAO DO AMBIENTE
     A caixinha pode funcionar em tres situacoes diferentes
     (chamamos cada uma de "caminho", veja a secao 6):

     a) DENTRO DA DEMONSTRACAO COMPLETA: o documento esta
        embutido como iframe na pagina demonstracao.html, ao
        lado do painel.
     b) COM A EXTENSAO INSTALADA: o content script marca a
        pagina com data-gama-extensao="1" no <html>.
     c) SEM EXTENSAO E FORA DA DEMONSTRACAO: abrimos a
        demonstracao do painel em uma nova aba.
     ------------------------------------------------------------ */

  /** true quando o documento esta embutido em outra pagina. */
  function dentroDaDemonstracao() {
    // window.parent e a janela que contem este iframe. Se for
    // diferente da propria janela, estamos dentro de um iframe.
    try {
      return window.parent && window.parent !== window;
    } catch (erro) {
      // Algumas paginas estranhas bloqueiam o acesso a parent.
      return false;
    }
  }

  /** true quando a extensao GAMA esta ativa nesta pagina. */
  function extensaoAtiva() {
    return document.documentElement.dataset.gamaExtensao === "1";
  }

  /* ------------------------------------------------------------
     4) MOSTRAR E ESCONDER A CAIXINHA
     ------------------------------------------------------------ */

  /**
   * Preenche e exibe a caixinha ao lado do texto selecionado.
   * A caixinha mostra o recorte do texto e os 3 botoes de eixo.
   * @param {Range} intervalo selecao feita pelo usuario
   */
  function mostrarPopup(intervalo) {
    // Guarda o texto COMPLETO do trecho: a selecao do
    // navegador sera perdida quando o usuario clicar no
    // botao da caixinha, entao precisamos manter uma copia.
    textoSelecionado = intervalo.toString().trim();

    // Mostra apenas um recorte na caixinha (2 linhas).
    // O texto completo sera enviado no clique do eixo.
    let recorte = textoSelecionado;
    if (recorte.length > LIMITE_RECORTE) {
      recorte = recorte.slice(0, LIMITE_RECORTE) + "...";
    }
    popupTrecho.textContent = recorte;

    // Posiciona a caixinha perto da ponta final da selecao.
    // getBoundingClientRect devolve a posicao em relacao a janela.
    const retangulo = intervalo.getBoundingClientRect();
    const larguraPopup = 276;

    // Converte a posicao da janela para posicao absoluta na
    // pagina somando o deslocamento da rolagem (window.scrollX/Y).
    let esquerda = retangulo.right + window.scrollX - larguraPopup;
    let topo = retangulo.bottom + window.scrollY + 8;

    // Evita que a caixinha saia pela borda esquerda da tela.
    if (esquerda < 12) esquerda = 12;

    popup.style.left = esquerda + "px";
    popup.style.top = topo + "px";

    // Mostra com a animacao suave (classe add apos um frame).
    popup.hidden = false;
    requestAnimationFrame(() => popup.classList.add("is-visivel"));
  }

  /** Esconde a caixinha e limpa o texto guardado. */
  function esconderPopup() {
    popup.classList.remove("is-visivel");
    popup.hidden = true;
    textoSelecionado = "";
  }

  /* ------------------------------------------------------------
     5) O QUE ACONTECE AO SELECIONAR TEXTO
     O evento "selectionchange" dispara a cada arrasto do mouse
     (ou selecao pelo teclado). Usamos um pequeno atraso para
     esperar a selecao terminar antes de mostrar a caixinha.

     ATENCAO: o texto e NORMAL. Qualquer trecho selecionado
     abre a caixinha (nao ha marcacao pré-definida de eixo).
     ------------------------------------------------------------ */
  let temporizadorSelecao = null;

  document.addEventListener("selectionchange", () => {
    // Limpa o agendamento anterior para nao piscar a caixinha.
    clearTimeout(temporizadorSelecao);

    temporizadorSelecao = setTimeout(() => {
      const selecao = window.getSelection();

      // Sem texto selecionado (clique simples): some a caixinha.
      if (!selecao || selecao.isCollapsed || selecao.rangeCount === 0) {
        esconderPopup();
        return;
      }

      const texto = selecao.toString().trim();

      // Selecao vazia ou so espacos: nada a mostrar.
      if (!texto) {
        esconderPopup();
        return;
      }

      mostrarPopup(selecao.getRangeAt(0));
    }, 220); // 220 ms: tempo suficiente para o usuario soltar o mouse
  });

  /* ------------------------------------------------------------
     6) ESCOLHA DO EIXO PELO USUARIO
     Quando o usuario clica em um dos 3 botoes da caixinha,
     enviamos o trecho e o eixo escolhido para o painel. O
     nivel de risco NAO vai nesta mensagem: ele sera definido
     pelo usuario dentro do proprio painel.
     ------------------------------------------------------------ */
  botoesEixo.forEach((botao) => {
    botao.addEventListener("click", () => {
      const eixo = botao.dataset.eixo; // "geo", "social" ou "ambiental"
      const texto = textoSelecionado;

      // Protecao: sem texto guardado nao ha o que enviar.
      if (!texto) {
        esconderPopup();
        return;
      }

      if (dentroDaDemonstracao()) {
        /* --- Caminho A: demonstracao completa ---
           Enviamos para a pagina mae (demonstracao.html), que
           repassa para o quadro do painel ao lado. */
        window.parent.postMessage(
          {
            tipo: "GAMA_DEMO_ANOTACAO",
            eixo,
            texto,
          },
          "*" // Destino: a propria pagina que nos contem
        );
        esconderPopup();
      } else if (extensaoAtiva()) {
        /* --- Caminho B: extensao instalada ---
           Disparamos um evento personalizado na pagina. O
           content script ouve "gama:abrir" e encaminha para o
           painel lateral (side panel) da extensao. */
        document.dispatchEvent(
          new CustomEvent("gama:abrir", {
            detail: { eixo, texto },
          })
        );
        esconderPopup();
      } else {
        /* --- Caminho C: sem extensao e sem demonstracao ---
           Abrimos o painel em nova aba, levando o eixo e um
           recorte do trecho na URL (o trecho e cortado para a
           URL nao ficar grande demais). */
        const recorteURL = texto.slice(0, 200);
        window.open(
          "Hackathon_TJCE_GAMA/Assistent/sidebar.html" +
            "?eixo=" + encodeURIComponent(eixo) +
            "&trecho=" + encodeURIComponent(recorteURL),
          "_blank"
        );
        esconderPopup();
      }
    });
  });

  /* ------------------------------------------------------------
     7) FECHAR A CAIXINHA EM OUTRAS INTERACOES
     ------------------------------------------------------------ */

  // Clique fora da caixinha: esconde. O clique nos botoes de
  // eixo ja foi tratado acima; mousedown neles nao fecha a
  // caixinha antes do click, porque checamos .contains().
  document.addEventListener("mousedown", (evento) => {
    if (!popup.contains(evento.target)) esconderPopup();
  });

  // Rolagem da pagina: a caixinha ficaria desalinhada, entao some.
  window.addEventListener("scroll", esconderPopup, { passive: true });

  // Tecla Escape: forma classica de fechar qualquer caixinha.
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") esconderPopup();
  });

  /* ------------------------------------------------------------
     8) AJUSTES PARA CADA AMBIENTE
     Dentro do palco da demonstracao (demonstracao.html), a
     barra de instrucao propria do documento e o aviso de
     "extensao nao detectada" nao fazem sentido: a pagina mae
     ja tem a barra de orientacao e o painel esta logo ao
     lado. Escondemos os dois nesse caso.
     ------------------------------------------------------------ */
  if (dentroDaDemonstracao()) {
    // Esconde a barra de instrucao do proprio documento.
    const barra = document.querySelector(".barra-demo");
    if (barra) barra.hidden = true;

    // Nao mostra o aviso de extensao ausente: o painel ao
    // lado cumpre a funcao dele nesta modalidade.
    return;
  }

  // Fora do palco: avisamos uma unica vez, para o jurado da
  // demonstracao saber por que o clique abre uma aba nova em
  // vez do painel lateral.
  if (!extensaoAtiva()) {
    const aviso = document.createElement("div");
    aviso.className = "gama-aviso";
    aviso.innerHTML =
      "<strong>GAMA Assistente não detectado.</strong> " +
      "Sem a extensão instalada, escolher o eixo na caixinha " +
      "abre a demonstração do painel em uma nova aba. Com a " +
      "extensão ativa, a anotação vai direto para o painel.";
    document.body.appendChild(aviso);

    // O aviso some sozinho depois de 8 segundos.
    setTimeout(() => aviso.remove(), 8000);
  }
})();
