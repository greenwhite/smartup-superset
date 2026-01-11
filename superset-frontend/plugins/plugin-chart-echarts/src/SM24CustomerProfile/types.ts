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

export type ProfileTab =
  | 'overview'
  | 'products'
  | 'revenue'
  | 'health'
  | 'activity'
  | 'contacts'
  | 'documents';

export type HealthStatus = 'excellent' | 'healthy' | 'at_risk' | 'critical';
export type ChurnRiskLevel = 'low' | 'medium' | 'high';
export type NPSCategory = 'promoter' | 'passive' | 'detractor';
export type RenewalUrgency = 'low' | 'medium' | 'high' | 'critical';
export type CustomerSegment = 'strategic' | 'key' | 'core' | 'growing' | 'at_risk';
export type ActivityType = 'meeting' | 'call' | 'email' | 'support_ticket' | 'note';
export type PaymentHealth = 'good' | 'acceptable' | 'poor' | 'critical';
export type ActivityFreshness = 'active' | 'normal' | 'disengaged' | 'inactive';
export type AlertType = 'danger' | 'warning' | 'info' | 'success';

// =============================================================================
// CUSTOMER DATA INTERFACES
// =============================================================================

/**
 * Company/Customer basic information
 */
export interface CustomerInfo {
  customerId: string;
  customerName: string;
  legalName?: string;
  inn?: string;
  industry: string;
  region: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  employeeCount?: number;
  companyType?: string;
  customerSince: string;
  customerAgeDays: number;
}

/**
 * CSM (Customer Success Manager) information
 */
export interface CSMInfo {
  csmId?: string;
  csmName: string;
  csmEmail?: string;
  csmPhone?: string;
  csmAvatar?: string;
}

/**
 * Revenue metrics
 */
export interface RevenueMetrics {
  currentArr: number;
  currentMonthArr: number;
  prevMonthArr: number;
  arrGrowthMom: number | null;
  firstPaymentDate?: string;
  lastPaymentDate?: string;
  ltv: number;
  totalPaid: number;
  totalInvoices: number;
  avgPaymentDelay: number;
  paymentHealth: PaymentHealth;
  arrTrendData?: number[]; // Last 6 months for sparkline
}

/**
 * Product usage information
 */
export interface ProductUsage {
  activeProducts: string[];
  productCount: number;
  lastActiveDate?: string;
  daysSinceActive: number;
  totalUsers: number;
  avgFeatureAdoption: number;
}

/**
 * Health metrics
 */
export interface HealthMetrics {
  healthScore: number;
  healthStatus: HealthStatus;
  npsScore: number | null;
  npsCategory: NPSCategory | null;
  csatScore: number | null;
  supportTicketCount30d: number;
  avgResolutionTimeHours: number;
  churnRiskScore: number;
  churnRiskCategory: ChurnRiskLevel;
  // Health score breakdown
  healthBreakdown?: {
    productUsage: number;
    paymentHistory: number;
    supportEngagement: number;
    featureAdoption: number;
    npsCsat: number;
    activityLevel: number;
  };
}

/**
 * Renewal information
 */
export interface RenewalInfo {
  renewalDate?: string;
  contractEndDate?: string;
  contractTermMonths?: number;
  daysToRenewal: number;
  renewalUrgency: RenewalUrgency;
}

/**
 * Activity summary
 */
export interface ActivitySummary {
  totalInteractions: number;
  lastInteractionDate?: string;
  meetingsCount: number;
  callsCount: number;
  emailsCount: number;
  ticketsCount: number;
  activityFreshness: ActivityFreshness;
}

/**
 * Single activity item for timeline
 */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description?: string;
  userId?: string;
  userName?: string;
}

/**
 * Alert/notification item
 */
export interface ProfileAlert {
  type: AlertType;
  title: string;
  message: string;
  actionLabel?: string;
  actionTarget?: string;
}

/**
 * Complete customer profile data
 */
export interface CustomerProfileData {
  // Basic info
  customer: CustomerInfo;
  csm: CSMInfo;

  // Metrics
  revenue: RevenueMetrics;
  products: ProductUsage;
  health: HealthMetrics;
  renewal: RenewalInfo;
  activity: ActivitySummary;

