import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function firstExisting(cwd, candidates) {
  for (const candidate of candidates) {
    const fullPath = join(cwd, candidate);
    if (existsSync(fullPath)) return candidate;
  }
  return '';
}

function findAstroLayout(cwd) {
  const layoutsDir = join(cwd, 'src/layouts');
  if (!existsSync(layoutsDir)) return '';

  const preferred = ['BaseLayout.astro', 'Layout.astro'];
  for (const name of preferred) {
    const candidate = join('src/layouts', name);
    if (existsSync(join(cwd, candidate))) return candidate;
  }

  const files = readdirSync(layoutsDir).filter((name) => name.endsWith('.astro'));
  return files.length ? join('src/layouts', files[0]) : '';
}

export function detectFramework(cwd) {
  const nextLayout = firstExisting(cwd, ['app/layout.tsx', 'src/app/layout.tsx']);
  if (nextLayout) return { framework: 'nextjs', file: nextLayout };

  if (existsSync(join(cwd, 'astro.config.mjs')) || existsSync(join(cwd, 'astro.config.ts'))) {
    const astroLayout = findAstroLayout(cwd);
    if (astroLayout) return { framework: 'astro', file: astroLayout };
  }

  const htmlFile = firstExisting(cwd, ['index.html', 'public/index.html']);
  if (htmlFile) return { framework: 'html', file: htmlFile };

  return null;
}
