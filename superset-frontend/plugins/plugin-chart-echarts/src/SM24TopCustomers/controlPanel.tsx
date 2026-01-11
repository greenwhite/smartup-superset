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
    // QUERY SECTION - Column Mappings
    // =========================================================================
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'customerIdColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Customer ID'),
              description: t('Column containing unique customer identifier'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'customerNameColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Customer Name'),
              description: t('Column containing customer name'),
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
              description: t('Metric for Annual Recurring Revenue'),
            },
          },
        ],
        [
          {
            name: 'growthMetric',
            config: {
              ...sharedControls.metric,
              label: t('MoM Growth'),
              description: t(
                'Metric for month-over-month ARR growth percentage',
              ),
            },
          },
        ],
        [
          {
            name: 'healthScoreColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Health Score'),
              description: t('Column containing customer health score (0-100)'),
              multi: false,
            },
          },
        ],
        ['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: {
              ...sharedControls.row_limit,
              default: 30,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // ADDITIONAL COLUMNS
    // =========================================================================
    {
      label: t('Additional Columns'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'industryColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Industry'),
              description: t('Column containing industry/vertical'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'regionColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Region'),
              description: t('Column containing geographic region'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'productsColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Products'),
              description: t(
                'Column containing products used (comma-separated or array)',
              ),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'customerSinceColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Customer Since'),
              description: t('Column containing first payment/signup date'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'renewalDateColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Renewal Date'),
              description: t('Column containing next renewal date'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'accountManagerColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Account Manager / CSM'),
              description: t('Column containing CSM or account manager name'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'lastActivityColumn',
            config: {
              ...sharedControls.groupby,
              label: t('Last Activity Date'),
              description: t(
                'Column containing last customer activity/engagement date',
              ),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'npsScoreColumn',
            config: {
              ...sharedControls.groupby,
              label: t('NPS Score'),
              description: t(
                'Column containing Net Promoter Score (-100 to 100)',
              ),
              multi: false,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // TABLE DISPLAY
    // =========================================================================
    {
      label: t('Table Display'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'rowsPerPage',
            config: {
              type: 'TextControl',
              label: t('Rows Per Page'),
              description: t('Number of rows to display per page'),
              default: 30,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableSearch',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Search'),
              description: t('Show search box for filtering customers'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableMultiSort',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Multi-Column Sort'),
              description: t('Allow sorting by multiple columns (Shift+Click)'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableRowSelection',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Row Selection'),
              description: t('Allow selecting multiple rows for bulk actions'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableVirtualScroll',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Virtual Scrolling'),
              description: t(
                'Use virtual scrolling for better performance with many rows',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showFooterSummary',
            config: {
              type: 'CheckboxControl',
              label: t('Show Footer Summary'),
              description: t('Display summary statistics in table footer'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // THRESHOLDS
    // =========================================================================
    {
      label: t('Risk Thresholds'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'healthRiskThreshold',
            config: {
              type: 'TextControl',
              label: t('Health Risk Threshold'),
              description: t(
                'Health score below this value is considered at-risk',
              ),
              default: 60,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'renewalUrgentDays',
            config: {
              type: 'TextControl',
              label: t('Urgent Renewal Days'),
              description: t('Days until renewal to flag as urgent'),
              default: 30,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'renewalUpcomingDays',
            config: {
              type: 'TextControl',
              label: t('Upcoming Renewal Days'),
              description: t('Days until renewal to highlight as upcoming'),
              default: 90,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'inactivityAlertDays',
            config: {
              type: 'TextControl',
              label: t('Inactivity Alert Days'),
              description: t(
                'Days of inactivity to flag customer as disengaged',
              ),
              default: 30,
              isInt: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'concentrationAlertPercent',
            config: {
              type: 'TextControl',
              label: t('Concentration Alert (%)'),
              description: t(
                'Alert if top 10 customers exceed this % of total ARR',
              ),
              default: 50,
              isFloat: true,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    // =========================================================================
    // CONDITIONAL FORMATTING
    // =========================================================================
    {
      label: t('Conditional Formatting'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'highlightAtRisk',
            config: {
              type: 'CheckboxControl',
              label: t('Highlight At-Risk Customers'),
              description: t(
                'Bold customer names with health score below threshold',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'highlightTopTen',
            config: {
              type: 'CheckboxControl',
              label: t('Highlight Top 10'),
              description: t('Show star icon for top 10 customers'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'highlightUrgentRenewals',
            config: {
              type: 'CheckboxControl',
              label: t('Highlight Urgent Renewals'),
              description: t(
                'Yellow background for customers with renewal < 90 days',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showConcentrationAlert',
            config: {
              type: 'CheckboxControl',
              label: t('Show Concentration Alert'),
              description: t(
                'Display warning if top customers represent high ARR concentration',
              ),
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
              description: t('Number and date formatting locale'),
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
            name: 'dateFormat',
            config: {
              type: 'SelectControl',
              label: t('Date Format'),
              description: t('How to display dates'),
              default: 'MMM DD, YYYY',
              choices: [
                ['MMM DD, YYYY', 'Jan 15, 2025'],
                ['DD MMM YYYY', '15 Jan 2025'],
                ['YYYY-MM-DD', '2025-01-15'],
                ['relative', 'Relative (3 days ago)'],
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
              description: t(
                'Allow clicking to drill down to customer details',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableQuickActions',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Quick Actions'),
              description: t(
                'Show quick action buttons (schedule check-in, export, etc.)',
              ),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'enableExport',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Export'),
              description: t('Allow exporting customer data'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'exportLimit',
            config: {
              type: 'TextControl',
              label: t('Export Row Limit'),
              description: t('Maximum rows to export'),
              default: 1000,
              isInt: true,
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.enableExport?.value),
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
