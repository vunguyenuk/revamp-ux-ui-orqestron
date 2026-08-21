# Orqestron Workspace

Interactive real-estate transaction document workspace built with Next.js and
React. It includes PDF page previews, transaction document management, a form
library, fillable field overlays, and assistant/clauses panels.

## Requirements

- Node.js `>=22.13.0`

## Development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Checks

```bash
npm run lint
npm run build
```

## Standalone export

With the development or production server running, generate the standalone
`index.html` editor and `transactions.html` transaction list with:

```bash
npm run export:standalone
```

Set `ORQESTRON_ORIGIN` when the server is not running at
`http://127.0.0.1:3000`.
