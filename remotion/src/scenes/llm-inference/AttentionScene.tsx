/**
 * Scene 4: Understanding Attention - Step-by-Step Breakdown
 *
 * Educational visualization of the attention mechanism with:
 * - Sequential Q, K, V vector reveals
 * - Animated matrix multiplication (Q × K^T)
 * - Scaling step visualization (÷ √d_k)
 * - Softmax probability distribution animation
 * - Weighted sum with V visualization
 * - Color coding: Q=blue, K=orange, V=green, Scores=purple
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { COLORS as STYLE_COLORS, getSceneIndicatorStyle, getSceneIndicatorTextStyle } from "./styles";

interface AttentionSceneProps {
  startFrame?: number;
  durationFrames?: number;
}

const COLORS = {
  background: "#0f0f1a",
  query: "#00d9ff", // Cyan/Blue for Query
  key: "#ff6b35", // Orange for Key
  value: "#00ff88", // Green for Value
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  attention: "#9b59b6", // Purple for attention scores
  output: "#ffd700", // Gold for weighted output
  arrow: "#ffffff",
  stepBg: "#1a1a2e",
};

// Step label component for educational clarity
const StepLabel: React.FC<{
  step: number;
  label: string;
  opacity: number;
  scale: number;
  color?: string;
}> = ({ step, label, opacity, scale, color = COLORS.text }) => (
  <div
    style={{
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 12 * scale,
      backgroundColor: `${COLORS.stepBg}`,
      padding: `${12 * scale}px ${20 * scale}px`,
      borderRadius: 8 * scale,
      border: `2px solid ${color}40`,
    }}
  >
    <div
      style={{
        width: 36 * scale,
        height: 36 * scale,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20 * scale,
        fontWeight: 700,
        color: "#000",
      }}
    >
      {step}
    </div>
    <span
      style={{
        fontSize: 28 * scale,
        fontWeight: 600,
        color: color,
      }}
    >
      {label}
    </span>
  </div>
);

// Vector component with larger, more readable fonts
const VectorDisplay: React.FC<{
  label: string;
  fullLabel: string;
  color: string;
  opacity: number;
  values: number[];
  scale: number;
  animationProgress?: number;
}> = ({ label, fullLabel, color, opacity, values, scale, animationProgress = 1 }) => {
  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8 * scale,
      }}
    >
      {/* Label badge with full name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
        <div
          style={{
            width: 56 * scale,
            height: 48 * scale,
            backgroundColor: color,
            borderRadius: 8 * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32 * scale,
            fontWeight: 700,
            color: "#000",
          }}
        >
          {label}
        </div>
        <span
          style={{
            fontSize: 28 * scale,
            fontWeight: 600,
            color: color,
          }}
        >
          {fullLabel}
        </span>
      </div>

      {/* Vector visualization */}
      <div
        style={{
          display: "flex",
          gap: 4 * scale,
          padding: 8 * scale,
          backgroundColor: `${color}15`,
          borderRadius: 8 * scale,
          border: `2px solid ${color}40`,
        }}
      >
        {values.map((val, idx) => {
          const cellOpacity = interpolate(
            animationProgress,
            [idx / values.length, (idx + 1) / values.length],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={idx}
              style={{
                width: 52 * scale,
                height: 52 * scale,
                backgroundColor: `${color}${Math.floor(val * 99).toString(16).padStart(2, '0')}`,
                borderRadius: 4 * scale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22 * scale,
                color: val > 0.5 ? "#000" : color,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                opacity: cellOpacity,
                transform: `scale(${0.5 + cellOpacity * 0.5})`,
              }}
            >
              {val.toFixed(1)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Matrix multiplication visualization
const MatrixMultiplication: React.FC<{
  opacity: number;
  progress: number;
  scale: number;
}> = ({ opacity, progress, scale }) => {
  const qValues = [0.7, 0.4, 0.9, 0.5];
  const kValues = [0.5, 0.8, 0.3, 0.6];

  // Animated dot product calculation
  const dotProductProgress = interpolate(progress, [0, 1], [0, 4], {
    extrapolateRight: "clamp",
  });

  const currentStep = Math.floor(dotProductProgress);
  const stepProgress = dotProductProgress - currentStep;

  // Calculate running sum for visualization
  let runningSum = 0;
  for (let i = 0; i < currentStep; i++) {
    runningSum += qValues[i] * kValues[i];
  }
  if (currentStep < 4) {
    runningSum += qValues[currentStep] * kValues[currentStep] * stepProgress;
  }

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16 * scale,
      }}
    >
      {/* Matrix multiplication visual */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16 * scale,
        }}
      >
        {/* Q vector */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4 * scale,
            padding: 8 * scale,
            backgroundColor: `${COLORS.query}15`,
            borderRadius: 8 * scale,
            border: `2px solid ${COLORS.query}40`,
          }}
        >
          {qValues.map((val, idx) => (
            <div
              key={idx}
              style={{
                width: 48 * scale,
                height: 36 * scale,
                backgroundColor: idx <= currentStep ? `${COLORS.query}${Math.floor(val * 99).toString(16).padStart(2, '0')}` : `${COLORS.query}20`,
                borderRadius: 4 * scale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20 * scale,
                color: idx <= currentStep ? (val > 0.5 ? "#000" : COLORS.query) : COLORS.query,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                transform: idx === currentStep ? `scale(${1 + stepProgress * 0.2})` : "scale(1)",
                boxShadow: idx === currentStep ? `0 0 ${20 * scale}px ${COLORS.query}80` : "none",
              }}
            >
              {val.toFixed(1)}
            </div>
          ))}
        </div>

        {/* Multiplication symbol */}
        <span
          style={{
            fontSize: 40 * scale,
            color: COLORS.text,
            fontWeight: 300,
          }}
        >
          ×
        </span>

        {/* K^T vector (horizontal) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4 * scale,
            padding: 8 * scale,
            backgroundColor: `${COLORS.key}15`,
            borderRadius: 8 * scale,
            border: `2px solid ${COLORS.key}40`,
          }}
        >
          {kValues.map((val, idx) => (
            <div
              key={idx}
              style={{
                width: 48 * scale,
                height: 36 * scale,
                backgroundColor: idx <= currentStep ? `${COLORS.key}${Math.floor(val * 99).toString(16).padStart(2, '0')}` : `${COLORS.key}20`,
                borderRadius: 4 * scale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20 * scale,
                color: idx <= currentStep ? (val > 0.5 ? "#000" : COLORS.key) : COLORS.key,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                transform: idx === currentStep ? `scale(${1 + stepProgress * 0.2})` : "scale(1)",
                boxShadow: idx === currentStep ? `0 0 ${20 * scale}px ${COLORS.key}80` : "none",
              }}
            >
              {val.toFixed(1)}
            </div>
          ))}
        </div>

        {/* Equals symbol */}
        <span
          style={{
            fontSize: 40 * scale,
            color: COLORS.text,
            fontWeight: 300,
          }}
        >
          =
        </span>

        {/* Result */}
        <div
          style={{
            width: 80 * scale,
            height: 60 * scale,
            backgroundColor: `${COLORS.attention}30`,
            borderRadius: 8 * scale,
            border: `2px solid ${COLORS.attention}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28 * scale,
            color: COLORS.attention,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 700,
          }}
        >
          {runningSum.toFixed(2)}
        </div>
      </div>

      {/* Calculation breakdown */}
      <div
        style={{
          display: "flex",
          gap: 8 * scale,
          fontSize: 24 * scale,
          fontFamily: "JetBrains Mono, monospace",
          color: COLORS.textDim,
        }}
      >
        {qValues.map((q, idx) => {
          const k = kValues[idx];
          const isActive = idx <= currentStep;
          const isCurrent = idx === currentStep;
          return (
            <React.Fragment key={idx}>
              <span
                style={{
                  color: isActive ? COLORS.text : COLORS.textDim,
                  opacity: isActive ? 1 : 0.4,
                  fontWeight: isCurrent ? 700 : 400,
                  textDecoration: isCurrent ? "underline" : "none",
                }}
              >
                {q.toFixed(1)}×{k.toFixed(1)}
              </span>
              {idx < qValues.length - 1 && <span>+</span>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Scaling step visualization
const ScalingStep: React.FC<{
  opacity: number;
  progress: number;
  scale: number;
  rawScore: number;
}> = ({ opacity, progress, scale, rawScore }) => {
  const scalingFactor = Math.sqrt(4); // d_k = 4 (dimension)
  const scaledScore = rawScore / scalingFactor;

  const currentValue = interpolate(progress, [0, 1], [rawScore, scaledScore], {
    extrapolateRight: "clamp",
  });

  const divisionSymbolScale = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1.2, 1.2, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16 * scale,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20 * scale,
        }}
      >
        {/* Raw score */}
        <div
          style={{
            width: 100 * scale,
            height: 70 * scale,
            backgroundColor: `${COLORS.attention}30`,
            borderRadius: 8 * scale,
            border: `2px solid ${COLORS.attention}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32 * scale,
            color: COLORS.attention,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 700,
          }}
        >
          {rawScore.toFixed(2)}
        </div>

        {/* Division symbol with animation */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${divisionSymbolScale})`,
          }}
        >
          <span
            style={{
              fontSize: 48 * scale,
              color: COLORS.text,
              fontWeight: 300,
              lineHeight: 0.8,
            }}
          >
            ÷
          </span>
        </div>

        {/* sqrt(d_k) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: `${12 * scale}px ${16 * scale}px`,
            backgroundColor: `${COLORS.attention}20`,
            borderRadius: 8 * scale,
            border: `2px solid ${COLORS.attention}40`,
            transform: `scale(${divisionSymbolScale})`,
          }}
        >
          <span
            style={{
              fontSize: 32 * scale,
              fontFamily: "JetBrains Mono, monospace",
              color: COLORS.attention,
              fontWeight: 600,
            }}
          >
            √d<sub style={{ fontSize: 20 * scale }}>k</sub>
          </span>
          <span
            style={{
              fontSize: 24 * scale,
              color: COLORS.textDim,
            }}
          >
            = {scalingFactor.toFixed(1)}
          </span>
        </div>

        {/* Equals */}
        <span
          style={{
            fontSize: 40 * scale,
            color: COLORS.text,
            fontWeight: 300,
          }}
        >
          =
        </span>

        {/* Scaled result */}
        <div
          style={{
            width: 100 * scale,
            height: 70 * scale,
            backgroundColor: `${COLORS.attention}50`,
            borderRadius: 8 * scale,
            border: `3px solid ${COLORS.attention}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32 * scale,
            color: COLORS.text,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 700,
            boxShadow: progress > 0.5 ? `0 0 ${30 * scale}px ${COLORS.attention}60` : "none",
          }}
        >
          {currentValue.toFixed(2)}
        </div>
      </div>

      {/* Explanation */}
      <div
        style={{
          fontSize: 22 * scale,
          color: COLORS.textDim,
          textAlign: "center",
          maxWidth: 500 * scale,
        }}
      >
        Scaling prevents extreme values, keeping gradients stable
      </div>
    </div>
  );
};

