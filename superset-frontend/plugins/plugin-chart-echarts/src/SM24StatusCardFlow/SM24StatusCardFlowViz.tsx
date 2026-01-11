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
import { useCallback, useMemo, useRef } from 'react';
import { styled } from '@apache-superset/core/ui';
import {
  SM24StatusCardFlowVizProps,
  StatusData,
  EntityType,
  ENTITY_TYPE_DEFINITIONS,
  getTintedBackground,
} from './types';

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const Container = styled.div<{ height: number }>`
  display: flex;
  flex-direction: column;
  height: ${({ height }) => height}px;
  font-family: ${({ theme }) => theme.typography.families.sansSerif};
  background: ${({ theme }) => theme.colors.grayscale.light5};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  padding: ${({ theme }) => theme.gridUnit * 5}px
    ${({ theme }) => theme.gridUnit * 6}px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.grayscale.light2};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light3};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.grayscale.light5};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grayscale.light4};
    border-color: ${({ theme }) => theme.colors.grayscale.light2};
  }
`;

const EntityTypeSelect = styled.select`
  padding: ${({ theme }) => theme.gridUnit * 1.5}px
    ${({ theme }) => theme.gridUnit * 3}px;
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  background: ${({ theme }) => theme.colors.grayscale.light5};
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const CardsContainer = styled.div<{ maxCards: number }>`
  display: flex;
  gap: ${({ theme }) => theme.gridUnit * 4}px;
  flex: 1;
  overflow-x: auto;
  padding: ${({ theme }) => theme.gridUnit}px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.grayscale.light4};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: 3px;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 140px;
`;

const Arrow = styled.div`
  color: ${({ theme }) => theme.colors.grayscale.light2};
  font-size: ${({ theme }) => theme.typography.sizes.xl}px;
  margin: 0 -4px;
  flex-shrink: 0;
`;

const StatusCard = styled.div<{
  borderColor: string;
  bgTint: string;
  borderRadius: number;
  clickable: boolean;
}>`
  flex: 1;
  min-width: 130px;
  background: ${({ bgTint }) => bgTint};
  border: 2px solid ${({ borderColor }) => borderColor};
  border-radius: ${({ borderRadius }) => borderRadius}px;
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  position: relative;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.grayscale.light2};

  &:hover {
    transform: ${({ clickable }) => (clickable ? 'translateY(-2px)' : 'none')};
    box-shadow: ${({ clickable, theme }) =>
      clickable
        ? `0 4px 12px ${theme.colors.grayscale.light1}`
        : `0 2px 4px ${theme.colors.grayscale.light2}`};
  }
`;

const StatusBadge = styled.div<{ bgColor: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.gridUnit}px
    ${({ theme }) => theme.gridUnit * 3}px;
  background: ${({ bgColor }) => bgColor};
  color: ${({ theme }) => theme.colors.grayscale.light5};
  border-radius: 16px;
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
`;

const PercentageBadge = styled.div<{ borderColor: string }>`
  position: absolute;
  top: ${({ theme }) => theme.gridUnit * 3}px;
  right: ${({ theme }) => theme.gridUnit * 3}px;
  padding: 2px ${({ theme }) => theme.gridUnit * 2}px;
  background: ${({ theme }) => theme.colors.grayscale.light5};
  border: 1px solid ${({ borderColor }) => borderColor};
  border-radius: 10px;
  font-size: ${({ theme }) => theme.typography.sizes.xs}px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

const MainMetric = styled.div`
  font-size: 36px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark2};
  line-height: 1.1;
  margin-bottom: ${({ theme }) => theme.gridUnit}px;
`;

const MetricLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
`;

const AmountRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AmountValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.grayscale.dark1};
  line-height: 1.2;
