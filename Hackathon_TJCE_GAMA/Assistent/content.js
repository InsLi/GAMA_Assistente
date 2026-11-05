/* ============================================================
   ARQUIVO: content.js
   TIPO DE ARQUIVO: content script (script de conteudo)

   O QUE E:
   E um script que o Chrome executa DENTRO das paginas que o
   usuario visita. Ele enxerga o conteudo da pagina (texto,
   links, botoes) mas nao tem acesso direto aos recursos da
   extensao. Para falar com a extensao ele usa mensagens
   (chrome.runtime.sendMessage).

   O QUE ELE FAZ:
   1. Procura o numero de um processo judicial na pagina
      (formato padrao do CNJ, ex: 0801234-56.2026.8.06.0001).
   2. Quando encontra, guarda o numero no armazenamento local
      da extensao para o painel lateral usar.
   3. Mostra um botao discreto "GAMA" no canto inferior
      direito da pagina.
   4. Quando o usuario SELECIONA um trecho de texto em
      QUALQUER pagina, mostra uma caixinha perguntando o EIXO
      daquele trecho. Ao escolher, envia o trecho para o
      painel, onde o usuario define o nivel de risco (1 a 5)
      e salva a anotacao.
   5. Ponte com o documento ficticio da demonstracao, que tem
      a propria caixinha na pagina (mesmo envio, outro caminho).

   IMPORTANTE:
   Este arquivo roda em todas as paginas (declarado no
   manifest.json). Na pagina do proprio painel (sidebar.html,
   quando embutido na demonstracao) ele se desliga para nao
   duplicar interface.
   ============================================================ */

