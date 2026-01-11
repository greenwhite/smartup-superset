# SM24-TopBigNumber

## Overview

Multiple KPI cards in a grid layout with sparklines, comparisons, and configurable metrics.

## Visual Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Key Metrics                                                       │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Total ARR        │  │ Active Customers │  │ Net Revenue      │ │
│  │ $2.5M           │  │ 1,234           │  │ $125K           │ │
│  │ ▲ +15.3%        │  │ ▲ +8.2%         │  │ ▼ -3.1%         │ │
│  │ ~~~∿∿∿~~~       │  │ ∿∿∿~~~∿∿∿       │  │ ~~~∿∿∿~~~       │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Churn Rate       │  │ NPS Score        │  │ Support Tickets  │ │
│  │ 2.3%            │  │ 45              │  │ 89              │ │
│  │ ▼ -0.5pp        │  │ ▲ +5            │  │ ▼ -12%          │ │
│  │ ⚠️ Above target │  │ 🟢 Healthy      │  │                 │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Required SQL Columns

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `metric_name` | STRING | Metric identifier | ✅ |
| `metric_value` | NUMBER | Current value | ✅ |
| `comparison_value` | NUMBER | Previous period value | ❌ |
| `sparkline_data` | ARRAY | Historical data points | ❌ |
| `target` | NUMBER | Target/goal value | ❌ |

## SQL Example

```sql
SELECT 
    'arr' as metric_name,
    SUM(mrr * 12) as metric_value,
    (SELECT SUM(mrr * 12) FROM subscriptions 
     WHERE status = 'active' AND DATE_TRUNC('month', created_at) < DATE_TRUNC('month', CURRENT_DATE)) as comparison_value
FROM subscriptions WHERE status = 'active'

UNION ALL

SELECT 
    'customers',
    COUNT(DISTINCT customer_id),
    (SELECT COUNT(DISTINCT customer_id) FROM customers 
     WHERE created_at < DATE_TRUNC('month', CURRENT_DATE))
FROM customers WHERE status = 'active'

UNION ALL

SELECT 
    'churn_rate',
    (SELECT COUNT(*) FROM customers WHERE churned_at >= DATE_TRUNC('month', CURRENT_DATE))::float / 
    (SELECT COUNT(*) FROM customers WHERE created_at < DATE_TRUNC('month', CURRENT_DATE))::float * 100,
    2.5  -- Previous period churn rate
    
UNION ALL

SELECT 
    'nps',
    AVG(score),
    (SELECT AVG(score) FROM nps_responses WHERE created_at < DATE_TRUNC('month', CURRENT_DATE))
FROM nps_responses WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
```

## Control Panel Options

### Metrics Configuration
| Control | Description |
|---------|-------------|
| Metric Name Column | Column with metric identifiers |
| Value Column | Column with metric values |
| Comparison Column | Column with comparison values |
| Sparkline Column | Column with historical array |
| Target Column | Column with target values |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Grid Columns | `3` | Number of columns |
| Show Sparklines | `true` | Display sparklines |
| Show Comparisons | `true` | Show vs previous |
| Show Targets | `false` | Show target indicators |
| Card Height | `150` | Card height in pixels |

### Metric Definitions
Define individual metric properties:

```json
{
  "arr": {
    "title": "Total ARR",
    "format": "$,.0f",
    "positiveIsGood": true,
    "comparisonType": "percentage"
  },
  "customers": {
    "title": "Active Customers",
    "format": ",.0f",
    "positiveIsGood": true
  },
  "churn_rate": {
    "title": "Churn Rate",
    "format": ".1f",
    "suffix": "%",
    "positiveIsGood": false
  }
}
```

## Props Interface

```typescript
interface SM24TopBigNumberFormData extends QueryFormData {
  metricNameColumn: string;
  valueColumn: string;
  comparisonColumn?: string;
  sparklineColumn?: string;
  targetColumn?: string;
  gridColumns: number;
  showSparklines: boolean;
  showComparisons: boolean;
  showTargets: boolean;
  cardHeight: number;
  metricDefinitions: Record<string, MetricDefinition>;
  locale: 'en-US' | 'ru-RU' | 'uz-UZ';
}

interface MetricDefinition {
  title: string;
  format: string;
  prefix?: string;
  suffix?: string;
  positiveIsGood: boolean;
  comparisonType: 'percentage' | 'absolute' | 'both';
  warningThreshold?: number;
  criticalThreshold?: number;
  alertDirection?: 'above' | 'below';
}
```

## Metric Types

| Type | Example | Format |
|------|---------|--------|
| Currency | $2.5M | `$,.1s` |
| Count | 1,234 | `,.0f` |
| Percentage | 15.3% | `.1f` + `%` |
| Score | 45 | `,.0f` |
| Ratio | 2.3x | `.1f` + `x` |

## Related Components

- [SM24-BigNumberPro](./SM24-BigNumberPro.md) - Single detailed KPI
- [SM24-StatusCardFlow](./SM24-StatusCardFlow.md) - Status-based cards
- [SM24-ARRTrend](./SM24-ARRTrend.md) - Trend visualization
