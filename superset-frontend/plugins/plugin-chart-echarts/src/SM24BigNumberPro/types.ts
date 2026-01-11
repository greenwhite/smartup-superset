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

import {
  ChartDataResponseResult,
  DataRecordValue,
  QueryFormData,
  QueryFormMetric,
  ValueFormatter,
  SimpleAdhocFilter,
} from '@superset-ui/core';
import { ColorFormatters } from '@superset-ui/chart-controls';
import { BaseChartProps, Refs } from '../types';

// =============================================================================
// NUMBER FORMATTING
// =============================================================================

/**
 * Number format presets for SM24-BigNumber
 */
export type SM24NumberFormatType =
  | 'integer'           // 1,234,567
  | 'decimal_1'         // 1,234,567.8
  | 'decimal_2'         // 1,234,567.89
  | 'thousands'         // 1,234.57K (тыс.)
  | 'millions'          // 1.23M (млн.)
  | 'billions'          // 1.23B (млрд.)
  | 'percent'           // 99.8%
  | 'percent_decimal'   // 99.80%
  | 'currency_uzs'      // 1,234,567 UZS
  | 'currency_usd'      // $1,234,567
  | 'smart'             // Auto-select based on value
  | 'custom';           // Custom D3 format

// =============================================================================
// TIME COMPARISON
// =============================================================================

/**
 * Supported time comparison periods
 */
export type TimeComparisonPeriod =
  | 'DoD'    // Day over Day
  | 'WoW'    // Week over Week
  | 'MoM'    // Month over Month
  | 'QoQ'    // Quarter over Quarter
  | 'YoY'    // Year over Year
  | 'custom' // Custom offset
  | 'none';  // No comparison

/**
 * Time comparison shift values mapping
 */
export const TIME_COMPARISON_SHIFTS: Record<TimeComparisonPeriod, string> = {
  DoD: '1 day ago',
  WoW: '1 week ago',
  MoM: '1 month ago',
  QoQ: '3 months ago',  // Approximately one quarter
  YoY: '1 year ago',
  custom: 'custom',
  none: '',
};

/**
 * Time comparison display labels
 */
export const TIME_COMPARISON_LABELS: Record<TimeComparisonPeriod, string> = {
  DoD: 'vs Yesterday',
  WoW: 'vs Last Week',
  MoM: 'vs Last Month',
  QoQ: 'vs Last Quarter',
  YoY: 'vs Last Year',
  custom: 'vs Custom Period',
  none: '',
};

/**
 * Comparison result data
 */
export interface ComparisonData {
  currentValue: number | null;
  previousValue: number | null;
  absoluteDifference: number | null;
  percentDifference: number | null;
  trend: 'up' | 'down' | 'neutral';
}

// =============================================================================
// SPARKLINE
// =============================================================================

/**
 * Sparkline configuration
 */
export interface SparklineConfig {
  enabled: boolean;
  type: 'line' | 'bar' | 'area';
  color?: string;
  height?: number;
  showPoints?: boolean;
  fillOpacity?: number;
}

/**
 * Sparkline data point
 */
export interface SparklineDataPoint {
  timestamp: number | string;
  value: number | null;
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

/**
 * Progress bar configuration
 */
export interface ProgressBarConfig {
  enabled: boolean;
  targetValue: number;
  showTarget: boolean;
  showPercentage: boolean;
  colorBelowTarget?: string;
  colorAboveTarget?: string;
  height?: number;
}

// =============================================================================
// ALERTS
// =============================================================================

/**
 * Alert threshold configuration
 */
export interface AlertThreshold {
  id: string;
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=';
  value: number;
  color: string;
  icon?: 'warning' | 'error' | 'success' | 'info';
  message?: string;
}

/**
 * Active alert state
 */
export interface ActiveAlert {
  threshold: AlertThreshold;
  triggered: boolean;
}

// =============================================================================
// CONDITIONAL FORMATTING
// =============================================================================

/**
 * Conditional formatting rule for color coding values
 */
export interface ConditionalFormattingRule {
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=' | 'between';
  targetValue: number;
  targetValueUpper?: number; // For 'between' operator
  color: { r: number; g: number; b: number; a: number };
}

// =============================================================================
// CURRENCY FORMAT
// =============================================================================

/**
 * Currency format configuration
 */
export interface CurrencyFormatConfig {
  symbol: string;           // '$', '€', 'сум', '₽'
  symbolPosition: 'prefix' | 'suffix';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

// =============================================================================
// FORM DATA
// =============================================================================

/**
 * Form data for SM24-BigNumber visualization
 */
export type SM24BigNumberProFormData = QueryFormData & {
  metric?: QueryFormMetric;

  // Display options
  headerFontSize?: number;
  subtitleFontSize?: number;
  metricNameFontSize?: number;
  showMetricName?: boolean;
  subtitle?: string;

  // Number formatting
  numberFormatType?: SM24NumberFormatType;
  customNumberFormat?: string;
  numberPrefix?: string;
  numberSuffix?: string;
  decimalPlaces?: number;
  useGrouping?: boolean;

  // Localization
  numberLocale?: 'en' | 'ru' | 'uz';

  // Color thresholds
  defaultColor?: { r: number; g: number; b: number; a: number };
  conditionalFormatting?: ConditionalFormattingRule[];

  // Time comparison
  timeComparisonEnabled?: boolean;
  timeComparisonPeriod?: TimeComparisonPeriod;
  customTimeOffset?: string;
  comparisonColorEnabled?: boolean;
  comparisonColorScheme?: 'green_up' | 'red_up'; // green_up = green for increase
  showPreviousValue?: boolean;
  showAbsoluteDifference?: boolean;
  showPercentDifference?: boolean;

  // Sparkline
  sparklineEnabled?: boolean;
  sparklineType?: 'line' | 'bar' | 'area';
  sparklineColor?: string;
  sparklineHeight?: number;
  sparklineGranularity?: string;
  sparklinePeriods?: number;

  // Progress bar
  progressBarEnabled?: boolean;
  progressBarTarget?: number;
  progressBarShowTarget?: boolean;
  progressBarShowPercentage?: boolean;
  progressBarColorBelow?: string;
  progressBarColorAbove?: string;

  // Alerts
  alertsEnabled?: boolean;
  alertThresholds?: AlertThreshold[];

  // Animation
  animationEnabled?: boolean;
  animationDuration?: number;

  // Currency
  currencyFormat?: CurrencyFormatConfig;
  yAxisFormat?: string;

  // Time filter for comparison
  time_compare?: string[];
  start_date_offset?: string;
};

// =============================================================================
// CHART DATA
// =============================================================================

/**
 * Data structure from query response
 */
export interface SM24BigNumberProDatum {
  [key: string]: number | string | null;
}

/**
 * Query response for SM24-BigNumber
 */
export interface SM24BigNumberProChartDataResponseResult extends ChartDataResponseResult {
  data: SM24BigNumberProDatum[];
}

/**
 * Chart props passed to the plugin
 */
export type SM24BigNumberProChartProps = BaseChartProps<SM24BigNumberProFormData> & {
  formData: SM24BigNumberProFormData;
  queriesData: SM24BigNumberProChartDataResponseResult[];
};

// =============================================================================
// VISUALIZATION PROPS
// =============================================================================

/**
 * Props for the visualization component
 */
export interface SM24BigNumberProVizProps {
  className?: string;
  width: number;
  height: number;

