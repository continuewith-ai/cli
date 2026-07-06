# continuewith

CLI to add the [ContinueWith](https://continuewith.ai) **AI-native continuation layer** to HTML, Next.js, and Astro sites.

Visitors continue any page in ChatGPT, Claude, Gemini, Grok, Perplexity, or Mistral — with URL and context attached.

## Install

```bash
npx continuewith@latest add
```

No global install required. Node.js 18+.

## Commands

| Command | Description |
|---------|-------------|
| `add` | Patch your layout or HTML with the widget snippet |
| `snippet` | Print the install snippet to stdout |
| `verify` | Check whether the widget is already in your entry file |

## Examples

```bash
# Auto-detect framework and patch the project
npx continuewith add

# Explicit stack
npx continuewith add --framework nextjs
npx continuewith add --framework html
npx continuewith add --framework astro

# Print snippet only
npx continuewith snippet --framework html

# Verify install in detected entry file
npx continuewith verify

# Use your dashboard public key (recommended for production)
npx continuewith add --site-key cw_your_public_key
```

### Theming (optional)

```bash
npx continuewith add \
  --primary-color "#111827" \
  --background "#ffffff" \
  --text-color "#111827" \
  --border-color "#e5e7eb"
```

## Site keys

- **Demo:** `cw_demo_public_key` — used by default so you can try the widget immediately.
- **Production:** create a free account → [dashboard](https://continuewith.ai/dashboard) → copy your **public site key**.

Public keys are meant to be embedded in HTML (like a Stripe publishable key). They identify your site for config and analytics — they are **not** admin credentials.

## Documentation

- [Install guide](https://continuewith.ai/docs/install)
- [Coding agents & MCP](https://continuewith.ai/docs/agents)
- [Prompt library](https://continuewith.ai/docs/prompts)
- [Platform guides](https://continuewith.ai/docs/guides) (Ghost, Webflow, WordPress, Shopify, Framer, …)
- [Live test page](https://continuewith.ai/test-widget)

## Related packages

| Package | Purpose |
|---------|---------|
| [`@continuewith/mcp`](https://www.npmjs.com/package/@continuewith/mcp) | MCP tools for Cursor / Claude Code |
| [`@continuewith/sdk`](https://www.npmjs.com/package/@continuewith/sdk) | Snippet & prompt helpers |

## Trust & security

**What this CLI does locally:**

- Reads your project files to detect framework and patch install targets
- Writes the widget `<script>` tag (or Next.js `<Script>`) — nothing else
- `verify` only reads your entry file; no upload of source code

**What it does not do:**

- No hidden network exfiltration of your codebase
- No API keys or secrets stored in the CLI package
- No write access outside the detected entry file (unless you pass `--cwd`)

**Default demo key:** `cw_demo_public_key` is public by design. Replace it before launch.

- [Security](https://continuewith.ai/security)
- [Privacy](https://continuewith.ai/privacy)
- [Terms](https://continuewith.ai/terms)

## Community

- Website: [continuewith.ai](https://continuewith.ai)
- X: [@continuewithai](https://x.com/continuewithai)
- Reddit: [@continuewithai](https://www.reddit.com/user/continuewithai)

## License

MIT © [ContinueWith](https://continuewith.ai)
