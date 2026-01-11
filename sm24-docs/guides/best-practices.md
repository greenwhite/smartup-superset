# SM24 Components - Best Practices Guide

## Data Modeling

### 1. Naming Conventions

Use consistent column naming in your datasets:

| Convention | Example | Notes |
|------------|---------|-------|
| snake_case | `customer_id`, `health_score` | Preferred for SQL columns |
| camelCase | `customerId`, `healthScore` | Also supported via mapping |
| Suffixes | `_30d`, `_7d`, `_mom` | Time periods |
| Prefixes | `prev_`, `target_` | Comparisons |

### 2. Required vs Optional Columns

**Always include**:
- Primary key column (`customer_id`, `product_id`)
- Main metric column (`arr`, `value`, `count`)
- Date/period column for time-series

**Optional but recommended**:
- Comparison values for trends
- Human-readable labels
- Status/category fields

### 3. Data Quality

```sql
-- Always validate your data
SELECT
    COUNT(*) as total_rows,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(*) FILTER (WHERE arr IS NULL) as null_arr_count,
    MIN(arr) as min_arr,
    MAX(arr) as max_arr,
    AVG(arr) as avg_arr
FROM your_dataset;
```

---

## Performance Optimization

### 1. Dataset Size Guidelines

| Component | Recommended Max Rows | Notes |
|-----------|---------------------|-------|
| SM24-TopCustomers | 1,000 | Paginated, expandable |
| SM24-ARRTrend | 36 | Monthly data points |
| SM24-BigNumberPro | 1 | Single value |
| SM24-StatusCardFlow | 10 | Status categories |
| SM24-MetricWaterfall | 15 | Waterfall steps |

### 2. Pre-Aggregation

**Bad** (aggregation in Superset):
```sql
SELECT customer_id, SUM(mrr) FROM subscriptions GROUP BY 1
```

**Good** (pre-aggregated table):
```sql
-- Create materialized view
CREATE MATERIALIZED VIEW customer_arr_summary AS
SELECT 
    customer_id,
    SUM(mrr * 12) as arr,
    COUNT(DISTINCT product_id) as product_count
FROM subscriptions
WHERE status = 'active'
GROUP BY 1;

-- Query from pre-aggregated
SELECT * FROM customer_arr_summary;
```

### 3. Efficient Filters

**Use indexed columns for filters**:
```sql
-- Good: Filter on indexed date column
WHERE created_date >= CURRENT_DATE - INTERVAL '90 days'

-- Avoid: Function on column prevents index usage
WHERE DATE_TRUNC('month', created_date) = DATE_TRUNC('month', CURRENT_DATE)
```

---

## Control Panel Configuration

### 1. Required Controls First

Order your control panel sections:
1. **Column Mapping** - Required columns
2. **Display Options** - Core features
3. **Thresholds** - Business rules
4. **Formatting** - Locale, currency
5. **Advanced** - Optional features

### 2. Sensible Defaults

```typescript
// Good defaults
const config: CustomControlItem = {
  name: 'health_threshold',
  config: {
    type: 'SliderControl',
    label: t('Health Warning Threshold'),
    default: 70,  // Sensible default
    min: 0,
    max: 100,
    step: 5,
    description: t('Score below this is considered at-risk'),
  },
};
```

### 3. Validation

```typescript
// Add validators to controls
const config: CustomControlItem = {
  name: 'page_size',
  config: {
    type: 'TextControl',
    label: t('Page Size'),
    default: 25,
    validators: [validateNonEmpty, validateInteger],
    description: t('Number of rows per page (10-100)'),
  },
};
```

---

## Drilldown Implementation

### 1. Filter Building

```typescript
// Build proper drill filters
const handleDrilldown = useCallback(
  (customer: Customer, event: React.MouseEvent) => {
    if (!enableDrilldown || !onContextMenu) return;

    const filters: BinaryQueryObjectFilterClause[] = [
      {
        col: 'customer_id',
        op: '==',
        val: customer.customerId,
        formattedVal: customer.customerName,
      },
    ];

    onContextMenu(event.clientX, event.clientY, {
      drillToDetail: filters,
      drillBy: {
        filters,
        groupbyFieldName: 'customer_id',
      },
    });
  },
  [enableDrilldown, onContextMenu],
);
```

### 2. Event Handling

```typescript
// Attach to elements correctly
<TableRow
  onClick={() => handleRowClick(item)}
  onContextMenu={(e) => {
    e.preventDefault();  // Prevent browser menu
    handleDrilldown(item, e);
  }}
>
```

---

## Internationalization

### 1. All User-Visible Text

