const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const stepsEl = $("#steps");
const template = $("#stepTemplate");
const imageEntryTemplate = $("#imageEntryTemplate");
let stepId = 0;

const starter = [
  {
    title: "Otwórz przeglądarkę",
    text: "Uruchom przeglądarkę internetową na swoim komputerze.",
    images: [], callout: null
  },
  {
    title: "Przejdź do ustawień",
    text: "Kliknij przycisk „Ustawienia”, a następnie wybierz „Sieć Wi-Fi”.",
    images: [], callout: {type:"tip", text:"Jeżeli nie widzisz tej opcji, przewiń menu w dół."}
  },
  {
    title: "Zmień hasło",
    text: "Wpisz nowe hasło w odpowiednim polu i zatwierdź zmianę.",
    images: [], callout: null
  }
];

function addStep(data={title:"", text:"", images:[], callout:null}) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.id = ++stepId;
  $(".step-title", node).value = data.title || "";
  $(".step-text", node).value = data.text || "";

  const imageListEl = $(".image-list", node);
  const images = data.images || (data.image ? [{ src: data.image, caption: data.caption || "", scale: data.scale || 100 }] : []);
  images.forEach(img => addImageEntry(imageListEl, node, img));
  updateImageVisibility(node);

  if (data.callout) {
    $(".callout-type", node).value = data.callout.type;
    $(".callout-text", node).hidden = false;
    $(".callout-text", node).value = data.callout.text || "";
    $(".clear-callout", node).hidden = false;
  }

  $(".upload-btn", node).onclick = () => $(".image-input", node).click();
  $(".add-more-images", node).onclick = () => $(".image-input", node).click();
  $(".image-placeholder", node).ondragover = e => { e.preventDefault(); };
  $(".image-placeholder", node).ondrop = e => {
    e.preventDefault();
    [...e.dataTransfer.files].forEach(file => addImageFromFile(node, file));
  };
  $(".image-input", node).onchange = e => {
    [...e.target.files].forEach(file => addImageFromFile(node, file));
    e.target.value = "";
  };

  $(".toggle-step", node).onclick = () => {
    const collapsed = node.classList.toggle("collapsed");
    $(".toggle-step", node).textContent = collapsed ? "▸" : "▾";
  };
  $(".delete-step", node).onclick = () => { node.remove(); renumber(); render(); save(); };
  $(".move-up", node).onclick = () => {
    const prev = node.previousElementSibling;
    if (prev) { stepsEl.insertBefore(node, prev); renumber(); render(); save(); }
  };
  $(".move-down", node).onclick = () => {
    const next = node.nextElementSibling;
    if (next) { stepsEl.insertBefore(next, node); renumber(); render(); save(); }
  };

  $(".callout-type", node).onchange = () => {
    const type = $(".callout-type", node).value;
    $(".callout-text", node).hidden = !type;
    $(".clear-callout", node).hidden = !type;
    if (!type) $(".callout-text", node).value = "";
    render(); save();
  };
  $(".clear-callout", node).onclick = () => {
    $(".callout-type", node).value = "";
    $(".callout-text", node).value = "";
    $(".callout-text", node).hidden = true;
    $(".clear-callout", node).hidden = true;
    render(); save();
  };

  $$(".step-title, .step-text, .callout-text", node).forEach(el => {
    el.addEventListener("input", () => { render(); save(); });
  });

  stepsEl.appendChild(node);
  renumber();
  render();
}

function updateImageVisibility(stepNode) {
  const has = $$(".image-entry", stepNode).length > 0;
  $(".image-placeholder", stepNode).hidden = has;
  $(".add-more-images", stepNode).hidden = !has;
  $(".add-more-hint", stepNode).hidden = !has;
}

function addImageFromFile(stepNode, file) {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    addImageEntry($(".image-list", stepNode), stepNode, { src: reader.result, caption: "", scale: 100 });
    updateImageVisibility(stepNode);
    render(); save();
  };
  reader.readAsDataURL(file);
}

