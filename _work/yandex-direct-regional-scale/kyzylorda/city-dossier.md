# CITY DOSSIER — КЫЗЫЛОРДА (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-134753  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Кызылорда |
| KK | Қызылорда |
| slug | `kyzylorda` |
| Локатив | в Кызылорде |
| Родительный | Кызылорды |
| `areaServed` | `{"@type":"City","name":"Kyzylorda"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/` |
| Шаблон | `yandex-direct/astana/index.html` (структура peers; не изменялся) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kyzylorda/index.html` |

**Title:** Яндекс Директ в Кызылорде — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Кызылорде  
**Description:** Яндекс Директ в Кызылорде: город отдельно от Кызылординской области, рисовый и сервисный спрос, цели в Метрике. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Кызылорда — южный узел: рисовый контур вдоль Сырдарьи + бытовой сервис внутри городской черты.
- В Директе город выбирается отдельно от Кызылординской области.
- Областные пункты подключаются только по фактической карте выдачи / отгрузки / выезда.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Кызылорде нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-kyzylorda` / `contacts_yandex_direct_kyzylorda` |
| Попап form | `rk-form-popup-yd-kyzylorda` / `popup_yandex_direct_kyzylorda` |
| Поля / FAQ | префикс `yd-kyz-` (не `gads-kyz`) |
| Chart gradients | `ydKyzChartFill`, `ydKyzChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Город vs Кызылординская область; рис / техника / расходники + городской сервис и розница; удалённая работа из Петропавловска.

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/kyzylorda/`
- `/web-studiya/kontekstnaya-reklama/google-ads/kyzylorda/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS**. Худший peer: **kostanay** (main_containment **24.87**, core_containment **10.31**, main_jaccard **14.17**, core_jaccard **5.44**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| kostanay | 24.87 | 10.31 | 14.17 | 5.44 | 0 | PASS |
| atyrau | 13.56 | 8.87 | 7.36 | 4.76 | 0 | PASS |
| semey | 7.85 | 4.08 | 4.12 | 2.11 | 0 | PASS |
| ust-kamenogorsk | 6.60 | 2.64 | 3.40 | 1.33 | 0 | PASS |
| pavlodar | 5.77 | 3.48 | 2.91 | 1.77 | 0 | PASS |
| taraz | 3.51 | 6.00 | 1.62 | 2.83 | 0 | PASS |
| astana | 3.33 | 0 | 1.80 | 0 | 0 | PASS |
| karaganda / aktobe / almaty / shymkent | ≤1 | 0 | ≤0.4 | 0 | 0 | PASS |
| yandex-direct/index | 0.12 | 0 | 0.07 | 0 | 0 | PASS |
| kontekst/kyzylorda | 0.06 | 0 | 0.04 | 0 | 0 | PASS |
| google-ads/kyzylorda | 0 | 0 | 0 | 0 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.

## 9. Не менялось

Astana template, shared CSS/JS, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.

## 10. Git status

`LOCAL ONLY`