// Softmax visualization with bar animation
const SoftmaxStep: React.FC<{
  opacity: number;
  progress: number;
  scale: number;
}> = ({ opacity, progress, scale }) => {
  const rawScores = [1.2, 0.8, 0.5, 0.3];
  const expScores = rawScores.map(s => Math.exp(s));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probabilities = expScores.map(e => e / sumExp);

  const barHeight = 180 * scale;

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20 * scale,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 24 * scale,
          height: barHeight + 60 * scale,
        }}
      >
        {rawScores.map((raw, idx) => {
          const prob = probabilities[idx];
          // Animate from raw score height to probability height
          const rawHeight = (raw / 1.5) * barHeight * 0.5;
          const probHeight = prob * barHeight;

          const currentHeight = interpolate(
            progress,
            [0, 0.5, 1],
            [rawHeight, rawHeight, probHeight],
            { extrapolateRight: "clamp" }
          );

          const showProbability = progress > 0.5;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8 * scale,
              }}
            >
              {/* Probability label */}
              <span
                style={{
                  fontSize: 24 * scale,
                  fontFamily: "JetBrains Mono, monospace",
                  color: showProbability ? COLORS.text : COLORS.textDim,
                  fontWeight: 600,
                  opacity: showProbability ? 1 : 0.5,
                }}
              >
                {showProbability ? `${(prob * 100).toFixed(0)}%` : raw.toFixed(1)}
              </span>

              {/* Bar */}
              <div
                style={{
                  width: 60 * scale,
                  height: currentHeight,
                  backgroundColor: showProbability ? COLORS.attention : `${COLORS.attention}60`,
                  borderRadius: `${6 * scale}px ${6 * scale}px 0 0`,
                  transition: "background-color 0.3s",
                  boxShadow: showProbability ? `0 0 ${20 * scale}px ${COLORS.attention}40` : "none",
                }}
              />

              {/* Token label */}
              <span
                style={{
                  fontSize: 20 * scale,
                  color: COLORS.textDim,
                }}
              >
                t{idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Softmax formula */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12 * scale,
          padding: `${12 * scale}px ${20 * scale}px`,
          backgroundColor: `${COLORS.attention}15`,
          borderRadius: 8 * scale,
          border: `2px solid ${COLORS.attention}40`,
        }}
      >
        <span
          style={{
            fontSize: 28 * scale,
            fontFamily: "JetBrains Mono, monospace",
            color: COLORS.attention,
            fontWeight: 600,
          }}
        >
          softmax(x<sub style={{ fontSize: 18 * scale }}>i</sub>) = e<sup style={{ fontSize: 18 * scale }}>x<sub style={{ fontSize: 14 * scale }}>i</sub></sup> / Σe<sup style={{ fontSize: 18 * scale }}>x</sup>
        </span>
      </div>

      <div
        style={{
          fontSize: 22 * scale,
          color: COLORS.textDim,
        }}
      >
        Converts scores to probability distribution (sums to 100%)
      </div>
    </div>
  );
};

