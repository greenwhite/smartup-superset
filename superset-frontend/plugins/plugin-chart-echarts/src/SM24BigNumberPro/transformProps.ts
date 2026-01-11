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
  ColorFormatters,
  getColorFormatters,
  Metric,
} from '@superset-ui/chart-controls';
import {
  getMetricLabel,
  getNumberFormatter,
  DataRecord,
} from '@superset-ui/core';
import {
  SM24BigNumberProChartProps,
  SM24BigNumberProVizProps,
  SM24NumberFormatType,
  SM24_LOCALES,
  ComparisonData,
  TIME_COMPARISON_SHIFTS,
  TIME_COMPARISON_LABELS,
  TimeComparisonPeriod,
  SparklineConfig,
  SparklineDataPoint,
  ProgressBarConfig,
  getTrendDirection,
} from './types';
import { Refs } from '../types';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Parse metric value from query response
 */
function parseMetricValue(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Get the original metric label from datasource
 */
function getOriginalLabel(
  metric: string | object | undefined,
  metrics: Metric[],
): string {
  if (!metric) return '';

  if (typeof metric === 'string') {
    const found = metrics.find(m => m.metric_name === metric);
    return found?.verbose_name || found?.metric_name || metric;
  }

  if (typeof metric === 'object' && 'label' in metric) {
    return (metric as any).label || '';
  }

  return getMetricLabel(metric);
}

/**
 * Create a custom number formatter based on SM24-BigNumber settings
 */
function createSM24Formatter(
  formatType: SM24NumberFormatType,
  locale: string,
  customFormat?: string,
  prefix?: string,
  suffix?: string,
): (value: number) => string {
  const localeConfig = SM24_LOCALES[locale] || SM24_LOCALES.ru;

  // Helper to format with locale separators
  const formatWithLocale = (num: number, decimals: number = 0): string => {
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const parts = absNum.toFixed(decimals).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, localeConfig.thousands);
    const decPart = parts[1];
    const formatted = decPart ? `${intPart}${localeConfig.decimal}${decPart}` : intPart;
    return isNegative ? `-${formatted}` : formatted;
  };

  // Helper to format large numbers with suffix
  const formatLargeNumber = (
    num: number,
    divisor: number,
    suffixText: string,
    decimals: number = 2,
  ): string => {
    const divided = num / divisor;
    return `${formatWithLocale(divided, decimals)}${suffixText}`;
  };

  return (value: number): string => {
    let formattedValue: string;

    switch (formatType) {
      case 'integer':
        formattedValue = formatWithLocale(Math.round(value), 0);
        break;

      case 'decimal_1':
        formattedValue = formatWithLocale(value, 1);
        break;

      case 'decimal_2':
        formattedValue = formatWithLocale(value, 2);
        break;

      case 'thousands':
        formattedValue = formatLargeNumber(
          value,
          1000,
          localeConfig.shortScale.thousands,
          2,
        );
        break;

      case 'millions':
        formattedValue = formatLargeNumber(
          value,
          1_000_000,
          localeConfig.shortScale.millions,
          2,
        );
        break;

      case 'billions':
        formattedValue = formatLargeNumber(
          value,
          1_000_000_000,
          localeConfig.shortScale.billions,
          2,
        );
        break;

      case 'percent':
        formattedValue = `${formatWithLocale(value * 100, 1)}%`;
        break;

      case 'percent_decimal':
        formattedValue = `${formatWithLocale(value * 100, 2)}%`;
        break;

      case 'smart': {
        const absValue = Math.abs(value);
        if (absValue >= 1_000_000_000) {
          formattedValue = formatLargeNumber(
            value,
            1_000_000_000,
            localeConfig.shortScale.billions,
            2,
          );
        } else if (absValue >= 1_000_000) {
          formattedValue = formatLargeNumber(
            value,
            1_000_000,
            localeConfig.shortScale.millions,
            2,
          );
        } else if (absValue >= 1000) {
          formattedValue = formatWithLocale(Math.round(value), 0);
        } else if (absValue >= 1) {
          formattedValue = formatWithLocale(value, 2);
        } else if (absValue > 0) {
          formattedValue = `${formatWithLocale(value * 100, 1)}%`;
        } else {
          formattedValue = '0';
        }
        break;
      }

      case 'custom': {
        try {
          const d3Formatter = getNumberFormatter(customFormat || ',.2f');
          formattedValue = d3Formatter(value);
        } catch {
          formattedValue = value.toString();
        }
        break;
      }

      default:
        formattedValue = formatWithLocale(value, 0);
    }

    const finalPrefix = prefix || '';
    const finalSuffix = suffix || '';

    return `${finalPrefix}${formattedValue}${finalSuffix}`;
  };
}

/**
 * Calculate comparison data between current and previous period
 */
