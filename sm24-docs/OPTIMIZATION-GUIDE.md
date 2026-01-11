# SM24 Components Optimization Guide

> Руководство по оптимизации и универсализации компонентов

## Цель оптимизации

Преобразовать жёстко настроенные компоненты SM24 в универсальные, переиспользуемые визуализации, которые могут использоваться любой организацией, не только Smartup24.

---

## 1. Проблемы текущей реализации

### 1.1 Жёсткая привязка к Smartup24

| Проблема | Файлы | Влияние |
|----------|-------|---------|
| Префикс SM24- в названиях | Все | Брендинг |
| Захардкоженная валюта "сум" | SM24StatusFunnel | Локализация |
| Русские метки без i18n | Несколько | Интернационализация |
| Специфичные бизнес-термины | ARR компоненты | Универсальность |

### 1.2 Архитектурные ограничения

```
Текущая структура:
┌─────────────────────────────────────────┐
│  SM24BigNumber (жёсткая конфигурация)   │
│  ├── Hardcoded: ru-RU locale            │
│  ├── Hardcoded: sparkline style         │
│  └── Hardcoded: comparison logic        │
└─────────────────────────────────────────┘

Целевая структура:
┌─────────────────────────────────────────┐
│  BigNumberPro (универсальный)           │
│  ├── Configurable: locale               │
│  ├── Configurable: trend visualization  │
│  └── Configurable: comparison strategy  │
└─────────────────────────────────────────┘
```

---

## 2. Стратегия универсализации

### 2.1 Переименование компонентов

| Текущее имя | Универсальное имя | Причина |
|-------------|-------------------|---------|
| SM24-BigNumber | BigNumberPro | Расширенный BigNumber |
| SM24-TopBigNumber | MultiKpiCards | Мульти-метрики |
| SM24-ARRTrend | MixedTrendChart | Смешанный тренд |
| SM24-ARRWaterfall | MetricWaterfall | Универсальный waterfall |
| SM24-MonthlyARRBreakdown | StackedSegmentBar | Сегментированные бары |
| SM24-TopCustomers | EntityHealthTable | Таблица с health-метриками |
| SM24-StatusFunnel | StatusCardFlow | Поток карточек статусов |

### 2.2 Конфигурация через Control Panel

**Принцип**: Всё, что сейчас захардкожено, должно настраиваться через UI.

```typescript
// До (жёсткая привязка)
const CURRENCY = 'сум';
const LOCALE = 'ru-RU';

// После (конфигурируемо)
interface UniversalFormData {
  // Локализация
  numberLocale: 'en-US' | 'ru-RU' | 'uz-UZ' | 'de-DE' | string;
  currencyCode: 'USD' | 'EUR' | 'UZS' | 'RUB' | string;
  currencyPosition: 'before' | 'after';
  currencySymbol: string; // Позволяет кастомный символ

  // Масштабирование
  scaleType: 'auto' | 'fixed';
  scaleLabels: {
    thousands: string;  // 'K' или 'тыс.'
    millions: string;   // 'M' или 'млн.'
    billions: string;   // 'B' или 'млрд.'
  };
}
```

---

## 3. Детальные рекомендации по компонентам

### 3.1 BigNumberPro (бывший SM24-BigNumber)

**Текущие ограничения**:
- Захардкоженный sparkline дизайн
- Фиксированная логика сравнения
- Привязка к конкретному формату данных

**Оптимизация**:

```typescript
// types.ts - Добавить универсальные опции
export interface BigNumberProFormData extends QueryFormData {
  // === НОВЫЕ УНИВЕРСАЛЬНЫЕ ОПЦИИ ===

  // Trend Visualization
  trendType: 'sparkline' | 'bar' | 'area' | 'none';
  trendPeriod: number; // Количество точек
  trendSmoothing: boolean;

  // Comparison Strategy
  comparisonType: 'period' | 'target' | 'benchmark' | 'none';
  comparisonPeriods: string[]; // ['1 year ago', '1 month ago']
  comparisonTarget?: number;

  // Threshold Configuration
  thresholds: {
    good: { operator: '>' | '<' | '>='; value: number; color: string };
    warning: { operator: string; value: number; color: string };
    bad: { operator: string; value: number; color: string };
  };

  // Formatting
  valueFormat: string; // D3 format
  prefixText?: string;
  suffixText?: string;
}
```

