-- =============================================================================
-- SM24-TopCustomers & SM24-CustomerProfile: Customer Health Data
-- =============================================================================

-- Main customer health query for SM24-TopCustomers
SELECT
    -- Customer identification
    c.customer_id,
    c.customer_name,
    c.industry,
    c.region,
    c.city,
    c.employee_count,
    c.created_date as customer_since,
    
    -- CSM Information
    u.user_id as csm_id,
    u.name as csm_name,
    u.email as csm_email,
    
    -- Revenue metrics
    COALESCE(r.current_arr, 0) as current_arr,
    r.prev_month_arr,
    CASE 
        WHEN r.prev_month_arr > 0 
        THEN ROUND(((r.current_arr - r.prev_month_arr) / r.prev_month_arr) * 100, 2)
        ELSE NULL
    END as arr_growth_mom,
    r.ltv,
    r.total_paid,
    
    -- Health metrics
    h.health_score,
    h.nps_score,
    h.csat_score,
    h.churn_risk_score,
    h.support_tickets_30d,
    h.avg_resolution_hours,
    
    -- Renewal info
    s.renewal_date,
    s.contract_end_date,
    DATEDIFF(day, CURRENT_DATE, s.renewal_date) as days_to_renewal,
    
    -- Products
    STRING_AGG(DISTINCT p.product_name, ', ') as active_products,
    COUNT(DISTINCT p.product_id) as product_count,
    
    -- Activity
    MAX(a.activity_date) as last_activity_date,
    DATEDIFF(day, MAX(a.activity_date), CURRENT_DATE) as days_since_activity,
    COUNT(DISTINCT a.activity_id) as total_interactions_90d

FROM customers c
-- CSM join
LEFT JOIN users u ON c.csm_id = u.user_id

-- Revenue data
LEFT JOIN (
    SELECT
        customer_id,
        SUM(mrr * 12) as current_arr,
        LAG(SUM(mrr * 12)) OVER (PARTITION BY customer_id ORDER BY effective_date) as prev_month_arr,
        SUM(total_paid) as total_paid,
        SUM(total_paid) * 5 as ltv  -- Simplified LTV
    FROM subscriptions
    WHERE status = 'active'
    GROUP BY customer_id
) r ON c.customer_id = r.customer_id

-- Health scores
LEFT JOIN (
    SELECT
        customer_id,
        health_score,
        nps_score,
        csat_score,
        churn_risk_score,
        support_tickets_30d,
        avg_resolution_hours
    FROM customer_health
    WHERE snapshot_date = CURRENT_DATE
) h ON c.customer_id = h.customer_id

-- Subscription/Renewal info
LEFT JOIN (
    SELECT
        customer_id,
        MAX(end_date) as renewal_date,
        MAX(end_date) as contract_end_date
    FROM subscriptions
    WHERE status = 'active'
    GROUP BY customer_id
) s ON c.customer_id = s.customer_id

-- Products
LEFT JOIN subscriptions sub ON c.customer_id = sub.customer_id AND sub.status = 'active'
LEFT JOIN products p ON sub.product_id = p.product_id

-- Activity
LEFT JOIN activities a ON c.customer_id = a.customer_id 
    AND a.activity_date >= CURRENT_DATE - INTERVAL '90 days'

WHERE c.status = 'active'

GROUP BY 
    c.customer_id, c.customer_name, c.industry, c.region, c.city,
    c.employee_count, c.created_date, u.user_id, u.name, u.email,
    r.current_arr, r.prev_month_arr, r.ltv, r.total_paid,
    h.health_score, h.nps_score, h.csat_score, h.churn_risk_score,
    h.support_tickets_30d, h.avg_resolution_hours,
    s.renewal_date, s.contract_end_date

ORDER BY r.current_arr DESC NULLS LAST
LIMIT 100;


-- =============================================================================
-- Health Score Calculation (if not pre-calculated)
-- =============================================================================

WITH engagement_score AS (
    SELECT
        customer_id,
        -- DAU/MAU ratio (0-40 points)
        LEAST(40, (dau::float / NULLIF(mau, 0)) * 100 * 0.4) as engagement_points
    FROM (
        SELECT
            customer_id,
            COUNT(DISTINCT CASE WHEN activity_date >= CURRENT_DATE - 7 THEN user_id END) as dau,
            COUNT(DISTINCT CASE WHEN activity_date >= CURRENT_DATE - 30 THEN user_id END) as mau
        FROM user_activity
        GROUP BY customer_id
    ) ua
),
adoption_score AS (
    SELECT
        customer_id,
        -- Feature adoption (0-30 points)
        LEAST(30, (features_used::float / NULLIF(total_features, 0)) * 100 * 0.3) as adoption_points
    FROM feature_usage
    GROUP BY customer_id
),
support_score AS (
    SELECT
        customer_id,
        -- Support health (0-20 points) - fewer tickets = better
        GREATEST(0, 20 - (ticket_count * 2)) as support_points
    FROM (
        SELECT customer_id, COUNT(*) as ticket_count
        FROM support_tickets
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY customer_id
    ) t
),
payment_score AS (
    SELECT
        customer_id,
        -- Payment health (0-10 points)
        CASE 
            WHEN avg_days_overdue <= 0 THEN 10
            WHEN avg_days_overdue <= 7 THEN 8
            WHEN avg_days_overdue <= 14 THEN 5
            WHEN avg_days_overdue <= 30 THEN 2
            ELSE 0
        END as payment_points
    FROM (
        SELECT customer_id, AVG(days_overdue) as avg_days_overdue
        FROM invoices
        WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY customer_id
    ) p
)
SELECT
    c.customer_id,
    COALESCE(e.engagement_points, 0) +
    COALESCE(a.adoption_points, 0) +
    COALESCE(s.support_points, 20) +  -- Default to healthy if no tickets
    COALESCE(p.payment_points, 10)    -- Default to healthy if no data
    as health_score
FROM customers c
LEFT JOIN engagement_score e ON c.customer_id = e.customer_id
LEFT JOIN adoption_score a ON c.customer_id = a.customer_id
LEFT JOIN support_score s ON c.customer_id = s.customer_id
LEFT JOIN payment_score p ON c.customer_id = p.customer_id;