  // Main data
  bigNumber?: DataRecordValue;
  metricName?: string;

  // Display
  showMetricName?: boolean;
  subtitle?: string;

  // Font sizes (as proportion of container height)
  headerFontSize: number;
  subtitleFontSize: number;
  metricNameFontSize?: number;

  // Formatting
  headerFormatter: (value: number) => string;

  // Colors
  numberColor?: string;
  colorThresholdFormatters?: ColorFormatters;

  // Comparison
  comparisonData?: ComparisonData;
  comparisonLabel?: string;
  comparisonColorEnabled?: boolean;
  comparisonColorScheme?: 'green_up' | 'red_up';
  showPreviousValue?: boolean;
  showAbsoluteDifference?: boolean;
  showPercentDifference?: boolean;

  // Sparkline
  sparklineData?: SparklineDataPoint[];
  sparklineConfig?: SparklineConfig;

  // Progress bar
  progressBarConfig?: ProgressBarConfig;
  currentProgress?: number;

  // Alerts
  activeAlerts?: ActiveAlert[];

  // Animation
  animationEnabled?: boolean;
  animationDuration?: number;

  // Interaction
  onContextMenu?: (
    clientX: number,
    clientY: number,
  ) => void;

  refs: Refs;
}

// =============================================================================
// LOCALE CONFIGURATION
// =============================================================================

/**
 * Locale configuration for number formatting
 */
export interface SM24NumberLocale {
  decimal: string;
  thousands: string;
  grouping: number[];
  currency: [string, string];
  shortScale: {
    thousands: string;
    millions: string;
    billions: string;
    trillions: string;
  };
}

/**
 * Predefined locales for Smartup24
 */
export const SM24_LOCALES: Record<string, SM24NumberLocale> = {
  en: {
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', ''],
    shortScale: {
      thousands: 'K',
      millions: 'M',
      billions: 'B',
      trillions: 'T',
    },
  },
  ru: {
    decimal: ',',
    thousands: ' ',
    grouping: [3],
    currency: ['', ' ₽'],
    shortScale: {
      thousands: 'тыс.',
      millions: 'млн.',
      billions: 'млрд.',
      trillions: 'трлн.',
    },
  },
  uz: {
    decimal: ',',
    thousands: ' ',
    grouping: [3],
    currency: ['', ' сўм'],
    shortScale: {
      thousands: 'минг',
      millions: 'млн.',
      billions: 'млрд.',
      trillions: 'трлн.',
    },
  },
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Color scheme for comparison indicators
 */
export enum ComparisonColorScheme {
  GreenUp = 'green_up',   // Green for positive, red for negative
  RedUp = 'red_up',       // Red for positive, green for negative (e.g., costs)
}

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Calculate trend direction from percentage difference
 */
export function getTrendDirection(percentDiff: number | null): TrendDirection {
  if (percentDiff === null || percentDiff === 0) return 'neutral';
  return percentDiff > 0 ? 'up' : 'down';
}

/**
 * Get trend color based on direction and color scheme
 */
export function getTrendColor(
  trend: TrendDirection,
  scheme: ComparisonColorScheme,
  theme: { colorSuccess: string; colorError: string; colorTextTertiary: string },
): string {
  if (trend === 'neutral') return theme.colorTextTertiary;

  const isPositive = trend === 'up';
  const greenForPositive = scheme === ComparisonColorScheme.GreenUp;

  if (isPositive) {
    return greenForPositive ? theme.colorSuccess : theme.colorError;
  }
  return greenForPositive ? theme.colorError : theme.colorSuccess;
}
