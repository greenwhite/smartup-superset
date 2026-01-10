# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""
Smartup24 Custom CSS Overrides
==============================

This module provides additional CSS customizations that extend beyond
what Ant Design tokens can configure. Use this for fine-grained control
over specific Superset components.

Usage:
    Add to your superset_config.py:
    from smartup24_custom_css import EXTRA_CUSTOM_CSS
    CUSTOM_CSS = EXTRA_CUSTOM_CSS
"""

# =============================================================================
# SMARTUP24 CUSTOM CSS
# =============================================================================

EXTRA_CUSTOM_CSS = """
/* ==========================================================================
   SMARTUP24 CUSTOM STYLES
   ========================================================================== */

/* --------------------------------------------------------------------------
   CSS Variables (Design Tokens)
   --------------------------------------------------------------------------
   These variables can be overridden in Ant Design theme or used directly.
   They provide fallback values for custom components.
   -------------------------------------------------------------------------- */

:root {
  /* Brand Colors (from smartup_24_cutguide.pdf) */
  --smartup24-primary: #2ECC71;
  --smartup24-primary-hover: #27AE60;
  --smartup24-primary-active: #229954;
  --smartup24-secondary: #009EE0;
  --smartup24-accent: #2ECC71;
  --smartup24-black: #1A1A1A;

  /* Semantic Colors */
  --smartup24-success: #2ECC71;
  --smartup24-warning: #F5A623;
  --smartup24-error: #E74C3C;
  --smartup24-info: #009EE0;

  /* Neutrals */
  --smartup24-bg-base: #FFFFFF;
  --smartup24-bg-elevated: #F9FAFB;
  --smartup24-bg-container: #FFFFFF;
  --smartup24-border: #E5E7EB;
  --smartup24-text-primary: #111827;
  --smartup24-text-secondary: #6B7280;
  --smartup24-text-disabled: #9CA3AF;

  /* Shadows */
  --smartup24-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --smartup24-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --smartup24-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --smartup24-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Transitions */
  --smartup24-transition-fast: 150ms ease;
  --smartup24-transition-normal: 200ms ease;
  --smartup24-transition-slow: 300ms ease;
}

/* Dark Mode Variables */
[data-theme="dark"],
.ant-theme-dark {
  --smartup24-bg-base: #111827;
  --smartup24-bg-elevated: #1F2937;
  --smartup24-bg-container: #1F2937;
  --smartup24-border: #374151;
  --smartup24-text-primary: #F9FAFB;
  --smartup24-text-secondary: #9CA3AF;
  --smartup24-text-disabled: #6B7280;
}

/* --------------------------------------------------------------------------
   Navigation & Header
   -------------------------------------------------------------------------- */

/* Main Navigation Bar */
.navbar,
.ant-layout-header {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Logo Container */
.navbar-brand,
.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Navigation Links */
.navbar .nav-link,
.ant-menu-item a {
  font-weight: 500;
  transition: color var(--smartup24-transition-fast);
}

/* --------------------------------------------------------------------------
   Dashboard Styles
   -------------------------------------------------------------------------- */

/* Dashboard Container */
.dashboard {
  background-color: var(--smartup24-bg-base);
}

/* Dashboard Header */
.dashboard-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--smartup24-border);
}

/* Dashboard Title */
.dashboard-title,
.header-title {
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Dashboard Grid */
.grid-container {
  padding: 16px;
  gap: 16px;
}

/* --------------------------------------------------------------------------
   Chart Cards
   -------------------------------------------------------------------------- */

/* Chart Container */
.chart-container,
.slice-container {
  background: var(--smartup24-bg-container);
  border-radius: 8px;
  border: 1px solid var(--smartup24-border);
  box-shadow: var(--smartup24-shadow-sm);
  transition: box-shadow var(--smartup24-transition-normal);
  overflow: hidden;
}

.chart-container:hover,
.slice-container:hover {
  box-shadow: var(--smartup24-shadow);
}

/* Chart Header */
.chart-header,
.slice-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--smartup24-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Chart Title */
.chart-header-title,
.slice-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--smartup24-text-primary);
  margin: 0;
}

/* Chart Body */
.chart-body,
.slice-cell {
  padding: 16px;
}

/* --------------------------------------------------------------------------
   Filter Bar
   -------------------------------------------------------------------------- */

/* Native Filter Bar */
.filter-bar,
.nativeFilter {
  background: var(--smartup24-bg-elevated);
  border-right: 1px solid var(--smartup24-border);
}

