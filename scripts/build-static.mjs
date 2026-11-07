// Copyright (c) 2026 Janat Yasser. All rights reserved.
//
// Builds a static copy of AlgoViz in dist/ for GitHub Pages. Every page is
// rendered by the real Express app, saved as a folder with an index.html,
// and its links are made relative so the site works under any sub-path
// (e.g. https://<user>.github.io/algoviz/). All the visualisation already
// runs in the browser, so nothing is lost.
//
//   node scripts/build-static.mjs

import { spawn } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const { algorithms } = createRequire(import.meta.url)(path.join(root, 'models/Algorithm.js'));
const PORT = 3917;

// URL on the server -> folder in dist/
const pages = [
  ['/', ''],
  ['/race', 'race'],
  ['/sorting', 'sorting'],
  ...algorithms.sorting.map((a) => [`/sorting/${a.id}`, `sorting/${a.id}`]),
  ['/pathfinding', 'pathfinding'],
  ...algorithms.pathfinding.map((a) => [`/pathfinding?algo=${a.id}`, `pathfinding/${a.id}`]),
  ['/trees', 'trees'],
];

function relativise(html, dir) {
  const up = dir ? '../'.repeat(dir.split('/').length) : './';
  return html
    // /pathfinding?algo=x -> pathfinding/x/
    .replace(/(href)="\/pathfinding\?algo=([\w-]+)"/g, `$1="${up}pathfinding/$2/"`)
    // /race?algos=... -> race/?algos=...
    .replace(/(href)="\/race\?/g, `$1="${up}race/?`)
    // other absolute links: pages get a trailing slash, files keep their name
    .replace(/(href|src|action)="\/([^"]*)"/g, (_, attr, p) => {
      if (p === '') return `${attr}="${up}"`;
      const isFile = /\.[a-z0-9]+(\?.*)?$/i.test(p);
      return `${attr}="${up}${p}${isFile || p.endsWith('/') ? '' : '/'}"`;
    });
}

const server = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  for (let i = 0; ; i++) {
    try { await fetch(`http://127.0.0.1:${PORT}/`); break; }
    catch { if (i > 50) throw new Error('server did not start'); await new Promise((r) => setTimeout(r, 100)); }
  }
  await rm(out, { recursive: true, force: true });
  await cp(path.join(root, 'public'), out, { recursive: true });

  for (const [url, dir] of [...pages, ['/__missing__', '__404']]) {
    const res = await fetch(`http://127.0.0.1:${PORT}${url}`);
    if (!res.ok && dir !== '__404') throw new Error(`${url} -> ${res.status}`);
    const html = await res.text();
    if (dir === '__404') {
      // GitHub Pages serves 404.html from the site root for any missing path; use root-relative-free links
      await writeFile(path.join(out, '404.html'), relativise(html, '').replace(/="\.\//g, '="/algoviz/'));
      continue;
    }
    await mkdir(path.join(out, dir), { recursive: true });
    await writeFile(path.join(out, dir, 'index.html'), relativise(html, dir));
  }
  await writeFile(path.join(out, '.nojekyll'), '');
  console.log(`Built ${pages.length} pages into dist/`);
} finally {
  server.kill();
}
