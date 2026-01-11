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
import { useCallback, useMemo, useState, MouseEvent } from 'react';
import {
  styled,
  BinaryQueryObjectFilterClause,
  useTheme,
  css,
} from '@superset-ui/core';
import {
  SM24TopCustomersVizProps,
  CustomerData,
  HEALTH_COLORS,
  SEGMENT_COLORS,
  getProductColor,
  formatDaysAgo,
} from './types';

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const Container = styled.div<{ height: number }>`
  ${({ height, theme }) => css`
    display: flex;
    flex-direction: column;
    height: ${height}px;
    font-family: ${theme.typography.families.sansSerif};
    background: ${theme.colors.grayscale.light5};
    border-radius: ${theme.borderRadius}px;
    overflow: hidden;
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.gridUnit * 3}px ${theme.gridUnit * 4}px;
    border-bottom: 1px solid ${theme.colors.grayscale.light3};
    background: ${theme.colors.grayscale.light4};
  `}
`;

const SearchBox = styled.input`
  ${({ theme }) => css`
    padding: ${theme.gridUnit * 2}px ${theme.gridUnit * 3}px;
    border: 1px solid ${theme.colors.grayscale.light2};
    border-radius: ${theme.borderRadius}px;
    width: 250px;
    font-size: ${theme.typography.sizes.s}px;
    outline: none;

    &:focus {
      border-color: ${theme.colors.primary.base};
      box-shadow: 0 0 0 2px ${theme.colors.primary.light2};
    }
  `}
`;

const AlertBadge = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: ${({ color }) => color}15;
  color: ${({ color }) => color};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th<{ sortable?: boolean; width?: number }>`
  ${({ sortable, width, theme }) => css`
    position: sticky;
    top: 0;
    background: ${theme.colors.grayscale.light4};
    padding: ${theme.gridUnit * 2.5}px ${theme.gridUnit * 3}px;
    text-align: left;
    font-weight: ${theme.typography.weights.bold};
    color: ${theme.colors.grayscale.dark2};
    border-bottom: 2px solid ${theme.colors.grayscale.light3};
    white-space: nowrap;
    cursor: ${sortable ? 'pointer' : 'default'};
    width: ${width ? `${width}px` : 'auto'};
    user-select: none;

    &:hover {
      background: ${sortable
        ? theme.colors.grayscale.light3
        : theme.colors.grayscale.light4};
    }
  `}
`;

const Tr = styled.tr<{
  isAtRisk?: boolean;
  isRenewalUrgent?: boolean;
  isTopTen?: boolean;
}>`
  ${({ isRenewalUrgent, isAtRisk, theme }) => css`
    background: ${isRenewalUrgent
      ? theme.colors.warning.light2
      : theme.colors.grayscale.light5};
    border-bottom: 1px solid ${theme.colors.grayscale.light3};

    &:hover {
      background: ${theme.colors.grayscale.light4};
    }

    ${isAtRisk &&
    css`
      .customer-name {
        font-weight: ${theme.typography.weights.bold};
      }
    `}
  `}
`;

const Td = styled.td<{ align?: 'left' | 'center' | 'right' }>`
  padding: 10px 12px;
  text-align: ${({ align }) => align || 'left'};
  vertical-align: middle;
`;

const CustomerNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StarIcon = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.warning.base};
    font-size: ${theme.typography.sizes.m}px;
  `}
`;

const CustomerLink = styled.span<{ clickable?: boolean }>`
  ${({ clickable, theme }) => css`
    color: ${clickable
      ? theme.colors.primary.base
      : theme.colors.grayscale.dark2};
    cursor: ${clickable ? 'pointer' : 'default'};
    font-weight: ${theme.typography.weights.medium};

    &:hover {
      text-decoration: ${clickable ? 'underline' : 'none'};
    }
  `}
`;

const SegmentBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 6px;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 6px;
`;

const GrowthCell = styled.span<{ positive?: boolean; negative?: boolean }>`
  ${({ positive, negative, theme }) => css`
    color: ${positive
      ? theme.colors.success.base
      : negative
        ? theme.colors.error.base
        : theme.colors.grayscale.base};
    font-weight: ${theme.typography.weights.medium};
  `}
`;

const ProductPill = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  margin-right: 4px;
  margin-bottom: 2px;
`;

const RegionCell = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HealthBar = styled.div<{ score: number; color: string }>`
  ${({ score, color, theme }) => css`
    width: 60px;
    height: 8px;
    background: ${theme.colors.grayscale.light3};
    border-radius: ${theme.borderRadius}px;
    overflow: hidden;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: ${score}%;
      background: ${color};
      border-radius: ${theme.borderRadius}px;
    }
  `}
`;

const HealthCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RenewalCell = styled.div<{ urgent?: boolean; upcoming?: boolean }>`
  ${({ urgent, upcoming, theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.gridUnit}px;
    color: ${urgent
      ? theme.colors.error.base
      : upcoming
        ? theme.colors.warning.base
        : theme.colors.grayscale.dark2};
    font-weight: ${urgent
      ? theme.typography.weights.bold
      : theme.typography.weights.normal};
  `}
`;

const ActivityCell = styled.div<{ alert?: boolean }>`
  ${({ alert, theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.gridUnit}px;
    color: ${alert ? theme.colors.error.base : theme.colors.grayscale.dark2};
  `}
`;

const NpsBadge = styled.span<{ score: number }>`
  ${({ score, theme }) => {
    const npsColor =
      score >= 50
        ? theme.colors.success.base
        : score >= 0
          ? theme.colors.warning.base
          : theme.colors.error.base;
    return css`
      display: inline-block;
      padding: 2px ${theme.gridUnit * 2}px;
      border-radius: 10px;
      font-size: ${theme.typography.sizes.xs}px;
      font-weight: ${theme.typography.weights.bold};
      background: ${npsColor}20;
      color: ${npsColor};
    `;
  }}
`;

const Footer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.gridUnit * 3}px ${theme.gridUnit * 4}px;
    border-top: 1px solid ${theme.colors.grayscale.light3};
    background: ${theme.colors.grayscale.light4};
    font-size: ${theme.typography.sizes.s}px;
    color: ${theme.colors.grayscale.base};
  `}
`;

const FooterStats = styled.div`
  display: flex;
  gap: 24px;
`;

const FooterStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FooterStatLabel = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.grayscale.light1};
    font-size: ${theme.typography.sizes.xs}px;
    text-transform: uppercase;
  `}
`;

