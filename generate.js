const fs = require("fs");
const path = require("path");

// Složky, které přeskočíme
const IGNORE = new Set(["node_modules", ".git", ".cloudflare"]);

// Najdi všechny složky a v nich HTML soubory
const sections = fs
  .readdirSync(".")
  .filter((f) => {
    if (IGNORE.has(f) || f.startsWith(".")) return false;
    return fs.statSync(f).isDirectory();
  })
  .map((dir) => {
    const htmlFiles = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".html"))
      .map((f) => ({
        name: f.replace(".html", ""),
        path: `/${encodeURIComponent(dir)}/${encodeURIComponent(f)}`,
      }));
    return { section: dir, items: htmlFiles };
  })
  .filter((s) => s.items.length > 0);

if (sections.length === 0) {
  console.log("Žádné složky s HTML soubory nenalezeny.");
  process.exit(0);
}

// Generuj sekce HTML
const sectionsHtml = sections
  .map(
    ({ section, items }) => `
    <div class="card">
      <div class="section-title">${escapeHtml(section)}</div>
      ${items
        .map(
          ({ name, path: href }, i) => `
        ${i > 0 ? '<div class="divider"></div>' : ""}
        <a class="item" href="${href}">
          <span class="item-name">${escapeHtml(name)}</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>`
        )
        .join("")}
    </div>`
  )
  .join("\n");

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rozcestník</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #f2f2f7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      padding: 0 0 40px;
      -webkit-font-smoothing: antialiased;
    }

    .page-header {
      padding: 56px 20px 8px;
      max-width: 430px;
      margin: 0 auto;
    }

    h1 {
      font-size: 34px;
      font-weight: 700;
      color: #000;
      letter-spacing: -0.5px;
    }

    .content {
      padding: 16px 16px 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 430px;
      margin: 0 auto;
    }

    .card {
      background: #fff;
      border-radius: 14px;
      overflow: hidden;
    }

    .section-title {
      font-size: 17px;
      font-weight: 600;
      color: #000;
      padding: 14px 16px 12px;
    }

    .divider {
      height: 1px;
      background: #e5e5ea;
      margin-left: 16px;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      text-decoration: none;
      color: #000;
      transition: background 0.15s;
      cursor: pointer;
    }

    .item:active {
      background: #f2f2f7;
    }

    @media (hover: hover) {
      .item:hover {
        background: #f9f9fb;
      }
    }

    .item-name {
      font-size: 17px;
      color: #000;
    }

    .chevron {
      width: 18px;
      height: 18px;
      color: #c7c7cc;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="page-header">
    <h1>Rozcestník</h1>
  </div>
  <div class="content">
    ${sectionsHtml}
  </div>
</body>
</html>`;

fs.writeFileSync("index.html", html);
console.log(
  `✓ index.html vygenerován: ${sections.length} sekcí, ${sections.reduce((n, s) => n + s.items.length, 0)} prototypů`
);
