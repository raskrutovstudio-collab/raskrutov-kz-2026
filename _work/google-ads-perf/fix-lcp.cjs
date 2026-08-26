const fs = require("fs");
const summaryPath = "site_mirror/_work/google-ads-perf/baseline-summary.json";
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
function getLcp(report) {
  const a = report.audits["largest-contentful-paint-element"];
  const list = (a && a.details && a.details.items) || [];
  const nodeTable = list.find(x => x.type === "table" && x.headings && x.headings[0] && x.headings[0].key === "node");
  const phasesTable = list.find(x => x.type === "table" && x.headings && x.headings.some(h => h.key === "phase"));
  const node = nodeTable && nodeTable.items && nodeTable.items[0] && nodeTable.items[0].node;
  return {
    selector: node && node.selector,
    snippet: node && node.snippet,
    nodeLabel: node && node.nodeLabel,
    path: node && node.path,
    boundingRect: node && node.boundingRect,
    phases: phasesTable && phasesTable.items
  };
}
for (let i = 1; i <= 3; i++) {
  const report = JSON.parse(fs.readFileSync("site_mirror/_work/google-ads-perf/lh-mobile-" + i + ".json", "utf8"));
  const run = summary.runs.find(r => r.run === i);
  run.lcpElementResolved = getLcp(report);
}
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
summary.runs.forEach(r => {
  console.log("RUN", r.run, r.lcpElementResolved.selector, r.lcpElementResolved.snippet);
  console.log("  phases", JSON.stringify(r.lcpElementResolved.phases));
});
console.log("summary updated");
