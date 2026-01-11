# SM24 Components Data Requirements

> Требования к данным и примеры SQL запросов

## 1. Общие требования

### 1.1 Формат данных

Все SM24 компоненты ожидают данные в табличном формате:

```sql
-- Базовый формат
SELECT
  DATE_TRUNC('month', date_column) as __timestamp,  -- Временная метка
  dimension_column,                                  -- Измерение (опционально)
  SUM(metric_column) as metric_name                 -- Метрика
FROM table_name
WHERE date_column >= 'start_date'
GROUP BY 1, 2
ORDER BY 1
```

### 1.2 Ключевые колонки

| Колонка | Тип | Описание | Обязательность |
|---------|-----|----------|----------------|
| `__timestamp` | DATE/TIMESTAMP | Временная метка | Для time-series |
| metric | NUMERIC | Числовая метрика | ✅ Обязательно |
| dimension | VARCHAR | Категория/группа | Зависит от компонента |

---

## 2. SM24-BigNumber

### Требования

| Поле | Тип | Описание |
|------|-----|----------|
| `__timestamp` | DATE | Для sparkline тренда |
| metric | NUMERIC | Основное значение |

### SQL примеры

#### Базовый запрос (одно значение)

```sql
SELECT
  SUM(total_amount) as revenue
FROM orders
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
```

#### С трендом (sparkline)

```sql
SELECT
  DATE_TRUNC('day', created_at) as __timestamp,
  SUM(total_amount) as revenue
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1
```

#### С YoY сравнением

```sql
-- Основной запрос
SELECT
  DATE_TRUNC('month', created_at) as __timestamp,
  SUM(total_amount) as revenue
FROM orders
WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY 1
ORDER BY 1

-- Superset добавит time_offset автоматически для сравнения
```

#### С таргетом

```sql
SELECT
  DATE_TRUNC('month', report_date) as __timestamp,
  SUM(actual_revenue) as revenue,
  SUM(target_revenue) as target
FROM monthly_targets
WHERE YEAR(report_date) = YEAR(CURRENT_DATE)
GROUP BY 1
ORDER BY 1
```

---

## 3. SM24-TopBigNumber

### Требования

| Поле | Тип | Описание |
|------|-----|----------|
| `__timestamp` | DATE | Для sparklines |
| metric_1..N | NUMERIC | 2-6 метрик |

### SQL пример

```sql
SELECT
  DATE_TRUNC('month', created_at) as __timestamp,

  -- Метрика 1: Выручка
  SUM(total_amount) as revenue,

  -- Метрика 2: Количество заказов
  COUNT(*) as orders,

  -- Метрика 3: Средний чек
  AVG(total_amount) as avg_order,

  -- Метрика 4: Уникальные клиенты
  COUNT(DISTINCT customer_id) as customers,

  -- Метрика 5: Конверсия (пример)
  COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT /
    NULLIF(COUNT(*), 0) * 100 as conversion_rate

FROM orders
WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY 1
ORDER BY 1
```

---

## 4. SM24-ARRTrend

### Требования

| Поле | Тип | Описание |
|------|-----|----------|
| `__timestamp` | DATE | Месяц |
| arr | NUMERIC | ARR значение |
| target | NUMERIC | Целевое значение (опционально) |

### SQL примеры

#### Базовый ARR тренд

```sql
SELECT
  DATE_TRUNC('month', report_date) as __timestamp,
  SUM(arr_amount) as arr
FROM arr_snapshots
WHERE report_date >= '2023-01-01'
GROUP BY 1
ORDER BY 1
```

#### С YoY сравнением (автоматическое)

```sql
-- Superset добавит time_offset: ['1 year ago']
SELECT
  DATE_TRUNC('month', report_date) as __timestamp,
  SUM(arr_amount) as arr,
  SUM(target_arr) as target
FROM arr_snapshots
WHERE report_date >= '2023-01-01'
GROUP BY 1
ORDER BY 1
```

#### С детализацией по типу ARR

```sql
SELECT
  DATE_TRUNC('month', report_date) as __timestamp,
  SUM(arr_amount) as total_arr,
  SUM(CASE WHEN arr_type = 'new' THEN arr_amount ELSE 0 END) as new_arr,
  SUM(CASE WHEN arr_type = 'expansion' THEN arr_amount ELSE 0 END) as expansion_arr,
  SUM(target_arr) as target
FROM arr_snapshots
WHERE report_date >= '2023-01-01'
GROUP BY 1
ORDER BY 1
```

