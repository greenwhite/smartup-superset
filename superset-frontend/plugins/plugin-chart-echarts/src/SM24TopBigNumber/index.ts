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
import { SM24TopBigNumberChartProps, SM24TopBigNumberFormData } from './types';
import { EchartsChartPlugin } from '../types';

// Placeholder thumbnails
import thumbnail from '../BigNumber/BigNumberTotal/images/thumbnail.png';
import thumbnailDark from '../BigNumber/BigNumberTotal/images/thumbnail-dark.png';

const metadata = {
  category: t('KPI'),
  description: t(
    'SM24-TopBlock: Display multiple KPI metrics in a row or grid layout. ' +
    'Perfect for dashboard headers showing key performance indicators with ' +
    'comparison percentages and sparkline mini-charts.',
  ),
  name: t('SM24-TopBlock'),
  tags: [
    t('Business'),
    t('KPI'),
    t('Featured'),
    t('Dashboard'),
    t('Smartup24'),
  ],
  thumbnail,
  thumbnailDark,
  behaviors: [Behavior.DrillToDetail],
};

export default class SM24TopBigNumberChartPlugin extends EchartsChartPlugin<
  SM24TopBigNumberFormData,
  SM24TopBigNumberChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24TopBigNumberViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}

// Export types for external use
export * from './types';
