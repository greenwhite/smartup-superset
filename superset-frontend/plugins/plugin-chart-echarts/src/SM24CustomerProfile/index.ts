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
import { t, ChartMetadata, ChartPlugin, Behavior } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
// Placeholder thumbnail - will use Table images temporarily
import thumbnail from '../Table/images/Table.jpg';

const metadata = new ChartMetadata({
  name: t('SM24-CustomerProfile'),
  description: t(
    '360° Customer Profile view with health metrics, revenue, products, and activity timeline. ' +
    'Provides comprehensive customer information for Customer Success and Account Management.',
  ),
  category: t('Smartup24'),
  tags: [
    t('Customer'),
    t('Profile'),
    t('360 View'),
    t('Customer Success'),
    t('ARR'),
    t('Health Score'),
    t('Smartup24'),
  ],
  behaviors: [
    Behavior.InteractiveChart,
    Behavior.DrillToDetail,
    Behavior.DrillBy,
  ],
  thumbnail,
});

export default class SM24CustomerProfileChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./SM24CustomerProfileViz'),
      metadata,
      transformProps,
    });
  }
}
