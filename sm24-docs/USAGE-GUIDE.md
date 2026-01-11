# SM24 Components Usage Guide

> Полное руководство по использованию SM24 визуализаций

## Содержание

1. [Общие принципы](#1-общие-принципы)
2. [SM24-BigNumber](#2-sm24-bignumber)
3. [SM24-TopBigNumber](#3-sm24-topbignumber)
4. [SM24-ARRTrend](#4-sm24-arrtrend)
5. [SM24-ARRWaterfall](#5-sm24-arrwaterfall)
6. [SM24-MonthlyARRBreakdown](#6-sm24-monthlyarrbreakdown)
7. [SM24-TopCustomers](#7-sm24-topcustomers)
8. [SM24-StatusFunnel](#8-sm24-statusfunnel)

---

## 1. Общие принципы

### Создание диаграммы

1. **Перейдите** в Charts → + Chart
2. **Выберите Dataset** (источник данных)
3. **Найдите SM24-*** в списке визуализаций (категория: KPI)
4. **Настройте** метрики и параметры
5. **Сохраните** и добавьте на Dashboard

### Требования к данным

Все SM24 компоненты ожидают данные в формате:

```
┌──────────────┬─────────────┬───────────┐
│ __timestamp  │ metric_name │ value     │
├──────────────┼─────────────┼───────────┤
│ 2024-01-01   │ revenue     │ 1000000   │
│ 2024-02-01   │ revenue     │ 1200000   │
└──────────────┴─────────────┴───────────┘
```

### Форматирование чисел

Поддерживаемые форматы (D3):
- `,d` — разделители тысяч (1,234,567)
- `,.2f` — 2 десятичных знака (1,234.56)
- `.2s` — SI-суффиксы (1.2M)
- `$,.0f` — валюта ($1,235)

---

## 2. SM24-BigNumber

### Назначение
Отображение одного ключевого показателя с трендом, сравнениями и прогресс-баром.

### SQL пример

```sql
SELECT
  DATE_TRUNC('month', order_date) as __timestamp,
  SUM(total_amount) as revenue,
  COUNT(*) as order_count
FROM orders
WHERE order_date >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY 1
ORDER BY 1
```

### Настройка

| Секция | Параметр | Описание | Пример |
|--------|----------|----------|--------|
| Query | Metric | Основная метрика | `SUM(revenue)` |
| Query | Time Comparison | Период сравнения | `1 year ago` |
| Display | Show Trend | Показать sparkline | ✅ |
| Display | Show Comparison | Показать YoY/MoM | ✅ |
| Display | Show Progress Bar | Показать прогресс | ✅ |
| Formatting | Number Format | D3 формат | `,.0f` |
| Formatting | Currency | Валюта | `UZS` |
| Formatting | Auto Scale | Авто-масштаб | ✅ (K, M, B) |

### Конфигурация сравнения

```
Time Comparison Options:
├── 1 year ago     → YoY (год к году)
├── 1 quarter ago  → QoQ (квартал к кварталу)
├── 1 month ago    → MoM (месяц к месяцу)
├── 1 week ago     → WoW (неделя к неделе)
└── inherit        → Наследовать из фильтров
```

### Пример результата

```
┌─────────────────────────────────┐
│  Revenue                        │
│  ▇▇▆▅▇█▇▆▇█                    │
│                                 │
│  1.2 млрд сум                   │
│  +15.3% vs LY                   │
│                                 │
│  ████████░░ 78%                 │
│  Target: 1.5 млрд               │
└─────────────────────────────────┘
```

---

## 3. SM24-TopBigNumber

### Назначение
Несколько KPI карточек в одном виджете (2-6 метрик).

### SQL пример

```sql
SELECT
  DATE_TRUNC('month', created_at) as __timestamp,
  SUM(revenue) as revenue,
  SUM(cost) as cost,
  COUNT(DISTINCT customer_id) as customers,
  AVG(order_value) as avg_order
FROM orders
GROUP BY 1
```

### Настройка

| Параметр | Описание | Рекомендация |
|----------|----------|--------------|
| Metrics Count | Количество карточек | 3-4 оптимально |
| Metrics | Выбранные метрики | Выбрать по важности |
| Layout | Расположение | horizontal |
| Show Sparklines | Мини-графики | ✅ для трендов |

### Конфигурация карточек

Каждая карточка настраивается индивидуально:

```typescript
Card 1:
├── Metric: revenue
├── Label: "Выручка"
├── Color: #2ECC71 (green)
├── Show Trend: true
└── Show Comparison: true

Card 2:
├── Metric: customers
├── Label: "Клиенты"
├── Color: #009EE0 (blue)
└── ...
```

---

## 4. SM24-ARRTrend

### Назначение
Mixed Chart для отслеживания ARR (Annual Recurring Revenue) с YoY сравнением.

### SQL пример

```sql
-- Основной запрос
SELECT
  DATE_TRUNC('month', report_date) as __timestamp,
  SUM(arr_amount) as arr,
  SUM(target_arr) as target,
  SUM(CASE WHEN customer_type = 'new' THEN arr_amount ELSE 0 END) as new_arr
FROM arr_reports
WHERE report_date >= '2023-01-01'
GROUP BY 1
ORDER BY 1
```

### Особенности

**Dual Axis Chart**:
- Левая ось: ARR (бары)
- Правая ось: Growth Rate % (линия)

**YoY Comparison**:
- Пунктирная линия — ARR прошлого года
- Автоматический расчёт growth rate

### Настройка

| Секция | Параметр | Значение |
|--------|----------|----------|
| Query | Primary Metric | `SUM(arr)` |
| Query | Comparison Metric | `SUM(arr)` с offset `1 year` |
| Query | Target Metric | `SUM(target)` (опционально) |
| Display | Chart Type | `bar + line` |
| Display | Show YoY Line | ✅ |
| Display | Show Target Line | ✅ |
| Growth | Excellent Threshold | 30% |
| Growth | Good Threshold | 15% |

### Интерпретация цветов роста

```
🟢 Green:  Growth ≥ 30%  — Excellent
🟡 Yellow: Growth 15-30% — Good
🟠 Orange: Growth 0-15%  — Moderate
🔴 Red:    Growth < 0%   — Decline
```

---

## 5. SM24-ARRWaterfall

### Назначение
Waterfall диаграмма для анализа изменения ARR за период.

### Структура данных

```sql
SELECT
  'Beginning ARR' as category,
  SUM(beginning_arr) as value,
  1 as sort_order
FROM arr_summary
WHERE period = '2024-Q1'

UNION ALL

SELECT 'New Business', SUM(new_arr), 2 FROM arr_summary WHERE period = '2024-Q1'
UNION ALL SELECT 'Expansion', SUM(expansion_arr), 3 FROM arr_summary WHERE period = '2024-Q1'
UNION ALL SELECT 'Contraction', -SUM(contraction_arr), 4 FROM arr_summary WHERE period = '2024-Q1'
UNION ALL SELECT 'Churn', -SUM(churn_arr), 5 FROM arr_summary WHERE period = '2024-Q1'
UNION ALL SELECT 'Ending ARR', SUM(ending_arr), 6 FROM arr_summary WHERE period = '2024-Q1'

ORDER BY sort_order
```

### Компоненты waterfall

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   Beginning  +New   +Expansion  -Contraction  -Churn  End  │
│      ████                                           ████   │
│      ████    ██      ████                           ████   │
│      ████    ██      ████        ██                 ████   │
│      ████    ██      ████        ██         █       ████   │
│                                                            │
│   Quick Ratio: 3.2 🟢                                      │
└────────────────────────────────────────────────────────────┘
```

### Quick Ratio

Автоматически рассчитывается:
```
Quick Ratio = (New + Expansion) / (Contraction + Churn)

Интерпретация:
🟢 ≥ 4.0  — Excellent growth
🟡 2.0-4.0 — Healthy
🟠 1.0-2.0 — Needs attention
🔴 < 1.0  — Revenue shrinking
```

### Настройка

| Параметр | Описание |
|----------|----------|
| Beginning ARR Metric | Метрика начального ARR |
| New ARR Metric | Метрика нового бизнеса |
| Expansion ARR Metric | Метрика расширения |
| Contraction ARR Metric | Метрика сокращения |
| Churn ARR Metric | Метрика оттока |
| Show Quick Ratio | Показать Quick Ratio badge |
| Show Connectors | Показать соединительные линии |

---

## 6. SM24-MonthlyARRBreakdown

### Назначение
Горизонтальные stacked bars для анализа ARR по продуктам и сегментам клиентов.

### SQL пример

```sql
SELECT
  product_line,
  customer_segment,
  SUM(arr_amount) as arr
FROM arr_by_segment
WHERE report_date = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY 1, 2
ORDER BY arr DESC
```

### Структура данных

```
┌──────────────┬─────────────┬───────────┐
│ product_line │ segment     │ arr       │
├──────────────┼─────────────┼───────────┤
│ ERP          │ Enterprise  │ 500000    │
│ ERP          │ Mid-Market  │ 300000    │
│ ERP          │ SMB         │ 150000    │
│ CRM          │ Enterprise  │ 400000    │
│ CRM          │ Mid-Market  │ 250000    │
│ ...          │ ...         │ ...       │
└──────────────┴─────────────┴───────────┘
```

### Визуализация

```
Product Lines        Enterprise   Mid-Market    SMB      Starter
────────────────────────────────────────────────────────────────
ERP           ██████████████████████████████░░░░░░░░░░░  950K
CRM           ████████████████████░░░░░░░░░░░░░░░░░░░░  650K
Analytics     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  400K
Integration   ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  200K

              ⚠️ Enterprise concentration: 62% (Risk!)
```

### Настройка

| Параметр | Описание | Пример |
|----------|----------|--------|
| Category Column | Измерение для Y-оси | `product_line` |
| Segment Column | Измерение для стека | `customer_segment` |
| Value Metric | Метрика значения | `SUM(arr)` |
| Segment Colors | Цвета сегментов | Enterprise: #1a365d |
| Show Concentration Warning | Предупреждение о концентрации | ✅ |
| Concentration Threshold | Порог концентрации | 50% |

---

## 7. SM24-TopCustomers

### Назначение
Интерактивная таблица топ клиентов с health-индикаторами и risk assessment.

### SQL пример

```sql
SELECT
  c.customer_id,
  c.customer_name,
  c.segment,
  c.contract_start_date,
  c.contract_end_date,

  -- ARR метрики
  SUM(a.current_arr) as arr,
  SUM(a.arr_1_year_ago) as arr_ly,

  -- Health метрики
  AVG(h.nps_score) as nps,
  AVG(h.usage_score) as usage,
  AVG(h.support_tickets) as tickets,
  MAX(h.last_login_date) as last_activity,

  -- Риски
  CASE
    WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'high'
    WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '180 days' THEN 'medium'
    ELSE 'low'
  END as renewal_risk

FROM customers c
JOIN arr_data a ON c.customer_id = a.customer_id
LEFT JOIN health_metrics h ON c.customer_id = h.customer_id
GROUP BY 1, 2, 3, 4, 5
ORDER BY arr DESC
LIMIT 30
```

### Колонки таблицы

| # | Колонка | Тип | Форматирование |
|---|---------|-----|----------------|
| 1 | Customer | text | — |
| 2 | Segment | badge | Цветовой код |
| 3 | ARR | currency | 1.2M сум |
| 4 | Growth | percent | +15% / -5% |
| 5 | Health Score | progress | ████░░ 78% |
| 6 | NPS | number | Color-coded |
| 7 | Usage | percent | Trend arrow |
| 8 | Tickets | number | Warning if > threshold |
| 9 | Last Activity | relative | "5 days ago" |
| 10 | Renewal Date | date | Color by urgency |
| 11 | Risk Level | status | 🔴🟡🟢 |
| 12 | Tenure | duration | "2y 3m" |
| 13 | Actions | buttons | View / Contact |

### Health Score расчёт

```
Health Score = (NPS_normalized × 0.3) +
               (Usage × 0.3) +
               (Ticket_score × 0.2) +
               (Activity_score × 0.2)

Где:
- NPS_normalized = (NPS + 100) / 200  // -100..100 → 0..1
- Usage = usage_percent / 100
- Ticket_score = 1 - (tickets / max_tickets)
- Activity_score = days_since_last_login scoring
```

### Настройка

| Секция | Параметр | Описание |
|--------|----------|----------|
| Entity | ID Column | customer_id |
| Entity | Name Column | customer_name |
| Entity | Segment Column | segment |
| Metrics | ARR Column | arr |
| Metrics | ARR LY Column | arr_ly |
| Health | NPS Column | nps |
| Health | Usage Column | usage |
| Health | Tickets Column | tickets |
| Health | Activity Column | last_activity |
| Risk | Renewal Date Column | contract_end_date |
| Risk | Risk Days Thresholds | 90, 180 |

---

## 8. SM24-StatusFunnel

### Назначение
Универсальная воронка статусов для любого типа сущностей (заказы, визиты, лиды, задачи).

### SQL пример (заказы)

```sql
SELECT
  s.status_id,
  s.status_name,
  s.status_order,
  s.status_color,
  COUNT(o.order_id) as entity_count,
  SUM(o.total_amount) as total_amount
FROM order_statuses s
LEFT JOIN orders o ON s.status_id = o.status_id
  AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY 1, 2, 3, 4
ORDER BY s.status_order
```

### Структура данных

```
┌───────────┬─────────────┬──────────┬──────────┬──────────┬─────────────┐
│ status_id │ status_name │ order    │ color    │ count    │ amount      │
├───────────┼─────────────┼──────────┼──────────┼──────────┼─────────────┤
│ 1         │ Новый       │ 1        │ #3498db  │ 138      │ 44700000    │
│ 2         │ В обработке │ 2        │ #f39c12  │ 13       │ 3700000     │
│ 3         │ В ожидании  │ 3        │ #9b59b6  │ 31       │ 9200000     │
│ 4         │ Отгружен    │ 4        │ #1abc9c  │ 73       │ 22800000    │
│ 5         │ Доставлен   │ 5        │ #27ae60  │ 3        │ 1400000     │
│ 6         │ Архив       │ 6        │ #95a5a6  │ 1287     │ 1928600000  │
└───────────┴─────────────┴──────────┴──────────┴──────────┴─────────────┘
```

### Визуализация

```
┌──────────────────────────────────────────────────────────────────────┐
│  Статусы заказов                           [Orders ▼] [⟳] [ⓘ] [✕]   │
│                                                                      │
│  ┌─────────┐    ┌───────────┐    ┌──────────┐    ┌────────┐         │
│  │ Новый   │ →  │В обработке│ →  │В ожидании│ →  │Отгружен│ → ...   │
│  │   138   │    │    13     │    │    31    │    │   73   │         │
│  │ заказов │    │  заказов  │    │ заказов  │    │заказов │         │
│  │ 44.7M   │    │   3.7M    │    │   9.2M   │    │ 22.8M  │         │
│  │   9%    │    │    1%     │    │    2%    │    │   5%   │         │
│  └─────────┘    └───────────┘    └──────────┘    └────────┘         │
└──────────────────────────────────────────────────────────────────────┘
```

### Entity Types

Поддерживаемые типы сущностей:

| Type | Label (ru) | Has Amount |
|------|------------|------------|
| orders | Заказы / заказов | ✅ |
| visits | Визиты / визитов | ❌ |
| leads | Лиды / лидов | ✅ |
| tasks | Задачи / задач | ❌ |
| custom | Настраиваемый | ✅/❌ |

### Настройка

| Секция | Параметр | Описание |
|--------|----------|----------|
| Entity | Entity Type | Тип сущности |
| Entity | Custom Label (Singular) | Ед. число |
| Entity | Custom Label (Plural) | Мн. число |
| Entity | Custom Label (Genitive) | Род. падеж |
| Query | Status ID Column | status_id |
| Query | Status Name Column | status_name |
| Query | Status Order Column | status_order |
| Query | Status Color Column | status_color (опц.) |
| Query | Count Column | entity_count |
| Query | Amount Column | total_amount (опц.) |
| Display | Show Amounts | Показать суммы |
| Display | Show Percentages | Показать проценты |
| Display | Show Arrows | Показать стрелки |
| Display | Max Cards | Макс. карточек |
| Interactivity | Enable Drilldown | Клик → детализация |
| Interactivity | Enable Type Switch | Переключатель типа |

---

## 9. Общие советы

### Оптимизация производительности

1. **Используйте агрегацию** в SQL, не тяните сырые данные
2. **Ограничивайте период** фильтрами времени
3. **Кэшируйте** тяжёлые запросы
4. **Используйте LIMIT** для TopCustomers

### Локализация

Все компоненты поддерживают:
- Русский (ru-RU) — основной
- Английский (en-US)
- Узбекский (uz-UZ)

Формат чисел адаптируется автоматически:
- RU: `1 234 567,89`
- EN: `1,234,567.89`

### Цветовые схемы

Рекомендуемые схемы по назначению:

| Use Case | Scheme |
|----------|--------|
| Financial metrics | sm24_arr (green → red) |
| Status/Progress | sm24_status (rainbow) |
| Segments | sm24_segments (categorical) |
| Alerts | sm24_alerts (traffic light) |

---

## 10. Troubleshooting

### Нет данных

1. Проверьте фильтры времени
2. Убедитесь, что Dataset подключен
3. Проверьте SQL-запрос в SQL Lab

### Неправильное форматирование

1. Проверьте D3 format string
2. Убедитесь в выбранной локали
3. Проверьте тип данных метрики

### Сравнение не работает

1. Убедитесь, что есть данные за период сравнения
2. Проверьте time_offset в Query
3. Dataset должен содержать __timestamp

---

**Следующий шаг**: [ARCHITECTURE.md](./ARCHITECTURE.md) — техническая архитектура компонентов
