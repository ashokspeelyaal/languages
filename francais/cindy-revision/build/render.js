// Render the French revision volumes to A4 PDFs.
//   NODE_PATH=/Users/ashokkumar/Development/Workspace/SpeelYaal/campuszeus-college/demo-recorder/node_modules \
//   node build/render.js [name ...]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, '')).sort();
  const SHELL = '/Users/ashokkumar/Library/Caches/ms-playwright/chromium_headless_shell-1237/chrome-headless-shell-mac-arm64/chrome-headless-shell';
  const opts = fs.existsSync(SHELL) ? { executablePath: SHELL } : {};
  const b = await chromium.launch(opts); const p = await b.newPage();
  for (const g of names) {
    await p.goto('file://' + path.join(ROOT, `${g}.html`), { waitUntil: 'networkidle', timeout: 180000 });
    await p.pdf({ path: path.join(ROOT, `${g}.pdf`), format: 'A4',
      margin: { top: '11mm', bottom: '11mm', left: '9mm', right: '9mm' }, printBackground: true });
    const kb = (fs.statSync(path.join(ROOT, `${g}.pdf`)).size / 1024).toFixed(0);
    console.log(`rendered ${g}.pdf  (${kb} KB)`);
  }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
