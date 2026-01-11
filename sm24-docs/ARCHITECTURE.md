# SM24 Components Architecture

> Техническая архитектура визуализационных компонентов

## 1. Обзор архитектуры

### 1.1 Расположение в проекте

```
superset-frontend/
├── packages/
│   └── superset-ui-core/
│       └── src/chart/types/
│           └── VizType.ts          # Регистрация типов визуализаций
│
├── plugins/
│   └── plugin-chart-echarts/
│       └── src/
│           ├── SM24BigNumber/      # ECharts-based
│           ├── SM24TopBigNumber/   # ECharts-based
│           ├── SM24ARRTrend/       # ECharts-based
│           ├── SM24ARRWaterfall/   # ECharts-based
│           ├── SM24MonthlyARRBreakdown/  # ECharts-based
│           ├── SM24TopCustomers/   # Custom React
│           ├── SM24StatusFunnel/   # Custom React
│           └── index.ts            # Экспорты плагинов
│
└── src/
    └── visualizations/
        └── presets/
            └── MainPreset.js       # Регистрация в Superset
```

### 1.2 Жизненный цикл данных

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐ │
│  │ Dataset  │───▶│ buildQuery│───▶│ transformProps│───▶│   Viz    │ │
│  │  (SQL)   │    │   (.ts)   │    │    (.ts)     │    │  (.tsx)  │ │
│  └──────────┘    └───────────┘    └──────────────┘    └──────────┘ │
│       │               │                  │                  │       │
│       │               │                  │                  │       │
│       ▼               ▼                  ▼                  ▼       │
│  ┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐ │
│  │  Raw     │    │  Query    │    │    Props     │    │  Render  │ │
│  │  Data    │    │  Context  │    │    (typed)   │    │  Output  │ │
│  └──────────┘    └───────────┘    └──────────────┘    └──────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Структура компонента

### 2.1 Файловая структура

Каждый SM24 компонент содержит 6 файлов:

```
SM24ComponentName/
├── index.ts           # Plugin registration
├── types.ts           # TypeScript interfaces
├── controlPanel.tsx   # UI configuration
├── buildQuery.ts      # Query construction
├── transformProps.ts  # Data transformation
└── SM24ComponentViz.tsx  # React visualization
```

### 2.2 Описание файлов

#### `index.ts` — Plugin Registration

```typescript
import { t, Behavior, ChartPlugin } from '@superset-ui/core';
// или EchartsChartPlugin для ECharts компонентов
import { EchartsChartPlugin } from '@superset-ui/plugin-chart-echarts';

export default class SM24ComponentChartPlugin extends EchartsChartPlugin<
  SM24ComponentFormData,
  SM24ComponentChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24ComponentViz'),
      metadata: {
        name: t('SM24-Component'),
        category: t('KPI'),
        description: t('Description...'),
        tags: [t('Business'), t('Smartup24')],
        thumbnail,
        behaviors: [Behavior.DrillToDetail, Behavior.DrillBy],
      },
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}
```

**Ключевые элементы**:
- `loadChart` — ленивая загрузка визуализации
- `metadata` — описание для UI
- `behaviors` — поддерживаемые интеракции
- `buildQuery` — конструктор запросов
- `transformProps` — преобразование данных

#### `types.ts` — TypeScript Interfaces

```typescript
import { QueryFormData, ChartProps } from '@superset-ui/core';

// Form data from Control Panel
export interface SM24ComponentFormData extends QueryFormData {
  metric: string;
  showTrend: boolean;
  numberFormat: string;
  // ... другие настройки
}

// Props passed to visualization
export interface SM24ComponentVizProps {
  width: number;
  height: number;
  mainValue: number;
  formattedValue: string;
  // ... другие props
}

// Chart props (internal)
export interface SM24ComponentChartProps extends ChartProps {
  formData: SM24ComponentFormData;
  queriesData: QueryData[];
}
```

#### `controlPanel.tsx` — UI Configuration

