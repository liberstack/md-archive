# #DevLore

Arquivo digital de artigos sobre a história e os fundamentos de **JavaScript** e **Python**.

O projeto é uma SPA (Single Page Application) **100% estática**: JavaScript puro, módulos ES, artigos escritos em Markdown e nenhum backend, banco de dados ou etapa de build.

Este README funciona como um tutorial: ao final, você vai entender como o projeto funciona por dentro, como rodá-lo localmente e como publicar um novo artigo.

---

## Sumário

- [#DevLore](#devlore)
  - [Sumário](#sumário)
  - [1. O que você vai aprender](#1-o-que-você-vai-aprender)
  - [2. Visão geral da arquitetura](#2-visão-geral-da-arquitetura)
  - [3. Estrutura de pastas](#3-estrutura-de-pastas)
  - [4. Como o fluxo funciona](#4-como-o-fluxo-funciona)
  - [5. Módulos, um por um](#5-módulos-um-por-um)
    - [5.1 `index.html`](#51-indexhtml)
    - [5.2 `router.js`: o roteador](#52-routerjs-o-roteador)
    - [5.3 `content.js`: a camada de dados](#53-contentjs-a-camada-de-dados)
    - [5.4 `pages.js`: a camada de visualização](#54-pagesjs-a-camada-de-visualização)
    - [5.5 `config.js`: configuração](#55-configjs-configuração)
    - [5.6 `main.js`: a cola](#56-mainjs-a-cola)
  - [6. Rodando localmente](#6-rodando-localmente)
  - [7. Tutorial: publicando um novo artigo](#7-tutorial-publicando-um-novo-artigo)
    - [Passo 1: crie o arquivo Markdown](#passo-1-crie-o-arquivo-markdown)
    - [Passo 2: registre no índice](#passo-2-registre-no-índice)
    - [Passo 3: teste](#passo-3-teste)
  - [8. Personalizando o site](#8-personalizando-o-site)
  - [9. Publicando na web](#9-publicando-na-web)
  - [10. Decisões de projeto e limitações](#10-decisões-de-projeto-e-limitações)
  - [Autor](#autor)

---

## 1. O que você vai aprender

- Como organizar uma SPA sem framework, separando responsabilidades em módulos ES.
- Como funciona um **roteador por hash** (`#/slug`).
- Como carregar e renderizar **Markdown** com a biblioteca `marked`.
- Como manter o conteúdo desacoplado do código através de um **índice JSON**.

---

## 2. Visão geral da arquitetura

A regra central do projeto é: **cada arquivo tem uma única responsabilidade**.

| Arquivo      | Responsabilidade                                      | Sabe sobre...        |
| ------------ | ----------------------------------------------------- | -------------------- |
| `router.js`  | Observar a URL (hash) e decidir qual rota chamar      | Apenas a URL         |
| `content.js` | Buscar dados: índice JSON e arquivos Markdown         | Apenas `fetch`       |
| `pages.js`   | Transformar dados em HTML e montar as páginas         | Apenas o DOM         |
| `config.js`  | Guardar textos e links do site (marca, rodapé)        | Apenas configuração  |
| `main.js`    | Ligar as peças acima, sem lógica própria              | Todos, só para ligar |

O `main.js` é o "maestro": ele não busca dados nem monta HTML. Apenas conecta o roteador ao conteúdo e às páginas.

---

## 3. Estrutura de pastas

```text
devlore/
├── index.html
├── README.md
└── src/
    ├── assets/            # imagens e outros recursos estáticos
    ├── content/           # artigos em Markdown
    │   ├── article-01.md
    │   ├── article-02.md
    │   └── ...
    ├── data/
    │   └── content.json   # índice dos artigos (slug, título, arquivo, tags)
    ├── scripts/
    │   ├── main.js        # ponto de entrada
    │   ├── router.js      # roteador por hash
    │   ├── content.js     # carregamento de dados
    │   ├── pages.js       # renderização das páginas
    │   ├── config.js      # configuração do site
    │   └── marked.min.js  # biblioteca de Markdown (carregada globalmente)
    └── styles/
        └── style.css
```

> Os caminhos usados no código (`src/data/content.json`, `src/content/...`, `src/styles/style.css`) são relativos ao local do `index.html`. Mantenha o `index.html` na mesma pasta que contém a pasta `src/`, ou ajuste os caminhos.

---

## 4. Como o fluxo funciona

```text
  Usuário acessa  /#/historia-da-web
              │
              ▼
        ┌───────────┐   hash vazio?   ┌──────────────┐
        │ router.js │ ──────sim─────► │ handlers.home│
        └───────────┘                 └──────┬───────┘
              │ não                          │
              ▼                              ▼
     handlers.article(slug)          getContentList()  ──► content.json
              │                              │
              ▼                              ▼
     getArticle(slug)                 renderHome(root, list)
       ├─ busca o índice
       ├─ localiza o slug
       └─ busca o .md correspondente
              │
              ▼
     renderArticle(root, { entry, markdown })
       └─ marked.parse() → HTML → #app
```

Em resumo:

1. O usuário abre uma URL com hash.
2. O **router** lê o hash e chama o handler correto.
3. O **content** busca os dados necessários.
4. O **pages** converte os dados em HTML e injeta no elemento `#app`.

---

## 5. Módulos, um por um

### 5.1 `index.html`

Só contém uma `div` vazia (`#app`) e dois scripts:

```html
<div id="app"></div>

<script src="src/scripts/marked.min.js"></script>
<script type="module" src="src/scripts/main.js"></script>
```

Dois detalhes importantes:

- `marked.min.js` é carregado como script **clássico**, antes do módulo. Isso cria a variável global `marked`, usada em `pages.js`.
- `main.js` usa `type="module"`, o que habilita `import` e `export`.

### 5.2 `router.js`: o roteador

Hash router com apenas duas rotas:

| URL            | Resultado         |
| -------------- | ----------------- |
| `#/`           | Página inicial    |
| `#/<slug>`     | Artigo pelo slug  |

```js
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
```

Pontos de atenção:

- A regex `/^#\/?/` remove o `#` e a barra opcional, deixando só o slug.
- O evento `hashchange` dispara quando o usuário navega, sem recarregar a página.
- `resolveRoute()` é chamado uma vez no início para tratar a URL de entrada.
- O roteador **não conhece** artigos nem páginas: recebe `handlers` de fora (injeção de dependência).

### 5.3 `content.js`: a camada de dados

Duas funções exportadas:

- `getContentList()`: carrega `src/data/content.json` e guarda em cache (`contentListCache`), evitando requisições repetidas.
- `getArticle(slug)`: procura o slug no índice, busca o arquivo `.md` correspondente e retorna `{ entry, markdown }`. Se o slug não existir, retorna `null`.

```js
const entry = list.find((item) => item.slug === slug);
if (!entry) return null;

const res = await fetch(`src/content/${entry.file}`);
const markdown = await res.text();
return { entry, markdown };
```

### 5.4 `pages.js`: a camada de visualização

Funções de template (privadas):

- `renderNavbar()`: cabeçalho com link para a home.
- `renderFooter()`: rodapé com sobre, contato e links (dados vindos de `CONFIG`).
- `renderTags(tags)`: chips de tags.
- `renderArticleListItem(item)`: item da lista da home.

Páginas (exportadas):

- `renderHome(root, list)`: título, descrição, campo de busca e lista de artigos.
- `renderArticle(root, { entry, markdown })`: converte Markdown em HTML e exibe o artigo.
- `renderNotFound(root)`: página 404 para slugs inexistentes.

**A busca** na home filtra a lista em memória, comparando o texto digitado com o **título** e as **tags** de cada artigo:

```js
const filtered = list.filter((item) => {
  const titleMatch = item.title.toLowerCase().includes(q);
  const tagMatch = (item.tags || []).some((tag) => tag.toLowerCase().includes(q));
  return titleMatch || tagMatch;
});
```

**As tags no artigo**: após renderizar o Markdown, o código insere o bloco de tags logo depois do primeiro `</h1>`, funcionando como um subtítulo. Por isso, **todo artigo deve começar com um título `# ...`**.

### 5.5 `config.js`: configuração

Centraliza textos que aparecem em várias páginas:

```js
export const CONFIG = {
  brand:  { title, subtitle, description },
  footer: { about, contact: { email, whatsapp }, links: [...] },
};
```

Para mudar o nome do site, o texto do rodapé ou os links, edite apenas este arquivo.

### 5.6 `main.js`: a cola

```js
initRouter({
  home: async () => {
    const list = await getContentList();
    renderHome(root, list);
  },

  article: async (slug) => {
    const article = await getArticle(slug);
    if (!article) { renderNotFound(root); return; }
    renderArticle(root, article);
  },
});
```

Se você precisar entender "o que acontece quando abro uma página", comece por aqui.

---

## 6. Rodando localmente

Módulos ES e `fetch` **não funcionam** abrindo o `index.html` com duplo clique (protocolo `file://`). É preciso um servidor HTTP local.

**Opção A: Python** (já instalado na maioria dos sistemas)

```bash
cd devlore
python -m http.server 8000
```

Acesse `http://localhost:8000`.

**Opção B: Node**

```bash
npx serve .
```

**Opção C: VS Code**

Instale a extensão **Live Server**, clique com o botão direito em `index.html` e escolha **Open with Live Server**.

---

## 7. Tutorial: publicando um novo artigo

São três passos.

### Passo 1: crie o arquivo Markdown

Crie `src/content/article-07.md`. O arquivo **precisa começar com um título de nível 1**:

```markdown
# Meu Novo Artigo

Introdução do artigo...

## Primeira seção

Texto, listas, código e o que mais o Markdown permitir.
```

### Passo 2: registre no índice

Abra `src/data/content.json` e adicione um objeto à lista:

```json
{
  "slug": "meu-novo-artigo",
  "title": "Meu Novo Artigo",
  "file": "article-07.md",
  "tags": ["javascript", "tutorial"]
}
```

| Campo   | Para que serve                                                         |
| ------- | ---------------------------------------------------------------------- |
| `slug`  | Identificador na URL (`#/meu-novo-artigo`). Único, sem espaços.        |
| `title` | Título exibido na lista da home e usado na busca.                      |
| `file`  | Nome do arquivo dentro de `src/content/`.                              |
| `tags`  | Palavras-chave exibidas como chips e usadas na busca.                  |

A **ordem** dos objetos no JSON é a ordem de exibição na home.

### Passo 3: teste

Recarregue a página. O artigo deve aparecer na lista e abrir em `#/meu-novo-artigo`.

**Problemas comuns**

| Sintoma                         | Causa provável                                                  |
| ------------------------------- | --------------------------------------------------------------- |
| "Artigo não encontrado" (404)   | `slug` digitado diferente da URL, ou erro de sintaxe no JSON    |
| Página em branco                | Arquivo `.md` não encontrado (nome em `file` incorreto)         |
| Tags fora do lugar              | Artigo não começa com `# Título`                                |
| Nada carrega ao abrir o arquivo | Está usando `file://`; use um servidor local (seção 6)          |

---

## 8. Personalizando o site

- **Textos, rodapé e links:** `src/scripts/config.js`
- **Aparência:** `src/styles/style.css`
- **Ícone da aba:** a tag `<link rel="icon">` no `index.html`
- **Novas rotas:** adicione um handler em `main.js`, trate-o em `router.js` e crie a função de renderização em `pages.js`, mantendo a separação de responsabilidades.

---

## 9. Publicando na web

Como o projeto é estático, qualquer hospedagem de arquivos serve. No **GitHub Pages**:

1. Envie o projeto para um repositório no GitHub.
2. Vá em **Settings > Pages**.
3. Em **Source**, escolha a branch principal e a pasta raiz (`/`).
4. Aguarde a publicação e acesse a URL gerada.

O roteamento por hash é ideal para esse cenário: como a rota fica depois do `#`, o servidor nunca precisa saber que `/historia-da-web` existe, então não há configuração de redirecionamento.

---

## 10. Decisões de projeto e limitações

**Por que assim?**

- **Sem build e sem framework:** o código que você escreve é o código que o navegador executa. Fácil de entender, depurar e manter.
- **Hash router:** funciona em qualquer hospedagem estática, sem configuração.
- **Conteúdo em Markdown + índice JSON:** adicionar um artigo não exige tocar no código.
- **Módulos pequenos:** cada arquivo cabe na cabeça e pode ser trocado sem afetar os outros.

**Limitações conhecidas**

- Por usar hash, as URLs têm `#` e o SEO é limitado (os buscadores indexam mal conteúdo carregado dinamicamente).
- O Markdown é convertido com `marked.parse()` e inserido via `innerHTML` sem sanitização. Isso é seguro enquanto **você** for o único autor dos artigos; se um dia aceitar conteúdo de terceiros, sanitize o HTML (por exemplo, com DOMPurify).
- A busca é simples (título e tags) e não indexa o texto completo dos artigos.
- Os valores de `CONFIG` e `tags` são inseridos no HTML como texto bruto; não coloque neles conteúdo não confiável.

---

## Autor

**Guilherme Ribeiro** · [github.com/liberstack](https://github.com/liberstack)

O conteúdo é fornecido apenas para fins informativos. Nenhum dado do usuário é coletado, armazenado ou compartilhado.