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
  ComparisonColorScheme,
  ThemeColors,
  GrowthThreshold,
  HealthLevel,
  RiskLevel,
  CustomerSegment,
} from './types';

// =============================================================================
// CORE COLOR PALETTES
// =============================================================================

/**
 * SM24 primary color palette
 */
export const SM24_COLORS = {
  // Primary colors
  primary: '#2E86DE',
  secondary: '#27AE60',
  accent: '#9B59B6',

  // Semantic colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  // Neutral colors
  neutral100: '#F8F9FA',
  neutral200: '#E9ECEF',
  neutral300: '#DEE2E6',
  neutral400: '#CED4DA',
  neutral500: '#ADB5BD',
  neutral600: '#6C757D',
  neutral700: '#495057',
  neutral800: '#343A40',
  neutral900: '#212529',
} as const;

// =============================================================================
// ARR COLORS
// =============================================================================

/**
 * Default color scheme for ARR components
 */
export const ARR_COLORS = {
  totalARR: '#2E86DE', // Blue - main line
  newBusiness: '#27AE60', // Green
  expansion: '#A8E6CF', // Light green
  contraction: '#F39C12', // Orange
  churned: '#E74C3C', // Red
  target: '#9B59B6', // Purple - target line
  projection: '#95A5A6', // Gray - projection
  gridLine: '#E0E0E0',
  axisLabel: '#666666',
} as const;

/**
 * Growth rate color mapping
 */
export const GROWTH_COLORS = {
  negative: '#E74C3C', // Red
  belowTarget: '#F39C12', // Yellow/Orange
  healthy: '#27AE60', // Green
} as const;

// =============================================================================
// STATUS COLORS
// =============================================================================

/**
 * Default status colors by position
 */
export const DEFAULT_STATUS_COLORS = {
  first: '#27AE60', // Green for first status
  intermediate: '#3498DB', // Blue for intermediate
  penultimate: '#F39C12', // Orange for penultimate
  lastActive: '#16A085', // Teal for last active
  completed: '#95A5A6', // Gray for completed
  cancelled: '#E74C3C', // Red for cancelled
  archived: '#2C3E50', // Dark gray for archived
} as const;

/**
 * Fallback colors array for dynamic status assignment
 */
export const FALLBACK_STATUS_COLORS = [
  '#27AE60', // Green
  '#F39C12', // Orange
  '#9B59B6', // Purple
  '#16A085', // Teal
  '#3498DB', // Blue
  '#95A5A6', // Gray
] as const;

// =============================================================================
// HEALTH & RISK COLORS
// =============================================================================

/**
 * Health level colors
 */
export const HEALTH_COLORS: Record<HealthLevel, string> = {
  excellent: '#27AE60',
  good: '#F1C40F',
  warning: '#E67E22',
  critical: '#E74C3C',
};

/**
 * Risk level colors
 */
export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#C0392B',
  high: '#E74C3C',
  medium: '#F39C12',
  low: '#F1C40F',
  none: '#27AE60',
};

/**
 * Customer segment colors
 */
export const SEGMENT_COLORS: Record<CustomerSegment, string> = {
  strategic: '#8E44AD',
  key: '#2980B9',
  core: '#27AE60',
  growth: '#F39C12',
  starter: '#95A5A6',
};

// =============================================================================
// PRODUCT COLORS
// =============================================================================

/**
 * Product-specific colors
 */
export const PRODUCT_COLORS: Record<string, string> = {
  'Smartup ERP': '#2ECC71',
  ERP: '#2ECC71',
  LMS: '#3498DB',
  Helpdesk: '#9B59B6',
  'Future Products': '#E67E22',
  Analytics: '#1ABC9C',
  CRM: '#E74C3C',
  default: '#95A5A6',
};

// =============================================================================
// TREND COLOR UTILITIES
// =============================================================================

/**
 * Get trend color based on direction and color scheme
 *
 * @example
 * getTrendColor('up', ComparisonColorScheme.GreenUp, theme)
 * // Returns green for positive trend
 */