```typescript
import { ControlPanelConfig, sections } from '@superset-ui/chart-controls';
import { t } from '@superset-ui/core';

const config: ControlPanelConfig = {
  controlPanelSections: [
    // Reuse standard sections
    sections.legacyRegularTime,

    // Custom section
    {
      label: t('Display Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'showTrend',
            config: {
              type: 'CheckboxControl',
              label: t('Show Trend'),
              default: true,
              renderTrigger: true,
              description: t('Display sparkline trend'),
            },
          },
        ],
        // ... more controls
      ],
    },
  ],

  // Denormalize for query
  denormalizeFormData: formData => ({
    ...formData,
    // Transform form data before query
  }),

  // Form data overrides
  formDataOverrides: formData => ({
    ...formData,
    // Override specific values
  }),
};

export default config;
```

**Типы контролов**:
- `TextControl` — текстовое поле
- `CheckboxControl` — чекбокс
- `SelectControl` — выпадающий список
- `ColorPickerControl` — выбор цвета
- `SliderControl` — ползунок
- `MetricsControl` — выбор метрик

#### `buildQuery.ts` — Query Construction

```typescript
import { buildQueryContext, QueryFormData } from '@superset-ui/core';

export default function buildQuery(formData: SM24ComponentFormData) {
  const {
    metric,
    time_comparison,
    // ... other form data
  } = formData;

  return buildQueryContext(formData, baseQueryObject => {
    const queries = [
      {
        ...baseQueryObject,
        metrics: [metric],
        // Custom query modifications
      },
    ];

    // Add comparison query if needed
    if (time_comparison) {
      queries.push({
        ...baseQueryObject,
        metrics: [metric],
        time_offsets: [time_comparison],
      });
    }

    return queries;
  });
}
```

**Паттерны запросов**:
- `time_offsets` — для YoY/MoM сравнений
- Multiple queries — для разных срезов данных
- Custom groupby — для агрегации

#### `transformProps.ts` — Data Transformation

```typescript
import { ChartProps } from '@superset-ui/core';
import { SM24ComponentFormData, SM24ComponentVizProps } from './types';

export default function transformProps(
  chartProps: ChartProps,
): SM24ComponentVizProps {
  const { width, height, formData, queriesData } = chartProps;
  const data = queriesData[0]?.data || [];

  const {
    metric,
    showTrend,
    numberFormat,
  } = formData as SM24ComponentFormData;

  // Parse main value
  const mainValue = parseFloat(data[0]?.[metric] || 0);

  // Format value
  const formattedValue = formatNumber(mainValue, numberFormat);

  // Calculate trend
  const trend = showTrend ? calculateTrend(data, metric) : null;

  return {
    width,
    height,
    mainValue,
    formattedValue,
    trend,
    // ... other transformed props
  };
}
```

**Ответственности**:
- Парсинг сырых данных
- Форматирование значений
- Расчёт производных метрик
- Подготовка props для визуализации

#### `SM24ComponentViz.tsx` — React Visualization

```typescript
import React, { useMemo } from 'react';
import { styled, useTheme } from '@superset-ui/core';
import { SM24ComponentVizProps } from './types';

const Container = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  // ... styles
`;

function SM24ComponentViz({
  width,
  height,
  mainValue,
  formattedValue,
  trend,
}: SM24ComponentVizProps) {
  const theme = useTheme();

  const chartConfig = useMemo(() => ({
    // Memoized calculations
  }), [/* dependencies */]);

  return (
    <Container height={height}>
      {/* Visualization content */}
    </Container>
  );
}

export default SM24ComponentViz;
```

**Паттерны**:
- `styled-components` для стилей
- `useTheme()` для темы Superset
- `useMemo` для оптимизации
- Props-driven рендеринг

---

## 3. Регистрация плагина

### 3.1 VizType.ts

```typescript
// superset-frontend/packages/superset-ui-core/src/chart/types/VizType.ts

