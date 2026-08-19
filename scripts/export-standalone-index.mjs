import { readFile, writeFile } from "node:fs/promises";

const source = await fetch("http://127.0.0.1:3000/").then((response) => response.text());
const cssPath = source.match(/href="(\/assets\/index-[^"]+\.css)"/)?.[1];
if (!cssPath) throw new Error("Could not find the built stylesheet.");
const css = await readFile(new URL(`../dist/client${cssPath}`, import.meta.url), "utf8");
const body = source.match(/<body>([\s\S]*?)<script id="_R_">/)?.[1];

if (!body) throw new Error("Could not extract the rendered page.");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Orqestron — Form Editor</title>
  <style>${css}</style>
</head>
<body>${body}
<script>
document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    button.animate([{transform:'scale(.98)'},{transform:'scale(1)'}], {duration:140});
  });
});
</script>
</body>
</html>`;

await writeFile(new URL("../index.html", import.meta.url), html);
