-- =============================================================================
-- SM24-ARRTrend: Monthly ARR with MoM Growth
-- =============================================================================
-- This query provides ARR trends with month-over-month growth calculation

WITH monthly_arr AS (
    -- Calculate ARR per month
    SELECT
        DATE_TRUNC('month', effective_date) as month,
        SUM(mrr * 12) as arr,
        COUNT(DISTINCT customer_id) as customer_count,
        COUNT(DISTINCT subscription_id) as subscription_count
    FROM subscriptions
    WHERE status = 'active'
      -- Adjust date range as needed
      AND effective_date >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'
    GROUP BY 1
),
with_growth AS (
    -- Add MoM growth calculation
    SELECT
        month,
        arr,
        customer_count,
        subscription_count,
        LAG(arr) OVER (ORDER BY month) as prev_month_arr,
        LAG(customer_count) OVER (ORDER BY month) as prev_month_customers
    FROM monthly_arr
),
final AS (
    SELECT
        month,
        arr,
        customer_count,
        subscription_count,
        prev_month_arr,
        
        -- MoM ARR Growth %
        CASE 
            WHEN prev_month_arr > 0 
            THEN ROUND(((arr - prev_month_arr) / prev_month_arr) * 100, 2)
            ELSE 0
        END as mom_growth_pct,
        
        -- Absolute MoM change
        arr - COALESCE(prev_month_arr, 0) as mom_growth_abs,
        
        -- Month label for display
        TO_CHAR(month, 'Mon YYYY') as month_label
        
    FROM with_growth
)
SELECT
    month,
    month_label,
    arr,
    customer_count,
    mom_growth_pct,
    mom_growth_abs
FROM final
ORDER BY month;


-- =============================================================================
-- VARIANT: With YoY Comparison
-- =============================================================================

WITH current_year AS (
    SELECT
        DATE_TRUNC('month', effective_date) as month,
        EXTRACT(MONTH FROM effective_date) as month_num,
        SUM(mrr * 12) as arr
    FROM subscriptions
    WHERE status = 'active'
      AND effective_date >= DATE_TRUNC('year', CURRENT_DATE)
    GROUP BY 1, 2
),
previous_year AS (
    SELECT
        EXTRACT(MONTH FROM effective_date) as month_num,
        SUM(mrr * 12) as arr_prev_year
    FROM subscriptions
    WHERE status = 'active'
      AND effective_date >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'
      AND effective_date < DATE_TRUNC('year', CURRENT_DATE)
    GROUP BY 1
)
SELECT
    c.month,
    c.arr,
    p.arr_prev_year,
    ROUND(((c.arr - p.arr_prev_year) / NULLIF(p.arr_prev_year, 0)) * 100, 2) as yoy_growth_pct
FROM current_year c
LEFT JOIN previous_year p ON c.month_num = p.month_num
ORDER BY c.month;


-- =============================================================================
-- VARIANT: With Projection (Simple Linear)
-- =============================================================================

WITH historical AS (
    SELECT
        DATE_TRUNC('month', effective_date) as month,
        SUM(mrr * 12) as arr,
        0 as is_projection
    FROM subscriptions
    WHERE status = 'active'
      AND effective_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY 1
),
projection AS (
    -- Simple linear projection for next 3 months
    SELECT
        DATE_TRUNC('month', CURRENT_DATE) + (n || ' month')::INTERVAL as month,
        (SELECT AVG(arr) FROM historical) * (1 + 0.05 * n) as arr,  -- 5% growth assumed
        1 as is_projection
    FROM generate_series(1, 3) as n
)
SELECT * FROM historical
UNION ALL
SELECT * FROM projection
ORDER BY month;
