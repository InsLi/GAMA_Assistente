/* ============================================================
   ARQUIVO: background.js
   TIPO DE ARQUIVO: service worker (script de segundo plano)

   O QUE E:
   Roda em segundo plano enquanto a extensao esta ativa. Ele
   nao tem interface (nenhuma tela). A funcao dele e ouvir
   mensagens e tomar decisoes que exigem permissoes especiais,
   como abrir o painel lateral.

   O QUE ELE FAZ:
   1. Quando a extensao e instalada, configura o icone da
      barra de ferramentas para abrir o painel ao ser clicado.
   2. Recebe a mensagem PROCESSO_ENCONTRADO do content.js e
      guarda o numero do processo no armazenamento local, para
      o painel lateral (sidebar.js) ler depois.
   3. Recebe a mensagem ABRIR_PAINEL do botao discreto da
      pagina e abre o painel lateral da extensao.
   ============================================================ */

/* ------------------------------------------------------------
   1) COMPORTAMENTO DO ICONE DA EXTENSAO
   openPanelOnActionClick: true faz o icone GAMA na barra de
   ferramentas abrir o painel lateral direto, sem precisar de
   menu extra. A configuracao vale para proximas aberturas.
   ------------------------------------------------------------ */
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((erro) => {
      // Log simples para facilitar a depuracao em
      // chrome://extensions (aba "Inspecionar service worker").
      console.error("GAMA Assistente: nao foi possivel configurar o painel.", erro);
    });
});

/* ------------------------------------------------------------
   2) FUNCAO DE ABERTURA DO PAINEL (com reserva)
   Tenta abrir o painel lateral (side panel) na aba em que o
   usuario esta. Essa chamada exige uma acao do usuario (um
   clique) e nem todas as versoes do Chrome aceitam abri-la a
   partir de uma mensagem.

   Se o painel nao abrir, entra a RESERVA: uma aba nova com o
   proprio painel (sidebar.html), ja com o trecho na URL
   quando houver. Assim o usuario sempre recebe uma resposta
   visivel, mesmo quando o painel lateral e bloqueado.
   ------------------------------------------------------------ */

/**
 * Abre o painel lateral ou, se nao der, o painel em aba nova.
 * @param {object} remetente quem enviou a mensagem (content script)
 * @param {object|null} anotacao trecho enviado ou null
 */
function abrirPainelComReserva(remetente, anotacao) {
  // remetente.tab so existe quando a mensagem vem de uma
  // pagina (content script), e nao de outro arquivo da ext.
  const tabId = remetente && remetente.tab && remetente.tab.id;
  if (tabId == null) return;

  chrome.sidePanel
    .open({ tabId })
    .catch((erro) => {
      console.error("GAMA Assistente: painel lateral bloqueado.", erro);

      // RESERVA: monta a URL do painel em aba nova. Se ha um
      // trecho, ele vai na URL para a caixa de anotacao abrir
      // pronta (o sidebar.js le estes parametros ao carregar).
      let url = chrome.runtime.getURL("sidebar.html");
      if (anotacao && anotacao.eixo && anotacao.texto) {
        const recorte = String(anotacao.texto).slice(0, 300);
        url +=
          "?eixo=" + encodeURIComponent(anotacao.eixo) +
          "&trecho=" + encodeURIComponent(recorte);
      }
      chrome.tabs.create({ url });
    });
}

/* ------------------------------------------------------------
   3) RECEPTOR DE MENSAGENS
   Toda mensagem enviada por content.js ou sidebar.js chega
   aqui. O "remetente" (sender) identifica de onde veio.
   ------------------------------------------------------------ */
chrome.runtime.onMessage.addListener((mensagem, remetente, responder) => {
  if (!mensagem || !mensagem.tipo) return; // Mensagem invalida: ignora

  /* --------------------------------------------------------
     2a) A PAGINA ABERTA TEM UM PROCESSO
     Guardamos o numero na area de armazenamento da extensao.
     A chave "processo" guarda o ultimo numero encontrado.
     -------------------------------------------------------- */
  if (mensagem.tipo === "PROCESSO_ENCONTRADO") {
    chrome.storage.local.set({
      processo: {
        numero: mensagem.numero, // Ex: 0801234-56.2026.8.06.0001
        url: mensagem.url,       // De qual pagina veio
        recebidoEm: Date.now(),  // Momento em milissegundos
      },
    });
    return; // Nao ha resposta a enviar
  }

  /* --------------------------------------------------------
     2b) PAGINA ENVIou UM TRECHO SELECIONADO COM EIXO
     O content script repassa o TEXTO e o EIXO escolhidos pelo
     usuario na caixinha (qualquer pagina ou documento da
     demonstracao). O nivel de risco (1 a 5) NAO vem aqui: ele
     sera escolhido pelo usuario dentro do proprio painel.

     Guardamos o trecho no armazenamento e ja tentamos abrir
     o painel lateral. Se o navegador nao deixar abrir o
     painel nesse momento (algumas versoes exigem clique
     direto no icone), abrimos o painel em uma ABA NOVA com o
     trecho na URL, para o usuario nunca ficar sem resposta.
     -------------------------------------------------------- */
  if (mensagem.tipo === "ANOTACAO_RECEBIDA") {
    const anotacao = {
      eixo: mensagem.eixo,   // "geo" | "social" | "ambiental"
      texto: mensagem.texto, // Trecho completo selecionado
      recebidoEm: Date.now(),
    };

    // Grava PRIMEIRO e so depois abre o painel: assim o
    // painel ja encontra o trecho pronto quando carregar
    // (evita corrida entre gravar e abrir).
    chrome.storage.local.set({ anotacao }).then(() => {
      abrirPainelComReserva(remetente, anotacao);
    });
    return;
  }

  /* --------------------------------------------------------
     2c) USUARIO CLICOU NO BOTAO DISCRETO DA PAGINA
     Abrimos o painel lateral na propria aba que o usuario
     esta visitando. sidePanel.open exige uma acao do usuario
     (o clique), por isso chamamos dentro do receptor da
     mensagem disparada pelo clique.
     -------------------------------------------------------- */
  if (mensagem.tipo === "ABRIR_PAINEL") {
    abrirPainelComReserva(remetente, null);
    return;
  }

  /* --------------------------------------------------------
     2d) PAINEL LATERAL PEDIU O ULTIMO PROCESSO LIDO
     Responder e opcional: o sidebar.js tambem le direto do
     storage. Deixamos a resposta pronta por conveniencia.
     -------------------------------------------------------- */
  if (mensagem.tipo === "PEDIR_PROCESSO") {
    chrome.storage.local.get("processo").then((dados) => {
      if (responder) responder(dados.processo || null);
    });
    return true; // true = a resposta sera enviada de forma assincrona
  }
});
