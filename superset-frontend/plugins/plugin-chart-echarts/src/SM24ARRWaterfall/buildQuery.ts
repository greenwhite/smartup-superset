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
import { SM24ARRWaterfallFormData } from './types';

/**
 * Build query for SM24-ARRWaterfall chart
 *
 * The query fetches waterfall data with the following structure:
 * - Beginning ARR (total at start of period)
 * - New Business (new customer revenue)
 * - Expansion (existing customer upgrades)
 * - Contraction (existing customer downgrades)
 * - Churn (lost customer revenue)
 * - Ending ARR (total at end of period)
 *
 * Optionally includes customer counts per category.
 */
export default function buildQuery(formData: QueryFormData) {
  const waterfallFormData = formData as SM24ARRWaterfallFormData;

  const {
    beginningArrMetric,
    newBusinessMetric,
    expansionMetric,
    contractionMetric,
    churnMetric,
    endingArrMetric,
    customerCountMetric,
  } = waterfallFormData;

  // Collect all metrics
  const metrics: string[] = [];

  if (beginningArrMetric) metrics.push(beginningArrMetric);
  if (newBusinessMetric) metrics.push(newBusinessMetric);
  if (expansionMetric) metrics.push(expansionMetric);
  if (contractionMetric) metrics.push(contractionMetric);
  if (churnMetric) metrics.push(churnMetric);
  if (endingArrMetric) metrics.push(endingArrMetric);
  if (customerCountMetric) metrics.push(customerCountMetric);

  return buildQueryContext(formData, baseQueryObject => {
    const query = {
      ...baseQueryObject,
      // Override metrics if specific ones are defined
      ...(metrics.length > 0 && { metrics }),
    };

    return [query];
  });
}
