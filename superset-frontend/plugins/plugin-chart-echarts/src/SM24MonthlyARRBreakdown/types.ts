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
import { QueryFormData, ChartProps } from '@superset-ui/core';

// =============================================================================
// CUSTOMER SEGMENT TYPES
// =============================================================================

export type CustomerSegment = 'enterprise' | 'mid_market' | 'smb' | 'starter';

export interface SegmentDefinition {
  id: CustomerSegment;
  name: string;
  minARR: number;
  maxARR: number;
  color: string;
  targetShare: number; // Target % of total ARR
}

export const SEGMENT_DEFINITIONS: Record<CustomerSegment, SegmentDefinition> = {
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    minARR: 50000,
    maxARR: Infinity,
    color: '#2C3E50',
    targetShare: 40,
  },
  mid_market: {
    id: 'mid_market',
    name: 'Mid-Market',
    minARR: 10000,
    maxARR: 50000,
    color: '#3498DB',
    targetShare: 35,
  },
  smb: {
    id: 'smb',
    name: 'SMB',
    minARR: 1000,
    maxARR: 10000,
    color: '#5DADE2',
    targetShare: 20,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    minARR: 0,
    maxARR: 1000,
    color: '#AED6F1',
    targetShare: 5,
  },
};

// =============================================================================
// DATA STRUCTURES
// =============================================================================

export interface ProductSegmentData {
  productLine: string;
  segment: CustomerSegment;
  segmentName: string;
  arrAmount: number;
  customerCount: number;
  avgArrPerCustomer: number;
  percentOfTotal: number;
  percentOfProduct: number;
  momChange: number | null;
}

export interface ProductSummary {
  productLine: string;
  totalARR: number;
  totalCustomers: number;
  percentOfTotal: number;
  segments: ProductSegmentData[];
  momGrowth: number | null;
  isGrowing: boolean;
}

export interface SegmentSummary {
  segment: CustomerSegment;
  segmentName: string;
  totalARR: number;
  totalCustomers: number;
  percentOfTotal: number;
  targetShare: number;
  deviation: number; // Actual - Target
}

// =============================================================================
// ALERTS & RISKS
// =============================================================================

export type AlertLevel = 'critical' | 'warning' | 'info' | 'success';

export interface ConcentrationRisk {
  type: 'product' | 'segment';
  level: AlertLevel;
  message: string;
  value: number;
  threshold: number;
}

export interface CrossSellOpportunity {
  singleProductCustomers: number;
  totalCustomers: number;
  percentSingleProduct: number;
  potentialARR: number;
}

// =============================================================================
// COLOR CONSTANTS
// =============================================================================

export const SEGMENT_COLORS: Record<CustomerSegment, string> = {
  enterprise: '#2C3E50',
  mid_market: '#3498DB',
  smb: '#5DADE2',
  starter: '#AED6F1',
};

export const STATUS_COLORS = {
  growth: '#27AE60',
  decline: '#E74C3C',
  neutral: '#95A5A6',
  warning: '#F39C12',
  critical: '#C0392B',
};

export const PRODUCT_COLORS = [
  '#2ECC71', // Smartup ERP - Green
  '#3498DB', // LMS - Blue
  '#9B59B6', // Helpdesk - Purple
  '#E67E22', // Future Products - Orange
  '#1ABC9C', // Additional product 1
  '#E74C3C', // Additional product 2
];

// =============================================================================
// FORM DATA
// =============================================================================

export interface SM24MonthlyARRBreakdownFormData extends QueryFormData {
  // Metrics
  productLineColumn?: string;
  customerSegmentColumn?: string;
  arrMetric?: string;
  customerCountMetric?: string;
  avgArrMetric?: string;

  // Display Options
  showAsPercentage?: boolean;
  showPreviousMonth?: boolean;
  showYoYComparison?: boolean;
  showCustomerCounts?: boolean;
  showGrowthIndicators?: boolean;
  showConcentrationAlerts?: boolean;
  showCrossSellOpportunity?: boolean;

  // Thresholds
  productConcentrationThreshold?: number; // Alert if single product > X%
  topProductsThreshold?: number; // Warning if top 2 > X%

  // Segment targets
  enterpriseTarget?: number;
  midMarketTarget?: number;
  smbTarget?: number;
  starterTarget?: number;

  // Colors
  enterpriseColor?: string;
  midMarketColor?: string;
  smbColor?: string;
  starterColor?: string;

  // Formatting
  locale?: string;
  currencyFormat?: string;

  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // Interactivity
  enableDrilldown?: boolean;
  enableToggle?: boolean;
}

// =============================================================================
// CHART PROPS
// =============================================================================

export interface SM24MonthlyARRBreakdownChartProps extends ChartProps {
  formData: SM24MonthlyARRBreakdownFormData;
}

export interface SM24MonthlyARRBreakdownVizProps {
  className?: string;
  width: number;
  height: number;

  // Data
  products: ProductSummary[];
  segments: SegmentSummary[];
  totalARR: number;
  totalCustomers: number;

