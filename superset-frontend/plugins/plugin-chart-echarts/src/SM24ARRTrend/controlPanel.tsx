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
  getStandardizedControls,
  CustomControlItem,
  ControlPanelSectionConfig,
  sharedControls,
} from '@superset-ui/chart-controls';
import { ARR_COLORS, SM24ARRTrendFormData } from './types';

// =============================================================================
// OPTIONS
// =============================================================================

const LEGEND_POSITION_OPTIONS = [
  { label: t('Top'), value: 'top' },
  { label: t('Bottom'), value: 'bottom' },
  { label: t('Left'), value: 'left' },
  { label: t('Right'), value: 'right' },
];

const LOCALE_OPTIONS = [
  { label: t('English (1,234.56)'), value: 'en' },
  { label: t('Russian (1 234,56)'), value: 'ru' },
  { label: t('Uzbek (1 234,56)'), value: 'uz' },
];

const ROLLING_MONTHS_OPTIONS = [
  { label: t('6 months'), value: 6 },
  { label: t('12 months'), value: 12 },
  { label: t('18 months'), value: 18 },
  { label: t('24 months'), value: 24 },
];

// =============================================================================
// METRIC CONTROLS
// =============================================================================

const metricTotalARR: CustomControlItem = {
  name: 'metric_total_arr',
  config: {
    ...sharedControls.metric,
    label: t('Total ARR Metric'),
    description: t('Metric for total Annual Recurring Revenue'),
  },
};

const metricNewBusiness: CustomControlItem = {
  name: 'metric_new_business',
  config: {
    ...sharedControls.metric,
    label: t('New Business ARR'),
    description: t('Metric for new customer ARR'),
  },
};

const metricExpansion: CustomControlItem = {
  name: 'metric_expansion',
  config: {
    ...sharedControls.metric,
    label: t('Expansion ARR'),
    description: t('Metric for expansion/upsell ARR'),
  },
};

const metricContraction: CustomControlItem = {
  name: 'metric_contraction',
  config: {
    ...sharedControls.metric,
    label: t('Contraction ARR'),
    description: t('Metric for contraction/downsell ARR'),
  },
};

const metricChurned: CustomControlItem = {
  name: 'metric_churned',
  config: {
    ...sharedControls.metric,
    label: t('Churned ARR'),
    description: t('Metric for churned customer ARR'),
  },
};

// =============================================================================
// TIME CONTROLS
// =============================================================================

const rollingMonths: CustomControlItem = {
  name: 'rolling_months',
  config: {
    type: 'SelectControl',
    label: t('Rolling Months'),
    renderTrigger: true,
    clearable: false,
    default: 12,
    options: ROLLING_MONTHS_OPTIONS,
    description: t('Number of months to display'),
  },
};

// =============================================================================
// DISPLAY CONTROLS
// =============================================================================

const showLine: CustomControlItem = {
  name: 'show_line',
  config: {
    type: 'CheckboxControl',
    label: t('Show Total ARR Line'),
    renderTrigger: true,
    default: true,
    description: t('Display the total ARR as a line chart'),
  },
};

const showBars: CustomControlItem = {
  name: 'show_bars',
  config: {
    type: 'CheckboxControl',
    label: t('Show ARR Components'),
    renderTrigger: true,
    default: true,
    description: t('Display stacked bars for ARR components'),
  },
};

const showGrowthRate: CustomControlItem = {
  name: 'show_growth_rate',
  config: {
    type: 'CheckboxControl',
    label: t('Show Growth Rate'),
    renderTrigger: true,
    default: true,
    description: t('Display MoM growth rate on secondary axis'),
  },
};

const showTargetLine: CustomControlItem = {
  name: 'show_target_line',
  config: {
    type: 'CheckboxControl',
    label: t('Show Target Line'),
    renderTrigger: true,
    default: true,
    description: t('Display target ARR reference line'),
  },
};

const showProjection: CustomControlItem = {
  name: 'show_projection',
  config: {
    type: 'CheckboxControl',
    label: t('Show Projection'),
    renderTrigger: true,
    default: false,
    description: t('Display projected ARR based on current growth'),
  },
};

const showAnnotations: CustomControlItem = {
  name: 'show_annotations',
  config: {
    type: 'CheckboxControl',
    label: t('Show Annotations'),
    renderTrigger: true,
    default: true,
    description: t('Display event annotations on chart'),
  },
};

