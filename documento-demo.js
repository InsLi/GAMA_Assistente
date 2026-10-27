/* ============================================================
   ARQUIVO: documento-demo.js
   O QUE ELE FAZ:
   1. Acompanha a selecao de texto feita pelo usuario dentro do
      documento ficticio.
   2. Quando o trecho selecionado esta marcado com um eixo
      (atributo data-eixo), mostra uma caixinha pequena perto da
      selecao com: nome do eixo, nivel (1 a 5) e um exemplo
      resumido daquele nivel.
   3. Ao clicar na caixinha, o fluxo segue por dois caminhos:
      a) A extensao GAMA esta instalada: a caixinha dispara um
         evento personalizado (gama:abrir) que o content script
         (content.js) captura e encaminha para o painel lateral,
         marcando o item da triagem correspondente ao eixo.
      b) A extensao NAO esta instalada: a caixinha abre o
         arquivo sidebar.html em uma nova aba, levando o eixo e o
         nivel na URL (parametros ?eixo=...&nivel=...).
   ============================================================ */

(() => {
  /* ------------------------------------------------------------
     1) TABELAS DE APOIO
     ------------------------------------------------------------ */

  // Nome amigavel de cada eixo (chave = valor de data-eixo).
  const NOMES_EIXO = {
    geo: "Eixo Geotécnico / Vida",
    social: "Eixo Social",
    ambiental: "Eixo Ambiental",
  };

  // Classe CSS da bolinha colorida de cada eixo (veja documento-demo.css).
  const CORES_EIXO = {
    geo: "ponto ponto--geo",
    social: "ponto ponto--social",
    ambiental: "ponto ponto--ambiental",
  };

  // Nome curto do nivel, de 1 a 5 (usado na etiqueta da caixinha).
  const NOMES_NIVEL = {
    1: "Nível 1 - irrelevante",
    2: "Nível 2 - baixo",
    3: "Nível 3 - moderado",
    4: "Nível 4 - alto",
    5: "Nível 5 - crítico",
  };

  // Cor de fundo da etiqueta do nivel, na mesma escala da legenda.
  const CORES_NIVEL = {
    1: "#94a3b8",
    2: "#64a56b",
    3: "#f3b81d",
    4: "#ea8c1c",
    5: "#dc2626",
  };

  // Exemplo resumido de cada nivel dentro de cada eixo.
  // E o "pequeno exemplo ao lado do texto" pedido na demonstracao.
  const EXEMPLOS = {
    geo: {
      1: "Terreno plano e solos compactos, sem sinais de instabilidade.",
      2: "Erosão superficial leve em talude de via, sem risco estrutural.",
      3: "Declividade de 30 a 45 graus, com trinca e escorrimento na chuva.",
      4: "Fissuras em alvenaria e possibilidade de desabamento parcial.",
      5: "Falésia sem contenção e risco iminente de deslizamento sobre 42 famílias.",
    },
    social: {
      1: "Ocupação recente e sem famílias em vulnerabilidade declarada.",
      2: "Renda per capita baixa e cadastro ativo no CadÚnico.",
      3: "Idosos e crianças no local, com ocupação acima de cinco anos.",
      4: "Pessoas com deficiência, famílias monoparentais e litígio pela posse.",
      5: "Famílias recém-realocadas da rua, sem documentação e com conflito armado pela área.",
    },
    ambiental: {
      1: "Área fora de APP, com jardim e espécies exóticas.",
      2: "Canteiros com espécies exóticas e descarte eventual de entulho.",
      3: "Mata secundária e APP de curso d'água regenerando-se em 30%.",
      4: "APP com 60% suprimida e nascente exposta, com regeneração em dois anos.",
      5: "Supressão total da vegetação em APP de nascente e efluentes no curso d'água.",
    },
  };

  /* ------------------------------------------------------------
     2) ELEMENTOS DA PAGINA
     ------------------------------------------------------------ */
  const popup = document.getElementById("gamaPopup");
  const popupPonto = document.getElementById("popupPonto");
  const popupEixo = document.getElementById("popupEixo");
  const popupNivel = document.getElementById("popupNivel");
  const popupExemplo = document.getElementById("popupExemplo");

  // Elemento marcado que esta sendo exibido na caixinha no momento.
  let trechoAtivo = null;

  /* ------------------------------------------------------------
     3) DETECCAO DO AMBIENTE
     A caixinha pode funcionar em tres situacoes diferentes.
     Chamamos cada uma de "caminho" (veja a secao 6):

     a) DENTRO DA DEMONSTRACAO COMPLETA: o documento esta
        embutido como iframe na pagina demonstracao.html, ao
        lado do painel. Nesse caso enviamos uma mensagem para
        a pagina mae, que repassa para o painel.
     b) COM A EXTENSAO INSTALADA: o content script da extensao
        marca a pagina com data-gama-extensao="1" no <html>.
        Disparamos o evento personalizado gama:abrir.
     c) SEM EXTENSAO E FORA DA DEMONSTRACAO: abrimos a
        demonstracao do painel em uma nova aba, com o eixo e o
        nivel na URL.
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
   * @param {HTMLElement} trecho elemento com data-eixo e data-nivel
   * @param {Range} intervalo selecao feita pelo usuario
   */
  function mostrarPopup(trecho, intervalo) {
    const eixo = trecho.dataset.eixo;       // "geo", "social" ou "ambiental"
    const nivel = Number(trecho.dataset.nivel); // 1 a 5

    // Guarda o trecho atual para o clique da caixinha saber o que abrir.
    trechoAtivo = trecho;

    // Preenche os textos da caixinha.
    popupPonto.className = CORES_EIXO[eixo] || "ponto";
    popupEixo.textContent = NOMES_EIXO[eixo] || "Eixo";
    popupNivel.textContent = NOMES_NIVEL[nivel] || "Nível";
    popupNivel.style.background = CORES_NIVEL[nivel] || "#f4f7fa";
    popupNivel.style.color = nivel >= 3 ? "#ffffff" : "#334155";
    popupExemplo.textContent = EXEMPLOS[eixo]
      ? EXEMPLOS[eixo][nivel]
      : "";

    // Posiciona a caixinha perto da ponta final da selecao.
    // getBoundingClientRect devolve a posicao em relacao a janela.
    const retangulo = intervalo.getBoundingClientRect();
    const larguraPopup = 268;

    // Converte a posicao da janela para posicao absoluta na pagina
    // somando o deslocamento da rolagem (window.scrollX/Y).
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

  /** Esconde a caixinha e limpa o destaque do trecho. */
  function esconderPopup() {
    popup.classList.remove("is-visivel");
    popup.hidden = true;
    if (trechoAtivo) trechoAtivo.classList.remove("trecho--ativo");
    trechoAtivo = null;
  }

  /* ------------------------------------------------------------
     5) O QUE ACONTECE AO SELECIONAR TEXTO
     O evento "selectionchange" dispara a cada arrasto do mouse
     (ou selecao pelo teclado). Usamos um pequeno atraso para
     esperar a selecao terminar antes de mostrar a caixinha.
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

      // Procura o elemento marcado que contem a selecao.
      // anchorNode e o ponto inicial do que foi selecionado.
      let no = selecao.anchorNode;
      if (no && no.nodeType === Node.TEXT_NODE) no = no.parentNode;
      const trecho = no && no.closest ? no.closest("[data-eixo]") : null;

      // Selecao fora dos trechos marcados: nada a mostrar.
      if (!trecho) {
        esconderPopup();
        return;
      }

      mostrarPopup(trecho, selecao.getRangeAt(0));
    }, 220); // 220 ms: tempo suficiente para o usuario soltar o mouse
  });

  /* ------------------------------------------------------------
     6) CLIQUE NA CAIXINHA
     Aqui acontece a ponte entre o documento e o painel. O
     caminho e escolhido conforme o ambiente detectado na
     secao 3 (demonstracao, extensao ou aba nova).
     ------------------------------------------------------------ */
  popup.addEventListener("click", () => {
    if (!trechoAtivo) return;

    const eixo = trechoAtivo.dataset.eixo;
    const nivel = Number(trechoAtivo.dataset.nivel);

    // Destaca o trecho escolhido para o usuario ver o que levou.
    trechoAtivo.classList.add("trecho--ativo");

    if (dentroDaDemonstracao()) {
      /* --- Caminho A: demonstracao completa (demonstracao.html) ---
         Enviamos a mensagem para a pagina mae, que repassa para
         o quadro do painel ao lado. A mensagem usa o tipo
         GAMA_DEMO_SUGESTAO (formato interno da demonstracao);
         a pagina mae converte para TRIAGEM_SUGERIDA. */
      window.parent.postMessage(
        {
          tipo: "GAMA_DEMO_SUGESTAO",
          eixo,
          nivel,
        },
        "*" // Destino: a propria pagina que nos contem
      );
      esconderPopup();
    } else if (extensaoAtiva()) {
      /* --- Caminho B: extensao instalada ---
         Disparamos um evento personalizado na propria pagina.
         O content script (content.js) ouve "gama:abrir" e
         envia a mensagem TRIAGEM_SUGERIDA para o painel. */
      document.dispatchEvent(
        new CustomEvent("gama:abrir", {
          detail: { eixo, nivel },
        })
      );
      esconderPopup();
    } else {
      /* --- Caminho C: sem extensao e sem demonstracao ---
         Abrimos o arquivo da interface em uma nova aba, levando
         eixo e nivel na URL. O sidebar.js le esses parametros
         e aplica a mesma sugestao. */
      window.open(
        "Hackathon_TJCE_GAMA/Assistent/sidebar.html" +
          "?eixo=" + encodeURIComponent(eixo) +
          "&nivel=" + nivel,
        "_blank"
      );
      esconderPopup();
    }
  });

  /* ------------------------------------------------------------
     7) FECHAR A CAIXINHA EM OUTRAS INTERACOES
     ------------------------------------------------------------ */

  // Clique fora da caixinha: esconde (mas o proprio clique na
  // caixinha ja foi tratado acima e o evento para aqui antes).
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
      "Sem a extensão instalada, clicar na caixinha abre a " +
      "demonstração do painel em uma nova aba. Com a extensão " +
      "ativa, o item da triagem é marcado automaticamente.";
    document.body.appendChild(aviso);

    // O aviso some sozinho depois de 8 segundos.
    setTimeout(() => aviso.remove(), 8000);
  }
})();