  // Timeline
  recentActivities: ActivityItem[];

  // Computed
  segment: CustomerSegment;
  alerts: ProfileAlert[];
  isOnWatchlist?: boolean;
  tags?: string[];
  notes?: string;
}

// =============================================================================
// COLORS & CONSTANTS
// =============================================================================

export const PROFILE_COLORS = {
  // Primary
  primary: '#3498DB',
  primaryLight: '#5DADE2',
  primaryDark: '#2980B9',

  // Status
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',

  // Health levels
  healthExcellent: '#27AE60',
  healthHealthy: '#2ECC71',
  healthAtRisk: '#F39C12',
  healthCritical: '#E74C3C',

  // Churn risk
  churnLow: '#27AE60',
  churnMedium: '#F39C12',
  churnHigh: '#E74C3C',

  // NPS
  npsPromoter: '#27AE60',
  npsPassive: '#F1C40F',
  npsDetractor: '#E74C3C',

  // Neutral
  neutral: '#95A5A6',
  neutralLight: '#BDC3C7',
  neutralDark: '#7F8C8D',

  // Background
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  borderColor: '#E9ECEF',
};

export const HEALTH_STATUS_CONFIG: Record<HealthStatus, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: PROFILE_COLORS.healthExcellent },
  healthy: { label: 'Healthy', color: PROFILE_COLORS.healthHealthy },
  at_risk: { label: 'At Risk', color: PROFILE_COLORS.healthAtRisk },
  critical: { label: 'Critical', color: PROFILE_COLORS.healthCritical },
};

export const CHURN_RISK_CONFIG: Record<ChurnRiskLevel, { label: string; color: string }> = {
  low: { label: 'Low Risk', color: PROFILE_COLORS.churnLow },
  medium: { label: 'Medium Risk', color: PROFILE_COLORS.churnMedium },
  high: { label: 'High Risk', color: PROFILE_COLORS.churnHigh },
};

export const NPS_CATEGORY_CONFIG: Record<NPSCategory, { label: string; color: string }> = {
  promoter: { label: 'Promoter', color: PROFILE_COLORS.npsPromoter },
  passive: { label: 'Passive', color: PROFILE_COLORS.npsPassive },
  detractor: { label: 'Detractor', color: PROFILE_COLORS.npsDetractor },
};

export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { label: string; icon: string }> = {
  meeting: { label: 'Meeting', icon: '📅' },
  call: { label: 'Call', icon: '📞' },
  email: { label: 'Email', icon: '✉️' },
  support_ticket: { label: 'Support Ticket', icon: '🎫' },
  note: { label: 'Note', icon: '📝' },
};

export const SEGMENT_CONFIG: Record<CustomerSegment, { label: string; color: string }> = {
  strategic: { label: 'Strategic', color: '#8E44AD' },
  key: { label: 'Key', color: '#2980B9' },
  core: { label: 'Core', color: '#27AE60' },
  growing: { label: 'Growing', color: '#F39C12' },
  at_risk: { label: 'At Risk', color: '#E74C3C' },
};

export const TAB_CONFIG: Record<ProfileTab, { label: string; icon: string }> = {
  overview: { label: 'Overview', icon: '📊' },
  products: { label: 'Products & Usage', icon: '📦' },
  revenue: { label: 'Revenue History', icon: '💰' },
  health: { label: 'Health & Risk', icon: '❤️' },
  activity: { label: 'Activity Timeline', icon: '📋' },
  contacts: { label: 'Contacts', icon: '👥' },
  documents: { label: 'Documents', icon: '📁' },
};

// =============================================================================
// FORM DATA
// =============================================================================

export interface SM24CustomerProfileFormData extends QueryFormData {
  // Column mappings
  customerIdColumn?: string;
  customerNameColumn?: string;
  legalNameColumn?: string;
  innColumn?: string;
  industryColumn?: string;
  regionColumn?: string;
  cityColumn?: string;
  addressColumn?: string;
  phoneColumn?: string;
  emailColumn?: string;
  websiteColumn?: string;
  employeeCountColumn?: string;
  companyTypeColumn?: string;
  customerSinceColumn?: string;

