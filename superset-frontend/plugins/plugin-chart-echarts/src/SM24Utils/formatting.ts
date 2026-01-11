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

import { CurrencyConfig, SM24ARRLocale, SM24NumberLocale } from './types';
import {
  getScaleLabels,
  getNumberLocale,
  getARRLocale,
  getIntlLocale,
  getCurrencyConfig,
} from './locales';

// =============================================================================
// NUMBER FORMATTING
// =============================================================================

/**
 * Scale unit type
 */
export type ScaleUnit = 'auto' | 'thousands' | 'millions' | 'billions' | 'none';

/**
 * Formatted amount result
 */
export interface FormattedAmount {
  value: string;
  unit: string;
  currency?: string;
}

/**
 * Format count value with K/M/B suffix (locale-aware)
 *
 * @example
 * formatCount(1500, 'en-US') // "1.5K"
 * formatCount(1500, 'ru-RU') // "1,5тыс."
 */
export function formatCount(value: number, locale: string = 'en-US'): string {
  const scaleLabels = getScaleLabels(locale);
  const intlLocale = getIntlLocale(locale);

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString(intlLocale, { maximumFractionDigits: 2 })}${scaleLabels.billions}`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString(intlLocale, { maximumFractionDigits: 1 })}${scaleLabels.millions}`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString(intlLocale, { maximumFractionDigits: 1 })}${scaleLabels.thousands}`;
  }
  return value.toLocaleString(intlLocale);
}

/**
 * Format amount with appropriate scale unit (locale and currency aware)
 *
 * @example
 * formatAmount(1500000, { locale: 'en-US', unit: 'auto' })
 * // { value: '1.5', unit: 'M', currency: undefined }
 */
export function formatAmount(
  value: number,
  options: {
    precision?: number;
    unit?: ScaleUnit;
    locale?: string;
    currency?: CurrencyConfig;
  } = {},
): FormattedAmount | null {
  const { precision = 1, unit = 'auto', locale = 'en-US', currency } = options;

  if (unit === 'none' || value < 1000) {
    const intlLocale = getIntlLocale(locale);
    return {
      value: value.toLocaleString(intlLocale, { maximumFractionDigits: precision }),
      unit: '',
      currency: currency?.symbol,
    };
  }

  const scaleLabels = getScaleLabels(locale);
  const intlLocale = getIntlLocale(locale);
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

  const formattedValue = displayValue.toLocaleString(intlLocale, {
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
 * Format full amount string with currency (locale-aware)
 *
 * @example
 * formatFullAmount(1500000, { locale: 'en-US', currencyCode: 'USD' })
 * // "$1.5M"
 * formatFullAmount(1500000, { locale: 'ru-RU', currencyCode: 'RUB' })
 * // "1,5 млн. ₽"
 */
export function formatFullAmount(
  value: number,
  options: {
    locale?: string;
    currencyCode?: string;
    currency?: CurrencyConfig;
    unit?: ScaleUnit;
  } = {},
): string {
  const {
    locale = 'en-US',
    currencyCode,
    currency: customCurrency,
    unit = 'auto',
  } = options;

  const currency = customCurrency || (currencyCode ? getCurrencyConfig(currencyCode) : undefined);
  const formatted = formatAmount(value, { unit, locale, currency });

  if (!formatted) {
    return value.toLocaleString(getIntlLocale(locale));
  }

  const currencySymbol = currency?.symbol || '';
  const position = currency?.position || 'before';

  if (position === 'before' && currencySymbol) {
    return `${currencySymbol}${formatted.value}${formatted.unit}`;
  }

  return `${formatted.value}${formatted.unit}${currencySymbol ? ` ${currencySymbol}` : ''}`;
}

/**
 * Format ARR value based on magnitude (for charts)
 *
 * @example
 * formatARRValue(1500000, 'en') // "$1.50M"
 * formatARRValue(1500000, 'ru') // "$1,50M"
 */
export function formatARRValue(
  value: number,
  locale: string | SM24ARRLocale = 'en',
): string {
  const localeConfig =
    typeof locale === 'string' ? getARRLocale(locale) : locale;

  const absValue = Math.abs(value);
  let formatted: string;
  let suffix: string = '';

  if (absValue >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(2);
    suffix = 'M';
  } else if (absValue >= 1_000) {
    formatted = (value / 1_000).toFixed(1);
    suffix = 'K';
  } else {
    formatted = value.toFixed(0);
  }

  // Apply locale formatting
  formatted = formatted.replace('.', localeConfig.decimal);

  const sign = value < 0 ? '-' : '';
  const absFormatted = formatted.replace('-', '');

  if (localeConfig.currencyPosition === 'before') {
    return `${sign}${localeConfig.currency}${absFormatted}${suffix}`;
  }
  return `${sign}${absFormatted}${suffix}${localeConfig.currency}`;
}

// =============================================================================
// PERCENTAGE FORMATTING
// =============================================================================

/**
 * Format percentage value
 *
 * @example
 * formatPercent(0.156) // "15.6%"
 * formatPercent(15.6, { isDecimal: false }) // "15.6%"
 */
export function formatPercent(
  value: number | null,
  options: {
    decimals?: number;
    isDecimal?: boolean;
    showSign?: boolean;
  } = {},
): string {
  if (value === null) return '—';

  const { decimals = 1, isDecimal = false, showSign = false } = options;

  const percentValue = isDecimal ? value * 100 : value;
  const sign = showSign && percentValue >= 0 ? '+' : '';

  return `${sign}${percentValue.toFixed(decimals)}%`;
}

/**
 * Format growth percentage with sign
 *
 * @example
 * formatGrowthPercent(5.5) // "+5.5%"
 * formatGrowthPercent(-3.2) // "-3.2%"
 * formatGrowthPercent(null) // "—"
 */
export function formatGrowthPercent(value: number | null): string {
  if (value === null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// =============================================================================
// DATE & TIME FORMATTING
// =============================================================================

/**
 * Format tenure in years and months
 *
 * @example
 * formatTenure(15) // "1y 3mo"
 * formatTenure(6) // "6mo"
 * formatTenure(24) // "2y"
 */
export function formatTenure(
  months: number,
  locale: string = 'en',
): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (locale.startsWith('ru')) {
    if (years === 0) return `${remainingMonths} мес.`;
    if (remainingMonths === 0) return `${years} г.`;
    return `${years} г. ${remainingMonths} мес.`;
  }

  if (years === 0) return `${remainingMonths}mo`;
  if (remainingMonths === 0) return `${years}y`;
  return `${years}y ${remainingMonths}mo`;
}

/**
 * Format days ago
 *
 * @example
 * formatDaysAgo(0) // "Today"
 * formatDaysAgo(1) // "Yesterday"
 * formatDaysAgo(5) // "5d ago"
 * formatDaysAgo(14) // "2w ago"
 */
export function formatDaysAgo(days: number, locale: string = 'en'): string {
  if (locale.startsWith('ru')) {
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
    if (days < 365) return `${Math.floor(days / 30)} мес. назад`;
    return `${Math.floor(days / 365)} г. назад`;
  }

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Calculate days until date
 */
export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days since date
 */
export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// =============================================================================
// NUMBER UTILITIES
// =============================================================================

/**
 * Format number with thousand separators
 */
export function formatNumber(
  value: number,
  options: {
    locale?: string;
    decimals?: number;
  } = {},
): string {
  const { locale = 'en-US', decimals = 0 } = options;
  const intlLocale = getIntlLocale(locale);

  return value.toLocaleString(intlLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Smart format number based on magnitude
 * Automatically selects appropriate format based on value
 */
export function formatSmartNumber(
  value: number,
  locale: SM24NumberLocale | string = 'en',
): string {
  const localeConfig =
    typeof locale === 'string' ? getNumberLocale(locale) : locale;

  const absValue = Math.abs(value);
  let formatted: string;
  let suffix: string = '';

  if (absValue >= 1_000_000_000_000) {
    formatted = (value / 1_000_000_000_000).toFixed(2);
    suffix = localeConfig.shortScale.trillions;
  } else if (absValue >= 1_000_000_000) {
    formatted = (value / 1_000_000_000).toFixed(2);
    suffix = localeConfig.shortScale.billions;
  } else if (absValue >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(1);
    suffix = localeConfig.shortScale.millions;
  } else if (absValue >= 1_000) {
    formatted = (value / 1_000).toFixed(1);
    suffix = localeConfig.shortScale.thousands;
  } else if (absValue >= 1) {
    formatted = value.toFixed(0);
  } else {
    formatted = value.toFixed(2);
  }

  // Apply locale decimal separator
  formatted = formatted.replace('.', localeConfig.decimal);

  return `${formatted}${suffix}`;
}

// =============================================================================
// FORMATTER FACTORY
// =============================================================================

/**
 * Create a currency formatter function
 */
export function createCurrencyFormatter(
  locale: string = 'en-US',
  currencyCode: string = 'USD',
): (value: number) => string {
  return (value: number) =>
    formatFullAmount(value, { locale, currencyCode });
}

/**
 * Create a percent formatter function
 */
export function createPercentFormatter(
  options: { decimals?: number; showSign?: boolean } = {},
): (value: number | null) => string {
  return (value: number | null) => formatPercent(value, options);
}

/**
 * Create a count formatter function
 */
export function createCountFormatter(
  locale: string = 'en-US',
): (value: number) => string {
  return (value: number) => formatCount(value, locale);
}
