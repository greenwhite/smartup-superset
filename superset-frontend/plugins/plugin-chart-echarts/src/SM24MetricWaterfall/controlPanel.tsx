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
import { WATERFALL_COLORS, DEFAULT_BAR_ORDER } from './types';

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
            name: 'beginningArrMetric',
            config: {
              ...sharedControls.metric,
              label: t('Beginning ARR'),
              description: t('Metric for Beginning ARR value'),
            },
          },
        ],
        [
          {
            name: 'newBusinessMetric',
            config: {
              ...sharedControls.metric,
              label: t('New Business'),
              description: t('Metric for New Business ARR'),
            },
          },
        ],
        [
          {
            name: 'expansionMetric',
            config: {
              ...sharedControls.metric,
              label: t('Expansion'),
              description: t('Metric for Expansion ARR'),
            },
          },
        ],
        [
          {
            name: 'contractionMetric',
            config: {
              ...sharedControls.metric,
              label: t('Contraction'),
              description: t('Metric for Contraction ARR (negative value)'),
            },
          },
        ],
        [
          {
            name: 'churnMetric',
            config: {
              ...sharedControls.metric,
              label: t('Churn'),
              description: t('Metric for Churned ARR (negative value)'),
            },
          },
        ],
        [
          {
            name: 'endingArrMetric',
            config: {
              ...sharedControls.metric,
              label: t('Ending ARR'),
              description: t('Metric for Ending ARR value'),
            },
          },
        ],
        [
          {
            name: 'customerCountMetric',
            config: {
              ...sharedControls.metric,
              label: t('Customer Count'),
              description: t('Optional metric for customer count per category'),
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
            name: 'showConnectorLines',
            config: {
              type: 'CheckboxControl',
              label: t('Show Connector Lines'),
              description: t('Display connecting lines between waterfall bars'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showAbsoluteLabels',
            config: {
              type: 'CheckboxControl',
              label: t('Show Absolute Values'),
              description: t('Display dollar amounts above each bar'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showPercentLabels',
            config: {
              type: 'CheckboxControl',
              label: t('Show Percentage Labels'),
              description: t('Display percentage of Beginning ARR inside bars'),
              default: true,
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
              description: t('Display number of customers affected in tooltip'),
              default: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showQuickRatio',
            config: {
              type: 'CheckboxControl',
              label: t('Show Quick Ratio'),
              description: t(
                'Display Quick Ratio badge (New + Expansion) / (Contraction + Churn)',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showNetChange',
            config: {
              type: 'CheckboxControl',
              label: t('Show Net Change'),
              description: t('Display net ARR change annotation'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showGrowthRate',
            config: {
              type: 'CheckboxControl',
              label: t('Show Growth Rate'),
              description: t('Display growth rate percentage'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // BAR ORDER
    // =========================================================================
    {
      label: t('Bar Order'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'barOrder',
            config: {
              type: 'SelectControl',
              label: t('Bar Order'),
              description: t('Order of bars in the waterfall chart'),
              multi: true,
              freeForm: true,
              default: DEFAULT_BAR_ORDER,
              choices: DEFAULT_BAR_ORDER.map(item => [item, item]),
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // COLORS
    // =========================================================================
    {
      label: t('Colors'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'colorTotal',
            config: {
              type: 'ColorPickerControl',
              label: t('Total Bars Color'),
              description: t('Color for Beginning and Ending ARR bars'),
              default: WATERFALL_COLORS.total,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'colorIncrease',
            config: {
              type: 'ColorPickerControl',
              label: t('Increase Bars Color'),
              description: t('Color for New Business and Expansion bars'),
              default: WATERFALL_COLORS.increase,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'colorDecrease',
            config: {
              type: 'ColorPickerControl',
              label: t('Decrease Bars Color'),
              description: t('Color for Contraction and Churn bars'),
              default: WATERFALL_COLORS.decrease,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'colorConnector',
            config: {
              type: 'ColorPickerControl',
              label: t('Connector Lines Color'),
              description: t('Color for connecting lines between bars'),
              default: WATERFALL_COLORS.connector,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // THRESHOLDS & ALERTS
    // =========================================================================
    {
      label: t('Thresholds & Alerts'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'targetQuickRatio',
            config: {
              type: 'TextControl',
              label: t('Target Quick Ratio'),
              description: t(
                'Target Quick Ratio for best-in-class SaaS (default: 4)',
              ),
              default: 4,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'churnAlertThreshold',
            config: {
              type: 'TextControl',
              label: t('Churn Alert Threshold (%)'),
              description: t(
                'Alert when Churn exceeds this percentage of Beginning ARR',
              ),
              default: 5,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'contractionWarningEnabled',
            config: {
              type: 'CheckboxControl',
              label: t('Contraction > Expansion Warning'),
              description: t('Show warning when Contraction exceeds Expansion'),
              default: true,
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
              description: t('Display chart legend'),
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
              default: 'bottom',
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
                'Allow clicking on bars to drill down to customer lists',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // ANNOTATIONS (from parent or sections)
    // =========================================================================
    sections.annotationsAndLayersControls,
  ],
};

export default config;
