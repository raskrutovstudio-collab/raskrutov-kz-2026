# Yandex Direct — Regional Cluster QA Report

**Task:** TASK-20260821-165613  
**Generated:** 2026-08-21 16:56:13 +05:00  
**Scope:** 18 city pages + republican hub  
**Mode:** evidence-based cluster QA (report-only; no city content rewrite)

## Final verdict

**CLUSTER QA: PASS**  
**YANDEX DIRECT REGIONAL CLUSTER COMPLETE: YES**

Production HTTP, inventory, HTML balance, forms, similarity, hub links, and regional viewport evidence for all 17 scaled cities are PASS. Astana 390/1440 evidence is present in pilot QA folders (not under `yandex-direct-regional-scale/astana/`) — noted gap only, not a production blocker.

---

## Checklist results

| # | Check | Result |
|---|---|---|
| 1 | Inventory: city `index.html` + sitemap | **PASS** |
| 2 | HTML balance (`<section>` open/close) | **PASS** (14/14 all cities) |
| 3 | Production HTTP 200 + text/html + H1 spot-check | **PASS** (hub + 18 cities) |
| 4 | Republican hub links to all 18; no pilot-only copy | **PASS** |
| 5 | Similarity 5 adjacent pairs + office FAQ contrast | **PASS** |
| 6 | Unique forms + Metrika 101127167 + price `120 000` | **PASS** |
| 7 | Viewport screenshots 390/1440 (+ rep 430/768) | **PASS** (Astana path gap noted) |
| 8 | `batch-status.json` updated | **DONE** |

---

## 1. Inventory

All 18 city pages exist:

`site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/<slug>/index.html`

All 18 + hub listed in `site_mirror/sitemap.xml`.

| Slug | Local index | Sitemap |
|---|---|---|
| astana | OK | OK |
| almaty | OK | OK |
| shymkent | OK | OK |
| karaganda | OK | OK |
| aktobe | OK | OK |
| taraz | OK | OK |
| pavlodar | OK | OK |
| ust-kamenogorsk | OK | OK |
| semey | OK | OK |
| atyrau | OK | OK |
| kostanay | OK | OK |
| kyzylorda | OK | OK |
| uralsk | OK | OK |
| petropavlovsk | OK | OK |
| aktau | OK | OK |
| turkestan | OK | OK |
| kokshetau | OK | OK |
| taldykorgan | OK | OK |
| hub `/yandex-direct/` | OK | OK |

---

## 2. HTML balance

Every city page: **section open = 14, section close = 14**. No unbalanced pages. No production-blocking HTML repair required.

---

## 3. Production HTTP

GET all URLs → **200**, `Content-Type: text/html`.

| Page | Status | H1 (production) |
|---|---|---|
| hub | 200 | Настройка и ведение Яндекс Директ в Казахстане |
| astana | 200 | … в Астане |
| almaty | 200 | … в Алматы |
| shymkent | 200 | … в Шымкенте |
| karaganda | 200 | … в Караганде |
| aktobe | 200 | … в Актобе |
| taraz | 200 | … в Таразе |
| pavlodar | 200 | … в Павлодаре |
| ust-kamenogorsk | 200 | … в Усть-Каменогорске |
| semey | 200 | … в Семее |
| atyrau | 200 | … в Атырау |
| kostanay | 200 | … в Костанае |
| kyzylorda | 200 | … в Кызылорде |
| uralsk | 200 | … в Уральске |
| petropavlovsk | 200 | … в Петропавловске |
| aktau | 200 | … в Актау |
| turkestan | 200 | … в Туркестане |
| kokshetau | 200 | … в Кокшетау |
| taldykorgan | 200 | … в Талдыкоргане |

All H1 contain **Яндекс Директ** + city (declined form where applicable).

---

## 4. Republican hub

- Production hub links to **all 18** city URLs.
- Local hub HTML: same — **0 missing**.
- Pilot-only / «только Астана» copy: **not found**.

---

## 5. Similarity + office FAQ

Tool: `site_mirror/_work/yandex-direct-regional-scale/similarity-check.cjs`

| Pair | main_containment | core_containment | long_dups | Verdict |
|---|---|---|---|---|
| kostanay ↔ kyzylorda | 24.78% | 10.34% | 0 | **PASS** |
| kyzylorda ↔ uralsk | 21.95% | 12.47% | 0 | **PASS** |
| uralsk ↔ petropavlovsk | 10.55% | 4.60% | 0 | **PASS** |
| aktau ↔ turkestan | 21.44% | 14.05% | 0 | **PASS** |
| kokshetau ↔ taldykorgan | 20.33% | 14.30% | 0 | **PASS** |

