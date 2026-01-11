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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { styled, useTheme } from '@superset-ui/core';
import { init } from 'echarts';
import type { ECharts, EChartsOption, SeriesOption } from 'echarts';
import {
  SM24MetricWaterfallVizProps,
  WaterfallDataPoint,
  WATERFALL_COLORS,
  getQuickRatioColor,
  DRILLDOWN_MAP,
} from './types';

// =============================================================================
// ECHARTS VISUALIZATION COMPONENT
// =============================================================================

function SM24MetricWaterfallViz({
  className = '',
  width,
  height,
  data,
  beginningARR,
  endingARR,
  netChange,
  growthRate,
  quickRatio,
  showConnectorLines,
  showPercentLabels,
  showAbsoluteLabels,
  showQuickRatio,
  showNetChange,
  showGrowthRate,
  colors,
  alerts,
  formatCurrency,
  formatPercent,
  enableDrilldown,
  onDrilldown,
  showLegend,
  legendPosition,
  refs,
}: SM24MetricWaterfallVizProps) {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  // Get x-axis categories
  const categories = useMemo(() => data.map(d => d.category), [data]);

  // Build bar data for ECharts waterfall
  // ECharts waterfall requires: transparent base + visible bar stacking
  const buildWaterfallSeries = useCallback((): SeriesOption[] => {
    const series: SeriesOption[] = [];

    // Transparent placeholder bars (for floating effect)
    const placeholderData = data.map(d => {
      if (d.type === 'total') {
        return 0; // Total bars start from 0
      }
      // For increase/decrease bars, start from running total
      return d.start || 0;
    });

    series.push({
      name: 'Placeholder',
      type: 'bar',
      stack: 'waterfall',
      itemStyle: {
        color: 'transparent',
        borderColor: 'transparent',
      },
      data: placeholderData,
      emphasis: {
        itemStyle: {
          color: 'transparent',
          borderColor: 'transparent',
        },
      },
    });

    // Actual value bars
    const valueData = data.map((d, index) => {
      let barValue: number;
      let barColor: string | object;

      if (d.type === 'total') {
        barValue = d.value;
        barColor = colors.total;
      } else if (d.type === 'increase') {
        barValue = d.value;
        barColor = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: colors.increase },
            { offset: 1, color: colors.increaseGradient },
          ],
        };
      } else {
        barValue = Math.abs(d.value);
        barColor = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: colors.decrease },
            { offset: 1, color: colors.decreaseGradient },
          ],
        };
      }

      return {
        value: barValue,
        itemStyle: {
          color: barColor,
          borderRadius: d.type === 'total' ? [4, 4, 4, 4] : [4, 4, 0, 0],
        },
        label: {
          show: showAbsoluteLabels,
          position: 'top',
          formatter: formatCurrency(barValue),
          color: WATERFALL_COLORS.textPrimary,
          fontWeight: 'bold',
          fontSize: 12,
        },
      };
    });

    series.push({
      name: 'ARR Movement',
      type: 'bar',
      stack: 'waterfall',
      data: valueData,
      barMaxWidth: 60,
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowColor: theme.colors.grayscale.light2,
        },
      },
    });

    // Inside percentage labels
    if (showPercentLabels) {
      const percentLabelData = data.map(d => ({
        value: d.value,
        label: {
          show: d.type !== 'total' && d.percentOfBeginning > 1,
          position: 'inside',
          formatter: `${d.percentOfBeginning.toFixed(1)}%`,
          color: WATERFALL_COLORS.textLight,
          fontSize: 11,
        },
      }));

      series.push({
        name: 'Percent Labels',
        type: 'bar',
        stack: 'waterfall_labels',
        data: placeholderData,
        itemStyle: { color: 'transparent' },
        silent: true,
      });

      series.push({
        name: 'Percent Values',
        type: 'bar',
        stack: 'waterfall_labels',
        data: percentLabelData,
        itemStyle: { color: 'transparent' },
        silent: true,
        barGap: '-100%',
      });
    }

    return series;
  }, [
    data,
    colors,
    showAbsoluteLabels,
    showPercentLabels,
    formatCurrency,
    theme,
  ]);

  // Build connector lines (mark lines between bars)
  const buildConnectorLines = useCallback(() => {
    if (!showConnectorLines) return [];

    const lines: { xAxis: number; yAxis: number }[][] = [];

    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];

      if (current && next) {
        let connectorY: number;

        if (current.type === 'total') {
          connectorY = current.value;
        } else if (current.type === 'increase') {
          connectorY = current.end || 0;
        } else {
          connectorY = current.end || 0;
        }

        lines.push([
          { xAxis: i, yAxis: connectorY },
          { xAxis: i + 1, yAxis: connectorY },
        ]);
      }
    }

    return lines;
  }, [data, showConnectorLines]);

  // Build chart option
  const chartOption = useMemo((): EChartsOption => {
    const series = buildWaterfallSeries();
    const connectorLines = buildConnectorLines();

    // Add connector lines to the first bar series
    if (connectorLines.length > 0 && series.length > 1) {
      (series[1] as { markLine?: object }).markLine = {
        silent: true,
        symbol: 'none',
        lineStyle: {
          color: colors.connector,
          type: 'dashed',
          width: 1,
        },
        data: connectorLines,
      };
    }

    // Legend configuration
    const legendConfig = {
      show: showLegend,
      data: [
        {
          name: 'Total',
          icon: 'roundRect',
          itemStyle: { color: colors.total },
        },
        {
          name: 'Increase',
          icon: 'roundRect',
          itemStyle: { color: colors.increase },
        },
        {
          name: 'Decrease',
          icon: 'roundRect',
          itemStyle: { color: colors.decrease },
        },
      ],
      ...(legendPosition === 'bottom' && { bottom: 10, left: 'center' }),
      ...(legendPosition === 'top' && { top: 10, left: 'center' }),
      ...(legendPosition === 'left' && {
        left: 10,
        top: 'middle',
        orient: 'vertical',
      }),
      ...(legendPosition === 'right' && {
        right: 10,
        top: 'middle',
        orient: 'vertical',
      }),
    };

    // Calculate max value for y-axis
    const maxValue = Math.max(beginningARR, endingARR) * 1.2;

    // Build graphic elements for annotations
    const graphicElements: object[] = [];

    // Quick Ratio badge
    if (showQuickRatio) {
      const qrColor = getQuickRatioColor(quickRatio.status);
      graphicElements.push({
        type: 'group',
        right: 20,
        top: 20,
        children: [
          {
            type: 'rect',
            shape: { width: 120, height: 50, r: 8 },
            style: {
              fill: qrColor,
              shadowBlur: 4,
              shadowColor: theme.colors.grayscale.light2,
            },
          },
          {
            type: 'text',
            style: {
              text: 'Quick Ratio',
              x: 60,
              y: 14,
              textAlign: 'center',
              fill: theme.colors.grayscale.light5,
              fontSize: 10,
            },
          },
          {
            type: 'text',
            style: {
              text:
                quickRatio.value === Infinity
                  ? '∞'
                  : quickRatio.value.toFixed(2),
              x: 60,
              y: 34,
              textAlign: 'center',
              fill: theme.colors.grayscale.light5,
              fontSize: 18,
              fontWeight: 'bold',
            },
          },
        ],
      });
    }

    // Net Change and Growth Rate annotations
    if (showNetChange || showGrowthRate) {
      const annotationY = showQuickRatio ? 80 : 20;
      const changeColor = netChange >= 0 ? colors.increase : colors.decrease;

      graphicElements.push({
        type: 'group',
        right: 20,
        top: annotationY,
        children: [
          ...(showNetChange
            ? [
                {
                  type: 'text',
                  style: {
                    text: `Net: ${formatCurrency(netChange)}`,
                    x: 0,
                    y: 0,
                    fill: changeColor,
                    fontSize: 14,
                    fontWeight: 'bold',
                  },
                },
              ]
            : []),
          ...(showGrowthRate
            ? [
                {
                  type: 'text',
                  style: {
                    text: `Growth: ${formatPercent(growthRate)}`,
                    x: 0,
                    y: showNetChange ? 20 : 0,
                    fill: changeColor,
                    fontSize: 12,
                  },
                },
              ]
            : []),
        ],
      });
    }

    // Alert indicators
    if (alerts.churnAlert) {
      graphicElements.push({
        type: 'text',
        left: 20,
        top: 20,
        style: {
          text: '⚠️ High Churn Alert',
          fill: colors.decrease,
          fontSize: 12,
          fontWeight: 'bold',
        },
      });
    }

    if (alerts.contractionWarning) {
      graphicElements.push({
        type: 'text',
        left: 20,
        top: alerts.churnAlert ? 40 : 20,
        style: {
          text: '⚠️ Contraction > Expansion',
          fill: WATERFALL_COLORS.quickRatioWarning,
          fontSize: 12,
        },
      });
    }

    return {
      animation: true,
      animationDuration: 600,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: { dataIndex: number }[]) => {
          if (!Array.isArray(params) || params.length === 0) return '';

          const { dataIndex } = params[0];
          const point = data[dataIndex];

          if (!point) return '';

          let html = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${point.category}</div>`;

          // Absolute value
          html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
            <span>Value:</span>
            <span style="font-weight: bold;">${formatCurrency(point.value)}</span>
          </div>`;

          // Percentage of Beginning ARR
          html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
            <span>% of Beginning ARR:</span>
            <span>${point.percentOfBeginning.toFixed(1)}%</span>
          </div>`;

          // Customer count (if available)
          if (point.customerCount !== undefined && point.customerCount > 0) {
            html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
              <span># Customers:</span>
              <span>${point.customerCount.toLocaleString()}</span>
            </div>`;

            // Average per customer
            if (point.avgPerCustomer) {
              html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
                <span>Avg per Customer:</span>
                <span>${formatCurrency(point.avgPerCustomer)}</span>
              </div>`;
            }
          }

          // Drilldown hint
          if (enableDrilldown && DRILLDOWN_MAP[point.category]) {
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
        left: 80,
        right: showQuickRatio ? 160 : 40,
        top: 60,
        bottom: legendPosition === 'bottom' ? 60 : 40,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: categories,
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
        },
      },
      yAxis: {
        type: 'value',
        name: 'ARR ($)',
        nameLocation: 'middle',
        nameGap: 60,
        nameTextStyle: {
          color: theme.colors.grayscale.base,
          fontWeight: 'bold',
        },
        min: 0,
        max: maxValue,
        axisLine: {
          show: true,
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
          formatter: (value: number) => formatCurrency(value),
        },
      },
      series,
      graphic: graphicElements,
    };
  }, [
    buildWaterfallSeries,
    buildConnectorLines,
    categories,
    data,
    colors,
    beginningARR,
    endingARR,
    netChange,
    growthRate,
    quickRatio,
    showLegend,
    legendPosition,
    showQuickRatio,
    showNetChange,
    showGrowthRate,
    alerts,
    formatCurrency,
    formatPercent,
    enableDrilldown,
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
        if (params.seriesName === 'Placeholder') return;

        const point = data[params.dataIndex];
        if (point && DRILLDOWN_MAP[point.category]) {
          if (onDrilldown) {
            onDrilldown(point.category, '', '');
          }
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
  }, [chartOption, enableDrilldown, data, onDrilldown, refs]);

  // Handle resize
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.resize({ width, height });
    }
  }, [width, height]);

  return (
    <div
      ref={chartRef}
      className={`sm24-arrwaterfall ${className}`}
      style={{ width, height }}
    />
  );
}

// =============================================================================
// STYLED COMPONENT
// =============================================================================

const StyledSM24MetricWaterfallViz = styled(SM24MetricWaterfallViz)`
  ${({ theme }) => `
    font-family: ${theme.typography?.families?.sansSerif || 'Inter, Helvetica, Arial, sans-serif'};
    position: relative;
    overflow: hidden;
  `}
`;

export default StyledSM24MetricWaterfallViz;
