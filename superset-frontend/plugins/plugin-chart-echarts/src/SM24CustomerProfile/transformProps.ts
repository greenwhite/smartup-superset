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
import { ChartProps } from '@superset-ui/core';
import { Refs } from '../types';
import {
  SM24CustomerProfileFormData,
  SM24CustomerProfileVizProps,
  CustomerProfileData,
  CustomerInfo,
  CSMInfo,
  RevenueMetrics,
  ProductUsage,
  HealthMetrics,
  RenewalInfo,
  ActivitySummary,
  ProfileTab,
  getHealthStatus,
  getChurnRiskLevel,
  getNPSCategory,
  getRenewalUrgency,
  getCustomerSegment,
  getPaymentHealth,
  getActivityFreshness,
  generateAlerts,
  formatCurrencyValue,
  formatPercentValue,
  formatRelativeDateValue,
  daysSince,
  daysUntil,
} from './types';

/**
 * Parse string value from data
 */
function parseString(value: unknown, defaultValue = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

/**
 * Parse numeric value from data
 */
function parseNumber(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse array from comma-separated string
 */
function parseArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Transform chart props to visualization props
 */
export default function transformProps(
  chartProps: ChartProps,
): SM24CustomerProfileVizProps {
  const { width, height, formData, queriesData, hooks } = chartProps;
  const { onContextMenu } = hooks || {};
  const data = queriesData[0]?.data || [];
  const refs: Refs = {};

  const {
    // Display options
    defaultTab = 'overview',
    showAlerts = true,
    showQuickActions = true,
    showWatchlistToggle = true,
    showExportButton = true,
    showTabs = ['overview', 'products', 'revenue', 'health', 'activity', 'contacts', 'documents'],

    // Thresholds
    healthCriticalThreshold = 50,
    healthAtRiskThreshold = 70,
    renewalUrgentDays = 30,
    inactivityAlertDays = 60,

    // Permissions
    showFinancialData = true,
    showSensitiveData = false,
    allowEditing = false,

    // Interactivity
    enableDrilldown = true,

    // Formatting
    locale = 'en-US',
  } = formData as SM24CustomerProfileFormData;

  let profile: CustomerProfileData | null = null;

  if (data.length > 0) {
    const row = data[0] as Record<string, unknown>;

    // Parse customer info
    const customer: CustomerInfo = {
      customerId: parseString(
        row.customer_id || row.customerId || row.id,
        'unknown',
      ),
      customerName: parseString(
        row.customer_name || row.customerName || row.name,
        'Unknown Customer',
      ),
      legalName: parseString(row.legal_name || row.legalName),
      inn: parseString(row.inn),
      industry: parseString(row.industry || row.vertical, 'Unknown'),
      region: parseString(row.region || row.country, 'Unknown'),
      city: parseString(row.city),
      address: parseString(row.address),
      phone: parseString(row.phone || row.primary_phone),
      email: parseString(row.email || row.primary_email),
      website: parseString(row.website),
      employeeCount: parseNumber(row.employee_count || row.employeeCount),
      companyType: parseString(row.company_type || row.companyType),
      customerSince: parseString(
        row.customer_since || row.customerSince || row.created_date,
      ),
      customerAgeDays: parseNumber(
        row.customer_age_days ||
          (row.customer_since ? daysSince(String(row.customer_since)) : 0),
      ),
    };

    // Parse CSM info
    const csm: CSMInfo = {
      csmId: parseString(row.csm_id || row.csmId),
      csmName: parseString(row.csm_name || row.csmName, 'Unassigned'),
      csmEmail: parseString(row.csm_email || row.csmEmail),
      csmPhone: parseString(row.csm_phone || row.csmPhone),
    };

    // Parse revenue metrics
    const currentArr = parseNumber(row.current_arr || row.currentArr || row.arr);
    const prevMonthArr = parseNumber(row.prev_month_arr || row.prevMonthArr);
    const arrGrowthMom =
      prevMonthArr > 0
        ? parseNumber(
            row.arr_growth_mom ||
              row.arrGrowthMom ||
              ((currentArr - prevMonthArr) / prevMonthArr) * 100,
          )
        : null;
    const avgPaymentDelay = parseNumber(
      row.avg_payment_delay || row.avgPaymentDelay,
    );

    const revenue: RevenueMetrics = {
      currentArr,
      currentMonthArr: parseNumber(
        row.current_month_arr || row.currentMonthArr || currentArr,
      ),
      prevMonthArr,
      arrGrowthMom,
      firstPaymentDate: parseString(row.first_payment_date || row.firstPaymentDate),
      lastPaymentDate: parseString(row.last_payment_date || row.lastPaymentDate),
      ltv: parseNumber(row.ltv || row.lifetime_value),
      totalPaid: parseNumber(row.total_paid || row.totalPaid),
      totalInvoices: parseNumber(row.total_invoices || row.totalInvoices),
      avgPaymentDelay,
      paymentHealth: getPaymentHealth(avgPaymentDelay),
    };

    // Parse product usage
    const lastActiveDate = parseString(
      row.last_active_date || row.lastActiveDate,
    );
    const daysSinceActive = lastActiveDate ? daysSince(lastActiveDate) : 0;

    const products: ProductUsage = {
      activeProducts: parseArray(row.active_products || row.activeProducts),
      productCount: parseNumber(row.product_count || row.productCount),
      lastActiveDate,
      daysSinceActive,
      totalUsers: parseNumber(row.total_users || row.totalUsers),
      avgFeatureAdoption: parseNumber(
        row.avg_feature_adoption || row.avgFeatureAdoption,
      ),
    };

    // Parse health metrics
    const healthScore = parseNumber(row.health_score || row.healthScore);
    const npsScore = row.nps_score !== undefined ? parseNumber(row.nps_score) : null;
    const churnRiskScore = parseNumber(
      row.churn_risk_score || row.churnRiskScore,
    );

    const health: HealthMetrics = {
      healthScore,
      healthStatus: getHealthStatus(healthScore),
      npsScore,
      npsCategory: getNPSCategory(npsScore),
      csatScore:
        row.csat_score !== undefined ? parseNumber(row.csat_score) : null,
      supportTicketCount30d: parseNumber(
        row.support_ticket_count_30d || row.supportTicketCount30d,
      ),
      avgResolutionTimeHours: parseNumber(
        row.avg_resolution_time_hours || row.avgResolutionTimeHours,
      ),
      churnRiskScore,
      churnRiskCategory: getChurnRiskLevel(churnRiskScore),
    };

    // Parse renewal info
    const renewalDate = parseString(row.renewal_date || row.renewalDate);
    const daysToRenewal = renewalDate ? daysUntil(renewalDate) : 365;

    const renewal: RenewalInfo = {
      renewalDate,
      contractEndDate: parseString(
        row.contract_end_date || row.contractEndDate,
      ),
      contractTermMonths: parseNumber(
        row.contract_term_months || row.contractTermMonths,
      ),
      daysToRenewal,
      renewalUrgency: getRenewalUrgency(daysToRenewal, healthScore),
    };

    // Parse activity summary
    const lastInteractionDate = parseString(
      row.last_interaction_date || row.lastInteractionDate,
    );
    const daysSinceInteraction = lastInteractionDate
      ? daysSince(lastInteractionDate)
      : 0;

    const activity: ActivitySummary = {
      totalInteractions: parseNumber(
        row.total_interactions || row.totalInteractions,
      ),
      lastInteractionDate,
      meetingsCount: parseNumber(row.meetings_count || row.meetingsCount),
      callsCount: parseNumber(row.calls_count || row.callsCount),
      emailsCount: parseNumber(row.emails_count || row.emailsCount),
      ticketsCount: parseNumber(row.tickets_count || row.ticketsCount),
      activityFreshness: getActivityFreshness(daysSinceInteraction),
    };

    // Calculate segment
    const segment = getCustomerSegment(currentArr, arrGrowthMom, healthScore);

    // Build profile
    profile = {
      customer,
      csm,
      revenue,
      products,
      health,
      renewal,
      activity,
      recentActivities: [], // Would come from separate query
      segment,
      alerts: [], // Will be populated below
      isOnWatchlist: false, // Would come from user settings
      tags: [],
      notes: '',
    };

    // Generate alerts
    profile.alerts = generateAlerts(profile);
  }

  // Format functions
  const formatCurrency = (value: number) => formatCurrencyValue(value, locale);
  const formatPercent = (value: number | null) => formatPercentValue(value);
  const formatDate = (date: string) => {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };
  const formatRelativeDate = (date: string) => formatRelativeDateValue(date);

  return {
    width,
    height,
    profile,
    loading: false,
    error: undefined,
    defaultTab: defaultTab as ProfileTab,
    showAlerts,
    showQuickActions,
    showWatchlistToggle,
    showExportButton,
    visibleTabs: showTabs as ProfileTab[],
    showFinancialData,
    showSensitiveData,
    allowEditing,
    formatCurrency,
    formatPercent,
    formatDate,
    formatRelativeDate,
    enableDrilldown,
    onContextMenu,
    formData: formData as SM24CustomerProfileFormData,
    refs,
  };
}
