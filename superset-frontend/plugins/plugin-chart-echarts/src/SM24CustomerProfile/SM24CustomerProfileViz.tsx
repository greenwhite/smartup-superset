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
import { useCallback, useState, MouseEvent } from 'react';
import { BinaryQueryObjectFilterClause } from '@superset-ui/core';
import { styled } from '@apache-superset/core/ui';
import {
  SM24CustomerProfileVizProps,
  ProfileTab,
  ProfileAlert,
  PROFILE_COLORS,
  HEALTH_STATUS_CONFIG,
  CHURN_RISK_CONFIG,
  NPS_CATEGORY_CONFIG,
  SEGMENT_CONFIG,
  TAB_CONFIG,
  ACTIVITY_TYPE_CONFIG,
} from './types';

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const Container = styled.div<{ height: number }>`
  display: flex;
  flex-direction: column;
  height: ${({ height }) => height}px;
  font-family: ${({ theme }) =>
    theme.typography?.families?.sansSerif ||
    'Inter, Helvetica, Arial, sans-serif'};
  background: ${PROFILE_COLORS.background};
  border-radius: 8px;
  overflow: hidden;
`;

const Header = styled.div`
  background: ${PROFILE_COLORS.cardBackground};
  border-bottom: 1px solid ${PROFILE_COLORS.borderColor};
  padding: 16px 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CustomerName = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const Badge = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: ${({ color }) => color}15;
  color: ${({ color }) => color};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid
    ${({ variant }) =>
      variant === 'primary'
        ? PROFILE_COLORS.primary
        : variant === 'danger'
          ? PROFILE_COLORS.danger
          : PROFILE_COLORS.borderColor};
  background: ${({ variant }) =>
    variant === 'primary'
      ? PROFILE_COLORS.primary
      : PROFILE_COLORS.cardBackground};
  color: ${({ variant, theme }) =>
    variant === 'primary'
      ? theme.colors.grayscale.light5
      : variant === 'danger'
        ? PROFILE_COLORS.danger
        : theme.colors.grayscale.dark2};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    background: ${({ variant }) =>
      variant === 'primary'
        ? PROFILE_COLORS.primaryDark
        : variant === 'danger'
          ? PROFILE_COLORS.danger + '10'
          : PROFILE_COLORS.background};
  }
`;

const QuickStats = styled.div`
  display: flex;
  gap: 24px;
`;

const QuickStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QuickStatValue = styled.span`
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const QuickStatLabel = styled.span`
  font-size: 11px;
  color: ${PROFILE_COLORS.neutral};
  text-transform: uppercase;
`;

const CSMCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: ${PROFILE_COLORS.background};
  border-radius: 8px;
`;

const CSMAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${PROFILE_COLORS.primary};
  color: ${({ theme }) => theme.colors.grayscale.light5};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
`;

const CSMInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CSMName = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const CSMRole = styled.span`
  font-size: 11px;
  color: ${PROFILE_COLORS.neutral};
`;

const AlertBanner = styled.div<{
  type: 'danger' | 'warning' | 'info' | 'success';
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: ${({ type }) =>
    type === 'danger'
      ? PROFILE_COLORS.danger + '15'
      : type === 'warning'
        ? PROFILE_COLORS.warning + '15'
        : type === 'success'
          ? PROFILE_COLORS.success + '15'
          : PROFILE_COLORS.info + '15'};
  border-left: 4px solid
    ${({ type }) =>
      type === 'danger'
        ? PROFILE_COLORS.danger
        : type === 'warning'
          ? PROFILE_COLORS.warning
          : type === 'success'
            ? PROFILE_COLORS.success
            : PROFILE_COLORS.info};
`;

const AlertContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AlertTitle = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const AlertMessage = styled.span`
  color: ${({ theme }) => theme.colors.grayscale.base};
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 4px;
  padding: 0 24px;
  background: ${PROFILE_COLORS.cardBackground};
  border-bottom: 1px solid ${PROFILE_COLORS.borderColor};
`;

const TabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${({ active }) => (active ? PROFILE_COLORS.primary : '#666')};
  font-size: 13px;
  font-weight: ${({ active }) => (active ? '600' : '500')};
  cursor: pointer;
  border-bottom: 2px solid
    ${({ active }) => (active ? PROFILE_COLORS.primary : 'transparent')};
  transition: all 0.2s;

  &:hover {
    color: ${PROFILE_COLORS.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  padding: 24px;
`;

const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 4}, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const Card = styled.div<{ span?: number }>`
  background: ${PROFILE_COLORS.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  padding: ${({ theme }) => theme.gridUnit * 5}px;
  box-shadow: 0 1px 3px ${({ theme }) => theme.colors.grayscale.light2};
  grid-column: span ${({ span }) => span || 1};
`;

const CardTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.gridUnit * 4}px 0;
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  margin-bottom: ${({ theme }) => theme.gridUnit}px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: ${PROFILE_COLORS.neutral};
  margin-bottom: 8px;
`;

const MetricSubtext = styled.div<{ color?: string }>`
  font-size: 13px;
  font-weight: 500;
  color: ${({ color }) => color || '#666'};
`;

const HealthCircle = styled.div<{ score: number; color: string }>`
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
      ${({ color }) => color} ${({ score }) => score * 3.6}deg,
      ${({ theme }) => theme.colors.grayscale.light3}
        ${({ score }) => score * 3.6}deg
    );
  }

  &::after {
    content: '${({ score }) => score}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.grayscale.light5};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    color: ${({ color }) => color};
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 11px;
  color: ${PROFILE_COLORS.neutral};
  text-transform: uppercase;
`;

const InfoValue = styled.span<{ clickable?: boolean }>`
  font-size: 14px;
  color: ${({ clickable }) => (clickable ? PROFILE_COLORS.primary : '#2c3e50')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};

  &:hover {
    text-decoration: ${({ clickable }) => (clickable ? 'underline' : 'none')};
  }
`;

const ProductPill = styled.span<{ color: string }>`
  display: inline-flex;
  padding: 4px 10px;
  background: ${({ color }) => color}15;
  color: ${({ color }) => color};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 6px;
  margin-bottom: 6px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${PROFILE_COLORS.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.span`
  font-size: 20px;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

const ActivityDate = styled.div`
  font-size: 11px;
  color: ${PROFILE_COLORS.neutral};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: ${PROFILE_COLORS.neutral};
`;

const EmptyIcon = styled.span`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.span`
  font-size: 14px;
`;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function SM24CustomerProfileViz({
  height,
  profile,
  loading,
  error,
  defaultTab,
  showAlerts,
  showQuickActions,
  visibleTabs,
  showFinancialData,
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeDate,
  enableDrilldown,
  onTabChange,
  onDrilldown,
  onQuickAction,
  onClose,
  onContextMenu,
  formData,
}: SM24CustomerProfileVizProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(defaultTab);

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: ProfileTab) => {
      setActiveTab(tab);
      onTabChange?.(tab);
    },
    [onTabChange],
  );

  // Handle drilldown
  const handleDrilldown = useCallback(
    (target: string, filters?: Record<string, unknown>) => {
      if (enableDrilldown && onDrilldown) {
        onDrilldown(target, filters || {});
      }
    },
    [enableDrilldown, onDrilldown],
  );

  // Handle context menu for Superset drilldown
  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!onContextMenu || !profile) return;

      event.preventDefault();
      event.stopPropagation();

      const drillToDetailFilters: BinaryQueryObjectFilterClause[] = [];

      if (formData.customerIdColumn) {
        drillToDetailFilters.push({
          col: formData.customerIdColumn,
          op: '==',
          val: profile.customer.customerId,
          formattedVal: profile.customer.customerId,
        });
      }

      onContextMenu(event.clientX, event.clientY, {
        drillToDetail: drillToDetailFilters,
      });
    },
    [onContextMenu, formData, profile],
  );

  // Render loading state
  if (loading) {
    return (
      <Container height={height}>
        <EmptyState>
          <EmptyIcon>⏳</EmptyIcon>
          <EmptyText>Loading customer profile...</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container height={height}>
        <EmptyState>
          <EmptyIcon>❌</EmptyIcon>
          <EmptyText>{error}</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  // Render empty state
  if (!profile) {
    return (
      <Container height={height}>
        <EmptyState>
          <EmptyIcon>👤</EmptyIcon>
          <EmptyText>No customer data available</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  const {
    customer,
    csm,
    revenue,
    products,
    health,
    renewal,
    activity,
    alerts,
    segment,
  } = profile;

  // Get CSM initials for avatar
  const csmInitials = csm.csmName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Render alert banners
  const renderAlerts = () => {
    if (!showAlerts || alerts.length === 0) return null;

    return alerts.map((alert: ProfileAlert, index: number) => (
      <AlertBanner key={index} type={alert.type}>
        <AlertContent>
          <AlertTitle>
            {alert.type === 'danger' && '⚠️'}
            {alert.type === 'warning' && '⏰'}
            {alert.type === 'info' && 'ℹ️'}
            {alert.type === 'success' && '✅'} {alert.title}
          </AlertTitle>
          <AlertMessage>{alert.message}</AlertMessage>
        </AlertContent>
        {alert.actionLabel && (
          <ActionButton
            variant="secondary"
            onClick={() => handleDrilldown(alert.actionTarget || '')}
          >
            {alert.actionLabel}
          </ActionButton>
        )}
      </AlertBanner>
    ));
  };

  // Render Overview tab content
  const renderOverviewTab = () => (
    <>
      {/* Key Metrics */}
      <Grid columns={4}>
        <MetricCard>
          <MetricLabel>Current ARR</MetricLabel>
          <MetricValue>
            {showFinancialData ? formatCurrency(revenue.currentArr) : '***'}
          </MetricValue>
          <MetricSubtext
            color={
              revenue.arrGrowthMom !== null && revenue.arrGrowthMom > 0
                ? PROFILE_COLORS.success
                : revenue.arrGrowthMom !== null && revenue.arrGrowthMom < 0
                  ? PROFILE_COLORS.danger
                  : undefined
            }
          >
            {revenue.arrGrowthMom !== null && revenue.arrGrowthMom > 0 && '↑'}
            {revenue.arrGrowthMom !== null && revenue.arrGrowthMom < 0 && '↓'}
            {showFinancialData
              ? formatPercent(revenue.arrGrowthMom)
              : '***'}{' '}
            MoM
          </MetricSubtext>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Health Score</MetricLabel>
          <HealthCircle
            score={health.healthScore}
            color={HEALTH_STATUS_CONFIG[health.healthStatus].color}
          />
          <Badge color={HEALTH_STATUS_CONFIG[health.healthStatus].color}>
            {HEALTH_STATUS_CONFIG[health.healthStatus].label}
          </Badge>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Products Active</MetricLabel>
          <MetricValue>{products.productCount}</MetricValue>
          <div style={{ marginTop: 8 }}>
            {products.activeProducts.slice(0, 3).map((product, idx) => (
              <ProductPill key={idx} color={PROFILE_COLORS.primary}>
                {product}
              </ProductPill>
            ))}
            {products.productCount > 3 && (
              <ProductPill color={PROFILE_COLORS.neutral}>
                +{products.productCount - 3}
              </ProductPill>
            )}
          </div>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Days to Renewal</MetricLabel>
          <MetricValue
            style={{
              color:
                renewal.daysToRenewal < 30
                  ? PROFILE_COLORS.danger
                  : renewal.daysToRenewal < 60
                    ? PROFILE_COLORS.warning
                    : undefined,
            }}
          >
            {renewal.daysToRenewal}
          </MetricValue>
          <MetricSubtext>
            {renewal.renewalDate ? formatDate(renewal.renewalDate) : '—'}
          </MetricSubtext>
        </MetricCard>
      </Grid>

      {/* Company & Contact Info */}
      <Grid columns={2}>
        <Card>
          <CardTitle>Company Information</CardTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Industry</InfoLabel>
              <InfoValue>{customer.industry}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Region</InfoLabel>
              <InfoValue>{customer.region}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Company Type</InfoLabel>
              <InfoValue>{customer.companyType || '—'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Employees</InfoLabel>
              <InfoValue>
                {customer.employeeCount
                  ? customer.employeeCount.toLocaleString()
                  : '—'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Website</InfoLabel>
              <InfoValue clickable={!!customer.website}>
                {customer.website ? (
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 {customer.website}
                  </a>
                ) : (
                  '—'
                )}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Customer Since</InfoLabel>
              <InfoValue>
                {customer.customerSince
                  ? `${formatDate(customer.customerSince)} (${Math.floor(customer.customerAgeDays / 365)}y)`
                  : '—'}
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </Card>

        <Card>
          <CardTitle>Contact Information</CardTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Phone</InfoLabel>
              <InfoValue clickable={!!customer.phone}>
                {customer.phone ? `📞 ${customer.phone}` : '—'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Email</InfoLabel>
              <InfoValue clickable={!!customer.email}>
                {customer.email ? `✉️ ${customer.email}` : '—'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>City</InfoLabel>
              <InfoValue>{customer.city || '—'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Address</InfoLabel>
              <InfoValue>{customer.address || '—'}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Card>
      </Grid>

      {/* Revenue Summary */}
      {showFinancialData && (
        <Card span={2}>
          <CardTitle>Revenue Summary</CardTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Lifetime Value</InfoLabel>
              <InfoValue>{formatCurrency(revenue.ltv)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Total Paid</InfoLabel>
              <InfoValue>{formatCurrency(revenue.totalPaid)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Total Invoices</InfoLabel>
              <InfoValue>{revenue.totalInvoices}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Avg Payment Delay</InfoLabel>
              <InfoValue
                style={{
                  color:
                    revenue.avgPaymentDelay > 7
                      ? PROFILE_COLORS.danger
                      : revenue.avgPaymentDelay > 3
                        ? PROFILE_COLORS.warning
                        : undefined,
                }}
              >
                {revenue.avgPaymentDelay.toFixed(1)} days
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </Card>
      )}

      {/* Health & Activity */}
      <Grid columns={2}>
        <Card>
          <CardTitle>Health & Risk Indicators</CardTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>NPS Score</InfoLabel>
              <InfoValue>
                {health.npsScore !== null ? (
                  <>
                    {health.npsScore}
                    {health.npsCategory && (
                      <Badge
                        color={NPS_CATEGORY_CONFIG[health.npsCategory].color}
                        style={{ marginLeft: 8 }}
                      >
                        {NPS_CATEGORY_CONFIG[health.npsCategory].label}
                      </Badge>
                    )}
                  </>
                ) : (
                  '—'
                )}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>CSAT Score</InfoLabel>
              <InfoValue>
                {health.csatScore !== null
                  ? `${health.csatScore.toFixed(1)}/5.0 ⭐`
                  : '—'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Churn Risk</InfoLabel>
              <InfoValue>
                <Badge
                  color={CHURN_RISK_CONFIG[health.churnRiskCategory].color}
                >
                  {CHURN_RISK_CONFIG[health.churnRiskCategory].label}
                </Badge>
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Support Tickets (30d)</InfoLabel>
              <InfoValue>{health.supportTicketCount30d}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Card>

        <Card>
          <CardTitle>Recent Activity</CardTitle>
          {profile.recentActivities.length > 0 ? (
            profile.recentActivities.slice(0, 5).map((activityItem, idx) => (
              <ActivityItem key={idx}>
                <ActivityIcon>
                  {ACTIVITY_TYPE_CONFIG[activityItem.type].icon}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activityItem.title}</ActivityTitle>
                  <ActivityDate>
                    {formatRelativeDate(activityItem.date)}
                  </ActivityDate>
                </ActivityContent>
              </ActivityItem>
            ))
          ) : (
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Total Interactions (90d)</InfoLabel>
                <InfoValue>{activity.totalInteractions}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Last Interaction</InfoLabel>
                <InfoValue>
                  {activity.lastInteractionDate
                    ? formatRelativeDate(activity.lastInteractionDate)
                    : '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Meetings</InfoLabel>
                <InfoValue>{activity.meetingsCount}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Calls</InfoLabel>
                <InfoValue>{activity.callsCount}</InfoValue>
              </InfoItem>
            </InfoGrid>
          )}
        </Card>
      </Grid>
    </>
  );

  // Render placeholder for other tabs
  const renderPlaceholderTab = (tabName: string) => (
    <EmptyState>
      <EmptyIcon>🚧</EmptyIcon>
      <EmptyText>{tabName} tab - Coming soon</EmptyText>
    </EmptyState>
  );

  return (
    <Container height={height} onContextMenu={handleContextMenu}>
      {/* Header */}
      <Header>
        <HeaderRow>
          <HeaderLeft>
            <CustomerName>{customer.customerName}</CustomerName>
            <Badge color={SEGMENT_CONFIG[segment].color}>
              {SEGMENT_CONFIG[segment].label}
            </Badge>
            <Badge color={PROFILE_COLORS.neutral}>{customer.industry}</Badge>
            <Badge color={PROFILE_COLORS.neutral}>{customer.region}</Badge>
          </HeaderLeft>
          <HeaderRight>
            {showQuickActions && (
              <>
                <ActionButton
                  onClick={() => onQuickAction?.('scheduleMeeting')}
                >
                  📅 Schedule Meeting
                </ActionButton>
                <ActionButton onClick={() => onQuickAction?.('sendEmail')}>
                  ✉️ Send Email
                </ActionButton>
                <ActionButton onClick={() => onQuickAction?.('logActivity')}>
                  📝 Log Activity
                </ActionButton>
              </>
            )}
            {onClose && <ActionButton onClick={onClose}>✕</ActionButton>}
          </HeaderRight>
        </HeaderRow>
        <HeaderRow>
          <QuickStats>
            <QuickStat>
              <QuickStatValue>
                {showFinancialData ? formatCurrency(revenue.currentArr) : '***'}
              </QuickStatValue>
              <QuickStatLabel>Current ARR</QuickStatLabel>
            </QuickStat>
            <QuickStat>
              <QuickStatValue
                style={{
                  color: HEALTH_STATUS_CONFIG[health.healthStatus].color,
                }}
              >
                {health.healthScore}
              </QuickStatValue>
              <QuickStatLabel>Health Score</QuickStatLabel>
            </QuickStat>
            <QuickStat>
              <QuickStatValue>{products.productCount}</QuickStatValue>
              <QuickStatLabel>Products</QuickStatLabel>
            </QuickStat>
            <QuickStat>
              <QuickStatValue
                style={{
                  color:
                    renewal.daysToRenewal < 30
                      ? PROFILE_COLORS.danger
                      : undefined,
                }}
              >
                {renewal.daysToRenewal}d
              </QuickStatValue>
              <QuickStatLabel>To Renewal</QuickStatLabel>
            </QuickStat>
          </QuickStats>
          <CSMCard>
            <CSMAvatar>{csmInitials}</CSMAvatar>
            <CSMInfo>
              <CSMName>{csm.csmName}</CSMName>
              <CSMRole>Customer Success Manager</CSMRole>
            </CSMInfo>
          </CSMCard>
        </HeaderRow>
      </Header>

      {/* Alerts */}
      {renderAlerts()}

      {/* Tab Navigation */}
      <TabNavigation>
        {visibleTabs.map(tab => (
          <TabButton
            key={tab}
            active={activeTab === tab}
            onClick={() => handleTabChange(tab)}
          >
            {TAB_CONFIG[tab].icon} {TAB_CONFIG[tab].label}
          </TabButton>
        ))}
      </TabNavigation>

      {/* Content */}
      <Content>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'products' && renderPlaceholderTab('Products & Usage')}
        {activeTab === 'revenue' && renderPlaceholderTab('Revenue History')}
        {activeTab === 'health' && renderPlaceholderTab('Health & Risk')}
        {activeTab === 'activity' && renderPlaceholderTab('Activity Timeline')}
        {activeTab === 'contacts' && renderPlaceholderTab('Contacts')}
        {activeTab === 'documents' && renderPlaceholderTab('Documents')}
      </Content>
    </Container>
  );
}

export default SM24CustomerProfileViz;
