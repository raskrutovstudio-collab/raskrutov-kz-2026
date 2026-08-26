# CITY DOSSIER — СЕМЕЙ (Яндекс Директ)

Дата: 2026-08-21  
Task ID: TASK-20260821-121332  
Статус: LOCAL ONLY (без commit / push / deploy / sitemap)

## 1. Идентификаторы

| Поле | Значение |
|---|---|
| RU | Семей |
| slug | `semey` |
| Локатив | в Семее |
| Родительный | Семея |
| `areaServed` | `{"@type":"City","name":"Semey"}` |
| Canonical | `https://raskrutov.kz/web-studiya/kontekstnaya-reklama/yandex-direct/semey/` |
| Шаблон | `yandex-direct/astana/index.html` (не изменялся) |
| Файл | `site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/semey/index.html` |

**Title:** Яндекс Директ в Семее — настройка и ведение | Raskrutov  
**H1:** Настройка и ведение Яндекс Директ в Семее  
**Description:** Яндекс Директ для Семея: город отдельно от области Абай и Усть-Каменогорска, RU/KK фразы, цели в Метрике. От 120 000 ₸ в месяц.

## 2. Гео-логика

- Семей — торговый и сервисный центр **области Абай**.
- В Директе город выбирается отдельно от области Абай.
- Усть-Каменогорск — отдельный городской контур / отдельная city page; не смешивать с Семеем.
- **Не использовать** устаревшую ВКО / Восточно-Казахстанскую привязку как текущий гео-контекст.

## 3. Удалённая модель

- Ведение из Петропавловска.
- Офис в Schema и на странице: ул. М. Жумабаева, 109, 6 этаж, офис 606а.
- Филиала / представительства в Семее нет (явно в short-answer и FAQ).

## 4. Коммерция

- Цена: от 120 000 ₸ / мес (гонорар агентства).
- Медиабюджет — отдельно, на балансе клиента.
- Без выдуманных KPI, отзывов и рейтингов.

## 5. Технические ID

| Назначение | Значение |
|---|---|
| Контакты form | `rk-form-contacts-yd-semey` / `contacts_yandex_direct_semey` |
| Попап form | `rk-form-popup-yd-semey` / `popup_yandex_direct_semey` |
| Поля / FAQ | префикс `yd-smy-` |
| Chart gradients | `ydSmyChartFill`, `ydSmyChartFill2` |
| Метрика | 101127167 |
| Viewport CSS | `media="(min-width: 769px)"` как у peers |

## 6. Угол контента

Область Абай; город vs область; отделение от Усть-Каменогорска; самовывоз / доставка / локальный сервис; двуязычный спрос RU/KK при наличии живого KK; удалённая работа из Петропавловска.

## 7. Related

- `/web-studiya/kontekstnaya-reklama/yandex-direct/` (республиканский Яндекс Директ)
- `/web-studiya/kontekstnaya-reklama/semey/`
- `/web-studiya/kontekstnaya-reklama/google-ads/semey/`

## 8. Similarity (официальный similarity-check.cjs)

Все сравнения PASS. Худший peer: **pavlodar** (main_containment **18.43**, core_containment **8.04**, long_dups **0**).

Проверено vs: astana, almaty, shymkent, karaganda, aktobe, taraz, pavlodar, ust-kamenogorsk, yandex-direct/index.html, kontekstnaya-reklama/semey, google-ads/semey.

## 9. Не менялось

Astana, shared CSS/JS, kontekst city pages, google-ads city pages, sitemap — без изменений.
