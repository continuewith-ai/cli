import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hasContinueWithInstall } from './install.js';
import { detectFramework } from './detect.js';

export function verifyInstall({ cwd = process.cwd(), framework = '' } = {}) {
  const detected = detectFramework(cwd);
  const targetFramework = framework || detected?.framework;
  if (!targetFramework || !detected?.file) {
    throw new Error('Could not find a project entry file to verify. Use --framework or run from a project root.');
  }

  const contents = readFileSync(join(cwd, detected.file), 'utf8');
  const installed = hasContinueWithInstall(contents);
  if (installed) {
    console.log(`ContinueWith: install detected in ${detected.file}`);
    return { installed: true, file: detected.file };
  }

  console.log(`ContinueWith: widget not found in ${detected.file}`);
  return { installed: false, file: detected.file };
}