  // Previous period data (for comparison)
  previousPeriodData?: ProductSummary[];

  // Risks & Opportunities
  concentrationRisks: ConcentrationRisk[];
  crossSellOpportunity: CrossSellOpportunity | null;

  // Display options
  showAsPercentage: boolean;
  showPreviousMonth: boolean;
  showCustomerCounts: boolean;
  showGrowthIndicators: boolean;
  showConcentrationAlerts: boolean;
  showCrossSellOpportunity: boolean;

  // Segment colors
  segmentColors: Record<CustomerSegment, string>;

  // Formatting
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  formatNumber: (value: number) => string;

  // Legend
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';

  // Interactivity
  enableDrilldown: boolean;
  enableToggle: boolean;
  onDrilldown?: (productLine: string, segment?: CustomerSegment) => void;
  onToggleView?: () => void;

  // Refs
  refs?: {
    echartRef?: { current: unknown };
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format currency value with appropriate suffix
 */
export function formatARRValue(value: number, locale: string = 'en-US'): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (absValue >= 1_000) {
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
 * Format percentage value
 */
export function formatPercentValue(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with locale
 */
export function formatNumberValue(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Determine customer segment based on ARR value
 */
export function getCustomerSegment(arrValue: number): CustomerSegment {
  if (arrValue >= 50000) return 'enterprise';
  if (arrValue >= 10000) return 'mid_market';
  if (arrValue >= 1000) return 'smb';
  return 'starter';
}

/**
 * Calculate concentration risks
 */
export function calculateConcentrationRisks(
  products: ProductSummary[],
  productThreshold: number = 70,
  topProductsThreshold: number = 85,
): ConcentrationRisk[] {
  const risks: ConcentrationRisk[] = [];

  // Check single product concentration
  const maxProductShare = Math.max(...products.map(p => p.percentOfTotal));
  if (maxProductShare > productThreshold) {
    const topProduct = products.find(p => p.percentOfTotal === maxProductShare);
    risks.push({
      type: 'product',
      level: 'critical',
      message: `${topProduct?.productLine} represents ${maxProductShare.toFixed(1)}% of total ARR`,
      value: maxProductShare,
      threshold: productThreshold,
    });
  }

  // Check top 2 products concentration
  const sortedProducts = [...products].sort((a, b) => b.percentOfTotal - a.percentOfTotal);
  if (sortedProducts.length >= 2) {
    const top2Share = sortedProducts[0].percentOfTotal + sortedProducts[1].percentOfTotal;
    if (top2Share > topProductsThreshold) {
      risks.push({
        type: 'product',
        level: 'warning',
        message: `Top 2 products represent ${top2Share.toFixed(1)}% of total ARR`,
        value: top2Share,
        threshold: topProductsThreshold,
      });
    }
  }

  return risks;
}

/**
 * Calculate segment deviation from targets
 */
export function calculateSegmentDeviation(
  actualShare: number,
  targetShare: number,
): { deviation: number; level: AlertLevel } {
  const deviation = actualShare - targetShare;
  const absDeviation = Math.abs(deviation);

  let level: AlertLevel;
  if (absDeviation > 15) {
    level = 'critical';
  } else if (absDeviation > 10) {
    level = 'warning';
  } else if (absDeviation > 5) {
    level = 'info';
  } else {
    level = 'success';
  }

  return { deviation, level };
}

/**
 * Get growth indicator
 */
export function getGrowthIndicator(momChange: number | null): {
  icon: string;
  color: string;
  label: string;
} {
  if (momChange === null) {
    return { icon: '−', color: STATUS_COLORS.neutral, label: 'No data' };
  }

  if (momChange > 0) {
    return { icon: '↑', color: STATUS_COLORS.growth, label: `+${momChange.toFixed(1)}%` };
  }

  if (momChange < 0) {
    return { icon: '↓', color: STATUS_COLORS.decline, label: `${momChange.toFixed(1)}%` };
  }

  return { icon: '→', color: STATUS_COLORS.neutral, label: '0%' };
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_FORM_DATA: Partial<SM24MonthlyARRBreakdownFormData> = {
  showAsPercentage: false,
  showPreviousMonth: false,
  showYoYComparison: false,
  showCustomerCounts: true,
  showGrowthIndicators: true,
  showConcentrationAlerts: true,
  showCrossSellOpportunity: true,
  productConcentrationThreshold: 70,
  topProductsThreshold: 85,
  enterpriseTarget: 40,
  midMarketTarget: 35,
  smbTarget: 20,
  starterTarget: 5,
  enterpriseColor: SEGMENT_COLORS.enterprise,
  midMarketColor: SEGMENT_COLORS.mid_market,
  smbColor: SEGMENT_COLORS.smb,
  starterColor: SEGMENT_COLORS.starter,
  locale: 'en-US',
  showLegend: true,
  legendPosition: 'right',
  enableDrilldown: true,
  enableToggle: true,
};

export const DEFAULT_PRODUCTS = [
  'Smartup ERP',
  'LMS',
  'Helpdesk',
  'Future Products',
];
