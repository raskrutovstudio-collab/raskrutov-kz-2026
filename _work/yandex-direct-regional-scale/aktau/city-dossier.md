# CITY DOSSIER — АКТАУ (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-144503  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Актау |
| KK | Ақтау |
| slug | `aktau` |
| Локатив | в Актау |
| Родительный | Актау |
| `areaServed` | `{"@type":"City","name":"Aktau"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/` |
| Шаблон DOM | `yandex-direct/atyrau` (shell) / эталон кластера `astana` (не изменялся) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/aktau/index.html` |

**Title:** Яндекс Директ в Актау — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Актау  
**Description:** Яндекс Директ в Актау: город отдельно от Мангистауской области, портовый и нефтесервисный спрос на Каспии, цели в Метрике. От 120 000 ₸ в месяц.

Топоним «Актау» в письменной практике проекта несклоняемый: локатив «в Актау», родительный «Актау». Не путать со slug `aktobe` (Актобе).

## 2. Гео-логика

- Актау — административный центр Мангистауской области, каспийский портовый / нефтесервисный узел.
- В Директе город выбирается отдельно от Мангистауской области.
- Областные пункты (Жанаозен, Бейнеу, Форт-Шевченко и др.) подключаются только по фактической карте отгрузки / выезда / доставки.
- Угол контента отличается от Атырау: морпорт и полуостров Мангистау, без привязки к реке Урал.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Актау нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-aktau` / `contacts_yandex_direct_aktau` |
| Попап form | `rk-form-popup-yd-aktau` / `popup_yandex_direct_aktau` |
| Поля / FAQ | префикс `yd-akt-` (полный slug в form id; **не** `yd-aktb-` Актобе) |
| Chart gradients | `ydAktChartFill`, `ydAktChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Каспийский морпорт; нефтесервис полуострова; город vs Мангистауская область; B2B-снабжение отдельно от городского сервиса; вахтовый/кадровый шум в минус-словах; удалённая работа из Петропавловска. Сознательно избегаем overlap с Актобе (похожий slug) и Атырау (другой каспийский нефтяной узел у Урала).

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/aktau/`
- `/web-studiya/kontekstnaya-reklama/google-ads/aktau/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS**. Худший peer: **uralsk** (main_containment **21.03**, core_containment **14.29**, main_jaccard **11.92**, core_jaccard **7.73**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| uralsk | 21.03 | 14.29 | 11.92 | 7.73 | 0 | PASS |
| kyzylorda | 11.68 | 9.24 | 6.28 | 4.84 | 0 | PASS |
| petropavlovsk | 11.39 | 3.84 | 6.22 | 2.02 | 0 | PASS |
| kostanay | 9.18 | 5.76 | 4.86 | 2.97 | 0 | PASS |
| atyrau | 7.84 | 5.52 | 4.18 | 2.91 | 0 | PASS |
| semey | 5.69 | 4.32 | 2.99 | 2.24 | 0 | PASS |
| ust-kamenogorsk | 4.76 | 3.12 | 2.46 | 1.58 | 0 | PASS |
| pavlodar | 3.60 | 2.16 | 1.82 | 1.09 | 0 | PASS |
| astana | 2.32 | 0.12 | 1.27 | 0.07 | 0 | PASS |
| karaganda | 0.58 | 0.12 | 0.29 | 0.06 | 0 | PASS |
| shymkent | 0.46 | 0 | 0.23 | 0 | 0 | PASS |
| taraz | 0.35 | 0.12 | 0.16 | 0.06 | 0 | PASS |
| aktobe | 0.35 | 0 | 0.16 | 0 | 0 | PASS |
| yd-index | 0.17 | 0.12 | 0.10 | 0.07 | 0 | PASS |
| almaty | 0.23 | 0 | 0.12 | 0 | 0 | PASS |
| kontekst/aktau | 0 | 0 | 0 | 0 | 0 | PASS |
| google-ads/aktau | 0 | 0 | 0 | 0 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.  
Evidence: `site_mirror/_work/yandex-direct-regional-scale/aktau/similarity-report.json`

## 9. Не менялось

Astana template shared CSS/JS, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.
