-- =============================================================================
-- SM24-TopCustomers - Example SQL Queries
-- =============================================================================
-- Запросы для таблицы топ клиентов с health-индикаторами
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Основной запрос для SM24-TopCustomers
-- -----------------------------------------------------------------------------

WITH customer_arr AS (
  -- Текущий ARR
  SELECT
    customer_id,
    SUM(arr_amount) as arr
  FROM subscriptions
  WHERE snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'
    AND arr_amount > 0
  GROUP BY 1
),
customer_arr_ly AS (
  -- ARR год назад
  SELECT
    customer_id,
    SUM(arr_amount) as arr_ly
  FROM subscriptions
  WHERE snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 year' - INTERVAL '1 day'
  GROUP BY 1
),
customer_health AS (
  -- Health метрики за последние 3 месяца
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
  c.contract_end_date,

  -- ARR
  COALESCE(a.arr, 0) as arr,
  COALESCE(aly.arr_ly, 0) as arr_ly,

  -- Growth
  CASE
    WHEN COALESCE(aly.arr_ly, 0) > 0
    THEN (COALESCE(a.arr, 0) - aly.arr_ly) / aly.arr_ly * 100
    ELSE NULL
  END as arr_growth,

  -- Health метрики
  COALESCE(h.nps, 0) as nps,
  COALESCE(h.usage, 0) as usage,
  COALESCE(h.tickets, 0) as tickets,
  h.last_activity,

  -- Health Score (0-100)
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
  ) * 100 as health_score,

  -- Risk Assessment
  CASE
    WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'high'
    WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '180 days' THEN 'medium'
    ELSE 'low'
  END as renewal_risk,

  -- Tenure (в месяцах)
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.contract_start_date)) +
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.contract_start_date)) * 12 as tenure_months

FROM customers c
LEFT JOIN customer_arr a ON c.customer_id = a.customer_id
LEFT JOIN customer_arr_ly aly ON c.customer_id = aly.customer_id
LEFT JOIN customer_health h ON c.customer_id = h.customer_id
WHERE COALESCE(a.arr, 0) > 0
ORDER BY a.arr DESC
LIMIT 30;


-- -----------------------------------------------------------------------------
-- Альтернативный запрос с CTE для фильтрации
-- -----------------------------------------------------------------------------

WITH ranked_customers AS (
  SELECT
    c.customer_id,
    c.customer_name,
    c.segment,
    c.contract_start_date,
    c.contract_end_date,
    COALESCE(s.arr, 0) as arr,
    ROW_NUMBER() OVER (ORDER BY COALESCE(s.arr, 0) DESC) as rank
  FROM customers c
  LEFT JOIN (
    SELECT customer_id, SUM(arr_amount) as arr
    FROM subscriptions
    WHERE snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'
    GROUP BY 1
  ) s ON c.customer_id = s.customer_id
  WHERE c.is_active = true
)
SELECT *
FROM ranked_customers
WHERE rank <= 30
  {% if filter_values('segment') %}
  AND segment IN {{ filter_values('segment') | where_in }}
  {% endif %}
ORDER BY rank;


-- -----------------------------------------------------------------------------
-- Health Score детализация
-- -----------------------------------------------------------------------------

-- Расчёт health score с компонентами
SELECT
  c.customer_id,
  c.customer_name,

  -- Компоненты Health Score
  COALESCE((h.nps_score + 100) / 200.0, 0.5) as nps_component,
  COALESCE(h.usage_percent / 100.0, 0.5) as usage_component,
  COALESCE(1 - LEAST(h.support_tickets, 10) / 10.0, 0.5) as ticket_component,
  CASE
    WHEN h.last_login_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1
    WHEN h.last_login_date >= CURRENT_DATE - INTERVAL '30 days' THEN 0.7
    WHEN h.last_login_date >= CURRENT_DATE - INTERVAL '90 days' THEN 0.3
    ELSE 0
  END as activity_component,

  -- Итоговый Health Score
  (
    COALESCE((h.nps_score + 100) / 200.0, 0.5) * 0.3 +
    COALESCE(h.usage_percent / 100.0, 0.5) * 0.3 +
    COALESCE(1 - LEAST(h.support_tickets, 10) / 10.0, 0.5) * 0.2 +
    CASE
      WHEN h.last_login_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1
      WHEN h.last_login_date >= CURRENT_DATE - INTERVAL '30 days' THEN 0.7
      WHEN h.last_login_date >= CURRENT_DATE - INTERVAL '90 days' THEN 0.3
      ELSE 0
    END * 0.2
  ) * 100 as health_score,

  -- Интерпретация
  CASE
    WHEN (/* health_score formula */) >= 80 THEN 'healthy'
    WHEN (/* health_score formula */) >= 50 THEN 'at_risk'
    ELSE 'critical'
  END as health_status

FROM customers c
LEFT JOIN customer_health_metrics h ON c.customer_id = h.customer_id
  AND h.metric_date = (SELECT MAX(metric_date) FROM customer_health_metrics)
WHERE c.is_active = true;


-- -----------------------------------------------------------------------------
-- Concentration Risk Analysis
-- -----------------------------------------------------------------------------

