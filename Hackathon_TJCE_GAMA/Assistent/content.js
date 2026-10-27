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
   4. Ao clicar no botao, pede para a extensao abrir o painel
      lateral (side panel) com a triagem pronta.

   IMPORTANTE:
   Este arquivo roda em todas as paginas (declarado no
   manifest.json), mas so cria o botao se encontrar um numero
   de processo valido, para nao incomodar o usuario.
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

  // Verifica se estamos rodando dentro da extensao instalada.
  // Fora da extensao (uma pagina comum aberta isoladamente),
  // a variavel "chrome" nao existe ou nao tem runtime.
  const TEM_EXTENSAO =
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.id;

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
     5) INICIO DO SCRIPT
     -------------------------------------------------------- */

  function iniciar() {
    // Sem corpo na pagina, nao tem o que analisar.
    if (!document.body) return;

    const numero = buscarNumeroNaPagina();
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
