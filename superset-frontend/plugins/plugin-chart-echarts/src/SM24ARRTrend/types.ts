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
  BinaryQueryObjectFilterClause,
  ChartDataResponseResult,
  ContextMenuFilters,
  DataRecordValue,
  QueryFormData,
  QueryFormMetric,
} from '@superset-ui/core';
import type { EChartsCoreOption } from 'echarts';
import { BaseChartProps, Refs } from '../types';

// =============================================================================
// ARR COMPONENT TYPES
// =============================================================================

/**
 * ARR component categories for waterfall breakdown
 */
export type ARRComponent = 'new_business' | 'expansion' | 'contraction' | 'churned';

/**
 * Single month ARR data point
 */
export interface ARRDataPoint {
  month: string;
  monthLabel: string;
  totalARR: number;
  newBusiness: number;
  expansion: number;
  contraction: number;
  churned: number;
  netNewARR: number;
  growthRate: number | null;
  momChange: number | null;
  // YoY comparison data
  yoyTotalARR?: number | null;
  yoyGrowthRate?: number | null;
}

/**
 * Annotation for key events
 */
export interface ARRAnnotation {
  date: string;
  label: string;
  description?: string;
  type: 'milestone' | 'event' | 'target';
}

/**
 * Growth threshold configuration
 */
export interface GrowthThreshold {
  critical: number;  // Below this = red
  warning: number;   // Below this = yellow
  healthy: number;   // Above this = green
}

/**
 * Target/goal configuration
 */
export interface ARRTarget {
  currentARR: number;
  targetARR: number;
  targetDate: string;
  monthlyGrowthTarget: number;  // As decimal (0.025 = 2.5%)
  annualGrowthTarget: number;   // As decimal (0.30 = 30%)
}

// =============================================================================
// COLORS
// =============================================================================

/**
 * Default color scheme for ARR components
 */
export const ARR_COLORS = {
  totalARR: '#2E86DE',       // Blue - main line
  newBusiness: '#27AE60',    // Green
  expansion: '#A8E6CF',      // Light green
  contraction: '#F39C12',    // Orange
  churned: '#E74C3C',        // Red
  target: '#9B59B6',         // Purple - target line
  projection: '#95A5A6',     // Gray - projection
  gridLine: '#E0E0E0',
  axisLabel: '#666666',
};

/**
 * Growth rate color mapping
 */
export const GROWTH_COLORS = {
  negative: '#E74C3C',   // Red
  belowTarget: '#F39C12', // Yellow/Orange
  healthy: '#27AE60',    // Green
};

// =============================================================================
// FORM DATA
// =============================================================================

/**
 * Form data for SM24-ARRTrend visualization
 */
export type SM24ARRTrendFormData = QueryFormData & {
  // Metrics
  metricTotalARR?: QueryFormMetric;
  metricNewBusiness?: QueryFormMetric;
  metricExpansion?: QueryFormMetric;
  metricContraction?: QueryFormMetric;
  metricChurned?: QueryFormMetric;

  // Time configuration
  timeColumn?: string;
  timeGrain?: string;
  rollingMonths?: number;

  // Display options
  showLine?: boolean;
  showBars?: boolean;
  showGrowthRate?: boolean;
  showTargetLine?: boolean;
  showProjection?: boolean;
  showAnnotations?: boolean;

  // Target configuration
  currentARR?: number;
  targetARR?: number;
  targetDate?: string;
  annualGrowthTarget?: number;

  // Thresholds
  criticalGrowthThreshold?: number;
  warningGrowthThreshold?: number;
  healthyGrowthThreshold?: number;

  // Colors
  colorTotalARR?: string;
  colorNewBusiness?: string;
  colorExpansion?: string;
  colorContraction?: string;
  colorChurned?: string;

  // Formatting
  currencyFormat?: string;
  percentFormat?: string;
  numberLocale?: 'en' | 'ru' | 'uz';

  // Annotations
  annotations?: ARRAnnotation[];

  // Interactivity
  enableDrilldown?: boolean;
  enableYoYComparison?: boolean;

  // Legend
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showLegendCheckboxes?: boolean;

  // Y-axis
  yAxisLeftLabel?: string;
  yAxisRightLabel?: string;
};

// =============================================================================
// CHART DATA
// =============================================================================

/**
 * Data structure from query response
 */
export interface SM24ARRTrendDatum {
  [key: string]: DataRecordValue;
}

/**
 * Query response
 */
export interface SM24ARRTrendChartDataResponseResult extends ChartDataResponseResult {
  data: SM24ARRTrendDatum[];
}

/**
 * Chart props passed to the plugin
 */
export type SM24ARRTrendChartProps = BaseChartProps<SM24ARRTrendFormData> & {
  formData: SM24ARRTrendFormData;
  queriesData: SM24ARRTrendChartDataResponseResult[];
};

