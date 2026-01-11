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
import { useState, useEffect, useRef, MouseEvent, useMemo } from 'react';
import { t, computeMaxFontSize } from '@superset-ui/core';
import { styled, useTheme } from '@apache-superset/core/ui';
import {
  SM24BigNumberProVizProps,
  ComparisonColorScheme,
  getTrendColor,
} from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

const PROPORTION = {
  METRIC_NAME: 0.08,
  HEADER: 0.3,
  SUBTITLE: 0.06,
  COMPARISON: 0.06,
  PROGRESS_BAR: 0.05,
};

// Default formatter
const defaultFormatter = (value: number) => String(value);

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ComparisonDisplayProps {
  comparisonData: SM24BigNumberProVizProps['comparisonData'];
  comparisonLabel?: string;
  showPreviousValue?: boolean;
  showAbsoluteDifference?: boolean;
  showPercentDifference?: boolean;
  comparisonColorEnabled?: boolean;
  comparisonColorScheme?: 'green_up' | 'red_up';
  formatter: (value: number) => string;
  fontSize: number;
}

function ComparisonDisplay({
  comparisonData,
  comparisonLabel,
  showPreviousValue,
  showAbsoluteDifference,
  showPercentDifference,
  comparisonColorEnabled,
  comparisonColorScheme,
  formatter,
  fontSize,
}: ComparisonDisplayProps) {
  const theme = useTheme();

  if (!comparisonData) return null;

  const { previousValue, absoluteDifference, percentDifference, trend } =
    comparisonData;

  const trendColor = comparisonColorEnabled
    ? getTrendColor(
        trend,
        comparisonColorScheme === 'green_up'
          ? ComparisonColorScheme.GreenUp
          : ComparisonColorScheme.RedUp,
        {
          colorSuccess: theme.colors.success.base,
          colorError: theme.colors.error.base,
          colorTextTertiary: theme.colors.text.label,
        },
      )
    : theme.colors.text.label;

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  const formatPercent = (val: number | null) => {
    if (val === null) return '-';
    const percent = Math.abs(val * 100);
    return `${percent.toFixed(1)}%`;
  };

  return (
    <div
      className="sm24-bignumber__comparison"
      style={{ fontSize: `${fontSize}px` }}
    >
      {showPercentDifference && percentDifference !== null && (
        <span
          className="sm24-bignumber__comparison-percent"
          style={{ color: trendColor }}
        >
          <span className="sm24-bignumber__trend-icon">{trendIcon}</span>
          {formatPercent(percentDifference)}
        </span>
      )}
      {showAbsoluteDifference && absoluteDifference !== null && (
        <span
          className="sm24-bignumber__comparison-absolute"
          style={{ color: trendColor }}
        >
          {absoluteDifference >= 0 ? '+' : ''}
          {formatter(absoluteDifference)}
        </span>
      )}
      {showPreviousValue && previousValue !== null && (
        <span className="sm24-bignumber__comparison-previous">
          # {formatter(previousValue)}
        </span>
      )}
      {comparisonLabel && (
        <span className="sm24-bignumber__comparison-label">
          {comparisonLabel}
        </span>
      )}
    </div>
  );
}

interface ProgressBarProps {
  config: SM24BigNumberProVizProps['progressBarConfig'];
  progress?: number;
  formatter: (value: number) => string;
  currentValue?: number | null;
}

