/**
 * Scene 4: Understanding Attention
 *
 * Key insight: How tokens "look at" each other through Q, K, V vectors.
 * This builds the foundation for understanding why KV cache works.
 *
 * Visual flow:
 * 1. Show tokens
 * 2. Each token produces Q, K, V vectors
 * 3. Q asks "what am I looking for?", K says "what do I contain?"
 * 4. Attention matrix forms (Q × K^T)
 * 5. Values are weighted and combined
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
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
};

const TOKENS = ["The", "cat", "sat", "on"];

export const AttentionScene: React.FC<AttentionSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 4; // Show tokens
  const phase2End = fps * 10; // Show Q, K, V vectors
  const phase3End = fps * 18; // Show attention matrix
  const phase4End = fps * 25; // Show weighted output

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
          top: 130,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 60,
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
                padding: "12px 24px",
                backgroundColor: COLORS.surface,
                borderRadius: 8,
                border: "2px solid #444",
                fontSize: 24,
                fontWeight: 600,
                color: COLORS.text,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {token}
            </div>

            {/* Q, K, V vectors */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* Query vector */}
              <div
                style={{
                  opacity: qOpacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 24,
                    backgroundColor: COLORS.query,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  Q
                </div>
                {/* Vector bars */}
                <div style={{ display: "flex", gap: 2 }}>
                  {[0.7, 0.4, 0.9, 0.5].map((h, j) => (
                    <div
                      key={j}
                      style={{
                        width: 8,
                        height: 24 * h,
                        backgroundColor: COLORS.query + "80",
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Key vector */}
              <div
                style={{
                  opacity: kOpacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 24,
                    backgroundColor: COLORS.key,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  K
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[0.5, 0.8, 0.3, 0.6].map((h, j) => (
                    <div
                      key={j}
                      style={{
                        width: 8,
                        height: 24 * h,
                        backgroundColor: COLORS.key + "80",
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Value vector */}
              <div
                style={{
                  opacity: vOpacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 24,
                    backgroundColor: COLORS.value,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  V
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[0.6, 0.5, 0.7, 0.4].map((h, j) => (
                    <div
                      key={j}
                      style={{
                        width: 8,
                        height: 24 * h,
                        backgroundColor: COLORS.value + "80",
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Q, K, V explanations */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: 100,
          right: 100,
          display: "flex",
          justifyContent: "space-around",
          opacity: interpolate(vectorsProgress, [0.3, 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ textAlign: "center" }}>
          <span style={{ color: COLORS.query, fontWeight: 700, fontSize: 20 }}>
            Query
          </span>
          <div style={{ color: COLORS.textDim, fontSize: 16, marginTop: 4 }}>
            "What am I looking for?"
          </div>
        </div>
        <div style={{ textAlign: "center", opacity: kOpacity }}>
          <span style={{ color: COLORS.key, fontWeight: 700, fontSize: 20 }}>
            Key
          </span>
          <div style={{ color: COLORS.textDim, fontSize: 16, marginTop: 4 }}>
            "What do I contain?"
          </div>
        </div>
        <div style={{ textAlign: "center", opacity: vOpacity }}>
          <span style={{ color: COLORS.value, fontWeight: 700, fontSize: 20 }}>
            Value
          </span>
          <div style={{ color: COLORS.textDim, fontSize: 16, marginTop: 4 }}>
            "Here's my information"
          </div>
        </div>
      </div>

      {/* Attention Matrix */}
      <div
        style={{
          position: "absolute",
          top: 480,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: matrixProgress,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: COLORS.textDim,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Attention Matrix (Q × K<sup>T</sup>)
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
          bottom: 100,
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
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontFamily: "JetBrains Mono, monospace",
              color: COLORS.text,
            }}
          >
            Attention = softmax(
            <span style={{ color: COLORS.query }}>Q</span> ×{" "}
            <span style={{ color: COLORS.key }}>K</span>
            <sup>T</sup>) ×{" "}
            <span style={{ color: COLORS.value }}>V</span>
          </span>
        </div>
      </div>

      {/* Final insight */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: outputProgress,
        }}
      >
        <span style={{ fontSize: 22, color: COLORS.text }}>
          Each token can "look at" every other token to understand context
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default AttentionScene;