// =============================================================================
// TARGET CONTROLS
// =============================================================================

const currentARR: CustomControlItem = {
  name: 'current_arr',
  config: {
    type: 'TextControl',
    label: t('Current ARR'),
    renderTrigger: true,
    default: '3000000',
    description: t('Current ARR value in dollars (e.g., 3000000 for $3M)'),
  },
};

const targetARR: CustomControlItem = {
  name: 'target_arr',
  config: {
    type: 'TextControl',
    label: t('Target ARR'),
    renderTrigger: true,
    default: '5000000',
    description: t('Target ARR value in dollars (e.g., 5000000 for $5M)'),
  },
};

const annualGrowthTarget: CustomControlItem = {
  name: 'annual_growth_target',
  config: {
    type: 'SliderControl',
    label: t('Annual Growth Target %'),
    renderTrigger: true,
    min: 0,
    max: 100,
    step: 5,
    default: 30,
    description: t('Target annual growth rate percentage'),
  },
};

// =============================================================================
// THRESHOLD CONTROLS
// =============================================================================

const criticalGrowthThreshold: CustomControlItem = {
  name: 'critical_growth_threshold',
  config: {
    type: 'SliderControl',
    label: t('Critical Threshold %'),
    renderTrigger: true,
    min: -20,
    max: 10,
    step: 1,
    default: 0,
    description: t('Below this = red (negative growth alert)'),
  },
};

const warningGrowthThreshold: CustomControlItem = {
  name: 'warning_growth_threshold',
  config: {
    type: 'SliderControl',
    label: t('Warning Threshold %'),
    renderTrigger: true,
    min: 0,
    max: 10,
    step: 0.5,
    default: 2,
    description: t('Below this = yellow (below target)'),
  },
};

// =============================================================================
// COLOR CONTROLS
// =============================================================================

const colorTotalARR: CustomControlItem = {
  name: 'color_total_arr',
  config: {
    type: 'ColorPickerControl',
    label: t('Total ARR Color'),
    renderTrigger: true,
    default: { r: 46, g: 134, b: 222, a: 1 }, // #2E86DE
    description: t('Color for total ARR line'),
  },
};

const colorNewBusiness: CustomControlItem = {
  name: 'color_new_business',
  config: {
    type: 'ColorPickerControl',
    label: t('New Business Color'),
    renderTrigger: true,
    default: { r: 39, g: 174, b: 96, a: 1 }, // #27AE60
    description: t('Color for new business bars'),
  },
};

const colorExpansion: CustomControlItem = {
  name: 'color_expansion',
  config: {
    type: 'ColorPickerControl',
    label: t('Expansion Color'),
    renderTrigger: true,
    default: { r: 168, g: 230, b: 207, a: 1 }, // #A8E6CF
    description: t('Color for expansion bars'),
  },
};

const colorContraction: CustomControlItem = {
  name: 'color_contraction',
  config: {
    type: 'ColorPickerControl',
    label: t('Contraction Color'),
    renderTrigger: true,
    default: { r: 243, g: 156, b: 18, a: 1 }, // #F39C12
    description: t('Color for contraction bars'),
  },
};

const colorChurned: CustomControlItem = {
  name: 'color_churned',
  config: {
    type: 'ColorPickerControl',
    label: t('Churned Color'),
    renderTrigger: true,
    default: { r: 231, g: 76, b: 60, a: 1 }, // #E74C3C
    description: t('Color for churned bars'),
  },
};

// =============================================================================
// FORMATTING CONTROLS
// =============================================================================

const numberLocale: CustomControlItem = {
  name: 'number_locale',
  config: {
    type: 'SelectControl',
    label: t('Number Locale'),
    renderTrigger: true,
    clearable: false,
    default: 'en',
    options: LOCALE_OPTIONS,
    description: t('Locale for number formatting'),
  },
};

// =============================================================================
// LEGEND CONTROLS
// =============================================================================

const legendPosition: CustomControlItem = {
  name: 'legend_position',
  config: {
    type: 'SelectControl',
    label: t('Legend Position'),
    renderTrigger: true,
    clearable: false,
    default: 'bottom',
    options: LEGEND_POSITION_OPTIONS,
    description: t('Position of the chart legend'),
  },
};