export function getTrendColor(
  trend: TrendDirection,
  scheme: ComparisonColorScheme,
  theme: ThemeColors,
): string {
  if (trend === 'neutral') return theme.colorTextTertiary;

  const isPositive = trend === 'up';
  const greenForPositive = scheme === ComparisonColorScheme.GreenUp;

  if (isPositive) {
    return greenForPositive ? theme.colorSuccess : theme.colorError;
  }
  return greenForPositive ? theme.colorError : theme.colorSuccess;
}

/**
 * Get growth rate color based on thresholds
 *
 * @example
 * getGrowthColor(5.5, { critical: 0, warning: 2, healthy: 5 })
 * // Returns green (healthy)
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

// =============================================================================
// STATUS COLOR UTILITIES
// =============================================================================

/**
 * Status definition interface for color calculation
 */
interface StatusDefinition {
  statusColor?: string;
  isCancelled?: boolean;
  isFinal?: boolean;
}

/**
 * Get status color based on position and type
 *
 * @example
 * getStatusColor({ statusColor: '#FF0000' }, 0, 5) // "#FF0000"
 * getStatusColor({ isCancelled: true }, 2, 5) // cancelled color
 */
export function getStatusColor(
  status: StatusDefinition,
  index: number,
  total: number,
): string {
  // If color is defined in status, use it
  if (status.statusColor && status.statusColor.startsWith('#')) {
    return status.statusColor;
  }

  // Fallback based on position and type
  if (status.isCancelled) {
    return DEFAULT_STATUS_COLORS.cancelled;
  }

  if (status.isFinal) {
    return DEFAULT_STATUS_COLORS.archived;
  }

  if (index === 0) {
    return DEFAULT_STATUS_COLORS.first;
  }

  if (index === total - 1) {
    return DEFAULT_STATUS_COLORS.lastActive;
  }

  if (index === total - 2) {
    return DEFAULT_STATUS_COLORS.penultimate;
  }

  // Use fallback colors for intermediate statuses
  return FALLBACK_STATUS_COLORS[index % FALLBACK_STATUS_COLORS.length];
}

// =============================================================================
// COLOR TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Get tinted background color from a hex color
 *
 * @example
 * getTintedBackground('#27AE60', 0.1) // "rgba(39, 174, 96, 0.1)"
 */
export function getTintedBackground(
  color: string,
  opacity: number = 0.03,
): string {
  // Convert hex to RGB and create rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Lighten a hex color by percentage
 *
 * @example
 * lightenColor('#27AE60', 20) // lighter green
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

/**
 * Darken a hex color by percentage
 *
 * @example
 * darkenColor('#27AE60', 20) // darker green
 */
export function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent);
}

/**
 * Check if a color is light (for determining text color)
 *
 * @example
 * isLightColor('#FFFFFF') // true
 * isLightColor('#000000') // false
 */
export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Get contrasting text color for a background
 *
 * @example
 * getContrastTextColor('#27AE60') // '#FFFFFF'
 * getContrastTextColor('#F1C40F') // '#000000'
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}

// =============================================================================
// HEALTH & RISK COLOR UTILITIES
// =============================================================================

/**
 * Get color for health level
 */
export function getHealthColor(level: HealthLevel): string {
  return HEALTH_COLORS[level];
}

/**
 * Get color for risk level
 */
export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level];
}

/**
 * Get color for customer segment
 */
export function getSegmentColor(segment: CustomerSegment): string {
  return SEGMENT_COLORS[segment];
}

/**
 * Get color for product
 */
export function getProductColor(product: string): string {
  return PRODUCT_COLORS[product] || PRODUCT_COLORS.default;
}

// =============================================================================
// CHART COLOR SCALE
// =============================================================================

/**
 * Generate color scale for charts
 *
 * @example
 * generateColorScale(5) // Array of 5 colors
 */
export function generateColorScale(count: number): string[] {
  const baseColors = [
    '#27AE60',
    '#3498DB',
    '#9B59B6',
    '#F39C12',
    '#E74C3C',
    '#16A085',
    '#2C3E50',
    '#E67E22',
    '#1ABC9C',
    '#8E44AD',
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // If more colors needed, generate variations
  const result: string[] = [...baseColors];
  let idx = 0;
  while (result.length < count) {
    result.push(lightenColor(baseColors[idx % baseColors.length], 20));
    idx++;
  }
  return result;
}
