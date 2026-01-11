# SM24 Theme System Guide

## Overview

SM24 использует гибридную систему тем, интегрированную с Apache Superset:
- **Core Theme** - Ant Design 5.x токены через @superset-ui/core
- **Semantic Colors** - Доменно-специфичные цвета для SaaS-метрик
- **ECharts Theme** - Конфигурация для графиков

## Architecture

```
SM24 Theme System
├── SM24Utils/theme.ts           # Основная конфигурация
├── SM24Utils/colors.ts          # Цветовые палитры
├── Superset Core Theme          # @superset-ui/core useTheme()
└── Ant Design Tokens            # colorPrimary, colorSuccess, etc.
```

## Theme Tokens

### Primary Tokens

```typescript
import { SM24_THEME_TOKENS } from '../SM24Utils';

// Core colors
SM24_THEME_TOKENS.colorPrimary    // #2E86DE - Blue
SM24_THEME_TOKENS.colorSuccess    // #27AE60 - Green
SM24_THEME_TOKENS.colorWarning    // #F39C12 - Orange
SM24_THEME_TOKENS.colorError      // #E74C3C - Red
SM24_THEME_TOKENS.colorInfo       // #3498DB - Light Blue

// Typography
SM24_THEME_TOKENS.fontFamily      // Inter, system fonts
SM24_THEME_TOKENS.fontSize        // 14px base
SM24_THEME_TOKENS.borderRadius    // 6px default

// Spacing
SM24_THEME_TOKENS.controlHeight   // 32px
```

### Semantic Colors

```typescript
import { SM24_SEMANTIC_COLORS } from '../SM24Utils';

// Revenue colors
SM24_SEMANTIC_COLORS.revenue.total        // #2E86DE
SM24_SEMANTIC_COLORS.revenue.newBusiness  // #27AE60
SM24_SEMANTIC_COLORS.revenue.churned      // #E74C3C

// Health colors
SM24_SEMANTIC_COLORS.health.excellent     // #27AE60
SM24_SEMANTIC_COLORS.health.warning       // #E67E22
SM24_SEMANTIC_COLORS.health.critical      // #E74C3C

// Risk colors
SM24_SEMANTIC_COLORS.risk.critical        // #C0392B
SM24_SEMANTIC_COLORS.risk.high            // #E74C3C
SM24_SEMANTIC_COLORS.risk.low             // #F1C40F

// Segment colors
SM24_SEMANTIC_COLORS.segment.strategic    // #8E44AD
SM24_SEMANTIC_COLORS.segment.key          // #2980B9
SM24_SEMANTIC_COLORS.segment.core         // #27AE60
```

## Usage in Components

### Using Superset Theme Hook

```typescript
import { useTheme } from '@superset-ui/core';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Container>
      <Text color={theme.colors.text.label}>
        Using theme token
      </Text>
    </Container>
  );
};
```

### Using SM24 Colors

```typescript
import { 
  SM24_COLORS, 
  HEALTH_COLORS, 
  getHealthColor 
} from '../SM24Utils';

// Direct usage
const primaryColor = SM24_COLORS.primary;

// Utility function
const healthColor = getHealthColor('excellent'); // #27AE60
```

### Styled Components Integration

```typescript
import { styled, css } from '@superset-ui/core';

const Container = styled.div`
  // Using theme prop
  background: ${({ theme }) => theme.colors.grayscale.light5};
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light3};
  font-family: ${({ theme }) => theme.typography?.families?.sansSerif};
  
  // Using SM24 colors (imported)
  color: ${SM24_COLORS.neutral800};
`;
```

## Color Palettes

### SM24 Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| primary | #2E86DE | Main actions, links |
| secondary | #27AE60 | Success, positive |
| accent | #9B59B6 | Highlights |
| success | #27AE60 | Positive metrics |
| warning | #F39C12 | Warnings, caution |
| error | #E74C3C | Errors, negative |
| info | #3498DB | Informational |

### ARR Color Scheme

| Token | Hex | Usage |
|-------|-----|-------|
| totalARR | #2E86DE | Main ARR line |
| newBusiness | #27AE60 | New revenue |
| expansion | #A8E6CF | Expansion |
| contraction | #F39C12 | Downgrades |
| churned | #E74C3C | Lost revenue |
| target | #9B59B6 | Target line |
| projection | #95A5A6 | Projections |

