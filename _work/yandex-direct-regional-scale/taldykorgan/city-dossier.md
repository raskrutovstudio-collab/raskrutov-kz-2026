# CITY DOSSIER — ТАЛДЫКОРГАН (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-155927  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Талдыкорган |
| slug | `taldykorgan` |
| Локатив | в Талдыкоргане |
| Родительный | Талдыкоргана |
| `areaServed` | `{"@type":"City","name":"Taldykorgan"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/` |
| Шаблон | `yandex-direct/astana/index.html` (DOM peers; remote-модель как у kostanay) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/taldykorgan/index.html` |

**Title:** Яндекс Директ в Талдыкоргане — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Талдыкоргане  
**Description:** Яндекс Директ в Талдыкоргане: город отдельно от Жетысуской области и Алматы, админ-спрос и агросервис, цели в Метрике. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Талдыкорган — административный центр Жетысуской области с городским спросом на сервис, розницу, подряд и агропоставки.
- В Директе город выбирается отдельно от Жетысуской области.
- Алматы — отдельный контур; в городской бюджет не подмешивается без отдельного решения.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Талдыкоргане нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-taldykorgan` / `contacts_yandex_direct_taldykorgan` |
| Попап form | `rk-form-popup-yd-taldykorgan` / `popup_yandex_direct_taldykorgan` |
| Поля / FAQ | префикс `yd-tdk-` |
| Chart gradients | `ydTdkChartFill`, `ydTdkChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Город vs Жетысуская область vs Алматы; админ-центр + городской сервис/подряд; агропоставки отдельно; удалённая работа из Петропавловска. Проза сознательно отлична от almaty / kokshetau / turkestan / kostanay и от kontekst/google-ads taldykorgan.

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/taldykorgan/`
- `/web-studiya/kontekstnaya-reklama/google-ads/taldykorgan/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS** (все published YD + kokshetau HTML + turkestan + yd index + kontekst/taldykorgan + google-ads/taldykorgan).

Худший peer: **kostanay** (main_containment **24.15**, core_containment **12.24**, main_jaccard **13.91**, core_jaccard **6.69**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| kostanay | 24.15 | 12.24 | 13.91 | 6.69 | 0 | PASS |
| kokshetau | 20.96 | 14.99 | 11.51 | 7.90 | 0 | PASS |
| atyrau | 14.71 | 9.04 | 8.14 | 4.97 | 0 | PASS |
| kyzylorda | 13.55 | 5.03 | 7.37 | 2.64 | 0 | PASS |
| uralsk | 10.08 | 5.15 | 5.39 | 2.72 | 0 | PASS |
| semey | 9.44 | 5.15 | 5.06 | 2.75 | 0 | PASS |
| turkestan | 7.87 | 5.61 | 4.02 | 2.85 | 0 | PASS |
| ust-kamenogorsk | 7.87 | 2.63 | 4.13 | 1.36 | 0 | PASS |
| petropavlovsk | 7.53 | 6.64 | 4.03 | 3.63 | 0 | PASS |
| aktau | 7.47 | 4.35 | 3.89 | 2.28 | 0 | PASS |
| pavlodar | 6.43 | 1.37 | 3.30 | 0.71 | 0 | PASS |
| astana | 5.50 | 0.46 | 3.05 | 0.26 | 0 | PASS |
| karaganda / aktobe / almaty / taraz / shymkent | ≤1 | ≤1 | ≤1 | ≤1 | 0 | PASS |
| yandex-direct/index | 0.17 | 0.11 | 0.10 | 0.07 | 0 | PASS |
| kontekst/taldykorgan | 0 | 0 | 0 | 0 | 0 | PASS |
| google-ads/taldykorgan | 0 | 0 | 0 | 0 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.

## 9. Не менялось

Astana template, shared CSS/JS, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.

## 10. Git status

`LOCAL ONLY`
