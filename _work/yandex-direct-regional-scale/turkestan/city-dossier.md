# CITY DOSSIER — ТУРКЕСТАН (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-150056  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Туркестан |
| KK | Түркістан |
| slug | `turkestan` |
| Локатив | в Туркестане |
| Родительный | Туркестана |
| `areaServed` | `{"@type":"City","name":"Turkestan"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/` |
| Шаблон DOM | `yandex-direct/aktau` (remote shell) / эталон кластера `astana` |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/turkestan/index.html` |

**Title:** Яндекс Директ в Туркестане — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Туркестане  
**Description:** Яндекс Директ в Туркестане: город отдельно от Туркестанской области и Шымкента, паломнический и городской спрос, цели в Метрике. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Туркестан — административный центр Туркестанской области и узел паломнического / туристического интереса (комплекс Ясави).
- В Директе город выбирается отдельно от Туркестанской области.
- Шымкент — город республиканского значения; не смешивается с городским бюджетом Туркестана без фактического обслуживания.
- Областные пункты (Кентау, Арысь, Сарыагаш и др.) подключаются только по карте выдачи / доставки / выезда.
- Угол контента: паломничество / размещение гостей + бытовой сервис жителей + стройка / отделка.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Туркестане нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-turkestan` / `contacts_yandex_direct_turkestan` |
| Попап form | `rk-form-popup-yd-turkestan` / `popup_yandex_direct_turkestan` |
| Поля / FAQ | префикс `yd-trk-` |
| Chart gradients | `ydTrkChartFill`, `ydTrkChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Паломнический поток и размещение; бытовой сервис жителей; стройка и отделка; город vs Туркестанская область vs Шымкент; двуязычие RU/KK (Түркістан); удалённая работа из Петропавловска. Сознательно избегаем overlap с Шымкентом (область + юг), Кызылордой (рисовый контур) и Актау (порт / нефтесервис).

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/turkestan/`
- `/web-studiya/kontekstnaya-reklama/google-ads/turkestan/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS**. Худший peer: **aktau** (main_containment **20.60**, core_containment **13.12**, main_jaccard **11.74**, core_jaccard **7.28**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| aktau | 20.60 | 13.12 | 11.74 | 7.28 | 0 | PASS |
| uralsk | 16.69 | 8.52 | 9.44 | 4.63 | 0 | PASS |
| petropavlovsk | 10.78 | 2.69 | 5.98 | 1.46 | 0 | PASS |
| kyzylorda | 9.66 | 5.72 | 5.24 | 3.04 | 0 | PASS |
| kostanay | 7.71 | 3.92 | 4.13 | 2.07 | 0 | PASS |
| atyrau | 7.31 | 4.04 | 3.96 | 2.18 | 0 | PASS |
| semey | 4.47 | 3.48 | 2.38 | 1.86 | 0 | PASS |
| ust-kamenogorsk | 4.19 | 1.79 | 2.20 | 0.93 | 0 | PASS |
| pavlodar | 3.02 | 1.12 | 1.55 | 0.58 | 0 | PASS |
| astana | 2.01 | 0.11 | 1.11 | 0.06 | 0 | PASS |
| taraz | 0.45 | 0.22 | 0.21 | 0.11 | 0 | PASS |
| karaganda | 0.45 | 0.11 | 0.22 | 0.06 | 0 | PASS |
| shymkent | 0.45 | 0 | 0.23 | 0 | 0 | PASS |
| aktobe | 0.28 | 0 | 0.13 | 0 | 0 | PASS |
| almaty | 0.22 | 0 | 0.12 | 0 | 0 | PASS |
| yd-index | 0.11 | 0 | 0.06 | 0 | 0 | PASS |
| kontekst/turkestan | 0.06 | 0 | 0.04 | 0 | 0 | PASS |
| google-ads/turkestan | 0 | 0 | 0 | 0 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.  
Evidence: `site_mirror/_work/yandex-direct-regional-scale/turkestan/similarity-report.json`

## 9. Не менялось

Astana template shared CSS/JS, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.
