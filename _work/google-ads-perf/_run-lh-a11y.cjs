const {spawnSync}=require('child_process');
const out='D:/РАБОТА/111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111/raskrutov-kz-2026/site_mirror/_work/google-ads-perf/lh-a11y-prod-v7.json';
const args=['lighthouse','https://raskrutov.kz/web-studiya/kontekstnaya-reklama/google-ads/','--only-categories=accessibility','--form-factor=mobile','--screenEmulation.mobile','--chrome-flags=--headless --no-sandbox','--output=json','--output-path='+out,'--quiet'];
const r=spawnSync('npx',['--yes',...args],{stdio:'inherit',shell:true});
process.exit(r.status||0);