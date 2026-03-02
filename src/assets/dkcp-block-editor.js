/**
 * Редактор содержимого блоков ДКЦП (editable): сохранение в localStorage, уменьшение кегля при длинном тексте.
 * Ключ: dkcp--{pathname}--{slideId}--block-{id}
 */
(function () {
  const ALLOWED_TAGS = ["P", "BR", "B", "I", "STRONG", "EM"];
  const DEBOUNCE_MS = 350;
  /** Порог символов: при достижении и выше вешается класс --long и применяется уменьшенный кегль (настраивается в CSS: --dkcp-editor-font-size-long). */
  const DKCP_EDITOR_THRESHOLD_CHARS = 200;

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

  function getStorageKey(editorEl) {
    const pathname = (window.location.pathname || "/")
      .replace(/^\/+|\/+$/g, "")
      .replace(/\//g, "-")
      .replace(/\.html$/, "")
      || "index";
    const slide = editorEl.closest(".slide");
    const slideId = slide && slide.id ? slide.id : "editor-0";
    const blockId = editorEl.getAttribute("data-dkcp-block-id") || "0";
    return `dkcp--${pathname}--${slideId}--block-${blockId}`;
  }

  function updateLongClass(editorEl) {
    const len = (editorEl.innerText || "").trim().length;
    editorEl.classList.toggle("dkcp-block-editor--long", len >= DKCP_EDITOR_THRESHOLD_CHARS);
  }

  function initBlock(editorEl) {
    const key = getStorageKey(editorEl);

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        editorEl.innerHTML = sanitizeHtml(saved);
      } catch (_) {
        editorEl.textContent = saved.replace(/<[^>]+>/g, "");
      }
    }
    updateLongClass(editorEl);

    let debounceTimer = null;
    function save() {
      const raw = editorEl.innerHTML;
      const html = normalizeToParagraphs(raw);
      try {
        localStorage.setItem(key, html);
      } catch (e) {
        if (e && e.name === "QuotaExceededError") {
          console.warn("dkcp-block-editor: localStorage quota exceeded", key);
        }
      }
    }

    function scheduleSave() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        save();
        updateLongClass(editorEl);
      }, DEBOUNCE_MS);
    }

    editorEl.addEventListener("input", scheduleSave);
    editorEl.addEventListener("change", scheduleSave);
    window.addEventListener("beforeunload", () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        save();
      }
    });
  }

  function init() {
    document.querySelectorAll(".dkcp-block-editor").forEach(initBlock);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