/* Filter Title */
.filter-bar__title {
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--smartup24-text-secondary);
  margin-bottom: 8px;
}

/* Filter Items */
.filter-bar__item {
  margin-bottom: 16px;
}

/* --------------------------------------------------------------------------
   SQL Lab Styles
   -------------------------------------------------------------------------- */

/* SQL Editor Container */
.SqlLab,
.sql-lab {
  background: var(--smartup24-bg-base);
}

/* Query Editor - higher specificity for Ace editor */
.SqlLab .ace_editor,
.sql-lab .ace_editor,
.SqlLab .sql-editor,
.sql-lab .sql-editor,
.ace_editor.ace-tm,
.ace_editor.ace-github {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}

/* Results Table */
.sql-results-table {
  font-size: 13px;
}

.sql-results-table th {
  font-weight: 600;
  background: var(--smartup24-bg-elevated);
  position: sticky;
  top: 0;
}

/* Schema Browser */
.schema-browser {
  background: var(--smartup24-bg-elevated);
  border-right: 1px solid var(--smartup24-border);
}

/* --------------------------------------------------------------------------
   Explore (Chart Builder) Styles
   -------------------------------------------------------------------------- */

/* Control Panel */
.explore-controls,
.control-panel {
  background: var(--smartup24-bg-container);
  border-right: 1px solid var(--smartup24-border);
}

/* Control Section */
.control-section {
  padding: 16px;
  border-bottom: 1px solid var(--smartup24-border);
}

/* Control Label */
.control-label {
  font-weight: 500;
  font-size: 12px;
  color: var(--smartup24-text-secondary);
  margin-bottom: 6px;
}

/* --------------------------------------------------------------------------
   Tables & Data Grids
   -------------------------------------------------------------------------- */

/* Ant Design Table Overrides */
.ant-table {
  font-size: 13px;
}

/* Using higher specificity instead of !important */
.ant-table-wrapper .ant-table .ant-table-thead > tr > th,
.ant-table-wrapper .ant-table .ant-table-thead > tr > th.ant-table-cell {
  font-weight: 600;
  background: var(--smartup24-bg-elevated);
  border-bottom: 2px solid var(--smartup24-border);
}

.ant-table-wrapper .ant-table .ant-table-tbody > tr:hover > td,
.ant-table-wrapper .ant-table .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell {
  background: var(--smartup24-bg-elevated);
}

/* Striped Rows */
.ant-table-tbody > tr:nth-child(even) > td {
  background: rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .ant-table-tbody > tr:nth-child(even) > td {
  background: rgba(255, 255, 255, 0.02);
}

/* --------------------------------------------------------------------------
   Forms & Inputs
   -------------------------------------------------------------------------- */

/* Input Fields - using higher specificity */
.ant-form .ant-input,
.ant-form .ant-select .ant-select-selector,
.ant-form .ant-picker,
.ant-form-item .ant-input,
.ant-form-item .ant-select .ant-select-selector,
.ant-form-item .ant-picker,
body .ant-input,
body .ant-select .ant-select-selector,
body .ant-picker {
  border-radius: 6px;
}

.ant-form .ant-input:focus,
.ant-form .ant-input.ant-input-focused,
.ant-form .ant-select.ant-select-focused .ant-select-selector,
.ant-form .ant-picker.ant-picker-focused,
body .ant-input:focus,
body .ant-input.ant-input-focused,
body .ant-select.ant-select-focused .ant-select-selector,
body .ant-picker.ant-picker-focused {
  border-color: var(--smartup24-primary);
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.15);
}

/* Labels */
.ant-form-item-label > label {
  font-weight: 500;
}

/* --------------------------------------------------------------------------
   Buttons
   -------------------------------------------------------------------------- */

/* Primary Button */
.ant-btn-primary {
  font-weight: 500;
  box-shadow: none;
}

.ant-btn-primary:hover {
  box-shadow: var(--smartup24-shadow-sm);
}

/* Secondary/Default Button */
.ant-btn-default {
  font-weight: 500;
}

/* Button Groups */
.ant-btn-group .ant-btn {
  border-radius: 0;
}

.ant-btn-group .ant-btn:first-child {
  border-radius: 6px 0 0 6px;
}

.ant-btn-group .ant-btn:last-child {
  border-radius: 0 6px 6px 0;
}

/* --------------------------------------------------------------------------
   Cards & Panels
   -------------------------------------------------------------------------- */

.ant-card {
  border-radius: 8px;
  box-shadow: var(--smartup24-shadow-sm);
}

