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
  D3_FORMAT_DOCS,
  getStandardizedControls,
  CustomControlItem,
  ControlPanelSectionConfig,
} from '@superset-ui/chart-controls';

// =============================================================================
// OPTIONS
// =============================================================================

const LAYOUT_OPTIONS = [
  { label: t('Auto (responsive)'), value: 'auto' },
  { label: t('Horizontal row'), value: 'horizontal' },
  { label: t('Grid'), value: 'grid' },
];

const COLUMNS_OPTIONS = [
  { label: t('Auto'), value: 0 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
];

const NUMBER_FORMAT_OPTIONS = [
  { label: t('Smart (auto-select)'), value: 'smart' },
  { label: t('Integer (1,234,567)'), value: 'integer' },
  { label: t('1 Decimal (1,234.5)'), value: 'decimal_1' },
  { label: t('2 Decimals (1,234.56)'), value: 'decimal_2' },
  { label: t('Thousands (1.23K)'), value: 'thousands' },
  { label: t('Millions (1.23M)'), value: 'millions' },
  { label: t('Billions (1.23B)'), value: 'billions' },
  { label: t('Percent (12.3%)'), value: 'percent' },
  { label: t('Custom D3 format'), value: 'custom' },
];

const LOCALE_OPTIONS = [
  { label: t('English (1,234.56)'), value: 'en' },
  { label: t('Russian (1 234,56)'), value: 'ru' },
  { label: t('Uzbek (1 234,56)'), value: 'uz' },
];

const TIME_COMPARISON_OPTIONS = [
  { label: t('No comparison'), value: 'none' },
  { label: t('Day over Day (DoD)'), value: 'DoD' },
  { label: t('Week over Week (WoW)'), value: 'WoW' },
  { label: t('Month over Month (MoM)'), value: 'MoM' },
  { label: t('Quarter over Quarter (QoQ)'), value: 'QoQ' },
  { label: t('Year over Year (YoY)'), value: 'YoY' },
  { label: t('Custom period'), value: 'custom' },
];

const COMPARISON_COLOR_SCHEMES = [
  { label: t('Green for increase, Red for decrease'), value: 'green_up' },
  { label: t('Red for increase, Green for decrease (costs)'), value: 'red_up' },
];

// =============================================================================
// CONTROL DEFINITIONS
// =============================================================================

// Layout controls
const layout: CustomControlItem = {
  name: 'layout',
  config: {
    type: 'SelectControl',
    label: t('Layout'),
    renderTrigger: true,
    clearable: false,
    default: 'auto',
    options: LAYOUT_OPTIONS,
    description: t('How to arrange metric cards'),
  },
};

const columnsCount: CustomControlItem = {
  name: 'columns_count',
  config: {
    type: 'SelectControl',
    label: t('Columns'),
    renderTrigger: true,
    clearable: false,
    default: 0,
    options: COLUMNS_OPTIONS,
    description: t('Number of columns (0 = auto)'),
  },
};

const cardGap: CustomControlItem = {
  name: 'card_gap',
  config: {
    type: 'SliderControl',
    label: t('Card Gap'),
    renderTrigger: true,
    min: 0,
    max: 32,
    step: 4,
    default: 16,
    description: t('Space between cards in pixels'),
  },
};

const cardBorderRadius: CustomControlItem = {
  name: 'card_border_radius',
  config: {
    type: 'SliderControl',
    label: t('Card Border Radius'),
    renderTrigger: true,
    min: 0,
    max: 24,
    step: 2,
    default: 8,
    description: t('Corner roundness of cards'),
  },
};

const cardShadow: CustomControlItem = {
  name: 'card_shadow',
  config: {
    type: 'CheckboxControl',
    label: t('Card Shadow'),
    renderTrigger: true,
    default: true,
    description: t('Add shadow to cards'),
  },
};

// Display controls
const showMetricName: CustomControlItem = {
  name: 'show_metric_name',
  config: {
    type: 'CheckboxControl',
    label: t('Show Metric Name'),
    renderTrigger: true,
    default: true,
    description: t('Display the metric name above the value'),
  },
};

const showComparison: CustomControlItem = {
  name: 'show_comparison',
  config: {
    type: 'CheckboxControl',
    label: t('Show Comparison'),
    renderTrigger: true,
    default: true,
    description: t('Display percentage change'),
  },
};

const showSparkline: CustomControlItem = {
  name: 'show_sparkline',
  config: {
    type: 'CheckboxControl',
    label: t('Show Sparkline'),
    renderTrigger: true,
    default: true,
    description: t('Display mini trend chart'),
  },
};

// Number formatting
const numberFormat: CustomControlItem = {
  name: 'number_format',
  config: {
    type: 'SelectControl',
    label: t('Number Format'),
    renderTrigger: true,
    clearable: false,
    default: 'smart',
    options: NUMBER_FORMAT_OPTIONS,
    description: t('How to format metric values'),
  },
};

const customNumberFormat: CustomControlItem = {
  name: 'custom_number_format',
  config: {
    type: 'TextControl',
    label: t('Custom D3 Format'),
    renderTrigger: true,
    default: ',.2f',
    description: `${t('D3 format string.')} ${D3_FORMAT_DOCS}`,
    visibility: ({ controls }) => controls?.number_format?.value === 'custom',
  },
};

const numberLocale: CustomControlItem = {
  name: 'number_locale',
  config: {
    type: 'SelectControl',
    label: t('Number Locale'),
    renderTrigger: true,
    clearable: false,
    default: 'ru',
    options: LOCALE_OPTIONS,
    description: t('Locale for number formatting'),
  },
};

// Time comparison
const timeComparisonEnabled: CustomControlItem = {
  name: 'time_comparison_enabled',
  config: {
    type: 'CheckboxControl',
    label: t('Enable Time Comparison'),
    renderTrigger: true,
    default: true,
    description: t('Compare with previous time period'),
  },
};

const timeComparisonPeriod: CustomControlItem = {
  name: 'time_comparison_period',
  config: {
    type: 'SelectControl',
    label: t('Comparison Period'),
    renderTrigger: true,
    clearable: false,
    default: 'MoM',
    options: TIME_COMPARISON_OPTIONS,
    description: t('Time period for comparison'),
    visibility: ({ controls }) => controls?.time_comparison_enabled?.value === true,
  },
};

const customTimeOffset: CustomControlItem = {
  name: 'custom_time_offset',
  config: {
    type: 'TextControl',
    label: t('Custom Offset'),
    renderTrigger: true,
    default: '30 days ago',
    description: t('Custom time offset (e.g., "30 days ago")'),
    visibility: ({ controls }) =>
      controls?.time_comparison_enabled?.value === true &&
      controls?.time_comparison_period?.value === 'custom',
  },
};

const comparisonColorScheme: CustomControlItem = {
  name: 'comparison_color_scheme',
  config: {
    type: 'SelectControl',
    label: t('Comparison Colors'),
    renderTrigger: true,
    clearable: false,
    default: 'green_up',
    options: COMPARISON_COLOR_SCHEMES,
    description: t('Color scheme for positive/negative changes'),
    visibility: ({ controls }) => controls?.time_comparison_enabled?.value === true,
  },
};

// Sparkline
const sparklineHeight: CustomControlItem = {
  name: 'sparkline_height',
  config: {
    type: 'SliderControl',
    label: t('Sparkline Height'),
    renderTrigger: true,
    min: 20,
    max: 60,
    step: 5,
    default: 30,
    description: t('Height of sparkline charts'),
    visibility: ({ controls }) => controls?.show_sparkline?.value === true,
  },
};

const sparklinePeriods: CustomControlItem = {
  name: 'sparkline_periods',
  config: {
    type: 'SelectControl',
    label: t('Sparkline Periods'),
    renderTrigger: true,
    clearable: false,
    default: 7,
    options: [
      { label: t('7 periods'), value: 7 },
      { label: t('14 periods'), value: 14 },
      { label: t('30 periods'), value: 30 },
    ],
    description: t('Number of data points in sparkline'),
    visibility: ({ controls }) => controls?.show_sparkline?.value === true,
  },
};

// Colors
const headerColor: CustomControlItem = {
  name: 'header_color',
  config: {
    type: 'ColorPickerControl',
    label: t('Header Color'),
    renderTrigger: true,
    default: { r: 108, g: 117, b: 125, a: 1 },
    description: t('Color for metric names'),
  },
};

const valueColor: CustomControlItem = {
  name: 'value_color',
  config: {
    type: 'ColorPickerControl',
    label: t('Value Color'),
    renderTrigger: true,
    default: { r: 33, g: 37, b: 41, a: 1 },
    description: t('Color for metric values'),
  },
};

// =============================================================================
// CONTROL PANEL SECTIONS
// =============================================================================

const querySectionConfig: ControlPanelSectionConfig = {
  label: t('Query'),
  expanded: true,
  controlSetRows: [
    ['metrics'],
    ['adhoc_filters'],
    ['row_limit'],
  ],
};

const layoutSectionConfig: ControlPanelSectionConfig = {
  label: t('Layout'),
  expanded: true,
  controlSetRows: [
    [layout],
    [columnsCount],
    [cardGap],
    [cardBorderRadius],
    [cardShadow],
  ],
};

const displaySectionConfig: ControlPanelSectionConfig = {
  label: t('Display'),
  expanded: true,
  controlSetRows: [
    [showMetricName],
    [showComparison],
    [showSparkline],
  ],
};

const formattingSectionConfig: ControlPanelSectionConfig = {
  label: t('Number Formatting'),
  expanded: false,
  controlSetRows: [
    [numberFormat],
    [customNumberFormat],
    [numberLocale],
  ],
};

const comparisonSectionConfig: ControlPanelSectionConfig = {
  label: t('Time Comparison'),
  expanded: false,
  controlSetRows: [
    [timeComparisonEnabled],
    [timeComparisonPeriod],
    [customTimeOffset],
    [comparisonColorScheme],
  ],
};

const sparklineSectionConfig: ControlPanelSectionConfig = {
  label: t('Sparkline'),
  expanded: false,
  controlSetRows: [
    [sparklineHeight],
    [sparklinePeriods],
  ],
};

const colorsSectionConfig: ControlPanelSectionConfig = {
  label: t('Colors'),
  expanded: false,
  controlSetRows: [
    [headerColor],
    [valueColor],
  ],
};

// =============================================================================
// EXPORT CONTROL PANEL CONFIG
// =============================================================================

export default {
  controlPanelSections: [
    querySectionConfig,
    layoutSectionConfig,
    displaySectionConfig,
    formattingSectionConfig,
    comparisonSectionConfig,
    sparklineSectionConfig,
    colorsSectionConfig,
  ],
  controlOverrides: {},
  formDataOverrides: (formData: any) => ({
    ...formData,
    metrics: getStandardizedControls().popAllMetrics(),
  }),
} as ControlPanelConfig;
