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
import { t, Behavior } from '@superset-ui/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import {
  SM24MonthlyARRBreakdownChartProps,
  SM24MonthlyARRBreakdownFormData,
} from './types';
import { EchartsChartPlugin } from '../types';

// Reuse Bar chart thumbnails
import thumbnail from '../Timeseries/images/thumbnail.png';

const metadata = {
  category: t('Part of a Whole'),
  description: t(
    'SM24-MonthlyARRBreakdown: Horizontal stacked bar chart showing ARR ' +
    'breakdown by product line and customer segment (Enterprise, Mid-Market, ' +
    'SMB, Starter). Includes concentration risk alerts, cross-sell opportunities, ' +
    'growth indicators, and segment target comparison.',
  ),
  name: t('SM24-MonthlyARRBreakdown'),
  tags: [
    t('Business'),
    t('SaaS'),
    t('ARR'),
    t('Featured'),
    t('Stacked'),
    t('Bar'),
    t('Breakdown'),
    t('Smartup24'),
  ],
  thumbnail,
  behaviors: [Behavior.DrillToDetail, Behavior.DrillBy],
};

export default class SM24MonthlyARRBreakdownChartPlugin extends EchartsChartPlugin<
  SM24MonthlyARRBreakdownFormData,
  SM24MonthlyARRBreakdownChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24MonthlyARRBreakdownViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}

// Export types for external use
export * from './types';
