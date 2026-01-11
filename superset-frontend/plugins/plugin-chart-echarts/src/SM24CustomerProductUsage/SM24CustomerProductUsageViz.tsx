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
import { FC, useState, useMemo, useCallback, CSSProperties } from 'react';
import { styled, css, BinaryQueryObjectFilterClause } from '@superset-ui/core';
import EChartsReact from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  SM24CustomerProductUsageVizProps,
  ProductUsageSummary,
  UsageTrendPoint,
  FeatureUsage,
  TimeRange,
  ChartType,
  PRODUCT_COLORS,
  STATUS_CONFIG,
  ADOPTION_CONFIG,
} from './types';

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const Container = styled.div<{ width: number; height: number }>`
  ${({ width, height }) => css`
    width: ${width}px;
    height: ${height}px;
    padding: 16px;
    overflow: auto;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #fff;
    box-sizing: border-box;
  `}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
`;

const CustomerInfo = styled.span`
  font-weight: 400;
  color: #666;
  font-size: 16px;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Select = styled.select`
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
  }

  &:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;

  input {
    cursor: pointer;
  }
`;

// Product Summary Cards
const ProductCardsContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 20px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const ProductCard = styled.div<{ isSelected: boolean; borderColor: string }>`
  ${({ isSelected, borderColor }) => css`
    min-width: 200px;
    padding: 14px;
    background: ${isSelected ? '#f6ffed' : '#fff'};
    border: 2px solid ${isSelected ? '#52c41a' : borderColor};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  `}
`;

const ProductCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const ProductName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
`;

const StatusBadge = styled.span<{ bgColor: string; textColor: string }>`
  ${({ bgColor, textColor }) => css`
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
    background: ${bgColor};
    color: ${textColor};
  `}
`;

const ProductMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ProductMetric = styled.div`
  text-align: left;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
`;

const MetricValue = styled.div<{ color?: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ color }) => color || '#1a1a2e'};
`;

// Alert Banner
const AlertBanner = styled.div<{ type: 'warning' | 'error' }>`
  ${({ type }) => css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin-bottom: 16px;
    border-radius: 6px;
    background: ${type === 'error' ? '#fff2f0' : '#fffbe6'};
    border: 1px solid ${type === 'error' ? '#ffccc7' : '#ffe58f'};
    color: ${type === 'error' ? '#cf1322' : '#ad6800'};
    font-size: 13px;
  `}
`;

const AlertIcon = styled.span`
  font-size: 16px;
`;

// Chart Section
const ChartSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
`;

// Table Section
const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: #fafafa;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
`;

const Td = styled.td<{ clickable?: boolean }>`
  ${({ clickable }) => css`
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    color: #1a1a2e;
    cursor: ${clickable ? 'pointer' : 'default'};

    &:hover {
      background: ${clickable ? '#f5f5f5' : 'transparent'};
    }
  `}
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #1890ff;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background: #e6f7ff;
  }
`;

const FeatureRow = styled.tr`
  background: #f9f9f9;
`;

const FeatureCell = styled.td`
  padding: 8px 12px 8px 32px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: #666;
`;

const ProgressBar = styled.div<{ width: number; color: string }>`
  ${({ width, color }) => css`
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
    width: 100px;

    &::after {
      content: '';
      display: block;
      height: 100%;
      width: ${Math.min(width, 100)}%;
      background: ${color};
      border-radius: 3px;
    }
  `}
`;

const TrendIndicator = styled.span<{ trend: 'up' | 'down' | 'neutral' }>`
  ${({ trend }) => css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${trend === 'up' ? '#52c41a' : trend === 'down' ? '#ff4d4f' : '#999'};
    font-size: 12px;
    font-weight: 500;
  `}
`;

const NoData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  text-align: center;
`;

const NoDataIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getProductColor(productLine: string): string {
  return PRODUCT_COLORS[productLine] || '#8884d8';
}