  // CSM columns
  csmIdColumn?: string;
  csmNameColumn?: string;
  csmEmailColumn?: string;
  csmPhoneColumn?: string;

  // Revenue columns
  currentArrColumn?: string;
  arrGrowthColumn?: string;
  ltvColumn?: string;
  totalPaidColumn?: string;

  // Health columns
  healthScoreColumn?: string;
  npsScoreColumn?: string;
  csatScoreColumn?: string;
  churnRiskScoreColumn?: string;

  // Renewal columns
  renewalDateColumn?: string;
  contractEndDateColumn?: string;

  // Product columns
  activeProductsColumn?: string;
  totalUsersColumn?: string;
  lastActiveDateColumn?: string;

  // Display options
  defaultTab?: ProfileTab;
  showAlerts?: boolean;
  showQuickActions?: boolean;
  showWatchlistToggle?: boolean;
  showExportButton?: boolean;
  showTabs?: ProfileTab[];

  // Thresholds
  healthCriticalThreshold?: number;
  healthAtRiskThreshold?: number;
  renewalUrgentDays?: number;
  renewalHighDays?: number;
  inactivityAlertDays?: number;

  // Permissions
  showFinancialData?: boolean;
  showSensitiveData?: boolean;
  allowEditing?: boolean;

  // Interactivity
  enableDrilldown?: boolean;
  enableQuickActions?: boolean;

  // Formatting
  locale?: string;
  dateFormat?: string;
  currencyFormat?: string;
}

// =============================================================================
// CHART PROPS
// =============================================================================

export interface SM24CustomerProfileChartProps extends ChartProps {
  formData: SM24CustomerProfileFormData;
}

export interface SM24CustomerProfileVizProps {
  className?: string;
  width: number;
  height: number;

  // Data
  profile: CustomerProfileData | null;
  loading?: boolean;
  error?: string;

  // Display options
  defaultTab: ProfileTab;
  showAlerts: boolean;
  showQuickActions: boolean;
  showWatchlistToggle: boolean;
  showExportButton: boolean;
  visibleTabs: ProfileTab[];

  // Permissions
  showFinancialData: boolean;
  showSensitiveData: boolean;
  allowEditing: boolean;

  // Formatting
  formatCurrency: (value: number) => string;
  formatPercent: (value: number | null) => string;
  formatDate: (date: string) => string;
  formatRelativeDate: (date: string) => string;

  // Interactivity
  enableDrilldown: boolean;
  onTabChange?: (tab: ProfileTab) => void;
  onDrilldown?: (target: string, filters: Record<string, unknown>) => void;
  onQuickAction?: (action: string, data?: Record<string, unknown>) => void;
  onWatchlistToggle?: (customerId: string, isWatched: boolean) => void;
  onExport?: (format: 'pdf' | 'excel' | 'email') => void;
  onClose?: () => void;

  // Context menu drilldown
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;

  // Form data for building drill filters
  formData: SM24CustomerProfileFormData;