WITH arr_totals AS (
  SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(SUM(s.arr_amount), 0) as arr
  FROM customers c
  LEFT JOIN subscriptions s ON c.customer_id = s.customer_id
    AND s.snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'
  GROUP BY 1, 2
),
total_arr AS (
  SELECT SUM(arr) as total FROM arr_totals
),
ranked AS (
  SELECT
    customer_id,
    customer_name,
    arr,
    arr / t.total * 100 as arr_percent,
    SUM(arr / t.total * 100) OVER (ORDER BY arr DESC) as cumulative_percent,
    ROW_NUMBER() OVER (ORDER BY arr DESC) as rank
  FROM arr_totals
  CROSS JOIN total_arr t
  WHERE arr > 0
)
SELECT
  customer_id,
  customer_name,
  arr,
  arr_percent,
  cumulative_percent,
  rank,
  -- Concentration flags
  CASE WHEN arr_percent > 10 THEN true ELSE false END as high_concentration,
  CASE WHEN cumulative_percent <= 50 THEN 'Top 50%' ELSE 'Bottom 50%' END as arr_tier
FROM ranked
ORDER BY rank;


-- -----------------------------------------------------------------------------
-- Churn Risk Prediction
-- -----------------------------------------------------------------------------

-- Клиенты с высоким риском оттока
SELECT
  c.customer_id,
  c.customer_name,
  c.segment,
  a.arr,

  -- Risk Factors
  CASE WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '90 days' THEN 1 ELSE 0 END as renewal_soon,
  CASE WHEN h.nps_score < 0 THEN 1 ELSE 0 END as negative_nps,
  CASE WHEN h.usage_percent < 30 THEN 1 ELSE 0 END as low_usage,
  CASE WHEN h.support_tickets > 5 THEN 1 ELSE 0 END as high_tickets,
  CASE WHEN h.last_login_date < CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END as inactive,

  -- Total Risk Score (0-5)
  (
    CASE WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '90 days' THEN 1 ELSE 0 END +
    CASE WHEN h.nps_score < 0 THEN 1 ELSE 0 END +
    CASE WHEN h.usage_percent < 30 THEN 1 ELSE 0 END +
    CASE WHEN h.support_tickets > 5 THEN 1 ELSE 0 END +
    CASE WHEN h.last_login_date < CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END
  ) as risk_score,

  -- Risk Level
  CASE
    WHEN (/* risk_score */) >= 4 THEN 'critical'
    WHEN (/* risk_score */) >= 2 THEN 'high'
    WHEN (/* risk_score */) >= 1 THEN 'medium'
    ELSE 'low'
  END as risk_level

FROM customers c
JOIN (
  SELECT customer_id, SUM(arr_amount) as arr
  FROM subscriptions
  WHERE snapshot_date = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'
  GROUP BY 1
) a ON c.customer_id = a.customer_id
LEFT JOIN customer_health_metrics h ON c.customer_id = h.customer_id
  AND h.metric_date = (SELECT MAX(metric_date) FROM customer_health_metrics)
WHERE a.arr > 0
ORDER BY (/* risk_score formula */) DESC, a.arr DESC;


-- -----------------------------------------------------------------------------
-- Создание таблиц (PostgreSQL)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
  customer_id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  segment VARCHAR(50),  -- 'Enterprise', 'Mid-Market', 'SMB', 'Starter'
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  product_id INTEGER,
  snapshot_date DATE NOT NULL,
  arr_amount NUMERIC(15,2) DEFAULT 0,
  mrr_amount NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_health_metrics (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  metric_date DATE NOT NULL,
  nps_score INTEGER,  -- -100 to 100
  usage_percent NUMERIC(5,2),  -- 0 to 100
  support_tickets INTEGER DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_customers_segment ON customers(segment);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_snapshot ON subscriptions(snapshot_date);
CREATE INDEX idx_health_customer ON customer_health_metrics(customer_id);
CREATE INDEX idx_health_date ON customer_health_metrics(metric_date);


-- -----------------------------------------------------------------------------
-- Тестовые данные
-- -----------------------------------------------------------------------------

INSERT INTO customers (customer_name, segment, contract_start_date, contract_end_date) VALUES
  ('Acme Corp', 'Enterprise', '2022-01-15', '2025-01-14'),
  ('TechStart Inc', 'Mid-Market', '2023-03-01', '2024-02-28'),
  ('Global Services', 'Enterprise', '2021-06-01', '2024-05-31'),
  ('Local Business', 'SMB', '2023-09-01', '2024-08-31'),
  ('Startup XYZ', 'Starter', '2024-01-01', '2024-12-31');

INSERT INTO subscriptions (customer_id, snapshot_date, arr_amount) VALUES
  (1, '2024-01-31', 500000),
  (2, '2024-01-31', 150000),
  (3, '2024-01-31', 750000),
  (4, '2024-01-31', 50000),
  (5, '2024-01-31', 25000);

INSERT INTO customer_health_metrics (customer_id, metric_date, nps_score, usage_percent, support_tickets, last_login_date) VALUES
  (1, '2024-01-31', 75, 85, 2, '2024-01-30'),
  (2, '2024-01-31', -10, 45, 8, '2024-01-15'),
  (3, '2024-01-31', 50, 70, 3, '2024-01-28'),
  (4, '2024-01-31', 30, 60, 1, '2024-01-25'),
  (5, '2024-01-31', 80, 90, 0, '2024-01-31');
