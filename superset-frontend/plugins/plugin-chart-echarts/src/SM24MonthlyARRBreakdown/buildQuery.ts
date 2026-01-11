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
import { buildQueryContext, QueryFormData } from '@superset-ui/core';
import { SM24MonthlyARRBreakdownFormData } from './types';

/**
 * Build query for SM24-MonthlyARRBreakdown chart
 *
 * The query fetches product and segment breakdown data:
 * - Product line
 * - Customer segment
 * - ARR amount
 * - Customer count
 * - Average ARR per customer
 *
 * Optionally includes previous month data for comparison.
 */
export default function buildQuery(formData: QueryFormData) {
  const breakdownFormData = formData as SM24MonthlyARRBreakdownFormData;

  const {
    productLineColumn,
    customerSegmentColumn,
    arrMetric,
    customerCountMetric,
    avgArrMetric,
    showPreviousMonth = false,
    showYoYComparison = false,
  } = breakdownFormData;

  // Build groupby columns
  const groupby: string[] = [];
  if (productLineColumn) {
    groupby.push(
      Array.isArray(productLineColumn) ? productLineColumn[0] : productLineColumn,
    );
  }
  if (customerSegmentColumn) {
    groupby.push(
      Array.isArray(customerSegmentColumn)
        ? customerSegmentColumn[0]
        : customerSegmentColumn,
    );
  }

  // Build metrics
  const metrics: string[] = [];
  if (arrMetric) metrics.push(arrMetric);
  if (customerCountMetric) metrics.push(customerCountMetric);
  if (avgArrMetric) metrics.push(avgArrMetric);

  return buildQueryContext(formData, baseQueryObject => {
    const queries = [
      {
        ...baseQueryObject,
        ...(groupby.length > 0 && { groupby }),
        ...(metrics.length > 0 && { metrics }),
      },
    ];

    // Add previous month query if comparison is enabled
    if (showPreviousMonth) {
      queries.push({
        ...baseQueryObject,
        ...(groupby.length > 0 && { groupby }),
        ...(metrics.length > 0 && { metrics }),
        time_offsets: ['1 month ago'],
      });
    }

    // Add YoY comparison query if enabled
    if (showYoYComparison) {
      queries.push({
        ...baseQueryObject,
        ...(groupby.length > 0 && { groupby }),
        ...(metrics.length > 0 && { metrics }),
        time_offsets: ['1 year ago'],
      });
    }

    return queries;
  });
}