### Health Score Colors

| Level | Hex | Range |
|-------|-----|-------|
| excellent | #27AE60 | 80-100 |
| good | #F1C40F | 60-79 |
| warning | #E67E22 | 40-59 |
| critical | #E74C3C | 0-39 |

### Churn Risk Colors

| Level | Hex | Range |
|-------|-----|-------|
| critical | #C0392B | 80-100 |
| high | #E74C3C | 60-79 |
| medium | #F39C12 | 40-59 |
| low | #F1C40F | 20-39 |
| none | #27AE60 | 0-19 |

## Dark Mode Support

```typescript
import { SM24_DARK_THEME_TOKENS } from '../SM24Utils';

// Dark mode colors automatically adjust backgrounds
SM24_DARK_THEME_TOKENS.colorBgContainer  // #1F1F1F
SM24_DARK_THEME_TOKENS.colorBgLayout     // #141414
SM24_DARK_THEME_TOKENS.colorText         // rgba(255,255,255,0.85)
```

### Using in Components

```typescript
import { createSM24ThemeContext } from '../SM24Utils';

const theme = createSM24ThemeContext(isDarkMode);
// theme.isDarkMode - boolean flag
// theme.semantic - SM24_SEMANTIC_COLORS
// theme.charts - SM24_ECHARTS_THEME
```

## ECharts Theme

```typescript
import { SM24_ECHARTS_THEME } from '../SM24Utils';

// Apply to ECharts instance
echarts.registerTheme('sm24', SM24_ECHARTS_THEME);

// Use in component
<EChartsReact 
  option={option}
  theme="sm24"
/>
```

### Chart Colors

```typescript
SM24_ECHARTS_THEME.color // Array of 10 chart colors
// ['#2E86DE', '#27AE60', '#9B59B6', '#F39C12', '#E74C3C', ...]
```

## Best Practices

### DO ✅

```typescript
// Use theme tokens
background: ${({ theme }) => theme.colors.grayscale.light4};

// Use SM24 semantic colors for business logic
const healthColor = getHealthColor(healthLevel);

// Use theme-aware styled components
const StyledBox = styled.div`
  border-color: ${({ theme }) => theme.colors.grayscale.light3};
`;
```

### DON'T ❌

```typescript
// Don't hardcode colors
background: #f8f9fa;  // ❌ Use theme token instead

// Don't mix approaches inconsistently
color: #3498db;  // ❌ Use SM24_COLORS.primary
```

## Migration Guide

### From Hardcoded to Theme

**Before**:
```typescript
const Container = styled.div`
  background: #fff;
  border: 1px solid #eee;
  color: #2c3e50;
`;
```

**After**:
```typescript
import { SM24_COLORS } from '../SM24Utils';

const Container = styled.div`
  background: ${({ theme }) => theme.colors.grayscale.light5};
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light3};
  color: ${SM24_COLORS.neutral800};
`;
```

## Theme Configuration File

Full theme configuration available at:
```
superset-frontend/plugins/plugin-chart-echarts/src/SM24Utils/theme.ts
```

Exports:
- `SM24_THEME_TOKENS` - Light mode tokens
- `SM24_DARK_THEME_TOKENS` - Dark mode tokens
- `SM24_SEMANTIC_COLORS` - Domain-specific colors
- `SM24_ECHARTS_THEME` - Chart theming
- `getThemeColor()` - Color accessor
- `createSM24ThemeContext()` - Theme context factory

## Customization

### Override Colors

```typescript
// In your component
import { SM24_SEMANTIC_COLORS } from '../SM24Utils';

const customColors = {
  ...SM24_SEMANTIC_COLORS,
  health: {
    ...SM24_SEMANTIC_COLORS.health,
    excellent: '#00FF00', // Custom green
  },
};
```

### Extend Theme

```typescript
import { SM24_THEME_TOKENS } from '../SM24Utils';

const extendedTokens = {
  ...SM24_THEME_TOKENS,
  colorPrimary: '#FF0000', // Custom primary
  customToken: '#123456',  // New token
};
```