**ControlPanel additions**:
```typescript
// controlPanel.tsx
{
  name: 'thresholds',
  config: {
    type: 'CollectionControl',
    label: t('Value Thresholds'),
    description: t('Define color thresholds for conditional formatting'),
    renderTrigger: true,
    controlComponents: {
      operator: {
        type: 'SelectControl',
        choices: [['>', '>'], ['<', '<'], ['>=', '>='], ['<=', '<=']],
      },
      value: { type: 'TextControl', isFloat: true },
      color: { type: 'ColorPickerControl' },
    },
  },
},
```

### 3.2 MultiKpiCards (бывший SM24-TopBigNumber)

**Текущие ограничения**:
- Фиксированный layout (2-6 карточек)
- Одинаковый стиль для всех карточек

**Оптимизация**:

```typescript
export interface MultiKpiCardsFormData extends QueryFormData {
  // Layout
  layoutType: 'horizontal' | 'vertical' | 'grid';
  cardsPerRow: number;
  cardMinWidth: number;
  cardSpacing: number;

  // Card Configuration (per metric)
  cardConfigs: Array<{
    metric: string;
    label: string;
    icon?: string;
    showTrend: boolean;
    showComparison: boolean;
    customColor?: string;
  }>;

  // Responsive
  mobileLayout: 'stack' | 'scroll' | 'collapse';
}
```

### 3.3 MixedTrendChart (бывший SM24-ARRTrend)

**Текущие ограничения**:
- Привязка к ARR терминологии
- Фиксированные цвета для YoY

**Оптимизация**:

```typescript
export interface MixedTrendChartFormData extends QueryFormData {
  // Series Configuration
  primarySeries: {
    metric: string;
    type: 'bar' | 'line' | 'area';
    color: string;
    label: string;
  };
  secondarySeries?: {
    metric: string;
    type: 'line' | 'area';
    color: string;
    label: string;
    yAxisPosition: 'left' | 'right';
  };

  // Comparison
  comparisonSeries?: {
    enabled: boolean;
    timeOffset: string; // '1 year', '1 quarter'
    style: 'dashed' | 'dotted' | 'solid';
    opacity: number;
  };

  // Target/Goal Line
  targetLine?: {
    enabled: boolean;
    value: number | 'metric'; // Фиксированное или из метрики
    label: string;
    style: 'solid' | 'dashed';
  };

  // Growth Indicators
  growthAnnotations: {
    enabled: boolean;
    thresholds: { excellent: number; good: number; warning: number };
    position: 'above' | 'inside' | 'below';
  };
}
```

### 3.4 MetricWaterfall (бывший SM24-ARRWaterfall)

**Текущие ограничения**:
- Жёсткая структура: Begin → New → Expansion → Contraction → Churn → End
- Привязка к ARR метрикам

**Оптимизация**:

```typescript
export interface MetricWaterfallFormData extends QueryFormData {
  // Dynamic Steps (вместо фиксированных)
  steps: Array<{
    id: string;
    metric: string;
    label: string;
    type: 'start' | 'positive' | 'negative' | 'subtotal' | 'end';
    color: string;
    drilldownDimension?: string;
  }>;

  // Calculated Metrics
  calculatedMetrics?: Array<{
    name: string;
    formula: string; // e.g., "(new + expansion) / (contraction + churn)"
    format: string;
    thresholds?: { good: number; warning: number };
  }>;

  // Connectors
  connectorStyle: 'line' | 'dashed' | 'none';
  connectorColor: string;

  // Labels
  showValues: boolean;
  showPercentages: boolean;
  labelPosition: 'inside' | 'outside' | 'auto';
}
```

**Пример конфигурации для не-ARR use case**:
```typescript
// Бюджетный waterfall
const budgetWaterfall = {
  steps: [
    { id: 'start', metric: 'initial_budget', label: 'Начальный бюджет', type: 'start' },
    { id: 'income', metric: 'additional_income', label: 'Доп. доходы', type: 'positive' },
    { id: 'expenses', metric: 'expenses', label: 'Расходы', type: 'negative' },
    { id: 'transfers', metric: 'transfers_out', label: 'Переводы', type: 'negative' },
    { id: 'end', metric: 'final_budget', label: 'Итоговый бюджет', type: 'end' },
  ],
};
```