function addImageEntry(container, stepNode, data = { src: "", caption: "", scale: 100 }) {
  const entry = imageEntryTemplate.content.firstElementChild.cloneNode(true);
  $("img", entry).src = data.src;
  $(".caption-input", entry).value = data.caption || "";
  $(".scale-input", entry).value = data.scale || 100;
  $(".scale-value", entry).textContent = `${data.scale || 100}%`;

  $(".scale-input", entry).oninput = () => {
    $(".scale-value", entry).textContent = `${$(".scale-input", entry).value}%`;
    render(); save();
  };
  $(".caption-input", entry).addEventListener("input", () => { render(); save(); });
  $(".move-image-up", entry).onclick = () => {
    const prev = entry.previousElementSibling;
    if (prev) { container.insertBefore(entry, prev); render(); save(); }
  };
  $(".move-image-down", entry).onclick = () => {
    const next = entry.nextElementSibling;
    if (next) { container.insertBefore(next, entry); render(); save(); }
  };
  $(".remove-image", entry).onclick = () => {
    entry.remove();
    updateImageVisibility(stepNode);
    render(); save();
  };

  container.appendChild(entry);
}

function renumber() {
  $$(".step-card").forEach((node, i) => $(".step-number", node).textContent = String(i+1).padStart(2,"0"));
}

function collect() {
  return {
    kicker: $("#docKicker").value.trim(),
    title: $("#docTitle").value.trim(),
    intro: $("#docIntro").value.trim(),
    steps: $$(".step-card").map(node => ({
      title: $(".step-title", node).value.trim(),
      text: $(".step-text", node).value.trim(),
      images: $$(".image-entry", node).map(entry => ({
        src: $("img", entry).src,
        caption: $(".caption-input", entry).value.trim(),
        scale: Number($(".scale-input", entry).value) || 100
      })),
      callout: $(".callout-type", node).value ? {
        type: $(".callout-type", node).value,
        text: $(".callout-text", node).value.trim()
      } : null
    }))
  };
}

function buildDocHtml(d) {
  let html = `
    <header class="paper-header">
      <div class="paper-kicker">${esc(d.kicker || "Instrukcja krok po kroku")}</div>
      <h3>${esc(d.title || "Tytuł instrukcji")}</h3>
      ${d.intro ? `<p class="paper-intro">${esc(d.intro)}</p>` : ""}
    </header>
  `;
  const steps = d.steps || [];
  if (!steps.length) html += `<div class="empty-preview">Dodaj pierwszy krok, aby rozpocząć.</div>`;

  steps.forEach((s, i) => {
    html += `<section class="preview-step">
      <div class="preview-step-head">
        <div class="preview-num">${String(i+1).padStart(2,"0")}</div>
        <h4>${esc(s.title || "Bez tytułu")}</h4>
      </div>
      ${s.text ? `<p class="preview-text">${esc(s.text)}</p>` : ""}
      ${(s.images && s.images.length) ? `<div class="step-images">${s.images.map(img => `<figure class="preview-image"><img src="${img.src}" alt="" style="width:${img.scale || 100}%">${img.caption ? `<figcaption class="image-caption">${esc(img.caption)}</figcaption>` : ""}</figure>`).join("")}</div>` : ""}
      ${s.callout && s.callout.text ? calloutHtml(s.callout) : ""}
    </section>`;
  });
  return html;
}

let previewMode = localStorage.getItem("placestruct-preview-mode") || "single";

function render() {
  const wrap = $("#paperWrap");
  if (previewMode === "all") {
    const currentId = getCurrentId();
    const currentMeta = getDocs().find(d => d.id === currentId) || {};
    const current = { ...collect(), id: currentId, createdAt: currentMeta.createdAt || currentMeta.updatedAt || 0 };
    const others = getDocs().filter(d => d.id !== currentId);
    const all = [...others, current].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    wrap.innerHTML = all.map(d => `<article class="paper">${buildDocHtml(d)}</article>`).join("");
  } else {
    wrap.innerHTML = `<article class="paper">${buildDocHtml(collect())}</article>`;
  }
}

