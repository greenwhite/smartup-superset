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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled, useTheme } from '@superset-ui/core';
import { init } from 'echarts';
import type { ECharts, EChartsOption, SeriesOption } from 'echarts';
import {
  SM24MonthlyARRBreakdownVizProps,
  CustomerSegment,
  STATUS_COLORS,
  getGrowthIndicator,
} from './types';

// =============================================================================
// SEGMENT ORDER FOR CONSISTENT STACKING
// =============================================================================

const SEGMENT_ORDER: CustomerSegment[] = [
  'enterprise',
  'mid_market',
  'smb',
  'starter',
];
const SEGMENT_NAMES: Record<CustomerSegment, string> = {
  enterprise: 'Enterprise',
  mid_market: 'Mid-Market',
  smb: 'SMB',
  starter: 'Starter',
};

// =============================================================================
// ECHARTS VISUALIZATION COMPONENT
// =============================================================================

function SM24MonthlyARRBreakdownViz({
  className = '',
  width,
  height,
  products,
  segments,
  totalARR,
  totalCustomers,
  concentrationRisks,
  crossSellOpportunity,
  showAsPercentage,
  showCustomerCounts,
  showGrowthIndicators,
  showConcentrationAlerts,
  showCrossSellOpportunity,
  segmentColors,
  formatCurrency,
  formatPercent,
  formatNumber,
  showLegend,
  legendPosition,
  enableDrilldown,
  enableToggle,
  onDrilldown,
  onToggleView,
  refs,
}: SM24MonthlyARRBreakdownVizProps) {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const [isPercentageView, setIsPercentageView] = useState(showAsPercentage);

  // Toggle view handler
  const handleToggleView = useCallback(() => {
    setIsPercentageView(prev => !prev);
    if (onToggleView) {
      onToggleView();
    }
  }, [onToggleView]);

  // Get product names for y-axis
  const productNames = useMemo(
    () => products.map(p => p.productLine),
    [products],
  );

  // Build series data for horizontal stacked bar
  const buildSeries = useCallback((): SeriesOption[] => {
    return SEGMENT_ORDER.map(segment => {
      const segmentData = products.map(product => {
        const segmentInfo = product.segments.find(s => s.segment === segment);
        if (!segmentInfo) return 0;

        if (isPercentageView) {
          return segmentInfo.percentOfProduct;
        }
        return segmentInfo.arrAmount;
      });

      return {
        name: SEGMENT_NAMES[segment],
        type: 'bar',
        stack: 'arr',
        data: segmentData,
        itemStyle: {
          color: segmentColors[segment],
          borderRadius: [0, 4, 4, 0],
        },
        barMaxWidth: 40,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: theme.colors.grayscale.light2,
          },
        },
        label: {
          show: segmentData.some(v => {
            const threshold = isPercentageView ? 10 : totalARR * 0.05;
            return v > threshold;
          }),
          position: 'inside',
          formatter: (params: { value: number }) => {
            if (isPercentageView) {
              return params.value > 10 ? `${params.value.toFixed(0)}%` : '';
            }
            return params.value > totalARR * 0.05
              ? formatCurrency(params.value)
              : '';
          },
          color: theme.colors.grayscale.light5,
          fontSize: 11,
          fontWeight: 'bold',
        },
      };
    });
  }, [
    products,
    segmentColors,
    isPercentageView,
    totalARR,
    formatCurrency,
    theme,
  ]);

  // Build chart option
  const chartOption = useMemo((): EChartsOption => {
    const series = buildSeries();

    // Calculate max value for x-axis
    const maxValue = isPercentageView
      ? 100
      : Math.max(...products.map(p => p.totalARR)) * 1.1;

    // Legend configuration
    const legendData = SEGMENT_ORDER.map(segment => ({
      name: SEGMENT_NAMES[segment],
      icon: 'roundRect',
    }));

    const legendConfig = {
      show: showLegend,
      data: legendData,
      ...(legendPosition === 'bottom' && {
        bottom: 10,
        left: 'center',
        orient: 'horizontal' as const,
      }),
      ...(legendPosition === 'top' && {
        top: 10,
        left: 'center',
        orient: 'horizontal' as const,
      }),
      ...(legendPosition === 'left' && {
        left: 10,
        top: 'middle',
        orient: 'vertical' as const,
      }),
      ...(legendPosition === 'right' && {
        right: 10,
        top: 'middle',
        orient: 'vertical' as const,
      }),
      textStyle: {
        fontSize: 12,
      },
      itemGap: 16,
    };

    // Build graphic elements for alerts and indicators
    const graphicElements: object[] = [];

    // Toggle button
    if (enableToggle) {
      graphicElements.push({
        type: 'group',
        right: legendPosition === 'right' ? 120 : 20,
        top: 10,
        onclick: handleToggleView,
        children: [
          {
            type: 'rect',
            shape: { width: 80, height: 24, r: 4 },
            style: {
              fill: theme.colors.grayscale.light4,
              stroke: theme.colors.grayscale.light2,
              cursor: 'pointer',
            },
          },
          {
            type: 'text',
            style: {
              text: isPercentageView ? '$ View' : '% View',
              x: 40,
              y: 12,
              textAlign: 'center',
              textVerticalAlign: 'middle',
              fill: theme.colors.grayscale.dark2,
              fontSize: 11,
              cursor: 'pointer',
            },
          },
        ],
      });
    }

    // Concentration risk alerts
    if (showConcentrationAlerts && concentrationRisks.length > 0) {
      const alertY = enableToggle ? 45 : 10;
      concentrationRisks.forEach((risk, index) => {
        const alertColor =
          risk.level === 'critical'
            ? STATUS_COLORS.critical
            : STATUS_COLORS.warning;
        graphicElements.push({
          type: 'text',
          right: legendPosition === 'right' ? 120 : 20,
          top: alertY + index * 18,
          style: {
            text: `⚠️ ${risk.message}`,
            fill: alertColor,
            fontSize: 10,
            fontWeight: risk.level === 'critical' ? 'bold' : 'normal',
          },
        });
      });
    }

    // Cross-sell opportunity badge
    if (showCrossSellOpportunity && crossSellOpportunity) {
      const badgeY = enableToggle ? 45 : 10;
      const alertOffset = showConcentrationAlerts
        ? concentrationRisks.length * 18 + 10
        : 0;

      graphicElements.push({
        type: 'group',
        left: 20,
        top: badgeY + alertOffset,
        children: [
          {
            type: 'rect',
            shape: { width: 180, height: 50, r: 6 },
            style: {
              fill: theme.colors.success.light2,
              stroke: theme.colors.success.base,
            },
          },
          {
            type: 'text',
            style: {
              text: 'Cross-Sell Opportunity',
              x: 10,
              y: 14,
              fill: theme.colors.success.base,
              fontSize: 10,
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            style: {
              text: `${crossSellOpportunity.percentSingleProduct}% single-product`,
              x: 10,
              y: 30,
              fill: theme.colors.grayscale.dark2,
              fontSize: 11,
            },
          },
          {
            type: 'text',
            style: {
              text: `Potential: ${formatCurrency(crossSellOpportunity.potentialARR)}`,
              x: 10,
              y: 44,
              fill: theme.colors.success.base,
              fontSize: 11,
              fontWeight: 'bold',
            },
          },
        ],
      });
    }

    // Growth indicators on y-axis labels
    const yAxisLabels = products.map(product => {
      let label = product.productLine;

      if (showGrowthIndicators && product.momGrowth !== null) {
        const indicator = getGrowthIndicator(product.momGrowth);
        label = `${label} ${indicator.icon}`;
      }

      if (showCustomerCounts) {
        label = `${label}\n(${formatNumber(product.totalCustomers)} customers)`;
      }

      return label;
    });

    return {
      animation: true,
      animationDuration: 500,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (
          params: {
            seriesName: string;
            value: number;
            dataIndex: number;
            color: string;
          }[],
        ) => {
          if (!Array.isArray(params) || params.length === 0) return '';

          const { dataIndex } = params[0];
          const product = products[dataIndex];

          if (!product) return '';

          let html = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${product.productLine}</div>`;
          html += `<div style="margin-bottom: 8px;">
            <span>Total ARR:</span>
            <span style="font-weight: bold; float: right;">${formatCurrency(product.totalARR)}</span>
          </div>`;
          html += `<div style="margin-bottom: 8px;">
            <span>% of Total:</span>
            <span style="float: right;">${formatPercent(product.percentOfTotal)}</span>
          </div>`;

          html += `<hr style="margin: 8px 0; border: none; border-top: 1px solid ${theme.colors.grayscale.light3};" />`;
          html += `<div style="font-size: 11px; color: ${theme.colors.grayscale.base}; margin-bottom: 4px;">Segment Breakdown:</div>`;

          params.forEach(param => {
            const segment = product.segments.find(
              s => SEGMENT_NAMES[s.segment] === param.seriesName,
            );
            if (segment) {
              html += `<div style="display: flex; justify-content: space-between; gap: 16px; margin: 4px 0;">
                <span>
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 2px; margin-right: 6px;"></span>
                  ${param.seriesName}
                </span>
                <span style="font-weight: bold;">
                  ${formatCurrency(segment.arrAmount)} (${formatPercent(segment.percentOfProduct)})
                </span>
              </div>`;
              html += `<div style="font-size: 10px; color: ${theme.colors.grayscale.light1}; margin-left: 16px;">
                ${formatNumber(segment.customerCount)} customers · Avg ${formatCurrency(segment.avgArrPerCustomer)}
              </div>`;
            }
          });

          // Drilldown hint
          if (enableDrilldown) {
            html += `<div style="margin-top: 8px; color: ${theme.colors.grayscale.light1}; font-size: 11px;">
              Click to drill down
            </div>`;
          }

          return html;
        },
        backgroundColor: theme.colors.grayscale.light5,
        borderColor: theme.colors.grayscale.light2,
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: theme.colors.grayscale.dark2,
        },
      },
      legend: legendConfig,
      grid: {
        left: 160,
        right: legendPosition === 'right' ? 140 : 40,
        top: enableToggle ? 50 : 30,
        bottom: legendPosition === 'bottom' ? 50 : 30,
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        name: isPercentageView ? '% of Product ARR' : 'ARR ($)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: theme.colors.grayscale.base,
          fontWeight: 'bold',
        },
        min: 0,
        max: maxValue,
        axisLine: {
          lineStyle: { color: theme.colors.grayscale.light2 },
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: theme.colors.grayscale.light3,
          },
        },
        axisLabel: {
          color: theme.colors.grayscale.base,
          formatter: (value: number) => {
            if (isPercentageView) {
              return `${value}%`;
            }
            return formatCurrency(value);
          },
        },
      },
      yAxis: {
        type: 'category',
        data: yAxisLabels,
        axisLine: {
          lineStyle: { color: theme.colors.grayscale.light2 },
        },
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          color: theme.colors.grayscale.dark2,
          fontSize: 12,
          fontWeight: 'bold',
          width: 140,
          overflow: 'truncate',
          lineHeight: showCustomerCounts ? 18 : 14,
        },
      },
      series,
      graphic: graphicElements,
    };
  }, [
    buildSeries,
    products,
    isPercentageView,
    showLegend,
    legendPosition,
    enableToggle,
    enableDrilldown,
    showConcentrationAlerts,
    showCrossSellOpportunity,
    showGrowthIndicators,
    showCustomerCounts,
    concentrationRisks,
    crossSellOpportunity,
    formatCurrency,
    formatPercent,
    formatNumber,
    handleToggleView,
    totalARR,
    theme,
  ]);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    // Dispose existing chart
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // Create new chart
    const chart = init(chartRef.current);
    chartInstance.current = chart;

    // Set option
    chart.setOption(chartOption);

    // Handle click events for drilldown
    if (enableDrilldown) {
      chart.on('click', (params: { dataIndex: number; seriesName: string }) => {
        const product = products[params.dataIndex];
        if (product && onDrilldown) {
          const segmentKey = SEGMENT_ORDER.find(
            s => SEGMENT_NAMES[s] === params.seriesName,
          );
          onDrilldown(product.productLine, segmentKey);
        }
      });
    }

    // Store refs for external access (intentional mutation for ref forwarding)
    if (refs && typeof refs === 'object') {
      Object.assign(refs, { echartRef: { current: chart } });
    }

    return () => {
      chart.dispose();
    };
  }, [chartOption, enableDrilldown, products, onDrilldown, refs]);

  // Handle resize
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.resize({ width, height });
    }
  }, [width, height]);

  return (
    <div
      ref={chartRef}
      className={`sm24-monthly-arr-breakdown ${className}`}
      style={{ width, height }}
    />
  );
}

// =============================================================================
// STYLED COMPONENT
// =============================================================================

const StyledSM24MonthlyARRBreakdownViz = styled(SM24MonthlyARRBreakdownViz)`
  ${({ theme }) => `
    font-family: ${theme.typography?.families?.sansSerif || 'Inter, Helvetica, Arial, sans-serif'};
    position: relative;
    overflow: hidden;
  `}
`;

export default StyledSM24MonthlyARRBreakdownViz;
