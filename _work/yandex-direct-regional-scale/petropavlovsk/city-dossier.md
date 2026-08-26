# CITY DOSSIER — ПЕТРОПАВЛОВСК (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-142532  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Петропавловск |
| slug | `petropavlovsk` |
| Локатив | в Петропавловске |
| Родительный | Петропавловска |
| `areaServed` | `{"@type":"City","name":"Petropavlovsk"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/` |
| Шаблон | `yandex-direct/astana/index.html` (структура peers; DOM/CSS не менялись) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/petropavlovsk/index.html` |
| region_note | Офис Raskrutov; отдельно от СКО |

**Title:** Яндекс Директ в Петропавловске — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Петропавловске  
**Description:** Яндекс Директ из офиса Raskrutov в Петропавловске: город отдельно от СКО, локальные встречи, поиск, РСЯ и цели Метрики. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Петропавловск — северный торговый и сервисный узел; город отдельно от Северо-Казахстанской области (СКО).
- В Директе город выбирается отдельно от СКО.
- Пункты СКО подключаются только по фактической карте отгрузки / выезда / выдачи.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Локальный офис (критическое отличие)

- **Единственный город с реальным офисом Raskrutov.**
- Адрес: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- FAQ «Есть ли офис?» → **Да**, офис здесь; встречи по брифу возможны лично.
- Не утверждаем remote-only / «филиала нет» / «работаем только удалённо».
- Адрес офиса не расширяет географию показов автоматически.

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-petropavlovsk` / `contacts_yandex_direct_petropavlovsk` |
| Попап form | `rk-form-popup-yd-petropavlovsk` / `popup_yandex_direct_petropavlovsk` |
| Поля / FAQ | префикс `yd-ppk-` |
| Chart gradients | `ydPpkChartFill`, `ydPpkChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Город vs СКО; местный офис и личные встречи; северный рынок (сервис, снабжение, розница); ведение из офиса на Жумабаева.

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/petropavlovsk/`
- `/web-studiya/kontekstnaya-reklama/google-ads/petropavlovsk/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS**. Худший peer: **kostanay** (main_containment **9.28**, core_containment **9.36**, main_jaccard **4.77**, core_jaccard **4.74**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| kostanay | 9.28 | 9.36 | 4.77 | 4.74 | 0 | PASS |
| kyzylorda | 9.22 | 5.00 | 4.75 | 2.48 | 0 | PASS |
| uralsk | 10.88 | 4.87 | 5.66 | 2.42 | 0 | PASS |
| atyrau | 8.42 | 8.21 | 4.37 | 4.24 | 0 | PASS |
| semey | 5.10 | 5.51 | 2.59 | 2.78 | 0 | PASS |
| ust-kamenogorsk | 3.93 | 2.56 | 1.96 | 1.25 | 0 | PASS |
| pavlodar | 2.40 | 1.79 | 1.17 | 0.87 | 0 | PASS |
| astana | 1.60 | 0.51 | 0.84 | 0.28 | 0 | PASS |
| taraz / almaty / shymkent / karaganda / aktobe | ≤0.5 | ≤0.2 | ≤0.3 | ≤0.1 | 0 | PASS |
| yandex-direct/index | 0.31 | 0.13 | 0.17 | 0.08 | 0 | PASS |
| kontekst/petropavlovsk | 0.18 | 0.38 | 0.12 | 0.30 | 0 | PASS |
| google-ads/petropavlovsk | 0.06 | 0.13 | 0.04 | 0.09 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.

## 9. Не менялось

Astana template CSS/JS, другие YD city pages, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.

## 10. Git status

`LOCAL ONLY`
