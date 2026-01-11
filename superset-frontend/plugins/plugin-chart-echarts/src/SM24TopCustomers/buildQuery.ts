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
import { SM24TopCustomersFormData } from './types';

/**
 * Build query for SM24-TopCustomers table
 *
 * Fetches top customers with all relevant metrics:
 * - Customer identification (ID, name)
 * - ARR and growth metrics
 * - Health and engagement indicators
 * - Account details (industry, region, CSM)
 * - Renewal information
 */
export default function buildQuery(formData: QueryFormData) {
  const customersFormData = formData as SM24TopCustomersFormData;

  const {
    customerIdColumn,
    customerNameColumn,
    industryColumn,
    regionColumn,
    productsColumn,
    customerSinceColumn,
    healthScoreColumn,
    renewalDateColumn,
    accountManagerColumn,
    lastActivityColumn,
    npsScoreColumn,
    arrMetric,
    growthMetric,
  } = customersFormData;

  // Build columns list
  const columns: string[] = [];

  const addColumn = (col: string | string[] | undefined) => {
    if (col) {
      const colName = Array.isArray(col) ? col[0] : col;
      if (colName && !columns.includes(colName)) {
        columns.push(colName);
      }
    }
  };

  addColumn(customerIdColumn);
  addColumn(customerNameColumn);
  addColumn(industryColumn);
  addColumn(regionColumn);
  addColumn(productsColumn);
  addColumn(customerSinceColumn);
  addColumn(healthScoreColumn);
  addColumn(renewalDateColumn);
  addColumn(accountManagerColumn);
  addColumn(lastActivityColumn);
  addColumn(npsScoreColumn);

  // Build metrics
  const metrics: string[] = [];
  if (arrMetric) metrics.push(arrMetric);
  if (growthMetric) metrics.push(growthMetric);

  return buildQueryContext(formData, baseQueryObject => {
    const query = {
      ...baseQueryObject,
      ...(columns.length > 0 && { columns }),
      ...(metrics.length > 0 && { metrics }),
      // Order by ARR descending by default
      orderby: arrMetric ? [[arrMetric, false]] : undefined,
    };

    return [query];
  });
}
