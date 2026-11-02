# Workflow de Ebook: de Markdown a EPUB com VSCode e Pandoc

Escrever um ebook direto em processador de texto costuma virar dor de cabeça: formatação inconsistente, controle de versão inexistente, exportação travada num único formato. Um workflow baseado em Markdown resolve isso — texto puro, versionável, e conversível para EPUB, PDF ou DOCX sem retrabalho.

## 1. Estrutura do projeto

Organize os capítulos em arquivos separados. Facilita revisão e reordenação:

```
meu-ebook/
├── metadata.yaml
├── capa.png
├── 01-introducao.md
├── 02-capitulo-um.md
├── 03-capitulo-dois.md
└── css/
    └── estilo.css
```

## 2. Extensões úteis no VSCode

- **Markdown All in One** — atalhos, sumário automático, preview.
- **markdownlint** — força consistência de formatação (cabeçalhos, listas, espaçamento).
- **Pandoc Markdown Extended Syntax Highlighting** — evita quebra de sintaxe ao usar recursos específicos do Pandoc (notas de rodapé, `{.class}`, etc).
- **Code Spell Checker** — revisão ortográfica básica direto no editor.

Nenhuma delas é obrigatória, mas juntas eliminam boa parte da fricção de escrever texto longo em Markdown.

## 3. Metadados no YAML

O Pandoc lê metadados de um bloco YAML ou de um arquivo separado. Exemplo de `metadata.yaml`:

```yaml
title: "Título do Ebook"
author: "Seu Nome"
language: pt-BR
cover-image: capa.png
rights: "© 2026 Seu Nome"
```

## 4. Convertendo para EPUB

Com os capítulos e o metadata prontos, o comando básico é:

```bash
pandoc metadata.yaml 01-introducao.md 02-capitulo-um.md 03-capitulo-dois.md \
  -o ebook.epub \
  --toc \
  --toc-depth=2 \
  --css=css/estilo.css
```

- `--toc` gera sumário automático a partir dos cabeçalhos.
- `--css` aplica estilo customizado dentro do EPUB (a maioria dos leitores respeita CSS embutido).
- A ordem dos arquivos `.md` no comando define a ordem dos capítulos.

## 5. Validando o arquivo gerado

Antes de publicar, vale rodar o EPUB por um validador (o `epubcheck` é o padrão de mercado) para pegar problemas de estrutura interna que não aparecem visualmente:

```bash
epubcheck ebook.epub
```

## 6. Gerando outros formatos a partir da mesma fonte

Como a fonte é Markdown puro, o mesmo conteúdo serve para outras saídas sem reescrever nada:

```bash
# PDF (requer uma engine LaTeX instalada, ex: TinyTeX)
pandoc metadata.yaml *.md -o ebook.pdf --pdf-engine=xelatex

# DOCX
pandoc metadata.yaml *.md -o ebook.docx
```

## Resumo do fluxo

1. Escrever os capítulos em Markdown, um arquivo por capítulo.
2. Manter metadados centralizados em `metadata.yaml`.
3. Usar extensões do VSCode para consistência e preview.
4. Compilar com Pandoc para EPUB (e opcionalmente PDF/DOCX a partir da mesma fonte).
5. Validar o EPUB antes de distribuir.

O ganho principal desse workflow não é velocidade na primeira versão — é a facilidade de revisar, versionar com Git e reexportar quando o conteúdo muda.