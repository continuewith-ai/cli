import { addWidget } from './add.js';
import { printSnippet } from './snippet.js';
import { verifyInstall } from './verify.js';

function printHelp() {
  console.log(`ContinueWith CLI — add the AI handoff widget to your site

Usage:
  npx continuewith <command> [options]

Commands:
  add       Patch layout or HTML with the widget
  snippet   Print install snippet to stdout
  verify    Check whether the widget is already installed

Options:
  --framework <html|nextjs|astro>  Target stack (auto-detected when omitted)
  --site-key <key>                 Public site key (default: cw_demo_public_key)
  --mode <floating|inline>         Widget display mode (default: floating)
  --target <selector>              Inline mount selector (default: #continuewith-widget)
  --layout <vertical|horizontal>   Widget layout (default: vertical)
  --primary-color <hex>            Theme: primary button color
  --background <color>             Theme: panel background
  --text-color <color>             Theme: text color
  --border-color <color>           Theme: border color
  --cwd <path>                     Project directory (default: current directory)
  -h, --help                       Show this help

Examples:
  npx continuewith add
  npx continuewith add --framework nextjs
  npx continuewith snippet --framework html
  npx continuewith verify

Docs: https://continuewith.ai/docs/agents
`);
}

export function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    command: '',
    framework: '',
    siteKey: '',
    cwd: process.cwd(),
    help: false,
    mode: '',
    target: '',
    layout: '',
    theme: {},
  };

  if (!args.length || args[0] === '-h' || args[0] === '--help') {
    options.help = true;
    return options;
  }

  options.command = args[0];

  for (let index = 1; index < args.length; index += 1) {
    const token = args[index];
    if (token === '-h' || token === '--help') {
      options.help = true;
      continue;
    }
    if (token === '--framework') {
      options.framework = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--site-key') {
      options.siteKey = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--mode') {
      options.mode = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--target') {
      options.target = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--layout') {
      options.layout = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--primary-color') {
      options.theme.primaryColor = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--background') {
      options.theme.background = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--text-color') {
      options.theme.textColor = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--border-color') {
      options.theme.borderColor = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--cwd') {
      options.cwd = args[index + 1] || process.cwd();
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${token}`);
  }

  return options;
}

export async function runCli(argv) {
  const options = parseArgs(argv);
  if (options.help) {
    printHelp();
    return;
  }

  if (options.command === 'add') {
    const result = await addWidget(options);
    if (result.changed !== false) {
      console.log(`ContinueWith: updated ${result.file}`);
      console.log(`Site key: ${result.siteKey}`);
      console.log('Open a public page, then verify install from https://continuewith.ai/dashboard');
    }
    return;
  }

  if (options.command === 'snippet') {
    printSnippet({
      framework: options.framework || 'html',
      siteKey: options.siteKey,
      mode: options.mode,
      target: options.target,
      layout: options.layout,
      theme: options.theme,
    });
    return;
  }

  if (options.command === 'verify') {
    verifyInstall(options);
    return;
  }

  throw new Error(`Unknown command: ${options.command}. Run continuewith --help`);
}
