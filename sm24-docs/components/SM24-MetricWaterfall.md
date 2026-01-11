# SM24-MetricWaterfall

## Overview

Universal waterfall chart for visualizing metric breakdowns, changes, and flow analysis.

## Visual Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  ARR Movement Analysis                                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  $2.5M ─┐                                                         │
│         │                                                         │
│  $2.0M  │  ┌───┐                    ┌───┐                         │
│         │  │+$300K                  │                              │
│  $1.5M  │  │ New │ ┌───┐            │   │ ┌────────┐              │
│         └──┤     │ │+$200K          │   │ │        │              │
│  $1.0M     │     │ │Upsell│ ┌───┐   │   │ │ End    │              │
│            │     │ │      │ │-$100K │   │ │ $2.4M  │              │
│  $0.5M     │     │ │      │ │Churn│ │   │ │        │              │
│            │     │ │      │ │     │ │   │ │        │              │
│   $0   ────┴─────┴─┴──────┴─┴─────┴─┴───┴─┴────────┴──────────────│
│         Start   New   Upsell Churn Reactivate   End               │
└────────────────────────────────────────────────────────────────────┘
```

## Required SQL Columns

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `category` | STRING | Waterfall category | ✅ |
| `value` | NUMBER | Category value | ✅ |
| `is_total` | BOOLEAN | Mark as total bar | ❌ |
| `order` | NUMBER | Display order | ❌ |

## SQL Example

### ARR Waterfall
```sql
WITH arr_changes AS (
    -- Starting ARR
    SELECT 
        1 as order_num,
        'Start' as category,
        SUM(CASE WHEN created_at < DATE_TRUNC('month', CURRENT_DATE) 
            THEN mrr * 12 ELSE 0 END) as value,
        true as is_total
    FROM subscriptions WHERE status = 'active'
    
    UNION ALL
    
    -- New Business
    SELECT 
        2,
        'New',
        SUM(mrr * 12),
        false
    FROM subscriptions 
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND is_new_customer = true
    
    UNION ALL
    
    -- Expansion
    SELECT 
        3,
        'Expansion',
        SUM(expansion_mrr * 12),
        false
    FROM subscription_changes
    WHERE change_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND change_type = 'expansion'
    
    UNION ALL
    
    -- Contraction
    SELECT 
        4,
        'Contraction',
        -SUM(ABS(contraction_mrr * 12)),
        false
    FROM subscription_changes
    WHERE change_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND change_type = 'contraction'
    
    UNION ALL
    
    -- Churn
    SELECT 
        5,
        'Churn',
        -SUM(mrr * 12),
        false
    FROM subscriptions
    WHERE cancelled_at >= DATE_TRUNC('month', CURRENT_DATE)
    
    UNION ALL
    
    -- Ending ARR
    SELECT 
        6,
        'End',
        SUM(mrr * 12),
        true
    FROM subscriptions WHERE status = 'active'
)
SELECT category, value, is_total
FROM arr_changes
ORDER BY order_num
```

### Customer Waterfall
```sql
SELECT
    category,
    value,
    is_total
FROM (
    SELECT 1 as ord, 'Start' as category, COUNT(*) as value, true as is_total
    FROM customers WHERE created_at < DATE_TRUNC('month', CURRENT_DATE)
    
    UNION ALL
    
    SELECT 2, 'New', COUNT(*), false
    FROM customers WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    
    UNION ALL
    
    SELECT 3, 'Churned', -COUNT(*), false
    FROM customers WHERE churned_at >= DATE_TRUNC('month', CURRENT_DATE)
    
    UNION ALL
    
    SELECT 4, 'End', COUNT(*), true
    FROM customers WHERE status = 'active'
) t
ORDER BY ord
```

## Control Panel Options

### Column Mapping
| Control | Default | Description |
|---------|---------|-------------|
| Category Column | `category` | Category names |
| Value Column | `value` | Numeric values |
| Is Total Column | `is_total` | Total bar flag |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Show Labels | `true` | Show value labels |
| Show Connectors | `true` | Show connecting lines |
| Show Legend | `true` | Show color legend |
| Orientation | `vertical` | vertical/horizontal |

### Formatting
| Control | Default | Description |
|---------|---------|-------------|
| Locale | `en-US` | Number formatting |
| Currency | `USD` | Currency symbol |
| Value Format | `,.0f` | D3 format string |

### Colors
| Control | Default | Description |
|---------|---------|-------------|
| Positive Color | `#52c41a` | Increase bars |
| Negative Color | `#ff4d4f` | Decrease bars |
| Total Color | `#1890ff` | Total bars |

## Drilldown Support

- **Click on bar**: Drill to category details
- Categories map to specific drill queries:
  - `New` → New customer list
  - `Expansion` → Expansion transactions
  - `Churn` → Churned customers

## Props Interface

```typescript
interface SM24MetricWaterfallFormData extends QueryFormData {
  categoryColumn: string;
  valueColumn: string;
  isTotalColumn?: string;
  showLabels: boolean;
  showConnectors: boolean;
  showLegend: boolean;
  orientation: 'vertical' | 'horizontal';
  locale: 'en-US' | 'ru-RU' | 'uz-UZ';
  currency: 'USD' | 'EUR' | 'RUB' | 'UZS';
  valueFormat: string;
  positiveColor: string;
  negativeColor: string;
  totalColor: string;
}
```

## Usage Tips

1. **Order**: Provide explicit order column for consistent display
2. **Totals**: Mark start/end bars as totals for proper rendering
3. **Negatives**: Use negative values for decreases (churn, contraction)
4. **Labels**: Use short, clear category names

## Related Components

- [SM24-ARRTrend](./SM24-ARRTrend.md) - Time-based ARR trends
- [SM24-MonthlyARRBreakdown](./SM24-MonthlyARRBreakdown.md) - Monthly ARR segments
- [SM24-BigNumberPro](./SM24-BigNumberPro.md) - Single metric display
