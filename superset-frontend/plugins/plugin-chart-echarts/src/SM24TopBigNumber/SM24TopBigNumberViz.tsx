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
import { useMemo } from 'react';
import { styled, useTheme } from '@apache-superset/core/ui';
import {
  SM24TopBigNumberVizProps,
  MetricCardData,
  getTrendColor,
} from './types';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface MetricCardProps {
  card: MetricCardData;
  showMetricName: boolean;
  showComparison: boolean;
  showSparkline: boolean;
  comparisonColorScheme: 'green_up' | 'red_up';
  sparklineHeight: number;
  headerColor?: string;
  valueColor?: string;
  formatValue: (value: number) => string;
}

function MetricCard({
  card,
  showMetricName,
  showComparison,
  showSparkline,
  comparisonColorScheme,
  sparklineHeight,
  headerColor,
  valueColor,
  formatValue,
}: MetricCardProps) {
  const theme = useTheme();

  const trendColor = useMemo(() => {
    return getTrendColor(card.trend, comparisonColorScheme, {
      success: theme.colors.success.base,
      error: theme.colors.error.base,
      neutral: theme.colors.text.label,
    });
  }, [card.trend, comparisonColorScheme, theme]);

  const trendIcon = card.trend === 'up' ? '↗' : card.trend === 'down' ? '↘' : '→';

  const formatPercent = (val: number | null) => {
    if (val === null) return '-';
    return `${Math.abs(val * 100).toFixed(2)}%`;
  };

  // Generate SVG sparkline path
  const generateSparklinePath = (data: number[], width: number, height: number): string => {
    if (!data || data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const sparklinePath = useMemo(() => {
    if (!card.sparklineData || card.sparklineData.length < 2) {
      // Generate mock data for demo
      const mockData = Array.from({ length: 7 }, () => Math.random() * 100);
      return generateSparklinePath(mockData, 100, sparklineHeight);
    }
    return generateSparklinePath(card.sparklineData, 100, sparklineHeight);
  }, [card.sparklineData, sparklineHeight]);

  return (
    <div className="sm24-topbignumber__card">
      {showMetricName && (
        <div
          className="sm24-topbignumber__card-label"
          style={{ color: headerColor }}
        >
          {card.label}
        </div>
      )}

      <div className="sm24-topbignumber__card-value-row">
        <div
          className="sm24-topbignumber__card-value"
          style={{ color: valueColor }}
        >
          {card.formattedValue}
        </div>

        {showComparison && card.percentChange !== null && (
          <div
            className="sm24-topbignumber__card-change"
            style={{ color: trendColor }}
          >
            <span className="sm24-topbignumber__card-trend-icon">{trendIcon}</span>
            <span className="sm24-topbignumber__card-percent">{formatPercent(card.percentChange)}</span>
          </div>
        )}
      </div>

      {showSparkline && (
        <div
          className="sm24-topbignumber__card-sparkline"
          style={{ height: `${sparklineHeight}px` }}
        >
          <svg
            width="100%"
            height={sparklineHeight}
            viewBox={`0 0 100 ${sparklineHeight}`}
            preserveAspectRatio="none"
          >
            <path
              d={sparklinePath}
              fill="none"
              stroke={trendColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function SM24TopBigNumberViz({
  className = '',
  width,
  height,
  metricCards,
  layout,
  columnsCount,
  cardMinWidth,
  cardMaxWidth,
  cardGap,
  showMetricName,
  showSparkline,
  showComparison,
  cardBorderRadius,
  cardPadding,
  cardShadow,
  headerColor,
  valueColor,
  cardBackground,
  comparisonColorScheme,
  sparklineConfig,
  formatValue,
}: SM24TopBigNumberVizProps) {
  // Calculate grid columns based on width and settings
  const gridColumns = useMemo(() => {
    if (columnsCount > 0) return columnsCount;
    if (layout === 'horizontal') return metricCards.length;

    // Auto calculate based on available width
    const availableWidth = width - cardGap;
    const minColumns = Math.floor(availableWidth / (cardMaxWidth + cardGap));
    const maxColumns = Math.floor(availableWidth / (cardMinWidth + cardGap));

    return Math.min(Math.max(minColumns, 1), Math.min(maxColumns, metricCards.length));
  }, [width, columnsCount, layout, metricCards.length, cardMinWidth, cardMaxWidth, cardGap]);

  return (
    <div
      className={`sm24-topbignumber ${className}`}
      style={{
        width,
        height,
        '--card-gap': `${cardGap}px`,
        '--card-radius': `${cardBorderRadius}px`,
        '--card-padding': `${cardPadding}px`,
        '--grid-columns': gridColumns,
        '--card-bg': cardBackground,
      } as React.CSSProperties}
    >
      <div className={`sm24-topbignumber__grid ${cardShadow ? 'sm24-topbignumber__grid--shadow' : ''}`}>
        {metricCards.map(card => (
          <MetricCard
            key={card.id}
            card={card}
            showMetricName={showMetricName}
            showComparison={showComparison}
            showSparkline={showSparkline}
            comparisonColorScheme={comparisonColorScheme}
            sparklineHeight={sparklineConfig.height}
            headerColor={headerColor}
            valueColor={valueColor}
            formatValue={formatValue}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// STYLED COMPONENT
// =============================================================================

const StyledSM24TopBigNumberViz = styled(SM24TopBigNumberViz)`
  ${({ theme }) => `
    font-family: ${theme.fontFamily};
    position: relative;
    overflow: hidden;
    padding: ${theme.gridUnit * 2}px;

    .sm24-topbignumber__grid {
      display: grid;
      grid-template-columns: repeat(var(--grid-columns), 1fr);
      gap: var(--card-gap);
      width: 100%;
      height: 100%;
    }

    .sm24-topbignumber__card {
      background: var(--card-bg, ${theme.colors.grayscale.light5});
      border-radius: var(--card-radius);
      padding: var(--card-padding);
      display: flex;
      flex-direction: column;
      gap: ${theme.gridUnit}px;
      border: 1px solid ${theme.colors.grayscale.light3};
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      min-width: 0;
    }

    .sm24-topbignumber__grid--shadow .sm24-topbignumber__card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .sm24-topbignumber__card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .sm24-topbignumber__card-label {
      font-size: ${theme.typography.sizes.s}px;
      font-weight: ${theme.typography.weights.normal};
      color: ${theme.colors.text.label};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .sm24-topbignumber__card-value-row {
      display: flex;
      align-items: baseline;
      gap: ${theme.gridUnit * 2}px;
      flex-wrap: wrap;
    }

    .sm24-topbignumber__card-value {
      font-size: ${theme.typography.sizes.xxl}px;
      font-weight: ${theme.typography.weights.bold};
      color: ${theme.colors.text.label};
      line-height: 1;
      white-space: nowrap;
    }

    .sm24-topbignumber__card-change {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: ${theme.typography.sizes.m}px;
      font-weight: ${theme.typography.weights.medium};
      white-space: nowrap;
    }

    .sm24-topbignumber__card-trend-icon {
      font-size: 1.1em;
    }

    .sm24-topbignumber__card-percent {
      font-weight: ${theme.typography.weights.medium};
    }

    .sm24-topbignumber__card-sparkline {
      width: 100%;
      margin-top: auto;
      opacity: 0.8;
    }

    .sm24-topbignumber__card-sparkline svg {
      display: block;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .sm24-topbignumber__grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .sm24-topbignumber__card-value {
        font-size: ${theme.typography.sizes.xl}px;
      }
    }

    @media (max-width: 480px) {
      .sm24-topbignumber__grid {
        grid-template-columns: 1fr;
      }
    }
  `}
`;

export default StyledSM24TopBigNumberViz;