// IIFE: funcao executada imediatamente para nao poluir o
// escopo global da pagina visitada.
(() => {
  /* --------------------------------------------------------
     1) CONFIGURACOES DO SCRIPT
     -------------------------------------------------------- */

  // Expressao regular que reconhece o numero de processo no
  // formato oficial do Conselho Nacional de Justica (CNJ):
  // 7 digitos + hifen + 2 digitos + ponto + 4 digitos (ano) +
  // ponto + 1 ou 2 digitos (vara) + ponto + 2 digitos (comarca)
  // + ponto + 4 digitos (sequencial).
  const PADRAO_NUMERO_PROCESSO =
    /\b\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4}\b/;

  // ID do botao flutuante. Usado para evitar criar dois.
  const ID_BOTAO = "gama-botao-flutuante";

  // ID da caixinha de selecao de texto (secao 5).
  const ID_CAIXA = "gama-caixa-selecao";

  // Cores institucionais de cada eixo (mesmas do painel).
  const CORES_EIXO = {
    geo: "#dc2626",       // Vermelho: vida
    social: "#002e63",    // Azul marinho: social
    ambiental: "#1e824c", // Verde: ambiental
  };

  // Nome amigavel de cada eixo (para o rotulo e o toast).
  const ROTULOS_EIXO = {
    geo: "Geotécnico / Vida",
    social: "Social",
    ambiental: "Ambiental",
  };

  // Verifica se estamos rodando dentro da extensao instalada.
  // Fora da extensao (uma pagina comum aberta isoladamente),
  // a variavel "chrome" nao existe ou nao tem runtime.
  const TEM_EXTENSAO =
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.id;

  // Numero do processo encontrado na pagina (guardado para a
  // anotacao sair identificada no painel, quando houver).
  let numeroProcessoAtual = null;

  /* --------------------------------------------------------
     2) BUSCA DO NUMERO DE PROCESSO NA PAGINA
     -------------------------------------------------------- */

  /**
   * Procura o primeiro numero de processo no texto visivel
   * da pagina.
   * @returns {string|null} o numero encontrado ou null
   */
  function buscarNumeroNaPagina() {
    // textContent e mais rapido e seguro que innerHTML porque
    // nao interpreta HTML (evita ler tags e scripts).
    const texto = document.body ? document.body.textContent || "" : "";
    const encontrado = texto.match(PADRAO_NUMERO_PROCESSO);
    return encontrado ? encontrado[0] : null;
  }

  /* --------------------------------------------------------
     3) COMUNICACAO COM A EXTENSAO
     -------------------------------------------------------- */

  /**
   * Envia uma mensagem para os outros arquivos da extensao
   * (background.js e sidebar.js).
   * @param {object} mensagem objeto livre com o campo "tipo"
   */
  function enviarParaExtensao(mensagem) {
    if (!TEM_EXTENSAO) return; // Sem extensao, nada a fazer

    // sendMessage devolve uma Promise. Tratamos o erro para o
    // console nao acusar falha quando a extensao e recarregada.
    chrome.runtime.sendMessage(mensagem).catch(() => {
      // Silencioso de proposito: e comum falhar quando o
      // usuario esta atualizando a extensao.
    });
  }

  /* --------------------------------------------------------
     4) BOTAO DISCRETO NA PAGINA
     -------------------------------------------------------- */

  /**
   * Cria (ou atualiza) o botao GAMA no canto da pagina.
   * @param {string} numero numero de processo encontrado
   */
  function mostrarBotao(numero) {
    // Se ja existe um botao, nao criamos outro.
    if (document.getElementById(ID_BOTAO)) return;

    // Cria o elemento botao com JavaScript puro.
    const botao = document.createElement("button");
    botao.id = ID_BOTAO;
    botao.type = "button";

    // Texto e marca visual (bolinha verde) do botao.
    const ponto = document.createElement("span");
    ponto.className = "gama-botao-ponto"; // Estilizado em conteudo.css

    const rotulo = document.createElement("span");
    rotulo.textContent = "GAMA";

    botao.appendChild(ponto);
    botao.appendChild(rotulo);

    // Acessibilidade: quem usa leitor de tela entende o botao.
    botao.setAttribute(
      "aria-label",
      "Abrir o GAMA Assistente para o processo " + numero
    );

    // Aparencia discreta: botao esconde ao passar o mouse.
    botao.title = "Analisar este processo com o GAMA Assistente";

    // Clique = pedido para abrir o painel lateral.
    botao.addEventListener("click", () => {
      enviarParaExtensao({ tipo: "ABRIR_PAINEL", numero });
    });

    document.body.appendChild(botao);
  }

  /* --------------------------------------------------------
     5) CAIXINHA DE SELECAO DE TEXTO (qualquer pagina)
     Quando o usuario arrasta o mouse e seleciona um trecho
     em QUALQUER pagina visitada, aparece uma caixinha com:
     - o recorte do texto selecionado
     - a pergunta "Qual o eixo deste trecho?"
     - 3 botoes (Geotecnico/Vida, Social, Ambiental)

     Ao escolher o eixo, o trecho vai para o painel da
     extensao, onde o usuario define o NIVEL de risco (1 a 5)
     e salva a anotacao. O nivel NUNCA e escolhido aqui.

     ATENCAO: na pagina do documento ficticio da demonstracao
     existe a caixinha propria dele (#gamaPopup). Nesse caso
     esta caixinha nao aparece, para nao duplicar interface.
     -------------------------------------------------------- */

  // Elemento da caixinha (criado sob demanda).
  let caixa = null;

  // Texto COMPLETO do trecho selecionado, guardado no momento
  // da selecao: a selecao do navegador some ao clicar no
  // botao da caixinha, entao precisamos de uma copia.
  let textoSelecionado = "";

  // Atraso para mostrar a caixinha so quando o usuario soltar
  // o mouse (mesma logica da demonstracao: 220 ms).
  let temporizadorSelecao = null;

  /**
   * Monta a caixinha de selecao uma unica vez.
   * @returns {HTMLElement} o elemento da caixinha
   */
  function criarCaixa() {
    const elemento = document.createElement("div");
    elemento.id = ID_CAIXA;
    elemento.setAttribute("role", "dialog");
    elemento.setAttribute("aria-label", "Definir o eixo do trecho");

    // Recorte do texto (preenchido na selecao).
    const recorte = document.createElement("p");
    recorte.className = "gama-caixa-trecho";
    recorte.id = "gamaCaixaTrecho";
    elemento.appendChild(recorte);

    // Pergunta que orienta a escolha.
    const pergunta = document.createElement("p");
    pergunta.className = "gama-caixa-pergunta";
    pergunta.textContent = "Qual o eixo deste trecho?";
    elemento.appendChild(pergunta);

    // Lista com os 3 botoes de eixo.
    const lista = document.createElement("div");
    lista.className = "gama-caixa-eixos";

    ["geo", "social", "ambiental"].forEach((eixo) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "gama-caixa-botao";
      botao.dataset.eixo = eixo;

      // Bolinha colorida que identifica o eixo.
      const ponto = document.createElement("i");
      ponto.className = "gama-caixa-ponto";
      ponto.style.background = CORES_EIXO[eixo];

      const texto = document.createElement("span");
      texto.textContent = ROTULOS_EIXO[eixo];

      botao.appendChild(ponto);
      botao.appendChild(texto);

      // Clique no eixo = envia o trecho para o painel.
      botao.addEventListener("click", () => enviarAnotacao(eixo));

      lista.appendChild(botao);
    });

    elemento.appendChild(lista);

    // Rodape: orienta o proximo passo (nivel no painel).
    const rodape = document.createElement("span");
    rodape.className = "gama-caixa-rodape";
    rodape.textContent = "O nível será definido no painel";
    elemento.appendChild(rodape);

    document.body.appendChild(elemento);
    return elemento;
  }

  /**
   * Envia o trecho selecionado + eixo escolhido para a
   * extensao. O nivel (1 a 5) e definido no painel.
   * @param {string} eixo "geo" | "social" | "ambiental"
   */
  function enviarAnotacao(eixo) {
    const texto = textoSelecionado;

    // Protecao: sem texto guardado nao ha o que enviar.
    if (!texto) {
      esconderCaixa();
      return;
    }

    // Mensagem unica: o background guarda o trecho e ja pede
    // a abertura do painel (com reserva em aba nova se o
    // painel lateral nao puder abrir sozinho).
    enviarParaExtensao({
      tipo: "ANOTACAO_RECEBIDA",
      eixo,
      texto,
      numero: numeroProcessoAtual,
    });

    // Aviso na propria pagina: o usuario sabe que o trecho
    // foi enviado, mesmo se o painel demorar a aparecer.
    mostrarAvisoEnvio(ROTULOS_EIXO[eixo]);

    esconderCaixa();
  }

  /**
   * Preenche e exibe a caixinha ao lado do texto selecionado.
   * @param {Range} intervalo selecao feita pelo usuario
   */
  function mostrarCaixa(intervalo) {
    if (!caixa) caixa = criarCaixa();

    // Guarda o texto COMPLETO do trecho selecionado.
    textoSelecionado = intervalo.toString().trim();

    // Mostra apenas um recorte na caixinha (2 linhas).
    const LIMITE = 160;
    let recorte = textoSelecionado;
    if (recorte.length > LIMITE) recorte = recorte.slice(0, LIMITE) + "...";
    document.getElementById("gamaCaixaTrecho").textContent = recorte;

    // Posiciona a caixinha perto da ponta final da selecao.
    const retangulo = intervalo.getBoundingClientRect();
    const largura = 276;
    let esquerda = retangulo.right + window.scrollX - largura;
    let topo = retangulo.bottom + window.scrollY + 8;

    // Evita que a caixinha saia pela borda esquerda da tela.
    if (esquerda < 12) esquerda = 12;

    caixa.style.left = esquerda + "px";
    caixa.style.top = topo + "px";
    caixa.hidden = false;
    // Animacao suave de entrada (a classe e aplicada em um
    // frame depois, para a transicao acontecer de verdade).
    requestAnimationFrame(() => caixa.classList.add("is-visivel"));
  }

  /** Esconde a caixinha e limpa o texto guardado. */
  function esconderCaixa() {
    if (!caixa) return;
    caixa.classList.remove("is-visivel");
    caixa.hidden = true;
    textoSelecionado = "";
  }

  /**
   * Aviso curto mostrado na propria pagina apos enviar o
   * trecho, para o usuario nao ficar sem resposta visual.
   * @param {string} nomeEixo nome amigavel do eixo escolhido
   */
  function mostrarAvisoEnvio(nomeEixo) {
    // Reaproveita o aviso se ele ja existir na pagina.
    let aviso = document.getElementById("gama-aviso-envio");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "gama-aviso-envio";
      aviso.setAttribute("role", "status");
      document.body.appendChild(aviso);
    }

    aviso.textContent =
      "Trecho enviado ao GAMA: eixo " + nomeEixo + ". Abrindo o painel...";

    // Fica visivel por 4 segundos.
    aviso.classList.add("is-visivel");
    clearTimeout(aviso._tempo);
    aviso._tempo = setTimeout(() => {
      aviso.classList.remove("is-visivel");
    }, 4000);
  }

  /**
   * true quando a pagina tem a caixinha propria do documento
   * ficticio (demonstracao). Nesse caso nao duplicamos.
   */
  function paginaTemCaixaPropria() {
    return !!document.getElementById("gamaPopup");
  }

  /**
   * true quando esta pagina e o proprio painel lateral do
   * GAMA (sidebar.html embutido na demonstracao). Nesse caso
   * o script se desliga por completo.
   */
  function paginaEPainelGama() {
    // O painel sempre tem a tela inicial com este marcador.
    return !!document.getElementById("view-home");
  }

  // Ouve a selecao de texto em QUALQUER pagina visitada.
  document.addEventListener("selectionchange", () => {
    // Na demonstracao, a caixinha e do proprio documento.
    if (paginaTemCaixaPropria()) return;

    // No proprio painel do GAMA, nunca interferimos.
    if (paginaEPainelGama()) return;

    // Limpa o agendamento anterior para nao piscar a caixinha.
    clearTimeout(temporizadorSelecao);

    temporizadorSelecao = setTimeout(() => {
      const selecao = window.getSelection();

      // Sem texto selecionado (clique simples): some a caixinha.
      if (!selecao || selecao.isCollapsed || selecao.rangeCount === 0) {
        esconderCaixa();
        return;
      }

      const texto = selecao.toString().trim();

      // Selecao vazia ou so espacos: nada a mostrar.
      if (!texto) {
        esconderCaixa();
        return;
      }

      // Selecao dentro de campo de formulario: nao interfere.
      const elemento = selecao.anchorNode;
      const alvo = elemento && elemento.parentElement;
      if (alvo && alvo.closest("input, textarea, select")) {
        esconderCaixa();
        return;
      }

      mostrarCaixa(selecao.getRangeAt(0));
    }, 220); // 220 ms: tempo para o usuario soltar o mouse
  });

  // Clique fora da caixinha: esconde. O clique nos botoes de
  // eixo nao fecha antes, porque checamos .contains().
  document.addEventListener("mousedown", (evento) => {
    if (caixa && !caixa.contains(evento.target)) esconderCaixa();
  });

  // Rolagem da pagina: a caixinha ficaria desalinhada, entao some.
  window.addEventListener("scroll", esconderCaixa, { passive: true });

  // Tecla Escape: forma classica de fechar qualquer caixinha.
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") esconderCaixa();
  });

  /* --------------------------------------------------------
     6) PONTE COM O DOCUMENTO FICTICIO (demonstracao)
     O arquivo documento-demo.html mostra a caixinha propria
     dele (#gamaPopup). Ao ESCOLHER o eixo nela, a pagina
     dispara um evento personalizado chamado "gama:abrir"
     com o EIXO e o TEXTO.

     Aqui fazemos duas coisas:
     a) Marcamos a pagina com data-gama-extensao="1" no <html>,
        para a caixinha saber que a extensao esta instalada e
        disparar o evento em vez de abrir uma aba nova.
     b) Ouvimos o evento e repassamos o trecho para a
        extensao (mesma mensagem ANOTACAO_RECEBIDA da secao
        5). O NIVEL de risco (1 a 5) NAO vem daqui: ele e
        escolhido pelo usuario dentro do proprio painel.
     -------------------------------------------------------- */

  /**
   * Instala a ponte entre a pagina e o painel lateral.
   */
  function instalarPonteDoDocumento() {
    // a) Marca a pagina como "extensao presente".
    document.documentElement.setAttribute("data-gama-extensao", "1");

    // b) Ouve a escolha do eixo na caixinha do documento ficticio.
    document.addEventListener("gama:abrir", (evento) => {
      const detalhe = (evento && evento.detail) || {};
      const eixo = detalhe.eixo;   // "geo" | "social" | "ambiental"
      const texto = detalhe.texto; // Trecho completo selecionado

      if (!eixo || !texto) return; // Evento sem dados: nada a fazer

      // Envia o trecho + eixo. O background guarda e ja pede
      // a abertura do painel (com reserva em aba nova se o
      // painel lateral nao puder abrir sozinho).
      enviarParaExtensao({
        tipo: "ANOTACAO_RECEBIDA",
        eixo,
        texto,
        // Numero do processo do proprio documento ficticio,
        // para o chip sair preenchido na demonstracao.
        numero: "0801234-56.2026.8.06.0001",
      });

      // Aviso na pagina: o usuario ve que o trecho foi enviado.
      mostrarAvisoEnvio(ROTULOS_EIXO[eixo] || eixo);
    });
  }

  /* --------------------------------------------------------
     7) INICIO DO SCRIPT
     -------------------------------------------------------- */

  function iniciar() {
    // Sem corpo na pagina, nao tem o que analisar.
    if (!document.body) return;

    // No proprio painel lateral (sidebar.html embutido na
    // demonstracao) este script nao faz nada: seria interface
    // duplicada dentro do proprio GAMA.
    if (paginaEPainelGama()) return;

    // A ponte do documento vale para qualquer pagina: assim a
    // demonstracao funciona tanto aberta localmente quanto pelo
    // GitHub Pages da equipe.
    instalarPonteDoDocumento();

    const numero = buscarNumeroNaPagina();
    numeroProcessoAtual = numero;
    if (!numero) return; // Pagina sem processo: ficamos quietos

    // Avisa a extensao que ha um processo nesta pagina.
    enviarParaExtensao({
      tipo: "PROCESSO_ENCONTRADO",
      numero,
      url: window.location.href, // Endereco da pagina
    });

    // Mostra o botao discreto de acionamento.
    mostrarBotao(numero);
  }

  // O manifesto ja define run_at: document_idle (pagina
  // carregada). Mesmo assim, guardamos a seguranca abaixo para
  // o caso de o DOM ainda nao estar pronto.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
