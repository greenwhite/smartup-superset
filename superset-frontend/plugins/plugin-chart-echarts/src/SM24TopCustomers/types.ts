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
// CUSTOMER DATA TYPES
// =============================================================================

export type CustomerSegment = 'strategic' | 'key' | 'core' | 'growth' | 'starter';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type HealthLevel = 'excellent' | 'good' | 'warning' | 'critical';

export interface CustomerData {
  rank: number;
  customerId: string;
  customerName: string;
  industry: string;
  region: string;
  regionFlag?: string;
  totalArr: number;
  arrGrowthMom: number | null;
  products: string[];
  customerSince: string;
  tenureMonths: number;
  healthScore: number;
  renewalDate: string;
  daysUntilRenewal: number;
  accountManager: string;
  accountManagerAvatar?: string;
  lastActivityDate: string;
  daysSinceActivity: number;
  npsScore: number | null;
  // Computed fields
  segment: CustomerSegment;
  riskLevel: RiskLevel;
  healthLevel: HealthLevel;
  isTopTen: boolean;
  isAtRisk: boolean;
  isDisengaged: boolean;
  isExpansionCandidate: boolean;
  isRenewalUrgent: boolean;
}

export interface CustomerSummary {
  totalCustomers: number;
  totalARR: number;
  percentOfCompanyARR: number;
  averageHealthScore: number;
  customersAtRisk: number;
  criticalRenewals: number;
  upcomingRenewals: number;
  topTenConcentration: number;
}

// =============================================================================
// REGION FLAGS
// =============================================================================

export const REGION_FLAGS: Record<string, string> = {
  'North America': '🇺🇸',
  'USA': '🇺🇸',
  'US': '🇺🇸',
  'Europe': '🇪🇺',
  'EU': '🇪🇺',
  'UK': '🇬🇧',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Asia': '🌏',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Russia': '🇷🇺',
  'CIS': '🇷🇺',
  'Uzbekistan': '🇺🇿',
  'UZ': '🇺🇿',
  'Kazakhstan': '🇰🇿',
  'LATAM': '🌎',
  'Brazil': '🇧🇷',
  'Middle East': '🌍',
  'UAE': '🇦🇪',
  'Global': '🌐',
};

// =============================================================================
// PRODUCT COLORS
// =============================================================================

export const PRODUCT_COLORS: Record<string, string> = {
  'Smartup ERP': '#2ECC71',
  'ERP': '#2ECC71',
  'LMS': '#3498DB',
  'Helpdesk': '#9B59B6',
  'Future Products': '#E67E22',
  'Analytics': '#1ABC9C',
  'CRM': '#E74C3C',
  'default': '#95A5A6',
};

// =============================================================================
// HEALTH & RISK COLORS
// =============================================================================

export const HEALTH_COLORS: Record<HealthLevel, string> = {
  excellent: '#27AE60',
  good: '#F1C40F',
  warning: '#E67E22',
  critical: '#E74C3C',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#C0392B',
  high: '#E74C3C',
  medium: '#F39C12',
  low: '#F1C40F',
  none: '#27AE60',
};

export const SEGMENT_COLORS: Record<CustomerSegment, string> = {
  strategic: '#8E44AD',
  key: '#2980B9',
  core: '#27AE60',
  growth: '#F39C12',
  starter: '#95A5A6',
};

// =============================================================================
// SEGMENT DEFINITIONS
// =============================================================================

export const SEGMENT_DEFINITIONS: Record<CustomerSegment, { name: string; minARR: number; maxARR: number }> = {
  strategic: { name: 'Strategic', minARR: 100000, maxARR: Infinity },
  key: { name: 'Key', minARR: 50000, maxARR: 100000 },
  core: { name: 'Core', minARR: 10000, maxARR: 50000 },
  growth: { name: 'Growth', minARR: 1000, maxARR: 10000 },
  starter: { name: 'Starter', minARR: 0, maxARR: 1000 },
};

// =============================================================================
// COLUMN DEFINITIONS
// =============================================================================

export interface ColumnDefinition {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  sortable: boolean;
  align: 'left' | 'center' | 'right';
  visible: boolean;
  mobileVisible?: boolean;
}

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { key: 'rank', label: '#', width: 50, sortable: false, align: 'center', visible: true, mobileVisible: true },
  { key: 'customerName', label: 'Customer', minWidth: 180, sortable: true, align: 'left', visible: true, mobileVisible: true },
  { key: 'totalArr', label: 'ARR', width: 120, sortable: true, align: 'right', visible: true, mobileVisible: true },
  { key: 'arrGrowthMom', label: 'MoM', width: 90, sortable: true, align: 'right', visible: true },
  { key: 'products', label: 'Products', minWidth: 150, sortable: false, align: 'left', visible: true },
  { key: 'industry', label: 'Industry', width: 120, sortable: true, align: 'left', visible: true },
  { key: 'region', label: 'Region', width: 120, sortable: true, align: 'left', visible: true },
  { key: 'tenure', label: 'Tenure', width: 100, sortable: true, align: 'left', visible: true },
  { key: 'healthScore', label: 'Health', width: 120, sortable: true, align: 'center', visible: true, mobileVisible: true },
  { key: 'renewalDate', label: 'Renewal', width: 110, sortable: true, align: 'center', visible: true },
  { key: 'accountManager', label: 'CSM', width: 120, sortable: true, align: 'left', visible: true },
  { key: 'lastActivity', label: 'Activity', width: 100, sortable: true, align: 'center', visible: true },
  { key: 'npsScore', label: 'NPS', width: 70, sortable: true, align: 'center', visible: true },
];

