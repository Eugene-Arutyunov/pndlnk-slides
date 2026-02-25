# AGENTS.md

## Cursor Cloud specific instructions

This is a static slide-presentation site built with **Eleventy (11ty) v3** using Nunjucks templates.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves at `http://localhost:8080/`) |
| Build | `npm run build` (outputs to `_site/`) |

### Notes

- There is only one npm dependency (`@11ty/eleventy`). No linter, test framework, or formatter is configured.
- The dev server (`eleventy --serve`) supports hot-reload for templates and watched CSS/JS files.
- Slide navigation uses keyboard arrow keys (left/right) and click regions in the browser.
- Source content is in `src/`; Nunjucks includes are in `src/includes/`; design-system CSS is in `src/ids/`.
- No databases, Docker, environment variables, or external services are needed.