// Weighted sum visualization
const WeightedSumStep: React.FC<{
  opacity: number;
  progress: number;
  scale: number;
}> = ({ opacity, progress, scale }) => {
  const weights = [0.42, 0.28, 0.18, 0.12]; // Attention weights (sum to 1)
  const vValues = [
    [0.6, 0.5, 0.7, 0.4],
    [0.8, 0.3, 0.6, 0.5],
    [0.4, 0.9, 0.3, 0.7],
    [0.7, 0.4, 0.5, 0.8],
  ];

  // Calculate weighted output
  const output = [0, 0, 0, 0].map((_, dim) => {
    return weights.reduce((sum, w, i) => sum + w * vValues[i][dim], 0);
  });

  const arrowProgress = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const outputOpacity = interpolate(progress, [0.5, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20 * scale,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 30 * scale,
        }}
      >
        {/* Attention weights column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8 * scale,
          }}
        >
          <span
            style={{
              fontSize: 24 * scale,
              color: COLORS.attention,
              fontWeight: 600,
            }}
          >
            Weights
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4 * scale,
              padding: 8 * scale,
              backgroundColor: `${COLORS.attention}15`,
              borderRadius: 8 * scale,
              border: `2px solid ${COLORS.attention}40`,
            }}
          >
            {weights.map((w, idx) => (
              <div
                key={idx}
                style={{
                  width: 70 * scale,
                  height: 36 * scale,
                  backgroundColor: `${COLORS.attention}${Math.floor(w * 2 * 99).toString(16).padStart(2, '0')}`,
                  borderRadius: 4 * scale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20 * scale,
                  color: w > 0.3 ? "#000" : COLORS.attention,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600,
                }}
              >
                {(w * 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </div>

        {/* Multiplication symbol */}
        <span
          style={{
            fontSize: 40 * scale,
            color: COLORS.text,
            fontWeight: 300,
          }}
        >
          ×
        </span>

        {/* V values */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8 * scale,
          }}
        >
          <span
            style={{
              fontSize: 24 * scale,
              color: COLORS.value,
              fontWeight: 600,
            }}
          >
            V Values
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4 * scale,
              padding: 8 * scale,
              backgroundColor: `${COLORS.value}15`,
              borderRadius: 8 * scale,
              border: `2px solid ${COLORS.value}40`,
            }}
          >
            {vValues.map((row, idx) => (
              <div key={idx} style={{ display: "flex", gap: 4 * scale }}>
                {row.map((v, jdx) => (
                  <div
                    key={jdx}
                    style={{
                      width: 44 * scale,
                      height: 36 * scale,
                      backgroundColor: `${COLORS.value}${Math.floor(v * 99).toString(16).padStart(2, '0')}`,
                      borderRadius: 4 * scale,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18 * scale,
                      color: v > 0.5 ? "#000" : COLORS.value,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {v.toFixed(1)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            opacity: arrowProgress,
          }}
        >
          <svg width={60 * scale} height={40 * scale}>
            <defs>
              <marker
                id="arrowhead-output"
                markerWidth={10}
                markerHeight={7}
                refX={9}
                refY={3.5}
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.output} />
              </marker>
            </defs>
            <line
              x1={0}
              y1={20 * scale}
              x2={50 * scale}
              y2={20 * scale}
              stroke={COLORS.output}
              strokeWidth={3 * scale}
              markerEnd="url(#arrowhead-output)"
            />
          </svg>
        </div>

        {/* Output */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8 * scale,
            opacity: outputOpacity,
          }}
        >
          <span
            style={{
              fontSize: 24 * scale,
              color: COLORS.output,
              fontWeight: 600,
            }}
          >
            Output
          </span>
          <div
            style={{
              display: "flex",
              gap: 4 * scale,
              padding: 8 * scale,
              backgroundColor: `${COLORS.output}20`,
              borderRadius: 8 * scale,
              border: `3px solid ${COLORS.output}`,
              boxShadow: `0 0 ${30 * scale}px ${COLORS.output}40`,
            }}
          >
            {output.map((val, idx) => (
              <div
                key={idx}
                style={{
                  width: 52 * scale,
                  height: 52 * scale,
                  backgroundColor: `${COLORS.output}${Math.floor(val * 99).toString(16).padStart(2, '0')}`,
                  borderRadius: 4 * scale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22 * scale,
                  color: val > 0.5 ? "#000" : COLORS.output,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600,
                }}
              >
                {val.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formula */}
      <div
        style={{
          fontSize: 28 * scale,
          fontFamily: "JetBrains Mono, monospace",
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          gap: 8 * scale,
        }}
      >
        <span style={{ color: COLORS.output }}>Output</span>
        <span>=</span>
        <span>Σ(</span>
        <span style={{ color: COLORS.attention }}>attention</span>
        <span>×</span>
        <span style={{ color: COLORS.value }}>V</span>
        <span>)</span>
      </div>
    </div>
  );
};

export const AttentionScene: React.FC<AttentionSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Responsive scaling based on viewport size
  const scale = Math.min(width / 1920, height / 1080);

  // Phase timings - 6 distinct educational steps
  const step1End = Math.round(durationInFrames * 0.15); // Q vector
  const step2End = Math.round(durationInFrames * 0.28); // K vector
  const step3End = Math.round(durationInFrames * 0.40); // V vector
  const step4End = Math.round(durationInFrames * 0.55); // Q × K^T multiplication
  const step5End = Math.round(durationInFrames * 0.68); // Scaling step
  const step6End = Math.round(durationInFrames * 0.82); // Softmax
  const step7End = Math.round(durationInFrames * 1.00); // Weighted sum

  // Title animation
  const titleOpacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Step 1: Q vector appears
  const qProgress = interpolate(
    localFrame,
    [15, step1End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const qOpacity = interpolate(qProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Step 2: K vector appears
  const kProgress = interpolate(
    localFrame,
    [step1End, step2End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const kOpacity = interpolate(kProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Step 3: V vector appears
  const vProgress = interpolate(
    localFrame,
    [step2End, step3End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const vOpacity = interpolate(vProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Step 4: Matrix multiplication
  const multiplyProgress = interpolate(
    localFrame,
    [step3End, step4End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const multiplyOpacity = interpolate(multiplyProgress, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Step 5: Scaling
  const scaleProgress = interpolate(
    localFrame,
    [step4End, step5End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scaleOpacity = interpolate(scaleProgress, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Step 6: Softmax
  const softmaxProgress = interpolate(
    localFrame,
    [step5End, step6End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const softmaxOpacity = interpolate(softmaxProgress, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Step 7: Weighted sum
  const weightedProgress = interpolate(
    localFrame,
    [step6End, step7End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const weightedOpacity = interpolate(weightedProgress, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Determine current step for step label visibility
  const currentStep =
    localFrame < step1End ? 1 :
    localFrame < step2End ? 2 :
    localFrame < step3End ? 3 :
    localFrame < step4End ? 4 :
    localFrame < step5End ? 5 :
    localFrame < step6End ? 6 : 7;

  // Q, K, V sample values
  const qValues = [0.7, 0.4, 0.9, 0.5];
  const kValues = [0.5, 0.8, 0.3, 0.6];
  const vValues = [0.6, 0.5, 0.7, 0.4];

  // Calculate raw score for scaling step
  const rawScore = qValues.reduce((sum, q, i) => sum + q * kValues[i], 0);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Scene indicator */}
      <div style={{ ...getSceneIndicatorStyle(scale), opacity: titleOpacity }}>
        <span style={getSceneIndicatorTextStyle(scale)}>4</span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 30 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 48 * scale,
            fontWeight: 700,
            color: STYLE_COLORS.primary,
            margin: 0,
          }}
        >
          Understanding Attention
        </h1>
        <p
          style={{
            fontSize: 28 * scale,
            color: COLORS.textDim,
            margin: `${8 * scale}px 0 0 0`,
          }}
        >
          Step-by-Step Breakdown
        </p>
      </div>

      {/* Step labels - positioned at top left */}
      <div
        style={{
          position: "absolute",
          top: 130 * scale,
          left: 40 * scale,
          display: "flex",
          flexDirection: "column",
          gap: 12 * scale,
        }}
      >
        {currentStep >= 1 && currentStep <= 3 && (
          <StepLabel
            step={currentStep}
            label={
              currentStep === 1 ? "Query Vector (Q)" :
              currentStep === 2 ? "Key Vector (K)" :
              "Value Vector (V)"
            }
            opacity={
              currentStep === 1 ? qOpacity :
              currentStep === 2 ? kOpacity :
              vOpacity
            }
            scale={scale}
            color={
              currentStep === 1 ? COLORS.query :
              currentStep === 2 ? COLORS.key :
              COLORS.value
            }
          />
        )}
        {currentStep === 4 && (
          <StepLabel
            step={4}
            label="Compute Similarity (Q × K^T)"
            opacity={multiplyOpacity}
            scale={scale}
            color={COLORS.attention}
          />
        )}
        {currentStep === 5 && (
          <StepLabel
            step={5}
            label="Scale Scores (÷ √d_k)"
            opacity={scaleOpacity}
            scale={scale}
            color={COLORS.attention}
          />
        )}
        {currentStep === 6 && (
          <StepLabel
            step={6}
            label="Apply Softmax"
            opacity={softmaxOpacity}
            scale={scale}
            color={COLORS.attention}
          />
        )}
        {currentStep === 7 && (
          <StepLabel
            step={7}
            label="Weight Values"
            opacity={weightedOpacity}
            scale={scale}
            color={COLORS.output}
          />
        )}
      </div>

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          top: 200 * scale,
          left: 0,
          right: 0,
          bottom: 100 * scale,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Steps 1-3: Q, K, V vectors */}
        {currentStep <= 3 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 80 * scale,
              marginBottom: 40 * scale,
            }}
          >
            <VectorDisplay
              label="Q"
              fullLabel="Query"
              color={COLORS.query}
              opacity={qOpacity}
              values={qValues}
              scale={scale}
              animationProgress={qProgress}
            />
            {currentStep >= 2 && (
              <VectorDisplay
                label="K"
                fullLabel="Key"
                color={COLORS.key}
                opacity={kOpacity}
                values={kValues}
                scale={scale}
                animationProgress={kProgress}
              />
            )}
            {currentStep >= 3 && (
              <VectorDisplay
                label="V"
                fullLabel="Value"
                color={COLORS.value}
                opacity={vOpacity}
                values={vValues}
                scale={scale}
                animationProgress={vProgress}
              />
            )}
          </div>
        )}

        {/* Step descriptions */}
        {currentStep <= 3 && (
          <div
            style={{
              display: "flex",
              gap: 80 * scale,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                opacity: qOpacity,
                maxWidth: 200 * scale,
              }}
            >
              <p style={{ color: COLORS.textDim, fontSize: 22 * scale, margin: 0 }}>
                "What am I looking for?"
              </p>
            </div>
            {currentStep >= 2 && (
              <div
                style={{
                  textAlign: "center",
                  opacity: kOpacity,
                  maxWidth: 200 * scale,
                }}
              >
                <p style={{ color: COLORS.textDim, fontSize: 22 * scale, margin: 0 }}>
                  "What do I contain?"
                </p>
              </div>
            )}
            {currentStep >= 3 && (
              <div
                style={{
                  textAlign: "center",
                  opacity: vOpacity,
                  maxWidth: 200 * scale,
                }}
              >
                <p style={{ color: COLORS.textDim, fontSize: 22 * scale, margin: 0 }}>
                  "Here's my information"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Matrix multiplication */}
        {currentStep === 4 && (
          <MatrixMultiplication
            opacity={multiplyOpacity}
            progress={multiplyProgress}
            scale={scale}
          />
        )}

        {/* Step 5: Scaling */}
        {currentStep === 5 && (
          <ScalingStep
            opacity={scaleOpacity}
            progress={scaleProgress}
            scale={scale}
            rawScore={rawScore}
          />
        )}

        {/* Step 6: Softmax */}
        {currentStep === 6 && (
          <SoftmaxStep
            opacity={softmaxOpacity}
            progress={softmaxProgress}
            scale={scale}
          />
        )}

        {/* Step 7: Weighted sum */}
        {currentStep === 7 && (
          <WeightedSumStep
            opacity={weightedOpacity}
            progress={weightedProgress}
            scale={scale}
          />
        )}
      </div>

      {/* Bottom formula bar */}
      <div
        style={{
          position: "absolute",
          bottom: 30 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(localFrame, [30, 60], [0, 0.8], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.surface,
            padding: `${16 * scale}px ${32 * scale}px`,
            borderRadius: 12 * scale,
            border: `1px solid ${COLORS.attention}40`,
          }}
        >
          <span
            style={{
              fontSize: 32 * scale,
              fontFamily: "JetBrains Mono, monospace",
              color: COLORS.text,
            }}
          >
            Attention(<span style={{ color: COLORS.query }}>Q</span>,{" "}
            <span style={{ color: COLORS.key }}>K</span>,{" "}
            <span style={{ color: COLORS.value }}>V</span>) = softmax(
            <span style={{ color: COLORS.query }}>Q</span>
            <span style={{ color: COLORS.key }}>K</span>
            <sup style={{ fontSize: 20 * scale }}>T</sup> / √d
            <sub style={{ fontSize: 20 * scale }}>k</sub>)
            <span style={{ color: COLORS.value }}>V</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default AttentionScene;
