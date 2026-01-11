# SM24 Visualization Components for Apache Superset

## Overview

SM24 - это набор бизнес-визуализаций для Apache Superset, разработанный для SaaS-компаний с фокусом на Customer Success, Revenue Analytics и Product Usage.

## Component Inventory

| Component | Type | Description |
|-----------|------|-------------|
| [SM24-ARRTrend](./components/SM24-ARRTrend.md) | Evolution Chart | Mixed chart (line + bar) for ARR trends with MoM growth |
| [SM24-BigNumberPro](./components/SM24-BigNumberPro.md) | KPI | Advanced big number with sparklines, comparisons, alerts |
| [SM24-CustomerProfile](./components/SM24-CustomerProfile.md) | CRM Dashboard | 360° customer view with health, revenue, products |
| [SM24-CustomerProductUsage](./components/SM24-CustomerProductUsage.md) | Analytics | Product usage summary with features and trends |
| [SM24-MetricWaterfall](./components/SM24-MetricWaterfall.md) | Evolution Chart | Universal waterfall for metric breakdowns |
| [SM24-MonthlyARRBreakdown](./components/SM24-MonthlyARRBreakdown.md) | Evolution Chart | ARR segmentation by product/customer segment |
| [SM24-StatusCardFlow](./components/SM24-StatusCardFlow.md) | KPI Cards | Entity status flow (orders, visits, leads, tasks) |
| [SM24-TopBigNumber](./components/SM24-TopBigNumber.md) | KPI Cards | Multiple metric cards with sparklines |
| [SM24-TopCustomers](./components/SM24-TopCustomers.md) | Table | Sortable customer ranking with health indicators |

## Quick Start

### 1. Создание датасета

```sql
-- Пример для SM24-ARRTrend
SELECT
    DATE_TRUNC('month', created_at) as month,
    SUM(mrr * 12) as arr,
    COUNT(DISTINCT customer_id) as customer_count
FROM subscriptions
WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY 1
ORDER BY 1
```

### 2. Настройка визуализации

1. Откройте Superset Chart Builder
2. Выберите визуализацию из категории **Smartup24**
3. Настройте Column Mapping (маппинг колонок)
4. Настройте Display Options (опции отображения)
5. Настройте Thresholds (пороговые значения)

### 3. Интеграция с Dashboard

- Все компоненты поддерживают **Cross-Filter**
- Все компоненты поддерживают **Drill to Detail**
- Все компоненты поддерживают **Drill By**

## Architecture

```
superset-frontend/plugins/plugin-chart-echarts/src/
├── SM24Utils/                    # Shared utilities module
│   ├── types.ts                 # Common types
│   ├── theme.ts                 # Theme configuration (NEW)
│   ├── locales.ts               # Multi-locale configs
│   ├── formatting.ts            # Number/currency formatters
│   ├── colors.ts                # Color palettes
│   ├── comparison.ts            # Trend calculations
│   └── index.ts                 # Unified exports
│
├── SM24ARRTrend/                # Component
│   ├── types.ts                 # Component types
│   ├── controlPanel.tsx         # Control panel config
│   ├── transformProps.ts        # Data transformation
│   ├── buildQuery.ts            # Query builder
│   ├── SM24ARRTrendViz.tsx      # React component
│   └── index.ts                 # Plugin registration
│
└── ... (other SM24 components follow same structure)
```

## Theme System

SM24 использует интегрированную систему тем:

```typescript
import {
  SM24_THEME_TOKENS,      // Ant Design tokens
  SM24_SEMANTIC_COLORS,   // Domain-specific colors
  SM24_ECHARTS_THEME,     // Chart theming
} from '../SM24Utils';
```

### Color Palettes

| Palette | Usage |
|---------|-------|
| `SM24_COLORS` | Primary brand colors |
| `ARR_COLORS` | Revenue visualization |
| `HEALTH_COLORS` | Customer health scores |
| `RISK_COLORS` | Churn risk indicators |
| `SEGMENT_COLORS` | Customer segments |

See [Theme Guide](./guides/theme.md) for complete documentation.

## Feature Matrix

| Feature | ARRTrend | BigNumberPro | CustomerProfile | CustomerProductUsage | MetricWaterfall | MonthlyARRBreakdown | StatusCardFlow | TopBigNumber | TopCustomers |
|---------|:--------:|:------------:|:---------------:|:--------------------:|:---------------:|:-------------------:|:--------------:|:------------:|:------------:|
| Drilldown | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| i18n (en/ru/uz) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Theme Support | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sparkline | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Alerts | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Expandable Rows | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| YoY Comparison | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

## Supported Locales

- **en-US** - English (default)
- **ru-RU** - Russian
- **uz-UZ** - Uzbek

### Currency Support

| Currency | Symbol | Format Example |
|----------|--------|----------------|
| USD | $ | $1.5M |
| EUR | € | €1.5M |
| RUB | ₽ | 1.5млн ₽ |
| UZS | сум | 1.5млрд сум |

### Scale Abbreviations

| Locale | Thousands | Millions | Billions |
|--------|-----------|----------|----------|
| en-US | K | M | B |
| ru-RU | тыс. | млн. | млрд. |
| uz-UZ | минг | млн | млрд |

## SQL Examples

See [sql-examples/](./sql-examples/) for complete SQL templates:

- [arr-trend.sql](./sql-examples/arr-trend.sql) - ARR trends with MoM growth
- [customer-health.sql](./sql-examples/customer-health.sql) - Customer health scores
- [product-usage.sql](./sql-examples/product-usage.sql) - Product usage analytics
- [metric-waterfall.sql](./sql-examples/metric-waterfall.sql) - Waterfall breakdown

## Guides

- [Theme Guide](./guides/theme.md) - Theme system and customization
- [Optimization](./guides/optimization.md) - Performance and universalization
- [Best Practices](./guides/best-practices.md) - Development standards
- [Analysis Report](./guides/analysis-report.md) - Full technical analysis

## Technical Compliance

| Standard | Status | Details |
|----------|--------|---------|
| TypeScript | ✅ 100% | Zero `any` types |
| @superset-ui/core | ✅ | All imports compliant |
| Apache License | ✅ | All files have headers |
| i18n | ✅ | Using t() function |
| Theme Tokens | ✅ | Using useTheme() |
| Drilldown | ✅ | ContextMenuFilters |
| Error Handling | ✅ | Loading/error states |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01 | Initial release with 9 components |

## License

Licensed under Apache License 2.0