.ant-card-head {
  border-bottom: 1px solid var(--smartup24-border);
  font-weight: 600;
}

/* --------------------------------------------------------------------------
   Modals & Drawers
   -------------------------------------------------------------------------- */

.ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
}

.ant-modal-header {
  border-bottom: 1px solid var(--smartup24-border);
}

.ant-modal-title {
  font-weight: 600;
}

.ant-drawer-content {
  border-radius: 0;
}

.ant-drawer-header {
  border-bottom: 1px solid var(--smartup24-border);
}

/* --------------------------------------------------------------------------
   Alerts & Notifications
   -------------------------------------------------------------------------- */

.ant-alert {
  border-radius: 8px;
}

.ant-message-notice-content {
  border-radius: 8px;
  box-shadow: var(--smartup24-shadow-lg);
}

.ant-notification-notice {
  border-radius: 8px;
}

/* --------------------------------------------------------------------------
   Tabs
   -------------------------------------------------------------------------- */

.ant-tabs-tab {
  font-weight: 500;
}

.ant-tabs-tab-active {
  font-weight: 600;
}

/* --------------------------------------------------------------------------
   Tags & Badges
   -------------------------------------------------------------------------- */

.ant-tag {
  border-radius: 4px;
  font-weight: 500;
}

.ant-badge-count {
  font-weight: 600;
}

/* --------------------------------------------------------------------------
   Loading States
   -------------------------------------------------------------------------- */

/* Skeleton */
.ant-skeleton-content .ant-skeleton-title,
.ant-skeleton-content .ant-skeleton-paragraph > li {
  border-radius: 4px;
}

/* Spinner/Loading */
.loading-indicator,
.ant-spin-dot {
  color: var(--smartup24-primary);
}

/* --------------------------------------------------------------------------
   Empty States
   -------------------------------------------------------------------------- */

.ant-empty-description {
  color: var(--smartup24-text-secondary);
}

/* --------------------------------------------------------------------------
   Tooltips
   -------------------------------------------------------------------------- */

.ant-tooltip-inner {
  border-radius: 6px;
  font-size: 12px;
}

/* --------------------------------------------------------------------------
   Dropdown Menus
   -------------------------------------------------------------------------- */

.ant-dropdown-menu {
  border-radius: 8px;
  box-shadow: var(--smartup24-shadow-lg);
  padding: 4px;
}

.ant-dropdown-menu-item {
  border-radius: 4px;
  margin: 2px 0;
}

/* --------------------------------------------------------------------------
   Scrollbars (WebKit browsers)
   -------------------------------------------------------------------------- */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--smartup24-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--smartup24-text-disabled);
}

/* --------------------------------------------------------------------------
   Utility Classes
   -------------------------------------------------------------------------- */

/* Text Utilities */
.text-primary { color: var(--smartup24-primary) !important; }
.text-secondary { color: var(--smartup24-text-secondary) !important; }
.text-success { color: var(--smartup24-success) !important; }
.text-warning { color: var(--smartup24-warning) !important; }
.text-error { color: var(--smartup24-error) !important; }

/* Background Utilities */
.bg-primary { background-color: var(--smartup24-primary) !important; }
.bg-elevated { background-color: var(--smartup24-bg-elevated) !important; }

/* Border Utilities */
.border-primary { border-color: var(--smartup24-primary) !important; }

/* --------------------------------------------------------------------------
   Print Styles
   -------------------------------------------------------------------------- */

@media print {
  .navbar,
  .filter-bar,
  .chart-controls,
  .ant-btn {
    display: none !important;
  }

  .dashboard {
    background: white !important;
  }

  .chart-container {
    break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }
}

/* --------------------------------------------------------------------------
   Resizable Sidebar (SQL Lab, Filter Bar)
   -------------------------------------------------------------------------- */

/* Resizable Container */
.resizable-container,
.ResizableSidebar {
  background: var(--smartup24-bg-elevated);
  border-right: 1px solid var(--smartup24-border);
  transition: width var(--smartup24-transition-normal);
}

/* Resize Handle */
.resizable-container .resize-handle,
.ResizableSidebar__resize-handle {
  width: 4px;
  background: transparent;
  cursor: col-resize;
  transition: background var(--smartup24-transition-fast);
}

.resizable-container .resize-handle:hover,
.ResizableSidebar__resize-handle:hover {
  background: var(--smartup24-primary);
}

/* --------------------------------------------------------------------------
   Mobile Navigation
   -------------------------------------------------------------------------- */

