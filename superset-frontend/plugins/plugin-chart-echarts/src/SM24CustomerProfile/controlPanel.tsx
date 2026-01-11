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
import { SM24CustomerProfileFormData } from './types';

// =============================================================================
// OPTIONS
// =============================================================================

const TAB_OPTIONS = [
  { label: t('Overview'), value: 'overview' },
  { label: t('Products & Usage'), value: 'products' },
  { label: t('Revenue History'), value: 'revenue' },
  { label: t('Health & Risk'), value: 'health' },
  { label: t('Activity Timeline'), value: 'activity' },
  { label: t('Contacts'), value: 'contacts' },
  { label: t('Documents'), value: 'documents' },
];

const LOCALE_OPTIONS = [
  { label: t('English (US)'), value: 'en-US' },
  { label: t('Russian'), value: 'ru-RU' },
  { label: t('Uzbek'), value: 'uz-UZ' },
];

// =============================================================================
// COLUMN MAPPING CONTROLS - CUSTOMER INFO
// =============================================================================

const customerIdColumn: CustomControlItem = {
  name: 'customer_id_column',
  config: {
    ...sharedControls.entity,
    label: t('Customer ID Column'),
    description: t('Column containing customer identifier'),
  },
};

const customerNameColumn: CustomControlItem = {
  name: 'customer_name_column',
  config: {
    ...sharedControls.entity,
    label: t('Customer Name Column'),
    description: t('Column containing customer name'),
  },
};

const industryColumn: CustomControlItem = {
  name: 'industry_column',
  config: {
    ...sharedControls.entity,
    label: t('Industry Column'),
    description: t('Column containing industry/vertical'),
  },
};

const regionColumn: CustomControlItem = {
  name: 'region_column',
  config: {
    ...sharedControls.entity,
    label: t('Region Column'),
    description: t('Column containing region'),
  },
};

// =============================================================================
// COLUMN MAPPING CONTROLS - CSM
// =============================================================================

const csmNameColumn: CustomControlItem = {
  name: 'csm_name_column',
  config: {
    ...sharedControls.entity,
    label: t('CSM Name Column'),
    description: t('Column containing CSM name'),
  },
};

const csmEmailColumn: CustomControlItem = {
  name: 'csm_email_column',
  config: {
    ...sharedControls.entity,
    label: t('CSM Email Column'),
    description: t('Column containing CSM email'),
  },
};

// =============================================================================
// COLUMN MAPPING CONTROLS - METRICS
// =============================================================================

const currentArrColumn: CustomControlItem = {
  name: 'current_arr_column',
  config: {
    ...sharedControls.metric,
    label: t('Current ARR'),
    description: t('Metric for current annual recurring revenue'),
  },
};

const arrGrowthColumn: CustomControlItem = {
  name: 'arr_growth_column',
  config: {
    ...sharedControls.metric,
    label: t('ARR Growth %'),
    description: t('Metric for ARR growth percentage'),
  },
};

const healthScoreColumn: CustomControlItem = {
  name: 'health_score_column',
  config: {
    ...sharedControls.metric,
    label: t('Health Score'),
    description: t('Metric for customer health score (0-100)'),
  },
};

const churnRiskScoreColumn: CustomControlItem = {
  name: 'churn_risk_score_column',
  config: {
    ...sharedControls.metric,
    label: t('Churn Risk Score'),
    description: t('Metric for churn risk score (0-100)'),
  },
};

const npsScoreColumn: CustomControlItem = {
  name: 'nps_score_column',
  config: {
    ...sharedControls.metric,
    label: t('NPS Score'),
    description: t('Metric for Net Promoter Score'),
  },
};

const renewalDateColumn: CustomControlItem = {
  name: 'renewal_date_column',
  config: {
    ...sharedControls.entity,
    label: t('Renewal Date Column'),
    description: t('Column containing renewal date'),
  },
};

const activeProductsColumn: CustomControlItem = {
  name: 'active_products_column',
  config: {
    ...sharedControls.entity,
    label: t('Active Products Column'),
    description: t('Column containing active products (comma-separated)'),
  },
};

// =============================================================================
// DISPLAY CONTROLS
// =============================================================================

const defaultTab: CustomControlItem = {
  name: 'default_tab',
  config: {
    type: 'SelectControl',
    label: t('Default Tab'),
    renderTrigger: true,
    clearable: false,
    default: 'overview',
    options: TAB_OPTIONS,
    description: t('Tab to show by default when profile opens'),
  },
};

const showAlerts: CustomControlItem = {
  name: 'show_alerts',
  config: {
    type: 'CheckboxControl',
    label: t('Show Alert Banners'),
    renderTrigger: true,
    default: true,
    description: t('Show alert banners for critical situations'),
  },
};

const showQuickActions: CustomControlItem = {
  name: 'show_quick_actions',
  config: {
    type: 'CheckboxControl',
    label: t('Show Quick Actions'),
    renderTrigger: true,
    default: true,
    description: t('Show quick action buttons in header'),
  },
};

const showWatchlistToggle: CustomControlItem = {
  name: 'show_watchlist_toggle',
  config: {
    type: 'CheckboxControl',
    label: t('Show Watchlist Toggle'),
    renderTrigger: true,
    default: true,
    description: t('Show button to add/remove from watchlist'),
  },
};