---

## 5. SM24-ARRWaterfall

### Требования

| Поле | Тип | Описание |
|------|-----|----------|
| beginning_arr | NUMERIC | Начальный ARR |
| new_arr | NUMERIC | Новый бизнес |
| expansion_arr | NUMERIC | Расширение |
| contraction_arr | NUMERIC | Сокращение |
| churn_arr | NUMERIC | Отток |
| ending_arr | NUMERIC | Конечный ARR |

### SQL примеры

#### Стандартный waterfall

```sql
SELECT
  SUM(beginning_arr) as beginning_arr,
  SUM(new_arr) as new_arr,
  SUM(expansion_arr) as expansion_arr,
  SUM(contraction_arr) as contraction_arr,
  SUM(churn_arr) as churn_arr,
  SUM(ending_arr) as ending_arr
FROM arr_movements
WHERE period = '2024-Q1'
```

#### С UNION для категорий

```sql
-- Альтернативный формат: категории в строках
SELECT 'Beginning ARR' as category, SUM(beginning_arr) as value, 1 as sort_order
FROM arr_movements WHERE period = '2024-Q1'
UNION ALL
SELECT 'New Business', SUM(new_arr), 2 FROM arr_movements WHERE period = '2024-Q1'
UNION ALL
SELECT 'Expansion', SUM(expansion_arr), 3 FROM arr_movements WHERE period = '2024-Q1'
UNION ALL
SELECT 'Contraction', -ABS(SUM(contraction_arr)), 4 FROM arr_movements WHERE period = '2024-Q1'
UNION ALL
SELECT 'Churn', -ABS(SUM(churn_arr)), 5 FROM arr_movements WHERE period = '2024-Q1'
UNION ALL
SELECT 'Ending ARR', SUM(ending_arr), 6 FROM arr_movements WHERE period = '2024-Q1'
ORDER BY sort_order
```

#### Расчёт из детальных данных

```sql
WITH current_period AS (
  SELECT
    customer_id,
    arr_amount as current_arr
  FROM subscriptions
  WHERE snapshot_date = '2024-03-31'
),
previous_period AS (
  SELECT
    customer_id,
    arr_amount as previous_arr
  FROM subscriptions
  WHERE snapshot_date = '2023-12-31'
)
SELECT
  SUM(COALESCE(p.previous_arr, 0)) as beginning_arr,

  -- New: есть current, нет previous
  SUM(CASE
    WHEN p.previous_arr IS NULL AND c.current_arr > 0
    THEN c.current_arr ELSE 0
  END) as new_arr,

  -- Expansion: current > previous
  SUM(CASE
    WHEN c.current_arr > COALESCE(p.previous_arr, 0) AND p.previous_arr > 0
    THEN c.current_arr - p.previous_arr ELSE 0
  END) as expansion_arr,

  -- Contraction: current < previous (но не churn)
  SUM(CASE
    WHEN c.current_arr < p.previous_arr AND c.current_arr > 0
    THEN p.previous_arr - c.current_arr ELSE 0
  END) as contraction_arr,

  -- Churn: был previous, нет current
  SUM(CASE
    WHEN c.current_arr IS NULL OR c.current_arr = 0
    THEN COALESCE(p.previous_arr, 0) ELSE 0
  END) as churn_arr,

  SUM(COALESCE(c.current_arr, 0)) as ending_arr

FROM previous_period p
FULL OUTER JOIN current_period c ON p.customer_id = c.customer_id
```

---

## 6. SM24-MonthlyARRBreakdown

### Требования

| Поле | Тип | Описание |
|------|-----|----------|
| product_line | VARCHAR | Продуктовая линия (Y-ось) |
| segment | VARCHAR | Сегмент клиента (стек) |
| arr | NUMERIC | Значение ARR |

### SQL пример

```sql
SELECT
  p.product_name as product_line,
  c.segment as customer_segment,
  SUM(s.arr_amount) as arr
FROM subscriptions s
JOIN products p ON s.product_id = p.product_id
JOIN customers c ON s.customer_id = c.customer_id
WHERE s.snapshot_date = DATE_TRUNC('month', CURRENT_DATE)
  AND s.arr_amount > 0
GROUP BY 1, 2
ORDER BY
  SUM(s.arr_amount) OVER (PARTITION BY p.product_name) DESC,
  p.product_name,
  CASE c.segment
    WHEN 'Enterprise' THEN 1
    WHEN 'Mid-Market' THEN 2
    WHEN 'SMB' THEN 3
    WHEN 'Starter' THEN 4
    ELSE 5
  END
```

