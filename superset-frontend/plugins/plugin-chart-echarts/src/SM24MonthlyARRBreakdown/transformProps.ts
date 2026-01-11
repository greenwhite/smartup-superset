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
  SM24MonthlyARRBreakdownFormData,
  SM24MonthlyARRBreakdownVizProps,
  ProductSummary,
  ProductSegmentData,
  SegmentSummary,
  CustomerSegment,
  ConcentrationRisk,
  CrossSellOpportunity,
  SEGMENT_COLORS,
  SEGMENT_DEFINITIONS,
  formatARRValue,
  formatPercentValue,
  formatNumberValue,
  calculateConcentrationRisks,
} from './types';

/**
 * Transform chart props to visualization props
 */
export default function transformProps(
  chartProps: ChartProps,
): SM24MonthlyARRBreakdownVizProps {
  const { width, height, formData, queriesData } = chartProps;
  const data = queriesData[0]?.data || [];

  const {
    // Display options
    showAsPercentage = false,
    showPreviousMonth = false,
    showCustomerCounts = true,
    showGrowthIndicators = true,
    showConcentrationAlerts = true,
    showCrossSellOpportunity = true,

    // Thresholds
    productConcentrationThreshold = 70,
    topProductsThreshold = 85,

    // Segment targets
    enterpriseTarget = 40,
    midMarketTarget = 35,
    smbTarget = 20,
    starterTarget = 5,

    // Colors
    enterpriseColor = SEGMENT_COLORS.enterprise,
    midMarketColor = SEGMENT_COLORS.mid_market,
    smbColor = SEGMENT_COLORS.smb,
    starterColor = SEGMENT_COLORS.starter,

    // Formatting
    locale = 'en-US',

    // Legend
    showLegend = true,
    legendPosition = 'right',

    // Interactivity
    enableDrilldown = true,
    enableToggle = true,
  } = formData as SM24MonthlyARRBreakdownFormData;

  // Build segment colors
  const segmentColors: Record<CustomerSegment, string> = {
    enterprise: enterpriseColor,
    mid_market: midMarketColor,
    smb: smbColor,
    starter: starterColor,
  };

  // Build segment targets
  const segmentTargets: Record<CustomerSegment, number> = {
    enterprise: enterpriseTarget,
    mid_market: midMarketTarget,
    smb: smbTarget,
    starter: starterTarget,
  };

  // Parse raw data into structured format
  const productMap = new Map<string, ProductSegmentData[]>();
  let totalARR = 0;
  let totalCustomers = 0;

  // Process data rows
  if (Array.isArray(data)) {
    data.forEach((row: Record<string, unknown>) => {
      const productLine = String(row.product_line || row.productLine || 'Unknown');
      const segmentRaw = String(row.customer_segment || row.customerSegment || 'smb');
      const arrAmount = Number(row.arr_amount || row.arrAmount || row.arr || 0);
      const customerCount = Number(row.customer_count || row.customerCount || 0);
      const avgArr = Number(row.avg_arr_per_customer || row.avgArrPerCustomer || 0);

      // Normalize segment
      let segment: CustomerSegment;
      const segmentLower = segmentRaw.toLowerCase().replace(/[^a-z]/g, '');
      if (segmentLower.includes('enterprise')) {
        segment = 'enterprise';
      } else if (segmentLower.includes('mid') || segmentLower.includes('market')) {
        segment = 'mid_market';
      } else if (segmentLower.includes('smb') || segmentLower.includes('small')) {
        segment = 'smb';
      } else {
        segment = 'starter';
      }

      totalARR += arrAmount;
      totalCustomers += customerCount;

      const segmentData: ProductSegmentData = {
        productLine,
        segment,
        segmentName: SEGMENT_DEFINITIONS[segment].name,
        arrAmount,
        customerCount,
        avgArrPerCustomer: avgArr || (customerCount > 0 ? arrAmount / customerCount : 0),
        percentOfTotal: 0, // Will calculate after totals
        percentOfProduct: 0, // Will calculate after grouping
        momChange: null, // Will populate from comparison query
      };

      if (!productMap.has(productLine)) {
        productMap.set(productLine, []);
      }
      productMap.get(productLine)!.push(segmentData);
    });
  }

  // Calculate percentages and build product summaries
  const products: ProductSummary[] = [];
  const segmentTotals: Record<CustomerSegment, { arr: number; customers: number }> = {
    enterprise: { arr: 0, customers: 0 },
    mid_market: { arr: 0, customers: 0 },
    smb: { arr: 0, customers: 0 },
    starter: { arr: 0, customers: 0 },
  };

  productMap.forEach((segments, productLine) => {
    const productTotalARR = segments.reduce((sum, s) => sum + s.arrAmount, 0);
    const productTotalCustomers = segments.reduce((sum, s) => sum + s.customerCount, 0);

    // Update segment data with percentages
    segments.forEach(s => {
      s.percentOfTotal = totalARR > 0 ? (s.arrAmount / totalARR) * 100 : 0;
      s.percentOfProduct = productTotalARR > 0 ? (s.arrAmount / productTotalARR) * 100 : 0;

      // Accumulate segment totals
      segmentTotals[s.segment].arr += s.arrAmount;
      segmentTotals[s.segment].customers += s.customerCount;
    });

    products.push({
      productLine,
      totalARR: productTotalARR,
      totalCustomers: productTotalCustomers,
      percentOfTotal: totalARR > 0 ? (productTotalARR / totalARR) * 100 : 0,
      segments,
      momGrowth: null, // Will populate from comparison query
      isGrowing: false,
    });
  });

  // Sort products by total ARR descending
  products.sort((a, b) => b.totalARR - a.totalARR);

  // Build segment summaries
  const segments: SegmentSummary[] = (
    ['enterprise', 'mid_market', 'smb', 'starter'] as CustomerSegment[]
  ).map(segment => {
    const actualShare = totalARR > 0 ? (segmentTotals[segment].arr / totalARR) * 100 : 0;
    const targetShare = segmentTargets[segment];

    return {
      segment,
      segmentName: SEGMENT_DEFINITIONS[segment].name,
      totalARR: segmentTotals[segment].arr,
      totalCustomers: segmentTotals[segment].customers,
      percentOfTotal: actualShare,
      targetShare,
      deviation: actualShare - targetShare,
    };
  });

  // Calculate concentration risks
  const concentrationRisks: ConcentrationRisk[] = showConcentrationAlerts
    ? calculateConcentrationRisks(products, productConcentrationThreshold, topProductsThreshold)
    : [];

  // Calculate cross-sell opportunity (mock calculation)
  let crossSellOpportunity: CrossSellOpportunity | null = null;
  if (showCrossSellOpportunity && totalCustomers > 0) {
    // Estimate single-product customers (would come from actual query)
    const estimatedSingleProductPercent = 65; // Placeholder
    const singleProductCustomers = Math.round(
      totalCustomers * (estimatedSingleProductPercent / 100),
    );
    const avgExpansionPotential = 5000; // Placeholder

    crossSellOpportunity = {
      singleProductCustomers,
      totalCustomers,
      percentSingleProduct: estimatedSingleProductPercent,
      potentialARR: singleProductCustomers * avgExpansionPotential,
    };
  }

  // Format functions
  const formatCurrency = (value: number) => formatARRValue(value, locale);
  const formatPercent = (value: number) => formatPercentValue(value);
  const formatNumber = (value: number) => formatNumberValue(value, locale);

  return {
    width,
    height,
    products,
    segments,
    totalARR,
    totalCustomers,
    previousPeriodData: undefined, // Would come from second query
    concentrationRisks,
    crossSellOpportunity,
    showAsPercentage,
    showPreviousMonth,
    showCustomerCounts,
    showGrowthIndicators,
    showConcentrationAlerts,
    showCrossSellOpportunity,
    segmentColors,
    formatCurrency,
    formatPercent,
    formatNumber,
    showLegend,
    legendPosition,
    enableDrilldown,
    enableToggle,
  };
}
