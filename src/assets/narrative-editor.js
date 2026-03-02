/**
 * Редактор нарратива: минимальный WYSIWYG (жирный/курсив), сохранение в localStorage.
 * Ключ: narrative--{pathname}--{slideId или editor-{index}}
 */
(function () {
  const ALLOWED_TAGS = ["P", "BR", "B", "I", "STRONG", "EM"];
  const DEBOUNCE_MS = 350;

  /** Приводит разметку к абзацам <p>, чтобы после перезагрузки не склеивалось (Chrome и др. дают <div>). */
  function normalizeToParagraphs(html) {
    if (!html || typeof html !== "string") return "";
    const doc = document.implementation.createHTMLDocument("");
    const body = doc.body;
    body.innerHTML = html;
    body.querySelectorAll("div").forEach((div) => {
      const p = doc.createElement("p");
      while (div.firstChild) p.appendChild(div.firstChild);
      div.parentNode.replaceChild(p, div);
    });
    return body.innerHTML;
  }

  function sanitizeHtml(html) {
    if (!html || typeof html !== "string") return "";
    const doc = document.implementation.createHTMLDocument("");
    const body = doc.body;
    body.innerHTML = html;
    const walk = (node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toUpperCase();
      if (!ALLOWED_TAGS.includes(tag)) {
        while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
        node.parentNode.removeChild(node);
        return;
      }
      Array.from(node.attributes || []).forEach((attr) => node.removeAttribute(attr.name));
      const children = Array.from(node.childNodes);
      children.forEach(walk);
    };
    const children = Array.from(body.childNodes);
    children.forEach(walk);
    return body.innerHTML;
  }

  function getStorageKey(editorEl, index) {
    const pathname = (window.location.pathname || "/")
      .replace(/^\/+|\/+$/g, "")
      .replace(/\//g, "-")
      .replace(/\.html$/, "")
      || "index";
    const slide = editorEl.closest(".slide");
    const slideId = slide && slide.id ? slide.id : null;
    if (slideId) return `narrative--${pathname}--${slideId}`;
    return `narrative--${pathname}--editor-${index}`;
  }

  function initEditor(editorEl, index) {
    const toolbar = editorEl.querySelector(".narrative-editor__toolbar");
    const body = editorEl.querySelector(".narrative-editor__body");
    if (!body) return;

    const key = getStorageKey(editorEl, index);
    const placeholder = editorEl.getAttribute("data-placeholder");
    if (placeholder) body.setAttribute("data-placeholder", placeholder);

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        body.innerHTML = sanitizeHtml(saved);
      } catch (_) {
        body.textContent = saved.replace(/<[^>]+>/g, "");
      }
    }

    let debounceTimer = null;
    function save() {
      const raw = body.innerHTML;
      const html = normalizeToParagraphs(raw);
      try {
        localStorage.setItem(key, html);
      } catch (e) {
        if (e && e.name === "QuotaExceededError") {
          console.warn("narrative-editor: localStorage quota exceeded", key);
        }
      }
    }

    function scheduleSave() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(save, DEBOUNCE_MS);
    }

    body.addEventListener("input", scheduleSave);
    body.addEventListener("change", scheduleSave);
    window.addEventListener("beforeunload", () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        save();
      }
    });

    toolbar.querySelectorAll(".narrative-editor__btn").forEach((btn) => {
      const cmd = btn.getAttribute("data-cmd");
      if (!cmd) return;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        body.focus();
        document.execCommand(cmd, false, null);
        scheduleSave();
      });
    });
  }

  function init() {
    const editors = document.querySelectorAll(".narrative-editor[data-narrative-editor]");
    editors.forEach((el, i) => initEditor(el, i));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