`;

const AmountLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  color: ${({ theme }) => theme.colors.grayscale.light1};
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.grayscale.light1};
  font-size: ${({ theme }) => theme.typography.sizes.m}px;
  text-align: center;
  gap: ${({ theme }) => theme.gridUnit * 2}px;
`;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function SM24StatusCardFlowViz({
  className = '',
  width,
  height,
  statuses,
  entityType,
  entityTypeDef,
  showAmounts,
  showPercentages,
  showArrows,
  maxCardsPerRow,
  formatCount,
  formatAmount,
  formatPercent,
  enableDrilldown,
  enableEntityTypeSwitch,
  onDrilldown,
  onEntityTypeChange,
  onRefresh,
}: SM24StatusCardFlowVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle card click
  const handleCardClick = useCallback(
    (status: StatusData) => {
      if (enableDrilldown && onDrilldown) {
        onDrilldown(status.statusId, status.statusName);
      }
    },
    [enableDrilldown, onDrilldown],
  );

  // Handle entity type change
  const handleEntityTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as EntityType;
      if (onEntityTypeChange) {
        onEntityTypeChange(newType);
      }
    },
    [onEntityTypeChange],
  );

  // Get title based on entity type
  const title = useMemo(() => {
    return `Статусы ${entityTypeDef.labelGenitive}`;
  }, [entityTypeDef]);

  // Render status cards
  const renderCards = useMemo(() => {
    if (statuses.length === 0) {
      return (
        <EmptyState>
          <span style={{ fontSize: 32 }}>📊</span>
          <span>Нет данных за выбранный период</span>
          <span style={{ fontSize: 12 }}>
            Измените фильтры для отображения данных
          </span>
        </EmptyState>
      );
    }

    return statuses.map((status, index) => {
      const bgTint = getTintedBackground(status.statusColor, 0.05);
      const formattedAmount = showAmounts
        ? formatAmount(status.totalAmount)
        : null;

      return (
        <CardWrapper key={status.statusId}>
          <StatusCard
            borderColor={status.statusColor}
            bgTint={bgTint}
            borderRadius={12}
            clickable={enableDrilldown}
            onClick={() => handleCardClick(status)}
            title={`${status.statusName}: ${status.entityCount} ${entityTypeDef.labelGenitive}`}
          >
            {/* Percentage badge */}
            {showPercentages && (
              <PercentageBadge borderColor={status.statusColor}>
                {formatPercent(status.percentageOfTotal)}
              </PercentageBadge>
            )}

            {/* Status badge */}
            <StatusBadge bgColor={status.statusColor}>
              {status.statusName}
            </StatusBadge>

            {/* Main count */}
            <MainMetric>{formatCount(status.entityCount)}</MainMetric>
            <MetricLabel>{entityTypeDef.labelGenitive}</MetricLabel>

            {/* Amount (if applicable) */}
            {formattedAmount && status.totalAmount >= 1000 && (
              <AmountRow>
                <AmountValue>
                  {formatAmount(status.totalAmount)
                    .split(' ')
                    .slice(0, 2)
                    .join(' ')}
                </AmountValue>
                <AmountLabel>
                  {formatAmount(status.totalAmount)
                    .split(' ')
                    .slice(2)
                    .join(' ') || 'сум'}
                </AmountLabel>
              </AmountRow>
            )}
          </StatusCard>

          {/* Arrow between cards */}
          {showArrows && index < statuses.length - 1 && <Arrow>→</Arrow>}
        </CardWrapper>
      );
    });
  }, [
    statuses,
    entityTypeDef,
    showAmounts,
    showPercentages,
    showArrows,
    formatCount,
    formatAmount,
    formatPercent,
    enableDrilldown,
    handleCardClick,
  ]);

  return (
    <Container
      ref={containerRef}
      className={`sm24-status-funnel ${className}`}
      height={height}
    >
      {/* Header */}
      <Header>
        <Title>{title}</Title>

        <HeaderActions>
          {/* Entity type selector */}
          {enableEntityTypeSwitch && (
            <EntityTypeSelect
              value={entityType}
              onChange={handleEntityTypeChange}
            >
              {Object.values(ENTITY_TYPE_DEFINITIONS).map(def => (
                <option key={def.id} value={def.id}>
                  {def.icon} {def.labelPlural}
                </option>
              ))}
            </EntityTypeSelect>
          )}

          {/* Action buttons */}
          <IconButton onClick={onRefresh} title="Обновить">
            ⟳
          </IconButton>
          <IconButton title="Информация">ⓘ</IconButton>
          <IconButton title="Закрыть">✕</IconButton>
        </HeaderActions>
      </Header>

      {/* Status cards */}
      <CardsContainer maxCards={maxCardsPerRow}>{renderCards}</CardsContainer>
    </Container>
  );
}

export default SM24StatusCardFlowViz;
