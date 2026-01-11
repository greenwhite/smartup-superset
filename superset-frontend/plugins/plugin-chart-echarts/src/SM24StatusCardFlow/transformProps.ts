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
  SM24StatusCardFlowFormData,
  SM24StatusCardFlowVizProps,
  StatusData,
  EntityType,
  ENTITY_TYPE_DEFINITIONS,
  formatCountValue,
  formatAmountValue,
  formatPercentValue,
  getStatusColor,
  calculateTotals,
  SAMPLE_ORDER_STATUSES,
} from './types';

/**
 * Transform chart props to visualization props
 */
export default function transformProps(
  chartProps: ChartProps,
): SM24StatusCardFlowVizProps {
  const { width, height, formData, queriesData } = chartProps;
  const data = queriesData[0]?.data || [];

  const {
    entityType = 'orders',
    showAmounts = true,
    showPercentages = true,
    showArrows = true,
    maxCardsPerRow = 8,
    amountPrecision = 1,
    amountUnit = 'auto',
    enableDrilldown = true,
    enableEntityTypeSwitch = true,
    locale = 'ru-RU',
  } = formData as SM24StatusCardFlowFormData;

  // Get entity type definition
  const entityTypeDef = ENTITY_TYPE_DEFINITIONS[entityType as EntityType] ||
    ENTITY_TYPE_DEFINITIONS.orders;

  // Parse status data from query results
  let statuses: StatusData[] = [];
  let totalEntities = 0;

  if (Array.isArray(data) && data.length > 0) {
    // Parse from actual data
    statuses = data.map((row: Record<string, unknown>, index: number) => {
      const statusId = row.status_id || row.statusId || row.id || index;
      const statusName = String(row.status_name || row.statusName || row.name || `Status ${index + 1}`);
      const statusOrder = Number(row.status_order || row.statusOrder || row.order || index);
      const statusColor = String(row.status_color || row.statusColor || row.color || '');
      const entityCount = Number(row.entity_count || row.entityCount || row.count || 0);
      const amount = Number(row.total_amount || row.totalAmount || row.amount || 0);

      totalEntities += entityCount;

      return {
        statusId,
        statusName,
        statusOrder,
        statusColor,
        entityCount,
        totalAmount: amount,
        percentageOfTotal: 0, // Will calculate after totals
      };
    });

    // Sort by status order
    statuses.sort((a, b) => a.statusOrder - b.statusOrder);

    // Calculate percentages
    statuses = statuses.map((status, index) => ({
      ...status,
      statusColor: getStatusColor(status, index, statuses.length),
      percentageOfTotal: totalEntities > 0
        ? (status.entityCount / totalEntities) * 100
        : 0,
    }));
  } else {
    // Use sample data for demo/development
    const sampleData = SAMPLE_ORDER_STATUSES;
    const sampleCounts = [138, 13, 31, 73, 3, 1287];
    const sampleAmounts = [44700000, 3700000, 9200000, 22800000, 1400000, 1928600000];

    statuses = sampleData.map((status, index) => {
      const entityCount = sampleCounts[index] || 0;
      totalEntities += entityCount;
      return {
        ...status,
        entityCount,
        totalAmount: sampleAmounts[index] || 0,
        percentageOfTotal: 0,
      };
    });

    // Calculate percentages
    statuses = statuses.map((status, index) => ({
      ...status,
      statusColor: getStatusColor(status, index, statuses.length),
      percentageOfTotal: totalEntities > 0
        ? (status.entityCount / totalEntities) * 100
        : 0,
    }));
  }

  // Calculate totals
  const { totalAmount } = calculateTotals(statuses);

  // Format functions
  const formatCount = (value: number) => formatCountValue(value);

  const formatAmount = (value: number) => {
    const formatted = formatAmountValue(value, amountPrecision, amountUnit);
    if (!formatted) return '';
    return `${formatted.value} ${formatted.unit} сум`;
  };

  const formatPercent = (value: number) => formatPercentValue(value);

  return {
    width,
    height,
    statuses,
    entityType: entityType as EntityType,
    entityTypeDef,
    totalEntities,
    totalAmount,
    showAmounts: showAmounts && entityTypeDef.hasAmount,
    showPercentages,
    showArrows,
    maxCardsPerRow,
    formatCount,
    formatAmount,
    formatPercent,
    enableDrilldown,
    enableEntityTypeSwitch,
  };
}
