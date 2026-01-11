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

// =============================================================================
// TREND & COMPARISON TYPES
// =============================================================================

/**
 * Trend direction for comparison indicators
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Color scheme for comparison indicators
 */
export enum ComparisonColorScheme {
  GreenUp = 'green_up', // Green for positive, red for negative
  RedUp = 'red_up', // Red for positive, green for negative (e.g., costs)
}

/**
 * Supported time comparison periods
 */
export type TimeComparisonPeriod =
  | 'DoD' // Day over Day
  | 'WoW' // Week over Week
  | 'MoM' // Month over Month
  | 'QoQ' // Quarter over Quarter
  | 'YoY' // Year over Year
  | 'custom' // Custom offset
  | 'none'; // No comparison

/**
 * Comparison result data
 */
export interface ComparisonData {
  currentValue: number | null;
  previousValue: number | null;
  absoluteDifference: number | null;
  percentDifference: number | null;
  trend: TrendDirection;
}

// =============================================================================
// CURRENCY & LOCALE TYPES
// =============================================================================

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: string; // ISO 4217 code: 'USD', 'EUR', 'UZS', 'RUB'
  symbol: string; // Display symbol: '$', '€', 'сум', '₽'
  position: 'before' | 'after';
  decimals: number;
}

/**
 * Scale labels for number abbreviations
 */
export interface ScaleLabels {
  thousands: string; // 'K' or 'тыс.' or 'минг'
  millions: string; // 'M' or 'млн.'
  billions: string; // 'B' or 'млрд.'
  trillions?: string; // 'T' or 'трлн.'
}

/**
 * Full locale configuration for number formatting
 */
export interface SM24NumberLocale {
  decimal: string;
  thousands: string;
  grouping: number[];
  currency: [string, string]; // [prefix, suffix]
  shortScale: ScaleLabels & { trillions: string };
}

/**
 * Simple ARR locale configuration
 */
export interface SM24ARRLocale {
  decimal: string;
  thousands: string;
  currency: string;
  currencyPosition: 'before' | 'after';
}

// =============================================================================
// SUPPORTED LOCALES
// =============================================================================

export type SM24LocaleCode = 'en' | 'ru' | 'uz' | 'en-US' | 'ru-RU' | 'uz-UZ';

// =============================================================================
// THEME COLORS INTERFACE
// =============================================================================

/**
 * Theme colors needed for trend color calculation
 */
export interface ThemeColors {
  colorSuccess: string;
  colorError: string;
  colorTextTertiary: string;
}

// =============================================================================
// HEALTH & RISK TYPES
// =============================================================================

export type HealthLevel = 'excellent' | 'good' | 'warning' | 'critical';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type CustomerSegment =
  | 'strategic'
  | 'key'
  | 'core'
  | 'growth'
  | 'starter';

// =============================================================================
// GROWTH THRESHOLD
// =============================================================================

/**
 * Growth threshold configuration
 */
export interface GrowthThreshold {
  critical: number; // Below this = red
  warning: number; // Below this = yellow
  healthy: number; // Above this = green
}