function calloutHtml(c) {
  const names = {tip:"WSKAZÓWKA", warning:"UWAGA", info:"INFORMACJA", important:"WAŻNE"};
  const icon = {tip:"💡", warning:"⚠️", info:"ℹ️", important:"❗"};
  return `<div class="callout ${c.type}"><strong>${icon[c.type]} ${names[c.type]}</strong>${esc(c.text)}</div>`;
}

function esc(s) {
  return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

const DOCS_KEY = "placestruct-docs";
const CURRENT_KEY = "placestruct-current";
const LEGACY_KEY = "placestruct";

function uid() {
  return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getDocs() {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY)) || []; }
  catch { return []; }
}
function setDocs(docs) { localStorage.setItem(DOCS_KEY, JSON.stringify(docs)); }
function getCurrentId() { return localStorage.getItem(CURRENT_KEY); }
function setCurrentId(id) { localStorage.setItem(CURRENT_KEY, id); }

function emptyDoc() {
  const now = Date.now();
  return { id: uid(), kicker: "Instrukcja krok po kroku", title: "", intro: "", steps: [], createdAt: now, updatedAt: now };
}

function save() {
  const currentId = getCurrentId();
  const docs = getDocs();
  const idx = docs.findIndex(d => d.id === currentId);
  if (idx > -1) {
    docs[idx] = { ...docs[idx], ...collect(), updatedAt: Date.now() };
    setDocs(docs);
  }
  $("#saveState").textContent = "Zapisano";
}

function loadDocIntoEditor(doc) {
  $("#docKicker").value = doc.kicker || "Instrukcja krok po kroku";
  $("#docTitle").value = doc.title || "";
  $("#docIntro").value = doc.intro || "";
  stepsEl.innerHTML = "";
  stepId = 0;
  (doc.steps || []).forEach(addStep);
  if (!doc.steps || !doc.steps.length) render();
  $("#saveState").textContent = "Zapisano";
}

function load() {
  let docs = getDocs();
  let currentId = getCurrentId();

  if (!docs.length) {
    let legacy = null;
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      try { legacy = JSON.parse(legacyRaw); } catch { legacy = null; }
    }
    const now = Date.now();
    const doc = legacy
      ? { id: uid(), kicker: legacy.kicker || "Instrukcja krok po kroku", title: legacy.title || "", intro: legacy.intro || "", steps: legacy.steps || [], createdAt: now, updatedAt: now }
      : { id: uid(), kicker: "Instrukcja krok po kroku", title: "Jak zmienić hasło Wi-Fi", intro: "Instrukcja krok po kroku dla osób, które po raz pierwszy wykonują tę czynność.", steps: starter, createdAt: now, updatedAt: now };
    docs = [doc];
    currentId = doc.id;
    setDocs(docs);
    setCurrentId(currentId);
    if (legacyRaw) localStorage.removeItem(LEGACY_KEY);
  }

  let current = docs.find(d => d.id === currentId);
  if (!current) {
    current = docs[0];
    currentId = current.id;
    setCurrentId(currentId);
  }

  loadDocIntoEditor(current);
  renderLibrary();
}

function openDoc(id) {
  save();
  const doc = getDocs().find(d => d.id === id);
  if (!doc) return;
  setCurrentId(id);
  loadDocIntoEditor(doc);
  renderLibrary();
}

function deleteDoc(id) {
  setDocs(getDocs().filter(d => d.id !== id));
  renderLibrary();
}

function libraryItemHtml(d) {
  const stepCount = (d.steps || []).length;
  const dateStr = new Date(d.updatedAt).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `
    <div class="library-item" data-id="${d.id}">
      <button type="button" class="library-item-head">
        <span class="library-chevron">▸</span>
        <span class="library-item-title">${esc(d.title || "Bez tytułu")}</span>
        <span class="library-item-meta">${stepCount} ${stepCount === 1 ? "krok" : "kroków"} · ${dateStr}</span>
      </button>
      <div class="library-item-body" hidden>
        ${d.intro ? `<p class="library-item-intro">${esc(d.intro)}</p>` : ""}
        ${stepCount ? `<ol class="library-item-steps">${d.steps.map(s => `<li>${esc(s.title || "Bez tytułu")}</li>`).join("")}</ol>` : `<p class="library-item-empty">Brak kroków.</p>`}
        <div class="library-item-actions">
          <button type="button" class="library-edit">Edytuj</button>
          <button type="button" class="library-delete">Usuń</button>
        </div>
      </div>
    </div>`;
}

