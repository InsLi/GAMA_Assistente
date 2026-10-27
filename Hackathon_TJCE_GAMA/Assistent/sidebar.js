/* ============================================================
   GAMA ASSISTENTE — navegação entre telas e interações
   Matriz de decisão (semáforo de risco):
   Vermelho: risco à vida → desocupação assistida urgente
   Amarelo:  risco mitigável → suspensão e saneamento / TAC
   Verde:    consolidado → permanência condicionada / ReurbS
   ============================================================ */

const views = document.querySelectorAll(".view");

function showView(name) {
  views.forEach((v) => v.classList.toggle("is-active", v.dataset.view === name));
  const active = document.querySelector(`.view[data-view="${name}"] .view-body`);
  if (active) active.scrollTop = 0;
}

/* ---------- Toast ---------- */
const toastEl = document.getElementById("toast");
let toastTimer = null;

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
}

/* ============================================================
   VIEW 1 — Menu inicial
   ============================================================ */
document.getElementById("btnNewScreening").addEventListener("click", () => {
  document.querySelectorAll('#view-screening input[type="checkbox"]')
    .forEach((cb) => { cb.checked = false; });
  updateProcessButton();
  showView("screening");
});

document.getElementById("btnHistory").addEventListener("click", () => {
  toast("Nenhuma triagem registrada neste dispositivo.");
});

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.back));
});

/* ============================================================
   VIEW 2 — Triagem guiada
   ============================================================ */
const btnProcess = document.getElementById("btnProcess");
const formHint = document.getElementById("formHint");
const screeningBoxes = document.querySelectorAll(
  '#view-screening input[type="checkbox"]'
);

function updateProcessButton() {
  const ready = [...screeningBoxes].some((cb) => cb.checked);
  btnProcess.disabled = !ready;
  formHint.classList.toggle("is-hidden", ready);
  return ready;
}

function axisChecked(axis) {
  return [...document.querySelectorAll(
    `#view-screening input[data-axis="${axis}"]`
  )].some((cb) => cb.checked);
}

/* Critério do semáforo (explicável e determinístico) */
function evaluateDiagnosis() {
  if (axisChecked("geo")) return "red";      // risco à vida
  if (axisChecked("social")) return "amber"; // risco mitigável
  return "green";                            // apenas ambiental: consolidado
}

screeningBoxes.forEach((cb) =>
  cb.addEventListener("change", updateProcessButton)
);

btnProcess.addEventListener("click", () => {
  if (!updateProcessButton()) {
    toast("Marque ao menos uma condição identificada nos autos.");
    return;
  }
  renderDiagnosis(evaluateDiagnosis());
  showView("result");
});

updateProcessButton();

/* ============================================================
   VIEW 3 — Resultado da matriz (semáforo) e minuta
   ============================================================ */
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

/* A minuta amarela é a própria pré-preenchida no HTML */
const MINUTAS = { amber: minuta.value };

MINUTAS.red = `PROCESSO Nº 0801234-56.2026.8.06.0001
2ª VARA DA FAZENDA PÚBLICA — COMARCA DE FORTALEZA/CE

Vistos.

1. Trata-se de Ação Civil Pública com pedido de tutela provisória em que se discute a ocupação de área de risco lindeira a curso d'água, com supressão de vegetação nativa e suposto comprometimento da estabilidade da encosta.

2. A análise técnica realizada mediante o GAMA — Guia de Análise do Meio Ambiente apontou Diagnóstico VERMELHO (risco à vida), em razão de marcações no eixo Geotécnico / Vida, quais sejam: risco iminente de desabamento, deslizamento ou inundação e habitações implantadas em área de risco.

3. O risco concreto à incolumidade das pessoas autoriza a adoção de medidas urgentes, incompatíveis com o prosseguimento normal da fase postulatória, nos termos da Resolução CNJ nº 460/2022, que prioriza a proteção da vida e do meio ambiente, e da Resolução CNJ nº 345/2020.

ANTE O EXPOSTO, com fundamento no art. 225 da Constituição Federal, na Lei nº 7.347/1985 e nas Resoluções CNJ nº 345/2020 e nº 460/2022, RESOLVO:

1. DETERMINAR a imediata interdição das edificações expostas a risco, com a cessação de qualquer uso ou permanência nelas;

2. DETERMINAR a desocupação assistida da área, com prioridade absoluta à integridade física dos moradores, mediante apoio da Defensoria Pública, do Ministério Público, da Defesa Civil e dos órgãos de segurança pública;

3. DETERMINAR ao Município que providencie abrigo temporário ou realojamento emergencial das famílias afetadas, sem prejuízo da regularização fundiária posterior;

4. DETERMINAR a produção de prova pericial técnica específica sobre a estabilidade da encosta, a ser produzida no prazo de 30 (trinta) dias;

5. DESIGNAR audiência de urgência no prazo de 15 (quinze) dias, para ciência das partes e das instituições envolvidas.

Intimem-se.`;