function ProgressBar({
  config,
  progress,
  formatter,
  currentValue,
}: ProgressBarProps) {
  if (!config?.enabled) return null;

  const {
    targetValue,
    showTarget,
    showPercentage,
    colorBelowTarget,
    colorAboveTarget,
    height,
  } = config;
  const clampedProgress = Math.min(Math.max(progress || 0, 0), 100);
  const isAboveTarget = clampedProgress >= 100;
  const barColor = isAboveTarget ? colorAboveTarget : colorBelowTarget;

  return (
    <div className="sm24-bignumber__progress-container">
      <div
        className="sm24-bignumber__progress-bar"
        style={{ height: `${height || 8}px` }}
      >
        <div
          className="sm24-bignumber__progress-fill"
          style={{
            width: `${Math.min(clampedProgress, 100)}%`,
            backgroundColor: barColor,
          }}
        />
        {clampedProgress > 100 && (
          <div
            className="sm24-bignumber__progress-overflow"
            style={{ backgroundColor: colorAboveTarget }}
          />
        )}
      </div>
      <div className="sm24-bignumber__progress-labels">
        {showPercentage && (
          <span className="sm24-bignumber__progress-percent">
            {clampedProgress.toFixed(1)}%
          </span>
        )}
        {showTarget && (
          <span className="sm24-bignumber__progress-target">
            {t('Target')}: {formatter(targetValue)}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function SM24BigNumberProViz({
  className = '',
  width,
  height,
  bigNumber,
  metricName = '',
  showMetricName = true,
  subtitle = '',
  headerFontSize = PROPORTION.HEADER,
  subtitleFontSize = PROPORTION.SUBTITLE,
  metricNameFontSize = PROPORTION.METRIC_NAME,
  headerFormatter = defaultFormatter,
  numberColor,
  colorThresholdFormatters,
  comparisonData,
  comparisonLabel,
  comparisonColorEnabled,
  comparisonColorScheme,
  showPreviousValue,
  showAbsoluteDifference,
  showPercentDifference,
  progressBarConfig,
  currentProgress,
  animationEnabled = true,
  onContextMenu,
}: SM24BigNumberProVizProps) {
  const theme = useTheme();

  // Animation state
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<number | null>(null);

  // Animate number changes
  useEffect(() => {
    if (!animationEnabled || bigNumber === null) {
      setDisplayValue(bigNumber as number | null);
      return;
    }

    const targetValue = bigNumber as number;
    const startValue = prevValueRef.current ?? targetValue;

    if (startValue === targetValue) {
      setDisplayValue(targetValue);
      return;
    }

    setIsAnimating(true);
    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue =
        startValue + (targetValue - startValue) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        prevValueRef.current = targetValue;
      }
    };

    requestAnimationFrame(animate);
  }, [bigNumber, animationEnabled]);

  // Create temporary container for font size calculation
  const createTemporaryContainer = () => {
    const container = document.createElement('div');
    container.className = `sm24-bignumber ${className}`;
    container.style.position = 'absolute';
    container.style.opacity = '0';
    return container;
  };

  // Get color based on conditional formatting thresholds
  const getNumberColor = (): string => {
    if (
      Array.isArray(colorThresholdFormatters) &&
      colorThresholdFormatters.length > 0 &&
      bigNumber !== null &&
      typeof bigNumber === 'number'
    ) {
      for (const formatter of colorThresholdFormatters) {
        const formatterResult = formatter.getColorFromValue(bigNumber);
        if (formatterResult) {
          return formatterResult;
        }
      }
    }
    return numberColor || theme.colors.text.label;
  };

  // Calculate available height for each section
  const availableHeight = useMemo(() => {
    const hasComparison =
      comparisonData &&
      (showPreviousValue || showAbsoluteDifference || showPercentDifference);
    const hasProgress = progressBarConfig?.enabled;

    return {
      metricName: showMetricName ? metricNameFontSize * height : 0,
      header: headerFontSize * height,
      subtitle: subtitle ? subtitleFontSize * height : 0,
      comparison: hasComparison ? PROPORTION.COMPARISON * height : 0,
      progress: hasProgress ? PROPORTION.PROGRESS_BAR * height : 0,
    };
  }, [
    height,
    showMetricName,
    metricNameFontSize,
    headerFontSize,
    subtitle,
    subtitleFontSize,
    comparisonData,
    progressBarConfig,
  ]);

  // Render metric name
  const renderMetricName = () => {
    if (!showMetricName || !metricName) return null;

    const container = createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text: metricName,
      maxWidth: width * 0.95,
      maxHeight: availableHeight.metricName,
      className: 'sm24-bignumber__metric-name',
      container,
    });
    container.remove();

    return (
      <div className="sm24-bignumber__metric-name" style={{ fontSize }}>
        {metricName}
      </div>
    );
  };

  // Render the main KPI number
  const renderHeader = () => {
    const value = displayValue ?? bigNumber;
    const text =
      value === null ? t('No data') : headerFormatter(value as number);

    const container = createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: width * 0.95,
      maxHeight: availableHeight.header,
      className: 'sm24-bignumber__header',
      container,
    });
    container.remove();

    const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
      if (onContextMenu) {
        e.preventDefault();
        onContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY);
      }
    };

    return (
      <div
        className={`sm24-bignumber__header ${isAnimating ? 'sm24-bignumber__header--animating' : ''}`}
        style={{
          fontSize,
          color: getNumberColor(),
        }}
        onContextMenu={handleContextMenu}
      >
        {text}
      </div>
    );
  };

  // Render subtitle
  const renderSubtitle = () => {
    if (!subtitle) return null;

    const container = createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text: subtitle,
      maxWidth: width * 0.95,
      maxHeight: availableHeight.subtitle,
      className: 'sm24-bignumber__subtitle',
      container,
    });
    container.remove();

    return (
      <div className="sm24-bignumber__subtitle" style={{ fontSize }}>
        {subtitle}
      </div>
    );
  };

  // Render comparison section
  const renderComparison = () => {
    if (!comparisonData) return null;
    if (!showPreviousValue && !showAbsoluteDifference && !showPercentDifference)
      return null;

    return (
      <ComparisonDisplay
        comparisonData={comparisonData}
        comparisonLabel={comparisonLabel}
        showPreviousValue={showPreviousValue}
        showAbsoluteDifference={showAbsoluteDifference}
        showPercentDifference={showPercentDifference}
        comparisonColorEnabled={comparisonColorEnabled}
        comparisonColorScheme={comparisonColorScheme}
        formatter={headerFormatter}
        fontSize={Math.min(availableHeight.comparison, 20)}
      />
    );
  };

  // Render progress bar
  const renderProgressBar = () => {
    if (!progressBarConfig?.enabled) return null;

    return (
      <ProgressBar
        config={progressBarConfig}
        progress={currentProgress}
        formatter={headerFormatter}
        currentValue={bigNumber as number}
      />
    );
  };

  return (
    <div className={`sm24-bignumber ${className}`} style={{ height, width }}>
      <div className="sm24-bignumber__container">
        {renderMetricName()}
        {renderHeader()}
        {renderComparison()}
        {renderSubtitle()}
        {renderProgressBar()}
      </div>
    </div>
  );
}

