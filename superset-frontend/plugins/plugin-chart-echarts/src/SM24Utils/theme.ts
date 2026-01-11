/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { SM24_COLORS, ARR_COLORS, HEALTH_COLORS, RISK_COLORS, SEGMENT_COLORS } from './colors';

/**
 * SM24 Theme Configuration
 *
 * This file defines the complete SM24 (Smartup24) theme that integrates with
 * Apache Superset's theme system while providing domain-specific color palettes
 * for SaaS business metrics visualization.
 */

// =============================================================================
// THEME TOKENS
// =============================================================================

/**
 * SM24 Theme Token Configuration
 * Compatible with Ant Design 5.x token system
 */
export const SM24_THEME_TOKENS = {
  // Primary brand colors
  colorPrimary: SM24_COLORS.primary,
  colorSuccess: SM24_COLORS.success,
  colorWarning: SM24_COLORS.warning,
  colorError: SM24_COLORS.error,
  colorInfo: SM24_COLORS.info,

  // Background colors
  colorBgContainer: '#FFFFFF',
  colorBgLayout: '#F8F9FA',
  colorBgElevated: '#FFFFFF',
  colorBgSpotlight: SM24_COLORS.neutral100,

  // Border colors
  colorBorder: SM24_COLORS.neutral300,
  colorBorderSecondary: SM24_COLORS.neutral200,

  // Text colors
  colorText: SM24_COLORS.neutral900,
  colorTextSecondary: SM24_COLORS.neutral600,
  colorTextTertiary: SM24_COLORS.neutral500,
  colorTextQuaternary: SM24_COLORS.neutral400,

  // Border radius
  borderRadius: 6,
  borderRadiusLG: 8,
  borderRadiusSM: 4,

  // Font
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeXL: 20,

  // Line height
  lineHeight: 1.5714285714285714,

  // Control heights
  controlHeight: 32,
  controlHeightLG: 40,
  controlHeightSM: 24,

  // Motion
  motionDurationFast: '0.1s',
  motionDurationMid: '0.2s',
  motionDurationSlow: '0.3s',
} as const;

// =============================================================================
// SEMANTIC THEME COLORS
// =============================================================================

/**
 * SM24 Semantic Colors
 * Domain-specific colors for business metrics
 */
export const SM24_SEMANTIC_COLORS = {
  // ARR & Revenue
  revenue: {
    total: ARR_COLORS.totalARR,
    newBusiness: ARR_COLORS.newBusiness,
    expansion: ARR_COLORS.expansion,
    contraction: ARR_COLORS.contraction,
    churned: ARR_COLORS.churned,
    target: ARR_COLORS.target,
    projection: ARR_COLORS.projection,
  },

  // Customer Health
  health: {
    excellent: HEALTH_COLORS.excellent,
    good: HEALTH_COLORS.good,
    warning: HEALTH_COLORS.warning,
    critical: HEALTH_COLORS.critical,
  },

  // Churn Risk
  risk: {
    critical: RISK_COLORS.critical,
    high: RISK_COLORS.high,
    medium: RISK_COLORS.medium,
    low: RISK_COLORS.low,
    none: RISK_COLORS.none,
  },

  // Customer Segments
  segment: {
    strategic: SEGMENT_COLORS.strategic,
    key: SEGMENT_COLORS.key,
    core: SEGMENT_COLORS.core,
    growth: SEGMENT_COLORS.growth,
    starter: SEGMENT_COLORS.starter,
  },

  // Trends
  trend: {
    positive: SM24_COLORS.success,
    negative: SM24_COLORS.error,
    neutral: SM24_COLORS.neutral500,
  },

  // Status
  status: {
    active: SM24_COLORS.success,
    pending: SM24_COLORS.warning,
    inactive: SM24_COLORS.neutral500,
    cancelled: SM24_COLORS.error,
  },
} as const;

// =============================================================================
// DARK MODE TOKENS
// =============================================================================

/**
 * SM24 Dark Mode Theme Tokens
 */
