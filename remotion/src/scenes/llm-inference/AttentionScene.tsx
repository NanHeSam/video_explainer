/**
 * Scene 4: Understanding Attention
 *
 * Key insight: How tokens "look at" each other through Q, K, V vectors.
 * This builds the foundation for understanding why KV cache works.
 *
 * Visual flow:
 * 1. Show tokens
 * 2. Each token produces Q, K, V vectors (as matrices/tensors)
 * 3. Q asks "what am I looking for?", K says "what do I contain?"
 * 4. Attention matrix forms (Q × K^T / √d_k)
 * 5. Arrows show flow: Q×K → attention scores → weighting V
 * 6. Values are weighted and combined to produce output
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  spring,
} from "remotion";

interface AttentionSceneProps {
  startFrame?: number;
  durationFrames?: number;
}

const COLORS = {
  background: "#0f0f1a",
  query: "#00d9ff", // Cyan for Query
  key: "#ff6b35", // Orange for Key
  value: "#00ff88", // Green for Value
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  attention: "#9b59b6", // Purple for attention scores
  output: "#ffd700", // Gold for weighted output
  arrow: "#ffffff",
};

const TOKENS = ["The", "cat", "sat", "on"];

// Matrix component for Q, K, V tensors
const TensorMatrix: React.FC<{
  label: string;
  fullLabel: string;
  color: string;
  opacity: number;
  values: number[][];
  size?: "small" | "large";
}> = ({ label, fullLabel, color, opacity, values, size = "small" }) => {
  const cellSize = size === "large" ? 24 : 16;
  const fontSize = size === "large" ? 11 : 9;

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Label badge with full name */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: size === "large" ? 36 : 28,
            height: size === "large" ? 28 : 22,
            backgroundColor: color,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size === "large" ? 16 : 13,
            fontWeight: 700,
            color: "#000",
          }}
        >
          {label}
        </div>
        <span
          style={{
            fontSize: size === "large" ? 14 : 11,
            fontWeight: 600,
            color: color,
          }}
        >
          {fullLabel}
        </span>
      </div>

      {/* Matrix grid visualization */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${values[0]?.length || 4}, ${cellSize}px)`,
          gap: 2,
          padding: 4,
          backgroundColor: `${color}15`,
          borderRadius: 6,
          border: `1px solid ${color}40`,
        }}
      >
        {values.flat().map((val, idx) => (
          <div
            key={idx}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: `${color}${Math.floor(val * 99).toString(16).padStart(2, '0')}`,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize,
              color: val > 0.5 ? "#000" : color,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {val.toFixed(1)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Arrow component for showing computation flow
const FlowArrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
  color: string;
  label?: string;
  curved?: boolean;
}> = ({ x1, y1, x2, y2, opacity, color, label, curved = false }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const curveOffset = curved ? 30 : 0;

  const path = curved
    ? `M ${x1} ${y1} Q ${midX} ${midY - curveOffset} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  // Calculate arrow head angle
  const angle = Math.atan2(y2 - (curved ? midY - curveOffset : y1), x2 - (curved ? midX : x1));
  const arrowLength = 10;
  const arrowAngle = Math.PI / 6;

  return (
    <g style={{ opacity }}>
      <defs>
        <marker
          id={`arrowhead-${color.replace('#', '')}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        stroke={color}
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#arrowhead-${color.replace('#', '')})`}
        style={{
          strokeDasharray: curved ? "5,3" : "none",
        }}
      />
      {label && (
        <text
          x={midX}
          y={midY - (curved ? curveOffset + 10 : 15)}
          fill={color}
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

// Sample matrix values for visualization
const Q_MATRIX = [
  [0.7, 0.4, 0.9, 0.5],
  [0.3, 0.8, 0.2, 0.6],
  [0.5, 0.6, 0.7, 0.4],
];

const K_MATRIX = [
  [0.5, 0.8, 0.3, 0.6],
  [0.4, 0.7, 0.5, 0.8],
  [0.6, 0.3, 0.9, 0.2],
];

const V_MATRIX = [
  [0.6, 0.5, 0.7, 0.4],
  [0.8, 0.3, 0.6, 0.5],
  [0.4, 0.9, 0.3, 0.7],
];

export const AttentionScene: React.FC<AttentionSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 4; // Show tokens
  const phase2End = fps * 10; // Show Q, K, V tensors/matrices
  const phase3End = fps * 18; // Show attention matrix with arrows
  const phase4End = fps * 25; // Show weighted output with V

  // ===== PHASE 1: Introduce tokens =====
  const tokensOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ===== PHASE 2: Q, K, V vectors emerge =====
  const vectorsProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const qVisible = vectorsProgress > 0.1;
  const kVisible = vectorsProgress > 0.4;
  const vVisible = vectorsProgress > 0.7;

  const qOpacity = interpolate(vectorsProgress, [0.1, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kOpacity = interpolate(vectorsProgress, [0.4, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vOpacity = interpolate(vectorsProgress, [0.7, 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ===== PHASE 3: Attention matrix =====
  const matrixProgress = interpolate(
    localFrame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ===== PHASE 4: Weighted output =====
  const outputProgress = interpolate(
    localFrame,
    [phase3End, phase4End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Arrow animations
  const qkArrowOpacity = interpolate(
    matrixProgress,
    [0.2, 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const attentionVArrowOpacity = interpolate(
    outputProgress,
    [0, 0.4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const outputVectorOpacity = interpolate(
    outputProgress,
    [0.3, 0.7],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Generate attention scores (simulated)
  const attentionScores = TOKENS.map((_, i) =>
    TOKENS.map((_, j) => {
      // Simulated attention pattern: tokens attend more to nearby tokens
      const distance = Math.abs(i - j);
      const base = 1 / (distance + 1);
      // Add some variation
      const variation = Math.sin(i * 3 + j * 5) * 0.2;
      return Math.min(1, Math.max(0.1, base + variation));
    })
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: tokensOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
          }}
        >
          Understanding Attention
        </h1>
      </div>

      {/* Tokens row */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 50,
          opacity: tokensOpacity,
        }}
      >
        {TOKENS.map((token, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Token box */}
            <div
              style={{
                padding: "10px 20px",
                backgroundColor: COLORS.surface,
                borderRadius: 8,
                border: "2px solid #444",
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.text,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {token}
            </div>
          </div>
        ))}
      </div>

      {/* Q, K, V Tensor/Matrix Visualizations */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 80,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        {/* Query Matrix */}
        <TensorMatrix
          label="Q"
          fullLabel="Query"
          color={COLORS.query}
          opacity={qOpacity}
          values={Q_MATRIX}
          size="large"
        />

        {/* Key Matrix */}
        <TensorMatrix
          label="K"
          fullLabel="Key"
          color={COLORS.key}
          opacity={kOpacity}
          values={K_MATRIX}
          size="large"
        />

        {/* Value Matrix */}
        <TensorMatrix
          label="V"
          fullLabel="Value"
          color={COLORS.value}
          opacity={vOpacity}
          values={V_MATRIX}
          size="large"
        />
      </div>

      {/* Computation Flow Arrows (SVG overlay) */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Arrow from Q and K to Attention Matrix */}
        <FlowArrow
          x1={480}
          y1={320}
          x2={600}
          y2={420}
          opacity={qkArrowOpacity}
          color={COLORS.query}
          curved
        />
        <FlowArrow
          x1={680}
          y1={320}
          x2={620}
          y2={420}
          opacity={qkArrowOpacity}
          color={COLORS.key}
          curved
        />

        {/* Label for Q×K^T operation */}
        {qkArrowOpacity > 0 && (
          <text
            x={580}
            y={380}
            fill={COLORS.text}
            fontSize={14}
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
            opacity={qkArrowOpacity}
          >
            Q × K<tspan baselineShift="super" fontSize={10}>T</tspan> / √d<tspan baselineShift="sub" fontSize={10}>k</tspan>
          </text>
        )}

        {/* Arrow from Attention Matrix to V */}
        <FlowArrow
          x1={720}
          y1={540}
          x2={820}
          y2={540}
          opacity={attentionVArrowOpacity}
          color={COLORS.attention}
          label="weights"
        />

        {/* Arrow showing weighted output */}
        <FlowArrow
          x1={880}
          y1={320}
          x2={880}
          y2={480}
          opacity={attentionVArrowOpacity}
          color={COLORS.value}
        />
      </svg>

      {/* Q, K, V explanations */}
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 100,
          right: 100,
          display: "flex",
          justifyContent: "center",
          gap: 100,
          opacity: interpolate(vectorsProgress, [0.3, 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ textAlign: "center", opacity: qOpacity }}>
          <div style={{ color: COLORS.textDim, fontSize: 14 }}>
            "What am I looking for?"
          </div>
        </div>
        <div style={{ textAlign: "center", opacity: kOpacity }}>
          <div style={{ color: COLORS.textDim, fontSize: 14 }}>
            "What do I contain?"
          </div>
        </div>
        <div style={{ textAlign: "center", opacity: vOpacity }}>
          <div style={{ color: COLORS.textDim, fontSize: 14 }}>
            "Here's my information"
          </div>
        </div>
      </div>

      {/* Attention Matrix */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: matrixProgress,
        }}
      >
        <div
          style={{
            fontSize: 16,
            color: COLORS.textDim,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Attention Scores: softmax(Q × K<sup>T</sup> / √d<sub>k</sub>)
        </div>

        {/* Matrix grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `40px repeat(${TOKENS.length}, 60px)`,
            gap: 4,
          }}
        >
          {/* Header row */}
          <div /> {/* Empty corner */}
          {TOKENS.map((token, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: 14,
                color: COLORS.key,
                fontFamily: "JetBrains Mono",
              }}
            >
              {token}
            </div>
          ))}

          {/* Matrix rows */}
          {TOKENS.map((token, i) => (
            <React.Fragment key={i}>
              {/* Row label */}
              <div
                style={{
                  textAlign: "right",
                  paddingRight: 8,
                  fontSize: 14,
                  color: COLORS.query,
                  fontFamily: "JetBrains Mono",
                }}
              >
                {token}
              </div>

              {/* Attention scores */}
              {attentionScores[i].map((score, j) => {
                const cellProgress = interpolate(
                  matrixProgress,
                  [(i * TOKENS.length + j) / (TOKENS.length * TOKENS.length), 1],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                return (
                  <div
                    key={j}
                    style={{
                      width: 56,
                      height: 40,
                      backgroundColor: `rgba(155, 89, 182, ${score * cellProgress})`,
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: COLORS.text,
                      fontFamily: "JetBrains Mono",
                      opacity: cellProgress,
                    }}
                  >
                    {(score * 100).toFixed(0)}%
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Formula and insight */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(
            localFrame,
            [phase2End + fps, phase2End + fps * 2],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.surface,
            padding: "16px 32px",
            borderRadius: 12,
            marginBottom: 16,
            border: `1px solid ${COLORS.attention}40`,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontFamily: "JetBrains Mono, monospace",
              color: COLORS.text,
            }}
          >
            Attention(<span style={{ color: COLORS.query }}>Q</span>,
            <span style={{ color: COLORS.key }}>K</span>,
            <span style={{ color: COLORS.value }}>V</span>) = softmax(
            <span style={{ color: COLORS.query }}>Q</span>
            <span style={{ color: COLORS.key }}>K</span>
            <sup style={{ fontSize: 14 }}>T</sup>/√d<sub style={{ fontSize: 14 }}>k</sub>)
            <span style={{ color: COLORS.value }}>V</span>
          </span>
        </div>
      </div>

      {/* Weighted Output visualization */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          right: 120,
          opacity: outputVectorOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: COLORS.output,
            fontWeight: 600,
          }}
        >
          Weighted Output
        </div>
        <div
          style={{
            display: "flex",
            gap: 3,
            padding: "8px 12px",
            backgroundColor: `${COLORS.output}20`,
            borderRadius: 8,
            border: `2px solid ${COLORS.output}`,
          }}
        >
          {[0.65, 0.45, 0.72, 0.53].map((val, idx) => (
            <div
              key={idx}
              style={{
                width: 28,
                height: 28,
                backgroundColor: `${COLORS.output}${Math.floor(val * 99).toString(16).padStart(2, '0')}`,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                color: val > 0.5 ? "#000" : COLORS.output,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {val.toFixed(1)}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: COLORS.textDim }}>
          Σ(attention × V)
        </div>
      </div>

      {/* Final insight */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: outputProgress,
        }}
      >
        <span style={{ fontSize: 20, color: COLORS.text }}>
          Each token can "look at" every other token to understand context
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default AttentionScene;
