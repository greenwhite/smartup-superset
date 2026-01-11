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
import { t, Behavior, ChartPlugin } from '@superset-ui/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import {
  SM24TopCustomersChartProps,
  SM24TopCustomersFormData,
} from './types';

// Reuse Table thumbnails
import thumbnail from '../BigNumber/images/thumbnail.png';

const metadata = {
  category: t('Table'),
  description: t(
    'SM24-TopCustomers: Interactive table showing top 30 customers by ARR ' +
    'with health indicators, renewal tracking, and risk assessment. ' +
    'Features include search, multi-column sort, conditional formatting, ' +
    'concentration alerts, and drilldown to customer profiles.',
  ),
  name: t('SM24-TopCustomers'),
  tags: [
    t('Business'),
    t('SaaS'),
    t('Customers'),
    t('Featured'),
    t('Table'),
    t('Interactive'),
    t('Smartup24'),
  ],
  thumbnail,
  behaviors: [Behavior.DrillToDetail, Behavior.DrillBy],
};

export default class SM24TopCustomersChartPlugin extends ChartPlugin<
  SM24TopCustomersFormData,
  SM24TopCustomersChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24TopCustomersViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}

// Export types for external use
export * from './types';
