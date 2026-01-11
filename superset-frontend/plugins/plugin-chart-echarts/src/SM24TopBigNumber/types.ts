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
} from '@superset-ui/core';
import { BaseChartProps, Refs } from '../types';

// =============================================================================
// METRIC CARD TYPES
// =============================================================================

/**
 * Single metric card data
 */
export interface MetricCardData {
  id: string;
  label: string;
  value: number | null;
  formattedValue: string;
  previousValue: number | null;
  percentChange: number | null;
  trend: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
  color?: string;
}

/**
 * Sparkline configuration for metric cards
 */
export interface SparklineConfig {
  enabled: boolean;
  color?: string;
  height: number;
  showArea: boolean;
}

/**
 * Layout options for the top block
 */
export type TopBlockLayout = 'auto' | 'horizontal' | 'grid';

/**
 * Number format type
 */
export type SM24NumberFormat =
  | 'smart'
  | 'integer'
  | 'decimal_1'
  | 'decimal_2'
  | 'thousands'
  | 'millions'
  | 'billions'
  | 'percent'
  | 'custom';

// =============================================================================
// FORM DATA
// =============================================================================

/**
 * Form data for SM24-TopBlock visualization
 */
export type SM24TopBigNumberFormData = QueryFormData & {
  // Metrics (multiple)
  metrics?: QueryFormMetric[];

  // Layout
  layout?: TopBlockLayout;
  columnsCount?: number;
  cardMinWidth?: number;
  cardMaxWidth?: number;
  cardGap?: number;

  // Display
  showMetricName?: boolean;
  showSparkline?: boolean;
  showComparison?: boolean;
  cardBorderRadius?: number;
  cardPadding?: number;
  cardShadow?: boolean;

  // Number formatting
  numberFormat?: SM24NumberFormat;
  customNumberFormat?: string;
  numberLocale?: 'en' | 'ru' | 'uz';

  // Comparison
  timeComparisonEnabled?: boolean;
  timeComparisonPeriod?: 'DoD' | 'WoW' | 'MoM' | 'QoQ' | 'YoY' | 'custom' | 'none';
  customTimeOffset?: string;
  comparisonColorScheme?: 'green_up' | 'red_up';

  // Sparkline
  sparklineEnabled?: boolean;
  sparklineHeight?: number;
  sparklineColor?: string;
  sparklinePeriods?: number;

  // Colors
  headerColor?: string;
  valueColor?: string;
  cardBackground?: string;

  // Responsive
  responsiveBreakpoint?: number;
};

// =============================================================================
// CHART DATA
// =============================================================================

/**
 * Data structure from query response
 */
export interface SM24TopBigNumberDatum {
  [key: string]: DataRecordValue;
}

/**
 * Query response for SM24-TopBlock
 */
export interface SM24TopBigNumberChartDataResponseResult extends ChartDataResponseResult {
  data: SM24TopBigNumberDatum[];
}

/**
 * Chart props passed to the plugin
 */
export type SM24TopBigNumberChartProps = BaseChartProps<SM24TopBigNumberFormData> & {
  formData: SM24TopBigNumberFormData;
  queriesData: SM24TopBigNumberChartDataResponseResult[];
};

// =============================================================================
// VISUALIZATION PROPS
// =============================================================================

/**
 * Props for the visualization component
 */
export interface SM24TopBigNumberVizProps {
  className?: string;
  width: number;
  height: number;

  // Metric cards data
  metricCards: MetricCardData[];

  // Layout
  layout: TopBlockLayout;
  columnsCount: number;
  cardMinWidth: number;
  cardMaxWidth: number;
  cardGap: number;

  // Display options
  showMetricName: boolean;
  showSparkline: boolean;
  showComparison: boolean;
  cardBorderRadius: number;
  cardPadding: number;
  cardShadow: boolean;

  // Colors
  headerColor?: string;
  valueColor?: string;
  cardBackground?: string;

  // Comparison
  comparisonColorScheme: 'green_up' | 'red_up';

  // Sparkline config
  sparklineConfig: SparklineConfig;

  // Formatter
  formatValue: (value: number) => string;

  // Interaction
  onCardClick?: (metricId: string) => void;

  refs: Refs;
}

// =============================================================================
// LOCALE CONFIGURATION
// =============================================================================

/**
 * Locale configuration for number formatting
 */
export interface SM24TopBigNumberLocale {
  decimal: string;
  thousands: string;
  shortScale: {
    thousands: string;
    millions: string;
    billions: string;
  };
}

/**
 * Predefined locales
 */
export const SM24_TOPBLOCK_LOCALES: Record<string, SM24TopBigNumberLocale> = {
  en: {
    decimal: '.',
    thousands: ',',
    shortScale: {
      thousands: 'K',
      millions: 'M',
      billions: 'B',
    },
  },
  ru: {
    decimal: ',',
    thousands: ' ',
    shortScale: {
      thousands: 'тыс.',
      millions: 'млн.',
      billions: 'млрд.',
    },
  },
  uz: {
    decimal: ',',
    thousands: ' ',
    shortScale: {
      thousands: 'минг',
      millions: 'млн.',
      billions: 'млрд.',
    },
  },
};

// =============================================================================
// TIME COMPARISON
// =============================================================================

/**
 * Time comparison periods
 */
export const TIME_COMPARISON_SHIFTS: Record<string, string> = {
  DoD: '1 day ago',
  WoW: '1 week ago',
  MoM: '1 month ago',
  QoQ: '3 months ago',
  YoY: '1 year ago',
  none: '',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate trend direction from percentage difference
 */
export function getTrendDirection(percentDiff: number | null): 'up' | 'down' | 'neutral' {
  if (percentDiff === null || percentDiff === 0) return 'neutral';
  return percentDiff > 0 ? 'up' : 'down';
}

/**
 * Get trend color based on direction and color scheme
 */
export function getTrendColor(
  trend: 'up' | 'down' | 'neutral',
  scheme: 'green_up' | 'red_up',
  colors: { success: string; error: string; neutral: string },
): string {
  if (trend === 'neutral') return colors.neutral;

  const isPositive = trend === 'up';
  const greenForPositive = scheme === 'green_up';

  if (isPositive) {
    return greenForPositive ? colors.success : colors.error;
  }
  return greenForPositive ? colors.error : colors.success;
}
