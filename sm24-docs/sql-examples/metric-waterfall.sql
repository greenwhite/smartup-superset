-- =============================================================================
-- SM24-MetricWaterfall: ARR Movement Waterfall
-- =============================================================================

WITH period_start AS (
    -- Starting ARR (beginning of period)
    SELECT 
        1 as sort_order,
        'Starting ARR' as category,
        COALESCE(SUM(mrr * 12), 0) as value,
        true as is_total
    FROM subscriptions
    WHERE status IN ('active', 'cancelled')
      AND start_date < DATE_TRUNC('month', CURRENT_DATE)
      AND (end_date IS NULL OR end_date >= DATE_TRUNC('month', CURRENT_DATE))
),
new_business AS (
    -- New customer acquisitions
    SELECT 
        2 as sort_order,
        'New Business' as category,
        COALESCE(SUM(mrr * 12), 0) as value,
        false as is_total
    FROM subscriptions s
    JOIN customers c ON s.customer_id = c.customer_id
    WHERE s.start_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND s.start_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      AND c.created_date >= DATE_TRUNC('month', CURRENT_DATE)  -- New customer
),
expansion AS (
    -- Expansion revenue (upsells, cross-sells)
    SELECT 
        3 as sort_order,
        'Expansion' as category,
        COALESCE(SUM(
            CASE WHEN new_mrr > old_mrr THEN (new_mrr - old_mrr) * 12 ELSE 0 END
        ), 0) as value,
        false as is_total
    FROM subscription_changes
    WHERE change_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND change_type = 'upgrade'
),
reactivation AS (
    -- Reactivated customers
    SELECT 
        4 as sort_order,
        'Reactivation' as category,
        COALESCE(SUM(mrr * 12), 0) as value,
        false as is_total
    FROM subscriptions s
    JOIN customers c ON s.customer_id = c.customer_id
    WHERE s.start_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND c.churned_date IS NOT NULL  -- Previously churned
      AND c.churned_date < DATE_TRUNC('month', CURRENT_DATE)
),
contraction AS (
    -- Contraction (downgrades)
    SELECT 
        5 as sort_order,
        'Contraction' as category,
        -ABS(COALESCE(SUM(
            CASE WHEN new_mrr < old_mrr THEN (old_mrr - new_mrr) * 12 ELSE 0 END
        ), 0)) as value,
        false as is_total
    FROM subscription_changes
    WHERE change_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND change_type = 'downgrade'
),
churn AS (
    -- Churned revenue
    SELECT 
        6 as sort_order,
        'Churn' as category,
        -ABS(COALESCE(SUM(mrr * 12), 0)) as value,
        false as is_total
    FROM subscriptions
    WHERE end_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND end_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      AND status = 'cancelled'
),
period_end AS (
    -- Ending ARR
    SELECT 
        7 as sort_order,
        'Ending ARR' as category,
        COALESCE(SUM(mrr * 12), 0) as value,
        true as is_total
    FROM subscriptions
    WHERE status = 'active'
)
SELECT category, value, is_total
FROM (
    SELECT * FROM period_start
    UNION ALL SELECT * FROM new_business
    UNION ALL SELECT * FROM expansion
    UNION ALL SELECT * FROM reactivation
    UNION ALL SELECT * FROM contraction
    UNION ALL SELECT * FROM churn
    UNION ALL SELECT * FROM period_end
) combined
ORDER BY sort_order;


-- =============================================================================
-- Customer Count Waterfall
-- =============================================================================

SELECT category, value, is_total FROM (
    -- Starting customers
    SELECT 1, 'Start of Month', COUNT(*), true
    FROM customers WHERE created_date < DATE_TRUNC('month', CURRENT_DATE) AND status = 'active'
    
    UNION ALL
    
    -- New customers
    SELECT 2, 'New Customers', COUNT(*), false
    FROM customers WHERE created_date >= DATE_TRUNC('month', CURRENT_DATE)
    
    UNION ALL
    
    -- Reactivated
    SELECT 3, 'Reactivated', COUNT(*), false
    FROM customers 
    WHERE reactivated_date >= DATE_TRUNC('month', CURRENT_DATE)
    
    UNION ALL
    
    -- Churned
    SELECT 4, 'Churned', -COUNT(*), false
    FROM customers 
    WHERE churned_date >= DATE_TRUNC('month', CURRENT_DATE)
    
    UNION ALL
    
    -- End of month
    SELECT 5, 'End of Month', COUNT(*), true
    FROM customers WHERE status = 'active'
) t(sort_order, category, value, is_total)
ORDER BY sort_order;


-- =============================================================================
-- Simplified Version (for quick setup)
-- =============================================================================

SELECT
    category,
    value,
    CASE WHEN category IN ('Starting ARR', 'Ending ARR') THEN true ELSE false END as is_total
FROM (
    VALUES
        (1, 'Starting ARR', 2000000),
        (2, 'New Business', 300000),
        (3, 'Expansion', 150000),
        (4, 'Contraction', -50000),
        (5, 'Churn', -100000),
        (6, 'Ending ARR', 2300000)
) AS t(sort_order, category, value)
ORDER BY sort_order;
