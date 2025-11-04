/**
 * chart-data.custom.js
 * Persistent custom dataset extension. Not overwritten by publish script.
 * You can edit this file manually to add or override charts.
 * Merging logic: This script augments existing window.ChartModuleData.charts (dedupe by id, custom last wins).
 */
(function(g){
  const customCharts = [
    {
      id: 'custom_growth',
      title: 'Custom Growth Projection',
      chartType: 'line',
      labels: ['2025','2026','2027','2028'],
      values: [100,140,195,250]
    },
    {
      id: 'weekly_signups', // override example (same id as generated)
      title: 'New User Signups (Adjusted)',
      chartType: 'bar',
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      values: [80,85,72,90,100,65,60]
    }
  ];
  if (!g.ChartModuleData) {
    g.ChartModuleData = { charts: customCharts, generatedAt: new Date().toISOString(), description: 'Custom dataset only' };
    return;
  }
  const existing = Array.isArray(g.ChartModuleData.charts) ? g.ChartModuleData.charts : [];
  const map = new Map();
  for (const c of existing) if (c && c.id) map.set(c.id, c);
  for (const c of customCharts) if (c && c.id) map.set(c.id, c); // custom last wins
  g.ChartModuleData.charts = Array.from(map.values());
})(typeof window !== 'undefined' ? window : globalThis);