export enum VizType {
  // ... existing types
  SM24BigNumber = 'sm24_big_number',
  SM24TopBigNumber = 'sm24_top_big_number',
  SM24ARRTrend = 'sm24_arr_trend',
  SM24ARRWaterfall = 'sm24_arr_waterfall',
  SM24MonthlyARRBreakdown = 'sm24_monthly_arr_breakdown',
  SM24TopCustomers = 'sm24_top_customers',
  SM24StatusFunnel = 'sm24_status_funnel',
}
```

### 3.2 plugin-chart-echarts/index.ts

```typescript
// Экспорт плагинов
export { default as SM24BigNumberChartPlugin } from './SM24BigNumber';
export { default as SM24TopBigNumberChartPlugin } from './SM24TopBigNumber';
// ... etc
```

### 3.3 MainPreset.js

```typescript
import {
  SM24BigNumberChartPlugin,
  SM24TopBigNumberChartPlugin,
  // ... etc
} from '@superset-ui/plugin-chart-echarts';

export default class MainPreset extends Preset {
  constructor() {
    super({
      plugins: [
        new SM24BigNumberChartPlugin().configure({
          key: VizType.SM24BigNumber,
        }),
        // ... etc
      ],
    });
  }
}
```

---

## 4. ECharts vs Custom React

### 4.1 Когда использовать EchartsChartPlugin

✅ Используйте для:
- Графики, диаграммы, charts
- Стандартные визуализации
- Интерактивные tooltips
- Анимации

```typescript
// Наследование от EchartsChartPlugin
export default class SM24ARRTrendChartPlugin extends EchartsChartPlugin<
  SM24ARRTrendFormData,
  SM24ARRTrendChartProps
> {
  // ECharts-specific transformProps returns echartOptions
}
```

**SM24 ECharts компоненты**:
- SM24BigNumber (sparkline)
- SM24TopBigNumber (sparklines)
- SM24ARRTrend (bar + line chart)
- SM24ARRWaterfall (waterfall chart)
- SM24MonthlyARRBreakdown (stacked bar)

### 4.2 Когда использовать ChartPlugin

✅ Используйте для:
- Таблицы
- Карточки
- Кастомные layouts
- Non-chart визуализации

```typescript
// Наследование от ChartPlugin
export default class SM24StatusFunnelChartPlugin extends ChartPlugin<
  SM24StatusFunnelFormData,
  SM24StatusFunnelChartProps
> {
  // Returns React component directly
}
```

**SM24 Custom компоненты**:
- SM24TopCustomers (table)
- SM24StatusFunnel (card flow)

---

## 5. Theming Integration

### 5.1 Использование темы

```typescript
import { useTheme, styled } from '@superset-ui/core';

function SM24ComponentViz(props) {
  const theme = useTheme();

  // Использование токенов темы
  const primaryColor = theme.colors.primary.base;
  const fontSize = theme.typography.sizes.m;
  const fontFamily = theme.typography.families.sansSerif;

  return (
    <Container
      style={{
        color: primaryColor,
        fontSize,
        fontFamily,
      }}
    >
      {/* content */}
    </Container>
  );
}
```

### 5.2 Styled Components с темой

```typescript
const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.grayscale.light5};
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  font-family: ${({ theme }) => theme.typography.families.sansSerif};
`;
```

---

## 6. Behaviors (Drill-down)

### 6.1 Поддерживаемые behaviors

```typescript
import { Behavior } from '@superset-ui/core';

behaviors: [
  Behavior.DrillToDetail,  // Клик → детальная таблица
  Behavior.DrillBy,        // Клик → группировка по измерению
]
```

### 6.2 Реализация в компоненте

```typescript
// В transformProps передаём hooks
return {
  // ...props
  onContextMenu: (e, rowData) => {
    // Superset автоматически обрабатывает
  },
};

// В визуализации
<div
  onContextMenu={(e) => {
    if (onContextMenu) {
      onContextMenu(e, { metric, value });
    }
  }}
>
```

---

## 7. Data Flow Diagrams

### 7.1 Query Flow

