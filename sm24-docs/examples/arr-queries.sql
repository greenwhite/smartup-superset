-- =============================================================================
-- SM24 ARR Components - Example SQL Queries
-- =============================================================================
-- Эти запросы предназначены для использования с компонентами:
-- - SM24-ARRTrend
-- - SM24-ARRWaterfall
-- - SM24-MonthlyARRBreakdown
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SM24-ARRTrend: Monthly ARR with YoY Comparison
-- -----------------------------------------------------------------------------

-- Базовый запрос для SM24-ARRTrend
SELECT
  DATE_TRUNC('month', report_date) as __timestamp,
  SUM(arr_amount) as arr,
  SUM(target_arr) as target
FROM arr_snapshots
WHERE report_date >= '2023-01-01'
GROUP BY 1
ORDER BY 1;

-- Расширенный запрос с детализацией по типу
SELECT
  DATE_TRUNC('month', report_date) as __timestamp,
  SUM(arr_amount) as total_arr,
  SUM(CASE WHEN arr_type = 'new' THEN arr_amount ELSE 0 END) as new_arr,
  SUM(CASE WHEN arr_type = 'expansion' THEN arr_amount ELSE 0 END) as expansion_arr,
  SUM(CASE WHEN arr_type = 'recurring' THEN arr_amount ELSE 0 END) as recurring_arr,
  SUM(target_arr) as target,
  -- Growth rate расчёт для справки
  (SUM(arr_amount) - LAG(SUM(arr_amount), 12) OVER (ORDER BY DATE_TRUNC('month', report_date)))
    / NULLIF(LAG(SUM(arr_amount), 12) OVER (ORDER BY DATE_TRUNC('month', report_date)), 0) * 100 as yoy_growth
FROM arr_snapshots
WHERE report_date >= '2022-01-01'  -- Нужен год для YoY
GROUP BY 1
ORDER BY 1;


-- -----------------------------------------------------------------------------
-- SM24-ARRWaterfall: Period ARR Breakdown
-- -----------------------------------------------------------------------------

-- Waterfall для текущего квартала
SELECT
  SUM(beginning_arr) as beginning_arr,
  SUM(new_arr) as new_arr,
  SUM(expansion_arr) as expansion_arr,
  SUM(contraction_arr) as contraction_arr,
  SUM(churn_arr) as churn_arr,
  SUM(ending_arr) as ending_arr,
  -- Quick Ratio для справки
  CASE
    WHEN SUM(contraction_arr) + SUM(churn_arr) = 0 THEN NULL
    ELSE (SUM(new_arr) + SUM(expansion_arr)) / (SUM(contraction_arr) + SUM(churn_arr))
  END as quick_ratio
FROM arr_movements
WHERE period = CONCAT(YEAR(CURRENT_DATE), '-Q', QUARTER(CURRENT_DATE));

-- Waterfall с динамическим выбором периода (через Jinja)
SELECT
  SUM(beginning_arr) as beginning_arr,
  SUM(new_arr) as new_arr,
  SUM(expansion_arr) as expansion_arr,
  SUM(contraction_arr) as contraction_arr,
  SUM(churn_arr) as churn_arr,
  SUM(ending_arr) as ending_arr
FROM arr_movements
WHERE
  {% if filter_values('period') %}
    period IN {{ filter_values('period') | where_in }}
  {% else %}
    period = CONCAT(YEAR(CURRENT_DATE), '-Q', QUARTER(CURRENT_DATE))
  {% endif %};