#### Ожидаемый результат

```
┌──────────────┬─────────────┬───────────┐
│ product_line │ segment     │ arr       │
├──────────────┼─────────────┼───────────┤
│ ERP          │ Enterprise  │ 500000    │
│ ERP          │ Mid-Market  │ 300000    │
│ ERP          │ SMB         │ 150000    │
│ ERP          │ Starter     │ 50000     │
│ CRM          │ Enterprise  │ 400000    │
│ CRM          │ Mid-Market  │ 250000    │
│ CRM          │ SMB         │ 100000    │
│ Analytics    │ Enterprise  │ 300000    │
│ Analytics    │ Mid-Market  │ 100000    │
└──────────────┴─────────────┴───────────┘
```

---

## 7. SM24-TopCustomers

### Требования

| Поле | Тип | Описание |
|------|-----|----------|
| customer_id | VARCHAR/INT | ID клиента |
| customer_name | VARCHAR | Название |
| segment | VARCHAR | Сегмент |
| arr | NUMERIC | Текущий ARR |
| arr_ly | NUMERIC | ARR год назад |
| nps | NUMERIC | NPS score (-100..100) |
| usage | NUMERIC | % использования |
| tickets | INT | Кол-во тикетов |
| last_activity | DATE | Последняя активность |
| contract_end | DATE | Дата окончания контракта |

### SQL пример

```sql
WITH customer_arr AS (
  SELECT
    customer_id,
    SUM(arr_amount) as arr
  FROM subscriptions
  WHERE snapshot_date = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY 1
),
customer_arr_ly AS (
  SELECT
    customer_id,
    SUM(arr_amount) as arr_ly
  FROM subscriptions
  WHERE snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 year'
  GROUP BY 1
),
customer_health AS (
  SELECT
    customer_id,
    AVG(nps_score) as nps,
    AVG(usage_percent) as usage,
    SUM(support_tickets) as tickets,
    MAX(last_login_date) as last_activity
  FROM customer_health_metrics
  WHERE metric_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
  GROUP BY 1
)
SELECT
  c.customer_id,
  c.customer_name,
  c.segment,
  c.contract_start_date,
  c.contract_end_date as contract_end,

  -- ARR метрики
  COALESCE(a.arr, 0) as arr,
  COALESCE(aly.arr_ly, 0) as arr_ly,

  -- Health метрики
  COALESCE(h.nps, 0) as nps,
  COALESCE(h.usage, 0) as usage,
  COALESCE(h.tickets, 0) as tickets,
  h.last_activity,

  -- Расчёт health score
  (
    COALESCE((h.nps + 100) / 200.0, 0.5) * 0.3 +
    COALESCE(h.usage / 100.0, 0.5) * 0.3 +
    COALESCE(1 - LEAST(h.tickets, 10) / 10.0, 0.5) * 0.2 +
    CASE
      WHEN h.last_activity >= CURRENT_DATE - INTERVAL '7 days' THEN 1
      WHEN h.last_activity >= CURRENT_DATE - INTERVAL '30 days' THEN 0.7
      WHEN h.last_activity >= CURRENT_DATE - INTERVAL '90 days' THEN 0.3
      ELSE 0
    END * 0.2
  ) * 100 as health_score

FROM customers c
LEFT JOIN customer_arr a ON c.customer_id = a.customer_id
LEFT JOIN customer_arr_ly aly ON c.customer_id = aly.customer_id
LEFT JOIN customer_health h ON c.customer_id = h.customer_id
WHERE COALESCE(a.arr, 0) > 0
ORDER BY a.arr DESC
LIMIT 30
```

---

## 8. SM24-StatusFunnel

### Требования

| Поле | Тип | Описание |
|------|-----|----------|
| status_id | VARCHAR/INT | ID статуса |
| status_name | VARCHAR | Название статуса |
| status_order | INT | Порядок сортировки |
| status_color | VARCHAR | HEX цвет (опционально) |
| entity_count | INT | Количество сущностей |
| total_amount | NUMERIC | Сумма (опционально) |

### SQL примеры

#### Заказы

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

#### Визиты

