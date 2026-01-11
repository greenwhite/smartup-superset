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

import {
  CurrencyConfig,
  ScaleLabels,
  SM24NumberLocale,
  SM24ARRLocale,
  SM24LocaleCode,
  TimeComparisonPeriod,
} from './types';

// =============================================================================
// CURRENCY CONFIGURATIONS
// =============================================================================

/**
 * Default currency configurations for common currencies
 */
export const DEFAULT_CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  UZS: { code: 'UZS', symbol: 'сум', position: 'after', decimals: 0 },
  USD: { code: 'USD', symbol: '$', position: 'before', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', position: 'before', decimals: 2 },
  RUB: { code: 'RUB', symbol: '₽', position: 'after', decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', position: 'before', decimals: 2 },
  CNY: { code: 'CNY', symbol: '¥', position: 'before', decimals: 2 },
  KZT: { code: 'KZT', symbol: '₸', position: 'after', decimals: 0 },
};

/**
 * Get currency config by code with fallback
 */
export function getCurrencyConfig(code: string): CurrencyConfig {
  return DEFAULT_CURRENCY_CONFIGS[code] || DEFAULT_CURRENCY_CONFIGS.USD;
}

// =============================================================================
// SCALE LABELS (K, M, B suffixes)
// =============================================================================

/**
 * Scale labels by locale for number abbreviations
 */
export const DEFAULT_SCALE_LABELS: Record<string, ScaleLabels> = {
  'ru-RU': { thousands: 'тыс.', millions: 'млн.', billions: 'млрд.' },
  ru: { thousands: 'тыс.', millions: 'млн.', billions: 'млрд.' },
  'en-US': { thousands: 'K', millions: 'M', billions: 'B' },
  en: { thousands: 'K', millions: 'M', billions: 'B' },
  'uz-UZ': { thousands: 'минг', millions: 'млн', billions: 'млрд' },
  uz: { thousands: 'минг', millions: 'млн', billions: 'млрд' },
};

/**
 * Get scale labels by locale with fallback
 */
export function getScaleLabels(locale: string): ScaleLabels {
  return DEFAULT_SCALE_LABELS[locale] || DEFAULT_SCALE_LABELS.en;
}

// =============================================================================
// FULL NUMBER LOCALES
// =============================================================================

/**
 * Full locale configurations for number formatting
 */
export const SM24_NUMBER_LOCALES: Record<string, SM24NumberLocale> = {
  en: {
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', ''],
    shortScale: {
      thousands: 'K',
      millions: 'M',
      billions: 'B',
      trillions: 'T',
    },
  },
  'en-US': {
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', ''],
    shortScale: {
      thousands: 'K',
      millions: 'M',
      billions: 'B',
      trillions: 'T',
    },
  },
  ru: {
    decimal: ',',
    thousands: ' ',
    grouping: [3],
    currency: ['', ' ₽'],
    shortScale: {
      thousands: 'тыс.',
      millions: 'млн.',
      billions: 'млрд.',
      trillions: 'трлн.',
    },
  },
  'ru-RU': {
    decimal: ',',
    thousands: ' ',
    grouping: [3],
    currency: ['', ' ₽'],
    shortScale: {
      thousands: 'тыс.',
      millions: 'млн.',
      billions: 'млрд.',
      trillions: 'трлн.',
    },
  },
  uz: {
    decimal: ',',
    thousands: ' ',
    grouping: [3],
    currency: ['', ' сўм'],
    shortScale: {
      thousands: 'минг',
      millions: 'млн.',
      billions: 'млрд.',
      trillions: 'трлн.',
    },
  },
  'uz-UZ': {
    decimal: ',',
    thousands: ' ',
    grouping: [3],
    currency: ['', ' сўм'],
    shortScale: {
      thousands: 'минг',
      millions: 'млн.',
      billions: 'млрд.',
      trillions: 'трлн.',
    },
  },
};

/**
 * Get number locale by code with fallback
 */
export function getNumberLocale(locale: SM24LocaleCode | string): SM24NumberLocale {
  return SM24_NUMBER_LOCALES[locale] || SM24_NUMBER_LOCALES.en;
}

// =============================================================================
// ARR LOCALES (Simplified)
// =============================================================================

/**
 * Simplified locale configuration for ARR formatting
 */
export const SM24_ARR_LOCALES: Record<string, SM24ARRLocale> = {
  en: {
    decimal: '.',
    thousands: ',',
    currency: '$',
    currencyPosition: 'before',
  },
  'en-US': {
    decimal: '.',
    thousands: ',',
    currency: '$',
    currencyPosition: 'before',
  },
  ru: {
    decimal: ',',
    thousands: ' ',
    currency: '$',
    currencyPosition: 'before',
  },
  'ru-RU': {
    decimal: ',',
    thousands: ' ',
    currency: '$',
    currencyPosition: 'before',
  },
  uz: {
    decimal: ',',
    thousands: ' ',
    currency: '$',
    currencyPosition: 'before',
  },
  'uz-UZ': {
    decimal: ',',
    thousands: ' ',
    currency: '$',
    currencyPosition: 'before',
  },
};

/**
 * Get ARR locale by code with fallback
 */
export function getARRLocale(locale: SM24LocaleCode | string): SM24ARRLocale {
  return SM24_ARR_LOCALES[locale] || SM24_ARR_LOCALES.en;
}

// =============================================================================
// TIME COMPARISON LABELS
// =============================================================================

/**
 * Time comparison shift values mapping
 */
export const TIME_COMPARISON_SHIFTS: Record<TimeComparisonPeriod, string> = {
  DoD: '1 day ago',
  WoW: '1 week ago',
  MoM: '1 month ago',
  QoQ: '3 months ago',
  YoY: '1 year ago',
  custom: 'custom',
  none: '',
};

/**
 * Time comparison display labels (English)
 */
export const TIME_COMPARISON_LABELS: Record<TimeComparisonPeriod, string> = {
  DoD: 'vs Yesterday',
  WoW: 'vs Last Week',
  MoM: 'vs Last Month',
  QoQ: 'vs Last Quarter',
  YoY: 'vs Last Year',
  custom: 'vs Custom Period',
  none: '',
};

/**
 * Time comparison labels by locale
 */
export const TIME_COMPARISON_LABELS_LOCALIZED: Record<
  string,
  Record<TimeComparisonPeriod, string>
> = {
  en: TIME_COMPARISON_LABELS,
  'en-US': TIME_COMPARISON_LABELS,
  ru: {
    DoD: 'vs вчера',
    WoW: 'vs прошлая неделя',
    MoM: 'vs прошлый месяц',
    QoQ: 'vs прошлый квартал',
    YoY: 'vs прошлый год',
    custom: 'vs выбранный период',
    none: '',
  },
  'ru-RU': {
    DoD: 'vs вчера',
    WoW: 'vs прошлая неделя',
    MoM: 'vs прошлый месяц',
    QoQ: 'vs прошлый квартал',
    YoY: 'vs прошлый год',
    custom: 'vs выбранный период',
    none: '',
  },
  uz: {
    DoD: 'vs kecha',
    WoW: 'vs o\'tgan hafta',
    MoM: 'vs o\'tgan oy',
    QoQ: 'vs o\'tgan chorak',
    YoY: 'vs o\'tgan yil',
    custom: 'vs tanlangan davr',
    none: '',
  },
  'uz-UZ': {
    DoD: 'vs kecha',
    WoW: 'vs o\'tgan hafta',
    MoM: 'vs o\'tgan oy',
    QoQ: 'vs o\'tgan chorak',
    YoY: 'vs o\'tgan yil',
    custom: 'vs tanlangan davr',
    none: '',
  },
};

/**
 * Get time comparison label for locale
 */
export function getTimeComparisonLabel(
  period: TimeComparisonPeriod,
  locale: string = 'en',
): string {
  const labels =
    TIME_COMPARISON_LABELS_LOCALIZED[locale] ||
    TIME_COMPARISON_LABELS_LOCALIZED.en;
  return labels[period] || '';
}

// =============================================================================
// LOCALE UTILITIES
// =============================================================================

/**
 * Normalize locale code (e.g., 'en-US' -> 'en')
 */
export function normalizeLocale(locale: string): string {
  const parts = locale.split('-');
  return parts[0].toLowerCase();
}

/**
 * Get Intl locale string
 */
export function getIntlLocale(locale: string): string {
  const mapping: Record<string, string> = {
    en: 'en-US',
    ru: 'ru-RU',
    uz: 'uz-UZ',
  };
  return mapping[normalizeLocale(locale)] || locale;
}
