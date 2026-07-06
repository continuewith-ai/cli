import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEMO_PUBLIC_KEY,
  astroWidgetSnippet,
  hasContinueWithInstall,
  htmlWidgetSnippet,
  inlineMountMarkup,
  nextJsWidgetBlock,
} from './install.js';
import { detectFramework } from './detect.js';

function readProjectFile(cwd, relativePath) {
  return readFileSync(join(cwd, relativePath), 'utf8');
}

function writeProjectFile(cwd, relativePath, contents) {
  writeFileSync(join(cwd, relativePath), contents, 'utf8');
}

function widgetOptions(input) {
  return {
    siteKey: input.siteKey,
    mode: input.mode,
    target: input.target,
    layout: input.layout,
    theme: input.theme,
  };
}

function patchHtml(contents, options) {
  if (hasContinueWithInstall(contents)) return { changed: false, contents };

  const mount = options.mode === 'inline' ? `  ${inlineMountMarkup(options.target)}\n` : '';
  const snippet = `  ${htmlWidgetSnippet(options)}\n`;
  const block = `${mount}${snippet}`;
  if (contents.includes('</body>')) {
    return { changed: true, contents: contents.replace('</body>', `${block}</body>`) };
  }

  return { changed: true, contents: `${contents.trimEnd()}\n${block}` };
}

function patchNextJs(contents, options) {
  if (hasContinueWithInstall(contents)) return { changed: false, contents };

  let next = contents;
  if (!next.includes("from 'next/script'") && !next.includes('from "next/script"')) {
    const importLine = "import Script from 'next/script';";
    const firstImport = next.match(/^import .+$/m);
    next = firstImport ? next.replace(firstImport[0], `${firstImport[0]}\n${importLine}`) : `${importLine}\n${next}`;
  }

  const mount = options.mode === 'inline' ? `        ${inlineMountMarkup(options.target)}\n` : '';
  const block = `${mount}${nextJsWidgetBlock(options)}`;
  if (next.includes('</body>')) {
    next = next.replace('</body>', `${block}\n      </body>`);
    return { changed: true, contents: next };
  }

  throw new Error('Could not find </body> in Next.js layout.tsx');
}

function patchAstro(contents, options) {
  if (hasContinueWithInstall(contents)) return { changed: false, contents };

  const mount = options.mode === 'inline' ? `    ${inlineMountMarkup(options.target)}\n` : '';
  const snippet = `    ${astroWidgetSnippet(options)}\n`;
  const block = `${mount}${snippet}`;
  if (contents.includes('</body>')) {
    return { changed: true, contents: contents.replace('</body>', `${block}  </body>`) };
  }

  if (contents.includes('</html>')) {
    return { changed: true, contents: contents.replace('</html>', `${block}</html>`) };
  }

  throw new Error('Could not find </body> or </html> in Astro layout');
}

function resolveFileForFramework(cwd, framework) {
  if (framework === 'nextjs') {
    return ['app/layout.tsx', 'src/app/layout.tsx'].find((candidate) => existsSync(join(cwd, candidate))) || '';
  }
  if (framework === 'html') {
    return ['index.html', 'public/index.html'].find((candidate) => existsSync(join(cwd, candidate))) || '';
  }
  if (framework === 'astro') {
    const detected = detectFramework(cwd);
    return detected?.framework === 'astro' ? detected.file : '';
  }
  return '';
}

export async function addWidget({ framework = '', siteKey = '', cwd = process.cwd(), mode = '', target = '', layout = '', theme = {} }) {
  const resolvedKey = siteKey || DEMO_PUBLIC_KEY;
  const options = widgetOptions({
    siteKey: resolvedKey,
    mode: mode === 'inline' ? 'inline' : 'floating',
    target: target || '#continuewith-widget',
    layout: layout === 'horizontal' ? 'horizontal' : 'vertical',
    theme,
  });
  const detected = detectFramework(cwd);
  const targetFramework = framework || detected?.framework;

  if (!targetFramework) {
    throw new Error('Could not detect framework. Use --framework html|nextjs|astro');
  }

  const file = framework
    ? resolveFileForFramework(cwd, targetFramework)
    : detected?.file || resolveFileForFramework(cwd, targetFramework);

  if (!file) {
    throw new Error(`No ${targetFramework} entry file found in ${cwd}`);
  }

  const original = readProjectFile(cwd, file);
  const patchers = {
    html: patchHtml,
    nextjs: patchNextJs,
    astro: patchAstro,
  };
  const patcher = patchers[targetFramework];
  if (!patcher) throw new Error(`Unsupported framework: ${targetFramework}`);

  const { changed, contents } = patcher(original, options);
  if (!changed) {
    console.log('ContinueWith: widget already installed, no changes made');
    return { file, siteKey: resolvedKey, changed: false };
  }

  writeProjectFile(cwd, file, contents);
  return { file, siteKey: resolvedKey, changed: true };
}
