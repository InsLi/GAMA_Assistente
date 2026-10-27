/* ============================================================
   GAMA ASSISTENTE — navegação entre telas e interações
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
  // Reinicia a triagem
  document.querySelectorAll('#view-screening input[type="checkbox"]')
    .forEach((cb) => { cb.checked = false; });
  updateProcessButton();
  showView("screening");
});

document.getElementById("btnHistory").addEventListener("click", () => {
  toast("Nenhuma triagem registrada neste dispositivo.");
});

/* Botões de voltar (views 2 e 3) */
document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.back));
});

/* ============================================================
   VIEW 2 — Triagem guiada
   ============================================================ */
const AXIS = ["geo", "social", "ambiental"];
const btnProcess = document.getElementById("btnProcess");
const formHint = document.getElementById("formHint");

function updateProcessButton() {
  const ready = AXIS.every((axis) =>
    document.querySelector(`#view-screening input[data-axis="${axis}"]:checked`)
  );
  btnProcess.disabled = !ready;
  formHint.classList.toggle("is-hidden", ready);
  return ready;
}

document
  .querySelectorAll('#view-screening input[type="checkbox"]')
  .forEach((cb) => cb.addEventListener("change", updateProcessButton));

btnProcess.addEventListener("click", () => {
  if (!updateProcessButton()) {
    toast("Marque ao menos um item em cada eixo.");
    return;
  }
  showView("result");
});

updateProcessButton();

/* ============================================================
   VIEW 3 — Resultado e minuta
   ============================================================ */
const minuta = document.getElementById("minuta");
const charCount = document.getElementById("charCount");
const btnCopy = document.getElementById("btnCopy");
const copyLabel = document.getElementById("copyLabel");

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
    // Fallback para navegadores/contexts sem Clipboard API
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
