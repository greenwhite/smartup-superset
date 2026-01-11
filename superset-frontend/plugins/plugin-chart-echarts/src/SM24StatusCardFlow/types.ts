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
import { QueryFormData, ChartProps, t } from '@superset-ui/core';

// =============================================================================
// CURRENCY & LOCALE CONFIGURATION
// =============================================================================

export interface CurrencyConfig {
  code: string;        // ISO 4217 code: 'USD', 'EUR', 'UZS', 'RUB'
  symbol: string;      // Display symbol: '$', '€', 'сум', '₽'
  position: 'before' | 'after';
  decimals: number;
}

export interface ScaleLabels {
  thousands: string;   // 'K' or 'тыс.' or 'тис.'
  millions: string;    // 'M' or 'млн.' or 'млн'
  billions: string;    // 'B' or 'млрд.' or 'млрд'
}

export const DEFAULT_CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  UZS: { code: 'UZS', symbol: 'сум', position: 'after', decimals: 0 },
  USD: { code: 'USD', symbol: '$', position: 'before', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', position: 'before', decimals: 2 },
  RUB: { code: 'RUB', symbol: '₽', position: 'after', decimals: 0 },
};

export const DEFAULT_SCALE_LABELS: Record<string, ScaleLabels> = {
  'ru-RU': { thousands: 'тыс.', millions: 'млн.', billions: 'млрд.' },
  'en-US': { thousands: 'K', millions: 'M', billions: 'B' },
  'uz-UZ': { thousands: 'минг', millions: 'млн', billions: 'млрд' },
};

// =============================================================================
// ENTITY TYPES
// =============================================================================

export type EntityType = 'orders' | 'visits' | 'leads' | 'tasks' | 'custom';

export interface EntityTypeDefinition {
  id: EntityType;
  labelSingular: string;
  labelPlural: string;
  labelGenitive: string;
  icon: string;
  hasAmount: boolean;
}

// Entity labels by locale
export const ENTITY_LABELS: Record<string, Record<EntityType, Omit<EntityTypeDefinition, 'id' | 'hasAmount'>>> = {
  'ru-RU': {
    orders: { labelSingular: 'Заказ', labelPlural: 'Заказы', labelGenitive: 'заказов', icon: '📦' },
    visits: { labelSingular: 'Визит', labelPlural: 'Визиты', labelGenitive: 'визитов', icon: '📍' },
    leads: { labelSingular: 'Лид', labelPlural: 'Лиды', labelGenitive: 'лидов', icon: '🎯' },
    tasks: { labelSingular: 'Задача', labelPlural: 'Задачи', labelGenitive: 'задач', icon: '✅' },
    custom: { labelSingular: 'Элемент', labelPlural: 'Элементы', labelGenitive: 'элементов', icon: '📋' },
  },
  'en-US': {
    orders: { labelSingular: 'Order', labelPlural: 'Orders', labelGenitive: 'orders', icon: '📦' },
    visits: { labelSingular: 'Visit', labelPlural: 'Visits', labelGenitive: 'visits', icon: '📍' },
    leads: { labelSingular: 'Lead', labelPlural: 'Leads', labelGenitive: 'leads', icon: '🎯' },
    tasks: { labelSingular: 'Task', labelPlural: 'Tasks', labelGenitive: 'tasks', icon: '✅' },
    custom: { labelSingular: 'Item', labelPlural: 'Items', labelGenitive: 'items', icon: '📋' },
  },
  'uz-UZ': {
    orders: { labelSingular: 'Buyurtma', labelPlural: 'Buyurtmalar', labelGenitive: 'buyurtmalar', icon: '📦' },
    visits: { labelSingular: 'Tashrif', labelPlural: 'Tashriflar', labelGenitive: 'tashriflar', icon: '📍' },
    leads: { labelSingular: 'Lid', labelPlural: 'Lidlar', labelGenitive: 'lidlar', icon: '🎯' },
    tasks: { labelSingular: 'Vazifa', labelPlural: 'Vazifalar', labelGenitive: 'vazifalar', icon: '✅' },
    custom: { labelSingular: 'Element', labelPlural: 'Elementlar', labelGenitive: 'elementlar', icon: '📋' },
  },
};

