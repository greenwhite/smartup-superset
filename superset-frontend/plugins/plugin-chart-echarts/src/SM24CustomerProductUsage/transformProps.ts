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
  SM24CustomerProductUsageFormData,
  SM24CustomerProductUsageVizProps,
  CustomerProductUsageData,
  ProductUsageSummary,
  UsageTrendPoint,
  FeatureUsage,
  TimeRange,
  ChartType,
  getProductStatus,
  getAdoptionLevel,
  calculateUsageTrend,
  isTrialExpiring,
  isUnderutilized,
  daysUntilDate,
  formatCurrencyValue,
  formatLargeNumber,
  formatDurationMinutes,
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
 * Parse boolean value from data
 */
function parseBoolean(value: unknown, defaultValue = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase();
  return str === 'true' || str === '1' || str === 'yes';
}

/**
 * Transform chart props to visualization props
 */
export default function transformProps(
  chartProps: ChartProps,
): SM24CustomerProductUsageVizProps {
  const { width, height, formData, queriesData, hooks } = chartProps;
  const { onContextMenu } = hooks || {};
  const rawData = queriesData[0]?.data || [];
  const refs: Refs = {};

  const {
    // Display options
    defaultTimeRange = '90d',
    defaultChartType = 'line',
    showInactiveProducts = false,
    showFeatureBreakdown = true,
    maxFeaturesShown = 20,
    enableExpandableRows = true,

    // Thresholds
    lowAdoptionThreshold = 40,
    highAdoptionThreshold = 80,
    underutilizationThreshold = 30,
    trialExpiryAlertDays = 14,

    // Chart options
    showDauLine = true,
    showSessionsBars = true,
    showAnnotations = true,

    // Interactivity
    enableDrilldown = true,
    enableExport = true,

    // Formatting
    locale = 'en-US',
  } = formData as SM24CustomerProductUsageFormData;

  // Parse and organize data
  const productsMap = new Map<string, ProductUsageSummary>();
  const trendsMap = new Map<string, UsageTrendPoint[]>();
  const featuresMap = new Map<string, FeatureUsage[]>();

  let customerId = '';
  let customerName = '';

  if (Array.isArray(rawData)) {
    rawData.forEach((row: Record<string, unknown>) => {
      // Extract customer info (same for all rows)
      if (!customerId) {
        customerId = parseString(row.customer_id || row.customerId, 'unknown');
        customerName = parseString(row.customer_name || row.customerName, '');
      }

      const productLine = parseString(row.product_line || row.productLine);
      if (!productLine) return;

      // Parse product summary (if not already exists)
      if (!productsMap.has(productLine)) {
        const isActive = parseBoolean(row.is_active || row.isActive, true);
        const subscriptionEndDate = parseString(row.subscription_end_date || row.subscriptionEndDate);
        const licenseType = parseString(row.license_type || row.licenseType, 'standard') as 'enterprise' | 'professional' | 'standard' | 'trial' | 'free';
        const licensedUsers = parseNumber(row.licensed_users || row.licensedUsers);
        const activeUsers30d = parseNumber(row.active_users_30d || row.activeUsers30d);
        const activeUsers7d = parseNumber(row.active_users_7d || row.activeUsers7d);
        const featureAdoptionScore = parseNumber(row.feature_adoption_score || row.featureAdoptionScore);

        const product: ProductUsageSummary = {
          productLine,
          productName: parseString(row.product_name || row.productName, productLine),
          isActive,
          status: getProductStatus(isActive, subscriptionEndDate, licenseType),
          subscriptionStartDate: parseString(row.subscription_start_date || row.subscriptionStartDate),
          subscriptionEndDate,
          daysUntilExpiry: subscriptionEndDate ? daysUntilDate(subscriptionEndDate) : 365,
          licenseType,
          licensedUsers,
          activeUsers30d,
          activeUsers7d,
          activeUsersPercentage: licensedUsers > 0 ? (activeUsers30d / licensedUsers) * 100 : 0,
          totalLogins30d: parseNumber(row.total_logins_30d || row.totalLogins30d),
          avgSessionDurationMinutes: parseNumber(row.avg_session_duration_minutes || row.avgSessionDurationMinutes),
          featureAdoptionScore,
          adoptionLevel: getAdoptionLevel(featureAdoptionScore),
          arrContribution: parseNumber(row.arr_contribution || row.arrContribution),
          mrr: parseNumber(row.mrr),
          usageTrend: calculateUsageTrend(activeUsers7d, activeUsers30d),
          isTrialExpiring: isTrialExpiring(licenseType, subscriptionEndDate, trialExpiryAlertDays),
          isUnderutilized: isUnderutilized(activeUsers30d, licensedUsers, underutilizationThreshold),
        };

        productsMap.set(productLine, product);
        trendsMap.set(productLine, []);
        featuresMap.set(productLine, []);
      }

      // Parse trend data (if present)
      const weekStart = parseString(row.week_start || row.weekStart);
      if (weekStart) {
        const trends = trendsMap.get(productLine) || [];
        // Check if this week already exists
        if (!trends.find(t => t.weekStart === weekStart)) {
          const weekDate = new Date(weekStart);
          const weekEnd = new Date(weekDate);
          weekEnd.setDate(weekEnd.getDate() + 6);

          trends.push({
            weekStart,
            weekEnd: weekEnd.toISOString().slice(0, 10),
            productLine,
            avgDau: parseNumber(row.avg_dau || row.avgDau),
            weeklySessions: parseNumber(row.weekly_sessions || row.weeklySessions),
            avgDurationMinutes: parseNumber(row.avg_duration || row.avgDuration),
          });
          trendsMap.set(productLine, trends);
        }
      }

      // Parse feature data (if present)
      const featureName = parseString(row.feature_name || row.featureName);
      if (featureName) {
        const features = featuresMap.get(productLine) || [];
        // Check if this feature already exists
        if (!features.find(f => f.featureName === featureName)) {
          const usageCount = parseNumber(row.feature_usage_count || row.featureUsageCount);
          const uniqueUsers = parseNumber(row.feature_unique_users || row.featureUniqueUsers);
          const product = productsMap.get(productLine);
          const activeUsers = product?.activeUsers30d || 1;

          features.push({
            productLine,
            featureName,
            featureCategory: parseString(row.feature_category || row.featureCategory, 'General'),
            usageCount30d: usageCount,
            uniqueUsers30d: uniqueUsers,
            isPremiumFeature: parseBoolean(row.is_premium_feature || row.isPremiumFeature),
            usagePercentage: activeUsers > 0 ? (uniqueUsers / activeUsers) * 100 : 0,
          });
          featuresMap.set(productLine, features);
        }
      }
    });
  }

  // Convert maps to arrays and calculate totals
  const products = Array.from(productsMap.values());
  const usageTrends: UsageTrendPoint[] = [];
  const featureUsage: FeatureUsage[] = [];

  trendsMap.forEach(trends => {
    // Sort by date
    trends.sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
    usageTrends.push(...trends);
  });

  featuresMap.forEach(features => {
    // Sort by usage count DESC and limit
    features.sort((a, b) => b.usageCount30d - a.usageCount30d);
    featureUsage.push(...features.slice(0, maxFeaturesShown));
  });

  // Calculate summary stats
  const activeProducts = products.filter(p => p.isActive).length;
  const totalLicensedUsers = products.reduce((sum, p) => sum + p.licensedUsers, 0);
  const totalActiveUsers = products.reduce((sum, p) => sum + p.activeUsers30d, 0);
  const totalArrContribution = products.reduce((sum, p) => sum + p.arrContribution, 0);
  const overallAdoptionScore = products.length > 0
    ? products.reduce((sum, p) => sum + p.featureAdoptionScore, 0) / products.length
    : 0;

  const data: CustomerProductUsageData | null = products.length > 0
    ? {
        customerId,
        customerName,
        products,
        usageTrends,
        featureUsage,
        totalProducts: products.length,
        activeProducts,
        totalLicensedUsers,
        totalActiveUsers,
        overallAdoptionScore,
        totalArrContribution,
      }
    : null;

  // Format functions
  const formatCurrency = (value: number) => formatCurrencyValue(value, locale);
  const formatNumber = (value: number) => formatLargeNumber(value);
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatDuration = (minutes: number) => formatDurationMinutes(minutes);
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
    data,
    loading: false,
    error: undefined,
    selectedProduct: null,
    selectedTimeRange: defaultTimeRange as TimeRange,
    selectedChartType: defaultChartType as ChartType,
    showInactiveProducts,
    showFeatureBreakdown,
    maxFeaturesShown,
    enableExpandableRows,
    lowAdoptionThreshold,
    highAdoptionThreshold,
    showDauLine,
    showSessionsBars,
    showAnnotations,
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDuration,
    formatDate,
    enableDrilldown,
    enableExport,
    onContextMenu,
    formData: formData as SM24CustomerProductUsageFormData,
    refs,
  };
}
