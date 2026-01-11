# SM24-CustomerProductUsage

## Overview

Product usage analytics dashboard showing licensed vs active users, feature adoption, usage trends, and feature breakdown.

## Visual Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Product Usage Analytics — Acme Corp    [30d▼] [Mixed▼] ☐ Inactive│
├────────────────────────────────────────────────────────────────────┤
│  ⚠️ 1 product has trial expiring: CRM Pro                         │
│  🚨 1 product is underutilized: Analytics                         │
├────────────────────────────────────────────────────────────────────┤
│  Products: 3  Active: 3  Licensed: 150  Active Users: 120  Adopt: 72%
├────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                  │
│  │ CRM Pro     │ │ Analytics   │ │ API Suite   │                  │
│  │ Active 🟢   │ │ Active 🟢   │ │ Trial 🟡    │                  │
│  │ 50/60 ▲     │ │ 25/50 ▼     │ │ 45/40 ▲     │                  │
│  │ 85% adopt   │ │ 45% adopt   │ │ 90% adopt   │                  │
│  │ $100K ARR   │ │ $80K ARR    │ │ $70K ARR    │                  │
│  └─────────────┘ └─────────────┘ └─────────────┘                  │
├────────────────────────────────────────────────────────────────────┤
│  📈 Usage Trends                                                   │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │  DAU ────  Sessions ████                                       ││
│  │      ●──●──●                                                   ││
│  │     / ▃▃▃ \▃▃▃                                                ││
│  │   ●/▃▃▃▃▃▃▃\▃▃●──●                                            ││
│  │  W1   W2   W3   W4                                            ││
│  └────────────────────────────────────────────────────────────────┘│
├────────────────────────────────────────────────────────────────────┤
│  📋 Product Details                                                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ▼ │Product    │Status│License│Users    │Adoption│Sessions│ARR│ │
│  ├───┼───────────┼──────┼───────┼─────────┼────────┼────────┼───┤ │
│  │ ▶ │CRM Pro    │Active│Enterpr│50/60 ▲  │85% High│1,200   │100K│
│  │ ▶ │Analytics  │Active│Profes │25/50 ▼  │45% Low │400     │80K │
│  │ ▼ │API Suite  │Trial │Trial  │45/40 ▲  │90% High│2,000   │70K │
│  │   │ ⭐ Rate Limiting - 30 users, 75%                         │ │
│  │   │ ⭐ Webhooks - 25 users, 62%                               │ │
│  │   │   Auth API - 45 users, 100%                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Required SQL Columns

### Product Summary
| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `customer_id` | STRING | Customer identifier | ✅ |
| `customer_name` | STRING | Customer name | ❌ |
| `product_line` | STRING | Product identifier | ✅ |
| `product_name` | STRING | Product display name | ❌ |
| `is_active` | BOOLEAN | Product active status | ❌ |
| `license_type` | STRING | enterprise/professional/trial/free | ❌ |
| `licensed_users` | NUMBER | Licensed seat count | ✅ |
| `active_users_30d` | NUMBER | Active users (30 days) | ✅ |
| `active_users_7d` | NUMBER | Active users (7 days) | ❌ |
| `feature_adoption_score` | NUMBER | Adoption score (0-100) | ❌ |
| `arr_contribution` | NUMBER | ARR from this product | ❌ |
| `subscription_end_date` | DATE | Subscription end date | ❌ |

### Usage Trends (Optional - for chart)
| Column | Type | Description |
|--------|------|-------------|
| `week_start` | DATE | Week start date |
| `avg_dau` | NUMBER | Average daily active users |
| `weekly_sessions` | NUMBER | Total sessions in week |

### Feature Usage (Optional - for breakdown)
| Column | Type | Description |
|--------|------|-------------|
| `feature_name` | STRING | Feature name |
| `feature_category` | STRING | Feature category |
| `feature_usage_count` | NUMBER | Usage count (30d) |
| `feature_unique_users` | NUMBER | Unique users (30d) |
| `is_premium_feature` | BOOLEAN | Premium feature flag |

