# SM24-BigNumberPro

## Overview

Advanced KPI card with sparkline, comparison indicators, alerts, and configurable thresholds.

## Visual Layout

```
┌─────────────────────────────────────┐
│  Active Customers                   │
│  ┌─────────────────────────────────┐│
│  │ 1,234                           ││
│  │ ▲ +12.5% vs last month          ││
│  │ ~~~∿∿∿~~~∿~~~                   ││  <- sparkline
│  └─────────────────────────────────┘│
│  ⚠️ Above target (1,200)            │
└─────────────────────────────────────┘
```

## Required SQL Columns

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `value` | NUMBER | Main metric value | ✅ |
| `comparison_value` | NUMBER | Previous period value | ❌ |
| `sparkline_data` | ARRAY/JSON | Historical values for sparkline | ❌ |
| `target` | NUMBER | Target/goal value | ❌ |

## SQL Example

### Simple (Single Value)
```sql
SELECT COUNT(DISTINCT customer_id) as value
FROM customers
WHERE status = 'active'
```

### With Comparison
```sql
WITH current AS (
    SELECT COUNT(DISTINCT customer_id) as value
    FROM customers
    WHERE status = 'active'
),
previous AS (
    SELECT COUNT(DISTINCT customer_id) as comparison_value
    FROM customers
    WHERE status = 'active'
      AND created_at < DATE_TRUNC('month', CURRENT_DATE)
)
SELECT 
    c.value,
    p.comparison_value,
    1200 as target  -- Static target
FROM current c, previous p
```

### With Sparkline
```sql
WITH monthly AS (
    SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(DISTINCT customer_id) as count
    FROM customers
    WHERE status = 'active'
      AND created_at >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY 1
    ORDER BY 1
),
current AS (
    SELECT count as value FROM monthly ORDER BY month DESC LIMIT 1
),
sparkline AS (
    SELECT ARRAY_AGG(count ORDER BY month) as sparkline_data FROM monthly
)
SELECT 
    c.value,
    s.sparkline_data
FROM current c, sparkline s
```

## Control Panel Options

### Metric Configuration
| Control | Default | Description |
|---------|---------|-------------|
| Value Column | `value` | Main metric column |
| Comparison Column | - | Previous period column |
| Target Column | - | Target/goal column |
| Sparkline Column | - | Array of historical values |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Title | - | Card title text |
| Subtitle | - | Optional subtitle |
| Show Comparison | `true` | Show vs previous period |
| Show Sparkline | `true` | Show trend sparkline |
| Show Target | `false` | Show target indicator |
| Show Alert | `false` | Show threshold alerts |

### Comparison Settings
| Control | Default | Description |
|---------|---------|-------------|
| Comparison Type | `percentage` | `percentage`, `absolute`, `both` |
| Comparison Label | `vs last period` | Label for comparison |
| Positive is Good | `true` | Growth direction preference |

### Alert Thresholds
| Control | Default | Description |
|---------|---------|-------------|
| Warning Threshold | - | Value for warning alert |
| Critical Threshold | - | Value for critical alert |
| Alert Direction | `below` | `above` or `below` threshold |

### Formatting
| Control | Default | Description |
|---------|---------|-------------|
| Locale | `en-US` | Number formatting locale |
| Value Format | `,.0f` | D3 format string |
| Prefix | - | Value prefix (e.g., $) |
| Suffix | - | Value suffix (e.g., %) |

## Props Interface

```typescript
interface SM24BigNumberProFormData extends QueryFormData {
  valueColumn: string;
  comparisonColumn?: string;
  targetColumn?: string;
  sparklineColumn?: string;
  title: string;
  subtitle?: string;
  showComparison: boolean;
  showSparkline: boolean;
  showTarget: boolean;
  showAlert: boolean;
  comparisonType: 'percentage' | 'absolute' | 'both';
  comparisonLabel: string;
  positiveIsGood: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
  alertDirection: 'above' | 'below';
  locale: 'en-US' | 'ru-RU' | 'uz-UZ';
  valueFormat: string;
  prefix?: string;
  suffix?: string;
}
```

## Color Coding

### Comparison Colors
| Change | Color | Icon |
|--------|-------|------|
| Positive (good) | 🟢 Green | ▲ |
| Negative (bad) | 🔴 Red | ▼ |
| No change | ⚪ Gray | - |

### Alert Colors
| Status | Color | Icon |
|--------|-------|------|
| Normal | None | - |
| Warning | 🟡 Yellow | ⚠️ |
| Critical | 🔴 Red | 🚨 |

## Usage Tips

1. **Sparkline**: Requires at least 3 data points
2. **Comparison**: Works best with same-period comparisons (MoM, YoY)
3. **Alerts**: Configure thresholds carefully for meaningful alerts
4. **Formatting**: Use D3 format strings for precise control

## D3 Format Examples

| Format | Example Input | Output |
|--------|---------------|--------|
| `,.0f` | 1234567 | 1,234,567 |
| `,.2f` | 1234.567 | 1,234.57 |
| `.1%` | 0.125 | 12.5% |
| `$,.2f` | 1234.5 | $1,234.50 |
| `.2s` | 1500000 | 1.5M |

## Related Components

- [SM24-TopBigNumber](./SM24-TopBigNumber.md) - Multiple KPI cards
- [SM24-ARRTrend](./SM24-ARRTrend.md) - Trend over time
- [SM24-StatusCardFlow](./SM24-StatusCardFlow.md) - Status-based cards