const showLegendCheckboxes: CustomControlItem = {
  name: 'show_legend_checkboxes',
  config: {
    type: 'CheckboxControl',
    label: t('Legend Checkboxes'),
    renderTrigger: true,
    default: true,
    description: t('Show checkboxes to toggle series visibility'),
  },
};

// =============================================================================
// AXIS LABELS
// =============================================================================

const yAxisLeftLabel: CustomControlItem = {
  name: 'y_axis_left_label',
  config: {
    type: 'TextControl',
    label: t('Left Y-Axis Label'),
    renderTrigger: true,
    default: 'ARR ($)',
    description: t('Label for the left Y-axis (ARR values)'),
  },
};

const yAxisRightLabel: CustomControlItem = {
  name: 'y_axis_right_label',
  config: {
    type: 'TextControl',
    label: t('Right Y-Axis Label'),
    renderTrigger: true,
    default: 'Growth (%)',
    description: t('Label for the right Y-axis (growth rate)'),
  },
};

// =============================================================================
// INTERACTIVITY CONTROLS
// =============================================================================

const enableDrilldown: CustomControlItem = {
  name: 'enable_drilldown',
  config: {
    type: 'CheckboxControl',
    label: t('Enable Drilldown'),
    renderTrigger: true,
    default: true,
    description: t('Enable click-through to detailed views'),
  },
};

const enableYoYComparison: CustomControlItem = {
  name: 'enable_yoy_comparison',
  config: {
    type: 'CheckboxControl',
    label: t('Enable YoY Comparison'),
    renderTrigger: true,
    default: false,
    description: t('Show year-over-year comparison overlay'),
  },
};

// =============================================================================
// CONTROL PANEL SECTIONS
// =============================================================================

const querySectionConfig: ControlPanelSectionConfig = {
  label: t('Query'),
  expanded: true,
  controlSetRows: [
    [metricTotalARR],
    [metricNewBusiness],
    [metricExpansion],
    [metricContraction],
    [metricChurned],
    ['adhoc_filters'],
    [rollingMonths],
  ],
};

const displaySectionConfig: ControlPanelSectionConfig = {
  label: t('Display'),
  expanded: true,
  controlSetRows: [
    [showLine, showBars],
    [showGrowthRate],
    [showTargetLine, showProjection],
    [showAnnotations],
  ],
};

const targetSectionConfig: ControlPanelSectionConfig = {
  label: t('Targets & Goals'),
  expanded: false,
  controlSetRows: [[currentARR], [targetARR], [annualGrowthTarget]],
};

const thresholdSectionConfig: ControlPanelSectionConfig = {
  label: t('Growth Thresholds'),
  expanded: false,
  controlSetRows: [[criticalGrowthThreshold], [warningGrowthThreshold]],
};

const colorsSectionConfig: ControlPanelSectionConfig = {
  label: t('Colors'),
  expanded: false,
  controlSetRows: [
    [colorTotalARR],
    [colorNewBusiness],
    [colorExpansion],
    [colorContraction],
    [colorChurned],
  ],
};

const formattingSectionConfig: ControlPanelSectionConfig = {
  label: t('Formatting'),
  expanded: false,
  controlSetRows: [[numberLocale], [yAxisLeftLabel], [yAxisRightLabel]],
};

const legendSectionConfig: ControlPanelSectionConfig = {
  label: t('Legend'),
  expanded: false,
  controlSetRows: [[legendPosition], [showLegendCheckboxes]],
};

const interactivitySectionConfig: ControlPanelSectionConfig = {
  label: t('Interactivity'),
  expanded: false,
  controlSetRows: [[enableDrilldown], [enableYoYComparison]],
};

// =============================================================================
// EXPORT CONTROL PANEL CONFIG
// =============================================================================

export default {
  controlPanelSections: [
    querySectionConfig,
    displaySectionConfig,
    targetSectionConfig,
    thresholdSectionConfig,
    colorsSectionConfig,
    formattingSectionConfig,
    legendSectionConfig,
    interactivitySectionConfig,
  ],
  controlOverrides: {},
  formDataOverrides: (formData: SM24ARRTrendFormData) => ({
    ...formData,
  }),
} as ControlPanelConfig;
