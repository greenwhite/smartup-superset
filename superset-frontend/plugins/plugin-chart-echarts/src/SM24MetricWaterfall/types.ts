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
import { QueryFormData, ChartProps } from '@superset-ui/core';

// =============================================================================
// WATERFALL BAR TYPES
// =============================================================================

export type WaterfallBarType = 'total' | 'increase' | 'decrease';

export interface WaterfallDataPoint {
  category: string;
  value: number;
  type: WaterfallBarType;
  percentOfBeginning: number;
  customerCount?: number;
  avgPerCustomer?: number;
  // Calculated for waterfall rendering
  start?: number;
  end?: number;
}

// =============================================================================
// QUICK RATIO STATUS
// =============================================================================

export type QuickRatioStatus = 'excellent' | 'good' | 'warning' | 'critical';

export interface QuickRatioInfo {
  value: number;
  status: QuickRatioStatus;
  label: string;
}

export function getQuickRatioStatus(ratio: number): QuickRatioStatus {
  if (ratio >= 4) return 'excellent';
  if (ratio >= 2) return 'good';
  if (ratio >= 1) return 'warning';
  return 'critical';
}

export function getQuickRatioLabel(status: QuickRatioStatus): string {
  switch (status) {
    case 'excellent':
      return 'Best in Class';
    case 'good':
      return 'Healthy';
    case 'warning':
      return 'Needs Attention';
    case 'critical':
      return 'Critical';
    default:
      return '';
  }
}

// =============================================================================
// COLOR CONSTANTS
// =============================================================================

export const WATERFALL_COLORS = {
  // Total bars (Beginning/Ending ARR)
  total: '#34495E',
  totalLight: '#5D6D7E',

  // Increase bars (New Business, Expansion)
  increase: '#27AE60',
  increaseGradientEnd: '#A8E6CF',

  // Decrease bars (Contraction, Churn)
  decrease: '#E74C3C',
  decreaseGradientEnd: '#F8B4B4',

  // Connecting lines
  connector: '#BDC3C7',

  // Quick Ratio badge colors
  quickRatioExcellent: '#27AE60',
  quickRatioGood: '#F1C40F',
  quickRatioWarning: '#E67E22',
  quickRatioCritical: '#E74C3C',

  // Text colors
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#FFFFFF',
};

// =============================================================================
// DRILLDOWN TARGETS
// =============================================================================

export type DrilldownTarget =
  | 'SM24-NewCustomersList'
  | 'SM24-ExpansionCustomers'
  | 'SM24-ContractionCustomers'
  | 'SM24-ChurnedCustomersList';

export const DRILLDOWN_MAP: Record<string, DrilldownTarget> = {
  'New Business': 'SM24-NewCustomersList',
  Expansion: 'SM24-ExpansionCustomers',
  Contraction: 'SM24-ContractionCustomers',
  Churn: 'SM24-ChurnedCustomersList',
};

// =============================================================================
// FORM DATA
// =============================================================================

export interface SM24MetricWaterfallFormData extends QueryFormData {
  // Metrics
  beginningArrMetric?: string;
  newBusinessMetric?: string;
  expansionMetric?: string;
  contractionMetric?: string;
  churnMetric?: string;
  endingArrMetric?: string;
  customerCountMetric?: string;

  // Display Options
  showConnectorLines?: boolean;
  showPercentLabels?: boolean;
  showAbsoluteLabels?: boolean;
  showCustomerCounts?: boolean;
  showQuickRatio?: boolean;
  showNetChange?: boolean;
  showGrowthRate?: boolean;

  // Bar Order
  barOrder?: string[];

  // Colors
  colorTotal?: string;
  colorIncrease?: string;
  colorDecrease?: string;
  colorConnector?: string;

  // Thresholds & Alerts
  churnAlertThreshold?: number; // Alert if Churn > X% of Beginning ARR
  contractionWarningEnabled?: boolean; // Warning if Contraction > Expansion
  targetQuickRatio?: number; // Target Quick Ratio (default 4)

  // Formatting
  currencyFormat?: string;
  numberFormat?: string;
  locale?: string;

  // Interactivity
  enableDrilldown?: boolean;

  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
}

// =============================================================================
// CHART PROPS
// =============================================================================

export interface SM24MetricWaterfallChartProps extends ChartProps {
  formData: SM24MetricWaterfallFormData;
}

export interface SM24MetricWaterfallVizProps {
  className?: string;
  width: number;
  height: number;

  // Data
  data: WaterfallDataPoint[];
  beginningARR: number;
  endingARR: number;
  netChange: number;
  growthRate: number;
  quickRatio: QuickRatioInfo;

  // Display options
  showConnectorLines: boolean;
  showPercentLabels: boolean;
  showAbsoluteLabels: boolean;
  showCustomerCounts: boolean;
  showQuickRatio: boolean;
  showNetChange: boolean;
  showGrowthRate: boolean;

