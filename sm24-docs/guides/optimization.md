# SM24 Components - Optimization Guide

## Current State Analysis

### What's Done Right ✅

1. **TypeScript Compliance**: 100% - Zero `any` types across all components
2. **Shared Utilities Module**: SM24Utils centralizes common logic
3. **Proper Imports**: All imports from @superset-ui/core
4. **Drilldown Support**: Comprehensive ContextMenuFilters integration
5. **i18n Support**: Multi-locale formatting (en-US, ru-RU, uz-UZ)
6. **Theme Integration**: Uses `useTheme()` tokens
7. **Error Handling**: Loading states, error messages, validation
8. **React Best Practices**: Functional components, useMemo, useCallback

### Issues Found ⚠️

1. **Debug Statement**: `console.log` in SM24MetricWaterfallViz.tsx
2. **Hardcoded Business Logic**: Some SaaS-specific assumptions
3. **Large Component Files**: Some Viz files exceed 700 lines
4. **Limited Configurability**: Some features hardcoded instead of configurable

---

## Optimization Recommendations

### 1. Remove Debug Statements

**File**: `SM24MetricWaterfall/SM24MetricWaterfallViz.tsx`

```typescript
// REMOVE THIS LINE:
console.log('Drilldown:', point.category, DRILLDOWN_MAP[point.category]);
```

### 2. Make Components Universal (Not SaaS-Specific)

#### Current Problem
Components have hardcoded SaaS terminology:
- `ARR`, `MRR`, `Churn`, `NPS`
- Specific health score calculations
- Hardcoded status values

#### Solution: Generic Configuration Layer

**Before** (Hardcoded):
```typescript
// types.ts
export type ProductStatus = 'active' | 'trial' | 'expiring' | 'churned';

export const STATUS_CONFIG = {
  active: { label: 'Active', color: '#52c41a' },
  trial: { label: 'Trial', color: '#faad14' },
  // ...hardcoded
};
```

**After** (Configurable):
```typescript
// types.ts
export interface StatusConfig {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  icon?: string;
}

// controlPanel.tsx - Add status configuration
const statusConfig: CustomControlItem = {
  name: 'statusConfig',
  config: {
    type: 'JsonEditor',
    label: t('Status Configuration'),
    default: [
      { key: 'active', label: 'Active', color: '#52c41a' },
      { key: 'inactive', label: 'Inactive', color: '#999' },
    ],
    description: t('Configure status labels and colors'),
  },
};
```

### 3. Extract Reusable Sub-Components

#### Current State
Large monolithic Viz components (400-700+ lines)

#### Solution: Component Composition

**Create shared sub-components**:

```typescript
// SM24Utils/components/index.ts
export { MetricCard } from './MetricCard';
export { StatusBadge } from './StatusBadge';
export { TrendIndicator } from './TrendIndicator';
export { SparklineChart } from './SparklineChart';
export { AlertBanner } from './AlertBanner';
export { ProgressBar } from './ProgressBar';
export { DataTable } from './DataTable';
```

**Example - MetricCard**:
```typescript
// SM24Utils/components/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  comparison?: {
    value: number;
    type: 'percentage' | 'absolute';
    positiveIsGood: boolean;
  };
  sparkline?: number[];
  status?: 'success' | 'warning' | 'error';
  format?: (val: number) => string;
  onClick?: () => void;
}

export const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  comparison,
  sparkline,
  status,
  format,
  onClick,
}) => {
  // Reusable implementation
};
```

### 4. Generic Column Mapping System

#### Current Problem
Each component has its own column mapping logic with hardcoded field names.

#### Solution: Universal Column Mapper

```typescript
// SM24Utils/columnMapping.ts
export interface ColumnMapping {
  source: string;       // Column name in data
  target: string;       // Property name in props
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: unknown;
  transform?: (value: unknown) => unknown;
}

export function mapColumns<T>(
  data: Record<string, unknown>[],
  mappings: ColumnMapping[],
): T[] {
  return data.map(row => {
    const mapped: Record<string, unknown> = {};
    
    for (const mapping of mappings) {
      const rawValue = row[mapping.source];
      let value = rawValue ?? mapping.defaultValue;
      
      if (mapping.transform) {
        value = mapping.transform(value);
      }
      
      mapped[mapping.target] = value;
    }
    
    return mapped as T;
  });
}
```

