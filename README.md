# Chart Module Distribution / CDN Source

Drop-in bundle & datasets for WordPress theme or plugin integration. Replace the files here to ship updates—no PHP or block edits needed after initial setup.

## Files
- `chart-module.iife.js` – Global IIFE exposing `window.ChartModule.mount/unmount`.
- `chart-data.json` – Primary multi-chart dataset (auto-loaded if present).
- `chart-data.csv` – Fallback dataset (used only if JSON missing). Pipe `|` delimited labels.

## Quick Start (Theme or Plugin)
1. Copy this folder’s contents into your theme (e.g. `wp-content/themes/your-theme/`) or plugin asset directory.
2. Enqueue the script (see examples below).
3. Ensure dataset files sit in the same relative directory as the bundle.
4. Add a container `<div id="chart-root"></div>` (or custom selector) in your template / block output.
5. Call `window.ChartModule.mount({ selector: '#chart-root' })` after the script loads.

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
          |               |                             |
         WordPress Theme   WordPress Plugin            Plain HTML App
          |               |                             |
        enqueue scripts   enqueue scripts                <script> tags
          |               |                             |
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

## Integration Examples (Inline Quick Reference)

### WordPress Theme (functions.php) – Using CDN + SRI
```php
function my_theme_enqueue_charts() {
  wp_enqueue_script(
    'chart-module',
    'https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js',
    [],
    null,
    true
  );
  wp_enqueue_script(
    'chart-data',
    'https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.min.js',
    ['chart-module'],
    null,
    true
  );
}
add_action('wp_enqueue_scripts', 'my_theme_enqueue_charts');
```
```html
<div id="chart-root"></div>
<script>
  window.ChartModule && window.ChartModule.mount({ selector: '#chart-root' });
</script>
```

### Plugin Enqueue (CDN)
```php
wp_enqueue_script('chart-module','https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js',[],null,true);
wp_enqueue_script('chart-data','https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.min.js',['chart-module'],null,true);
```

### Gutenberg Block (view script wrapper)
Inside block `render_callback` output container + rely on globally enqueued script.
```php
function render_chart_block($attrs) {
  return '<div id="chart-root"></div>';
}
```

### Standalone HTML (non-WP) + SRI
```html
<div id="chart-root"></div>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js" integrity="{{SRI_MODULE}}" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.min.js" integrity="{{SRI_DATA_MIN}}" crossorigin="anonymous"></script>
<script>window.ChartModule.mount({ selector:'#chart-root' });</script>
```

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

