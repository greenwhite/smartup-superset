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

const config: ControlPanelConfig = {
  controlPanelSections: [
    // =========================================================================
    // ENTITY TYPE SELECTION
    // =========================================================================
    {
      label: t('Entity Configuration'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'entityType',
            config: {
              type: 'SelectControl',
              label: t('Entity Type'),
              description: t('Select the type of entity to display status funnel for'),
              default: 'orders',
              choices: [
                ['orders', 'Заказы (Orders)'],
                ['visits', 'Визиты (Visits)'],
                ['leads', 'Лиды (Leads)'],
                ['tasks', 'Задачи (Tasks)'],
                ['custom', 'Другое (Custom)'],
              ],
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // QUERY SECTION - Column Mappings
    // =========================================================================
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'statusIdColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Status ID'),
              description: t('Column containing status identifier'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'statusNameColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Status Name'),
              description: t('Column containing status display name'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'statusOrderColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Status Order'),
              description: t('Column for ordering statuses (numeric)'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'statusColorColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Status Color'),
              description: t('Column containing status color (hex format)'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'entityCountMetric',
            config: {
              ...sharedControls.metric,
              label: t('Entity Count'),
              description: t('Metric for counting entities per status'),
            },
          },
        ],
        [
          {
            name: 'totalAmountMetric',
            config: {
              ...sharedControls.metric,
              label: t('Total Amount'),
              description: t('Metric for sum of amounts per status (optional)'),
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
            name: 'showAmounts',
            config: {
              type: 'CheckboxControl',
              label: t('Show Amounts'),
              description: t('Display total amount below each status count'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showPercentages',
            config: {
              type: 'CheckboxControl',
              label: t('Show Percentages'),
              description: t('Display percentage badge on each card'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showArrows',
            config: {
              type: 'CheckboxControl',
              label: t('Show Flow Arrows'),
              description: t('Display arrows between status cards'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showStatusBadge',
            config: {
              type: 'CheckboxControl',
              label: t('Show Status Badge'),
              description: t('Display colored status name badge on cards'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'maxCardsPerRow',
            config: {
              type: 'TextControl',
              label: t('Max Cards Per Row'),
              description: t('Maximum number of status cards to show without scrolling'),
              default: 8,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // AMOUNT FORMATTING
    // =========================================================================
    {
      label: t('Amount Formatting'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'amountPrecision',
            config: {
              type: 'TextControl',
              label: t('Amount Precision'),
              description: t('Number of decimal places for amounts'),
              default: 1,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'amountUnit',
            config: {
              type: 'SelectControl',
              label: t('Amount Unit'),
              description: t('Fixed unit for amounts or auto-detect'),
              default: 'auto',
              choices: [
                ['auto', t('Auto')],
                ['thousands', t('Thousands')],
                ['millions', t('Millions')],
                ['billions', t('Billions')],
              ],
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'currencyCode',
            config: {
              type: 'SelectControl',
              label: t('Currency'),
              description: t('Currency for amount display'),
              default: 'UZS',
              choices: [
                ['UZS', 'UZS (сум)'],
                ['USD', 'USD ($)'],
                ['EUR', 'EUR (€)'],
                ['RUB', 'RUB (₽)'],
                ['', t('None')],
              ],
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'currencyPosition',
            config: {
              type: 'SelectControl',
              label: t('Currency Position'),
              description: t('Position of currency symbol'),
              default: 'after',
              choices: [
                ['before', t('Before amount ($100)')],
                ['after', t('After amount (100 сум)')],
              ],
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // STYLING
    // =========================================================================
    {
      label: t('Styling'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'cardBorderRadius',
            config: {
              type: 'TextControl',
              label: t('Card Border Radius'),
              description: t('Border radius for status cards (px)'),
              default: 12,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'cardLayout',
            config: {
              type: 'SelectControl',
              label: t('Card Layout'),
              description: t('How cards should be arranged'),
              default: 'horizontal',
              choices: [
                ['horizontal', 'Horizontal (single row)'],
                ['responsive', 'Responsive (wrap on smaller screens)'],
              ],
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // LOCALIZATION
    // =========================================================================
    {
      label: t('Localization'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'locale',
            config: {
              type: 'SelectControl',
              label: t('Locale'),
              description: t('Number formatting locale'),
              default: 'ru-RU',
              choices: [
                ['ru-RU', 'Russian (1 234,5)'],
                ['en-US', 'English (1,234.5)'],
                ['uz-UZ', 'Uzbek'],
              ],
              renderTrigger: true,
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
              description: t('Allow clicking on cards to drill down to entity list'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableEntityTypeSwitch',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Entity Type Switch'),
              description: t('Show dropdown to switch between entity types'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'autoRefreshInterval',
            config: {
              type: 'TextControl',
              label: t('Auto Refresh (minutes)'),
              description: t('Auto-refresh interval in minutes (0 to disable)'),
              default: 5,
              isInt: true,
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