/* Mobile Menu Drawer */
.ant-drawer.mobile-nav-drawer .ant-drawer-body {
  padding: 0;
  background: var(--smartup24-bg-container);
}

.mobile-nav-drawer .ant-menu {
  border-right: none;
}

.mobile-nav-drawer .ant-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 0;
  padding: 0 24px;
  border-radius: 0;
}

.mobile-nav-drawer .ant-menu-item:active {
  background: var(--smartup24-bg-elevated);
}

/* Mobile Header */
.navbar-mobile,
.mobile-header {
  display: none;
  height: 56px;
  padding: 0 16px;
  background: var(--smartup24-bg-container);
  border-bottom: 1px solid var(--smartup24-border);
  align-items: center;
  justify-content: space-between;
}

/* Hamburger Menu Button */
.mobile-menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--smartup24-border-radius, 6px);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background var(--smartup24-transition-fast);
}

.mobile-menu-trigger:hover {
  background: var(--smartup24-bg-elevated);
}

/* --------------------------------------------------------------------------
   Filter Bar Mobile Adaptations
   -------------------------------------------------------------------------- */

/* Filter Bar Wrapper */
.filter-bar-wrapper {
  transition: transform var(--smartup24-transition-normal);
}

/* Collapsible Filter Bar */
.filter-bar--collapsed {
  transform: translateX(-100%);
}

/* Filter Bar Toggle Button (Mobile) */
.filter-bar__toggle-mobile {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--smartup24-primary);
  color: white;
  box-shadow: var(--smartup24-shadow-lg);
  border: none;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform var(--smartup24-transition-fast),
              box-shadow var(--smartup24-transition-fast);
}

.filter-bar__toggle-mobile:hover {
  transform: scale(1.05);
  box-shadow: var(--smartup24-shadow-lg), 0 0 0 4px rgba(46, 204, 113, 0.2);
}

.filter-bar__toggle-mobile:active {
  transform: scale(0.95);
}

/* Filter Bar Overlay (Mobile) */
.filter-bar__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--smartup24-transition-normal),
              visibility var(--smartup24-transition-normal);
  z-index: 99;
}

.filter-bar__overlay--visible {
  opacity: 1;
  visibility: visible;
}

/* --------------------------------------------------------------------------
   Responsive Adjustments - Complete Breakpoint System
   -------------------------------------------------------------------------- */

/* Extra Large Screens (1600px+) */
@media (min-width: 1600px) {
  .dashboard-grid {
    max-width: 1920px;
    margin: 0 auto;
  }

  .sql-editor-container {
    max-width: 1400px;
  }
}

/* Large Desktop (1200px - 1599px) */
@media (max-width: 1599px) {
  .dashboard-header {
    padding: 16px 20px;
  }
}

/* Desktop (992px - 1199px) */
@media (max-width: 1199px) {
  /* Reduce sidebar widths */
  .filter-bar,
  .nativeFilter {
    width: 280px;
    min-width: 280px;
  }

  .schema-browser {
    width: 240px;
    min-width: 240px;
  }

  /* Compact control panel */
  .explore-controls,
  .control-panel {
    width: 300px;
  }

  /* Adjust grid spacing */
  .grid-container {
    padding: 12px;
    gap: 12px;
  }
}

/* Tablet Landscape (768px - 991px) */
@media (max-width: 991px) {
  /* Stack layout for Explore view */
  .explore-container {
    flex-direction: column;
  }

  .explore-controls,
  .control-panel {
    width: 100%;
    max-height: 40vh;
    overflow-y: auto;
    border-right: none;
    border-bottom: 1px solid var(--smartup24-border);
  }

  /* Collapsible filter bar */
  .filter-bar,
  .nativeFilter {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform var(--smartup24-transition-normal);
  }

  .filter-bar--open,
  .nativeFilter--open {
    transform: translateX(0);
  }

  /* Show filter toggle button */
  .filter-bar__toggle-mobile {
    display: flex;
  }

  /* SQL Lab adjustments */
  .SqlLab .resizable-container {
    position: fixed;
    left: 0;
    top: 56px;
    bottom: 0;
    width: 280px;
    z-index: 50;
    transform: translateX(-100%);
  }

  .SqlLab .resizable-container--open {
    transform: translateX(0);
  }

  /* Dashboard header compact */
  .dashboard-header {
    padding: 12px 16px;
  }

  .dashboard-title,
  .header-title {
    font-size: 18px;
  }
}