function calculateComparisonData(
  currentValue: number | null,
  previousValue: number | null,
): ComparisonData {
  const absoluteDifference =
    currentValue !== null && previousValue !== null
      ? currentValue - previousValue
      : null;

  let percentDifference: number | null = null;
  if (currentValue !== null && previousValue !== null) {
    if (previousValue === 0) {
      percentDifference = currentValue === 0 ? 0 : currentValue > 0 ? 1 : -1;
    } else {
      percentDifference = (currentValue - previousValue) / Math.abs(previousValue);
    }
  }

  return {
    currentValue,
    previousValue,
    absoluteDifference,
    percentDifference,
    trend: getTrendDirection(percentDifference),
  };
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

  // Look for the metric with time offset suffix
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
 * Convert color picker value to CSS color string
 */
function colorPickerToString(
  color: { r: number; g: number; b: number; a: number } | undefined,
): string | undefined {
  if (!color) return undefined;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

// =============================================================================
// TRANSFORM PROPS
// =============================================================================

/**
 * Transform chart props to visualization props
 */
export default function transformProps(
  chartProps: SM24BigNumberProChartProps,
): SM24BigNumberProVizProps {
  const {
    width,
    height,
    queriesData,
    formData,
    hooks,
    theme,
  } = chartProps;

  const {
    metric = 'value',
    headerFontSize = 0.3,
    subtitleFontSize = 0.08,
    metricNameFontSize = 0.08,
    showMetricName = true,
    subtitle = '',
    numberFormatType = 'smart',
    customNumberFormat,
    numberPrefix,
    numberSuffix,
    numberLocale = 'ru',
    defaultColor,
    conditionalFormatting,

    // Time comparison
    timeComparisonEnabled = false,
    timeComparisonPeriod = 'none',
    customTimeOffset,
    comparisonColorEnabled = true,
    comparisonColorScheme = 'green_up',
    showPreviousValue = true,
    showAbsoluteDifference = false,
    showPercentDifference = true,

    // Sparkline
    sparklineEnabled = false,
    sparklineType = 'area',
    sparklineColor,
    sparklinePeriods = 7,

    // Progress bar
    progressBarEnabled = false,
    progressBarTarget,
    progressBarShowTarget = true,
    progressBarShowPercentage = true,

    // Animation
    animationEnabled = true,
  } = formData;

  const refs: Refs = {};
  const { data = [] } = queriesData[0] || {};
  const metrics = chartProps.datasource?.metrics || [];

  // Get metric name and value
  const metricLabel = getMetricLabel(metric);
  const originalLabel = getOriginalLabel(metric, metrics);

  // Calculate current value (sum all rows for the metric)
  let currentValue: number | null = null;
  if (data.length > 0) {
    let total = 0;
    let found = false;
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        // Only match the base metric, not the comparison suffix
        if (key === metricLabel && !key.includes('__')) {
          const val = parseMetricValue(row[key]);
          if (val !== null) {
            total += val;
            found = true;
          }
        }
      });
    });
    // If not found with exact match, try partial match
    if (!found) {
      data.forEach(row => {
        const val = parseMetricValue(row[metricLabel]);
        if (val !== null) {
          total += val;
          found = true;
        }
      });
    }
    currentValue = found ? total : null;
  }

  // Create formatter
  const headerFormatter = createSM24Formatter(
    numberFormatType as SM24NumberFormatType,
    numberLocale,
    customNumberFormat,
    numberPrefix,
    numberSuffix,
  );

  // Get default color
  const numberColor = colorPickerToString(defaultColor);

  // Get color formatters for conditional formatting
  const defaultColorFormatters = [] as ColorFormatters;
  const colorThresholdFormatters =
    getColorFormatters(conditionalFormatting, data, theme, false) ??
    defaultColorFormatters;

  // Calculate comparison data if enabled
  let comparisonData: ComparisonData | undefined;
  let comparisonLabel: string | undefined;

  if (timeComparisonEnabled && timeComparisonPeriod !== 'none') {
    const timeShift =
      timeComparisonPeriod === 'custom'
        ? customTimeOffset || '30 days ago'
        : TIME_COMPARISON_SHIFTS[timeComparisonPeriod as TimeComparisonPeriod];

    const previousValue = extractComparisonValue(data, metricLabel, timeShift);
    comparisonData = calculateComparisonData(currentValue, previousValue);
    comparisonLabel = TIME_COMPARISON_LABELS[timeComparisonPeriod as TimeComparisonPeriod];
  }

  // Sparkline config
  let sparklineConfig: SparklineConfig | undefined;
  let sparklineData: SparklineDataPoint[] | undefined;

  if (sparklineEnabled) {
    sparklineConfig = {
      enabled: true,
      type: sparklineType as 'line' | 'bar' | 'area',
      color: colorPickerToString(sparklineColor) || '#2ECC71',
      height: 40,
      showPoints: false,
      fillOpacity: 0.3,
    };
    // Note: Sparkline data would come from a time-series query
    // For now, we'll leave it undefined and handle in the component
    sparklineData = undefined;
  }

  // Progress bar config
  let progressBarConfig: ProgressBarConfig | undefined;
  let currentProgress: number | undefined;

  if (progressBarEnabled && progressBarTarget) {
    const targetValue = parseFloat(progressBarTarget) || 100;
    progressBarConfig = {
      enabled: true,
      targetValue,
      showTarget: progressBarShowTarget,
      showPercentage: progressBarShowPercentage,
      colorBelowTarget: '#E74C3C',
      colorAboveTarget: '#2ECC71',
      height: 8,
    };
    if (currentValue !== null) {
      currentProgress = (currentValue / targetValue) * 100;
    }
  }

  const { onContextMenu } = hooks;

  return {
    width,
    height,
    bigNumber: currentValue,
    headerFormatter,
    headerFontSize,
    subtitleFontSize,
    metricNameFontSize,
    subtitle,
    metricName: originalLabel,
    showMetricName,
    numberColor,
    colorThresholdFormatters,

    // Comparison
    comparisonData,
    comparisonLabel,
    comparisonColorEnabled,
    comparisonColorScheme,
    showPreviousValue,
    showAbsoluteDifference,
    showPercentDifference,

    // Sparkline
    sparklineData,
    sparklineConfig,

    // Progress bar
    progressBarConfig,
    currentProgress,

    // Animation
    animationEnabled,

    onContextMenu,
    refs,
  };
}
