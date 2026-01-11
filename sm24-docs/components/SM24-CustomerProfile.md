# SM24-CustomerProfile

## Overview

360° customer dashboard with tabs for overview, products, revenue, health, activity, contacts, and documents.

## Visual Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Acme Corporation                    ⭐ Add to Watchlist  📥 Export│
│  Enterprise • Technology • California          CSM: John Smith    │
├────────────────────────────────────────────────────────────────────┤
│  ⚠️ Renewal in 25 days • Health score critical (45)               │
├────────────────────────────────────────────────────────────────────┤
│  [Overview] [Products] [Revenue] [Health] [Activity] [Contacts]   │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│  │ ARR          │ │ Health       │ │ Products     │ │ Renewal    ││
│  │ $250,000     │ │ 45/100       │ │ 3 active     │ │ 25 days    ││
│  │ ▲ +15% YoY   │ │ 🔴 Critical  │ │ CRM, BI, API │ │ ⚠️ Urgent  ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘│
│                                                                    │
│  Company Information              │ Revenue Summary               │
│  ─────────────────                │ ───────────────               │
│  Industry: Technology             │ Current ARR: $250,000         │
│  Region: North America            │ LTV: $1,200,000               │
│  Employees: 500                   │ Payment Health: Good          │
│  Customer Since: Jan 2020         │ Total Invoices: 48            │
└────────────────────────────────────────────────────────────────────┘
```

## Required SQL Columns

### Core Customer Info
| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `customer_id` | STRING | Unique customer ID | ✅ |
| `customer_name` | STRING | Company name | ✅ |
| `industry` | STRING | Industry/vertical | ❌ |
| `region` | STRING | Region/country | ❌ |
| `city` | STRING | City | ❌ |
| `employee_count` | NUMBER | Employee count | ❌ |
| `customer_since` | DATE | Customer start date | ❌ |

### CSM Info
| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `csm_id` | STRING | CSM user ID | ❌ |
| `csm_name` | STRING | CSM name | ❌ |
| `csm_email` | STRING | CSM email | ❌ |

### Revenue Metrics
| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `current_arr` | NUMBER | Current ARR | ✅ |
| `arr_growth_mom` | NUMBER | ARR growth % MoM | ❌ |
| `ltv` | NUMBER | Lifetime value | ❌ |
| `total_paid` | NUMBER | Total payments received | ❌ |
| `avg_payment_delay` | NUMBER | Avg days to pay | ❌ |

### Health Metrics
| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `health_score` | NUMBER | Health score (0-100) | ❌ |
| `nps_score` | NUMBER | NPS score (-100 to 100) | ❌ |
| `csat_score` | NUMBER | CSAT score (0-100) | ❌ |
| `churn_risk_score` | NUMBER | Churn risk (0-100) | ❌ |

### Renewal Info
| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `renewal_date` | DATE | Next renewal date | ❌ |
| `contract_end_date` | DATE | Contract end date | ❌ |
| `contract_term_months` | NUMBER | Contract length | ❌ |

### Products
| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `active_products` | STRING | Comma-separated list | ❌ |
| `product_count` | NUMBER | Number of products | ❌ |
| `last_active_date` | DATE | Last product usage | ❌ |

## SQL Example

```sql
SELECT
    -- Customer info
    c.customer_id,
    c.customer_name,
    c.legal_name,
    c.inn,
    c.industry,
    c.region,
    c.city,
    c.address,
    c.phone,
    c.email,
    c.website,
    c.employee_count,
    c.created_date as customer_since,
    
    -- CSM info
    u.user_id as csm_id,
    u.name as csm_name,
    u.email as csm_email,
    u.phone as csm_phone,
    
    -- Revenue metrics
    r.current_arr,
    r.prev_month_arr,
    r.arr_growth_mom,
    r.first_payment_date,
    r.last_payment_date,
    r.ltv,
    r.total_paid,
    r.total_invoices,
    r.avg_payment_delay,
    
    -- Health metrics
    h.health_score,
    h.nps_score,
    h.csat_score,
    h.support_ticket_count_30d,
    h.avg_resolution_time_hours,
    h.churn_risk_score,
    
    -- Renewal info
    s.renewal_date,
    s.contract_end_date,
    s.contract_term_months,
    
    -- Products
    STRING_AGG(DISTINCT p.product_name, ', ') as active_products,
    COUNT(DISTINCT p.product_id) as product_count,
    MAX(pu.last_active_date) as last_active_date,
    AVG(pu.feature_adoption) as avg_feature_adoption,
    
    -- Activity
    COUNT(DISTINCT a.activity_id) as total_interactions,
    MAX(a.activity_date) as last_interaction_date