```
User Action (filter change)
         │
         ▼
┌─────────────────┐
│   formData      │ ← Control Panel state
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   buildQuery()  │ ← Constructs SQL
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │ ← Executes query
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  queriesData[]  │ ← Raw results
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ transformProps()│ ← Transforms data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   VizProps      │ ← Typed props
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Render        │ ← React component
└─────────────────┘
```

### 7.2 Control Panel Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Control Panel                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Section: Query                                              │
│  ├── MetricsControl     ──────────────────────┐             │
│  ├── GroupByControl     ──────────────────────┤             │
│  └── TimeComparison     ──────────────────────┤             │
│                                               │             │
│  Section: Display                             │             │
│  ├── CheckboxControl    ──────────────────────┤             │
│  └── ColorPickerControl ──────────────────────┤             │
│                                               │             │
│  Section: Formatting                          │             │
│  ├── SelectControl      ──────────────────────┤             │
│  └── TextControl        ──────────────────────┘             │
│                                               │             │
│         All controls update ─────────────────▶│ formData    │
│                                               │             │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                ▼
                                          buildQuery()
```

---

## 8. Performance Considerations

### 8.1 Memoization

```typescript
// В компоненте
const chartConfig = useMemo(() => {
  // Тяжёлые вычисления
  return calculateConfig(data, options);
}, [data, options]); // Зависимости

const formattedData = useMemo(() => {
  return data.map(item => formatItem(item, locale));
}, [data, locale]);
```

### 8.2 Lazy Loading

```typescript
// В index.ts
loadChart: () => import('./SM24ComponentViz'),
// Компонент загружается только при использовании
```

### 8.3 Query Optimization

```typescript
// В buildQuery.ts
return buildQueryContext(formData, baseQueryObject => [{
  ...baseQueryObject,
  row_limit: 1000,  // Ограничение строк
  // Не запрашиваем лишние колонки
  columns: requiredColumns,
}]);
```

---

## 9. Testing Architecture

### 9.1 Рекомендуемая структура тестов

```
SM24ComponentName/
├── __tests__/
│   ├── buildQuery.test.ts      # Query construction
│   ├── transformProps.test.ts  # Data transformation
│   └── SM24ComponentViz.test.tsx  # Component render
├── index.ts
├── types.ts
└── ...
```

### 9.2 Примеры тестов

```typescript
// buildQuery.test.ts
import buildQuery from '../buildQuery';

test('builds query with time comparison', () => {
  const formData = {
    metric: 'revenue',
    time_comparison: '1 year ago',
  };

  const result = buildQuery(formData);

  expect(result.queries).toHaveLength(2);
  expect(result.queries[1].time_offsets).toContain('1 year ago');
});
```

```typescript
// transformProps.test.ts
import transformProps from '../transformProps';

test('formats currency correctly', () => {
  const chartProps = {
    width: 400,
    height: 300,
    formData: { metric: 'revenue', numberFormat: ',.0f' },
    queriesData: [{ data: [{ revenue: 1234567 }] }],
  };

  const result = transformProps(chartProps);

  expect(result.formattedValue).toBe('1,234,567');
});
```

---

## 10. Расширение архитектуры

### 10.1 Добавление нового компонента

1. Создать папку `SM24NewComponent/`
2. Скопировать структуру из существующего компонента
3. Обновить `types.ts` с новыми интерфейсами
4. Реализовать `buildQuery.ts`
5. Реализовать `transformProps.ts`
6. Создать `controlPanel.tsx`
7. Создать `SM24NewComponentViz.tsx`
8. Зарегистрировать в `VizType.ts`
9. Добавить export в `index.ts`
10. Зарегистрировать в `MainPreset.js`

### 10.2 Общие утилиты

Рекомендуется вынести общий код:

```
SM24Utils/
├── formatters.ts     # Number/currency formatting
├── colors.ts         # Color utilities
├── locale.ts         # Localization helpers
└── calculations.ts   # Business calculations
```

---

**Следующий документ**: [DATA-REQUIREMENTS.md](./DATA-REQUIREMENTS.md)
