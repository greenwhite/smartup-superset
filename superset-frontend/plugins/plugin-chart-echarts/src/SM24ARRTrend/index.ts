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
import { SM24ARRTrendChartProps, SM24ARRTrendFormData } from './types';
import { EchartsChartPlugin } from '../types';

// Placeholder thumbnails - reuse MixedTimeSeries thumbnails
import thumbnail from '../MixedTimeseries/images/thumbnail.png';
import thumbnailDark from '../MixedTimeseries/images/thumbnailDark.png';

const metadata = {
  category: t('Evolution'),
  description: t(
    'SM24-ARRTrend: Mixed chart combining line and bar charts to visualize ' +
    'Annual Recurring Revenue (ARR) trends. Shows total ARR as a line with ' +
    'waterfall breakdown bars for New Business, Expansion, Contraction, and Churn. ' +
    'Includes MoM growth rate on secondary axis, target tracking, and projections.',
  ),
  name: t('SM24-ARRTrend'),
  tags: [
    t('Business'),
    t('SaaS'),
    t('ARR'),
    t('Featured'),
    t('Trend'),
    t('Line'),
    t('Bar'),
    t('Mixed'),
    t('Smartup24'),
  ],
  thumbnail,
  thumbnailDark,
  behaviors: [Behavior.DrillToDetail, Behavior.DrillBy],
};

export default class SM24ARRTrendChartPlugin extends EchartsChartPlugin<
  SM24ARRTrendFormData,
  SM24ARRTrendChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24ARRTrendViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}

// Export types for external use
export * from './types';