// =============================================================================
// FORM DATA
// =============================================================================

export interface SM24TopCustomersFormData extends QueryFormData {
  // Column mappings
  customerIdColumn?: string;
  customerNameColumn?: string;
  industryColumn?: string;
  regionColumn?: string;
  arrMetric?: string;
  growthMetric?: string;
  productsColumn?: string;
  customerSinceColumn?: string;
  healthScoreColumn?: string;
  renewalDateColumn?: string;
  accountManagerColumn?: string;
  lastActivityColumn?: string;
  npsScoreColumn?: string;

  // Display options
  rowsPerPage?: number;
  enableSearch?: boolean;
  enableMultiSort?: boolean;
  enableRowSelection?: boolean;
  enableVirtualScroll?: boolean;
  showFooterSummary?: boolean;
  showRankChanges?: boolean;
  showConcentrationAlert?: boolean;

  // Thresholds
  healthRiskThreshold?: number; // Default 60
  renewalUrgentDays?: number; // Default 30
  renewalUpcomingDays?: number; // Default 90
  inactivityAlertDays?: number; // Default 30
  concentrationAlertPercent?: number; // Default 50

  // Conditional formatting
  highlightAtRisk?: boolean;
  highlightTopTen?: boolean;
  highlightUrgentRenewals?: boolean;

  // Export
  enableExport?: boolean;
  exportLimit?: number;

  // Formatting
  locale?: string;
  dateFormat?: string;

  // Interactivity
  enableDrilldown?: boolean;
  enableQuickActions?: boolean;
}

// =============================================================================
// CHART PROPS
// =============================================================================

export interface SM24TopCustomersChartProps extends ChartProps {
  formData: SM24TopCustomersFormData;
}

export interface SM24TopCustomersVizProps {
  className?: string;
  width: number;
  height: number;

  // Data
  customers: CustomerData[];
  summary: CustomerSummary;
  companyTotalARR: number;

  // Columns
  columns: ColumnDefinition[];

  // Display options
  rowsPerPage: number;
  enableSearch: boolean;
  enableMultiSort: boolean;
  enableRowSelection: boolean;
  enableVirtualScroll: boolean;
  showFooterSummary: boolean;
  showConcentrationAlert: boolean;

  // Conditional formatting
  highlightAtRisk: boolean;
  highlightTopTen: boolean;
  highlightUrgentRenewals: boolean;

  // Formatting
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  formatDate: (date: string) => string;
  formatTenure: (months: number) => string;

  // Interactivity
  enableDrilldown: boolean;
  enableQuickActions: boolean;
  enableExport: boolean;
  onDrilldown?: (customerId: string, target: string) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  onRowSelect?: (customerIds: string[]) => void;

  // Context menu drilldown
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;

  // Form data for building drill filters
  formData: SM24TopCustomersFormData;

  // Refs
  refs: Refs;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Determine customer segment based on ARR
 */
export function getCustomerSegment(arr: number): CustomerSegment {
  if (arr >= 100000) return 'strategic';
  if (arr >= 50000) return 'key';
  if (arr >= 10000) return 'core';
  if (arr >= 1000) return 'growth';
  return 'starter';
}

/**
 * Determine health level from score
 */
export function getHealthLevel(score: number): HealthLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'warning';
  return 'critical';
}

/**
 * Calculate risk level based on multiple factors
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
  if (healthScore < 80 || (daysUntilRenewal < 90)) return 'low';

  return 'none';
}

/**
 * Check if customer is expansion candidate
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

/**
 * Get region flag emoji
 */
export function getRegionFlag(region: string): string {
  return REGION_FLAGS[region] || REGION_FLAGS['Global'] || '🌐';
}

/**
 * Get product color
 */
export function getProductColor(product: string): string {
  return PRODUCT_COLORS[product] || PRODUCT_COLORS['default'];
}

/**
 * Format currency value
 */
export function formatARRValue(value: number, locale: string = 'en-US'): string {
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
export function formatGrowthPercent(value: number | null): string {
  if (value === null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format tenure in years and months
 */
export function formatTenure(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths}mo`;
  if (remainingMonths === 0) return `${years}y`;
  return `${years}y ${remainingMonths}mo`;
}

/**
 * Format days ago
 */
export function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Calculate days until date
 */
export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days since date
 */
export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_FORM_DATA: Partial<SM24TopCustomersFormData> = {
  rowsPerPage: 30,
  enableSearch: true,
  enableMultiSort: true,
  enableRowSelection: true,
  enableVirtualScroll: true,
  showFooterSummary: true,
  showRankChanges: false,
  showConcentrationAlert: true,
  healthRiskThreshold: 60,
  renewalUrgentDays: 30,
  renewalUpcomingDays: 90,
  inactivityAlertDays: 30,
  concentrationAlertPercent: 50,
  highlightAtRisk: true,
  highlightTopTen: true,
  highlightUrgentRenewals: true,
  enableExport: true,
  exportLimit: 1000,
  locale: 'en-US',
  dateFormat: 'MMM DD, YYYY',
  enableDrilldown: true,
  enableQuickActions: true,
};
