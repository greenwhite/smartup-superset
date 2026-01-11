-- =============================================================================
-- SM24-StatusFunnel - Example SQL Queries
-- =============================================================================
-- Запросы для универсальной воронки статусов
-- Поддерживает: заказы, визиты, лиды, задачи и custom сущности
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Заказы (Orders)
-- -----------------------------------------------------------------------------

-- Базовый запрос для статусов заказов
SELECT
  s.status_id,
  s.status_name,
  s.display_order as status_order,
  s.color as status_color,
  COUNT(o.order_id) as entity_count,
  SUM(o.total_amount) as total_amount
FROM order_statuses s
LEFT JOIN orders o ON s.status_id = o.status_id
  AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY 1, 2, 3, 4
ORDER BY s.display_order;

-- С процентами и средним чеком
SELECT
  s.status_id,
  s.status_name,
  s.display_order as status_order,
  s.color as status_color,
  COUNT(o.order_id) as entity_count,
  SUM(o.total_amount) as total_amount,
  -- Дополнительные метрики
  COUNT(o.order_id)::FLOAT / NULLIF(SUM(COUNT(o.order_id)) OVER (), 0) * 100 as percent_of_total,
  AVG(o.total_amount) as avg_order_value
FROM order_statuses s
LEFT JOIN orders o ON s.status_id = o.status_id
  AND o.created_at >= {{ from_dttm }}
  AND o.created_at < {{ to_dttm }}
  {% if filter_values('region') %}
  AND o.region_id IN {{ filter_values('region') | where_in }}
  {% endif %}
GROUP BY 1, 2, 3, 4
ORDER BY s.display_order;


-- -----------------------------------------------------------------------------
-- Визиты (Visits)
-- -----------------------------------------------------------------------------

SELECT
  vs.status_id,
  vs.status_name,
  vs.sort_order as status_order,
  vs.badge_color as status_color,
  COUNT(v.visit_id) as entity_count,
  NULL::NUMERIC as total_amount  -- Визиты не имеют суммы
FROM visit_statuses vs
LEFT JOIN visits v ON vs.status_id = v.status_id
  AND v.visit_date >= DATE_TRUNC('week', CURRENT_DATE)
  AND v.visit_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
GROUP BY 1, 2, 3, 4
ORDER BY vs.sort_order;

-- С метриками производительности
SELECT
  vs.status_id,
  vs.status_name,
  vs.sort_order as status_order,
  vs.badge_color as status_color,
  COUNT(v.visit_id) as entity_count,
  NULL::NUMERIC as total_amount,
  -- Метрики
  AVG(EXTRACT(EPOCH FROM (v.end_time - v.start_time)) / 60) as avg_duration_minutes,
  COUNT(DISTINCT v.agent_id) as unique_agents
FROM visit_statuses vs
LEFT JOIN visits v ON vs.status_id = v.status_id
  AND v.visit_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY 1, 2, 3, 4
ORDER BY vs.sort_order;


-- -----------------------------------------------------------------------------
-- Лиды (Leads)
-- -----------------------------------------------------------------------------

SELECT
  ls.stage_id as status_id,
  ls.stage_name as status_name,
  ls.stage_order as status_order,
  ls.stage_color as status_color,
  COUNT(l.lead_id) as entity_count,
  SUM(l.potential_value) as total_amount
FROM lead_stages ls
LEFT JOIN leads l ON ls.stage_id = l.current_stage_id
  AND l.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND l.is_active = true
GROUP BY 1, 2, 3, 4
ORDER BY ls.stage_order;

-- С конверсией между этапами
WITH stage_counts AS (
  SELECT
    ls.stage_id,
    ls.stage_name,
    ls.stage_order,
    ls.stage_color as status_color,
    COUNT(l.lead_id) as entity_count,
    SUM(l.potential_value) as total_amount
  FROM lead_stages ls
  LEFT JOIN leads l ON ls.stage_id = l.current_stage_id
    AND l.created_at >= DATE_TRUNC('quarter', CURRENT_DATE)
  GROUP BY 1, 2, 3, 4
)
SELECT
  stage_id as status_id,
  stage_name as status_name,
  stage_order,
  status_color,
  entity_count,
  total_amount,
  -- Конверсия к следующему этапу
  entity_count::FLOAT / NULLIF(LAG(entity_count) OVER (ORDER BY stage_order), 0) * 100 as conversion_rate
FROM stage_counts
ORDER BY stage_order;


-- -----------------------------------------------------------------------------
-- Задачи (Tasks)
-- -----------------------------------------------------------------------------

SELECT
  ts.status_code as status_id,
  ts.status_label as status_name,
  ts.sort_order as status_order,
  ts.badge_color as status_color,
  COUNT(t.task_id) as entity_count,
  NULL::NUMERIC as total_amount
FROM task_statuses ts
LEFT JOIN tasks t ON ts.status_code = t.status
  AND (
    t.due_date >= CURRENT_DATE - INTERVAL '7 days'
    OR t.status IN ('in_progress', 'pending')
  )
GROUP BY 1, 2, 3, 4
ORDER BY ts.sort_order;

-- С метриками просроченности
SELECT
  ts.status_code as status_id,
  ts.status_label as status_name,
  ts.sort_order as status_order,
  ts.badge_color as status_color,
  COUNT(t.task_id) as entity_count,
  NULL::NUMERIC as total_amount,
  -- Дополнительные метрики
  COUNT(CASE WHEN t.due_date < CURRENT_DATE THEN 1 END) as overdue_count,
  COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_count
