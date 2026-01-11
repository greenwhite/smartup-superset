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
import { getMetricLabel, DataRecord } from '@superset-ui/core';
import {
  SM24TopBigNumberChartProps,
  SM24TopBigNumberVizProps,
  MetricCardData,
  SM24NumberFormat,
  SM24_TOPBLOCK_LOCALES,
  TIME_COMPARISON_SHIFTS,
  getTrendDirection,
  SparklineConfig,
} from './types';
import { Refs } from '../types';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Parse metric value from query response
 */
function parseMetricValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Create number formatter based on format type and locale
 */
function createFormatter(
  formatType: SM24NumberFormat,
  locale: string,
  customFormat?: string,
): (value: number) => string {
  const localeConfig = SM24_TOPBLOCK_LOCALES[locale] || SM24_TOPBLOCK_LOCALES.ru;

  const formatWithLocale = (num: number, decimals: number = 0): string => {
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const parts = absNum.toFixed(decimals).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, localeConfig.thousands);
    const decPart = parts[1];
    const formatted = decPart ? `${intPart}${localeConfig.decimal}${decPart}` : intPart;
    return isNegative ? `-${formatted}` : formatted;
  };

  const formatLarge = (num: number, divisor: number, suffix: string, decimals = 2): string => {
    return `${formatWithLocale(num / divisor, decimals)}${suffix}`;
  };

  return (value: number): string => {
    switch (formatType) {
      case 'integer':
        return formatWithLocale(Math.round(value), 0);

      case 'decimal_1':
        return formatWithLocale(value, 1);

      case 'decimal_2':
        return formatWithLocale(value, 2);

      case 'thousands':
        return formatLarge(value, 1000, localeConfig.shortScale.thousands);

      case 'millions':
        return formatLarge(value, 1_000_000, localeConfig.shortScale.millions);

      case 'billions':
        return formatLarge(value, 1_000_000_000, localeConfig.shortScale.billions);

      case 'percent':
        return `${formatWithLocale(value * 100, 1)}%`;

      case 'smart': {
        const absValue = Math.abs(value);
        if (absValue >= 1_000_000_000) {
          return formatLarge(value, 1_000_000_000, localeConfig.shortScale.billions);
        }
        if (absValue >= 1_000_000) {
          return formatLarge(value, 1_000_000, localeConfig.shortScale.millions);
        }
        if (absValue >= 10_000) {
          return formatLarge(value, 1000, localeConfig.shortScale.thousands);
        }
        if (absValue >= 1) {
          return formatWithLocale(value, absValue >= 100 ? 0 : 2);
        }
        if (absValue > 0) {
          return `${formatWithLocale(value * 100, 1)}%`;
        }
        return '0';
      }

      default:
        return formatWithLocale(value, 0);
    }
  };
}

/**
 * Convert color picker value to CSS string
 */
function colorToString(color: { r: number; g: number; b: number; a: number } | undefined): string | undefined {
  if (!color) return undefined;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

/**
 * Extract comparison value from data
 */
function extractComparisonValue(
  data: DataRecord[],
  metricName: string,
  timeShift: string,
): number | null {
  if (!data || data.length === 0) return null;

  const suffixedKey = `${metricName}__${timeShift}`;
  let total = 0;
  let found = false;

  data.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key === suffixedKey || key.includes(suffixedKey)) {
        const val = parseMetricValue(row[key]);
        if (val !== null) {
          total += val;
          found = true;
        }
      }
    });
  });

  return found ? total : null;
}

/**
 * Calculate percentage change
 */
function calculatePercentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  if (previous === 0) {
    return current === 0 ? 0 : current > 0 ? 1 : -1;
  }
  return (current - previous) / Math.abs(previous);
}

// =============================================================================
// TRANSFORM PROPS
// =============================================================================

export default function transformProps(
  chartProps: SM24TopBigNumberChartProps,
): SM24TopBigNumberVizProps {
  const { width, height, queriesData, formData } = chartProps;

  const {
    metrics = [],
    layout = 'auto',
    columnsCount = 0,
    cardMinWidth = 150,
    cardMaxWidth = 300,
    cardGap = 16,
    showMetricName = true,
    showSparkline = true,
    showComparison = true,
    cardBorderRadius = 8,
    cardPadding = 16,
    cardShadow = true,
    numberFormat = 'smart',
    customNumberFormat,
    numberLocale = 'ru',
    timeComparisonEnabled = true,
    timeComparisonPeriod = 'MoM',
    customTimeOffset,
    comparisonColorScheme = 'green_up',
    sparklineEnabled = true,
    sparklineHeight = 30,
    headerColor,
    valueColor,
    cardBackground,
  } = formData;

  const refs: Refs = {};
  const { data = [] } = queriesData[0] || {};

  // Create formatter
  const formatValue = createFormatter(
    numberFormat as SM24NumberFormat,
    numberLocale,
    customNumberFormat,
  );

  // Get time shift for comparison
  const timeShift = timeComparisonPeriod === 'custom'
    ? customTimeOffset || '30 days ago'
    : TIME_COMPARISON_SHIFTS[timeComparisonPeriod] || '';

  // Build metric cards data
  const metricCards: MetricCardData[] = metrics.map((metric, index) => {
    const metricLabel = getMetricLabel(metric);
    const id = `metric-${index}`;

    // Get current value
    let currentValue: number | null = null;
    if (data.length > 0) {
      let total = 0;
      let found = false;
      data.forEach(row => {
        const val = parseMetricValue(row[metricLabel]);
        if (val !== null && !metricLabel.includes('__')) {
          total += val;
          found = true;
        }
      });
      currentValue = found ? total : parseMetricValue(data[0]?.[metricLabel]);
    }

    // Get previous value for comparison
    const previousValue = timeComparisonEnabled && timeShift
      ? extractComparisonValue(data, metricLabel, timeShift)
      : null;

    // Calculate percent change
    const percentChange = calculatePercentChange(currentValue, previousValue);
    const trend = getTrendDirection(percentChange);

    // Generate sparkline data (mock for now - would need time series query)
    const sparklineData: number[] = [];

    return {
      id,
      label: metricLabel,
      value: currentValue,
      formattedValue: currentValue !== null ? formatValue(currentValue) : '-',
      previousValue,
      percentChange,
      trend,
      sparklineData,
    };
  });

  // Sparkline configuration
  const sparklineConfig: SparklineConfig = {
    enabled: showSparkline && sparklineEnabled,
    height: sparklineHeight,
    showArea: true,
  };

  return {
    width,
    height,
    metricCards,
    layout: layout as 'auto' | 'horizontal' | 'grid',
    columnsCount,
    cardMinWidth,
    cardMaxWidth,
    cardGap,
    showMetricName,
    showSparkline,
    showComparison,
    cardBorderRadius,
    cardPadding,
    cardShadow,
    headerColor: colorToString(headerColor),
    valueColor: colorToString(valueColor),
    cardBackground: colorToString(cardBackground),
    comparisonColorScheme,
    sparklineConfig,
    formatValue,
    refs,
  };
}