  // Refs
  refs: Refs;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get health status from score
 */
export function getHealthStatus(score: number): HealthStatus {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'healthy';
  if (score >= 50) return 'at_risk';
  return 'critical';
}

/**
 * Get churn risk level from score
 */
export function getChurnRiskLevel(score: number): ChurnRiskLevel {
  if (score <= 33) return 'low';
  if (score <= 66) return 'medium';
  return 'high';
}

/**
 * Get NPS category from score
 */
export function getNPSCategory(score: number | null): NPSCategory | null {
  if (score === null) return null;
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

/**
 * Calculate renewal urgency
 */
export function getRenewalUrgency(
  daysToRenewal: number,
  healthScore: number,
): RenewalUrgency {
  if (daysToRenewal < 30 && healthScore < 70) return 'critical';
  if (daysToRenewal < 60 && healthScore < 80) return 'high';
  if (daysToRenewal < 90) return 'medium';
  return 'low';
}

/**
 * Get customer segment from metrics
 */
export function getCustomerSegment(
  arr: number,
  arrGrowth: number | null,
  healthScore: number,
): CustomerSegment {
  if (healthScore < 60 || (arrGrowth !== null && arrGrowth < -10)) return 'at_risk';
  if (arr >= 100000) return 'strategic';
  if (arr >= 50000) return 'key';
  if (arrGrowth !== null && arrGrowth > 20) return 'growing';
  return 'core';
}

/**
 * Get payment health from average delay
 */
export function getPaymentHealth(avgDelayDays: number): PaymentHealth {
  if (avgDelayDays < 3) return 'good';
  if (avgDelayDays < 7) return 'acceptable';
  if (avgDelayDays < 14) return 'poor';
  return 'critical';
}

/**
 * Get activity freshness from days since last interaction
 */
export function getActivityFreshness(daysSinceActivity: number): ActivityFreshness {
  if (daysSinceActivity < 14) return 'active';
  if (daysSinceActivity < 30) return 'normal';
  if (daysSinceActivity < 60) return 'disengaged';
  return 'inactive';
}

/**
 * Generate alerts based on profile data
 */
export function generateAlerts(profile: CustomerProfileData): ProfileAlert[] {
  const alerts: ProfileAlert[] = [];

  // High churn risk + upcoming renewal
  if (
    profile.health.churnRiskCategory === 'high' &&
    profile.renewal.daysToRenewal < 30
  ) {
    alerts.push({
      type: 'danger',
      title: 'High Churn Risk',
      message: `Immediate attention required. Renewal in ${profile.renewal.daysToRenewal} days with high churn risk.`,
      actionLabel: 'View Risk Analysis',
      actionTarget: 'SM24-ChurnRiskAnalysis',
    });
  }

  // Upcoming renewal
  if (profile.renewal.daysToRenewal < 30 && profile.renewal.daysToRenewal > 0) {
    alerts.push({
      type: 'warning',
      title: 'Upcoming Renewal',
      message: `Renewal in ${profile.renewal.daysToRenewal} days. Review renewal strategy.`,
      actionLabel: 'View Renewal Playbook',
      actionTarget: 'SM24-RenewalPlaybook',
    });
  }

  // Low health score
  if (profile.health.healthScore < 60) {
    alerts.push({
      type: 'warning',
      title: 'Health Score Below Threshold',
      message: `Health score is ${profile.health.healthScore}/100. Schedule a check-in call.`,
      actionLabel: 'View Health Details',
      actionTarget: 'SM24-HealthScoreDetails',
    });
  }

  // Inactive customer
  if (profile.activity.activityFreshness === 'inactive') {
    alerts.push({
      type: 'info',
      title: 'Customer Inactive',
      message: 'No activity in the last 60 days. Consider reaching out.',
      actionLabel: 'Log Activity',
      actionTarget: 'logActivity',
    });
  }

  // Expansion opportunity
  if (
    profile.health.healthScore > 85 &&
    profile.products.productCount === 1 &&
    profile.health.npsCategory === 'promoter'
  ) {
    alerts.push({
      type: 'success',
      title: 'Expansion Opportunity',
      message: 'High health score with single product. Cross-sell opportunity.',
      actionLabel: 'View Opportunities',
      actionTarget: 'SM24-ExpansionOpportunities',
    });
  }

  return alerts;
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

/**
 * Format percentage with sign
 */
export function formatPercentValue(value: number | null): string {
  if (value === null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format relative date (e.g., "3 days ago")
 */
export function formatRelativeDateValue(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Calculate days since date
 */
export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days until date
 */
export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_FORM_DATA: Partial<SM24CustomerProfileFormData> = {
  defaultTab: 'overview',
  showAlerts: true,
  showQuickActions: true,
  showWatchlistToggle: true,
  showExportButton: true,
  showTabs: ['overview', 'products', 'revenue', 'health', 'activity', 'contacts', 'documents'],
  healthCriticalThreshold: 50,
  healthAtRiskThreshold: 70,
  renewalUrgentDays: 30,
  renewalHighDays: 60,
  inactivityAlertDays: 60,
  showFinancialData: true,
  showSensitiveData: false,
  allowEditing: false,
  enableDrilldown: true,
  enableQuickActions: true,
  locale: 'en-US',
  dateFormat: 'MMM DD, YYYY',
  currencyFormat: '$#,##0',
};
