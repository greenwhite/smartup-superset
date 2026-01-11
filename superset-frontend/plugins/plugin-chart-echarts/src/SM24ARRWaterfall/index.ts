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
import { SM24ARRWaterfallChartProps, SM24ARRWaterfallFormData } from './types';
import { EchartsChartPlugin } from '../types';

// Reuse Waterfall thumbnails
import thumbnail from '../Waterfall/images/thumbnail.png';

const metadata = {
  category: t('Evolution'),
  description: t(
    'SM24-ARRWaterfall: Waterfall chart visualizing ARR changes over a period. ' +
    'Shows the breakdown from Beginning ARR through New Business, Expansion, ' +
    'Contraction, and Churn to Ending ARR. Includes Quick Ratio badge, ' +
    'growth rate indicators, and drilldown to customer lists.',
  ),
  name: t('SM24-ARRWaterfall'),
  tags: [
    t('Business'),
    t('SaaS'),
    t('ARR'),
    t('Featured'),
    t('Waterfall'),
    t('Breakdown'),
    t('Smartup24'),
  ],
  thumbnail,
  behaviors: [Behavior.DrillToDetail, Behavior.DrillBy],
};

export default class SM24ARRWaterfallChartPlugin extends EchartsChartPlugin<
  SM24ARRWaterfallFormData,
  SM24ARRWaterfallChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24ARRWaterfallViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}

// Export types for external use
export * from './types';
