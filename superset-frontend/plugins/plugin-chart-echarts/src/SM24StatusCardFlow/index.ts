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
  SM24StatusCardFlowChartProps,
  SM24StatusCardFlowFormData,
} from './types';

// Reuse Funnel thumbnail
import thumbnail from '../Funnel/images/thumbnail.png';

const metadata = {
  category: t('KPI'),
  description: t(
    'SM24-StatusCardFlow: Universal entity status flow displaying status cards ' +
    'in a horizontal layout. Supports any entity type with configurable ' +
    'status mapping, counts, amounts, and percentages. ' +
    'Features drilldown, entity type switching, configurable currency/locale, and real-time filtering.',
  ),
  name: t('SM24-StatusCardFlow'),
  tags: [
    t('Business'),
    t('Operations'),
    t('Status'),
    t('Featured'),
    t('Flow'),
    t('Cards'),
    t('Universal'),
    t('Smartup24'),
  ],
  thumbnail,
  behaviors: [Behavior.DrillToDetail, Behavior.DrillBy],
};

export default class SM24StatusCardFlowChartPlugin extends ChartPlugin<
  SM24StatusCardFlowFormData,
  SM24StatusCardFlowChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24StatusCardFlowViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}

// Export types for external use
export * from './types';
