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
import { SM24TopBlockFormData, TIME_COMPARISON_SHIFTS } from './types';

/**
 * Build query for SM24-TopBlock visualization.
 * Handles multiple metrics and time comparison.
 */
export default function buildQuery(formData: QueryFormData) {
  const sm24FormData = formData as SM24TopBlockFormData;
  const {
    timeComparisonEnabled = true,
    timeComparisonPeriod = 'MoM',
    customTimeOffset,
  } = sm24FormData;

  return buildQueryContext(formData, baseQueryObject => {
    // If time comparison is not enabled, return simple query
    if (!timeComparisonEnabled || timeComparisonPeriod === 'none') {
      return [baseQueryObject];
    }

    // Get the time shift value
    let timeShift: string;
    if (timeComparisonPeriod === 'custom') {
      timeShift = customTimeOffset || '30 days ago';
    } else {
      timeShift = TIME_COMPARISON_SHIFTS[timeComparisonPeriod] || '';
    }

    // Build query with time_offsets for comparison
    return [
      {
        ...baseQueryObject,
        time_offsets: timeShift ? [timeShift] : [],
      },
    ];
  });
}