### 3.5 StackedSegmentBar (бывший SM24-MonthlyARRBreakdown)

**Текущие ограничения**:
- Привязка к Product Lines и Customer Segments
- Захардкоженные цвета сегментов

**Оптимизация**:

```typescript
export interface StackedSegmentBarFormData extends QueryFormData {
  // Dimensions
  categoryDimension: string;  // Y-axis (products, regions, etc.)
  segmentDimension: string;   // Stacked segments

  // Metrics
  valueMetric: string;
  sortBy: 'value' | 'name' | 'custom';
  sortOrder: 'asc' | 'desc';

  // Segments
  segmentColors: Record<string, string>;  // Динамический маппинг
  segmentOrder?: string[];  // Порядок в стеке

  // Analysis Features
  showDeviationFromAverage: boolean;
  showConcentrationRisk: boolean;
  concentrationThreshold: number;  // % для предупреждения

  // Annotations
  annotations?: Array<{
    segment: string;
    text: string;
    position: 'left' | 'right';
  }>;
}
```

### 3.6 EntityHealthTable (бывший SM24-TopCustomers)

**Текущие ограничения**:
- Привязка к Customer entity
- Захардкоженные health-метрики

**Оптимизация**:

```typescript
export interface EntityHealthTableFormData extends QueryFormData {
  // Entity Configuration
  entityType: string;  // 'customer' | 'employee' | 'product' | 'vendor' | custom
  entityIdColumn: string;
  entityNameColumn: string;

  // Columns Configuration
  columns: Array<{
    key: string;
    source: 'metric' | 'dimension' | 'calculated';
    metric?: string;
    dimension?: string;
    formula?: string;
    label: string;
    type: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'progress' | 'status';
    width?: number;
    sortable: boolean;

    // Conditional Formatting
    formatting?: {
      type: 'threshold' | 'gradient' | 'icon';
      rules: Array<{
        condition: string;
        style: { color?: string; background?: string; icon?: string };
      }>;
    };
  }>;

  // Health Score (optional, calculated)
  healthScore?: {
    enabled: boolean;
    formula: string;  // Weighted formula
    displayAs: 'number' | 'progress' | 'status';
    thresholds: { good: number; warning: number; critical: number };
  };

  // Risk Assessment
  riskAssessment?: {
    enabled: boolean;
    factors: Array<{ metric: string; weight: number; invertScale: boolean }>;
  };

  // Interactivity
  rowClickAction: 'expand' | 'drilldown' | 'modal' | 'none';
  expandableContent?: 'details' | 'chart' | 'custom';
}
```

### 3.7 StatusCardFlow (бывший SM24-StatusFunnel)

**Текущие ограничения**:
- Привязка к Order/Visit/Lead/Task entities
- Захардкоженная валюта "сум"
- Русские UI-тексты

**Оптимизация**:

```typescript
export interface StatusCardFlowFormData extends QueryFormData {
  // Entity Configuration (полностью динамическая)
  entityConfig: {
    type: string;  // Любой тип сущности
    labelSingular: string;
    labelPlural: string;
    labelGenitive: string;
    icon?: string;
    hasAmount: boolean;
  };

  // Status Mapping
  statusIdColumn: string;
  statusNameColumn: string;
  statusOrderColumn?: string;
  statusColorColumn?: string;
  countColumn: string;
  amountColumn?: string;

  // Default Colors (если нет в данных)
  defaultColorScheme: 'sequential' | 'categorical' | 'custom';
  customColors?: string[];

  // Layout
  flowDirection: 'horizontal' | 'vertical';
  showArrows: boolean;
  arrowStyle: 'simple' | 'animated' | 'none';
  cardStyle: 'rounded' | 'square' | 'minimal';

  // Display
  showCounts: boolean;
  showAmounts: boolean;
  showPercentages: boolean;
  percentageBase: 'total' | 'previous' | 'first';

  // Currency (dynamic!)
  currencyConfig: {
    code: string;       // 'UZS', 'USD', etc.
    symbol: string;     // 'сум', '$', etc.
    position: 'before' | 'after';
    locale: string;     // Для форматирования
  };

  // Interactivity
  enableEntityTypeSwitch: boolean;
  availableEntityTypes?: Array<{
    id: string;
    config: EntityConfig;
  }>;
}
```

---

## 4. Общие архитектурные улучшения