MINUTAS.green = `PROCESSO Nº 0801234-56.2026.8.06.0001
2ª VARA DA FAZENDA PÚBLICA — COMARCA DE FORTALEZA/CE

Vistos.

1. Trata-se de Ação Civil Pública em que se discute a ocupação de área com vegetação nativa lindeira a curso d'água e a compatibilidade da permanência das famílias com a proteção ambiental do local.

2. A triagem realizada mediante o GAMA — Guia de Análise do Meio Ambiente apontou Diagnóstico VERDE (situação consolidada): ausência de risco iminente à vida e de fatores sociais impeditivos, com marcações restritas ao eixo Ambiental, relativas a área de preservação permanente com potencial de regeneração.

3. A ausência de risco à vida e a ocupação consolidada orientam a solução pela via da regularização, em vez da judicialização do conflito, com fundamento na Resolução CNJ nº 345/2020 e na Resolução CNJ nº 460/2022, que privilegiam a restauração do dano e a afirmação de direitos.

ANTE O EXPOSTO, com fundamento no art. 225 da Constituição Federal, na Lei nº 6.938/1981, na Lei nº 11.445/2007 e nas Resoluções CNJ nº 345/2020 e nº 460/2022, RESOLVO:

1. CONSIDERAR consolidada a situação da ocupação, cuja permanência fica condicionada ao atendimento das condicionantes ambientais a serem fixadas pelo Município;

2. DETERMINAR a regularização fundiária mediante o programa de Regularização Fundiária de Interesse Social (ReurbS), ouvidos os órgãos ambientais estadual e municipal;

3. DETERMINAR a recomposição da vegetação nas áreas exigidas pelo órgão ambiental competente, com plano de recuperação em até 12 (doze) meses;

4. ENCAMINHAR os autos à Secretaria Municipal de Meio Ambiente e de Urbanismo, para emissão das condicionantes e acompanhamento periódico;

5. SEM prejuízo da atuação do Ministério Público, caso verificado o descumprimento das condicionantes fixadas.

Intimem-se.`;

const ICON_TRIANGLE = `<svg viewBox="0 0 24 24" class="ico-lg"><path d="M12 3l10 17H2L12 3z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" class="ico-lg"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.4l2.4 2.4 4.6-5"/></svg>`;

const DIAGNOSES = {
  red: {
    badgeClass: "alert-badge alert-badge--red",
    icon: ICON_TRIANGLE,
    title: "Diagnóstico Vermelho: Desocupação Assistida Urgente",
    sub: "Risco à vida identificado nos autos — prioridade máxima de atuação",
    action: "Desocupação assistida urgente, com abrigo ou realojamento das famílias",
    pill: "Urgente",
  },
  amber: {
    badgeClass: "alert-badge alert-badge--amber",
    icon: ICON_TRIANGLE,
    title: "Diagnóstico Amarelo: Suspensão e Concertação",
    sub: "Risco mitigável — suspensão e saneamento / TAC",
    action: "Suspensão e saneamento da área, com encaminhamento ao CEJUSC",
    pill: "Prazo: 180 dias",
  },
  green: {
    badgeClass: "alert-badge alert-badge--green",
    icon: ICON_CHECK,
    title: "Diagnóstico Verde: Permanência Condicionada",
    sub: "Situação consolidada — permanência condicionada / ReurbS",
    action: "Permanência condicionada, com regularização fundiária (ReurbS)",
    pill: "ReurbS",
  },
};

function renderDiagnosis(key) {
  const d = DIAGNOSES[key] || DIAGNOSES.amber;
  badge.className = d.badgeClass;
  alertIcon.innerHTML = d.icon;
  diagTitle.textContent = d.title;
  diagSub.textContent = d.sub;
  actionText.textContent = d.action;
  actionPill.textContent = d.pill;
  minuta.value = MINUTAS[key] || MINUTAS.amber;
  updateCharCount();
}

function updateCharCount() {
  const n = minuta.value.length;
  charCount.textContent = `${n.toLocaleString("pt-BR")} caracteres`;
}
minuta.addEventListener("input", updateCharCount);
updateCharCount();

btnCopy.addEventListener("click", async () => {
  const text = minuta.value;
  let ok = true;

  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    try {
      minuta.focus();
      minuta.select();
      ok = document.execCommand("copy");
      minuta.setSelectionRange(0, 0);
    } catch (e) {
      ok = false;
    }
  }

  if (!ok) {
    toast("Não foi possível copiar. Selecione o texto manualmente.");
    return;
  }

  btnCopy.classList.add("is-success");
  copyLabel.textContent = "Minuta copiada!";
  toast("Minuta de decisão copiada para a área de transferência.");

  setTimeout(() => {
    btnCopy.classList.remove("is-success");
    copyLabel.textContent = "Copiar Minuta de Decisão";
  }, 2200);
});
