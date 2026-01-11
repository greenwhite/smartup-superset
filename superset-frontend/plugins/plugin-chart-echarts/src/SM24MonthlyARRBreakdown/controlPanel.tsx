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
import { t } from '@superset-ui/core';
import {
  ControlPanelConfig,
  sections,
  sharedControls,
} from '@superset-ui/chart-controls';
import { SEGMENT_COLORS } from './types';

const config: ControlPanelConfig = {
  controlPanelSections: [
    // =========================================================================
    // QUERY SECTION
    // =========================================================================
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'productLineColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Product Line'),
              description: t('Column containing product line names'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'customerSegmentColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Customer Segment'),
              description: t(
                'Column containing customer segment (Enterprise, Mid-Market, SMB, Starter)',
              ),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'arrMetric',
            config: {
              ...sharedControls.metric,
              label: t('ARR Metric'),
              description: t('Metric for ARR amount'),
            },
          },
        ],
        [
          {
            name: 'customerCountMetric',
            config: {
              ...sharedControls.metric,
              label: t('Customer Count'),
              description: t('Metric for counting customers'),
            },
          },
        ],
        [
          {
            name: 'avgArrMetric',
            config: {
              ...sharedControls.metric,
              label: t('Average ARR per Customer'),
              description: t('Optional: Metric for average ARR per customer'),
            },
          },
        ],
        ['adhoc_filters'],
        ['row_limit'],
      ],
    },

    // =========================================================================
    // DISPLAY OPTIONS
    // =========================================================================
    {
      label: t('Display'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'showAsPercentage',
            config: {
              type: 'CheckboxControl',
              label: t('Show as Percentage'),
              description: t(
                'Display values as percentage of total instead of absolute',
              ),
              default: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showPreviousMonth',
            config: {
              type: 'CheckboxControl',
              label: t('Show Previous Month'),
              description: t(
                'Display previous month as ghost bars for comparison',
              ),
              default: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showYoYComparison',
            config: {
              type: 'CheckboxControl',
              label: t('Show YoY Comparison'),
              description: t('Display year-over-year comparison'),
              default: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showCustomerCounts',
            config: {
              type: 'CheckboxControl',
              label: t('Show Customer Counts'),
              description: t('Display customer counts in bars and legend'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showGrowthIndicators',
            config: {
              type: 'CheckboxControl',
              label: t('Show Growth Indicators'),
              description: t('Display MoM growth arrows on products'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showConcentrationAlerts',
            config: {
              type: 'CheckboxControl',
              label: t('Show Concentration Alerts'),
              description: t('Display product concentration risk warnings'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showCrossSellOpportunity',
            config: {
              type: 'CheckboxControl',
              label: t('Show Cross-Sell Opportunity'),
              description: t(
                'Display single-product customer expansion opportunity',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // CONCENTRATION THRESHOLDS
    // =========================================================================
    {
      label: t('Concentration Thresholds'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'productConcentrationThreshold',
            config: {
              type: 'TextControl',
              label: t('Single Product Alert (%)'),
              description: t(
                'Alert when a single product exceeds this % of total ARR',
              ),
              default: 70,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'topProductsThreshold',
            config: {
              type: 'TextControl',
              label: t('Top 2 Products Warning (%)'),
              description: t(
                'Warning when top 2 products exceed this % of total ARR',
              ),
              default: 85,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // SEGMENT TARGETS
    // =========================================================================
    {
      label: t('Segment Target Distribution'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'enterpriseTarget',
            config: {
              type: 'TextControl',
              label: t('Enterprise Target (%)'),
              description: t('Target % of ARR from Enterprise segment (>$50K)'),
              default: 40,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'midMarketTarget',
            config: {
              type: 'TextControl',
              label: t('Mid-Market Target (%)'),
              description: t(
                'Target % of ARR from Mid-Market segment ($10K-$50K)',
              ),
              default: 35,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'smbTarget',
            config: {
              type: 'TextControl',
              label: t('SMB Target (%)'),
              description: t('Target % of ARR from SMB segment ($1K-$10K)'),
              default: 20,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'starterTarget',
            config: {
              type: 'TextControl',
              label: t('Starter Target (%)'),
              description: t('Target % of ARR from Starter segment (<$1K)'),
              default: 5,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // SEGMENT COLORS
    // =========================================================================
    {
      label: t('Segment Colors'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'enterpriseColor',
            config: {
              type: 'ColorPickerControl',
              label: t('Enterprise Color'),
              description: t('Color for Enterprise segment bars'),
              default: SEGMENT_COLORS.enterprise,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'midMarketColor',
            config: {
              type: 'ColorPickerControl',
              label: t('Mid-Market Color'),
              description: t('Color for Mid-Market segment bars'),
              default: SEGMENT_COLORS.mid_market,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'smbColor',
            config: {
              type: 'ColorPickerControl',
              label: t('SMB Color'),
              description: t('Color for SMB segment bars'),
              default: SEGMENT_COLORS.smb,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'starterColor',
            config: {
              type: 'ColorPickerControl',
              label: t('Starter Color'),
              description: t('Color for Starter segment bars'),
              default: SEGMENT_COLORS.starter,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // FORMATTING
    // =========================================================================
    {
      label: t('Formatting'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'locale',
            config: {
              type: 'SelectControl',
              label: t('Locale'),
              description: t('Number formatting locale'),
              default: 'en-US',
              choices: [
                ['en-US', 'English (US)'],
                ['ru-RU', 'Russian'],
                ['uz-UZ', 'Uzbek'],
              ],
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'currencyFormat',
            config: {
              type: 'SelectControl',
              label: t('Currency Format'),
              description: t('How to format currency values'),
              default: 'short',
              choices: [
                ['short', 'Short ($1.2M)'],
                ['full', 'Full ($1,234,567)'],
              ],
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // LEGEND
    // =========================================================================
    {
      label: t('Legend'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'showLegend',
            config: {
              type: 'CheckboxControl',
              label: t('Show Legend'),
              description: t('Display chart legend with segment breakdown'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'legendPosition',
            config: {
              type: 'SelectControl',
              label: t('Legend Position'),
              description: t('Position of the legend'),
              default: 'right',
              choices: [
                ['top', 'Top'],
                ['bottom', 'Bottom'],
                ['left', 'Left'],
                ['right', 'Right'],
              ],
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.showLegend?.value),
            },
          },
        ],
      ],
    },

    // =========================================================================
    // INTERACTIVITY
    // =========================================================================
    {
      label: t('Interactivity'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'enableDrilldown',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Drilldown'),
              description: t(
                'Allow clicking to drill down to product/segment details',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableToggle',
            config: {
              type: 'CheckboxControl',
              label: t('Enable View Toggle'),
              description: t(
                'Allow switching between absolute and percentage view',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // ANNOTATIONS
    // =========================================================================
    sections.annotationsAndLayersControls,
  ],
};

export default config;
