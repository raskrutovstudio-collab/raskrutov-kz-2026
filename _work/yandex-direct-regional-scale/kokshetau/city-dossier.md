# CITY DOSSIER — КОКШЕТАУ (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-151801  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Кокшетау |
| KK | Көкшетау |
| slug | `kokshetau` |
| Локатив | в Кокшетау |
| Родительный | Кокшетау |
| `areaServed` | `{"@type":"City","name":"Kokshetau"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/kokshetau/` |
| Шаблон | `yandex-direct/astana/index.html` (DOM peers; remote-модель как у kostanay) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/kokshetau/index.html` |

**Title:** Яндекс Директ в Кокшетау — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Кокшетау  
**Description:** Яндекс Директ в Кокшетау: город отдельно от Акмолинской области и Астаны, озёрный сезон и админ-спрос, цели в Метрике. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Кокшетау — административный центр Акмолинской области с круглогодичным городским спросом.
- В Директе город выбирается отдельно от Акмолинской области.
- Астана — отдельный контур; в городской бюджет не подмешивается без отдельного решения.
- Озёрный / курортный сезон (озёрный пояс) — отдельный лимит только при реальном приёме.
- Без выдуманных клиентских KPI, отзывов и рейтингов.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Кокшетау нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-kokshetau` / `contacts_yandex_direct_kokshetau` |
| Попап form | `rk-form-popup-yd-kokshetau` / `popup_yandex_direct_kokshetau` |
| Поля / FAQ | префикс `yd-kks-` |
| Chart gradients | `ydKksChartFill`, `ydKksChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Город vs Акмолинская область vs Астана; админ-центр + городской сервис/подряд; озёрный сезон отдельно; удалённая работа из Петропавловска. Проза сознательно отлична от astana / petropavlovsk / kostanay и от kontekst/google-ads kokshetau.

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/`
- `/web-studiya/kontekstnaya-reklama/kokshetau/`
- `/web-studiya/kontekstnaya-reklama/google-ads/kokshetau/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения **PASS** (все published YD + turkestan + yd index + kontekst/kokshetau + google-ads/kokshetau).

Худший peer: **kostanay** (main_containment **20.55**, core_containment **10.70**, main_jaccard **11.80**, core_jaccard **5.94**, long_dups **0**).

| Peer | main_c | core_c | main_j | core_j | dups | pass |
|---|---:|---:|---:|---:|---:|:---:|
| kostanay | 20.55 | 10.70 | 11.80 | 5.94 | 0 | PASS |
| atyrau | 16.28 | 11.90 | 9.24 | 6.81 | 0 | PASS |
| kyzylorda | 12.24 | 4.80 | 6.72 | 2.58 | 0 | PASS |
| uralsk | 9.43 | 4.91 | 5.11 | 2.65 | 0 | PASS |
| semey | 8.37 | 4.91 | 4.53 | 2.68 | 0 | PASS |
| turkestan | 7.75 | 3.49 | 4.02 | 1.80 | 0 | PASS |
| petropavlovsk | 7.36 | 6.00 | 4.00 | 3.35 | 0 | PASS |
| aktau | 7.24 | 3.71 | 3.82 | 1.98 | 0 | PASS |
| ust-kamenogorsk | 6.63 | 2.40 | 3.51 | 1.27 | 0 | PASS |
| pavlodar | 5.22 | 1.75 | 2.70 | 0.92 | 0 | PASS |
| astana | 3.76 | 0 | 2.10 | 0 | 0 | PASS |
| karaganda / shymkent / aktobe / taraz / almaty | ≤1 | ≤1 | ≤1 | ≤1 | 0 | PASS |
| yandex-direct/index | 0.11 | 0 | 0.06 | 0 | 0 | PASS |
| kontekst/kokshetau | 0 | 0 | 0 | 0 | 0 | PASS |
| google-ads/kokshetau | 0.06 | 0.11 | 0.03 | 0.08 | 0 | PASS |

Пороги скрипта: main_c ≤ 25, main_j ≤ 15, core_c ≤ 15, core_j ≤ 10, long_dups = 0.

## 9. Не менялось

Astana template, shared CSS/JS, kontekst/google-ads city pages, sitemap — без изменений. Commit / push / deploy не выполнялись.

## 10. Git status

`LOCAL ONLY`
