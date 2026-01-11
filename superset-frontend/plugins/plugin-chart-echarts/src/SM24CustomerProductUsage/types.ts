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
  QueryFormData,
  ChartProps,
  BinaryQueryObjectFilterClause,
  ContextMenuFilters,
} from '@superset-ui/core';
import { Refs } from '../types';

// =============================================================================
// ENUMS & TYPES
// =============================================================================

export type ProductStatus = 'active' | 'trial' | 'inactive' | 'churned';
export type LicenseType = 'enterprise' | 'professional' | 'standard' | 'trial' | 'free';
export type TimeRange = '7d' | '30d' | '90d' | '1y';
export type ChartType = 'line' | 'bar' | 'area';
export type AdoptionLevel = 'excellent' | 'good' | 'moderate' | 'low' | 'critical';

// =============================================================================
// DATA INTERFACES
// =============================================================================

/**
 * Product usage summary for a single product
 */
export interface ProductUsageSummary {
  productLine: string;
  productName: string;
  productIcon?: string;
  isActive: boolean;
  status: ProductStatus;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  daysUntilExpiry: number;
  licenseType: LicenseType;
  licensedUsers: number;
  activeUsers30d: number;
  activeUsers7d: number;
  activeUsersPercentage: number;
  totalLogins30d: number;
  avgSessionDurationMinutes: number;
  featureAdoptionScore: number;
  adoptionLevel: AdoptionLevel;
  arrContribution: number;
  mrr: number;
  // Computed
  usageTrend: number | null; // 7d vs 30d comparison
  isTrialExpiring: boolean;
  isUnderutilized: boolean;
}

/**
 * Usage trend data point
 */
export interface UsageTrendPoint {
  weekStart: string;
  weekEnd: string;
  productLine: string;
  avgDau: number;
  weeklySessions: number;
  avgDurationMinutes: number;
}

/**
 * Feature usage data
 */
export interface FeatureUsage {
  productLine: string;
  featureName: string;
  featureCategory: string;
  usageCount30d: number;
  uniqueUsers30d: number;
  isPremiumFeature: boolean;
  usagePercentage: number; // % of active users using this feature
}

/**
 * Complete product usage data for a customer
 */
export interface CustomerProductUsageData {
  customerId: string;
  customerName: string;
  products: ProductUsageSummary[];
  usageTrends: UsageTrendPoint[];
  featureUsage: FeatureUsage[];
  // Summary stats
  totalProducts: number;
  activeProducts: number;
  totalLicensedUsers: number;
  totalActiveUsers: number;
  overallAdoptionScore: number;
  totalArrContribution: number;
}

// =============================================================================
// COLORS & CONSTANTS
// =============================================================================

export const PRODUCT_COLORS: Record<string, string> = {
  'Smartup ERP': '#3498DB',
  'ERP': '#3498DB',
  'LMS': '#9B59B6',
  'Helpdesk': '#16A085',
  'Analytics': '#E67E22',
  'CRM': '#E74C3C',
  'Integration': '#1ABC9C',
  'Mobile': '#F39C12',
  'default': '#95A5A6',
};

export const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#27AE60' },
  trial: { label: 'Trial', color: '#F39C12' },
  inactive: { label: 'Inactive', color: '#95A5A6' },
  churned: { label: 'Churned', color: '#E74C3C' },
};

export const LICENSE_CONFIG: Record<LicenseType, { label: string; color: string }> = {
  enterprise: { label: 'Enterprise', color: '#8E44AD' },
  professional: { label: 'Professional', color: '#2980B9' },
  standard: { label: 'Standard', color: '#27AE60' },
  trial: { label: 'Trial', color: '#F39C12' },
  free: { label: 'Free', color: '#95A5A6' },
};

export const ADOPTION_CONFIG: Record<AdoptionLevel, { label: string; color: string; min: number }> = {
  excellent: { label: 'Excellent', color: '#27AE60', min: 80 },
  good: { label: 'Good', color: '#2ECC71', min: 60 },
  moderate: { label: 'Moderate', color: '#F1C40F', min: 40 },
  low: { label: 'Low', color: '#E67E22', min: 20 },
  critical: { label: 'Critical', color: '#E74C3C', min: 0 },
};

export const CHART_COLORS = {
  dau: '#3498DB',
  sessions: '#2ECC71',
  duration: '#9B59B6',
  grid: '#E0E0E0',
  annotation: '#E74C3C',
};

// =============================================================================
// FORM DATA
// =============================================================================

export interface SM24CustomerProductUsageFormData extends QueryFormData {
  // Column mappings - Product
  productLineColumn?: string;
  productNameColumn?: string;
  isActiveColumn?: string;
  subscriptionStartColumn?: string;
  subscriptionEndColumn?: string;
  licenseTypeColumn?: string;
  licensedUsersColumn?: string;

  // Column mappings - Usage metrics
  activeUsers30dColumn?: string;
  activeUsers7dColumn?: string;
  totalLogins30dColumn?: string;
  avgSessionDurationColumn?: string;
  featureAdoptionColumn?: string;
  arrContributionColumn?: string;
  mrrColumn?: string;

  // Column mappings - Trends
  weekStartColumn?: string;
  avgDauColumn?: string;
  weeklySessionsColumn?: string;

