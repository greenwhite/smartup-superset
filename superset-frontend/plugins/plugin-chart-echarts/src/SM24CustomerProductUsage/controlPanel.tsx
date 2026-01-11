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
  CustomControlItem,
  ControlPanelSectionConfig,
  sharedControls,
} from '@superset-ui/chart-controls';
import { SM24CustomerProductUsageFormData } from './types';

// =============================================================================
// OPTIONS
// =============================================================================

const TIME_RANGE_OPTIONS = [
  { label: t('7 Days'), value: '7d' },
  { label: t('30 Days'), value: '30d' },
  { label: t('90 Days'), value: '90d' },
  { label: t('1 Year'), value: '1y' },
];

const CHART_TYPE_OPTIONS = [
  { label: t('Line'), value: 'line' },
  { label: t('Bar'), value: 'bar' },
  { label: t('Area'), value: 'area' },
];

const LOCALE_OPTIONS = [
  { label: t('English (US)'), value: 'en-US' },
  { label: t('Russian'), value: 'ru-RU' },
  { label: t('Uzbek'), value: 'uz-UZ' },
];

// =============================================================================
// COLUMN MAPPING CONTROLS - PRODUCT
// =============================================================================

const productLineColumn: CustomControlItem = {
  name: 'product_line_column',
  config: {
    ...sharedControls.entity,
    label: t('Product Line Column'),
    description: t('Column containing product line identifier'),
  },
};

const productNameColumn: CustomControlItem = {
  name: 'product_name_column',
  config: {
    ...sharedControls.entity,
    label: t('Product Name Column'),
    description: t('Column containing product display name'),
  },
};

const isActiveColumn: CustomControlItem = {
  name: 'is_active_column',
  config: {
    ...sharedControls.entity,
    label: t('Is Active Column'),
    description: t('Column indicating if product subscription is active'),
  },
};

const licensedUsersColumn: CustomControlItem = {
  name: 'licensed_users_column',
  config: {
    ...sharedControls.metric,
    label: t('Licensed Users'),
    description: t('Metric for number of licensed users'),
  },
};

// =============================================================================
// COLUMN MAPPING CONTROLS - USAGE METRICS
// =============================================================================

const activeUsers30dColumn: CustomControlItem = {
  name: 'active_users_30d_column',
  config: {
    ...sharedControls.metric,
    label: t('Active Users (30d)'),
    description: t('Metric for active users in last 30 days'),
  },
};

const activeUsers7dColumn: CustomControlItem = {
  name: 'active_users_7d_column',
  config: {
    ...sharedControls.metric,
    label: t('Active Users (7d)'),
    description: t('Metric for active users in last 7 days'),
  },
};

const featureAdoptionColumn: CustomControlItem = {
  name: 'feature_adoption_column',
  config: {
    ...sharedControls.metric,
    label: t('Feature Adoption Score'),
    description: t('Metric for feature adoption percentage (0-100)'),
  },
};

const arrContributionColumn: CustomControlItem = {
  name: 'arr_contribution_column',
  config: {
    ...sharedControls.metric,
    label: t('ARR Contribution'),
    description: t('Metric for ARR contribution from this product'),
  },
};

// =============================================================================
// DISPLAY CONTROLS
// =============================================================================

const defaultTimeRange: CustomControlItem = {
  name: 'default_time_range',
  config: {
    type: 'SelectControl',
    label: t('Default Time Range'),
    renderTrigger: true,
    clearable: false,
    default: '90d',
    options: TIME_RANGE_OPTIONS,
    description: t('Default time range for usage trends'),
  },
};

const defaultChartType: CustomControlItem = {
  name: 'default_chart_type',
  config: {
    type: 'SelectControl',
    label: t('Default Chart Type'),
    renderTrigger: true,
    clearable: false,
    default: 'line',
    options: CHART_TYPE_OPTIONS,
    description: t('Default chart type for trends'),
  },
};

const showInactiveProducts: CustomControlItem = {
  name: 'show_inactive_products',
  config: {
    type: 'CheckboxControl',
    label: t('Show Inactive Products'),
    renderTrigger: true,
    default: false,
    description: t('Include inactive/churned products in the view'),
  },
};

const showFeatureBreakdown: CustomControlItem = {
  name: 'show_feature_breakdown',
  config: {
    type: 'CheckboxControl',
    label: t('Show Feature Breakdown'),
    renderTrigger: true,
    default: true,
    description: t('Show feature usage in expandable rows'),
  },
};

const enableExpandableRows: CustomControlItem = {
  name: 'enable_expandable_rows',
  config: {
    type: 'CheckboxControl',
    label: t('Expandable Rows'),
    renderTrigger: true,
    default: true,
    description: t('Allow expanding product rows to see feature details'),
  },
};

const maxFeaturesShown: CustomControlItem = {
  name: 'max_features_shown',
  config: {
    type: 'SliderControl',
    label: t('Max Features Shown'),
    renderTrigger: true,
    min: 5,
    max: 50,
    step: 5,
    default: 20,
    description: t('Maximum number of features to show per product'),
  },
};

