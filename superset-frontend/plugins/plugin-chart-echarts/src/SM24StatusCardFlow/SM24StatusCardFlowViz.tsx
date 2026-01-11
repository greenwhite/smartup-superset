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
import { styled } from '@superset-ui/core';
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
  font-family: ${({ theme }) =>
    theme.typography?.families?.sansSerif ||
    'Inter, Helvetica, Arial, sans-serif'};
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
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
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }
`;

const EntityTypeSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  background: #fff;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #3498db;
  }
`;

const CardsContainer = styled.div<{ maxCards: number }>`
  display: flex;
  gap: 16px;
  flex: 1;
  overflow-x: auto;
  padding: 4px;

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

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 140px;
`;

const Arrow = styled.div`
  color: #bdc3c7;
  font-size: 20px;
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
  padding: 16px;
  position: relative;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: ${({ clickable }) => (clickable ? 'translateY(-2px)' : 'none')};
    box-shadow: ${({ clickable }) =>
      clickable
        ? '0 4px 12px rgba(0, 0, 0, 0.15)'
        : '0 2px 4px rgba(0, 0, 0, 0.08)'};
  }
`;

const StatusBadge = styled.div<{ bgColor: string }>`
  display: inline-block;
  padding: 4px 12px;
  background: ${({ bgColor }) => bgColor};
  color: #fff;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const PercentageBadge = styled.div<{ borderColor: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${({ borderColor }) => borderColor};
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  color: #666;
`;

const MainMetric = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.1;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 12px;
`;

const AmountRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AmountValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #34495e;
  line-height: 1.2;
`;

const AmountLabel = styled.div`
  font-size: 12px;
  color: #95a5a6;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #95a5a6;
  font-size: 14px;
  text-align: center;
  gap: 8px;
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