  // Column mappings - Features
  featureNameColumn?: string;
  featureCategoryColumn?: string;
  featureUsageCountColumn?: string;
  isPremiumFeatureColumn?: string;

  // Display options
  defaultTimeRange?: TimeRange;
  defaultChartType?: ChartType;
  showInactiveProducts?: boolean;
  showFeatureBreakdown?: boolean;
  maxFeaturesShown?: number;
  enableExpandableRows?: boolean;

  // Thresholds
  lowAdoptionThreshold?: number;
  highAdoptionThreshold?: number;
  trialExpiryAlertDays?: number;
  underutilizationThreshold?: number;

  // Chart options
  showDauLine?: boolean;
  showSessionsBars?: boolean;
  showAnnotations?: boolean;

  // Interactivity
  enableDrilldown?: boolean;
  enableExport?: boolean;

  // Formatting
  locale?: string;
  currencyFormat?: string;
}

// =============================================================================
// CHART PROPS
// =============================================================================

export interface SM24CustomerProductUsageChartProps extends ChartProps {
  formData: SM24CustomerProductUsageFormData;
}

export interface SM24CustomerProductUsageVizProps {
  className?: string;
  width: number;
  height: number;

  // Data
  data: CustomerProductUsageData | null;
  loading?: boolean;
  error?: string;

  // Selected state
  selectedProduct: string | null;
  selectedTimeRange: TimeRange;
  selectedChartType: ChartType;

  // Display options
  showInactiveProducts: boolean;
  showFeatureBreakdown: boolean;
  maxFeaturesShown: number;
  enableExpandableRows: boolean;

  // Thresholds
  lowAdoptionThreshold: number;
  highAdoptionThreshold: number;

  // Chart options
  showDauLine: boolean;
  showSessionsBars: boolean;
  showAnnotations: boolean;

  // Formatting
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
  formatDuration: (minutes: number) => string;
  formatDate: (date: string) => string;

  // Interactivity
  enableDrilldown: boolean;
  enableExport: boolean;
  onProductSelect?: (productLine: string | null) => void;
  onTimeRangeChange?: (range: TimeRange) => void;
  onChartTypeChange?: (type: ChartType) => void;
  onFeatureClick?: (productLine: string, featureName: string) => void;
  onUserCountClick?: (productLine: string) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;

  // Context menu drilldown
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;

  // Form data for building drill filters
  formData: SM24CustomerProductUsageFormData;

  // Refs
  refs: Refs;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get product color
 */
export function getProductColor(productLine: string): string {
  return PRODUCT_COLORS[productLine] || PRODUCT_COLORS.default;
}

/**
 * Get product status from data
 */
export function getProductStatus(
  isActive: boolean,
  subscriptionEndDate?: string,
  licenseType?: LicenseType,
): ProductStatus {
  if (!isActive) return 'inactive';
  if (licenseType === 'trial') return 'trial';
  if (subscriptionEndDate) {
    const daysUntil = daysUntilDate(subscriptionEndDate);
    if (daysUntil < 0) return 'churned';
  }
  return 'active';
}

/**
 * Get adoption level from score
 */
export function getAdoptionLevel(score: number): AdoptionLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'critical';
}

/**
 * Calculate usage trend (7d vs 30d average)
 */
export function calculateUsageTrend(
  activeUsers7d: number,
  activeUsers30d: number,
): number | null {
  if (activeUsers30d === 0) return null;
  const avg30d = activeUsers30d / 4; // Approximate weekly average
  if (avg30d === 0) return null;
  return ((activeUsers7d - avg30d) / avg30d) * 100;
}

/**
 * Check if trial is expiring soon
 */
export function isTrialExpiring(
  licenseType: LicenseType,
  subscriptionEndDate?: string,
  alertDays = 14,
): boolean {
  if (licenseType !== 'trial' || !subscriptionEndDate) return false;
  const daysUntil = daysUntilDate(subscriptionEndDate);
  return daysUntil >= 0 && daysUntil <= alertDays;
}

/**
 * Check if product is underutilized
 */
export function isUnderutilized(
  activeUsers: number,
  licensedUsers: number,
  threshold = 30,
): boolean {
  if (licensedUsers === 0) return false;
  const utilizationRate = (activeUsers / licensedUsers) * 100;
  return utilizationRate < threshold;
}

/**
 * Calculate days until date
 */
export function daysUntilDate(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format week range
 */
export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
}

/**
 * Format duration in minutes to human readable
 */
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format large numbers (K, M)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

/**
 * Format currency value
 */
export function formatCurrencyValue(value: number, locale = 'en-US'): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_FORM_DATA: Partial<SM24CustomerProductUsageFormData> = {
  defaultTimeRange: '90d',
  defaultChartType: 'line',
  showInactiveProducts: false,
  showFeatureBreakdown: true,
  maxFeaturesShown: 20,
  enableExpandableRows: true,
  lowAdoptionThreshold: 40,
  highAdoptionThreshold: 80,
  trialExpiryAlertDays: 14,
  underutilizationThreshold: 30,
  showDauLine: true,
  showSessionsBars: true,
  showAnnotations: true,
  enableDrilldown: true,
  enableExport: true,
  locale: 'en-US',
  currencyFormat: '$#,##0',
};
