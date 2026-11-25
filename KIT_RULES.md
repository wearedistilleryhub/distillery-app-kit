# distillery app kit rules

This app uses the shared distillery app kit. These rules apply to every change, by people or by Gemini.

1. Keep the kit block in `index.html` `<head>` exactly as written, between the `distillery app kit` comments. Never remove, inline, copy, or rewrite it. Only the version number (`@v0.1.0`) may change.
2. Never copy kit code (kit.js or kit.css) into this app. If the kit needs a change, it is made in the kit repo: https://github.com/wearedistilleryhub/distillery-app-kit
3. Colors and type come from the kit's CSS variables: `--d-bg`, `--d-surface`, `--d-surface-2`, `--d-ink`, `--d-ink-soft`, `--d-line`, `--d-accent`, `--d-blue`, `--d-font`, `--d-font-mono`. Do not hardcode hex colors for these roles. In Tailwind, use the `d-*` color names mapped in `index.css`.
4. Light and dark mode come from the kit. Do not build a theme switcher or store a theme setting. Place `<d-theme-toggle></d-theme-toggle>` in the header.
5. Show the app name with the lockup: `<div className="d-lockup"><span className="d-brand">distillery</span><span className="d-sep"></span><span className="d-app">App name</span></div>`
6. For any loading, thinking, or processing state, use `<d-loop mark="MARK" state="working" />`, and set `state="done"` when results arrive. This app's mark is: MARK
7. Keep `src/distillery-kit.d.ts`. It tells TypeScript the kit's tags are valid. Never remove `<d-loop>` or `<d-theme-toggle>` to fix a type error.
8. Text is sentence case. Never use all caps, including labels and headings.
