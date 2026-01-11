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
  TrendDirection,
  ComparisonData,
  TimeComparisonPeriod,
  HealthLevel,
  RiskLevel,
  CustomerSegment,
} from './types';

// =============================================================================
// TREND CALCULATIONS
// =============================================================================

/**
 * Calculate trend direction from percentage difference
 *
 * @example
 * getTrendDirection(5.5) // 'up'
 * getTrendDirection(-3.2) // 'down'
 * getTrendDirection(0) // 'neutral'
 */
export function getTrendDirection(percentDiff: number | null): TrendDirection {
  if (percentDiff === null || percentDiff === 0) return 'neutral';
  return percentDiff > 0 ? 'up' : 'down';
}

/**
 * Get trend icon character
 *
 * @example
 * getTrendIcon('up') // '↑'
 * getTrendIcon('down') // '↓'
 */
export function getTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
  }
}

// =============================================================================
// COMPARISON CALCULATIONS
// =============================================================================

/**
 * Calculate comparison data between current and previous values
 *
 * @example
 * calculateComparison(100, 80)
 * // { currentValue: 100, previousValue: 80, absoluteDifference: 20, percentDifference: 0.25, trend: 'up' }
 */
export function calculateComparison(
  currentValue: number | null,
  previousValue: number | null,
): ComparisonData {
  if (currentValue === null) {
    return {
      currentValue: null,
      previousValue,
      absoluteDifference: null,
      percentDifference: null,
      trend: 'neutral',
    };
  }

  if (previousValue === null || previousValue === 0) {
    return {
      currentValue,
      previousValue,
      absoluteDifference: null,
      percentDifference: null,
      trend: 'neutral',
    };
  }

  const absoluteDifference = currentValue - previousValue;
  const percentDifference = absoluteDifference / Math.abs(previousValue);
  const trend = getTrendDirection(percentDifference);

  return {
    currentValue,
    previousValue,
    absoluteDifference,
    percentDifference,
    trend,
  };
}

/**
 * Calculate MoM (Month over Month) growth rate
 *
 * @example
 * calculateMoMGrowth(110, 100) // 10 (percent)
 * calculateMoMGrowth(100, null) // null
 */
export function calculateMoMGrowth(
  current: number,
  previous: number | null,
): number | null {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate YoY (Year over Year) growth rate
 *
 * @example
 * calculateYoYGrowth(1200, 1000) // 20 (percent)
 */
export function calculateYoYGrowth(
  current: number,
  previous: number | null,
): number | null {
  // Same formula as MoM, different semantics
  return calculateMoMGrowth(current, previous);
}

// =============================================================================
// NET NEW ARR CALCULATION
// =============================================================================

/**
 * Calculate Net New ARR from components
 *
 * @example
 * calculateNetNewARR(50000, 20000, 5000, 10000) // 55000
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
 * Calculate Quick Ratio (expansion metric)
 * Quick Ratio = (New Business + Expansion) / (Contraction + Churned)
 *
 * @example
 * calculateQuickRatio(50000, 20000, 5000, 10000) // 4.67
 */
export function calculateQuickRatio(
  newBusiness: number,
  expansion: number,
  contraction: number,
  churned: number,
): number | null {
  const gains = newBusiness + expansion;
  const losses = Math.abs(contraction) + Math.abs(churned);

  if (losses === 0) return gains > 0 ? Infinity : null;
  return gains / losses;
}

/**
 * Calculate Gross Revenue Retention (GRR)
 * GRR = (Beginning ARR - Contraction - Churned) / Beginning ARR
 *
 * @example
 * calculateGRR(1000000, 20000, 30000) // 0.95 (95%)
 */
export function calculateGRR(
  beginningARR: number,
  contraction: number,
  churned: number,
): number | null {
  if (beginningARR === 0) return null;
  return (beginningARR - Math.abs(contraction) - Math.abs(churned)) / beginningARR;
}

/**
 * Calculate Net Revenue Retention (NRR)
 * NRR = (Beginning ARR + Expansion - Contraction - Churned) / Beginning ARR
 *
 * @example
 * calculateNRR(1000000, 150000, 20000, 30000) // 1.10 (110%)
 */
export function calculateNRR(
  beginningARR: number,
  expansion: number,
  contraction: number,
  churned: number,
): number | null {
  if (beginningARR === 0) return null;
  return (beginningARR + expansion - Math.abs(contraction) - Math.abs(churned)) / beginningARR;
}

// =============================================================================
// HEALTH & RISK CALCULATIONS
// =============================================================================

/**
 * Determine health level from score
 *
 * @example
 * getHealthLevel(85) // 'excellent'
 * getHealthLevel(65) // 'good'
 * getHealthLevel(45) // 'warning'
 * getHealthLevel(30) // 'critical'
 */
export function getHealthLevel(score: number): HealthLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'warning';
  return 'critical';
}

