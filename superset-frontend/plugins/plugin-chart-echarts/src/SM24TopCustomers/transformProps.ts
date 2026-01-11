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
import {
  SM24TopCustomersFormData,
  SM24TopCustomersVizProps,
  CustomerData,
  CustomerSummary,
  DEFAULT_COLUMNS,
  formatARRValue,
  formatGrowthPercent,
  formatTenure,
  formatDaysAgo,
  getCustomerSegment,
  getHealthLevel,
  calculateRiskLevel,
  isExpansionCandidate,
  getRegionFlag,
  daysUntil,
  daysSince,
} from './types';

import { Refs } from '../types';

/**
 * Transform chart props to visualization props
 */
export default function transformProps(
  chartProps: ChartProps,
): SM24TopCustomersVizProps {
  const { width, height, formData, queriesData, hooks } = chartProps;
  const { onContextMenu } = hooks || {};
  const data = queriesData[0]?.data || [];
  const refs: Refs = {};

  const {
    // Thresholds
    healthRiskThreshold = 60,
    renewalUrgentDays = 30,
    renewalUpcomingDays = 90,
    inactivityAlertDays = 30,
    concentrationAlertPercent = 50,

    // Display options
    rowsPerPage = 30,
    enableSearch = true,
    enableMultiSort = true,
    enableRowSelection = true,
    enableVirtualScroll = true,
    showFooterSummary = true,
    showConcentrationAlert = true,

    // Conditional formatting
    highlightAtRisk = true,
    highlightTopTen = true,
    highlightUrgentRenewals = true,

    // Formatting
    locale = 'en-US',

    // Interactivity
    enableDrilldown = true,
    enableQuickActions = true,
    enableExport = true,
  } = formData as SM24TopCustomersFormData;

  // Parse raw data into CustomerData objects
  const customers: CustomerData[] = [];
  let totalARR = 0;
  let totalHealthScore = 0;
  let healthScoreCount = 0;

  if (Array.isArray(data)) {
    data.forEach((row: Record<string, unknown>, index: number) => {
      // Extract values with flexible column name matching
      const customerId = String(
        row.customer_id || row.customerId || row.id || `customer_${index}`,
      );
      const customerName = String(
        row.customer_name || row.customerName || row.name || 'Unknown',
      );
      const industry = String(row.industry || row.vertical || '');
      const region = String(row.region || row.country || '');
      const arr = Number(row.total_arr || row.totalArr || row.arr || 0);
      const growthMom = row.arr_growth_mom !== undefined
        ? Number(row.arr_growth_mom || row.arrGrowthMom || row.growth || 0)
        : null;
      const productsRaw = row.products || row.product_line || '';
      const customerSince = String(row.customer_since || row.customerSince || row.first_payment_date || '');
      const tenureMonths = Number(row.tenure_months || row.tenureMonths || 0);
      const healthScore = Number(row.health_score || row.healthScore || 0);
      const renewalDate = String(row.renewal_date || row.renewalDate || '');
      const accountManager = String(row.csm_name || row.account_manager || row.accountManager || row.csm || '');
      const lastActivity = String(row.last_activity_date || row.lastActivityDate || row.last_activity || '');
      const npsScore = row.nps_score !== undefined
        ? Number(row.nps_score || row.npsScore || 0)
        : null;

      // Parse products
      let products: string[] = [];
      if (typeof productsRaw === 'string') {
        products = productsRaw.split(',').map(p => p.trim()).filter(Boolean);
      } else if (Array.isArray(productsRaw)) {
        products = productsRaw.map(String);
      }

      // Calculate derived values
      const daysUntilRenewal = renewalDate ? daysUntil(renewalDate) : 365;
      const daysSinceActivity = lastActivity ? daysSince(lastActivity) : 0;

      const segment = getCustomerSegment(arr);
      const healthLevel = getHealthLevel(healthScore);
      const riskLevel = calculateRiskLevel(
        healthScore,
        daysUntilRenewal,
        daysSinceActivity,
        npsScore,
      );

      const isAtRisk = healthScore < healthRiskThreshold;
      const isDisengaged = daysSinceActivity > inactivityAlertDays;
      const isRenewalUrgent = daysUntilRenewal < renewalUrgentDays;
      const expansionCandidate = isExpansionCandidate(products, healthScore, growthMom);

      const customer: CustomerData = {
        rank: index + 1,
        customerId,
        customerName,
        industry,
        region,
        regionFlag: getRegionFlag(region),
        totalArr: arr,
        arrGrowthMom: growthMom,
        products,
        customerSince,
        tenureMonths,
        healthScore,
        renewalDate,
        daysUntilRenewal,
        accountManager,
        lastActivityDate: lastActivity,
        daysSinceActivity,
        npsScore,
        segment,
        riskLevel,
        healthLevel,
        isTopTen: index < 10,
        isAtRisk,
        isDisengaged,
        isExpansionCandidate: expansionCandidate,
        isRenewalUrgent,
      };

      customers.push(customer);
      totalARR += arr;

      if (healthScore > 0) {
        totalHealthScore += healthScore;
        healthScoreCount += 1;
      }
    });
  }

  // Calculate summary statistics
  const topTenARR = customers.slice(0, 10).reduce((sum, c) => sum + c.totalArr, 0);
  const topTenConcentration = totalARR > 0 ? (topTenARR / totalARR) * 100 : 0;
  const customersAtRisk = customers.filter(c => c.isAtRisk).length;
  const criticalRenewals = customers.filter(
    c => c.daysUntilRenewal < renewalUrgentDays && c.healthScore < 70,
  ).length;
  const upcomingRenewals = customers.filter(
    c => c.daysUntilRenewal < renewalUpcomingDays,
  ).length;

  const summary: CustomerSummary = {
    totalCustomers: customers.length,
    totalARR,
    percentOfCompanyARR: 100, // Would need company total from another source
    averageHealthScore: healthScoreCount > 0 ? totalHealthScore / healthScoreCount : 0,
    customersAtRisk,
    criticalRenewals,
    upcomingRenewals,
    topTenConcentration,
  };

  // Format functions
  const formatCurrency = (value: number) => formatARRValue(value, locale);
  const formatPercent = (value: number | null) => formatGrowthPercent(value);
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

  return {
    width,
    height,
    customers,
    summary,
    companyTotalARR: totalARR,
    columns: DEFAULT_COLUMNS,
    rowsPerPage,
    enableSearch,
    enableMultiSort,
    enableRowSelection,
    enableVirtualScroll,
    showFooterSummary,
    showConcentrationAlert: showConcentrationAlert && topTenConcentration > concentrationAlertPercent,
    highlightAtRisk,
    highlightTopTen,
    highlightUrgentRenewals,
    formatCurrency,
    formatPercent,
    formatDate,
    formatTenure,
    enableDrilldown,
    enableQuickActions,
    enableExport,
    onContextMenu,
    formData: formData as SM24TopCustomersFormData,
    refs,
  };
}