```typescript
// Always use t() for strings
const title = t('Customer Health Score');
const description = t('Shows the health status of your customers');

// Control labels
{
  label: t('Show Inactive'),
  description: t('Include inactive customers in the list'),
}
```

### 2. Number Formatting

```typescript
// Use SM24Utils formatting
import { formatAmount, formatPercent } from '../SM24Utils/formatting';

// In component
const displayValue = formatAmount(value, locale, currency);
const growthDisplay = formatPercent(growth);
```

### 3. Date Formatting

```typescript
// Locale-aware dates
const formatDate = (date: string, locale: string) => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

---

## Error Handling

### 1. Loading States

```typescript
if (loading) {
  return (
    <Container>
      <LoadingIndicator>
        {t('Loading data...')}
      </LoadingIndicator>
    </Container>
  );
}
```

### 2. Error States

```typescript
if (error) {
  return (
    <Container>
      <ErrorMessage>
        {t('Error loading data')}: {error}
      </ErrorMessage>
    </Container>
  );
}
```

### 3. Empty States

```typescript
if (!data || data.length === 0) {
  return (
    <Container>
      <EmptyState>
        <EmptyIcon>📊</EmptyIcon>
        <div>{t('No data available')}</div>
        <div>{t('Configure your data source to see results')}</div>
      </EmptyState>
    </Container>
  );
}
```

### 4. Null Safety

```typescript
// Always handle nulls
const healthScore = customer.healthScore ?? 0;
const customerName = customer.name || t('Unknown Customer');
const products = customer.products?.join(', ') || t('No products');
```

---

## Testing

### 1. Data Transformation Tests

```typescript
// test transformProps
describe('transformProps', () => {
  it('handles empty data', () => {
    const result = transformProps({ queriesData: [{ data: [] }] });
    expect(result.data).toBeNull();
  });

  it('calculates growth correctly', () => {
    const result = transformProps({
      queriesData: [{
        data: [{ arr: 100, prev_arr: 80 }]
      }]
    });
    expect(result.data.growth).toBe(25); // 25%
  });
});
```

### 2. Component Snapshot Tests

```typescript
import { render } from '@testing-library/react';

describe('SM24BigNumberPro', () => {
  it('renders correctly', () => {
    const { container } = render(
      <SM24BigNumberPro
        value={1234567}
        title="Total ARR"
        locale="en-US"
      />
    );
    expect(container).toMatchSnapshot();
  });
});
```

---

## Common Pitfalls

### 1. Avoid These Patterns

```typescript
// ❌ BAD: Using any type
const data: any = props.data;

// ✅ GOOD: Proper typing
const data: CustomerData[] = props.data;

// ❌ BAD: Direct antd import
import { Button } from 'antd';

// ✅ GOOD: Use core components
import { Button } from '@superset-ui/core';

// ❌ BAD: Inline styles everywhere
<div style={{ color: 'red', fontSize: '14px' }}>

// ✅ GOOD: Styled components
const StyledDiv = styled.div`
  color: ${({ theme }) => theme.colors.error.base};
  font-size: 14px;
`;

// ❌ BAD: console.log in production
console.log('Debug:', data);

// ✅ GOOD: Remove or use logger
// (remove debug statements before commit)
```

### 2. Memory Leaks

```typescript
// ❌ BAD: Chart instance not cleaned up
useEffect(() => {
  const chart = echarts.init(chartRef.current);
  chart.setOption(options);
}, [options]);

// ✅ GOOD: Cleanup on unmount
useEffect(() => {
  const chart = echarts.init(chartRef.current);
  chart.setOption(options);
  
  return () => {
    chart.dispose();
  };
}, [options]);
```

### 3. Unnecessary Re-renders

```typescript
// ❌ BAD: Object created on every render
<Component config={{ threshold: 50 }} />

// ✅ GOOD: Memoized config
const config = useMemo(() => ({ threshold: 50 }), []);
<Component config={config} />

// ❌ BAD: Function recreated every render
<Button onClick={() => handleClick(id)} />

// ✅ GOOD: Memoized callback
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />
```

---

## Checklist for New Components

- [ ] TypeScript: No `any` types
- [ ] Imports: All from @superset-ui/core
- [ ] License: ASF header in all files
- [ ] i18n: All strings wrapped in t()
- [ ] Theme: Using useTheme() tokens
- [ ] Drilldown: ContextMenuFilters implemented
- [ ] Error handling: Loading, error, empty states
- [ ] Control panel: Required controls first
- [ ] Documentation: Component README
- [ ] Tests: Unit tests for transformProps
