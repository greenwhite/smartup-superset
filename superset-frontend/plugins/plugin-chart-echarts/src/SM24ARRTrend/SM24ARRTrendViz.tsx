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
import { BinaryQueryObjectFilterClause } from '@superset-ui/core';
import { styled, useTheme } from '@apache-superset/core/ui';
import { init } from 'echarts';
import type { ECharts, EChartsOption, SeriesOption } from 'echarts';
import { SM24ARRTrendVizProps, ARRDataPoint, getGrowthColor } from './types';

// =============================================================================
// ECHARTS VISUALIZATION COMPONENT
// =============================================================================

function SM24ARRTrendViz({
  className = '',
  width,
  height,
  data,
  currentARR,
  targetARR,
  targetConfig,
  projectionData,
  showLine,
  showBars,
  showGrowthRate,
  showTargetLine,
  showProjection,
  showAnnotations,
  annotations,
  growthThresholds,
  colors,
  formatCurrency,
  formatPercent,
  legendPosition,
  showLegendCheckboxes,
  yAxisLeftLabel,
  yAxisRightLabel,
  enableDrilldown,
  enableYoYComparison,
  onContextMenu,
  formData,
  refs,
}: SM24ARRTrendVizProps) {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  // Combine actual data with projection data
  const allData = useMemo(() => {
    if (showProjection && projectionData) {
      return [...data, ...projectionData];
    }
    return data;
  }, [data, projectionData, showProjection]);

  // Get x-axis labels
  const xAxisLabels = useMemo(() => {
    return allData.map(d => d.monthLabel);
  }, [allData]);

  // Calculate y-axis ranges
  const yAxisRanges = useMemo(() => {
    const arrValues = allData.map(d => d.totalARR);
    const maxARR = Math.max(...arrValues, targetARR);
    const minARR = Math.min(...arrValues.filter(v => v > 0));

    const growthValues = data
      .filter(d => d.growthRate !== null)
      .map(d => d.growthRate as number);
    const maxGrowth = Math.max(...growthValues, 10);
    const minGrowth = Math.min(...growthValues, -10);

    return {
      arr: { min: 0, max: maxARR * 1.15 },
      growth: { min: Math.floor(minGrowth - 2), max: Math.ceil(maxGrowth + 2) },
    };
  }, [allData, targetARR, data]);

  // Build ECharts series
  const buildSeries = useCallback((): SeriesOption[] => {
    const series: SeriesOption[] = [];
    const actualDataLength = data.length;

    // Total ARR Line
    if (showLine) {
      series.push({
        name: 'Total ARR',
        type: 'line',
        yAxisIndex: 0,
        data: allData.map((d, i) => ({
          value: d.totalARR,
          itemStyle: {
            color: i >= actualDataLength ? colors.projection : colors.totalARR,
          },
        })),
        lineStyle: {
          width: 3,
          color: colors.totalARR,
        },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 2,
          },
        },
        smooth: 0.3,
        z: 10,
      });

      // Projection line (dashed)
      if (showProjection && projectionData && projectionData.length > 0) {
        const projectionStartIndex = actualDataLength - 1;
        const projectionLineData = allData.map((d, i) => {
          if (i >= projectionStartIndex) {
            return d.totalARR;
          }
          return null;
        });

        series.push({
          name: 'Projection',
          type: 'line',
          yAxisIndex: 0,
          data: projectionLineData,
          lineStyle: {
            width: 2,
            type: 'dashed',
            color: colors.projection,
          },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: colors.projection,
          },
          z: 9,
        });
      }
    }

    // Stacked Bar Chart for ARR Components
    if (showBars) {
      // New Business (positive)
      series.push({
        name: 'New Business',
        type: 'bar',
        stack: 'arr_components',
        yAxisIndex: 0,
        data: data.map(d => d.newBusiness),
        itemStyle: {
          color: colors.newBusiness,
          borderRadius: [2, 2, 0, 0],
        },
        barMaxWidth: 40,
        emphasis: {
          focus: 'series',
        },
      });

      // Expansion (positive)
      series.push({
        name: 'Expansion',
        type: 'bar',
        stack: 'arr_components',
        yAxisIndex: 0,
        data: data.map(d => d.expansion),
        itemStyle: {
          color: colors.expansion,
          borderRadius: [2, 2, 0, 0],
        },
        barMaxWidth: 40,
        emphasis: {
          focus: 'series',
        },
      });

      // Contraction (negative)
      series.push({
        name: 'Contraction',
        type: 'bar',
        stack: 'arr_negative',
        yAxisIndex: 0,
        data: data.map(d => -d.contraction),
        itemStyle: {
          color: colors.contraction,
          borderRadius: [0, 0, 2, 2],
        },
        barMaxWidth: 40,
        emphasis: {
          focus: 'series',
        },
      });

      // Churned (negative)
      series.push({
        name: 'Churned',
        type: 'bar',
        stack: 'arr_negative',
        yAxisIndex: 0,
        data: data.map(d => -d.churned),
        itemStyle: {
          color: colors.churned,
          borderRadius: [0, 0, 2, 2],
        },
        barMaxWidth: 40,
        emphasis: {
          focus: 'series',
        },
      });
    }

    // Growth Rate Line (secondary axis)
    if (showGrowthRate) {
      series.push({
        name: 'Growth Rate',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => d.growthRate),
        lineStyle: {
          width: 2,
          type: 'dotted',
          color: colors.growthLine || '#6C757D',
        },
        symbol: 'diamond',
        symbolSize: 6,
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const value = data[params.dataIndex]?.growthRate;
            if (value === null || value === undefined) return '#6C757D';
            return getGrowthColor(value, growthThresholds);
          },
        },
        z: 8,
      });
    }

    // YoY Comparison Line (if enabled and data available)
    if (enableYoYComparison && data.some(d => d.yoyTotalARR !== null)) {
      series.push({
        name: 'Last Year ARR',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(d => d.yoyTotalARR),
        lineStyle: {
          width: 2,
          type: 'dashed',
          color: theme.colors.grayscale.base,
        },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: {
          color: theme.colors.grayscale.base,
        },
        emphasis: {
          focus: 'series',
        },
        z: 7,
      });
    }

    return series;
  }, [
    data,
    allData,
    projectionData,
    showLine,
    showBars,
    showGrowthRate,
    showProjection,
    enableYoYComparison,
    colors,
    growthThresholds,
    theme,
  ]);

  // Build ECharts option
  const chartOption = useMemo((): EChartsOption => {
    const series = buildSeries();

    // Build mark lines for target
    const markLines: { yAxis: number; name: string; lineStyle: object }[] = [];
    if (showTargetLine) {
      markLines.push({
        yAxis: targetARR,
        name: 'Target',
        lineStyle: {
          color: colors.target,
          width: 2,
          type: 'dashed',
        },
      });
    }

    // Build annotations as mark points
    const markPoints: {
      coord: [string, number];
      name: string;
      symbol: string;
    }[] = [];
    if (showAnnotations && annotations.length > 0) {
      annotations.forEach(ann => {
        const dataPoint = data.find(d => d.month === ann.date);
        if (dataPoint) {
          markPoints.push({
            coord: [dataPoint.monthLabel, dataPoint.totalARR],
            name: ann.label,
            symbol: 'pin',
          });
        }
      });
    }

    // Add markLine to the first line series if it exists
    if (markLines.length > 0 && series.length > 0) {
      const lineSeries = series.find(
        s => s.type === 'line' && s.name === 'Total ARR',
      );
      if (lineSeries) {
        (lineSeries as { markLine?: object }).markLine = {
          silent: true,
          symbol: 'none',
          data: markLines.map(ml => ({
            yAxis: ml.yAxis,
            name: ml.name,
            lineStyle: ml.lineStyle,
            label: {
              show: true,
              position: 'end',
              formatter: `Target: ${formatCurrency(ml.yAxis)}`,
              color: colors.target,
              fontWeight: 'bold',
            },
          })),
        };
      }
    }

    // Legend configuration
    const legendConfig = {
      show: true,
      type: 'scroll' as const,
      orient:
        legendPosition === 'bottom' || legendPosition === 'top'
          ? ('horizontal' as const)
          : ('vertical' as const),
      ...(legendPosition === 'bottom' && { bottom: 0, left: 'center' }),
      ...(legendPosition === 'top' && { top: 0, left: 'center' }),
      ...(legendPosition === 'left' && { left: 0, top: 'middle' }),
      ...(legendPosition === 'right' && { right: 0, top: 'middle' }),
      selectedMode: showLegendCheckboxes,
      itemGap: 16,
      textStyle: {
        fontSize: 12,
      },
    };

    return {
      animation: true,
      animationDuration: 500,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: theme.colors.grayscale.light1,
          },
        },
        formatter: (
          params: {
            dataIndex: number;
            data: number | null;
            seriesName: string;
            color: string;
          }[],
        ) => {
          if (!Array.isArray(params) || params.length === 0) return '';

          const { dataIndex } = params[0];
          const dataPoint = data[dataIndex];

          if (!dataPoint) return '';

          let html = `<div style="font-weight: bold; margin-bottom: 8px;">${dataPoint.monthLabel}</div>`;

          // Total ARR
          html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
            <span style="color: ${colors.totalARR};">● Total ARR</span>
            <span style="font-weight: bold;">${formatCurrency(dataPoint.totalARR)}</span>
          </div>`;

          // MoM Change
          if (dataPoint.momChange !== null) {
            const changeSign = dataPoint.momChange >= 0 ? '+' : '';
            html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
              <span style="color: ${theme.colors.grayscale.base};">MoM Change</span>
              <span style="color: ${dataPoint.momChange >= 0 ? colors.newBusiness : colors.churned};">
                ${changeSign}${formatCurrency(dataPoint.momChange)}
              </span>
            </div>`;
          }

          // Growth Rate
          if (dataPoint.growthRate !== null) {
            const growthColor = getGrowthColor(
              dataPoint.growthRate,
              growthThresholds,
            );
            html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
              <span style="color: #6C757D;">Growth Rate</span>
              <span style="color: ${growthColor}; font-weight: bold;">
                ${formatPercent(dataPoint.growthRate)}
              </span>
            </div>`;
          }

          html += `<hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;" />`;

          // Breakdown
          html += `<div style="font-size: 11px; color: #666;">ARR Components:</div>`;
          html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
            <span style="color: ${colors.newBusiness};">+ New Business</span>
            <span>${formatCurrency(dataPoint.newBusiness)}</span>
          </div>`;
          html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
            <span style="color: ${colors.expansion};">+ Expansion</span>
            <span>${formatCurrency(dataPoint.expansion)}</span>
          </div>`;
          html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
            <span style="color: ${colors.contraction};">- Contraction</span>
            <span>${formatCurrency(dataPoint.contraction)}</span>
          </div>`;
          html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
            <span style="color: ${colors.churned};">- Churned</span>
            <span>${formatCurrency(dataPoint.churned)}</span>
          </div>`;

          // Net New ARR
          html += `<div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px solid #eee;">
            <span style="font-weight: bold;">= Net New ARR</span>
            <span style="font-weight: bold; color: ${dataPoint.netNewARR >= 0 ? colors.newBusiness : colors.churned};">
              ${dataPoint.netNewARR >= 0 ? '+' : ''}${formatCurrency(dataPoint.netNewARR)}
            </span>
          </div>`;

          // YoY Comparison (if available)
          if (
            dataPoint.yoyTotalARR !== null &&
            dataPoint.yoyTotalARR !== undefined
          ) {
            html += `<hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;" />`;
            html += `<div style="font-size: 11px; color: #666;">Year-over-Year:</div>`;
            html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
              <span style="color: #95A5A6;">Last Year ARR</span>
              <span>${formatCurrency(dataPoint.yoyTotalARR)}</span>
            </div>`;
            if (dataPoint.yoyGrowthRate !== null) {
              const yoyColor =
                dataPoint.yoyGrowthRate >= 0
                  ? colors.newBusiness
                  : colors.churned;
              html += `<div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: ${theme.colors.grayscale.base};">YoY Growth</span>
                <span style="color: ${yoyColor}; font-weight: bold;">
                  ${dataPoint.yoyGrowthRate >= 0 ? '+' : ''}${dataPoint.yoyGrowthRate.toFixed(1)}%
                </span>
              </div>`;
            }
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
        right: showGrowthRate ? 80 : 40,
        top: legendPosition === 'top' ? 60 : 40,
        bottom: legendPosition === 'bottom' ? 60 : 40,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: xAxisLabels,
        axisLine: {
          lineStyle: {
            color: theme.colors.grayscale.light2,
          },
        },
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          color: theme.colors.grayscale.base,
          fontSize: 11,
          rotate: xAxisLabels.length > 12 ? 45 : 0,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: yAxisLeftLabel,
          nameLocation: 'middle',
          nameGap: 60,
          nameTextStyle: {
            color: theme.colors.grayscale.base,
            fontWeight: 'bold',
          },
          min: yAxisRanges.arr.min,
          max: yAxisRanges.arr.max,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors.totalARR,
            },
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
        {
          type: 'value',
          name: yAxisRightLabel,
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            color: theme.colors.grayscale.base,
            fontWeight: 'bold',
          },
          min: yAxisRanges.growth.min,
          max: yAxisRanges.growth.max,
          show: showGrowthRate,
          axisLine: {
            show: true,
            lineStyle: {
              color: theme.colors.grayscale.base,
            },
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            color: theme.colors.grayscale.base,
            formatter: (value: number) => `${value}%`,
          },
        },
      ],
      series,
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomOnMouseWheel: 'shift',
        },
      ],
    };
  }, [
    buildSeries,
    xAxisLabels,
    yAxisRanges,
    showGrowthRate,
    showTargetLine,
    showAnnotations,
    targetARR,
    colors,
    annotations,
    data,
    formatCurrency,
    formatPercent,
    growthThresholds,
    legendPosition,
    showLegendCheckboxes,
    yAxisLeftLabel,
    yAxisRightLabel,
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

    // Handle click events for cross-filtering (optional)
    chart.on('click', (params: { dataIndex: number; seriesName: string }) => {
      const dataPoint = data[params.dataIndex];
      if (dataPoint && enableDrilldown) {
        // Cross-filter click behavior can be added here
      }
    });

    // Handle right-click context menu for DrillToDetail and DrillBy
    chart.on(
      'contextmenu',
      (eventParams: {
        dataIndex: number;
        seriesName: string;
        event: { event: MouseEvent; stop: () => void };
      }) => {
        if (onContextMenu) {
          eventParams.event.stop();
          const dataPoint = data[eventParams.dataIndex];
          const pointerEvent = eventParams.event.event;

          if (!dataPoint) return;

          // Build drill-to-detail filters
          const drillToDetailFilters: BinaryQueryObjectFilterClause[] = [];

          // Add time filter for the selected month
          if (formData.granularitySqla && dataPoint.month) {
            drillToDetailFilters.push({
              col: formData.granularitySqla,
              grain: formData.timeGrainSqla,
              op: '==',
              val: dataPoint.month,
              formattedVal: dataPoint.monthLabel,
            });
          }

          // Build drill-by filters (based on groupby if any)
          const drillByFilters: BinaryQueryObjectFilterClause[] = [];
          const groupby = formData.groupby || [];

          // Add groupby dimensions to drill-by filters
          groupby.forEach((dimension: string) => {
            drillByFilters.push({
              col: dimension,
              op: '==',
              val: dataPoint.month,
              formattedVal: dataPoint.monthLabel,
            });
          });

          // Call onContextMenu with drill filters
          onContextMenu(pointerEvent.clientX, pointerEvent.clientY, {
            drillToDetail: drillToDetailFilters,
            drillBy:
              groupby.length > 0
                ? {
                    filters: drillByFilters,
                    groupbyFieldName: 'groupby',
                    adhocFilterFieldName: 'adhoc_filters',
                  }
                : undefined,
          });
        }
      },
    );

    // Store refs for external access (intentional mutation for ref forwarding)
    if (refs && typeof refs === 'object') {
      Object.assign(refs, { echartRef: { current: chart } });
    }

    return () => {
      chart.dispose();
    };
  }, [chartOption, enableDrilldown, onContextMenu, data, formData, refs]);

  // Handle resize
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.resize({ width, height });
    }
  }, [width, height]);

  return (
    <div
      ref={chartRef}
      className={`sm24-arrtrend ${className}`}
      style={{ width, height }}
    />
  );
}

// =============================================================================
// STYLED COMPONENT
// =============================================================================

const StyledSM24ARRTrendViz = styled(SM24ARRTrendViz)`
  ${({ theme }) => `
    font-family: ${theme.fontFamily};
    position: relative;
    overflow: hidden;

    /* Custom scrollbar for data zoom */
    .echarts-datazoom-slider {
      background-color: ${theme.colors.grayscale.light4};
      border-radius: 4px;
    }
  `}
`;

export default StyledSM24ARRTrendViz;
