/**
 * Generated dataset bundle (do not edit manually)
 * Source JSON: https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.json
 * Source CSV: https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.csv
 * Generated: 2025-11-04T15:27:21.945Z
 */
;(function(g){
  g.ChartModuleData = {
  "generatedAt": "2025-11-04T15:27:21.945Z",
  "description": "Automated build dataset (merged from JSON + CSV sources)",
  "sourceMeta": {
    "jsonSource": "https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.json",
    "csvSource": "https://cdn.jsdelivr.net/gh/Design-Inspis/chart-repo/chart-data.csv",
    "repoRef": "latest"
  },
  "charts": [
    {
      "id": "revenue_trend",
      "title": "Monthly Revenue (USD)",
      "chartType": "line",
      "labels": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun"
      ],
      "values": [
        12000,
        13500,
        12800,
        15000,
        17000,
        16500
      ]
    },
    {
      "id": "traffic_channels",
      "title": "Website Traffic by Channel",
      "chartType": "bar",
      "labels": [
        "Organic",
        "Paid",
        "Referral",
        "Social",
        "Email"
      ],
      "values": [
        4200,
        3100,
        1800,
        2600,
        900
      ]
    },
    {
      "id": "device_usage",
      "title": "Device Usage Share (%)",
      "chartType": "doughnut",
      "labels": [
        "Desktop",
        "Mobile",
        "Tablet"
      ],
      "values": [
        52,
        38,
        10
      ]
    },
    {
      "id": "weekly_signups",
      "title": "New User Signups (Last 7 Days)",
      "chartType": "bar",
      "labels": [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ],
      "values": [
        75,
        82,
        69,
        88,
        95,
        60,
        54
      ]
    }
  ]
};
  // Attempt immediate population if module already loaded; else emit readiness event
  if (g.ChartModule && typeof g.ChartModule.refresh === 'function') {
    try { g.ChartModule.refresh({ forceGlobalReload: true }); } catch(e) { /* ignore */ }
  } else if (g.dispatchEvent) {
    try { g.dispatchEvent(new CustomEvent('ChartModuleDataReady')); } catch(e) { /* ignore */ }
  }
})(typeof window!=="undefined"?window:globalThis);
