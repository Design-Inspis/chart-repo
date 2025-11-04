# Chart Module Distribution

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

## Release Workflow
1. Run build in source project: `npm run build`.
2. Copy fresh `chart-module.iife.js` into this distribution folder.
3. Update `chart-data.json` (and CSV fallback) if metrics changed.
4. Bump version (query param or filename) & clear caches (object cache / CDN / OPCache if necessary).
5. Test mount + chart rendering in a staging site.

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
Resolution order when loading bundle + datasets:
1. Theme directory (preferred for site-level override)
2. Plugin directory

If both JSON and CSV exist, JSON wins. If JSON missing and CSV present, CSV is parsed (labels split on `|`).

## Versioning / Cache Busting
| Strategy | Pros | Cons |
|----------|------|------|
| Query param `?ver=20251104` | Simple, works with WP core enqueue | Some CDNs may ignore query for long TTL assets |
| Semantic filename `chart-module.v1.2.0.iife.js` + stable alias | Clear provenance, immutable deployment | Requires extra copy/symlink management |
| Hash filename `chart-module.ab12cd.iife.js` | Strong cache busting | Harder manual diffing / rollback |

Recommended hybrid: keep canonical `chart-module.iife.js` (used by existing templates) and also publish a versioned copy for rollback tracking. In PHP enqueue, pass the semantic version as the `ver` argument.

### Upgrade Checklist
- [ ] Build new bundle
- [ ] Update datasets
- [ ] Increment version (semver + query param)
- [ ] Purge CDN / object cache
- [ ] Verify mount + charts on staging

## Legacy Notice
Legacy filename support removed—only `chart-module.iife.js` is used. Ensure all environments reference the new name.

## Integration Examples (Inline Quick Reference)

### WordPress Theme (functions.php)
```php
function my_theme_enqueue_charts() {
  wp_enqueue_script(
    'chart-module',
    get_stylesheet_directory_uri() . '/chart-module.iife.js',
    [],
    '1.2.0',
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

### Plugin Enqueue
```php
wp_enqueue_script(
  'chart-module',
  plugins_url('chart-repo/chart-module.iife.js', __FILE__),
  [],
  '1.2.0',
  true
);
```

### Gutenberg Block (view script wrapper)
Inside block `render_callback` output container + rely on globally enqueued script.
```php
function render_chart_block($attrs) {
  return '<div id="chart-root"></div>';
}
```

### Standalone HTML (non-WP)
```html
<div id="chart-root"></div>
<script src="./chart-module.iife.js"></script>
<script>
  window.ChartModule.mount({ selector: '#chart-root' });
</script>
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

