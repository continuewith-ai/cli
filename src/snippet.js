import { snippetForFramework, DEMO_PUBLIC_KEY } from './install.js';

export function printSnippet({ framework = 'html', siteKey = '', mode = '', target = '', layout = '', theme = {} } = {}) {
  const resolvedFramework = ['html', 'nextjs', 'astro'].includes(framework) ? framework : 'html';
  const resolvedKey = siteKey || DEMO_PUBLIC_KEY;
  console.log(snippetForFramework(resolvedFramework, resolvedKey, {
    mode: mode === 'inline' ? 'inline' : 'floating',
    target: target || '#continuewith-widget',
    layout: layout === 'horizontal' ? 'horizontal' : 'vertical',
    theme,
  }));
}