export const ENTITY_HAS_AMOUNT: Record<EntityType, boolean> = {
  orders: true,
  visits: false,
  leads: true,
  tasks: false,
  custom: true,
};

export function getEntityTypeDefinition(entityType: EntityType, locale: string = 'ru-RU'): EntityTypeDefinition {
  const labels = ENTITY_LABELS[locale] || ENTITY_LABELS['ru-RU'];
  const entityLabels = labels[entityType] || labels.custom;
  return {
    id: entityType,
    ...entityLabels,
    hasAmount: ENTITY_HAS_AMOUNT[entityType],
  };
}

// =============================================================================
// STATUS DATA
// =============================================================================

export interface StatusDefinition {
  statusId: string | number;
  statusName: string;
  statusOrder: number;
  statusColor: string;
  isFinal?: boolean;
  isCancelled?: boolean;
  description?: string;
  sla?: number; // hours
}

export interface StatusData extends StatusDefinition {
  entityCount: number;
  totalAmount: number;
  percentageOfTotal: number;
}

// =============================================================================
// DEFAULT STATUS COLORS
// =============================================================================

export const DEFAULT_STATUS_COLORS = {
  first: '#27AE60',       // Green for first status
  intermediate: '#3498DB', // Blue for intermediate
  penultimate: '#F39C12',  // Orange for penultimate
  lastActive: '#16A085',   // Teal for last active
  completed: '#95A5A6',    // Gray for completed
  cancelled: '#E74C3C',    // Red for cancelled
  archived: '#2C3E50',     // Dark gray for archived
};

// Fallback colors array for dynamic status assignment
export const FALLBACK_COLORS = [
  '#27AE60', // Green
  '#F39C12', // Orange
  '#9B59B6', // Purple
  '#16A085', // Teal
  '#3498DB', // Blue
  '#95A5A6', // Gray
];

// =============================================================================
// FORM DATA
// =============================================================================

export interface SM24StatusCardFlowFormData extends QueryFormData {
  // Entity type
  entityType?: EntityType;

  // Column mappings
  statusIdColumn?: string;
  statusNameColumn?: string;
  statusOrderColumn?: string;
  statusColorColumn?: string;
  entityCountMetric?: string;
  totalAmountMetric?: string;

  // Display options
  showAmounts?: boolean;
  showPercentages?: boolean;
  showArrows?: boolean;
  cardLayout?: 'horizontal' | 'responsive';
  maxCardsPerRow?: number;

  // Amount formatting
  amountPrecision?: number;
  amountUnit?: 'auto' | 'thousands' | 'millions' | 'billions';

  // Currency configuration (new)
  currencyCode?: string;        // 'UZS', 'USD', 'EUR', 'RUB'
  currencySymbol?: string;      // Override symbol if needed
  currencyPosition?: 'before' | 'after';

  // Interactivity
  enableDrilldown?: boolean;
  enableEntityTypeSwitch?: boolean;

  // Styling
  cardBorderRadius?: number;
  showStatusBadge?: boolean;

  // Localization
  locale?: string;              // 'ru-RU', 'en-US', 'uz-UZ'

  // Refresh
  autoRefreshInterval?: number; // minutes, 0 = disabled
}

// =============================================================================
// CHART PROPS
// =============================================================================

export interface SM24StatusCardFlowChartProps extends ChartProps {
  formData: SM24StatusCardFlowFormData;
}

export interface SM24StatusCardFlowVizProps {
  className?: string;
  width: number;
  height: number;

  // Data
  statuses: StatusData[];
  entityType: EntityType;
  entityTypeDef: EntityTypeDefinition;
  totalEntities: number;
  totalAmount: number;

  // Display options
  showAmounts: boolean;
  showPercentages: boolean;
  showArrows: boolean;
  maxCardsPerRow: number;

  // Formatting
  formatCount: (value: number) => string;
  formatAmount: (value: number) => string;
  formatPercent: (value: number) => string;

  // Interactivity
  enableDrilldown: boolean;
  enableEntityTypeSwitch: boolean;
  onDrilldown?: (statusId: string | number, statusName: string) => void;
  onEntityTypeChange?: (entityType: EntityType) => void;
  onRefresh?: () => void;