function getTrendArrow(trend: 'up' | 'down' | 'neutral'): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const SM24CustomerProductUsageViz: FC<SM24CustomerProductUsageVizProps> = props => {
  const {
    width,
    height,
    data,
    loading,
    error,
    selectedProduct: initialSelectedProduct,
    selectedTimeRange: initialTimeRange,
    selectedChartType: initialChartType,
    showInactiveProducts,
    showFeatureBreakdown,
    enableExpandableRows,
    lowAdoptionThreshold,
    highAdoptionThreshold,
    showDauLine,
    showSessionsBars,
    showAnnotations,
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDuration,
    formatDate,
    enableDrilldown,
    onContextMenu,
  } = props;

  // State
  const [selectedProduct, setSelectedProduct] = useState<string | null>(initialSelectedProduct);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [showInactive, setShowInactive] = useState(showInactiveProducts);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return showInactive
      ? data.products
      : data.products.filter(p => p.isActive);
  }, [data?.products, showInactive]);

  // Get trends for selected product or all
  const filteredTrends = useMemo(() => {
    if (!data?.usageTrends) return [];
    const now = new Date();
    const daysMap: Record<TimeRange, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365,
    };
    const days = daysMap[timeRange];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return data.usageTrends.filter(t => {
      const weekDate = new Date(t.weekStart);
      const matchesTime = weekDate >= cutoff;
      const matchesProduct = !selectedProduct || t.productLine === selectedProduct;
      return matchesTime && matchesProduct;
    });
  }, [data?.usageTrends, timeRange, selectedProduct]);

  // Get features for selected product
  const filteredFeatures = useMemo(() => {
    if (!data?.featureUsage || !selectedProduct) return [];
    return data.featureUsage.filter(f => f.productLine === selectedProduct);
  }, [data?.featureUsage, selectedProduct]);

  // Toggle expanded row
  const toggleExpanded = useCallback((productLine: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productLine)) {
        next.delete(productLine);
      } else {
        next.add(productLine);
      }
      return next;
    });
  }, []);

  // Handle product card click
  const handleProductClick = useCallback((productLine: string) => {
    setSelectedProduct(prev => (prev === productLine ? null : productLine));
  }, []);

  // Handle drilldown
  const handleDrilldown = useCallback(
    (product: ProductUsageSummary, event: React.MouseEvent) => {
      if (!enableDrilldown || !onContextMenu) return;

      const filters: BinaryQueryObjectFilterClause[] = [
        {
          col: 'product_line',
          op: '==',
          val: product.productLine,
          formattedVal: product.productLine,
        },
      ];

      onContextMenu(event.clientX, event.clientY, {
        drillToDetail: filters,
        drillBy: { filters, groupbyFieldName: 'product_line' },
      });
    },
    [enableDrilldown, onContextMenu],
  );

  // Build chart options
  const chartOption = useMemo((): EChartsOption => {
    if (!filteredTrends.length) {
      return {
        title: {
          text: 'No usage data available',
          left: 'center',
          top: 'center',
          textStyle: { color: '#999', fontSize: 14 },
        },
      };
    }

    // Group by week
    const weekMap = new Map<string, { dau: number; sessions: number; products: Set<string> }>();
    filteredTrends.forEach(t => {
      const existing = weekMap.get(t.weekStart) || { dau: 0, sessions: 0, products: new Set() };
      existing.dau += t.avgDau;
      existing.sessions += t.weeklySessions;
      existing.products.add(t.productLine);
      weekMap.set(t.weekStart, existing);
    });

    const weeks = Array.from(weekMap.keys()).sort();
    const dauData = weeks.map(w => weekMap.get(w)?.dau || 0);
    const sessionsData = weeks.map(w => weekMap.get(w)?.sessions || 0);

    const series: EChartsOption['series'] = [];

    if (showDauLine && (chartType === 'line' || chartType === 'mixed')) {
      series.push({
        name: 'Avg DAU',
        type: 'line',
        data: dauData,
        smooth: true,
        lineStyle: { width: 3, color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
        areaStyle: chartType === 'area' ? { opacity: 0.3, color: '#1890ff' } : undefined,
      });
    }

    if (showSessionsBars && (chartType === 'bar' || chartType === 'mixed')) {
      series.push({
        name: 'Weekly Sessions',
        type: 'bar',
        data: sessionsData,
        yAxisIndex: chartType === 'mixed' ? 1 : 0,
        itemStyle: { color: '#52c41a', opacity: 0.7 },
        barWidth: '60%',
      });
    }

    if (chartType === 'area' && !showDauLine) {
      series.push({
        name: 'Weekly Sessions',
        type: 'line',
        data: sessionsData,
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#52c41a' },
      });
    }

    const yAxis: EChartsOption['yAxis'] = chartType === 'mixed'
      ? [
          { type: 'value', name: 'DAU', position: 'left' },
          { type: 'value', name: 'Sessions', position: 'right' },
        ]
      : { type: 'value' };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: series.map(s => (s as { name: string }).name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: chartType === 'mixed' ? '10%' : '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: weeks.map(w => formatDate(w)),
        axisLabel: { rotate: 45 },
      },
      yAxis,
      series,
    };
  }, [filteredTrends, chartType, showDauLine, showSessionsBars, formatDate]);

  // Get alerts
  const alerts = useMemo(() => {
    const result: Array<{ type: 'warning' | 'error'; message: string }> = [];
    if (!data?.products) return result;

    const trialExpiring = data.products.filter(p => p.isTrialExpiring);
    const underutilized = data.products.filter(p => p.isUnderutilized);

    if (trialExpiring.length > 0) {
      result.push({
        type: 'warning',
        message: `${trialExpiring.length} product(s) have trials expiring soon: ${trialExpiring.map(p => p.productName).join(', ')}`,
      });
    }

    if (underutilized.length > 0) {
      result.push({
        type: 'error',
        message: `${underutilized.length} product(s) are underutilized: ${underutilized.map(p => p.productName).join(', ')}`,
      });
    }

    return result;
  }, [data?.products]);

  // Loading state
  if (loading) {
    return (
      <Container width={width} height={height}>
        <NoData>
          <NoDataIcon>⏳</NoDataIcon>
          <div>Loading product usage data...</div>
        </NoData>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container width={width} height={height}>
        <NoData>
          <NoDataIcon>⚠️</NoDataIcon>
          <div>Error: {error}</div>
        </NoData>
      </Container>
    );
  }

  // No data state
  if (!data) {
    return (
      <Container width={width} height={height}>
        <NoData>
          <NoDataIcon>📊</NoDataIcon>
          <div>No product usage data available</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>
            Configure your data source to see product usage analytics
          </div>
        </NoData>
      </Container>
    );
  }

  return (
    <Container width={width} height={height}>
      {/* Header */}
      <Header>
        <Title>
          Product Usage Analytics
          {data.customerName && (
            <CustomerInfo> — {data.customerName}</CustomerInfo>
          )}
        </Title>
        <Controls>
          <Select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as TimeRange)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="180d">Last 180 days</option>
            <option value="365d">Last year</option>
          </Select>
          <Select
            value={chartType}
            onChange={e => setChartType(e.target.value as ChartType)}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="mixed">Mixed Chart</option>
            <option value="area">Area Chart</option>
          </Select>
          <Checkbox>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
            />
            Show inactive
          </Checkbox>
        </Controls>
      </Header>

      {/* Alerts */}
      {alerts.map((alert, idx) => (
        <AlertBanner key={idx} type={alert.type}>
          <AlertIcon>{alert.type === 'error' ? '🚨' : '⚠️'}</AlertIcon>
          {alert.message}
        </AlertBanner>
      ))}

      {/* Summary Stats */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <MetricLabel>Total Products</MetricLabel>
          <MetricValue>{data.totalProducts}</MetricValue>
        </div>
        <div>
          <MetricLabel>Active Products</MetricLabel>
          <MetricValue color="#52c41a">{data.activeProducts}</MetricValue>
        </div>
        <div>
          <MetricLabel>Licensed Users</MetricLabel>
          <MetricValue>{formatNumber(data.totalLicensedUsers)}</MetricValue>
        </div>
        <div>
          <MetricLabel>Active Users (30d)</MetricLabel>
          <MetricValue>{formatNumber(data.totalActiveUsers)}</MetricValue>
        </div>
        <div>
          <MetricLabel>Overall Adoption</MetricLabel>
          <MetricValue>{formatPercent(data.overallAdoptionScore)}</MetricValue>
        </div>
        <div>
          <MetricLabel>ARR Contribution</MetricLabel>
          <MetricValue color="#1890ff">{formatCurrency(data.totalArrContribution)}</MetricValue>
        </div>
      </div>

      {/* Product Cards */}
      <ProductCardsContainer>
        {filteredProducts.map(product => {
          const statusConfig = STATUS_CONFIG[product.status];
          const adoptionConfig = ADOPTION_CONFIG[product.adoptionLevel];
          const isSelected = selectedProduct === product.productLine;
          const borderColor = getProductColor(product.productLine);

          return (
            <ProductCard
              key={product.productLine}
              isSelected={isSelected}
              borderColor={borderColor}
              onClick={() => handleProductClick(product.productLine)}
              onContextMenu={e => {
                e.preventDefault();
                handleDrilldown(product, e);
              }}
            >
              <ProductCardHeader>
                <ProductName>{product.productName}</ProductName>
                <StatusBadge
                  bgColor={statusConfig.bgColor}
                  textColor={statusConfig.color}
                >
                  {statusConfig.label}
                </StatusBadge>
              </ProductCardHeader>
              <ProductMetrics>
                <ProductMetric>
                  <MetricLabel>Active Users</MetricLabel>
                  <MetricValue>
                    {product.activeUsers30d}/{product.licensedUsers}
                    <TrendIndicator trend={product.usageTrend}>
                      {getTrendArrow(product.usageTrend)}
                    </TrendIndicator>
                  </MetricValue>
                </ProductMetric>
                <ProductMetric>
                  <MetricLabel>Adoption</MetricLabel>
                  <MetricValue color={adoptionConfig.color}>
                    {formatPercent(product.featureAdoptionScore)}
                  </MetricValue>
                </ProductMetric>
                <ProductMetric>
                  <MetricLabel>ARR</MetricLabel>
                  <MetricValue>{formatCurrency(product.arrContribution)}</MetricValue>
                </ProductMetric>
                <ProductMetric>
                  <MetricLabel>Sessions</MetricLabel>
                  <MetricValue>{formatNumber(product.totalLogins30d)}</MetricValue>
                </ProductMetric>
              </ProductMetrics>
            </ProductCard>
          );
        })}
      </ProductCardsContainer>

      {/* Usage Trends Chart */}
      <ChartSection>
        <SectionTitle>
          📈 Usage Trends
          {selectedProduct && (
            <span style={{ fontWeight: 400, fontSize: 14, color: '#666' }}>
              — {filteredProducts.find(p => p.productLine === selectedProduct)?.productName || selectedProduct}
            </span>
          )}
        </SectionTitle>
        <ChartContainer>
          <EChartsReact
            option={chartOption}
            style={{ height: 300 }}
            notMerge
          />
        </ChartContainer>
      </ChartSection>

      {/* Products Table */}
      <ChartSection>
        <SectionTitle>📋 Product Details</SectionTitle>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                {enableExpandableRows && showFeatureBreakdown && <Th style={{ width: 40 }} />}
                <Th>Product</Th>
                <Th>Status</Th>
                <Th>License</Th>
                <Th>Users (30d)</Th>
                <Th>Utilization</Th>
                <Th>Adoption</Th>
                <Th>Sessions</Th>
                <Th>Avg Duration</Th>
                <Th>ARR</Th>
                <Th>Renewal</Th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const statusConfig = STATUS_CONFIG[product.status];
                const adoptionConfig = ADOPTION_CONFIG[product.adoptionLevel];
                const isExpanded = expandedProducts.has(product.productLine);
                const productFeatures = data.featureUsage.filter(
                  f => f.productLine === product.productLine
                );

                return (
                  <>
                    <tr key={product.productLine}>
                      {enableExpandableRows && showFeatureBreakdown && (
                        <Td>
                          {productFeatures.length > 0 && (
                            <ExpandButton
                              onClick={() => toggleExpanded(product.productLine)}
                            >
                              {isExpanded ? '▼' : '▶'}
                            </ExpandButton>
                          )}
                        </Td>
                      )}
                      <Td
                        clickable={enableDrilldown}
                        onContextMenu={e => {
                          e.preventDefault();
                          handleDrilldown(product, e);
                        }}
                      >
                        <strong>{product.productName}</strong>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {product.productLine}
                        </div>
                      </Td>
                      <Td>
                        <StatusBadge
                          bgColor={statusConfig.bgColor}
                          textColor={statusConfig.color}
                        >
                          {statusConfig.label}
                        </StatusBadge>
                      </Td>
                      <Td style={{ textTransform: 'capitalize' }}>
                        {product.licenseType}
                      </Td>
                      <Td>
                        {formatNumber(product.activeUsers30d)} / {formatNumber(product.licensedUsers)}
                        <TrendIndicator trend={product.usageTrend}>
                          {getTrendArrow(product.usageTrend)}
                        </TrendIndicator>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ProgressBar
                            width={product.activeUsersPercentage}
                            color={
                              product.activeUsersPercentage < 30
                                ? '#ff4d4f'
                                : product.activeUsersPercentage < 70
                                ? '#faad14'
                                : '#52c41a'
                            }
                          />
                          <span>{formatPercent(product.activeUsersPercentage)}</span>
                        </div>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ProgressBar
                            width={product.featureAdoptionScore}
                            color={adoptionConfig.color}
                          />
                          <span style={{ color: adoptionConfig.color }}>
                            {adoptionConfig.label}
                          </span>
                        </div>
                      </Td>
                      <Td>{formatNumber(product.totalLogins30d)}</Td>
                      <Td>{formatDuration(product.avgSessionDurationMinutes)}</Td>
                      <Td style={{ fontWeight: 500, color: '#1890ff' }}>
                        {formatCurrency(product.arrContribution)}
                      </Td>
                      <Td>
                        {product.daysUntilExpiry <= 30 ? (
                          <span style={{ color: '#ff4d4f' }}>
                            {product.daysUntilExpiry}d
                          </span>
                        ) : product.daysUntilExpiry <= 90 ? (
                          <span style={{ color: '#faad14' }}>
                            {product.daysUntilExpiry}d
                          </span>
                        ) : (
                          <span>{product.daysUntilExpiry}d</span>
                        )}
                      </Td>
                    </tr>
                    {/* Feature breakdown rows */}
                    {isExpanded &&
                      productFeatures.map(feature => (
                        <FeatureRow key={`${product.productLine}-${feature.featureName}`}>
                          <FeatureCell />
                          <FeatureCell colSpan={2}>
                            {feature.isPremiumFeature && '⭐ '}
                            {feature.featureName}
                            <span style={{ marginLeft: 8, color: '#999' }}>
                              ({feature.featureCategory})
                            </span>
                          </FeatureCell>
                          <FeatureCell />
                          <FeatureCell>
                            {formatNumber(feature.uniqueUsers30d)} users
                          </FeatureCell>
                          <FeatureCell>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <ProgressBar
                                width={feature.usagePercentage}
                                color="#1890ff"
                              />
                              <span>{formatPercent(feature.usagePercentage)}</span>
                            </div>
                          </FeatureCell>
                          <FeatureCell colSpan={2} />
                          <FeatureCell>
                            {formatNumber(feature.usageCount30d)} uses
                          </FeatureCell>
                          <FeatureCell colSpan={2} />
                        </FeatureRow>
                      ))}
                  </>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      </ChartSection>
    </Container>
  );
};

export default SM24CustomerProductUsageViz;