/* Tablet Portrait (576px - 767px) */
@media (max-width: 767px) {
  /* Show mobile navigation */
  .navbar-mobile,
  .mobile-header {
    display: flex;
  }

  /* Hide desktop navigation */
  .navbar-desktop,
  .ant-layout-header .navbar {
    display: none;
  }

  /* Full-width charts */
  .grid-container {
    padding: 8px;
    gap: 8px;
  }

  .chart-container,
  .slice-container {
    border-radius: 6px;
  }

  /* Compact chart headers */
  .chart-header,
  .slice-header {
    padding: 8px 12px;
  }

  .chart-header-title,
  .slice-name {
    font-size: 13px;
  }

  /* Chart body padding */
  .chart-body,
  .slice-cell {
    padding: 12px;
  }

  /* Modal full-screen on tablet */
  .ant-modal {
    max-width: calc(100vw - 32px);
    margin: 16px;
  }

  .ant-modal-content {
    border-radius: 8px;
  }

  /* Drawer adjustments */
  .ant-drawer-content-wrapper {
    max-width: 100vw;
  }

  /* Table horizontal scroll */
  .ant-table-wrapper {
    overflow-x: auto;
  }

  .ant-table {
    min-width: 600px;
  }

  /* SQL Lab mobile layout */
  .SqlLab,
  .sql-lab {
    flex-direction: column;
  }

  .sql-editor {
    min-height: 200px;
  }

  .sql-results-table {
    font-size: 12px;
  }
}

/* Mobile (max 575px) */
@media (max-width: 575px) {
  /* Minimal padding */
  .dashboard-header {
    padding: 8px 12px;
  }

  .dashboard-title,
  .header-title {
    font-size: 16px;
  }

  .grid-container {
    padding: 4px;
    gap: 4px;
  }

  /* Very compact chart cards */
  .chart-header,
  .slice-header {
    padding: 6px 10px;
  }

  .chart-header-title,
  .slice-name {
    font-size: 12px;
  }

  .chart-body,
  .slice-cell {
    padding: 8px;
  }

  /* Full-screen modals on mobile */
  .ant-modal {
    max-width: 100%;
    margin: 0;
    top: 0;
    padding: 0;
  }

  .ant-modal-content {
    border-radius: 0;
    min-height: 100vh;
  }

  .ant-modal-body {
    max-height: calc(100vh - 110px);
    overflow-y: auto;
  }

  /* Touch-friendly controls */
  .ant-btn {
    min-height: 44px;
    min-width: 44px;
  }

  .ant-input,
  .ant-select-selector,
  .ant-picker {
    min-height: 44px;
  }

  /* Larger touch targets for dropdowns */
  .ant-dropdown-menu-item {
    padding: 12px 16px;
    min-height: 44px;
  }

  /* Stack button groups vertically */
  .ant-btn-group {
    display: flex;
    flex-direction: column;
  }

  .ant-btn-group .ant-btn {
    border-radius: 6px;
    margin-bottom: 4px;
  }

  .ant-btn-group .ant-btn:last-child {
    margin-bottom: 0;
  }

  /* Filter bar full-screen */
  .filter-bar,
  .nativeFilter {
    width: 100%;
  }

  /* Tabs scrollable */
  .ant-tabs-nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .ant-tabs-nav::before {
    display: none;
  }

  /* Hide non-essential elements */
  .dashboard-header .secondary-actions,
  .chart-header .chart-actions:not(.essential) {
    display: none;
  }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
  /* Larger touch targets */
  .ant-btn,
  .ant-menu-item,
  .ant-dropdown-menu-item {
    min-height: 44px;
  }

  /* Remove hover effects that don't work on touch */
  .chart-container:hover,
  .slice-container:hover {
    box-shadow: var(--smartup24-shadow-sm);
  }

  /* Disable hover states for better touch experience */
  .ant-btn:hover {
    opacity: 1;
  }
}

/* Landscape Mobile Specific */
@media (max-height: 500px) and (orientation: landscape) {
  .dashboard-header {
    padding: 6px 12px;
  }

  .chart-header {
    padding: 4px 8px;
  }

  /* Reduce modal height */
  .ant-modal-body {
    max-height: 60vh;
  }
}

/* High DPI / Retina Displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  /* Ensure crisp borders */
  .chart-container,
  .slice-container,
  .ant-card {
    border-width: 0.5px;
  }
}

/* ==========================================================================
   END SMARTUP24 CUSTOM STYLES
   ========================================================================== */
"""

# Shorter alias for convenience
CUSTOM_CSS = EXTRA_CUSTOM_CSS
