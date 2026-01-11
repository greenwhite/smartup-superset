# SM24-MonthlyARRBreakdown

## Overview

Stacked bar/area chart showing ARR breakdown by product, segment, or other dimensions over time.

## Visual Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Monthly ARR by Product                    [Stacked Bar▼] [12M▼]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  $3M  ─────────────────────────────────────────────────────────── │
│       │                                          ┌───┐            │
│  $2M  │                            ┌───┐  ┌───┐  │   │            │
│       │              ┌───┐  ┌───┐  │   │  │   │  │   │            │
│  $1M  │  ┌───┐┌───┐  │   │  │   │  │   │  │   │  │   │            │
│       │  │   ││   │  │   │  │   │  │   │  │   │  │   │            │
│   $0  └──┴───┴┴───┴──┴───┴──┴───┴──┴───┴──┴───┴──┴───┴────────── │
│        Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep                │
│                                                                    │
│  ■ CRM ($1.2M)  ■ Analytics ($800K)  ■ API ($500K)                │
└────────────────────────────────────────────────────────────────────┘
```

## Required SQL Columns

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `month` | DATE | Period date | ✅ |
| `dimension` | STRING | Breakdown dimension (product, segment) | ✅ |
| `arr` | NUMBER | ARR value | ✅ |

## SQL Example

### By Product
```sql
SELECT
    DATE_TRUNC('month', s.effective_date) as month,
    p.product_name as dimension,
    SUM(s.mrr * 12) as arr
FROM subscriptions s
JOIN products p ON s.product_id = p.product_id
WHERE s.status = 'active'
  AND s.effective_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1, 2
ORDER BY 1, 2
```

### By Customer Segment
```sql
SELECT
    DATE_TRUNC('month', s.effective_date) as month,
    CASE
        WHEN c.arr >= 100000 THEN 'Enterprise'
        WHEN c.arr >= 25000 THEN 'Mid-Market'
        ELSE 'SMB'
    END as dimension,
    SUM(s.mrr * 12) as arr
FROM subscriptions s
JOIN customers c ON s.customer_id = c.customer_id
WHERE s.status = 'active'
  AND s.effective_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1, 2
ORDER BY 1, 2
```

### By Region
```sql
SELECT
    DATE_TRUNC('month', s.effective_date) as month,
    c.region as dimension,
    SUM(s.mrr * 12) as arr
FROM subscriptions s
JOIN customers c ON s.customer_id = c.customer_id
WHERE s.status = 'active'
  AND s.effective_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1, 2
ORDER BY 1, 2
```

## Control Panel Options

### Column Mapping
| Control | Default | Description |
|---------|---------|-------------|
| Date Column | `month` | Period column |
| Dimension Column | `dimension` | Breakdown column |
| ARR Column | `arr` | Value column |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Chart Type | `stacked_bar` | stacked_bar/stacked_area/grouped_bar |
| Time Range | `12m` | 3m/6m/12m/24m |
| Show Legend | `true` | Display legend |
| Show Total Line | `false` | Show total trend line |
| Show Values | `false` | Show values on bars |

### Color Options
| Control | Default | Description |
|---------|---------|-------------|
| Color Scheme | `superset` | Color palette |
| Custom Colors | - | Dimension-specific colors |

### Formatting
| Control | Default | Description |
|---------|---------|-------------|
| Locale | `en-US` | Number formatting |
| Currency | `USD` | Currency symbol |

## Chart Types

### Stacked Bar
Best for comparing total and composition at each point.

### Stacked Area
Best for showing trends and proportions over time.

### Grouped Bar
Best for comparing individual dimensions side by side.

## Props Interface

```typescript
interface SM24MonthlyARRBreakdownFormData extends QueryFormData {
  dateColumn: string;
  dimensionColumn: string;
  arrColumn: string;
  chartType: 'stacked_bar' | 'stacked_area' | 'grouped_bar';
  timeRange: '3m' | '6m' | '12m' | '24m';
  showLegend: boolean;
  showTotalLine: boolean;
  showValues: boolean;
  colorScheme: string;
  customColors?: Record<string, string>;
  locale: 'en-US' | 'ru-RU' | 'uz-UZ';
  currency: 'USD' | 'EUR' | 'RUB' | 'UZS';
}
```

## Usage Tips

1. **Dimension Limit**: Keep to 5-7 dimensions for readability
2. **Time Range**: Match time range to business cycle
3. **Sorting**: SQL should return consistent dimension order
4. **Colors**: Use custom colors for brand consistency

## Related Components

- [SM24-ARRTrend](./SM24-ARRTrend.md) - Single dimension ARR trend
- [SM24-MetricWaterfall](./SM24-MetricWaterfall.md) - Period changes breakdown
- [SM24-BigNumberPro](./SM24-BigNumberPro.md) - Total ARR metric