  // Colors
  colors: {
    total: string;
    increase: string;
    increaseGradient: string;
    decrease: string;
    decreaseGradient: string;
    connector: string;
  };

  // Alerts
  alerts: {
    churnAlert: boolean;
    contractionWarning: boolean;
  };

  // Formatting
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;

  // Interactivity
  enableDrilldown: boolean;
  onDrilldown?: (category: string, periodStart: string, periodEnd: string) => void;

  // Legend
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';

  // Refs for parent component
  refs?: {
    echartRef?: { current: unknown };
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format currency value with appropriate suffix (K, M, B)
 */
export function formatARRValue(
  value: number,
  locale: string = 'en-US',
): string {
  const absValue = Math.abs(value);
  let formatted: string;

  if (absValue >= 1_000_000_000) {
    formatted = `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (absValue >= 1_000_000) {
    formatted = `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    formatted = `$${(value / 1_000).toFixed(1)}K`;
  } else {
    formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return formatted;
}

/**
 * Format percentage value
 */
export function formatPercentValue(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Calculate Quick Ratio: (New + Expansion) / (Contraction + Churn)
 */
export function calculateQuickRatio(
  newBusiness: number,
  expansion: number,
  contraction: number,
  churn: number,
): QuickRatioInfo {
  const positive = newBusiness + expansion;
  const negative = Math.abs(contraction) + Math.abs(churn);

  if (negative === 0) {
    return {
      value: Infinity,
      status: 'excellent',
      label: 'No Churn',
    };
  }

  const ratio = positive / negative;
  const status = getQuickRatioStatus(ratio);

  return {
    value: ratio,
    status,
    label: getQuickRatioLabel(status),
  };
}

/**
 * Get color for Quick Ratio badge
 */
export function getQuickRatioColor(status: QuickRatioStatus): string {
  switch (status) {
    case 'excellent':
      return WATERFALL_COLORS.quickRatioExcellent;
    case 'good':
      return WATERFALL_COLORS.quickRatioGood;
    case 'warning':
      return WATERFALL_COLORS.quickRatioWarning;
    case 'critical':
      return WATERFALL_COLORS.quickRatioCritical;
    default:
      return WATERFALL_COLORS.textSecondary;
  }
}

/**
 * Calculate waterfall bar positions (start and end values)
 */
export function calculateWaterfallPositions(
  data: WaterfallDataPoint[],
): WaterfallDataPoint[] {
  let runningTotal = 0;

  return data.map((point, index) => {
    let start: number;
    let end: number;

    if (point.type === 'total') {
      if (index === 0) {
        // Beginning ARR
        start = 0;
        end = point.value;
        runningTotal = point.value;
      } else {
        // Ending ARR - should equal runningTotal but use actual value
        start = 0;
        end = point.value;
      }
    } else if (point.type === 'increase') {
      start = runningTotal;
      end = runningTotal + point.value;
      runningTotal = end;
    } else {
      // decrease
      start = runningTotal;
      end = runningTotal - Math.abs(point.value);
      runningTotal = end;
    }

    return {
      ...point,
      start,
      end,
    };
  });
}

/**
 * Get bar color based on type with gradient support
 */
export function getBarColor(
  type: WaterfallBarType,
  colors: SM24MetricWaterfallVizProps['colors'],
): string | { type: string; colorStops: { offset: number; color: string }[] } {
  switch (type) {
    case 'total':
      return colors.total;
    case 'increase':
      return {
        type: 'linear',
        colorStops: [
          { offset: 0, color: colors.increase },
          { offset: 1, color: colors.increaseGradient },
        ],
      };
    case 'decrease':
      return {
        type: 'linear',
        colorStops: [
          { offset: 0, color: colors.decrease },
          { offset: 1, color: colors.decreaseGradient },
        ],
      };
    default:
      return colors.total;
  }
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_BAR_ORDER = [
  'Beginning ARR',
  'New Business',
  'Expansion',
  'Contraction',
  'Churn',
  'Ending ARR',
];

export const DEFAULT_FORM_DATA: Partial<SM24MetricWaterfallFormData> = {
  showConnectorLines: true,
  showPercentLabels: true,
  showAbsoluteLabels: true,
  showCustomerCounts: false,
  showQuickRatio: true,
  showNetChange: true,
  showGrowthRate: true,
  colorTotal: WATERFALL_COLORS.total,
  colorIncrease: WATERFALL_COLORS.increase,
  colorDecrease: WATERFALL_COLORS.decrease,
  colorConnector: WATERFALL_COLORS.connector,
  churnAlertThreshold: 5,
  contractionWarningEnabled: true,
  targetQuickRatio: 4,
  locale: 'en-US',
  enableDrilldown: true,
  showLegend: true,
  legendPosition: 'bottom',
  barOrder: DEFAULT_BAR_ORDER,
};
