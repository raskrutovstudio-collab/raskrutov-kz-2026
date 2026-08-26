# CITY DOSSIER — УРАЛЬСК / ОРАЛ (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-140751  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Уральск |
| KK | Орал |
| slug | `uralsk` |
| Локатив | в Уральске |
| Родительный | Уральска |
| `areaServed` | `{"@type":"City","name":"Uralsk"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/` |
| Шаблон | `yandex-direct/astana/index.html` (структура peers; не изменялся) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/uralsk/index.html` |

**Title:** Яндекс Директ в Уральске — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Уральске  
**Description:** Яндекс Директ в Уральске (Орал): город отдельно от ЗКО, торговый и сервисный спрос у западной границы, цели в Метрике. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Уральск (kk Орал) — торговый и сервисный узел Западно-Казахстанской области у западной границы.
- В Директе город выбирается отдельно от ЗКО (Западно-Казахстанская область).
- Пункты ЗКО подключаются только по фактической карте отгрузки / выезда / выдачи.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Уральске нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-uralsk` / `contacts_yandex_direct_uralsk` |
| Попап form | `rk-form-popup-yd-uralsk` / `popup_yandex_direct_uralsk` |
| Поля / FAQ | префикс `yd-url-` |
| Chart gradients | `ydUrlChartFill`, `ydUrlChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Город vs ЗКО; RU Уральск / KK Орал; торговля, сервис, приграничные поставки; удалённая работа из Петропавловска.

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/uralsk/`
- `/web-studiya/kontekstnaya-reklama/google-ads/uralsk/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS**. Худший peer: **kyzylorda** (main_containment **22.00**, core_containment **12.59**, main_jaccard **12.35**, core_jaccard **6.68**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| kyzylorda | 22.00 | 12.59 | 12.35 | 6.68 | 0 | PASS |
| kostanay | 16.52 | 8.47 | 8.97 | 4.41 | 0 | PASS |
| atyrau | 9.36 | 5.93 | 4.96 | 3.12 | 0 | PASS |
| semey | 7.33 | 2.91 | 3.83 | 1.49 | 0 | PASS |
| ust-kamenogorsk | 5.31 | 2.30 | 2.71 | 1.16 | 0 | PASS |
| pavlodar | 4.65 | 2.78 | 2.33 | 1.40 | 0 | PASS |
| astana | 2.80 | 0 | 1.51 | 0 | 0 | PASS |
| aktobe | 1.31 | 2.18 | 0.61 | 1.04 | 0 | PASS |
| taraz / karaganda / shymkent / almaty | ≤0.7 | ≤0.5 | ≤0.3 | ≤0.3 | 0 | PASS |
| yandex-direct/index | 0.12 | 0 | 0.07 | 0 | 0 | PASS |
| kontekst/uralsk | 0 | 0 | 0 | 0 | 0 | PASS |
| google-ads/uralsk | 0 | 0 | 0 | 0 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.

## 9. Не менялось

Astana template, shared CSS/JS, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.

## 10. Git status

`LOCAL ONLY`