**Usage in transformProps**:
```typescript
// transformProps.ts
const columnMappings: ColumnMapping[] = [
  { source: formData.idColumn, target: 'id', type: 'string', required: true },
  { source: formData.nameColumn, target: 'name', type: 'string', required: true },
  { source: formData.valueColumn, target: 'value', type: 'number', required: true },
  // User configures columns in control panel
];

const mappedData = mapColumns<EntityData>(rawData, columnMappings);
```

### 5. Threshold-Based Styling System

#### Current Problem
Hardcoded threshold values for colors and alerts.

#### Solution: Configurable Threshold Engine

```typescript
// SM24Utils/thresholds.ts
export interface ThresholdRule {
  condition: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'between';
  value: number | [number, number];
  result: {
    color?: string;
    bgColor?: string;
    label?: string;
    icon?: string;
    alert?: 'info' | 'warning' | 'error';
  };
}

export interface ThresholdConfig {
  field: string;
  rules: ThresholdRule[];
  defaultResult: ThresholdRule['result'];
}

export function evaluateThresholds(
  value: number,
  config: ThresholdConfig,
): ThresholdRule['result'] {
  for (const rule of config.rules) {
    if (matchesCondition(value, rule.condition, rule.value)) {
      return rule.result;
    }
  }
  return config.defaultResult;
}
```

**Control Panel Configuration**:
```typescript
// controlPanel.tsx
const thresholdConfig: CustomControlItem = {
  name: 'healthThresholds',
  config: {
    type: 'ThresholdControl',  // Custom control type
    label: t('Health Score Thresholds'),
    default: [
      { condition: 'lt', value: 50, result: { color: '#ff4d4f', label: 'Critical' } },
      { condition: 'lt', value: 70, result: { color: '#faad14', label: 'At Risk' } },
      { condition: 'gte', value: 70, result: { color: '#52c41a', label: 'Healthy' } },
    ],
  },
};
```

### 6. Plugin-Based Extensions

#### Solution: Extension Points

```typescript
// SM24Utils/plugins.ts
export interface SM24Plugin {
  name: string;
  type: 'formatter' | 'validator' | 'renderer' | 'calculator';
  handler: (...args: unknown[]) => unknown;
}

export interface SM24PluginRegistry {
  formatters: Map<string, (value: number, locale: string) => string>;
  validators: Map<string, (data: unknown) => boolean>;
  renderers: Map<string, FC<unknown>>;
  calculators: Map<string, (data: unknown[]) => number>;
}

// Register custom formatters
registry.formatters.set('custom_currency', (value, locale) => {
  // Custom currency formatting
});

// Use in component
const formattedValue = registry.formatters.get(formData.formatter)?.(value, locale);
```

### 7. Performance Optimizations

#### Current Issues
- Large dataset rendering without virtualization
- Recalculation on every render

#### Solutions

**a) Virtual Scrolling for Tables**:
```typescript
// Use react-window for large lists
import { FixedSizeList } from 'react-window';

const VirtualizedTable: FC<{ data: unknown[] }> = ({ data }) => (
  <FixedSizeList
    height={400}
    itemCount={data.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <TableRow data={data[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

**b) Memoized Calculations**:
```typescript
// Heavy calculations memoized with useMemo
const aggregatedData = useMemo(() => {
  return computeHeavyAggregation(rawData, filters);
}, [rawData, filters]);

// Callbacks memoized with useCallback
const handleClick = useCallback((id: string) => {
  onDrilldown(id);
}, [onDrilldown]);
```

**c) Lazy Loading Sub-components**:
```typescript
// Lazy load complex sub-components
const ChartSection = lazy(() => import('./ChartSection'));
const TableSection = lazy(() => import('./TableSection'));

// In component
<Suspense fallback={<Loading />}>
  <ChartSection data={chartData} />
</Suspense>
```

### 8. Universal Form Data Interface

```typescript
// SM24Utils/types.ts
export interface SM24BaseFormData extends QueryFormData {
  // Column mapping
  columnMappings?: ColumnMapping[];
  
  // Display
  locale: string;
  currency: string;
  
  // Thresholds
  thresholds?: ThresholdConfig[];
  
  // Styling
  customColors?: Record<string, string>;
  customLabels?: Record<string, string>;
  
  // Features
  enableDrilldown: boolean;
  enableExport: boolean;
  enableSearch: boolean;
  
