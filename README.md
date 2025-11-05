# Chart Module Distribution / CDN Source

> Deprecation: Former WordPress theme copy/override workflow has been removed. Use the plugin (recommended) or generic HTML script tags with the CDN assets. Theme-based enqueue examples are no longer maintained.

Drop-in bundle & datasets for portable WordPress plugin or generic HTML integration. Replace the files here to ship updates—no PHP or block edits needed after initial setup.

## Files
- `chart-module.iife.js` – Global IIFE exposing `window.ChartModule.mount/unmount`.
- `chart-data.json` – Primary multi-chart dataset (auto-loaded if present).
- `chart-data.csv` – Fallback dataset (used only if JSON missing). Pipe `|` delimited labels.

## Quick Start (Plugin or Standalone HTML)
1. Enqueue the CDN scripts (module first, dataset second) in your plugin.
2. Add a container `<div id="chart-root"></div>` in your render output.
3. Call `window.ChartModule.mount({ selector: '#chart-root' })` (or rely on Gutenberg block wrapper).

## Automated Builder Workflow
This repository is populated by the sibling builder project `wp-react-chart-module-starter` which:
1. Fetches upstream data sources (`npm run fetch:datasets`).
2. Builds the React/Chart.js bundle (`npm run build`).
3. Publishes bundle + dataset artifacts here (`npm run publish:dist`) and injects SRI hashes into integration docs.
4. (Optionally) Tags releases & pushes updates on a schedule (GitHub Actions cron / Netlify).

Manual edits to dataset files are not required; the builder overwrites `chart-data.*` each run. Treat this repo as a read-only CDN source for consumers.

## Global API
```js
window.ChartModule.mount({
  selector: '#chart-root', // container holding multiple chart <canvas> targets or a single one
  // optional future props could include theme overrides, palette etc.
});
// Later:
window.ChartModule.unmount();
```
All charts render automatically by scanning the container and ingesting data from JSON (or CSV fallback) once. Multiple charts are supported—each dataset row/object becomes a chart instance.

## Asset Resolution (Runtime)
Resolution precedence inside the loader:
1. Global `window.ChartModuleData` (from `chart-data.min.js` or `chart-data.js`)
2. `chart-data.json`
3. `chart-data.csv`
4. Manual props passed to `ChartModule.mount()` (labels/values) override all.

If JSON exists it is preferred over CSV. CSV is parsed (labels split on `|`).

## Architecture Overview
### Optional Future SQL Sync
The builder can push the same dataset rows into an external MySQL table using `scripts/export-to-sql.mjs` when DB_* secrets are provided (see workflow). This enables downstream apps to query charts dynamically without parsing files.

Env variables required:
- DB_HOST / DB_USER / DB_PASS / DB_NAME / DB_TABLE

If not set, the export step is skipped safely.

```
      +--------------------------+          +-------------------+
      |  External Data Sources   |  fetch   |  Builder Project  |
      |  (APIs / raw JSON/CSV)  +---------->  wp-react-chart-   |
      +--------------------------+          |  module-starter   |
                     |  | build
                     v  v
                  +-------------------+
                  |  chart-repo (CDN) |
                  |  chart-module...  |
                  |  chart-data.*     |
                  +---------+---------+
                    |
                 jsDelivr / Raw GitHub
                    |
          +---------------+-------------+---------------+
     |               |
   WordPress Plugin      Plain HTML App
     |               |
    enqueue scripts       <script> tags
     |               |
   window.ChartModule.mount(...) renders charts from dataset
```

## Versioning / Cache Busting
| Strategy | Pros | Cons |
|----------|------|------|
| Query param `?ver=20251104` | Simple, works with WP core enqueue | Some CDNs may ignore query for long TTL assets |
| Semantic filename `chart-module.v1.2.0.iife.js` + stable alias | Clear provenance, immutable deployment | Requires extra copy/symlink management |
| Hash filename `chart-module.ab12cd.iife.js` | Strong cache busting | Harder manual diffing / rollback |

Recommended hybrid: keep canonical `chart-module.iife.js` (used by existing templates) and also publish a versioned copy for rollback tracking. In PHP enqueue, pass the semantic version as the `ver` argument.

### Upgrade Checklist (Automated runs perform 1–3)
- [ ] Builder run completed (fetch + build + publish)
- [ ] Optional: Create git tag for release (`PUBLISH_TAG` or AUTO_TAG)
- [ ] Purge third-party caches if self-hosting assets
- [ ] Verify mount + charts on staging

## Legacy Notice
Legacy filename support removed—only `chart-module.iife.js` is used. Ensure all environments reference the new name.

## Integration Examples (Quick Reference)

Default examples below DO NOT use Subresource Integrity (SRI). This keeps initial integration simple. SRI is optional; see "Optional SRI / Pinning" further down.

