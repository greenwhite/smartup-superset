# SM24-StatusCardFlow

## Overview

Universal entity status flow visualization for tracking orders, visits, leads, tasks, or any status-based workflow.

## Visual Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Order Status Flow                                                 │
├────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  New       │  │ Processing │  │  Shipped   │  │ Delivered  │   │
│  │   125      │→ │    89      │→ │    67      │→ │    45      │   │
│  │  $45,000   │  │  $32,000   │  │  $24,000   │  │  $16,000   │   │
│  │  ▲ +12%    │  │  ▼ -5%     │  │  ▲ +8%     │  │  ▲ +15%    │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│                                                                    │
│  ⚠️ 23 orders stuck in Processing > 7 days                        │
└────────────────────────────────────────────────────────────────────┘
```

## Supported Entity Types

| Entity Type | Default Statuses |
|-------------|------------------|
| `orders` | New, Processing, Shipped, Delivered, Cancelled |
| `visits` | Scheduled, Confirmed, In Progress, Completed, Cancelled |
| `leads` | New, Contacted, Qualified, Proposal, Won, Lost |
| `tasks` | Todo, In Progress, Review, Done, Blocked |
| `custom` | User-defined statuses |

## Required SQL Columns

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `status` | STRING | Entity status | ✅ |
| `count` | NUMBER | Count of entities | ✅ |
| `value` | NUMBER | Monetary/metric value | ❌ |
| `comparison_count` | NUMBER | Previous period count | ❌ |
| `comparison_value` | NUMBER | Previous period value | ❌ |
| `stuck_count` | NUMBER | Stuck entities count | ❌ |

## SQL Example

```sql
WITH current_period AS (
    SELECT
        status,
        COUNT(*) as count,
        SUM(amount) as value,
        COUNT(CASE 
            WHEN status IN ('Processing', 'In Progress') 
             AND DATEDIFF(day, updated_at, CURRENT_DATE) > 7 
            THEN 1 
        END) as stuck_count
    FROM orders
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY status
),
previous_period AS (
    SELECT
        status,
        COUNT(*) as comparison_count,
        SUM(amount) as comparison_value
    FROM orders
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND created_at < DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY status
)
SELECT
    c.status,
    c.count,
    c.value,
    p.comparison_count,
    p.comparison_value,
    c.stuck_count
FROM current_period c
LEFT JOIN previous_period p ON c.status = p.status
ORDER BY 
    CASE c.status
        WHEN 'New' THEN 1
        WHEN 'Processing' THEN 2
        WHEN 'Shipped' THEN 3
        WHEN 'Delivered' THEN 4
        WHEN 'Cancelled' THEN 5
    END
```

## Control Panel Options

### Entity Configuration
| Control | Default | Description |
|---------|---------|-------------|
| Entity Type | `orders` | Type of entity |
| Status Column | `status` | Status column name |
| Count Column | `count` | Count column name |
| Value Column | - | Optional value column |

### Display Options
| Control | Default | Description |
|---------|---------|-------------|
| Card Layout | `horizontal` | horizontal/vertical/responsive |
| Show Values | `true` | Show monetary values |
| Show Comparison | `true` | Show vs previous period |
| Show Flow Arrows | `true` | Show connecting arrows |
| Show Alerts | `true` | Show stuck entity alerts |

### Alert Configuration
| Control | Default | Description |
|---------|---------|-------------|
| Stuck Threshold Days | `7` | Days to consider stuck |
| Show Stuck Alert | `true` | Alert for stuck entities |

### Formatting
| Control | Default | Description |
|---------|---------|-------------|
| Locale | `en-US` | Number formatting |
| Currency | `USD` | Currency for values |

## Status Colors

### Orders
| Status | Color |
|--------|-------|
| New | 🔵 Blue |
| Processing | 🟡 Yellow |
| Shipped | 🟠 Orange |
| Delivered | 🟢 Green |
| Cancelled | 🔴 Red |

### Leads
| Status | Color |
|--------|-------|
| New | 🔵 Blue |
| Contacted | 🟣 Purple |
| Qualified | 🟡 Yellow |
| Proposal | 🟠 Orange |
| Won | 🟢 Green |
| Lost | 🔴 Red |

## Props Interface

```typescript
interface SM24StatusCardFlowFormData extends QueryFormData {
  entityType: 'orders' | 'visits' | 'leads' | 'tasks' | 'custom';
  statusColumn: string;
  countColumn: string;
  valueColumn?: string;
  comparisonCountColumn?: string;
  comparisonValueColumn?: string;
  stuckCountColumn?: string;
  cardLayout: 'horizontal' | 'vertical' | 'responsive';
  showValues: boolean;
  showComparison: boolean;
  showFlowArrows: boolean;
  showAlerts: boolean;
  stuckThresholdDays: number;
  locale: 'en-US' | 'ru-RU' | 'uz-UZ';
  currency: 'USD' | 'EUR' | 'RUB' | 'UZS';
  customStatuses?: string[];  // For custom entity type
  customColors?: Record<string, string>;  // Custom status colors
}
```

## Usage Tips

1. **Status Order**: SQL should return statuses in workflow order
2. **Comparison**: Include previous period for trend indicators
3. **Stuck Detection**: Calculate stuck counts in SQL for accurate alerts
4. **Custom Types**: Use `custom` entity type for non-standard workflows

## Related Components

- [SM24-BigNumberPro](./SM24-BigNumberPro.md) - Single status count
- [SM24-TopBigNumber](./SM24-TopBigNumber.md) - Multiple metrics
- [SM24-MetricWaterfall](./SM24-MetricWaterfall.md) - Status flow waterfall
