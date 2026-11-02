// content.js
// Carrega o índice (data/content.json) e os arquivos Markdown (content/*.md).

let contentListCache = null;

export async function getContentList() {
  if (contentListCache) return contentListCache;
  const res = await fetch("src/data/content.json");
  contentListCache = await res.json();
  return contentListCache;
}

// Retorna { entry, markdown } ou null se o slug não existir.
export async function getArticle(slug) {
  const list = await getContentList();
  const entry = list.find((item) => item.slug === slug);

  if (!entry) return null;

  const res = await fetch(`src/content/${entry.file}`);
  const markdown = await res.text();

  return { entry, markdown };
}
