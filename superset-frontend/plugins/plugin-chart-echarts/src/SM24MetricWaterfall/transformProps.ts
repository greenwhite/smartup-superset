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
  SM24MetricWaterfallFormData,
  SM24MetricWaterfallVizProps,
  WaterfallDataPoint,
  WATERFALL_COLORS,
  formatARRValue,
  formatPercentValue,
  calculateQuickRatio,
  calculateWaterfallPositions,
  DEFAULT_BAR_ORDER,
} from './types';

/**
 * Transform chart props to visualization props
 */
export default function transformProps(
  chartProps: ChartProps,
): SM24MetricWaterfallVizProps {
  const { width, height, formData, queriesData } = chartProps;
  const data = queriesData[0]?.data || [];

  const {
    // Display options
    showConnectorLines = true,
    showPercentLabels = true,
    showAbsoluteLabels = true,
    showCustomerCounts = false,
    showQuickRatio = true,
    showNetChange = true,
    showGrowthRate = true,

    // Bar order
    barOrder = DEFAULT_BAR_ORDER,

    // Colors
    colorTotal = WATERFALL_COLORS.total,
    colorIncrease = WATERFALL_COLORS.increase,
    colorDecrease = WATERFALL_COLORS.decrease,
    colorConnector = WATERFALL_COLORS.connector,

    // Thresholds
    churnAlertThreshold = 5,
    contractionWarningEnabled = true,

    // Formatting
    locale = 'en-US',

    // Legend
    showLegend = true,
    legendPosition = 'bottom',

    // Interactivity
    enableDrilldown = true,
  } = formData as SM24MetricWaterfallFormData;

  // Extract values from query data
  // The data could be in different formats depending on the query
  let beginningARR = 0;
  let newBusiness = 0;
  let expansion = 0;
  let contraction = 0;
  let churn = 0;
  let endingARR = 0;
  let customerCounts: Record<string, number> = {};

  if (data.length > 0) {
    // Try to extract from row-based format (each row is a category)
    if (Array.isArray(data)) {
      data.forEach((row: Record<string, unknown>) => {
        const category = row.category as string;
        const value = Number(row.value) || 0;
        const count = Number(row.customer_count) || 0;

        switch (category?.toLowerCase()) {
          case 'beginning arr':
          case 'beginning_arr':
            beginningARR = value;
            customerCounts['Beginning ARR'] = count;
            break;
          case 'new business':
          case 'new_business':
            newBusiness = value;
            customerCounts['New Business'] = count;
            break;
          case 'expansion':
            expansion = value;
            customerCounts['Expansion'] = count;
            break;
          case 'contraction':
            contraction = Math.abs(value);
            customerCounts['Contraction'] = count;
            break;
          case 'churn':
          case 'churned':
            churn = Math.abs(value);
            customerCounts['Churn'] = count;
            break;
          case 'ending arr':
          case 'ending_arr':
            endingARR = value;
            customerCounts['Ending ARR'] = count;
            break;
        }
      });
    }

    // Try to extract from column-based format (single row with all values)
    if (beginningARR === 0 && data[0]) {
      const row = data[0] as Record<string, unknown>;
      beginningARR = Number(row.beginning_arr || row.beginningArr) || 0;
      newBusiness = Number(row.new_business || row.newBusiness) || 0;
      expansion = Number(row.expansion) || 0;
      contraction = Math.abs(Number(row.contraction) || 0);
      churn = Math.abs(Number(row.churn || row.churned) || 0);
      endingARR = Number(row.ending_arr || row.endingArr) || 0;
    }
  }

  // If ending ARR is not provided, calculate it
  if (endingARR === 0 && beginningARR > 0) {
    endingARR = beginningARR + newBusiness + expansion - contraction - churn;
  }

  // Build waterfall data points
  const waterfallData: WaterfallDataPoint[] = [];

  const categoryConfig: Record<string, { value: number; type: 'total' | 'increase' | 'decrease' }> = {
    'Beginning ARR': { value: beginningARR, type: 'total' },
    'New Business': { value: newBusiness, type: 'increase' },
    'Expansion': { value: expansion, type: 'increase' },
    'Contraction': { value: contraction, type: 'decrease' },
    'Churn': { value: churn, type: 'decrease' },
    'Ending ARR': { value: endingARR, type: 'total' },
  };

  // Build data in specified order
  barOrder.forEach(category => {
    const config = categoryConfig[category];
    if (config) {
      const percentOfBeginning = beginningARR > 0
        ? (config.value / beginningARR) * 100
        : 0;

      const avgPerCustomer = customerCounts[category] > 0
        ? config.value / customerCounts[category]
        : 0;

      waterfallData.push({
        category,
        value: config.value,
        type: config.type,
        percentOfBeginning,
        customerCount: customerCounts[category],
        avgPerCustomer,
      });
    }
  });

  // Calculate waterfall positions
  const positionedData = calculateWaterfallPositions(waterfallData);

  // Calculate metrics
  const netChange = endingARR - beginningARR;
  const growthRate = beginningARR > 0 ? (netChange / beginningARR) * 100 : 0;
  const quickRatio = calculateQuickRatio(newBusiness, expansion, contraction, churn);

  // Calculate alerts
  const churnPercent = beginningARR > 0 ? (churn / beginningARR) * 100 : 0;
  const churnAlert = churnPercent > churnAlertThreshold;
  const contractionWarning = contractionWarningEnabled && contraction > expansion;

  // Format functions
  const formatCurrency = (value: number) => formatARRValue(value, locale);
  const formatPercent = (value: number) => formatPercentValue(value);

  // Build colors object
  const colors = {
    total: colorTotal,
    increase: colorIncrease,
    increaseGradient: WATERFALL_COLORS.increaseGradientEnd,
    decrease: colorDecrease,
    decreaseGradient: WATERFALL_COLORS.decreaseGradientEnd,
    connector: colorConnector,
  };

  return {
    width,
    height,
    data: positionedData,
    beginningARR,
    endingARR,
    netChange,
    growthRate,
    quickRatio,
    showConnectorLines,
    showPercentLabels,
    showAbsoluteLabels,
    showCustomerCounts,
    showQuickRatio,
    showNetChange,
    showGrowthRate,
    colors,
    alerts: {
      churnAlert,
      contractionWarning,
    },
    formatCurrency,
    formatPercent,
    enableDrilldown,
    showLegend,
    legendPosition,
  };
}
