# CITY DOSSIER — КОСТАНАЙ (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-132341  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Костанай |
| KK | Қостанай |
| slug | `kostanay` |
| Локатив | в Костанае |
| Родительный | Костаная |
| `areaServed` | `{"@type":"City","name":"Kostanay"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/` |
| Шаблон | `yandex-direct/astana/index.html` (структура peers; не изменялся) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kostanay/index.html` |

**Title:** Яндекс Директ в Костанае — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Костанае  
**Description:** Яндекс Директ в Костанае: город отдельно от Костанайской области и Рудного, агропоставки и городской сервис, цели в Метрике. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Костанай — северный узел: агропоставки хозяйствам, промышленный/сервисный B2B, городская розница и услуги.
- В Директе город выбирается отдельно от Костанайской области.
- Рудный — отдельный населённый пункт; подключается только по фактической выдаче / выезду / отгрузке, со своим лимитом.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Костанае нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-kostanay` / `contacts_yandex_direct_kostanay` |
| Попап form | `rk-form-popup-yd-kostanay` / `popup_yandex_direct_kostanay` |
| Поля / FAQ | префикс `yd-kst-` |
| Chart gradients | `ydKstChartFill`, `ydKstChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Город vs Костанайская область vs Рудный; агропоставки + промышленный/сервисный спрос; городская розница отдельно; удалённая работа из Петропавловска.

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/kostanay/`
- `/web-studiya/kontekstnaya-reklama/google-ads/kostanay/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS**. Худший peer: **atyrau** (main_containment **20.92**, core_containment **14.18**, main_jaccard **11.85**, core_jaccard **7.83**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| atyrau | 20.92 | 14.18 | 11.85 | 7.83 | 0 | PASS |
| semey | 13.00 | 8.17 | 7.02 | 4.33 | 0 | PASS |
| ust-kamenogorsk | 9.38 | 3.25 | 4.90 | 1.64 | 0 | PASS |
| pavlodar | 7.24 | 1.32 | 3.68 | 0.66 | 0 | PASS |
| astana | 5.88 | 0.24 | 3.23 | 0.13 | 0 | PASS |
| karaganda | 0.77 | 0 | 0.38 | 0 | 0 | PASS |
| taraz | ≤1 | ≤1 | ≤1 | ≤1 | 0 | PASS |
| aktobe / almaty / shymkent | ≤1 | ≤1 | ≤1 | ≤1 | 0 | PASS |
| yandex-direct/index | 0.18 | 0.12 | 0.10 | 0.07 | 0 | PASS |
| kontekst/kostanay | 0 | 0 | 0 | 0 | 0 | PASS |
| google-ads/kostanay | 0 | 0 | 0 | 0 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.

## 9. Не менялось

Astana template, shared CSS/JS, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.

## 10. Git status

`LOCAL ONLY`
