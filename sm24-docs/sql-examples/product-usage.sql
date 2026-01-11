-- =============================================================================
-- SM24-CustomerProductUsage: Product Usage Analytics
-- =============================================================================

-- Main product usage summary query
SELECT
    c.customer_id,
    c.customer_name,
    
    -- Product identification
    p.product_line,
    p.product_name,
    
    -- Status info
    s.status = 'active' as is_active,
    s.license_type,
    s.start_date as subscription_start_date,
    s.end_date as subscription_end_date,
    
    -- License vs Usage
    s.licensed_users,
    u30.active_users as active_users_30d,
    u7.active_users as active_users_7d,
    
    -- Sessions & Duration
    u30.total_sessions as total_logins_30d,
    u30.avg_session_minutes as avg_session_duration_minutes,
    
    -- Feature adoption
    COALESCE(fa.adoption_score, 0) as feature_adoption_score,
    
    -- Revenue contribution
    s.mrr * 12 as arr_contribution,
    s.mrr

FROM customers c
JOIN subscriptions s ON c.customer_id = s.customer_id
JOIN products p ON s.product_id = p.product_id

-- 30-day usage metrics
LEFT JOIN (
    SELECT
        subscription_id,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_sessions,
        AVG(session_duration_minutes) as avg_session_minutes
    FROM user_sessions
    WHERE session_start >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY subscription_id
) u30 ON s.subscription_id = u30.subscription_id

-- 7-day usage metrics
LEFT JOIN (
    SELECT
        subscription_id,
        COUNT(DISTINCT user_id) as active_users
    FROM user_sessions
    WHERE session_start >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY subscription_id
) u7 ON s.subscription_id = u7.subscription_id

-- Feature adoption score
LEFT JOIN (
    SELECT
        subscription_id,
        ROUND((COUNT(DISTINCT feature_id)::float / 
               (SELECT COUNT(*) FROM features WHERE is_active = true)) * 100, 1) as adoption_score
    FROM feature_usage
    WHERE usage_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY subscription_id
) fa ON s.subscription_id = fa.subscription_id

WHERE c.customer_id = '{{ customer_id }}'  -- Filter by customer
ORDER BY s.mrr DESC;


-- =============================================================================
-- Weekly Usage Trends (for chart)
-- =============================================================================

SELECT
    DATE_TRUNC('week', session_start) as week_start,
    p.product_line,
    
    -- Average DAU for the week
    ROUND(COUNT(DISTINCT user_id)::float / 7, 1) as avg_dau,
    
    -- Total sessions in week
    COUNT(*) as weekly_sessions,
    
    -- Average duration
    ROUND(AVG(session_duration_minutes), 1) as avg_duration_minutes

FROM user_sessions us
JOIN subscriptions s ON us.subscription_id = s.subscription_id
JOIN products p ON s.product_id = p.product_id

WHERE s.customer_id = '{{ customer_id }}'
  AND session_start >= CURRENT_DATE - INTERVAL '90 days'

GROUP BY 1, 2
ORDER BY week_start, product_line;


-- =============================================================================
-- Feature Usage Breakdown
-- =============================================================================

SELECT
    p.product_line,
    f.feature_name,
    f.feature_category,
    f.is_premium as is_premium_feature,
    
    -- Usage metrics
    COUNT(*) as feature_usage_count,
    COUNT(DISTINCT fu.user_id) as feature_unique_users,
    
    -- Last used
    MAX(fu.usage_date) as last_used_date

FROM feature_usage fu
JOIN subscriptions s ON fu.subscription_id = s.subscription_id
JOIN products p ON s.product_id = p.product_id
JOIN features f ON fu.feature_id = f.feature_id

WHERE s.customer_id = '{{ customer_id }}'
  AND fu.usage_date >= CURRENT_DATE - INTERVAL '30 days'

GROUP BY p.product_line, f.feature_name, f.feature_category, f.is_premium
ORDER BY p.product_line, feature_usage_count DESC;


-- =============================================================================
-- Combined Query (All in One for SM24-CustomerProductUsage)
-- =============================================================================

WITH product_summary AS (
    SELECT
        c.customer_id,
        c.customer_name,
        p.product_line,
        p.product_name,
        s.status = 'active' as is_active,
        s.license_type,
        s.licensed_users,
        COUNT(DISTINCT CASE WHEN us.session_start >= CURRENT_DATE - 30 THEN us.user_id END) as active_users_30d,
        COUNT(DISTINCT CASE WHEN us.session_start >= CURRENT_DATE - 7 THEN us.user_id END) as active_users_7d,
        COUNT(CASE WHEN us.session_start >= CURRENT_DATE - 30 THEN 1 END) as total_logins_30d,
        AVG(CASE WHEN us.session_start >= CURRENT_DATE - 30 THEN us.session_duration_minutes END) as avg_session_duration_minutes,
        s.mrr * 12 as arr_contribution,
        s.start_date as subscription_start_date,
        s.end_date as subscription_end_date
    FROM customers c
    JOIN subscriptions s ON c.customer_id = s.customer_id
    JOIN products p ON s.product_id = p.product_id
    LEFT JOIN user_sessions us ON s.subscription_id = us.subscription_id
    WHERE c.customer_id = '{{ customer_id }}'
    GROUP BY c.customer_id, c.customer_name, p.product_line, p.product_name,
             s.status, s.license_type, s.licensed_users, s.mrr, s.start_date, s.end_date
),
weekly_trends AS (
    SELECT
        DATE_TRUNC('week', session_start) as week_start,
        p.product_line,
        ROUND(COUNT(DISTINCT user_id)::float / 7, 1) as avg_dau,
        COUNT(*) as weekly_sessions
    FROM user_sessions us
    JOIN subscriptions s ON us.subscription_id = s.subscription_id
    JOIN products p ON s.product_id = p.product_id
    WHERE s.customer_id = '{{ customer_id }}'
      AND session_start >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY 1, 2
),
feature_breakdown AS (
    SELECT
        p.product_line,
        f.feature_name,
        f.feature_category,
        f.is_premium as is_premium_feature,
        COUNT(*) as feature_usage_count,
        COUNT(DISTINCT fu.user_id) as feature_unique_users
    FROM feature_usage fu
    JOIN subscriptions s ON fu.subscription_id = s.subscription_id
    JOIN products p ON s.product_id = p.product_id
    JOIN features f ON fu.feature_id = f.feature_id
    WHERE s.customer_id = '{{ customer_id }}'
      AND fu.usage_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY p.product_line, f.feature_name, f.feature_category, f.is_premium
)
-- Return all three datasets
-- Option 1: Use UNION with a type column
-- Option 2: Create separate datasets in Superset
SELECT 'product' as data_type, * FROM product_summary
UNION ALL
SELECT 'trend' as data_type, week_start::text, product_line, avg_dau::text, weekly_sessions::text, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM weekly_trends
UNION ALL
SELECT 'feature' as data_type, product_line, feature_name, feature_category, is_premium_feature::text, feature_usage_count::text, feature_unique_users::text, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM feature_breakdown;
