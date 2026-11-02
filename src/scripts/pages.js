// pages.js
// Transforma dados em páginas HTML: home e artigo.

import { CONFIG } from "./config.js";

// --- templates ---

function renderNavbar() {
  return `
    <header class="navbar">
      <a href="#/" class="navbar-home">${CONFIG.brand.title}</a>
    </header>
  `;
}

function renderFooter() {
  const linksHtml = CONFIG.footer.links
    .map(
      (l) =>
        `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`,
    )
    .join("");

  return `
    <footer class="footer">
      <div class="footer-col">
        <h3>Sobre</h3>
        <p>${CONFIG.footer.about}</p>
      </div>
      <div class="footer-col">
        <h3>Contato</h3>
        <p><a href="mailto:${CONFIG.footer.contact.email}">${CONFIG.footer.contact.email}</a></p>
        <p><a href="https://t.me/${CONFIG.footer.contact.whatsapp}" target="_blank" rel="noopener">Telegram</a></p>
      </div>
      <div class="footer-col">
        <h3>GitHub</h3>
        <ul>${linksHtml}</ul>
      </div>
    </footer>
  `;
}

function renderTags(tags) {
  if (!tags || !tags.length) return "";
  const chips = tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  return `<div class="tags">${chips}</div>`;
}

function renderArticleListItem(item) {
  return `
    <li>
      <a href="#/${item.slug}">
        <span class="item-title">${item.title}</span>
        ${renderTags(item.tags)}
      </a>
    </li>
  `;
}

// --- páginas ---

export function renderHome(root, list) {
  root.innerHTML = `
    ${renderNavbar()}
    <main class="content">
      <h1>${CONFIG.brand.title}</h1>
      <p class="description">${CONFIG.brand.description}</p>
      <input type="text" id="search-input" class="search-input" placeholder="Pesquisar palavras-chave: web, javascript, python..." />
      <p class="list-note" id="list-note"></p>
      <ul class="article-list" id="article-list"></ul>
    </main>
    ${renderFooter()}
  `;

  const listEl = document.getElementById("article-list");
  const searchInput = document.getElementById("search-input");
  const listNoteEl = document.getElementById("list-note");

  function renderList(items, { isSearch }) {
    if (!items.length) {
      listEl.innerHTML = `<li class="empty">Nenhum resultado encontrado.</li>`;
      listNoteEl.textContent = "";
      return;
    }

    const total = items.length;
    listNoteEl.textContent = isSearch
      ? `${total} ${total === 1 ? "resultado ▽" : "resultados ▽"}`
      : `${total} ${total === 1 ? "artigo ▽" : "artigos ▽"}`;

    listEl.innerHTML = items.map(renderArticleListItem).join("");
  }

  function filterByQuery(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      renderList(list, { isSearch: false });
      return;
    }

    const filtered = list.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const tagMatch = (item.tags || []).some((tag) =>
        tag.toLowerCase().includes(q),
      );
      return titleMatch || tagMatch;
    });
    renderList(filtered, { isSearch: true });
  }

  renderList(list, { isSearch: false });

  searchInput.addEventListener("input", () => filterByQuery(searchInput.value));
}

export function renderArticle(root, { entry, markdown }) {
  const html = marked.parse(markdown);

  // Insere o bloco de tags logo depois do primeiro </h1> do markdown renderizado,
  // para que apareçam como um "subtítulo" do artigo.
  const tagsBlock = renderTags(entry.tags);
  const htmlWithTags = html.includes("</h1>")
    ? html.replace("</h1>", `</h1>${tagsBlock}`)
    : `${tagsBlock}${html}`;

  root.innerHTML = `
    ${renderNavbar()}
    <main class="content article">
      <a href="#/" class="back-link">&larr; Voltar</a>
      ${htmlWithTags}
    </main>
    ${renderFooter()}
  `;
}

export function renderNotFound(root) {
  root.innerHTML = `
    ${renderNavbar()}
    <main class="content">
      <a href="#/" class="back-link">&larr; Voltar</a>
      <h1>404</h1>
      <p>Artigo não encontrado.</p>
    </main>
    ${renderFooter()}
  `;
}