-- Расчёт waterfall из детальных данных подписок
WITH current_snapshot AS (
  SELECT
    customer_id,
    SUM(arr_amount) as current_arr
  FROM subscriptions
  WHERE snapshot_date = DATE_TRUNC('quarter', CURRENT_DATE) - INTERVAL '1 day'
  GROUP BY 1
),
previous_snapshot AS (
  SELECT
    customer_id,
    SUM(arr_amount) as previous_arr
  FROM subscriptions
  WHERE snapshot_date = DATE_TRUNC('quarter', CURRENT_DATE) - INTERVAL '1 quarter' - INTERVAL '1 day'
  GROUP BY 1
),
changes AS (
  SELECT
    COALESCE(c.customer_id, p.customer_id) as customer_id,
    COALESCE(p.previous_arr, 0) as previous_arr,
    COALESCE(c.current_arr, 0) as current_arr
  FROM current_snapshot c
  FULL OUTER JOIN previous_snapshot p ON c.customer_id = p.customer_id
)
SELECT
  SUM(previous_arr) as beginning_arr,

  -- New: не было раньше, есть сейчас
  SUM(CASE WHEN previous_arr = 0 AND current_arr > 0 THEN current_arr ELSE 0 END) as new_arr,

  -- Expansion: рост у существующих
  SUM(CASE
    WHEN previous_arr > 0 AND current_arr > previous_arr
    THEN current_arr - previous_arr ELSE 0
  END) as expansion_arr,

  -- Contraction: снижение (но не отток)
  SUM(CASE
    WHEN previous_arr > 0 AND current_arr > 0 AND current_arr < previous_arr
    THEN previous_arr - current_arr ELSE 0
  END) as contraction_arr,

  -- Churn: было раньше, нет сейчас
  SUM(CASE WHEN previous_arr > 0 AND current_arr = 0 THEN previous_arr ELSE 0 END) as churn_arr,

  SUM(current_arr) as ending_arr
FROM changes;


-- -----------------------------------------------------------------------------
-- SM24-MonthlyARRBreakdown: Product × Segment Matrix
-- -----------------------------------------------------------------------------

-- Breakdown по продуктам и сегментам
SELECT
  p.product_name as product_line,
  c.segment as customer_segment,
  SUM(s.arr_amount) as arr
FROM subscriptions s
JOIN products p ON s.product_id = p.product_id
JOIN customers c ON s.customer_id = c.customer_id
WHERE s.snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'
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
  END;

-- С расчётом концентрации
WITH segment_totals AS (
  SELECT
    c.segment,
    SUM(s.arr_amount) as segment_arr
  FROM subscriptions s
  JOIN customers c ON s.customer_id = c.customer_id
  WHERE s.snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'
  GROUP BY 1
),
total_arr AS (
  SELECT SUM(segment_arr) as total FROM segment_totals
)
SELECT
  st.segment,
  st.segment_arr,
  st.segment_arr / t.total * 100 as concentration_percent,
  CASE
    WHEN st.segment_arr / t.total > 0.5 THEN 'HIGH_RISK'
    WHEN st.segment_arr / t.total > 0.3 THEN 'MODERATE'
    ELSE 'OK'
  END as concentration_risk
FROM segment_totals st
CROSS JOIN total_arr t;


-- -----------------------------------------------------------------------------
-- Создание таблиц для примера (PostgreSQL)
-- -----------------------------------------------------------------------------

-- ARR Snapshots
CREATE TABLE IF NOT EXISTS arr_snapshots (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  customer_id INTEGER NOT NULL,
  product_id INTEGER,
  arr_amount NUMERIC(15,2) DEFAULT 0,
  arr_type VARCHAR(50),
  target_arr NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ARR Movements (для waterfall)
CREATE TABLE IF NOT EXISTS arr_movements (
  id SERIAL PRIMARY KEY,
  period VARCHAR(20) NOT NULL,  -- '2024-Q1', '2024-01', etc.
  beginning_arr NUMERIC(15,2) DEFAULT 0,
  new_arr NUMERIC(15,2) DEFAULT 0,
  expansion_arr NUMERIC(15,2) DEFAULT 0,
  contraction_arr NUMERIC(15,2) DEFAULT 0,
  churn_arr NUMERIC(15,2) DEFAULT 0,
  ending_arr NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_arr_snapshots_date ON arr_snapshots(report_date);
CREATE INDEX idx_arr_snapshots_customer ON arr_snapshots(customer_id);
CREATE INDEX idx_arr_movements_period ON arr_movements(period);