Office FAQ contrast:

- **petropavlovsk** FAQ: «Есть ли у Raskrutov офис в Петропавловске?» → **«Да. Офис Raskrutov находится в Петропавловске…»**
- **turkestan** (remote) FAQ: «Работает ли Raskrutov из офиса в Туркестане?» → **«Локального офиса в Туркестане нет…»**

---

## 6. Forms / Metrika / price

| Check | Result |
|---|---|
| Contacts form `rk-form-contacts-yd-<slug>` unique per city | PASS (18/18) |
| Popup form `rk-form-popup-yd-<slug>` unique per city | PASS (18/18) |
| Duplicate form IDs across cluster | none |
| Metrika `101127167` | present on all 18 |
| Price `120 000` | present on all 18 |

---

## 7. Regional viewport evidence

Path convention: `site_mirror/_work/yandex-direct-regional-scale/<slug>/<slug>-{390,1440,430,768}.png`

| City | 390 | 1440 | 430 | 768 | Notes |
|---|---|---|---|---|---|
| astana | gap* | gap* | gap* | gap* | Evidence in pilot folders (see below) |
| almaty … taldykorgan (17) | OK | OK | OK | OK | Full set under regional-scale |

\*Astana evidence (not under regional-scale folder):

- `site_mirror/_work/yd-astana-cls-qa/astana-390.png`
- `site_mirror/_work/yd-astana-cls-qa/astana-1440.png`
- `site_mirror/_work/yd-astana-cls-qa/astana-430.png`
- `site_mirror/_work/yd-astana-cls-qa/astana-768.png`
- also `yd-astana-pilot-qa/astana-1440.png`, `astana-390-hero.png`, `astana-768.png`

Representative 430/768: present for **all 17** scaled cities (exceeds minimum of 1).

---

## City rollup

| CITY | INV | HTML | HTTP | FORMS | SHOTS 390/1440 | VERDICT |
|---|---|---|---|---|---|---|
| astana | PASS | PASS | PASS | PASS | GAP (pilot evidence OK) | PASS* |
| almaty | PASS | PASS | PASS | PASS | PASS | PASS |
| shymkent | PASS | PASS | PASS | PASS | PASS | PASS |
| karaganda | PASS | PASS | PASS | PASS | PASS | PASS |
| aktobe | PASS | PASS | PASS | PASS | PASS | PASS |
| taraz | PASS | PASS | PASS | PASS | PASS | PASS |
| pavlodar | PASS | PASS | PASS | PASS | PASS | PASS |
| ust-kamenogorsk | PASS | PASS | PASS | PASS | PASS | PASS |
| semey | PASS | PASS | PASS | PASS | PASS | PASS |
| atyrau | PASS | PASS | PASS | PASS | PASS | PASS |
| kostanay | PASS | PASS | PASS | PASS | PASS | PASS |
| kyzylorda | PASS | PASS | PASS | PASS | PASS | PASS |
| uralsk | PASS | PASS | PASS | PASS | PASS | PASS |
| petropavlovsk | PASS | PASS | PASS | PASS | PASS | PASS |
| aktau | PASS | PASS | PASS | PASS | PASS | PASS |
| turkestan | PASS | PASS | PASS | PASS | PASS | PASS |
| kokshetau | PASS | PASS | PASS | PASS | PASS | PASS |
| taldykorgan | PASS | PASS | PASS | PASS | PASS | PASS |
| republican hub | PASS | — | PASS | — | — | PASS |

\*Astana: production + HTML PASS; screenshot path differs from regional-scale convention.

---

## Residual notes

1. Astana viewport artifacts are not copied into `yandex-direct-regional-scale/astana/` — optional housekeeping only.
2. No city HTML rewrite performed.
3. No commit (report + batch-status only).
4. Raw machine output: `site_mirror/_work/yandex-direct-regional-scale/_cluster-qa-raw.json`
5. Runner: `site_mirror/_work/yandex-direct-regional-scale/_cluster-qa-run.cjs`

## Git / publish status

**LOCAL ONLY** for this QA report and `batch-status.json` update (not production page content).  
City pages and hub were already **PRESENT IN GITHUB** / production prior to this QA.
