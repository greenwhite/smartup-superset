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
import { SM24StatusCardFlowFormData } from './types';

/**
 * Build query for SM24-StatusFunnel chart
 *
 * Fetches status data with counts and amounts:
 * - status_id
 * - status_name
 * - status_order
 * - status_color
 * - entity_count
 * - total_amount
 */
export default function buildQuery(formData: QueryFormData) {
  const funnelFormData = formData as SM24StatusCardFlowFormData;

  const {
    statusIdColumn,
    statusNameColumn,
    statusOrderColumn,
    statusColorColumn,
    entityCountMetric,
    totalAmountMetric,
  } = funnelFormData;

  // Build groupby columns
  const groupby: string[] = [];

  const addGroupby = (col: string | string[] | undefined) => {
    if (col) {
      const colName = Array.isArray(col) ? col[0] : col;
      if (colName && !groupby.includes(colName)) {
        groupby.push(colName);
      }
    }
  };

  addGroupby(statusIdColumn);
  addGroupby(statusNameColumn);
  addGroupby(statusOrderColumn);
  addGroupby(statusColorColumn);

  // Build metrics
  const metrics: string[] = [];
  if (entityCountMetric) metrics.push(entityCountMetric);
  if (totalAmountMetric) metrics.push(totalAmountMetric);

  return buildQueryContext(formData, baseQueryObject => {
    const query = {
      ...baseQueryObject,
      ...(groupby.length > 0 && { groupby }),
      ...(metrics.length > 0 && { metrics }),
      // Order by status_order if available
      orderby: statusOrderColumn
        ? [[(Array.isArray(statusOrderColumn) ? statusOrderColumn[0] : statusOrderColumn), true]]
        : undefined,
    };

    return [query];
  });
}