### WordPress Plugin Enqueue (basic CDN)
```php
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_script('rcm-iife','https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js',[],null,true);
  wp_enqueue_script('rcm-data','https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.min.js',['rcm-iife'],null,true);
});
```
```html
<div id="chart-root"></div>
<script>window.ChartModule && window.ChartModule.mount({ selector: '#chart-root' });</script>
```

### Gutenberg Block (render callback)
```php
function render_chart_block( $attrs ) {
  return '<div id="chart-root"></div>';
}
```

### Standalone HTML (no framework)
```html
<div id="chart-root"></div>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.min.js"></script>
<script>window.ChartModule.mount({ selector:'#chart-root' });</script>
```

### Optional SRI / Pinning
Add integrity only after verifying a stable bundle (pin with `@<commit>` for deterministic bytes):
```php
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_script('rcm-iife','https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<commit>/chart-module.iife.js',[],null,true);
  wp_enqueue_script('rcm-data','https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<commit>/chart-data.min.js',['rcm-iife'],null,true);
});
add_filter('script_loader_tag', function($tag,$handle){
  $map=[
    'rcm-iife' => 'sha256-v2GB+ewovfk9gOteLOl6Er4G6ZwybC7/EhAo18C4jfw=',
    'rcm-data' => 'sha256-gC3daK6t5Q4VmdRdBFpNB+cwSfFRBRcRQQ3nLRWnkMw=',
  ];
  if(!isset($map[$handle])||str_contains($tag,' integrity=')) return $tag;
  return preg_replace('/<script(.*?)src=/','<script$1 integrity="'.esc_attr($map[$handle]).'" crossorigin="anonymous" src=',$tag,1);
},10,1);
```
Standalone with SRI (optional):
```html
<div id="chart-root"></div>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<commit>/chart-module.iife.js" integrity="sha256-v2GB+ewovfk9gOteLOl6Er4G6ZwybC7/EhAo18C4jfw=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<commit>/chart-data.min.js" integrity="sha256-gC3daK6t5Q4VmdRdBFpNB+cwSfFRBRcRQQ3nLRWnkMw=" crossorigin="anonymous"></script>
<script>window.ChartModule.mount({ selector:'#chart-root' });</script>
```
If hashes ever mismatch, remove integrity temporarily, verify content, then re‑pin and re‑insert updated hashes.

<!-- SRI-TABLE-START -->
### Current SRI Hashes (2025-11-05)
| Asset | SRI (sha256) |
|-------|--------------|
| chart-module.iife.js | sha256-v2GB+ewovfk9gOteLOl6Er4G6ZwybC7/EhAo18C4jfw= |
| chart-data.min.js    | sha256-gC3daK6t5Q4VmdRdBFpNB+cwSfFRBRcRQQ3nLRWnkMw= |
<!-- SRI-TABLE-END -->

For deterministic hashes, pin to a commit/tag with `@<ref>` (builder env: `CHART_REF=<commit>`). Then recompute:
```bash
curl -s https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<commit>/chart-module.iife.js | openssl dgst -sha256 -binary | openssl base64 -A | sed 's/^/sha256-/'
curl -s https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<commit>/chart-data.min.js    | openssl dgst -sha256 -binary | openssl base64 -A | sed 's/^/sha256-/'
```
Update integrity attributes everywhere you embed the assets. If hashes mismatch and block loading, either update to the new values or temporarily disable SRI (`sri_enabled=0`) during debugging.

### Multiple Containers
Call `mount` once with a parent selector containing multiple `<canvas>` placeholders; module auto-renders all declared charts.

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| No charts render | Missing dataset files | Ensure `chart-data.json` or `chart-data.csv` present next to bundle |
| Only some charts | Malformed entry (missing labels/values length mismatch) | Validate dataset; check console warnings |
| Duplicate charts | `mount` called twice | Call `unmount()` before re-mounting; guard with `if(!window.ChartModule.__mounted)` |
| 404 on dataset | Incorrect relative path | Bundle and datasets must share directory; avoid nested asset folder changes |

## Observability (Optional Enhancements)
Add lightweight logging wrapper:
```js
if (window.ChartModule) {
  const originalMount = window.ChartModule.mount;
  window.ChartModule.mount = (opts) => {
    console.info('[ChartModule] mount', opts);
    return originalMount(opts);
  };
}
```

## Safety & Non-Goals
- No direct DOM mutation outside its mount subtree.
- No WordPress admin dependency – pure front-end.
- No hard-coded REST calls; data strictly from provided dataset files.
- No runtime eval or dynamic import from remote origins.

## Next Steps
- (Optional) Create `CHART-INTEGRATION.md` with expanded examples & block editor notes.
- Add automated build copy script to regenerate this folder.
- Provide TypeScript declaration for global API.
- Implement dataset validation & warning surface.

