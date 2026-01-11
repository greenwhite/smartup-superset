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
import { GenericDataType } from '@apache-superset/core/api/core';
import {
  ControlPanelConfig,
  D3_FORMAT_DOCS,
  Dataset,
  getStandardizedControls,
  CustomControlItem,
  ControlPanelSectionConfig,
} from '@superset-ui/chart-controls';

// =============================================================================
// OPTIONS
// =============================================================================

const FONT_SIZE_OPTIONS_SMALL = [
  { label: t('Tiny'), value: 0.06 },
  { label: t('Small'), value: 0.08 },
  { label: t('Normal'), value: 0.1 },
  { label: t('Large'), value: 0.125 },
  { label: t('Huge'), value: 0.15 },
];

const FONT_SIZE_OPTIONS_LARGE = [
  { label: t('Tiny'), value: 0.15 },
  { label: t('Small'), value: 0.2 },
  { label: t('Normal'), value: 0.3 },
  { label: t('Large'), value: 0.4 },
  { label: t('Huge'), value: 0.5 },
];

const NUMBER_FORMAT_PRESETS = [
  { label: t('Integer (1,234,567)'), value: 'integer' },
  { label: t('1 Decimal (1,234,567.8)'), value: 'decimal_1' },
  { label: t('2 Decimals (1,234,567.89)'), value: 'decimal_2' },
  { label: t('Thousands (1.23K)'), value: 'thousands' },
  { label: t('Millions (1.23M)'), value: 'millions' },
  { label: t('Billions (1.23B)'), value: 'billions' },
  { label: t('Percent (99.8%)'), value: 'percent' },
  { label: t('Percent 2 decimals (99.80%)'), value: 'percent_decimal' },
  { label: t('Smart (auto-select)'), value: 'smart' },
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

const SPARKLINE_TYPE_OPTIONS = [
  { label: t('Line'), value: 'line' },
  { label: t('Area'), value: 'area' },
  { label: t('Bar'), value: 'bar' },
];

const COMPARISON_COLOR_SCHEMES = [
  { label: t('Green for increase, Red for decrease'), value: 'green_up' },
  { label: t('Red for increase, Green for decrease (costs)'), value: 'red_up' },
];

// =============================================================================
// CONTROL DEFINITIONS
// =============================================================================

// Display controls
const headerFontSize: CustomControlItem = {
  name: 'header_font_size',
  config: {
    type: 'SelectControl',
    label: t('Number Font Size'),
    renderTrigger: true,
    clearable: false,
    default: 0.3,
    options: FONT_SIZE_OPTIONS_LARGE,
    description: t('Font size for the main KPI number'),
  },
};

const subtitleFontSize: CustomControlItem = {
  name: 'subtitle_font_size',
  config: {
    type: 'SelectControl',
    label: t('Subtitle Font Size'),
    renderTrigger: true,
    clearable: false,
    default: 0.08,
    options: FONT_SIZE_OPTIONS_SMALL,
    description: t('Font size for the subtitle text'),
  },
};

const metricNameFontSize: CustomControlItem = {
  name: 'metric_name_font_size',
  config: {
    type: 'SelectControl',
    label: t('Metric Name Font Size'),
    renderTrigger: true,
    clearable: false,
    default: 0.08,
    options: FONT_SIZE_OPTIONS_SMALL,
    description: t('Font size for the metric name'),
    visibility: ({ controls }) => controls?.show_metric_name?.value === true,
    resetOnHide: false,
  },
};

const showMetricName: CustomControlItem = {
  name: 'show_metric_name',
  config: {
    type: 'CheckboxControl',
    label: t('Show Metric Name'),
    renderTrigger: true,
    default: true,
    description: t('Whether to display the metric name above the number'),
  },
};

const subtitle: CustomControlItem = {
  name: 'subtitle',
  config: {
    type: 'TextControl',
    label: t('Subtitle'),
    renderTrigger: true,
    description: t('Description text that shows below the number'),
  },
};

// Number formatting controls
const numberFormatType: CustomControlItem = {
  name: 'number_format_type',
  config: {
    type: 'SelectControl',
    label: t('Number Format'),
    renderTrigger: true,
    clearable: false,
    default: 'smart',
    options: NUMBER_FORMAT_PRESETS,
    description: t('How to format the number value'),
  },
};

const customNumberFormat: CustomControlItem = {
  name: 'custom_number_format',
  config: {
    type: 'TextControl',
    label: t('Custom D3 Format'),
    renderTrigger: true,
    default: ',.2f',
    description: `${t('D3 format string for custom formatting.')} ${D3_FORMAT_DOCS}`,
    visibility: ({ controls }) => controls?.number_format_type?.value === 'custom',
  },
};

const numberPrefix: CustomControlItem = {
  name: 'number_prefix',
  config: {
    type: 'TextControl',
    label: t('Prefix'),
    renderTrigger: true,
    default: '',
    description: t('Text to show before the number (e.g., "$", "Revenue: ")'),
  },
};

const numberSuffix: CustomControlItem = {
  name: 'number_suffix',
  config: {
    type: 'TextControl',
    label: t('Suffix'),
    renderTrigger: true,
    default: '',
    description: t('Text to show after the number (e.g., " UZS", "%", " users")'),
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
    description: t('Locale for number formatting (affects decimal/thousands separators)'),
  },
};

// Color controls
const defaultColor: CustomControlItem = {
  name: 'default_color',
  config: {
    type: 'ColorPickerControl',
    label: t('Default Color'),
    renderTrigger: true,
    default: { r: 51, g: 51, b: 51, a: 1 },
    description: t('Default color for the number when no threshold is matched'),
  },
};

// Time comparison controls
const timeComparisonEnabled: CustomControlItem = {
  name: 'time_comparison_enabled',
  config: {
    type: 'CheckboxControl',
    label: t('Enable Time Comparison'),
    renderTrigger: true,
    default: false,
    description: t('Compare current value with a previous time period'),
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
    description: t('Select the time period for comparison'),
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
    description: t('Custom time offset (e.g., "30 days ago", "2 weeks ago")'),
    visibility: ({ controls }) =>
      controls?.time_comparison_enabled?.value === true &&
      controls?.time_comparison_period?.value === 'custom',
  },
};

const comparisonColorEnabled: CustomControlItem = {
  name: 'comparison_color_enabled',
  config: {
    type: 'CheckboxControl',
    label: t('Color-code comparison'),
    renderTrigger: true,
    default: true,
    description: t('Apply color to indicate positive/negative change'),
    visibility: ({ controls }) => controls?.time_comparison_enabled?.value === true,
  },
};

const comparisonColorScheme: CustomControlItem = {
  name: 'comparison_color_scheme',
  config: {
    type: 'SelectControl',
    label: t('Color Scheme'),
    renderTrigger: true,
    clearable: false,
    default: 'green_up',
    options: COMPARISON_COLOR_SCHEMES,
    description: t('Color scheme for positive/negative changes'),
    visibility: ({ controls }) =>
      controls?.time_comparison_enabled?.value === true &&
      controls?.comparison_color_enabled?.value === true,
  },
};

const showPreviousValue: CustomControlItem = {
  name: 'show_previous_value',
  config: {
    type: 'CheckboxControl',
    label: t('Show Previous Value'),
    renderTrigger: true,
    default: true,
    description: t('Display the value from the comparison period'),
    visibility: ({ controls }) => controls?.time_comparison_enabled?.value === true,
  },
};

const showAbsoluteDifference: CustomControlItem = {
  name: 'show_absolute_difference',
  config: {
    type: 'CheckboxControl',
    label: t('Show Absolute Difference'),
    renderTrigger: true,
    default: false,
    description: t('Display the absolute difference between periods'),
    visibility: ({ controls }) => controls?.time_comparison_enabled?.value === true,
  },
};

const showPercentDifference: CustomControlItem = {
  name: 'show_percent_difference',
  config: {
    type: 'CheckboxControl',
    label: t('Show Percent Change'),
    renderTrigger: true,
    default: true,
    description: t('Display the percentage change between periods'),
    visibility: ({ controls }) => controls?.time_comparison_enabled?.value === true,
  },
};

// Sparkline controls
const sparklineEnabled: CustomControlItem = {
  name: 'sparkline_enabled',
  config: {
    type: 'CheckboxControl',
    label: t('Enable Sparkline'),
    renderTrigger: true,
    default: false,
    description: t('Show a mini trend chart below the number'),
  },
};

const sparklineType: CustomControlItem = {
  name: 'sparkline_type',
  config: {
    type: 'SelectControl',
    label: t('Sparkline Type'),
    renderTrigger: true,
    clearable: false,
    default: 'area',
    options: SPARKLINE_TYPE_OPTIONS,
    description: t('Type of sparkline chart'),
    visibility: ({ controls }) => controls?.sparkline_enabled?.value === true,
  },
};

const sparklineColor: CustomControlItem = {
  name: 'sparkline_color',
  config: {
    type: 'ColorPickerControl',
    label: t('Sparkline Color'),
    renderTrigger: true,
    default: { r: 46, g: 204, b: 113, a: 1 }, // Smartup24 Green
    description: t('Color for the sparkline'),
    visibility: ({ controls }) => controls?.sparkline_enabled?.value === true,
  },
};

const sparklinePeriods: CustomControlItem = {
  name: 'sparkline_periods',
  config: {
    type: 'SelectControl',
    label: t('Number of Periods'),
    renderTrigger: true,
    clearable: false,
    default: 7,
    options: [
      { label: t('7 periods'), value: 7 },
      { label: t('14 periods'), value: 14 },
      { label: t('30 periods'), value: 30 },
      { label: t('90 periods'), value: 90 },
    ],
    description: t('Number of data points to show in sparkline'),
    visibility: ({ controls }) => controls?.sparkline_enabled?.value === true,
  },
};

// Progress bar controls
const progressBarEnabled: CustomControlItem = {
  name: 'progress_bar_enabled',
  config: {
    type: 'CheckboxControl',
    label: t('Enable Progress Bar'),
    renderTrigger: true,
    default: false,
    description: t('Show progress towards a target value'),
  },
};

const progressBarTarget: CustomControlItem = {
  name: 'progress_bar_target',
  config: {
    type: 'TextControl',
    label: t('Target Value'),
    renderTrigger: true,
    default: '100',
    description: t('Target value for the progress bar'),
    visibility: ({ controls }) => controls?.progress_bar_enabled?.value === true,
  },
};

const progressBarShowTarget: CustomControlItem = {
  name: 'progress_bar_show_target',
  config: {
    type: 'CheckboxControl',
    label: t('Show Target Label'),
    renderTrigger: true,
    default: true,
    description: t('Display the target value on the progress bar'),
    visibility: ({ controls }) => controls?.progress_bar_enabled?.value === true,
  },
};

const progressBarShowPercentage: CustomControlItem = {
  name: 'progress_bar_show_percentage',
  config: {
    type: 'CheckboxControl',
    label: t('Show Percentage'),
    renderTrigger: true,
    default: true,
    description: t('Display progress as percentage'),
    visibility: ({ controls }) => controls?.progress_bar_enabled?.value === true,
  },
};

// Animation controls
const animationEnabled: CustomControlItem = {
  name: 'animation_enabled',
  config: {
    type: 'CheckboxControl',
    label: t('Enable Animation'),
    renderTrigger: true,
    default: true,
    description: t('Animate number changes'),
  },
};

// =============================================================================
// CONTROL PANEL SECTIONS
// =============================================================================

const querySectionConfig: ControlPanelSectionConfig = {
  label: t('Query'),
  expanded: true,
  controlSetRows: [
    ['metric'],
    ['adhoc_filters'],
  ],
};

const displaySectionConfig: ControlPanelSectionConfig = {
  label: t('Display'),
  expanded: true,
  controlSetRows: [
    [headerFontSize],
    [showMetricName],
    [metricNameFontSize],
    [subtitle],
    [subtitleFontSize],
    [animationEnabled],
  ],
};

const formattingSectionConfig: ControlPanelSectionConfig = {
  label: t('Number Formatting'),
  expanded: true,
  controlSetRows: [
    [numberFormatType],
    [customNumberFormat],
    [numberLocale],
    [numberPrefix, numberSuffix],
  ],
};

const comparisonSectionConfig: ControlPanelSectionConfig = {
  label: t('Time Comparison'),
  expanded: false,
  controlSetRows: [
    [timeComparisonEnabled],
    [timeComparisonPeriod],
    [customTimeOffset],
    [showPreviousValue],
    [showAbsoluteDifference],
    [showPercentDifference],
    [comparisonColorEnabled],
    [comparisonColorScheme],
  ],
};

const sparklineSectionConfig: ControlPanelSectionConfig = {
  label: t('Sparkline'),
  expanded: false,
  controlSetRows: [
    [sparklineEnabled],
    [sparklineType],
    [sparklineColor],
    [sparklinePeriods],
  ],
};

const progressBarSectionConfig: ControlPanelSectionConfig = {
  label: t('Progress Bar'),
  expanded: false,
  controlSetRows: [
    [progressBarEnabled],
    [progressBarTarget],
    [progressBarShowTarget],
    [progressBarShowPercentage],
  ],
};

const colorsSectionConfig: ControlPanelSectionConfig = {
  label: t('Colors & Conditional Formatting'),
  expanded: false,
  controlSetRows: [
    [defaultColor],
    [
      {
        name: 'conditional_formatting',
        config: {
          type: 'ConditionalFormattingControl',
          renderTrigger: true,
          label: t('Conditional Formatting'),
          description: t(
            'Apply conditional color formatting based on value thresholds.',
          ),
          shouldMapStateToProps() {
            return true;
          },
          mapStateToProps(explore, _, chart) {
            const verboseMap = explore?.datasource?.hasOwnProperty(
              'verbose_map',
            )
              ? (explore?.datasource as Dataset)?.verbose_map
              : (explore?.datasource?.columns ?? {});
            const { colnames, coltypes } =
              chart?.queriesResponse?.[0] ?? {};
            const numericColumns =
              Array.isArray(colnames) && Array.isArray(coltypes)
                ? colnames
                    .filter(
                      (_: string, index: number) =>
                        coltypes[index] === GenericDataType.Numeric,
                    )
                    .map((colname: string | number) => ({
                      value: colname,
                      label:
                        (Array.isArray(verboseMap)
                          ? verboseMap[colname as number]
                          : verboseMap[colname as string]) ?? colname,
                      dataType:
                        colnames && coltypes[colnames?.indexOf(colname)],
                    }))
                : [];
            return {
              columnOptions: numericColumns,
              verboseMap,
            };
          },
        },
      },
    ],
  ],
};

// =============================================================================
// EXPORT CONTROL PANEL CONFIG
// =============================================================================

export default {
  controlPanelSections: [
    querySectionConfig,
    displaySectionConfig,
    formattingSectionConfig,
    comparisonSectionConfig,
    sparklineSectionConfig,
    progressBarSectionConfig,
    colorsSectionConfig,
  ],
  controlOverrides: {
    y_axis_format: {
      label: t('Number format'),
    },
  },
  formDataOverrides: (formData: any) => ({
    ...formData,
    metric: getStandardizedControls().shiftMetric(),
  }),
} as ControlPanelConfig;
