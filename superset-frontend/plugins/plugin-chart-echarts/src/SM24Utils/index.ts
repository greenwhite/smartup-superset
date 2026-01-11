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

/**
 * SM24Utils - Shared utility module for SM24 visualization components
 *
 * This module consolidates common functionality used across SM24 components:
 * - Types: Shared TypeScript interfaces and types
 * - Locales: Currency configs, scale labels, number locales
 * - Formatting: Number, currency, percentage, date formatting
 * - Colors: Color palettes, trend colors, status colors
 * - Comparison: Trend calculations, ARR metrics, risk assessment
 *
 * Usage:
 * ```typescript
 * import {
 *   formatFullAmount,
 *   getTrendColor,
 *   calculateComparison,
 *   CurrencyConfig,
 * } from '../SM24Utils';
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export {
  // Trend & Comparison types
  TrendDirection,
  ComparisonColorScheme,
  TimeComparisonPeriod,
  ComparisonData,

  // Currency & Locale types
  CurrencyConfig,
  ScaleLabels,
  SM24NumberLocale,
  SM24ARRLocale,
  SM24LocaleCode,

  // Theme types
  ThemeColors,

  // Health & Risk types
  HealthLevel,
  RiskLevel,
  CustomerSegment,

  // Growth threshold
  GrowthThreshold,
} from './types';

// =============================================================================
// LOCALES
// =============================================================================

export {
  // Currency configs
  DEFAULT_CURRENCY_CONFIGS,
  getCurrencyConfig,

  // Scale labels
  DEFAULT_SCALE_LABELS,
  getScaleLabels,

  // Number locales
  SM24_NUMBER_LOCALES,
  getNumberLocale,

  // ARR locales
  SM24_ARR_LOCALES,
  getARRLocale,

  // Time comparison labels
  TIME_COMPARISON_SHIFTS,
  TIME_COMPARISON_LABELS,
  TIME_COMPARISON_LABELS_LOCALIZED,
  getTimeComparisonLabel,

  // Locale utilities
  normalizeLocale,
  getIntlLocale,
} from './locales';

// =============================================================================
// FORMATTING
// =============================================================================

export {
  // Types
  ScaleUnit,
  FormattedAmount,

  // Number formatting
  formatCount,
  formatAmount,
  formatFullAmount,
  formatARRValue,
  formatNumber,
  formatSmartNumber,

  // Percentage formatting
  formatPercent,
  formatGrowthPercent,

  // Date & Time formatting
  formatTenure,
  formatDaysAgo,
  daysUntil,
  daysSince,

  // Formatter factories
  createCurrencyFormatter,
  createPercentFormatter,
  createCountFormatter,
} from './formatting';

// =============================================================================
// COLORS
// =============================================================================

export {
  // Core palettes
  SM24_COLORS,
  ARR_COLORS,
  GROWTH_COLORS,

  // Status colors
  DEFAULT_STATUS_COLORS,
  FALLBACK_STATUS_COLORS,

  // Health & Risk colors
  HEALTH_COLORS,
  RISK_COLORS,
  SEGMENT_COLORS,
  PRODUCT_COLORS,

  // Trend color utilities
  getTrendColor,
  getGrowthColor,

  // Status color utilities
  getStatusColor,

  // Color transformations
  getTintedBackground,
  lightenColor,
  darkenColor,
  isLightColor,
  getContrastTextColor,

  // Health & Risk color getters
  getHealthColor,
  getRiskColor,
  getSegmentColor,
  getProductColor,

  // Chart colors
  generateColorScale,
} from './colors';

// =============================================================================
// THEME
// =============================================================================

export {
  // Theme tokens
  SM24_THEME_TOKENS,
  SM24_DARK_THEME_TOKENS,

  // Semantic colors
  SM24_SEMANTIC_COLORS,

  // ECharts theme
  SM24_ECHARTS_THEME,

  // Theme utilities
  getThemeColor,
  createSM24ThemeContext,

  // Theme types
  SM24ThemeTokens,
  SM24SemanticColors,
  SM24EChartsTheme,
} from './theme';

// =============================================================================
// COMPARISON
// =============================================================================

export {
  // Trend calculations
  getTrendDirection,
  getTrendIcon,

  // Comparison calculations
  calculateComparison,
  calculateMoMGrowth,
  calculateYoYGrowth,

  // ARR metrics
  calculateNetNewARR,
  calculateQuickRatio,
  calculateGRR,
  calculateNRR,

  // Health & Risk calculations
  getHealthLevel,
  calculateRiskLevel,
  getCustomerSegment,
  isExpansionCandidate,

  // Projection types and utilities
  ARRProjectionPoint,
  generateProjection,
  monthsToTarget,

  // Threshold checks
  meetsThreshold,
} from './comparison';
