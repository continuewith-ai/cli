import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { addWidget } from '../src/add.js';
import { detectFramework } from '../src/detect.js';

test('detectFramework finds nextjs, html and astro projects', () => {
  const root = mkdtempSync(join(tmpdir(), 'cw-detect-'));

  writeFileSync(join(root, 'index.html'), '<html><body></body></html>', 'utf8');
  assert.deepEqual(detectFramework(root), { framework: 'html', file: 'index.html' });

  const nextRoot = mkdtempSync(join(tmpdir(), 'cw-detect-next-'));
  mkdirSync(join(nextRoot, 'app'), { recursive: true });
  writeFileSync(join(nextRoot, 'app', 'layout.tsx'), 'export default function RootLayout() { return <html><body></body></html>; }', 'utf8');
  assert.equal(detectFramework(nextRoot)?.framework, 'nextjs');

  const astroRoot = mkdtempSync(join(tmpdir(), 'cw-detect-astro-'));
  writeFileSync(join(astroRoot, 'astro.config.mjs'), 'export default {};', 'utf8');
  mkdirSync(join(astroRoot, 'src', 'layouts'), { recursive: true });
  writeFileSync(join(astroRoot, 'src', 'layouts', 'Layout.astro'), '<html><body></body></html>', 'utf8');
  assert.deepEqual(detectFramework(astroRoot), { framework: 'astro', file: 'src/layouts/Layout.astro' });
});

test('addWidget patches html and is idempotent', async () => {
  const root = mkdtempSync(join(tmpdir(), 'cw-add-html-'));
  const file = join(root, 'index.html');
  writeFileSync(file, '<!doctype html><html><body><h1>Hi</h1></body></html>', 'utf8');

  const first = await addWidget({ cwd: root, framework: 'html' });
  assert.equal(first.changed, true);
  assert.match(readFileSync(file, 'utf8'), /widget\/v1\.js/);

  const second = await addWidget({ cwd: root, framework: 'html' });
  assert.equal(second.changed, false);
});

test('addWidget patches nextjs layout', async () => {
  const root = mkdtempSync(join(tmpdir(), 'cw-add-next-'));
  mkdirSync(join(root, 'app'), { recursive: true });
  const layout = join(root, 'app', 'layout.tsx');
  writeFileSync(layout, `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`, 'utf8');

  await addWidget({ cwd: root, framework: 'nextjs' });
  const contents = readFileSync(layout, 'utf8');
  assert.match(contents, /from 'next\/script'/);
  assert.match(contents, /data-site-key="cw_demo_public_key"/);
});

test('snippet command prints html snippet', async () => {
  const { printSnippet } = await import('../src/snippet.js');
  const logs = [];
  const original = console.log;
  console.log = (...args) => logs.push(args.join(' '));
  try {
    printSnippet({ framework: 'html' });
    assert.match(logs.join('\n'), /widget\/v1\.js/);
  } finally {
    console.log = original;
  }
});

test('verify command detects installed widget', async () => {
  const root = mkdtempSync(join(tmpdir(), 'cw-verify-'));
  writeFileSync(join(root, 'index.html'), '<html><body><script src="https://continuewith.ai/widget/v1.js" data-site-key="cw_demo_public_key" defer></script></body></html>', 'utf8');
  const { verifyInstall } = await import('../src/verify.js');
  const result = verifyInstall({ cwd: root });
  assert.equal(result.installed, true);
});