FROM task_statuses ts
LEFT JOIN tasks t ON ts.status_code = t.status
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1, 2, 3, 4
ORDER BY ts.sort_order;


-- -----------------------------------------------------------------------------
-- Универсальный запрос (Custom Entity)
-- -----------------------------------------------------------------------------

-- Параметризованный запрос для любой сущности
-- Используйте переменные Jinja для настройки

SELECT
  status_id,
  status_name,
  status_order,
  status_color,
  entity_count,
  total_amount
FROM (
  {% if entity_type == 'orders' %}
    SELECT
      s.status_id, s.status_name, s.display_order as status_order, s.color as status_color,
      COUNT(o.order_id) as entity_count, SUM(o.total_amount) as total_amount
    FROM order_statuses s
    LEFT JOIN orders o ON s.status_id = o.status_id AND o.created_at >= {{ from_dttm }}
    GROUP BY 1, 2, 3, 4
  {% elif entity_type == 'visits' %}
    SELECT
      s.status_id, s.status_name, s.sort_order as status_order, s.badge_color as status_color,
      COUNT(v.visit_id) as entity_count, NULL::NUMERIC as total_amount
    FROM visit_statuses s
    LEFT JOIN visits v ON s.status_id = v.status_id AND v.visit_date >= {{ from_dttm }}
    GROUP BY 1, 2, 3, 4
  {% elif entity_type == 'leads' %}
    SELECT
      s.stage_id as status_id, s.stage_name as status_name, s.stage_order as status_order, s.stage_color as status_color,
      COUNT(l.lead_id) as entity_count, SUM(l.potential_value) as total_amount
    FROM lead_stages s
    LEFT JOIN leads l ON s.stage_id = l.current_stage_id AND l.created_at >= {{ from_dttm }}
    GROUP BY 1, 2, 3, 4
  {% else %}
    -- Default: tasks
    SELECT
      s.status_code as status_id, s.status_label as status_name, s.sort_order as status_order, s.badge_color as status_color,
      COUNT(t.task_id) as entity_count, NULL::NUMERIC as total_amount
    FROM task_statuses s
    LEFT JOIN tasks t ON s.status_code = t.status AND t.due_date >= {{ from_dttm }}
    GROUP BY 1, 2, 3, 4
  {% endif %}
) subquery
ORDER BY status_order;


-- -----------------------------------------------------------------------------
-- Создание таблиц для примера (PostgreSQL)
-- -----------------------------------------------------------------------------

-- Статусы заказов
CREATE TABLE IF NOT EXISTS order_statuses (
  status_id SERIAL PRIMARY KEY,
  status_name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  color VARCHAR(7) DEFAULT '#3498db',
  is_active BOOLEAN DEFAULT true
);

INSERT INTO order_statuses (status_name, display_order, color) VALUES
  ('Новый', 1, '#3498db'),
  ('В обработке', 2, '#f39c12'),
  ('В ожидании', 3, '#9b59b6'),
  ('Отгружен', 4, '#1abc9c'),
  ('Доставлен', 5, '#27ae60'),
  ('Архив', 6, '#95a5a6');

-- Статусы визитов
CREATE TABLE IF NOT EXISTS visit_statuses (
  status_id SERIAL PRIMARY KEY,
  status_name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  badge_color VARCHAR(7) DEFAULT '#3498db'
);

INSERT INTO visit_statuses (status_name, sort_order, badge_color) VALUES
  ('Запланирован', 1, '#3498db'),
  ('В пути', 2, '#f39c12'),
  ('На месте', 3, '#9b59b6'),
  ('Завершён', 4, '#27ae60'),
  ('Отменён', 5, '#e74c3c');

-- Этапы лидов
CREATE TABLE IF NOT EXISTS lead_stages (
  stage_id SERIAL PRIMARY KEY,
  stage_name VARCHAR(100) NOT NULL,
  stage_order INTEGER DEFAULT 0,
  stage_color VARCHAR(7) DEFAULT '#3498db'
);

INSERT INTO lead_stages (stage_name, stage_order, stage_color) VALUES
  ('Новый', 1, '#3498db'),
  ('Квалификация', 2, '#9b59b6'),
  ('Презентация', 3, '#f39c12'),
  ('Переговоры', 4, '#e67e22'),
  ('Закрыт-выигран', 5, '#27ae60'),
  ('Закрыт-проигран', 6, '#e74c3c');

-- Статусы задач
CREATE TABLE IF NOT EXISTS task_statuses (
  status_code VARCHAR(50) PRIMARY KEY,
  status_label VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  badge_color VARCHAR(7) DEFAULT '#3498db'
);

INSERT INTO task_statuses (status_code, status_label, sort_order, badge_color) VALUES
  ('pending', 'Ожидает', 1, '#3498db'),
  ('in_progress', 'В работе', 2, '#f39c12'),
  ('review', 'На проверке', 3, '#9b59b6'),
  ('completed', 'Завершена', 4, '#27ae60'),
  ('cancelled', 'Отменена', 5, '#95a5a6');


-- -----------------------------------------------------------------------------
-- Индексы
-- -----------------------------------------------------------------------------

CREATE INDEX idx_orders_status ON orders(status_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_visits_status ON visits(status_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_leads_stage ON leads(current_stage_id);
CREATE INDEX idx_tasks_status ON tasks(status);
