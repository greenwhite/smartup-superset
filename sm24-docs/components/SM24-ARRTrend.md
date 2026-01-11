# SM24-ARRTrend

## Overview

Mixed chart visualization showing ARR (Annual Recurring Revenue) trends with monthly growth bars.

## Visual Layout

```
┌────────────────────────────────────────────────────────┐
│  Monthly ARR Trend                    📅 Last 12 months│
├────────────────────────────────────────────────────────┤
│                                                        │
│  $2.5M ─────────────────────●────────●───────●        │
│                            /          \       \        │
│  $2.0M ──────────●────────●            ●──────●       │
│                 /                                      │
│  $1.5M ────●───●                                      │
│           /                                            │
│  $1.0M ──●                                            │
│  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct     │
│  +5%  +3%  +8%  +2%  -1%  +4%  +6%  +3%  +2%  +5%     │
└────────────────────────────────────────────────────────┘
```

## Required SQL Columns

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `month` / `date` | DATE/TIMESTAMP | Period date | ✅ |
| `arr` / `revenue` | NUMBER | ARR value | ✅ |
| `mom_growth` | NUMBER | Month-over-month growth % | ❌ |
| `customer_count` | NUMBER | Active customers count | ❌ |

## SQL Example

```sql
WITH monthly_arr AS (
    SELECT
        DATE_TRUNC('month', effective_date) as month,
        SUM(mrr * 12) as arr,
        COUNT(DISTINCT customer_id) as customer_count
    FROM subscriptions
    WHERE status = 'active'
      AND effective_date >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'
    GROUP BY 1
),
with_growth AS (
    SELECT
        month,
        arr,
        customer_count,
        LAG(arr) OVER (ORDER BY month) as prev_arr,
        CASE 
            WHEN LAG(arr) OVER (ORDER BY month) > 0 
            THEN ((arr - LAG(arr) OVER (ORDER BY month)) / LAG(arr) OVER (ORDER BY month)) * 100
            ELSE 0
        END as mom_growth
    FROM monthly_arr
)
SELECT
    month,
    arr,
    customer_count,
    mom_growth
FROM with_growth
ORDER BY month
```

## Control Panel Options

### Column Mapping
| Control | Default | Description |
|---------|---------|-------------|
| Date Column | `month` | Column with date values |
| ARR Column | `arr` | Column with ARR values |
| Growth Column | `mom_growth` | Column with growth percentages |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Show Growth Bars | `true` | Show MoM growth bars below chart |
| Show Projection | `false` | Show projected ARR line |
| Show YoY Comparison | `false` | Show year-over-year overlay |
| Chart Height | `400` | Chart height in pixels |

### Formatting
| Control | Default | Description |
|---------|---------|-------------|
| Locale | `en-US` | Number formatting locale |
| Currency | `USD` | Currency for ARR values |
| Growth Threshold | `0` | Threshold for growth color change |

## Drilldown Support

- **Right-click on data point**: Opens context menu with drill options
- **Drill to Detail**: Filter by month/date
- **Drill By**: Group by dimension (product, segment, region)

## Props Interface

```typescript
interface SM24ARRTrendFormData extends QueryFormData {
  dateColumn: string;
  arrColumn: string;
  growthColumn?: string;
  showGrowthBars: boolean;
  showProjection: boolean;
  showYoYComparison: boolean;
  locale: 'en-US' | 'ru-RU' | 'uz-UZ';
  currency: 'USD' | 'EUR' | 'RUB' | 'UZS';
  growthThreshold: number;
}
```

## Usage Tips

1. **Minimal Dataset**: At least 3 months of data for meaningful trends
2. **Growth Calculation**: If `mom_growth` not provided, calculated automatically
3. **YoY Comparison**: Requires 13+ months of data
4. **Projection**: Based on linear regression of last 6 months

## Related Components

- [SM24-MonthlyARRBreakdown](./SM24-MonthlyARRBreakdown.md) - ARR by segments
- [SM24-MetricWaterfall](./SM24-MetricWaterfall.md) - ARR waterfall breakdown
- [SM24-BigNumberPro](./SM24-BigNumberPro.md) - Single ARR metric display