export const SM24_DARK_THEME_TOKENS = {
  ...SM24_THEME_TOKENS,

  // Background colors (dark)
  colorBgContainer: '#1F1F1F',
  colorBgLayout: '#141414',
  colorBgElevated: '#262626',
  colorBgSpotlight: '#262626',

  // Border colors (dark)
  colorBorder: '#434343',
  colorBorderSecondary: '#303030',

  // Text colors (dark)
  colorText: 'rgba(255, 255, 255, 0.85)',
  colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
  colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
  colorTextQuaternary: 'rgba(255, 255, 255, 0.25)',
} as const;

// =============================================================================
// CHART THEME
// =============================================================================

/**
 * SM24 ECharts Theme Configuration
 */
export const SM24_ECHARTS_THEME = {
  color: [
    SM24_COLORS.primary,
    SM24_COLORS.success,
    SM24_COLORS.accent,
    SM24_COLORS.warning,
    SM24_COLORS.error,
    '#16A085',
    '#2C3E50',
    '#E67E22',
    '#1ABC9C',
    '#8E44AD',
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: SM24_THEME_TOKENS.fontFamily,
  },
  title: {
    textStyle: {
      color: SM24_COLORS.neutral800,
      fontSize: 16,
      fontWeight: 600,
    },
    subtextStyle: {
      color: SM24_COLORS.neutral600,
      fontSize: 12,
    },
  },
  legend: {
    textStyle: {
      color: SM24_COLORS.neutral700,
    },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: SM24_COLORS.neutral300,
    borderWidth: 1,
    textStyle: {
      color: SM24_COLORS.neutral800,
    },
  },
  axisPointer: {
    lineStyle: {
      color: SM24_COLORS.neutral400,
    },
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: SM24_COLORS.neutral300,
      },
    },
    axisTick: {
      lineStyle: {
        color: SM24_COLORS.neutral300,
      },
    },
    axisLabel: {
      color: SM24_COLORS.neutral600,
    },
    splitLine: {
      lineStyle: {
        color: SM24_COLORS.neutral200,
      },
    },
  },
  yAxis: {
    axisLine: {
      lineStyle: {
        color: SM24_COLORS.neutral300,
      },
    },
    axisTick: {
      lineStyle: {
        color: SM24_COLORS.neutral300,
      },
    },
    axisLabel: {
      color: SM24_COLORS.neutral600,
    },
    splitLine: {
      lineStyle: {
        color: SM24_COLORS.neutral200,
      },
    },
  },
  line: {
    symbol: 'circle',
    symbolSize: 6,
    smooth: false,
    lineStyle: {
      width: 2,
    },
  },
  bar: {
    barMaxWidth: 50,
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
    },
  },
} as const;

// =============================================================================
// THEME UTILITIES
// =============================================================================

/**
 * Get theme color with fallback
 */
export function getThemeColor(
  theme: { colors?: Record<string, Record<string, string>> } | undefined,
  category: keyof typeof SM24_SEMANTIC_COLORS,
  key: string,
  fallback: string,
): string {
  // Try to get from Superset theme
  if (theme?.colors) {
    const categoryColors = theme.colors[category];
    if (categoryColors?.[key]) {
      return categoryColors[key];
    }
  }

  // Fallback to SM24 semantic colors
  const sm24Category = SM24_SEMANTIC_COLORS[category] as Record<string, string>;
  if (sm24Category?.[key]) {
    return sm24Category[key];
  }

  // Return provided fallback
  return fallback;
}

/**
 * Create SM24 styled-components theme context
 */
export function createSM24ThemeContext(isDarkMode: boolean = false) {
  const tokens = isDarkMode ? SM24_DARK_THEME_TOKENS : SM24_THEME_TOKENS;

  return {
    ...tokens,
    semantic: SM24_SEMANTIC_COLORS,
    charts: SM24_ECHARTS_THEME,
    isDarkMode,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export type SM24ThemeTokens = typeof SM24_THEME_TOKENS;
export type SM24SemanticColors = typeof SM24_SEMANTIC_COLORS;
export type SM24EChartsTheme = typeof SM24_ECHARTS_THEME;
