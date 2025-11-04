# Chart Module Integration Guide

This guide shows how to embed `chart-module.iife.js` in different environments (plain HTML, WordPress theme, Gutenberg editor) via the public CDN.

## 1. Quick Embed (Plain HTML)

```html
<div id="chart-root"></div>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js"></script>
<script>
  // Automatic dataset loading (chart-data.json / chart-data.csv in same directory)
  window.ChartModule.mount({ selector: '#chart-root' });
</script>
```

### If the element isn't yet in the DOM (script in <head>):
```html
<script>
  document.addEventListener('DOMContentLoaded', () => {
    window.ChartModule.mount({ selector: '#chart-root' });
  });
</script>
```

### Alternate element-based API
```html
<script>
  const el = document.getElementById('chart-root');
  window.ChartModule.mount(el); // also supports mount(element, props)
</script>
```

## 2. Manual Data (skip auto dataset)
```html
<div id="chart1"></div>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js"></script>
<script>
  window.ChartModule.mount({
    selector: '#chart1',
    title: 'Sales (Quarter)',
    chartType: 'bar',
    labels: ['Q1','Q2','Q3','Q4'],
    values: [120,150,160,180]
  });
</script>
```

## 3. Multiple Charts On One Page
```html
<div id="c1"></div>
<div id="c2"></div>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js"></script>
<script>
  window.ChartModule.mount({ selector: '#c1' }); // automatic dataset
  window.ChartModule.mount({ selector: '#c2', title: 'Custom', chartType: 'line', labels: ['A','B','C'], values: [5,9,4] });
</script>
```

If the dataset contains multiple charts, a single `mount` (without manual data) renders a responsive grid automatically.

## 4. Dataset Resolution
Preferred (new): you can now load a pre-bundled JavaScript dataset file first (minified recommended in production):
```html
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.min.js" integrity="<!-- fill from SRI-HASHES.md -->" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js"></script>
<script>
  // If chart-data.js defined window.ChartModuleData the module can be extended in future to use it directly.
  window.ChartModule.mount({ selector: '#chart-root' });
</script>
```
Current module version still fetches JSON/CSV; `chart-data.js` is provided for forward compatibility and alternative loaders. Keep `chart-data.json` present for automatic loading.

Fallback resolution order (existing behavior):
Resolution precedence now (from vNext loader update):
1. `window.ChartModuleData.charts` (if `chart-data(.min).js` loaded and contains charts)
2. `chart-data.json`
3. `chart-data.csv`
4. Manual props passed to `mount()` always override automatic detection if you supply `labels` & `values`.

CSV format: `chartId,title,chartType,labels,values...` where `labels` are pipe-delimited (e.g. `Jan|Feb|Mar`).
JSON structure example:
```json
{
  "charts": [
    { "id": "revenue_trend", "title": "Monthly Revenue (USD)", "chartType": "line", "labels": ["Jan","Feb"], "values": [12000,13500] }
  ]
}
```

## 5. Refresh API
```html
<script>
  // Force re-fetch + re-render for all auto charts
  window.ChartModule.refresh();
</script>
```
Automatic interval refresh (15 min) runs in the background without a page reload.

## 6. Version / Commit Pinning
Pin a tag in production to avoid unexpected changes:
```html
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@v1.0.3/chart-module.iife.js"></script>
```
Or a commit SHA:
```html
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<COMMIT_SHA>/chart-module.iife.js"></script>
```
Add Subresource Integrity (SRI) for security (hashes are generated automatically into `SRI-HASHES.json` / `SRI-HASHES.md` during publish):
```html
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@v1.0.3/chart-data.min.js"
  integrity="sha256-..." crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@v1.0.3/chart-module.iife.js"
  integrity="sha256-..." crossorigin="anonymous"></script>
```
The publish script computes `sha256-<base64>` hashes for each distributed file.

### 6.1 SRI Hash Files Visibility & Retrieval
Because this repository is public, the generated SRI manifest files are also public (they intentionally are *not* secrets):

Files added at publish time:
- `SRI-HASHES.json` – machine‑readable map `{ filename: "sha256-..." }`
- `SRI-HASHES.md` – human‑friendly list for quick copy/paste

You can fetch them directly via:
```
https://raw.githubusercontent.com/Design-Inspis/chart-repo/<BRANCH_OR_TAG>/SRI-HASHES.json
https://raw.githubusercontent.com/Design-Inspis/chart-repo/<BRANCH_OR_TAG>/SRI-HASHES.md
```
Or through jsDelivr CDN (auto-caches):
```
https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo@<TAG_OR_COMMIT>/SRI-HASHES.json
```

Security note: SRI hashes being public is expected – an attacker cannot *use* the hash to modify the file undetected; the hash simply lets browsers verify integrity. If a file changes, the old hash no longer matches and the browser blocks it (failing closed).

Operational tip: Always pair SRI with a pinned tag or commit. If you track a moving branch (no @version) the hash will eventually mismatch and the script will stop loading.

## 7. WordPress Theme (functions.php)
```php
function theme_enqueue_chart_module() {
  wp_enqueue_script(
    'chart-module',
    'https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js',
    [],
    null,
    true
  );
}
add_action('wp_enqueue_scripts', 'theme_enqueue_chart_module');
```
In a template:
```php
<div id="chart-root"></div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.ChartModule.mount({ selector: '#chart-root' });
  });
</script>
```

## 8. Gutenberg Editor
If the plugin already enqueued the script for the editor: just add a Custom HTML block:
```html
<div id="chart-editor-demo"></div>
<script>
  window.ChartModule.mount({ selector: '#chart-editor-demo' });
</script>
```
Or build a custom block that creates the container automatically.

## 9. Debugging
- Console: verify `chart-module.iife.js` loads (HTTP 200).
- If `window.ChartModule` missing -> script failed (CSP / network / wrong URL).
- Selector not found -> check id / timing (use DOMContentLoaded if needed).
- Empty dataset -> check JSON structure or CSV header.

## 10. Customization / Extensions
| Need | Approach |
|------|----------|
| Custom dataset URL | Provide manual `labels/values` or host JSON/CSV next to bundle |
| Immediate force refresh | `window.ChartModule.refresh()` |
| Multiple instances with different data | Use manual props per mount call |
| External styling | Add your own CSS around the container div |

## 11. Combined Example (auto + manual + refresh)
```html
<div id="auto-charts"></div>
<div id="manual1"></div>
<button id="refreshBtn">Refresh All</button>
<script src="https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-module.iife.js"></script>
<script>
  window.ChartModule.mount({ selector: '#auto-charts' });
  window.ChartModule.mount({
    selector: '#manual1',
    title: 'Custom Doughnut',
    chartType: 'doughnut',
    labels: ['A','B','C'],
    values: [40,35,25]
  });
  document.getElementById('refreshBtn').addEventListener('click', () => {
    window.ChartModule.refresh();
  });
</script>
```

## 12. Security & Updates
- Pin tag or commit in production.
- Use SRI to guard against tampered CDN assets.
- Track releases / changes (GitHub Releases / changelog).

## 13. Summary
Embedding requires only: a container element, the CDN script, and `ChartModule.mount(...)`. Automatic dataset loading works with zero extra code when `chart-data.json` / `chart-data.csv` live beside the bundle.


---
Feedback or enhancement ideas: open an issue or submit a pull request.