function renderLibrary() {
  const currentId = getCurrentId();
  const others = getDocs().filter(d => d.id !== currentId).sort((a, b) => b.updatedAt - a.updatedAt);
  const sectionEl = $("#librarySection");
  const listEl = $("#libraryList");

  if (!others.length) {
    sectionEl.hidden = true;
    listEl.innerHTML = "";
    return;
  }

  sectionEl.hidden = false;
  listEl.innerHTML = others.map(libraryItemHtml).join("");

  $$(".library-item", listEl).forEach(node => {
    const id = node.dataset.id;
    $(".library-item-head", node).onclick = () => {
      const expanded = node.classList.toggle("expanded");
      $(".library-item-body", node).hidden = !expanded;
    };
    $(".library-edit", node).onclick = e => { e.stopPropagation(); openDoc(id); };
    $(".library-delete", node).onclick = e => {
      e.stopPropagation();
      if (confirm("Usunąć tę instrukcję na stałe?")) deleteDoc(id);
    };
  });
}

document.addEventListener("paste", e => {
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  let imageFile = null;
  for (const item of items) {
    if (item.type.startsWith("image/")) { imageFile = item.getAsFile(); break; }
  }
  if (!imageFile) return;
  const active = document.activeElement;
  const targetCard = (active && active.closest(".step-card")) || stepsEl.lastElementChild;
  if (!targetCard) return;
  e.preventDefault();
  addImageFromFile(targetCard, imageFile);
});

$("#docKicker").addEventListener("input", () => { render(); save(); });
$("#docTitle").addEventListener("input", () => { render(); save(); });
$("#docIntro").addEventListener("input", () => { render(); save(); });
$("#addStepBtn").onclick = () => {
  $$(".step-card").forEach(node => {
    node.classList.add("collapsed");
    $(".toggle-step", node).textContent = "▸";
  });
  addStep();
  save();
};
$("#printBtn").onclick = () => window.print();
$("#modeSingleBtn").onclick = () => setPreviewMode("single");
$("#modeAllBtn").onclick = () => setPreviewMode("all");
function setPreviewMode(mode) {
  previewMode = mode;
  localStorage.setItem("placestruct-preview-mode", mode);
  $("#modeSingleBtn").classList.toggle("active", mode === "single");
  $("#modeAllBtn").classList.toggle("active", mode === "all");
  render();
}
$("#modeSingleBtn").classList.toggle("active", previewMode === "single");
$("#modeAllBtn").classList.toggle("active", previewMode === "all");
$("#newBtn").onclick = () => {
  save();
  const doc = emptyDoc();
  const docs = getDocs();
  docs.push(doc);
  setDocs(docs);
  setCurrentId(doc.id);
  loadDocIntoEditor(doc);
  addStep();
  save();
  renderLibrary();
};
$("#clearBtn").onclick = () => {
  if (!confirm("Wyczyścić bieżący formularz? Niezapisane w nim zmiany zostaną utracone.")) return;
  loadDocIntoEditor({ kicker: "Instrukcja krok po kroku", title: "", intro: "", steps: [] });
  addStep();
  save();
};

load();

const savedTheme = localStorage.getItem("placestruct-theme");
if (savedTheme === "dark") document.body.classList.add("dark");
function updateThemeButton() {
  $("#themeBtn").textContent = document.body.classList.contains("dark") ? "☀ Jasny" : "☾ Ciemny";
}
$("#themeBtn").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("placestruct-theme", document.body.classList.contains("dark") ? "dark" : "light");
  updateThemeButton();
};
updateThemeButton();

