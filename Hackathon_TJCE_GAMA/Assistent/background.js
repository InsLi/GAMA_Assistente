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
   2) RECEPTOR DE MENSAGENS
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
     2b) PAGINA FICTICIA SUGERE UM ITEM DA TRIAGEM
     O content script repassa eixo e nivel lidos na caixinha do
     documento de demonstracao. Guardamos a sugestao no
     armazenamento para o painel lateral aplicar quando abrir.
     -------------------------------------------------------- */
  if (mensagem.tipo === "TRIAGEM_SUGERIDA") {
    chrome.storage.local.set({
      sugestao: {
        eixo: mensagem.eixo,   // "geo" | "social" | "ambiental"
        nivel: mensagem.nivel, // 1 a 5
        recebidoEm: Date.now(),
      },
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
    // remetente.tab so existe quando a mensagem vem de uma
    // pagina (content script), e nao de outro arquivo da ext.
    if (remetente && remetente.tab && remetente.tab.id != null) {
      chrome.sidePanel
        .open({ tabId: remetente.tab.id })
        .catch((erro) => {
          console.error("GAMA Assistente: nao foi possivel abrir o painel.", erro);
        });
    }
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