// =============================================================================
// THRESHOLD CONTROLS
// =============================================================================

const lowAdoptionThreshold: CustomControlItem = {
  name: 'low_adoption_threshold',
  config: {
    type: 'SliderControl',
    label: t('Low Adoption Threshold %'),
    renderTrigger: true,
    min: 10,
    max: 60,
    step: 5,
    default: 40,
    description: t('Below this = orange highlight'),
  },
};

const highAdoptionThreshold: CustomControlItem = {
  name: 'high_adoption_threshold',
  config: {
    type: 'SliderControl',
    label: t('High Adoption Threshold %'),
    renderTrigger: true,
    min: 50,
    max: 100,
    step: 5,
    default: 80,
    description: t('Above this = green checkmark'),
  },
};

const underutilizationThreshold: CustomControlItem = {
  name: 'underutilization_threshold',
  config: {
    type: 'SliderControl',
    label: t('Underutilization Threshold %'),
    renderTrigger: true,
    min: 10,
    max: 50,
    step: 5,
    default: 30,
    description: t('Active users below this % of licensed = warning'),
  },
};

// =============================================================================
// CHART CONTROLS
// =============================================================================

const showDauLine: CustomControlItem = {
  name: 'show_dau_line',
  config: {
    type: 'CheckboxControl',
    label: t('Show DAU Line'),
    renderTrigger: true,
    default: true,
    description: t('Show Daily Active Users line in chart'),
  },
};

const showSessionsBars: CustomControlItem = {
  name: 'show_sessions_bars',
  config: {
    type: 'CheckboxControl',
    label: t('Show Sessions Bars'),
    renderTrigger: true,
    default: true,
    description: t('Show sessions as bars in chart'),
  },
};

const showAnnotations: CustomControlItem = {
  name: 'show_annotations',
  config: {
    type: 'CheckboxControl',
    label: t('Show Annotations'),
    renderTrigger: true,
    default: true,
    description: t('Show subscription dates and anomalies'),
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
    description: t('Enable click-through to feature/user details'),
  },
};

const enableExport: CustomControlItem = {
  name: 'enable_export',
  config: {
    type: 'CheckboxControl',
    label: t('Enable Export'),
    renderTrigger: true,
    default: true,
    description: t('Allow exporting usage data'),
  },
};

// =============================================================================
// FORMATTING CONTROLS
// =============================================================================

const locale: CustomControlItem = {
  name: 'locale',
  config: {
    type: 'SelectControl',
    label: t('Locale'),
    renderTrigger: true,
    clearable: false,
    default: 'en-US',
    options: LOCALE_OPTIONS,
    description: t('Locale for number formatting'),
  },
};

// =============================================================================
// CONTROL PANEL SECTIONS
// =============================================================================

const productMappingSection: ControlPanelSectionConfig = {
  label: t('Product Columns'),
  expanded: true,
  controlSetRows: [
    [productLineColumn],
    [productNameColumn],
    [isActiveColumn],
    [licensedUsersColumn],
  ],
};

const usageMetricsSection: ControlPanelSectionConfig = {
  label: t('Usage Metrics'),
  expanded: true,
  controlSetRows: [
    [activeUsers30dColumn],
    [activeUsers7dColumn],
    [featureAdoptionColumn],
    [arrContributionColumn],
    ['adhoc_filters'],
  ],
};

const displaySection: ControlPanelSectionConfig = {
  label: t('Display Options'),
  expanded: true,
  controlSetRows: [
    [defaultTimeRange, defaultChartType],
    [showInactiveProducts, showFeatureBreakdown],
    [enableExpandableRows],
    [maxFeaturesShown],
  ],
};

const thresholdsSection: ControlPanelSectionConfig = {
  label: t('Thresholds'),
  expanded: false,
  controlSetRows: [
    [lowAdoptionThreshold],
    [highAdoptionThreshold],
    [underutilizationThreshold],
  ],
};

const chartSection: ControlPanelSectionConfig = {
  label: t('Chart Options'),
  expanded: false,
  controlSetRows: [
    [showDauLine, showSessionsBars],
    [showAnnotations],
  ],
};

const interactivitySection: ControlPanelSectionConfig = {
  label: t('Interactivity'),
  expanded: false,
  controlSetRows: [
    [enableDrilldown, enableExport],
  ],
};

const formattingSection: ControlPanelSectionConfig = {
  label: t('Formatting'),
  expanded: false,
  controlSetRows: [
    [locale],
  ],
};

// =============================================================================
// EXPORT CONTROL PANEL CONFIG
// =============================================================================

export default {
  controlPanelSections: [
    productMappingSection,
    usageMetricsSection,
    displaySection,
    thresholdsSection,
    chartSection,
    interactivitySection,
    formattingSection,
  ],
  controlOverrides: {},
  formDataOverrides: (formData: SM24CustomerProductUsageFormData) => ({
    ...formData,
  }),
} as ControlPanelConfig;