  // Refs
  refs?: {
    containerRef?: { current: unknown };
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format count with K/M suffix (locale-aware)
 */
export function formatCountValue(value: number, locale: string = 'ru-RU'): string {
  const scaleLabels = DEFAULT_SCALE_LABELS[locale] || DEFAULT_SCALE_LABELS['ru-RU'];

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}${scaleLabels.millions}`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}${scaleLabels.thousands}`;
  }
  return value.toLocaleString(locale);
}

/**
 * Format amount with appropriate unit (locale and currency aware)
 */
export function formatAmountValue(
  value: number,
  precision: number = 1,
  unit: 'auto' | 'thousands' | 'millions' | 'billions' = 'auto',
  locale: string = 'ru-RU',
  currency?: CurrencyConfig,
): { value: string; unit: string; currency?: string } | null {
  if (value < 1000) {
    return null; // Don't show small amounts
  }

  const scaleLabels = DEFAULT_SCALE_LABELS[locale] || DEFAULT_SCALE_LABELS['ru-RU'];
  let displayValue: number;
  let displayUnit: string;
  let effectivePrecision = precision;

  if (unit === 'auto') {
    if (value >= 1_000_000_000) {
      displayValue = value / 1_000_000_000;
      displayUnit = scaleLabels.billions;
      effectivePrecision = 2;
    } else if (value >= 1_000_000) {
      displayValue = value / 1_000_000;
      displayUnit = scaleLabels.millions;
    } else {
      displayValue = value / 1_000;
      displayUnit = scaleLabels.thousands;
      effectivePrecision = 0;
    }
  } else {
    switch (unit) {
      case 'billions':
        displayValue = value / 1_000_000_000;
        displayUnit = scaleLabels.billions;
        break;
      case 'millions':
        displayValue = value / 1_000_000;
        displayUnit = scaleLabels.millions;
        break;
      case 'thousands':
      default:
        displayValue = value / 1_000;
        displayUnit = scaleLabels.thousands;
        break;
    }
  }

  // Format with specified locale
  const formattedValue = displayValue.toLocaleString(locale, {
    minimumFractionDigits: effectivePrecision,
    maximumFractionDigits: effectivePrecision,
  });

  return {
    value: formattedValue,
    unit: displayUnit,
    currency: currency?.symbol,
  };
}

/**
 * Format full amount with currency (locale-aware)
 */
export function formatFullAmount(
  value: number,
  locale: string = 'ru-RU',
  currency?: CurrencyConfig,
  unit: 'auto' | 'thousands' | 'millions' | 'billions' = 'auto',
): string {
  const formatted = formatAmountValue(value, 1, unit, locale, currency);
  if (!formatted) {
    return value.toLocaleString(locale);
  }

  const currencySymbol = currency?.symbol || '';
  const position = currency?.position || 'after';

  if (position === 'before' && currencySymbol) {
    return `${currencySymbol}${formatted.value} ${formatted.unit}`;
  }

  return `${formatted.value} ${formatted.unit}${currencySymbol ? ` ${currencySymbol}` : ''}`;
}

/**
 * Format percentage
 */