/**
 * Calculate risk level based on multiple factors
 *
 * @example
 * calculateRiskLevel(55, 25, 35, -5) // 'critical'
 */
export function calculateRiskLevel(
  healthScore: number,
  daysUntilRenewal: number,
  daysSinceActivity: number,
  npsScore: number | null,
): RiskLevel {
  // Critical: Renewal < 30 days AND health < 70
  if (daysUntilRenewal < 30 && healthScore < 70) return 'critical';

  // High: Health < 60 OR NPS < 0
  if (healthScore < 60) return 'high';
  if (npsScore !== null && npsScore < 0) return 'high';

  // Medium: Disengaged (>30 days) OR Renewal < 90 days with health < 80
  if (daysSinceActivity > 30) return 'medium';
  if (daysUntilRenewal < 90 && healthScore < 80) return 'medium';

  // Low: Minor concerns
  if (healthScore < 80 || daysUntilRenewal < 90) return 'low';

  return 'none';
}

/**
 * Determine customer segment based on ARR
 *
 * @example
 * getCustomerSegment(150000) // 'strategic'
 * getCustomerSegment(75000) // 'key'
 * getCustomerSegment(25000) // 'core'
 */
export function getCustomerSegment(arr: number): CustomerSegment {
  if (arr >= 100000) return 'strategic';
  if (arr >= 50000) return 'key';
  if (arr >= 10000) return 'core';
  if (arr >= 1000) return 'growth';
  return 'starter';
}

/**
 * Check if customer is expansion candidate
 *
 * @example
 * isExpansionCandidate(['ERP'], 85, 15) // true (single product + good health)
 * isExpansionCandidate(['ERP', 'LMS'], 60, 12) // true (strong growth)
 */
export function isExpansionCandidate(
  products: string[],
  healthScore: number,
  arrGrowthMom: number | null,
): boolean {
  // Single product + good health = cross-sell opportunity
  if (products.length === 1 && healthScore >= 70) return true;
  // Strong growth momentum
  if (arrGrowthMom !== null && arrGrowthMom > 10) return true;
  return false;
}

// =============================================================================
// PROJECTION CALCULATIONS
// =============================================================================

/**
 * ARR data point structure for projections
 */
export interface ARRProjectionPoint {
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
}

/**
 * Generate projection data based on growth rate
 *
 * @example
 * generateProjection(1000000, 0.025, 12, '2024-01')
 * // Returns 12 months of projected ARR data
 */
export function generateProjection(
  lastARR: number,
  monthlyGrowthRate: number,
  months: number,
  startMonth: string,
): ARRProjectionPoint[] {
  const projection: ARRProjectionPoint[] = [];
  let currentARR = lastARR;
  const startDate = new Date(startMonth);

  for (let i = 1; i <= months; i++) {
    const projectedARR = currentARR * (1 + monthlyGrowthRate);
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);

    projection.push({
      month: monthDate.toISOString().slice(0, 7),
      monthLabel: monthDate.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
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

/**
 * Calculate months to reach target ARR
 *
 * @example
 * monthsToTarget(1000000, 2000000, 0.05) // ~15 months
 */
export function monthsToTarget(
  currentARR: number,
  targetARR: number,
  monthlyGrowthRate: number,
): number | null {
  if (monthlyGrowthRate <= 0) return null;
  if (currentARR >= targetARR) return 0;

  // Using logarithm: n = ln(target/current) / ln(1 + rate)
  return Math.ceil(
    Math.log(targetARR / currentARR) / Math.log(1 + monthlyGrowthRate),
  );
}

// =============================================================================
// THRESHOLD CHECKS
// =============================================================================

/**
 * Check if value meets threshold condition
 *
 * @example
 * meetsThreshold(100, '>', 50) // true
 * meetsThreshold(100, 'between', 50, 150) // true
 */
export function meetsThreshold(
  value: number,
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=' | 'between',
  targetValue: number,
  targetValueUpper?: number,
): boolean {
  switch (operator) {
    case '<':
      return value < targetValue;
    case '<=':
      return value <= targetValue;
    case '>':
      return value > targetValue;
    case '>=':
      return value >= targetValue;
    case '==':
      return value === targetValue;
    case '!=':
      return value !== targetValue;
    case 'between':
      return (
        value >= targetValue && value <= (targetValueUpper ?? targetValue)
      );
    default:
      return false;
  }
}
