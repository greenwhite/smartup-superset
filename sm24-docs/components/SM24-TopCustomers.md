# SM24-TopCustomers

## Overview

Sortable customer ranking table with health scores, churn risk indicators, and expandable row details.

## Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Top Customers by ARR                     🔍 Search  📥 Export │
├────────────────────────────────────────────────────────────────┤
│  ▼ Customer          ARR      Health   Churn Risk   Renewal   │
├────────────────────────────────────────────────────────────────┤
│  ▶ Acme Corp        $250K      85 🟢    Low 🟢      45 days   │
│  ▶ TechStart Inc    $180K      72 🟡    Medium 🟡   30 days   │
│  ▶ DataFlow Ltd     $150K      45 🔴    High 🔴     15 days   │
│  ▼ GlobalSoft       $120K      90 🟢    Low 🟢      90 days   │
│    ├─ Products: CRM, Analytics, Support                       │
│    ├─ CSM: John Smith                                         │
│    └─ Last Activity: 2 days ago                              │
│  ▶ SmartData        $100K      68 🟡    Medium 🟡   60 days   │
└────────────────────────────────────────────────────────────────┘
```

## Required SQL Columns

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `customer_id` | STRING | Unique customer ID | ✅ |
| `customer_name` | STRING | Customer display name | ✅ |
| `arr` | NUMBER | Annual Recurring Revenue | ✅ |
| `health_score` | NUMBER | Health score (0-100) | ❌ |
| `churn_risk_score` | NUMBER | Churn risk (0-100) | ❌ |
| `renewal_date` | DATE | Next renewal date | ❌ |
| `csm_name` | STRING | CSM assigned name | ❌ |
| `industry` | STRING | Customer industry | ❌ |
| `region` | STRING | Customer region | ❌ |
| `products` | STRING | Active products (comma-separated) | ❌ |

## SQL Example

```sql
SELECT
    c.customer_id,
    c.customer_name,
    c.industry,
    c.region,
    
    -- Revenue metrics
    SUM(s.mrr * 12) as arr,
    
    -- Health metrics
    ch.health_score,
    ch.churn_risk_score,
    ch.nps_score,
    
    -- Renewal info
    MAX(s.end_date) as renewal_date,
    DATEDIFF(day, CURRENT_DATE, MAX(s.end_date)) as days_to_renewal,
    
    -- CSM info
    u.name as csm_name,
    
    -- Activity
    MAX(a.activity_date) as last_activity_date,
    
    -- Products
    STRING_AGG(DISTINCT p.product_name, ', ') as products
    
FROM customers c
LEFT JOIN subscriptions s ON c.customer_id = s.customer_id AND s.status = 'active'
LEFT JOIN customer_health ch ON c.customer_id = ch.customer_id
LEFT JOIN users u ON c.csm_id = u.user_id
LEFT JOIN activities a ON c.customer_id = a.customer_id
LEFT JOIN products p ON s.product_id = p.product_id
GROUP BY c.customer_id, c.customer_name, c.industry, c.region, 
         ch.health_score, ch.churn_risk_score, ch.nps_score, u.name
ORDER BY arr DESC
LIMIT 100
```

## Control Panel Options

### Column Mapping
| Control | Description |
|---------|-------------|
| Customer ID Column | Primary key column |
| Customer Name Column | Display name |
| ARR Column | Revenue metric |
| Health Score Column | Health metric (0-100) |
| Churn Risk Column | Risk metric (0-100) |
| Renewal Date Column | Contract renewal date |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Show Health Column | `true` | Display health score |
| Show Churn Risk | `true` | Display churn risk |
| Show Renewal | `true` | Display days to renewal |
| Enable Expandable Rows | `true` | Allow row expansion |
| Page Size | `25` | Rows per page |

### Thresholds
| Control | Default | Description |
|---------|---------|-------------|
| Health Critical | `50` | Score below = critical (red) |
| Health Warning | `70` | Score below = warning (yellow) |
| Churn High Risk | `70` | Score above = high risk |
| Renewal Urgent Days | `30` | Days to renewal for urgent |

## Drilldown Support

- **Click on customer row**: Navigate to SM24-CustomerProfile
- **Right-click**: Context menu with drill options
- **Drill to Detail**: Full customer transaction history
- **Drill By**: Group by industry, region, CSM

## Props Interface

```typescript
interface SM24TopCustomersFormData extends QueryFormData {
  customerIdColumn: string;
  customerNameColumn: string;
  arrColumn: string;
  healthScoreColumn?: string;
  churnRiskColumn?: string;
  renewalDateColumn?: string;
  showHealth: boolean;
  showChurnRisk: boolean;
  showRenewal: boolean;
  enableExpandableRows: boolean;
  pageSize: number;
  healthCriticalThreshold: number;
  healthWarningThreshold: number;
  churnHighRiskThreshold: number;
  renewalUrgentDays: number;
}
```

## Usage Tips

1. **Sorting**: Click column headers to sort
2. **Search**: Use search box to filter customers
3. **Export**: Export filtered/sorted results to CSV
4. **Expansion**: Click arrow to see customer details
5. **Alerts**: Automatic alerts for at-risk customers

## Health Score Colors

| Score | Color | Status |
|-------|-------|--------|
| 80-100 | 🟢 Green | Healthy |
| 60-79 | 🟡 Yellow | At Risk |
| 0-59 | 🔴 Red | Critical |

## Related Components

- [SM24-CustomerProfile](./SM24-CustomerProfile.md) - Full customer 360 view
- [SM24-CustomerProductUsage](./SM24-CustomerProductUsage.md) - Product usage details
- [SM24-BigNumberPro](./SM24-BigNumberPro.md) - Customer count KPI