## SQL Example

```sql
-- Main product summary query
SELECT
    c.customer_id,
    c.customer_name,
    p.product_line,
    p.product_name,
    s.status = 'active' as is_active,
    s.license_type,
    s.licensed_users,
    
    -- Usage metrics (30d)
    COUNT(DISTINCT CASE 
        WHEN u.activity_date >= CURRENT_DATE - 30 
        THEN u.user_id 
    END) as active_users_30d,
    
    -- Usage metrics (7d)
    COUNT(DISTINCT CASE 
        WHEN u.activity_date >= CURRENT_DATE - 7 
        THEN u.user_id 
    END) as active_users_7d,
    
    -- Sessions
    COUNT(CASE 
        WHEN u.activity_date >= CURRENT_DATE - 30 
        THEN 1 
    END) as total_logins_30d,
    
    -- Average session duration
    AVG(u.session_duration_minutes) as avg_session_duration_minutes,
    
    -- Feature adoption score
    fa.adoption_score as feature_adoption_score,
    
    -- Revenue
    s.mrr * 12 as arr_contribution,
    
    -- Dates
    s.start_date as subscription_start_date,
    s.end_date as subscription_end_date

FROM customers c
JOIN subscriptions s ON c.customer_id = s.customer_id
JOIN products p ON s.product_id = p.product_id
LEFT JOIN user_activity u ON s.subscription_id = u.subscription_id
LEFT JOIN feature_adoption fa ON s.subscription_id = fa.subscription_id

WHERE c.customer_id = '{{ customer_id }}'
GROUP BY c.customer_id, c.customer_name, p.product_line, p.product_name,
         s.status, s.license_type, s.licensed_users, fa.adoption_score,
         s.mrr, s.start_date, s.end_date
```

## Control Panel Options

### Column Mapping
| Control | Description |
|---------|-------------|
| Customer ID | Customer identifier column |
| Product Line | Product identifier column |
| Licensed Users | Licensed seats column |
| Active Users 30d | Active users column |
| Adoption Score | Feature adoption score column |
| ARR Contribution | Product ARR column |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Default Time Range | `90d` | Initial time range |
| Default Chart Type | `line` | Initial chart type |
| Show Inactive Products | `false` | Include inactive products |
| Show Feature Breakdown | `true` | Show feature details |
| Max Features Shown | `20` | Limit feature rows |
| Enable Expandable Rows | `true` | Allow row expansion |

### Thresholds
| Control | Default | Description |
|---------|---------|-------------|
| Low Adoption | `40` | Below = low adoption |
| High Adoption | `80` | Above = high adoption |
| Underutilization | `30` | % users for underutilized |
| Trial Expiry Alert | `14` | Days before trial expiry |

### Chart Options
| Control | Default | Description |
|---------|---------|-------------|
| Show DAU Line | `true` | Show DAU trend line |
| Show Sessions Bars | `true` | Show session bars |
| Show Annotations | `true` | Show event markers |

## Adoption Levels

| Score | Level | Color |
|-------|-------|-------|
| 0-39 | Low | 🔴 Red |
| 40-79 | Medium | 🟡 Yellow |
| 80-100 | High | 🟢 Green |

## Product Status

| Status | Badge | Description |
|--------|-------|-------------|
| active | 🟢 Active | Active subscription |
| trial | 🟡 Trial | In trial period |
| expiring | 🟠 Expiring | Expiring soon |
| churned | 🔴 Churned | Churned |
| inactive | ⚪ Inactive | Inactive |

## Alert Types

1. **Trial Expiring**: Products with trial ending within threshold days
2. **Underutilized**: Products with active users below threshold %

## Related Components

- [SM24-CustomerProfile](./SM24-CustomerProfile.md) - Customer overview
- [SM24-TopCustomers](./SM24-TopCustomers.md) - Customer list
- [SM24-ARRTrend](./SM24-ARRTrend.md) - ARR trends