FROM customers c
LEFT JOIN users u ON c.csm_id = u.user_id
LEFT JOIN customer_revenue r ON c.customer_id = r.customer_id
LEFT JOIN customer_health h ON c.customer_id = h.customer_id
LEFT JOIN subscriptions s ON c.customer_id = s.customer_id AND s.status = 'active'
LEFT JOIN products p ON s.product_id = p.product_id
LEFT JOIN product_usage pu ON c.customer_id = pu.customer_id
LEFT JOIN activities a ON c.customer_id = a.customer_id

WHERE c.customer_id = '{{ customer_id }}'  -- Filter by customer
GROUP BY c.customer_id, c.customer_name, c.legal_name, c.inn, c.industry, 
         c.region, c.city, c.address, c.phone, c.email, c.website, 
         c.employee_count, c.created_date, u.user_id, u.name, u.email, u.phone,
         r.current_arr, r.prev_month_arr, r.arr_growth_mom, r.first_payment_date,
         r.last_payment_date, r.ltv, r.total_paid, r.total_invoices, 
         r.avg_payment_delay, h.health_score, h.nps_score, h.csat_score,
         h.support_ticket_count_30d, h.avg_resolution_time_hours, h.churn_risk_score,
         s.renewal_date, s.contract_end_date, s.contract_term_months
```

## Control Panel Options

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Default Tab | `overview` | Initial tab on load |
| Show Alerts | `true` | Show alert banners |
| Show Quick Actions | `true` | Show action buttons |
| Show Watchlist Toggle | `true` | Show watchlist button |
| Show Export Button | `true` | Show export button |

### Visible Tabs
Configure which tabs to show:
- Overview
- Products & Usage
- Revenue History
- Health & Risk
- Activity Timeline
- Contacts
- Documents

### Thresholds
| Control | Default | Description |
|---------|---------|-------------|
| Health Critical | `50` | Score below = critical |
| Health At-Risk | `70` | Score below = at-risk |
| Renewal Urgent Days | `30` | Days for urgent alert |
| Inactivity Alert Days | `60` | Days for inactivity alert |

### Permissions
| Control | Default | Description |
|---------|---------|-------------|
| Show Financial Data | `true` | Show ARR, LTV, payments |
| Show Sensitive Data | `false` | Show INN, legal name |
| Allow Editing | `false` | Allow data editing |

## Tabs Description

### Overview
Main dashboard with key metrics, company info, and summary cards.

### Products & Usage
Active products, feature adoption, usage trends.

### Revenue History
ARR history, payment timeline, invoice list.

### Health & Risk
Health score breakdown, NPS, CSAT, support tickets, churn risk analysis.

### Activity Timeline
Recent interactions, meetings, calls, emails, support tickets.

### Contacts
Key contacts at the customer organization.

### Documents
Contracts, proposals, invoices, other documents.

## Alert Generation

Automatic alerts based on:
- Health score below critical threshold
- Renewal within urgent days
- High churn risk score
- Long inactivity period
- Payment delays

## Related Components

- [SM24-TopCustomers](./SM24-TopCustomers.md) - Customer list (click to open profile)
- [SM24-CustomerProductUsage](./SM24-CustomerProductUsage.md) - Detailed product usage
- [SM24-ARRTrend](./SM24-ARRTrend.md) - Customer ARR trend