// =============================================================================
// VISUALIZATION PROPS
// =============================================================================

/**
 * Tooltip data for hover state
 */
export interface ARRTooltipData {
  month: string;
  year: number;
  totalARR: number;
  momGrowth: number | null;
  momChange: number | null;
  breakdown: {
    newBusiness: number;
    expansion: number;
    contraction: number;
    churned: number;
  };
}

/**
 * Props for the visualization component
 */
export interface SM24ARRTrendVizProps {
  className?: string;
  width: number;
  height: number;

  // Data
  data: ARRDataPoint[];
  currentARR: number;
  targetARR: number;

  // Target/projection
  targetConfig: ARRTarget;
  projectionData?: ARRDataPoint[];

  // Display options
  showLine: boolean;
  showBars: boolean;
  showGrowthRate: boolean;
  showTargetLine: boolean;
  showProjection: boolean;
  showAnnotations: boolean;

  // Annotations
  annotations: ARRAnnotation[];

  // Thresholds
  growthThresholds: GrowthThreshold;

  // Colors
  colors: typeof ARR_COLORS;

  // Formatting
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;

  // Legend
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  showLegendCheckboxes: boolean;

  // Axis labels
  yAxisLeftLabel: string;
  yAxisRightLabel: string;

  // Interactivity
  enableDrilldown: boolean;
  enableYoYComparison: boolean;
  onDataPointClick?: (dataPoint: ARRDataPoint, component?: ARRComponent) => void;

  // Drilldown support
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;

  // Form data for building drill filters
  formData: SM24ARRTrendFormData;

  // ECharts option (generated)
  echartOptions?: EChartsCoreOption;

  refs: Refs;
}

// =============================================================================
// LOCALE CONFIGURATION
// =============================================================================

export interface SM24ARRLocale {
  decimal: string;
  thousands: string;
  currency: string;
  currencyPosition: 'before' | 'after';
}

export const SM24_ARR_LOCALES: Record<string, SM24ARRLocale> = {
  en: {
    decimal: '.',
    thousands: ',',
    currency: '$',
    currencyPosition: 'before',
  },
  ru: {
    decimal: ',',
    thousands: ' ',
    currency: '$',
    currencyPosition: 'before',
  },
  uz: {
    decimal: ',',
    thousands: ' ',
    currency: '$',
    currencyPosition: 'before',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format currency value based on magnitude
 */
export function formatARRValue(value: number, locale: SM24ARRLocale): string {
  const absValue = Math.abs(value);
  let formatted: string;
  let suffix: string = '';

  if (absValue >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(2);
    suffix = 'M';
  } else if (absValue >= 1_000) {
    formatted = (value / 1_000).toFixed(1);
    suffix = 'K';
  } else {
    formatted = value.toFixed(0);
  }

  // Apply locale formatting
  formatted = formatted.replace('.', locale.decimal);

  const sign = value < 0 ? '-' : '';
  const absFormatted = formatted.replace('-', '');

  if (locale.currencyPosition === 'before') {
    return `${sign}${locale.currency}${absFormatted}${suffix}`;
  }
  return `${sign}${absFormatted}${suffix}${locale.currency}`;
}

/**
 * Get growth rate color based on thresholds
 */
export function getGrowthColor(
  growthRate: number | null,
  thresholds: GrowthThreshold,
): string {
  if (growthRate === null) return GROWTH_COLORS.belowTarget;
  if (growthRate < thresholds.critical) return GROWTH_COLORS.negative;
  if (growthRate < thresholds.warning) return GROWTH_COLORS.belowTarget;
  return GROWTH_COLORS.healthy;
}

/**
 * Calculate Net New ARR
 */
export function calculateNetNewARR(
  newBusiness: number,
  expansion: number,
  contraction: number,
  churned: number,
): number {
  return newBusiness + expansion - Math.abs(contraction) - Math.abs(churned);
}

/**
 * Calculate MoM growth rate
 */
export function calculateMoMGrowth(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Generate projection data based on growth rate
 */
export function generateProjection(
  lastARR: number,
  monthlyGrowthRate: number,
  months: number,
  startMonth: string,
): ARRDataPoint[] {
  const projection: ARRDataPoint[] = [];
  let currentARR = lastARR;
  const startDate = new Date(startMonth);

  for (let i = 1; i <= months; i++) {
    const projectedARR = currentARR * (1 + monthlyGrowthRate);
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);

    projection.push({
      month: monthDate.toISOString().slice(0, 7),
      monthLabel: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      totalARR: projectedARR,
      newBusiness: 0,
      expansion: 0,
      contraction: 0,
      churned: 0,
      netNewARR: projectedARR - currentARR,
      growthRate: monthlyGrowthRate * 100,
      momChange: projectedARR - currentARR,
    });

    currentARR = projectedARR;
  }

  return projection;
}