```sql
SELECT
  s.status_id,
  s.status_name,
  s.display_order as status_order,
  s.color as status_color,
  COUNT(v.visit_id) as entity_count,
  NULL as total_amount  -- Визиты не имеют суммы
FROM visit_statuses s
LEFT JOIN visits v ON s.status_id = v.status_id
  AND v.visit_date >= DATE_TRUNC('week', CURRENT_DATE)
GROUP BY 1, 2, 3, 4
ORDER BY s.display_order
```

#### Лиды

```sql
SELECT
  ls.stage_id as status_id,
  ls.stage_name as status_name,
  ls.stage_order as status_order,
  ls.stage_color as status_color,
  COUNT(l.lead_id) as entity_count,
  SUM(l.potential_value) as total_amount
FROM lead_stages ls
LEFT JOIN leads l ON ls.stage_id = l.stage_id
  AND l.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY 1, 2, 3, 4
ORDER BY ls.stage_order
```

#### Задачи

```sql
SELECT
  ts.status_code as status_id,
  ts.status_label as status_name,
  ts.sort_order as status_order,
  ts.badge_color as status_color,
  COUNT(t.task_id) as entity_count,
  NULL as total_amount
FROM task_statuses ts
LEFT JOIN tasks t ON ts.status_code = t.status
  AND t.due_date >= CURRENT_DATE - INTERVAL '30 days'
  AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'
GROUP BY 1, 2, 3, 4
ORDER BY ts.sort_order
```

---

## 9. Оптимизация запросов

### 9.1 Индексы

```sql
-- Для time-series запросов
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_subscriptions_snapshot ON subscriptions(snapshot_date, customer_id);

-- Для group by
CREATE INDEX idx_orders_status ON orders(status_id);
CREATE INDEX idx_subscriptions_product ON subscriptions(product_id);
```

### 9.2 Materialized Views

```sql
-- Для ARR компонентов
CREATE MATERIALIZED VIEW mv_monthly_arr AS
SELECT
  DATE_TRUNC('month', snapshot_date) as month,
  customer_id,
  product_id,
  SUM(arr_amount) as arr
FROM subscriptions
GROUP BY 1, 2, 3;

-- Обновление
REFRESH MATERIALIZED VIEW mv_monthly_arr;
```

### 9.3 Партиционирование

```sql
-- Партиционирование по месяцам
CREATE TABLE orders (
  order_id BIGINT,
  created_at TIMESTAMP,
  total_amount NUMERIC
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_01 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## 10. Примеры Dataset в Superset

### 10.1 Virtual Dataset для SM24-BigNumber

```sql
-- Создание Virtual Dataset в SQL Lab
SELECT
  DATE_TRUNC('day', o.created_at) as __timestamp,
  SUM(o.total_amount) as revenue,
  COUNT(*) as orders,
  COUNT(DISTINCT o.customer_id) as customers
FROM {{ schema }}.orders o
WHERE o.created_at >= {{ from_dttm }}
  AND o.created_at < {{ to_dttm }}
  {% if filter_values('status') %}
  AND o.status IN {{ filter_values('status') | where_in }}
  {% endif %}
GROUP BY 1
ORDER BY 1
```

### 10.2 Jinja Templates

Superset поддерживает Jinja в запросах:

| Template | Описание |
|----------|----------|
| `{{ from_dttm }}` | Начало периода |
| `{{ to_dttm }}` | Конец периода |
| `{{ schema }}` | Текущая схема |
| `{{ filter_values('col') }}` | Значения фильтра |
| `{% if %}...{% endif %}` | Условная логика |

---

## 11. Troubleshooting

### Частые проблемы

| Проблема | Причина | Решение |
|----------|---------|---------|
| Нет данных | Фильтр времени | Проверить `__timestamp` |
| Неверные числа | Тип данных | CAST to NUMERIC |
| Дубликаты | Отсутствует GROUP BY | Добавить агрегацию |
| Медленный запрос | Нет индексов | Создать индексы |

### Проверка данных

```sql
-- Проверка наличия данных за период
SELECT
  MIN(created_at) as min_date,
  MAX(created_at) as max_date,
  COUNT(*) as total_rows
FROM orders;

-- Проверка метрик
SELECT
  COUNT(*) as rows,
  SUM(total_amount) as sum,
  AVG(total_amount) as avg,
  MIN(total_amount) as min,
  MAX(total_amount) as max
FROM orders
WHERE created_at >= '2024-01-01';
```

---

**Следующий документ**: Создайте папку `examples/` с готовыми SQL файлами для каждого компонента.
