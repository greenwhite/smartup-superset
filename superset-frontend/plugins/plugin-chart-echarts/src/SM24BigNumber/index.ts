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
import { SM24BigNumberChartProps, SM24BigNumberFormData } from './types';
import { EchartsChartPlugin } from '../types';

// Placeholder thumbnails - will use BigNumber images temporarily
import thumbnail from '../BigNumber/BigNumberTotal/images/thumbnail.png';
import thumbnailDark from '../BigNumber/BigNumberTotal/images/thumbnail-dark.png';

const metadata = {
  category: t('KPI'),
  description: t(
    'SM24-BigNumber: Smartup24 KPI component for displaying key metrics with advanced formatting options. ' +
    'Supports multiple number formats (millions, billions, percentages), ' +
    'locale-aware formatting (EN/RU/UZ), time comparison, and conditional color thresholds.',
  ),
  name: t('SM24-BigNumber'),
  tags: [
    t('Business'),
    t('KPI'),
    t('Featured'),
    t('Report'),
    t('Smartup24'),
  ],
  thumbnail,
  thumbnailDark,
  behaviors: [Behavior.DrillToDetail],
};

export default class SM24BigNumberChartPlugin extends EchartsChartPlugin<
  SM24BigNumberFormData,
  SM24BigNumberChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./SM24BigNumberViz'),
      metadata,
      buildQuery,
      transformProps,
      controlPanel,
    });
  }
}

// Export types for external use
export * from './types';
