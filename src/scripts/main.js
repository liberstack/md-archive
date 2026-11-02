// main.js
// Ponto de entrada: liga router, content e pages.
// Não busca dados nem monta HTML diretamente.

import { initRouter } from "./router.js";
import { getContentList, getArticle } from "./content.js";
import { renderHome, renderArticle, renderNotFound } from "./pages.js";

const root = document.getElementById("app");

initRouter({
  home: async () => {
    const list = await getContentList();
    renderHome(root, list);
  },

  article: async (slug) => {
    const article = await getArticle(slug);

    if (!article) {
      renderNotFound(root);
      return;
    }

    renderArticle(root, article);
  },
});
