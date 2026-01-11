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
import { getMetricLabel } from '@superset-ui/core';
import {
  SM24ARRTrendChartProps,
  SM24ARRTrendVizProps,
  ARRDataPoint,
  ARRAnnotation,
  ARRTarget,
  GrowthThreshold,
  ARR_COLORS,
  SM24_ARR_LOCALES,
  formatARRValue,
  calculateNetNewARR,
  calculateMoMGrowth,
  generateProjection,
} from './types';
import { Refs } from '../types';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Parse numeric value from data
 */
function parseNumericValue(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Convert color picker value to hex string
 */
function colorToHex(color: { r: number; g: number; b: number; a?: number } | undefined, defaultColor: string): string {
  if (!color) return defaultColor;
  const r = color.r.toString(16).padStart(2, '0');
  const g = color.g.toString(16).padStart(2, '0');
  const b = color.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Format month string to display label
 */
function formatMonthLabel(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  } catch {
    return dateStr;
  }
}

// =============================================================================
// TRANSFORM PROPS
// =============================================================================

export default function transformProps(
  chartProps: SM24ARRTrendChartProps,
): SM24ARRTrendVizProps {
  const { width, height, queriesData, formData, hooks } = chartProps;
  const { onContextMenu } = hooks || {};

  const {
    // Metrics
    metricTotalARR,
    metricNewBusiness,
    metricExpansion,
    metricContraction,
    metricChurned,

    // Display options
    showLine = true,
    showBars = true,
    showGrowthRate = true,
    showTargetLine = true,
    showProjection = false,
    showAnnotations = true,

    // Target configuration
    currentARR = '3000000',
    targetARR = '5000000',
    annualGrowthTarget = 30,

    // Thresholds
    criticalGrowthThreshold = 0,
    warningGrowthThreshold = 2,

    // Colors
    colorTotalARR,
    colorNewBusiness,
    colorExpansion,
    colorContraction,
    colorChurned,

    // Formatting
    numberLocale = 'en',

    // Annotations
    annotations = [],

    // Legend
    legendPosition = 'bottom',
    showLegendCheckboxes = true,

    // Axis labels
    yAxisLeftLabel = 'ARR ($)',
    yAxisRightLabel = 'Growth (%)',

    // Interactivity
    enableDrilldown = true,
    enableYoYComparison = false,
  } = formData;

  const refs: Refs = {};
  const { data = [] } = queriesData[0] || {};
  // YoY comparison data (from second query if enabled)
  const yoyData = enableYoYComparison && queriesData[1] ? queriesData[1].data || [] : [];
  const locale = SM24_ARR_LOCALES[numberLocale] || SM24_ARR_LOCALES.en;

  // Get metric labels
  const totalARRLabel = metricTotalARR ? getMetricLabel(metricTotalARR) : 'total_arr';
  const newBusinessLabel = metricNewBusiness ? getMetricLabel(metricNewBusiness) : 'new_business';
  const expansionLabel = metricExpansion ? getMetricLabel(metricExpansion) : 'expansion';
  const contractionLabel = metricContraction ? getMetricLabel(metricContraction) : 'contraction';
  const churnedLabel = metricChurned ? getMetricLabel(metricChurned) : 'churned';

  // Build YoY lookup map for quick access
  const yoyLookup: Map<string, number> = new Map();
  if (enableYoYComparison && yoyData.length > 0) {
    yoyData.forEach(row => {
      const timeKey = Object.keys(row).find(k =>
        k.includes('month') || k.includes('date') || k === '__timestamp'
      ) || Object.keys(row)[0];
      const month = String(row[timeKey] || '');
      const yoyTotalARR = parseNumericValue(row[totalARRLabel]);
      // Store with month key (we need to match by month name, not exact date)
      const monthKey = formatMonthLabel(month);
      yoyLookup.set(monthKey, yoyTotalARR);
    });
  }

  // Transform data to ARRDataPoint array
  const arrData: ARRDataPoint[] = [];
  let previousARR: number | null = null;

  data.forEach((row, index) => {
    // Find the time column (typically first column or __timestamp)
    const timeKey = Object.keys(row).find(k =>
      k.includes('month') || k.includes('date') || k === '__timestamp'
    ) || Object.keys(row)[0];

    const month = String(row[timeKey] || '');
    const totalARR = parseNumericValue(row[totalARRLabel]);
    const newBusiness = parseNumericValue(row[newBusinessLabel]);
    const expansion = parseNumericValue(row[expansionLabel]);
    const contraction = parseNumericValue(row[contractionLabel]);
    const churned = parseNumericValue(row[churnedLabel]);

    const netNewARR = calculateNetNewARR(newBusiness, expansion, contraction, churned);
    const growthRate = calculateMoMGrowth(totalARR, previousARR);
    const momChange = previousARR !== null ? totalARR - previousARR : null;

    // Get YoY data for this month
    const monthLabel = formatMonthLabel(month);
    const yoyTotalARR = yoyLookup.get(monthLabel) ?? null;
    const yoyGrowthRate = yoyTotalARR !== null && yoyTotalARR !== 0
      ? ((totalARR - yoyTotalARR) / yoyTotalARR) * 100
      : null;

    arrData.push({
      month,
      monthLabel,
      totalARR,
      newBusiness,
      expansion,
      contraction: Math.abs(contraction),
      churned: Math.abs(churned),
      netNewARR,
      growthRate,
      momChange,
      yoyTotalARR,
      yoyGrowthRate,
    });

    previousARR = totalARR;
  });

  // Parse target values
  const currentARRValue = parseFloat(currentARR) || 3000000;
  const targetARRValue = parseFloat(targetARR) || 5000000;

  // Target configuration
  const targetConfig: ARRTarget = {
    currentARR: currentARRValue,
    targetARR: targetARRValue,
    targetDate: '', // Could be calculated
    monthlyGrowthTarget: Math.pow(1 + annualGrowthTarget / 100, 1 / 12) - 1,
    annualGrowthTarget: annualGrowthTarget / 100,
  };

  // Growth thresholds
  const growthThresholds: GrowthThreshold = {
    critical: criticalGrowthThreshold,
    warning: warningGrowthThreshold,
    healthy: warningGrowthThreshold + 1, // Anything above warning is healthy
  };

  // Generate projection if enabled
  let projectionData: ARRDataPoint[] | undefined;
  if (showProjection && arrData.length > 0) {
    const lastDataPoint = arrData[arrData.length - 1];
    const avgGrowthRate = arrData
      .filter(d => d.growthRate !== null)
      .reduce((sum, d) => sum + (d.growthRate || 0), 0) / arrData.filter(d => d.growthRate !== null).length;

    projectionData = generateProjection(
      lastDataPoint.totalARR,
      avgGrowthRate / 100, // Convert to decimal
      6, // Project 6 months
      lastDataPoint.month,
    );
  }

  // Colors configuration
  const colors = {
    ...ARR_COLORS,
    totalARR: colorToHex(colorTotalARR, ARR_COLORS.totalARR),
    newBusiness: colorToHex(colorNewBusiness, ARR_COLORS.newBusiness),
    expansion: colorToHex(colorExpansion, ARR_COLORS.expansion),
    contraction: colorToHex(colorContraction, ARR_COLORS.contraction),
    churned: colorToHex(colorChurned, ARR_COLORS.churned),
  };

  // Format functions
  const formatCurrency = (value: number): string => formatARRValue(value, locale);
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Parse annotations
  const parsedAnnotations: ARRAnnotation[] = Array.isArray(annotations) ? annotations : [];

  return {
    width,
    height,
    data: arrData,
    currentARR: currentARRValue,
    targetARR: targetARRValue,
    targetConfig,
    projectionData,
    showLine,
    showBars,
    showGrowthRate,
    showTargetLine,
    showProjection,
    showAnnotations,
    annotations: parsedAnnotations,
    growthThresholds,
    colors,
    formatCurrency,
    formatPercent,
    legendPosition,
    showLegendCheckboxes,
    yAxisLeftLabel,
    yAxisRightLabel,
    enableDrilldown,
    enableYoYComparison,
    onContextMenu,
    formData,
    refs,
  };
}
