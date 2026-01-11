# SM24-BigNumber

> Расширенный компонент Big Number с трендом, сравнениями и прогресс-баром

## Обзор

SM24-BigNumber — это улучшенная версия стандартного BigNumber с дополнительными функциями:
- Sparkline тренд
- YoY/MoM сравнения
- Прогресс-бар к таргету
- Гибкое форматирование чисел
- Мультилокальность (RU/EN/UZ)

## Скриншот

```
┌─────────────────────────────────┐
│  Revenue                        │
│  ▇▇▆▅▇█▇▆▇█ (sparkline)        │
│                                 │
│  1.2 млрд сум                   │
│  ↑ +15.3% vs LY                 │
│                                 │
│  ████████░░ 78% of target       │
│  Target: 1.5 млрд               │
└─────────────────────────────────┘
```

## Регистрация

- **VizType**: `sm24_big_number`
- **Категория**: KPI
- **Behaviors**: DrillToDetail

## Control Panel

### Секция: Query

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| Metric | MetricsControl | — | Основная метрика |
| Time Grain | SelectControl | month | Грануляция времени |
| Time Comparison | SelectControl | — | Период сравнения |

### Секция: Display

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| Show Trend | Checkbox | true | Показать sparkline |
| Show Comparison | Checkbox | true | Показать сравнение |
| Show Progress | Checkbox | false | Показать прогресс-бар |
| Target Value | Number | — | Целевое значение |

### Секция: Formatting

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| Number Format | Text | `,.0f` | D3 формат |
| Currency | Select | UZS | Код валюты |
| Auto Scale | Checkbox | true | K/M/B масштаб |
| Locale | Select | ru-RU | Локаль форматирования |

### Секция: Comparison

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| Comparison Type | Select | period | Тип сравнения |
| Positive Color | Color | #2ECC71 | Цвет роста |
| Negative Color | Color | #E74C3C | Цвет падения |

## Файловая структура

```
SM24BigNumber/
├── index.ts           # 67 строк - Plugin registration
├── types.ts           # 441 строк - Type definitions
├── controlPanel.tsx   # 603 строк - Control panel config
├── buildQuery.ts      # 54 строк - Query construction
├── transformProps.ts  # 500 строк - Data transformation
└── SM24BigNumberViz.tsx  # 602 строк - React component
```

## SQL Dataset

```sql
SELECT
  DATE_TRUNC('month', created_at) as __timestamp,
  SUM(total_amount) as revenue
FROM orders
WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY 1
ORDER BY 1
```

## Известные issues

1. ⚠️ 3 использования `any` type (см. AUDIT-REPORT.md)
2. ⚠️ Отсутствуют тесты

## Связанные компоненты

- [SM24-TopBigNumber](./SM24-TopBigNumber.md) — мульти-KPI версия
- BigNumber (стандартный Superset) — базовый компонент