export function formatPercentValue(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get status color based on position and type
 */
export function getStatusColor(
  status: StatusDefinition,
  index: number,
  total: number,
): string {
  // If color is defined in status, use it
  if (status.statusColor && status.statusColor.startsWith('#')) {
    return status.statusColor;
  }

  // Fallback based on position and type
  if (status.isCancelled) {
    return DEFAULT_STATUS_COLORS.cancelled;
  }

  if (status.isFinal) {
    return DEFAULT_STATUS_COLORS.archived;
  }

  if (index === 0) {
    return DEFAULT_STATUS_COLORS.first;
  }

  if (index === total - 1) {
    return DEFAULT_STATUS_COLORS.lastActive;
  }

  if (index === total - 2) {
    return DEFAULT_STATUS_COLORS.penultimate;
  }

  // Use fallback colors for intermediate statuses
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

/**
 * Get tinted background color from status color
 */
export function getTintedBackground(color: string, opacity: number = 0.03): string {
  // Convert hex to RGB and create rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get entity type label (genitive form for counts, locale-aware)
 */
export function getEntityLabel(entityType: EntityType, count: number, locale: string = 'ru-RU'): string {
  const def = getEntityTypeDefinition(entityType, locale);
  return def.labelGenitive;
}

/**
 * Calculate total from statuses
 */
export function calculateTotals(statuses: StatusData[]): {
  totalEntities: number;
  totalAmount: number;
} {
  return statuses.reduce(
    (acc, status) => ({
      totalEntities: acc.totalEntities + status.entityCount,
      totalAmount: acc.totalAmount + status.totalAmount,
    }),
    { totalEntities: 0, totalAmount: 0 },
  );
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_FORM_DATA: Partial<SM24StatusCardFlowFormData> = {
  entityType: 'orders',
  showAmounts: true,
  showPercentages: true,
  showArrows: true,
  cardLayout: 'horizontal',
  maxCardsPerRow: 8,
  amountPrecision: 1,
  amountUnit: 'auto',
  currencyCode: 'UZS',
  currencyPosition: 'after',
  enableDrilldown: true,
  enableEntityTypeSwitch: true,
  cardBorderRadius: 12,
  showStatusBadge: true,
  locale: 'ru-RU',
  autoRefreshInterval: 5,
};

// =============================================================================
// SAMPLE STATUS DEFINITIONS (for development/demo)
// =============================================================================

export const SAMPLE_ORDER_STATUSES: StatusDefinition[] = [
  { statusId: 1, statusName: 'Новый', statusOrder: 1, statusColor: '#27AE60' },
  { statusId: 2, statusName: 'В обработке', statusOrder: 2, statusColor: '#F39C12' },
  { statusId: 3, statusName: 'В ожидании', statusOrder: 3, statusColor: '#9B59B6' },
  { statusId: 4, statusName: 'Отгружен', statusOrder: 4, statusColor: '#16A085' },
  { statusId: 5, statusName: 'Доставлен', statusOrder: 5, statusColor: '#3498DB' },
  { statusId: 6, statusName: 'Архив', statusOrder: 6, statusColor: '#2C3E50', isFinal: true },
];

export const SAMPLE_VISIT_STATUSES: StatusDefinition[] = [
  { statusId: 1, statusName: 'Запланирован', statusOrder: 1, statusColor: '#3498DB' },
  { statusId: 2, statusName: 'В пути', statusOrder: 2, statusColor: '#F39C12' },
  { statusId: 3, statusName: 'На месте', statusOrder: 3, statusColor: '#9B59B6' },
  { statusId: 4, statusName: 'Завершён', statusOrder: 4, statusColor: '#27AE60', isFinal: true },
  { statusId: 5, statusName: 'Отменён', statusOrder: 5, statusColor: '#E74C3C', isCancelled: true },
];

export const SAMPLE_LEAD_STATUSES: StatusDefinition[] = [
  { statusId: 1, statusName: 'Новый', statusOrder: 1, statusColor: '#27AE60' },
  { statusId: 2, statusName: 'Контакт', statusOrder: 2, statusColor: '#3498DB' },
  { statusId: 3, statusName: 'Квалификация', statusOrder: 3, statusColor: '#F39C12' },
  { statusId: 4, statusName: 'Предложение', statusOrder: 4, statusColor: '#9B59B6' },
  { statusId: 5, statusName: 'Переговоры', statusOrder: 5, statusColor: '#16A085' },
  { statusId: 6, statusName: 'Выиграно', statusOrder: 6, statusColor: '#27AE60', isFinal: true },
  { statusId: 7, statusName: 'Проиграно', statusOrder: 7, statusColor: '#E74C3C', isCancelled: true },
];

export const SAMPLE_TASK_STATUSES: StatusDefinition[] = [
  { statusId: 1, statusName: 'Новая', statusOrder: 1, statusColor: '#3498DB' },
  { statusId: 2, statusName: 'В работе', statusOrder: 2, statusColor: '#F39C12' },
  { statusId: 3, statusName: 'На проверке', statusOrder: 3, statusColor: '#9B59B6' },
  { statusId: 4, statusName: 'Выполнена', statusOrder: 4, statusColor: '#27AE60', isFinal: true },
];
