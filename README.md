# distillery app kit

Shared look and behavior for distillery apps built in Google AI Studio. One stylesheet and one script, loaded from this repo through jsDelivr, so a fix here reaches every app.

Version 0.1.0 (test release): brand tokens, light/dark preference, the app lockup, and the motion marks.

## Load it

Paste this block inside `<head>` of the app's `index.html` (it is also in `head-snippet.html`). Pin the version. The last script shows a red notice if the kit ever fails to load.

```html
<!-- distillery app kit: do not remove, inline, copy, or edit these lines. Only the version may change. See KIT_RULES.md -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wearedistilleryhub/distillery-app-kit@v0.1.0/kit.css">
<script src="https://cdn.jsdelivr.net/gh/wearedistilleryhub/distillery-app-kit@v0.1.0/kit.js" defer></script>
<script>addEventListener("load",function(){if(!window.distillery){var b=document.createElement("div");b.textContent="distillery kit did not load. Check the kit lines in index.html.";b.style.cssText="position:fixed;bottom:12px;left:12px;z-index:99999;font:13px system-ui;background:#C8372D;color:#fff;padding:8px 12px;border-radius:8px";document.body.appendChild(b)}})</script>
<!-- end distillery app kit -->
```

Then copy `distillery-kit.d.ts` into the app's `src/` folder and `KIT_RULES.md` into the app's root.

## What you get

| Piece | Use |
|---|---|
| CSS variables | `--d-bg`, `--d-surface`, `--d-ink`, `--d-ink-soft`, `--d-line`, `--d-accent`, `--d-blue`, `--d-font`, `--d-radius`… switch with light/dark automatically |
| `.d-lockup` | `<div class="d-lockup"><span class="d-brand">distillery</span><span class="d-sep"></span><span class="d-app">App name</span></div>` |
| `<d-theme-toggle>` | Light / Dark / System control. Saves the choice in this browser (no cookies). |
| `<d-loop mark="wave" state="idle">` | Motion mark. Marks: `still`, `wave`, `ease`, `route`, `film`, `align`. States: `idle`, `working`, `done`. |
| `window.distillery.theme` | `get()`, `set("light" \| "dark" \| "system")`, `resolved()` |

## Tailwind v4 apps

Map the kit variables into Tailwind in the app's own `index.css`, so classes like `bg-d-surface` follow the theme:

```css
@theme inline {
  --color-d-bg: var(--d-bg);
  --color-d-surface: var(--d-surface);
  --color-d-ink: var(--d-ink);
  --color-d-ink-soft: var(--d-ink-soft);
  --color-d-line: var(--d-line);
  --color-d-accent: var(--d-accent);
  --font-sans: var(--d-font);
}
```

## Telling Gemini

When starting a new app or adopting the kit, tell Gemini: "Follow KIT_RULES.md for every change." The rules file lives in the app, so Gemini reads it alongside the code.

## Versioning

Tags are immutable. Fixes ship as a new tag (`v0.1.1`), and each app moves to it by changing the version in its two lines.