  // Extensions
  plugins?: string[];
}

// Component-specific extends base
export interface SM24CustomerListFormData extends SM24BaseFormData {
  // Component-specific options
  showHealthScore: boolean;
  showChurnRisk: boolean;
  pageSize: number;
}
```

---

## Implementation Priority

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 🔴 P0 | Remove console.log | Bug fix | Low |
| 🟠 P1 | Extract shared components | Maintainability | Medium |
| 🟠 P1 | Configurable thresholds | Flexibility | Medium |
| 🟡 P2 | Universal column mapping | Reusability | High |
| 🟡 P2 | Virtual scrolling | Performance | Medium |
| 🟢 P3 | Plugin system | Extensibility | High |

---

## Migration Path

### Phase 1: Quick Wins
1. Remove debug statements
2. Add missing control panel options for hardcoded values
3. Extract 2-3 most-used sub-components

### Phase 2: Refactoring
1. Implement universal column mapping
2. Create configurable threshold system
3. Extract remaining shared components

### Phase 3: Advanced Features
1. Implement plugin registry
2. Add virtual scrolling
3. Create component generator for new visualizations

---

## File Size Optimization

### Current
| Component | Viz Size | Types Size |
|-----------|----------|------------|
| CustomerProfile | ~700 lines | ~500 lines |
| CustomerProductUsage | ~650 lines | ~450 lines |
| ARRTrend | ~600 lines | ~400 lines |

### Target (After Refactoring)
| Component | Viz Size | Types Size |
|-----------|----------|------------|
| CustomerProfile | ~400 lines | ~300 lines |
| CustomerProductUsage | ~350 lines | ~250 lines |
| ARRTrend | ~300 lines | ~200 lines |

**Reduction**: 40-50% through component extraction and shared utilities.

---

## Theme Optimization

### Current State

SM24 theme system created in `SM24Utils/theme.ts`:
- ✅ `SM24_THEME_TOKENS` - Ant Design token configuration
- ✅ `SM24_DARK_THEME_TOKENS` - Dark mode support
- ✅ `SM24_SEMANTIC_COLORS` - Domain-specific colors
- ✅ `SM24_ECHARTS_THEME` - Chart theming

### Issues Found

**Hardcoded colors in components:**

```typescript
// SM24TopCustomersViz.tsx - Examples of hardcoded colors
background: #fff;           // Should use theme token
border: 1px solid #eee;     // Should use theme token
color: #3498db;             // Should use SM24_COLORS.primary
border-color: #f1c40f;      // Should use HEALTH_COLORS.good
```

### Theme Migration Guide

**Step 1: Import SM24 utilities**
```typescript
import { SM24_COLORS, HEALTH_COLORS, RISK_COLORS } from '../SM24Utils';
```

**Step 2: Replace hardcoded colors**

| Hardcoded | Replace With |
|-----------|--------------|
| `#fff` | `theme.colors.grayscale.light5` |
| `#eee`, `#ddd` | `theme.colors.grayscale.light3` |
| `#3498db` | `SM24_COLORS.primary` |
| `#27AE60` | `SM24_COLORS.success` |
| `#E74C3C` | `SM24_COLORS.error` |
| `#F39C12` | `SM24_COLORS.warning` |
| `#2c3e50` | `SM24_COLORS.neutral800` |

**Step 3: Use theme props in styled-components**
```typescript
const Container = styled.div`
  // Before
  background: #f8f9fa;

  // After
  background: ${({ theme }) => theme.colors.grayscale.light4};
`;
```

### Priority Files for Theme Migration

| File | Hardcoded Colors | Priority |
|------|------------------|----------|
| SM24TopCustomersViz.tsx | 20+ | 🔴 High |
| SM24ARRTrendViz.tsx | 5-10 | 🟠 Medium |
| SM24StatusCardFlowViz.tsx | 5-10 | 🟠 Medium |
| SM24CustomerProfileViz.tsx | 3-5 | 🟢 Low |

### Theme Integration Checklist

- [ ] Use `useTheme()` hook in all Viz components
- [ ] Replace hardcoded hex colors with theme tokens
- [ ] Use `SM24_SEMANTIC_COLORS` for business logic colors
- [ ] Test dark mode compatibility
- [ ] Update ECharts themes to use SM24_ECHARTS_THEME
