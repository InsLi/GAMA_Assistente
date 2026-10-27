/* GAMA Assistente — comportamento do side panel */

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("GAMA:", error));
});
