// router.js
// Hash router simples com apenas duas rotas:
// "#/"        -> home
// "#/<slug>"  -> artigo dentro de content/

export function initRouter(handlers) {
  function resolveRoute() {
    const hash = window.location.hash.replace(/^#\/?/, "").trim();

    if (!hash) {
      handlers.home();
      return;
    }

    handlers.article(hash);
  }

  window.addEventListener("hashchange", resolveRoute);
  resolveRoute();
}