// =============================================================================
// STYLED COMPONENT
// =============================================================================

const StyledSM24BigNumberProViz = styled(SM24BigNumberProViz)`
  ${({ theme }) => `
    font-family: ${theme.fontFamily};
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${theme.gridUnit * 2}px;
    overflow: hidden;

    .sm24-bignumber__container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      text-align: center;
      gap: ${theme.gridUnit}px;
    }

    .sm24-bignumber__metric-name {
      color: ${theme.colors.text.label};
      font-weight: 400;
      line-height: 1.2;
      text-transform: none;
      letter-spacing: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .sm24-bignumber__header {
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
      transition: color 0.2s ease;
    }

    .sm24-bignumber__header--animating {
      transition: none;
    }

    .sm24-bignumber__subtitle {
      color: ${theme.colors.text.label};
      font-weight: 400;
      line-height: 1.3;
    }

    /* Comparison styles */
    .sm24-bignumber__comparison {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: ${theme.gridUnit * 2}px;
      color: ${theme.colors.text.label};
      margin-top: ${theme.gridUnit}px;
    }

    .sm24-bignumber__comparison-percent {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: ${theme.gridUnit / 2}px;
    }

    .sm24-bignumber__trend-icon {
      font-size: 1.1em;
    }

    .sm24-bignumber__comparison-absolute {
      font-weight: 500;
    }

    .sm24-bignumber__comparison-previous {
      color: ${theme.colors.text.label};
      opacity: 0.8;
    }

    .sm24-bignumber__comparison-label {
      color: ${theme.colors.text.label};
      font-size: 0.85em;
      opacity: 0.7;
    }

    /* Progress bar styles */
    .sm24-bignumber__progress-container {
      width: 100%;
      max-width: 200px;
      margin-top: ${theme.gridUnit * 2}px;
    }

    .sm24-bignumber__progress-bar {
      width: 100%;
      background: ${theme.colors.grayscale.light3};
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .sm24-bignumber__progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease-out;
    }

    .sm24-bignumber__progress-overflow {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      animation: pulse 1s ease-in-out infinite;
    }

    .sm24-bignumber__progress-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: ${theme.gridUnit / 2}px;
      font-size: 11px;
      color: ${theme.colors.text.label};
    }

    .sm24-bignumber__progress-percent {
      font-weight: 600;
    }

    .sm24-bignumber__progress-target {
      opacity: 0.7;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes countUp {
      from { opacity: 0.5; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sm24-bignumber__header--updated {
      animation: countUp 0.3s ease-out;
    }
  `}
`;

export default StyledSM24BigNumberProViz;