const showExportButton: CustomControlItem = {
  name: 'show_export_button',
  config: {
    type: 'CheckboxControl',
    label: t('Show Export Button'),
    renderTrigger: true,
    default: true,
    description: t('Show button to export profile'),
  },
};

// =============================================================================
// THRESHOLD CONTROLS
// =============================================================================

const healthCriticalThreshold: CustomControlItem = {
  name: 'health_critical_threshold',
  config: {
    type: 'SliderControl',
    label: t('Health Critical Threshold'),
    renderTrigger: true,
    min: 0,
    max: 100,
    step: 5,
    default: 50,
    description: t('Health score below this is critical'),
  },
};

const healthAtRiskThreshold: CustomControlItem = {
  name: 'health_at_risk_threshold',
  config: {
    type: 'SliderControl',
    label: t('Health At-Risk Threshold'),
    renderTrigger: true,
    min: 0,
    max: 100,
    step: 5,
    default: 70,
    description: t('Health score below this is at-risk'),
  },
};

const renewalUrgentDays: CustomControlItem = {
  name: 'renewal_urgent_days',
  config: {
    type: 'SliderControl',
    label: t('Renewal Urgent Days'),
    renderTrigger: true,
    min: 7,
    max: 90,
    step: 7,
    default: 30,
    description: t('Days before renewal to show urgent alert'),
  },
};

const inactivityAlertDays: CustomControlItem = {
  name: 'inactivity_alert_days',
  config: {
    type: 'SliderControl',
    label: t('Inactivity Alert Days'),
    renderTrigger: true,
    min: 14,
    max: 120,
    step: 7,
    default: 60,
    description: t('Days of inactivity before showing alert'),
  },
};

// =============================================================================
// PERMISSION CONTROLS
// =============================================================================

const showFinancialData: CustomControlItem = {
  name: 'show_financial_data',
  config: {
    type: 'CheckboxControl',
    label: t('Show Financial Data'),
    renderTrigger: true,
    default: true,
    description: t('Show ARR, LTV, payment metrics'),
  },
};

const showSensitiveData: CustomControlItem = {
  name: 'show_sensitive_data',
  config: {
    type: 'CheckboxControl',
    label: t('Show Sensitive Data'),
    renderTrigger: true,
    default: false,
    description: t('Show INN, legal name, and other sensitive info'),
  },
};

const allowEditing: CustomControlItem = {
  name: 'allow_editing',
  config: {
    type: 'CheckboxControl',
    label: t('Allow Editing'),
    renderTrigger: true,
    default: false,
    description: t('Allow users to edit profile data'),
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
    description: t('Locale for number and date formatting'),
  },
};

// =============================================================================
// CONTROL PANEL SECTIONS
// =============================================================================

const customerInfoSection: ControlPanelSectionConfig = {
  label: t('Customer Information'),
  expanded: true,
  controlSetRows: [
    [customerIdColumn],
    [customerNameColumn],
    [industryColumn],
    [regionColumn],
  ],
};

const csmSection: ControlPanelSectionConfig = {
  label: t('CSM Information'),
  expanded: false,
  controlSetRows: [[csmNameColumn], [csmEmailColumn]],
};

const metricsSection: ControlPanelSectionConfig = {
  label: t('Metrics'),
  expanded: true,
  controlSetRows: [
    [currentArrColumn],
    [arrGrowthColumn],
    [healthScoreColumn],
    [churnRiskScoreColumn],
    [npsScoreColumn],
    [renewalDateColumn],
    [activeProductsColumn],
    ['adhoc_filters'],
  ],
};

const displaySection: ControlPanelSectionConfig = {
  label: t('Display Options'),
  expanded: true,
  controlSetRows: [
    [defaultTab],
    [showAlerts, showQuickActions],
    [showWatchlistToggle, showExportButton],
  ],
};

const thresholdsSection: ControlPanelSectionConfig = {
  label: t('Thresholds'),
  expanded: false,
  controlSetRows: [
    [healthCriticalThreshold],
    [healthAtRiskThreshold],
    [renewalUrgentDays],
    [inactivityAlertDays],
  ],
};

const permissionsSection: ControlPanelSectionConfig = {
  label: t('Permissions'),
  expanded: false,
  controlSetRows: [[showFinancialData], [showSensitiveData], [allowEditing]],
};

const interactivitySection: ControlPanelSectionConfig = {
  label: t('Interactivity'),
  expanded: false,
  controlSetRows: [[enableDrilldown]],
};

const formattingSection: ControlPanelSectionConfig = {
  label: t('Formatting'),
  expanded: false,
  controlSetRows: [[locale]],
};

// =============================================================================
// EXPORT CONTROL PANEL CONFIG
// =============================================================================

export default {
  controlPanelSections: [
    customerInfoSection,
    csmSection,
    metricsSection,
    displaySection,
    thresholdsSection,
    permissionsSection,
    interactivitySection,
    formattingSection,
  ],
  controlOverrides: {},
  formDataOverrides: (formData: SM24CustomerProfileFormData) => ({
    ...formData,
  }),
} as ControlPanelConfig;
