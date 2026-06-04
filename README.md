# pops-place-embeds

Public hosting for Pop's Place **Wix Custom Element** JavaScript files.

These are self-contained web components (`class extends HTMLElement` +
`customElements.define(...)`) loaded into Wix Studio via **Custom Element →
Choose Source → Server URL**, served fast over the jsDelivr CDN.

## Files

- `custom-elements/pops-starfield.js` — `<pops-starfield>` animated night-sky
  background (hero / wedge / flat modes). See the header comment in the file for
  attributes and Wix setup.

## jsDelivr URL pattern

```
https://cdn.jsdelivr.net/gh/shaynesmizzle/pops-place-embeds@main/custom-elements/pops-starfield.js
```

Edits pushed to `main` propagate after jsDelivr's cache TTL (or use a commit
hash / version tag in place of `@main` to force a specific version).