const FooterStatValue = styled.span<{ color?: string }>`
  ${({ color, theme }) => css`
    font-weight: ${theme.typography.weights.bold};
    font-size: ${theme.typography.sizes.m}px;
    color: ${color || theme.colors.grayscale.dark2};
  `}
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  ${({ theme }) => css`
    padding: ${theme.gridUnit * 1.5}px ${theme.gridUnit * 3}px;
    border: 1px solid ${theme.colors.grayscale.light2};
    background: ${theme.colors.grayscale.light5};
    border-radius: ${theme.borderRadius}px;
    font-size: ${theme.typography.sizes.xs}px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${theme.gridUnit}px;

    &:hover {
      background: ${theme.colors.grayscale.light4};
      border-color: ${theme.colors.grayscale.light1};
    }
  `}
`;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function SM24TopCustomersViz({
  className = '',
  width: _width,
  height,
  customers,
  summary,
  columns: _columns,
  enableSearch,
  showFooterSummary,
  showConcentrationAlert,
  highlightAtRisk,
  highlightTopTen,
  highlightUrgentRenewals,
  formatCurrency,
  formatPercent,
  formatTenure,
  enableDrilldown,
  enableQuickActions,
  enableExport,
  onDrilldown,
  onContextMenu,
  formData,
}: SM24TopCustomersVizProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('totalArr');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter customers by search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      c =>
        c.customerName.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query),
    );
  }, [customers, searchQuery]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortColumn) {
        case 'totalArr':
          aVal = a.totalArr;
          bVal = b.totalArr;
          break;
        case 'arrGrowthMom':
          aVal = a.arrGrowthMom ?? 0;
          bVal = b.arrGrowthMom ?? 0;
          break;
        case 'healthScore':
          aVal = a.healthScore;
          bVal = b.healthScore;
          break;
        case 'renewalDate':
          aVal = a.daysUntilRenewal;
          bVal = b.daysUntilRenewal;
          break;
        case 'customerName':
          aVal = a.customerName;
          bVal = b.customerName;
          break;
        case 'tenure':
          aVal = a.tenureMonths;
          bVal = b.tenureMonths;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filteredCustomers, sortColumn, sortDirection]);

  // Handle sort click
  const handleSort = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('desc');
      }
    },
    [sortColumn],
  );

  // Handle customer click
  const handleCustomerClick = useCallback(
    (customer: CustomerData) => {
      if (enableDrilldown && onDrilldown) {
        onDrilldown(customer.customerId, 'SM24-CustomerProfile');
      }
    },
    [enableDrilldown, onDrilldown],
  );

  // Handle context menu for Superset drilldown
  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLTableRowElement>, customer: CustomerData) => {
      if (!onContextMenu) return;

      event.preventDefault();
      event.stopPropagation();

      // Build drillToDetail filters
      const drillToDetailFilters: BinaryQueryObjectFilterClause[] = [];

      // Add customer ID filter if column is configured
      if (formData.customerIdColumn) {
        drillToDetailFilters.push({
          col: formData.customerIdColumn,
          op: '==',
          val: customer.customerId,
          formattedVal: customer.customerId,
        });
      }

      // Add customer name filter
      if (formData.customerNameColumn) {
        drillToDetailFilters.push({
          col: formData.customerNameColumn,
          op: '==',
          val: customer.customerName,
          formattedVal: customer.customerName,
        });
      }

      // Build drillBy filters for groupby columns
      const groupby = formData.groupby || [];
      const drillByFilters: BinaryQueryObjectFilterClause[] = [];

      if (groupby.length > 0) {
        if (
          formData.customerIdColumn &&
          groupby.includes(formData.customerIdColumn)
        ) {
          drillByFilters.push({
            col: formData.customerIdColumn,
            op: '==',
            val: customer.customerId,
          });
        }
        if (
          formData.industryColumn &&
          groupby.includes(formData.industryColumn)
        ) {
          drillByFilters.push({
            col: formData.industryColumn,
            op: '==',
            val: customer.industry,
          });
        }
        if (formData.regionColumn && groupby.includes(formData.regionColumn)) {
          drillByFilters.push({
            col: formData.regionColumn,
            op: '==',
            val: customer.region,
          });
        }
      }

      onContextMenu(event.clientX, event.clientY, {
        drillToDetail: drillToDetailFilters,
        drillBy:
          groupby.length > 0
            ? {
                filters: drillByFilters,
                groupbyFieldName: 'groupby',
              }
            : undefined,
      });
    },
    [onContextMenu, formData],
  );

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <Container className={`sm24-top-customers ${className}`} height={height}>
      {/* Header */}
      <Header>
        {enableSearch && (
          <SearchBox
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        )}

        {showConcentrationAlert && (
          <AlertBadge color={theme.colors.error.base}>
            ⚠️ High Concentration: Top 10 ={' '}
            {summary.topTenConcentration.toFixed(1)}% of ARR
          </AlertBadge>
        )}

        {summary.criticalRenewals > 0 && (
          <AlertBadge color={theme.colors.error.base}>
            🔴 {summary.criticalRenewals} Critical Renewals
          </AlertBadge>
        )}

        {summary.upcomingRenewals > 0 && (
          <AlertBadge color={theme.colors.warning.base}>
            🟡 {summary.upcomingRenewals} Upcoming Renewals
          </AlertBadge>
        )}
      </Header>

      {/* Table */}
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th width={50}>#</Th>
              <Th sortable onClick={() => handleSort('customerName')}>
                Customer{renderSortIndicator('customerName')}
              </Th>
              <Th sortable width={120} onClick={() => handleSort('totalArr')}>
                ARR{renderSortIndicator('totalArr')}
              </Th>
              <Th
                sortable
                width={90}
                onClick={() => handleSort('arrGrowthMom')}
              >
                MoM{renderSortIndicator('arrGrowthMom')}
              </Th>
              <Th width={180}>Products</Th>
              <Th width={120}>Industry</Th>
              <Th width={120}>Region</Th>
              <Th sortable width={100} onClick={() => handleSort('tenure')}>
                Tenure{renderSortIndicator('tenure')}
              </Th>
              <Th
                sortable
                width={120}
                onClick={() => handleSort('healthScore')}
              >
                Health{renderSortIndicator('healthScore')}
              </Th>
              <Th
                sortable
                width={110}
                onClick={() => handleSort('renewalDate')}
              >
                Renewal{renderSortIndicator('renewalDate')}
              </Th>
              <Th width={120}>CSM</Th>
              <Th width={100}>Activity</Th>
              <Th width={70}>NPS</Th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.map(customer => (
              <Tr
                key={customer.customerId}
                isAtRisk={highlightAtRisk && customer.isAtRisk}
                isRenewalUrgent={
                  highlightUrgentRenewals && customer.isRenewalUrgent
                }
                isTopTen={highlightTopTen && customer.isTopTen}
                onContextMenu={e => handleContextMenu(e, customer)}
              >
                <Td align="center">{customer.rank}</Td>
                <Td>
                  <CustomerNameCell>
                    {highlightTopTen && customer.isTopTen && (
                      <StarIcon>⭐</StarIcon>
                    )}
                    <CustomerLink
                      className="customer-name"
                      clickable={enableDrilldown}
                      onClick={() => handleCustomerClick(customer)}
                    >
                      {customer.customerName}
                    </CustomerLink>
                    <SegmentBadge color={SEGMENT_COLORS[customer.segment]}>
                      {customer.segment.toUpperCase()}
                    </SegmentBadge>
                    {customer.isExpansionCandidate && (
                      <span title="Expansion Candidate">🟢</span>
                    )}
                    {customer.isDisengaged && (
                      <span title="Disengaged">🚩</span>
                    )}
                  </CustomerNameCell>
                </Td>
                <Td align="right">
                  <strong>{formatCurrency(customer.totalArr)}</strong>
                </Td>
                <Td align="right">
                  <GrowthCell
                    positive={
                      customer.arrGrowthMom !== null &&
                      customer.arrGrowthMom > 0
                    }
                    negative={
                      customer.arrGrowthMom !== null &&
                      customer.arrGrowthMom < 0
                    }
                  >
                    {customer.arrGrowthMom !== null &&
                      customer.arrGrowthMom > 0 &&
                      '↑'}
                    {customer.arrGrowthMom !== null &&
                      customer.arrGrowthMom < 0 &&
                      '↓'}
                    {formatPercent(customer.arrGrowthMom)}
                  </GrowthCell>
                </Td>
                <Td>
                  {customer.products.map(product => (
                    <ProductPill key={product} color={getProductColor(product)}>
                      {product}
                    </ProductPill>
                  ))}
                </Td>
                <Td>{customer.industry}</Td>
                <Td>
                  <RegionCell>
                    <span>{customer.regionFlag}</span>
                    {customer.region}
                  </RegionCell>
                </Td>
                <Td>{formatTenure(customer.tenureMonths)}</Td>
                <Td>
                  <HealthCell>
                    <HealthBar
                      score={customer.healthScore}
                      color={HEALTH_COLORS[customer.healthLevel]}
                    />
                    <span>{customer.healthScore}</span>
                  </HealthCell>
                </Td>
                <Td>
                  <RenewalCell
                    urgent={customer.daysUntilRenewal < 30}
                    upcoming={customer.daysUntilRenewal < 90}
                  >
                    {customer.daysUntilRenewal < 0
                      ? 'Overdue'
                      : `${customer.daysUntilRenewal}d`}
                  </RenewalCell>
                </Td>
                <Td>{customer.accountManager || '—'}</Td>
                <Td>
                  <ActivityCell alert={customer.daysSinceActivity > 30}>
                    {customer.daysSinceActivity > 30 && '🔴'}
                    {formatDaysAgo(customer.daysSinceActivity)}
                  </ActivityCell>
                </Td>
                <Td align="center">
                  {customer.npsScore !== null ? (
                    <NpsBadge score={customer.npsScore}>
                      {customer.npsScore}
                    </NpsBadge>
                  ) : (
                    '—'
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      {/* Footer */}
      {showFooterSummary && (
        <Footer>
          <FooterStats>
            <FooterStat>
              <FooterStatLabel>Total ARR</FooterStatLabel>
              <FooterStatValue>
                {formatCurrency(summary.totalARR)}
              </FooterStatValue>
            </FooterStat>
            <FooterStat>
              <FooterStatLabel>Customers</FooterStatLabel>
              <FooterStatValue>{summary.totalCustomers}</FooterStatValue>
            </FooterStat>
            <FooterStat>
              <FooterStatLabel>Avg Health</FooterStatLabel>
              <FooterStatValue
                color={
                  summary.averageHealthScore >= 80
                    ? theme.colors.success.base
                    : summary.averageHealthScore >= 60
                      ? theme.colors.warning.base
                      : theme.colors.error.base
                }
              >
                {summary.averageHealthScore.toFixed(0)}
              </FooterStatValue>
            </FooterStat>
            <FooterStat>
              <FooterStatLabel>At Risk</FooterStatLabel>
              <FooterStatValue
                color={
                  summary.customersAtRisk > 0
                    ? theme.colors.error.base
                    : theme.colors.success.base
                }
              >
                {summary.customersAtRisk}
              </FooterStatValue>
            </FooterStat>
          </FooterStats>

          {enableQuickActions && (
            <QuickActions>
              {enableExport && <ActionButton>📥 Export</ActionButton>}
              <ActionButton>📋 Copy</ActionButton>
            </QuickActions>
          )}
        </Footer>
      )}
    </Container>
  );
}

export default SM24TopCustomersViz;