### 4.1 Создание базовых классов

```typescript
// src/utils/BaseFormData.ts
export interface UniversalFormData extends QueryFormData {
  // Localization
  locale: string;
  numberFormat: string;
  dateFormat: string;

  // Currency
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
    decimals: number;
  };

  // Scale Labels
  scaleLabels: {
    thousands: string;
    millions: string;
    billions: string;
    trillions: string;
  };

  // Theming
  colorScheme: string;
  customColors?: string[];
}
```

### 4.2 Утилиты форматирования

```typescript
// src/utils/formatters.ts
export interface FormatterConfig {
  locale: string;
  currency?: CurrencyConfig;
  scale?: ScaleConfig;
}

export function createNumberFormatter(config: FormatterConfig) {
  return (value: number) => {
    // Универсальное форматирование с учётом локали
  };
}

export function createCurrencyFormatter(config: FormatterConfig) {
  return (value: number) => {
    // Форматирование с валютой
  };
}

// Использование в компонентах
const formatNumber = createNumberFormatter({
  locale: formData.locale,
  scale: formData.scaleLabels,
});
```

### 4.3 Конфигурация через JSON

```typescript
// Позволяет пользователям сохранять и переиспользовать конфигурации
export interface ChartPreset {
  name: string;
  description: string;
  vizType: string;
  formData: Partial<UniversalFormData>;
}

// Пример пресета для ARR Dashboard
const arrPreset: ChartPreset = {
  name: 'SaaS ARR Waterfall',
  description: 'Standard ARR breakdown for SaaS companies',
  vizType: 'metric_waterfall',
  formData: {
    steps: [
      { id: 'beginning', type: 'start', label: 'Beginning ARR' },
      { id: 'new', type: 'positive', label: 'New Business' },
      // ...
    ],
    currency: { code: 'USD', symbol: '$', position: 'before' },
  },
};
```

---

## 5. Миграционный план

### Фаза 1: Подготовка (1 неделя)
1. Создать универсальные типы в `src/utils/`
2. Создать форматтеры с поддержкой локализации
3. Добавить i18n для всех строк

### Фаза 2: Рефакторинг (2 недели)
1. Вынести захардкоженные значения в конфигурацию
2. Добавить новые control panel опции
3. Обновить transformProps для динамической конфигурации

### Фаза 3: Переименование (опционально)
1. Создать алиасы для обратной совместимости
2. Добавить deprecation warnings
3. Обновить документацию

### Фаза 4: Тестирование
1. Написать unit тесты
2. Создать интеграционные тесты
3. E2E тесты с Playwright

---

## 6. Пример полной универсализации

### До (SM24StatusFunnel)

```typescript
// Захардкоженная валюта
const formatAmount = (value: number) => {
  return `${formatted.value} ${formatted.unit} сум`;
};

// Захардкоженные entity types
const ENTITY_TYPES = {
  orders: { labelGenitive: 'заказов' },
  visits: { labelGenitive: 'визитов' },
};
```

### После (StatusCardFlow)

```typescript
// Конфигурируемая валюта
const formatAmount = (value: number) => {
  const { symbol, position } = formData.currencyConfig;
  const formatted = formatNumber(value);
  return position === 'before'
    ? `${symbol} ${formatted}`
    : `${formatted} ${symbol}`;
};

// Динамические entity types из Control Panel
const entityTypes = formData.availableEntityTypes || [
  {
    id: formData.entityConfig.type,
    config: formData.entityConfig,
  },
];
```

---

## 7. Checklist универсализации

Для каждого компонента проверить:

- [ ] Нет захардкоженных строк на конкретном языке
- [ ] Все magic numbers вынесены в конфигурацию
- [ ] Валюта настраивается через Control Panel
- [ ] Локаль форматирования настраивается
- [ ] Цвета настраиваются (не только через тему)
- [ ] Бизнес-термины заменены на универсальные
- [ ] Есть документация с примерами для разных use cases
- [ ] Созданы пресеты для типичных сценариев

---

## Заключение

Универсализация компонентов SM24 позволит:

1. **Использовать в других проектах** без модификации кода
2. **Локализовать** для любого языка и региона
3. **Адаптировать** под различные бизнес-модели
4. **Контрибьютить** в open-source Superset

При этом сохраняется возможность создавать специфичные пресеты для Smartup24 через конфигурацию.