// Personalizacja wyglądu numerków kroków
const BADGE_COLOR_KEY = "placestruct-badge-color";
const BADGE_SHAPE_KEY = "placestruct-badge-shape";
const DEFAULT_BADGE_COLOR = "#2563eb";
const DEFAULT_BADGE_SHAPE = "square";
const SHAPES = {
  square:   { radius: "9px",  clip: "none" },
  rounded:  { radius: "16px", clip: "none" },
  circle:   { radius: "50%",  clip: "none" },
  diamond:  { radius: "0",    clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  hexagon:  { radius: "0",    clip: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
  pentagon: { radius: "0",    clip: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" },
  octagon:  { radius: "0",    clip: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" },
  star:     { radius: "0",    clip: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
  triangle: { radius: "0",    clip: "polygon(50% 0%, 0% 100%, 100% 100%)" }
};

function applyBadgeColor(color) {
  document.documentElement.style.setProperty("--badge-color", color);
  $("#badgeColorInput").value = color;
}
function applyBadgeShape(shape) {
  const s = SHAPES[shape] || SHAPES[DEFAULT_BADGE_SHAPE];
  document.documentElement.style.setProperty("--badge-radius", s.radius);
  document.documentElement.style.setProperty("--badge-clip", s.clip);
  $$(".shape-btn").forEach(b => b.classList.toggle("active", b.dataset.shape === shape));
}

const FONT_SCALE_KEY = "placestruct-font-scale";
const DEFAULT_FONT_SCALE = 100;

function applyFontScale(scale) {
  document.documentElement.style.setProperty("--content-scale", scale / 100);
  $("#fontScaleInput").value = scale;
  $("#fontScaleValue").textContent = `${scale}%`;
}

const IMAGE_LAYOUT_KEY = "placestruct-image-layout";
const DEFAULT_IMAGE_LAYOUT = "stack";

function applyImageLayout(layout) {
  document.body.classList.toggle("image-layout-row", layout === "row");
  $$(".layout-btn").forEach(b => b.classList.toggle("active", b.dataset.layout === layout));
}

applyBadgeColor(localStorage.getItem(BADGE_COLOR_KEY) || DEFAULT_BADGE_COLOR);
applyBadgeShape(localStorage.getItem(BADGE_SHAPE_KEY) || DEFAULT_BADGE_SHAPE);
applyFontScale(Number(localStorage.getItem(FONT_SCALE_KEY)) || DEFAULT_FONT_SCALE);
applyImageLayout(localStorage.getItem(IMAGE_LAYOUT_KEY) || DEFAULT_IMAGE_LAYOUT);

$("#customizeBtn").onclick = () => { $("#customizePanel").hidden = !$("#customizePanel").hidden; };
document.addEventListener("click", e => {
  const panel = $("#customizePanel");
  if (panel.hidden) return;
  if (!panel.contains(e.target) && e.target !== $("#customizeBtn")) panel.hidden = true;
});
$("#badgeColorInput").oninput = e => {
  applyBadgeColor(e.target.value);
  localStorage.setItem(BADGE_COLOR_KEY, e.target.value);
};
$$(".shape-btn").forEach(btn => {
  btn.onclick = () => {
    applyBadgeShape(btn.dataset.shape);
    localStorage.setItem(BADGE_SHAPE_KEY, btn.dataset.shape);
  };
});
$("#fontScaleInput").oninput = e => {
  applyFontScale(Number(e.target.value));
  localStorage.setItem(FONT_SCALE_KEY, e.target.value);
};
$$(".layout-btn").forEach(btn => {
  btn.onclick = () => {
    applyImageLayout(btn.dataset.layout);
    localStorage.setItem(IMAGE_LAYOUT_KEY, btn.dataset.layout);
  };
});
$("#resetBadgeBtn").onclick = () => {
  localStorage.removeItem(BADGE_COLOR_KEY);
  localStorage.removeItem(BADGE_SHAPE_KEY);
  localStorage.removeItem(FONT_SCALE_KEY);
  localStorage.removeItem(IMAGE_LAYOUT_KEY);
  applyBadgeColor(DEFAULT_BADGE_COLOR);
  applyBadgeShape(DEFAULT_BADGE_SHAPE);
  applyFontScale(DEFAULT_FONT_SCALE);
  applyImageLayout(DEFAULT_IMAGE_LAYOUT);
};
