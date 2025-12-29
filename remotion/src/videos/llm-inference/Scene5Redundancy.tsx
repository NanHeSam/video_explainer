/**
 * Scene 5: The Redundancy Problem
 *
 * Key insight: Naive decode recomputes K,V for ALL previous tokens
 * every time we generate a new token. This is O(n²) waste.
 *
 * Visual flow:
 * 1. Show generating token N
 * 2. To compute attention, need K,V for tokens 1..N-1
 * 3. But we already computed those before!
 * 4. Show the growing waste with each new token
 * 5. O(n²) complexity visualization
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Scene5RedundancyProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  key: "#ff6b35",
  value: "#00ff88",
  waste: "#ff4757",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

const TOKENS = ["The", "cat", "sat", "on", "the", "mat"];

export const Scene5Redundancy: React.FC<Scene5RedundancyProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 3; // Intro
  const phase2End = fps * 15; // Show redundant computation growing
  const phase3End = fps * 20; // O(n²) reveal
  const phase4End = fps * 25; // Final statement

  // Current token being generated
  const currentTokenIndex = Math.min(
    TOKENS.length - 1,
    Math.floor(
      interpolate(localFrame, [phase1End, phase2End], [1, TOKENS.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Compute stats
  const totalComputations = (currentTokenIndex * (currentTokenIndex + 1)) / 2;
  const necessaryComputations = currentTokenIndex;
  const wastedComputations = totalComputations - necessaryComputations;
  const wastePercentage = totalComputations > 0
    ? Math.round((wastedComputations / totalComputations) * 100)
    : 0;

  // Animations
  const introOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const problemOpacity = interpolate(
    localFrame,
    [phase2End, phase2End + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const complexityOpacity = interpolate(
    localFrame,
    [phase3End, phase3End + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
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
          opacity: introOpacity,
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
          The Redundancy Problem
        </h1>
      </div>

      {/* Main visualization */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          opacity: introOpacity,
        }}
      >
        {/* Token sequence */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {TOKENS.slice(0, currentTokenIndex + 1).map((token, i) => {
            const isCurrentToken = i === currentTokenIndex;
            const isPreviousToken = i < currentTokenIndex;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {/* Token */}
                <div
                  style={{
                    padding: "12px 20px",
                    backgroundColor: isCurrentToken
                      ? COLORS.primary + "40"
                      : COLORS.surface,
                    border: `2px solid ${isCurrentToken ? COLORS.primary : "#444"}`,
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 600,
                    color: isCurrentToken ? COLORS.primary : COLORS.text,
                    boxShadow: isCurrentToken
                      ? `0 0 20px ${COLORS.primary}40`
                      : "none",
                  }}
                >
                  {token}
                </div>

                {/* Token index */}
                <span
                  style={{
                    fontSize: 12,
                    color: COLORS.textDim,
                  }}
                >
                  Token {i + 1}
                </span>

                {/* Computation status */}
                {isPreviousToken && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "4px 12px",
                      backgroundColor: COLORS.waste + "20",
                      borderRadius: 4,
                      fontSize: 12,
                      color: COLORS.waste,
                    }}
                  >
                    Recomputed!
                  </div>
                )}
                {isCurrentToken && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "4px 12px",
                      backgroundColor: COLORS.primary + "20",
                      borderRadius: 4,
                      fontSize: 12,
                      color: COLORS.primary,
                    }}
                  >
                    New
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Generating token <span style={{ color: COLORS.primary, fontWeight: 700 }}>
            {currentTokenIndex + 1}
          </span>: Must compute attention over{" "}
          <span style={{ color: COLORS.waste, fontWeight: 700 }}>
            all {currentTokenIndex} previous tokens
          </span>
        </div>

        {/* Computation grid showing redundancy */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 24,
              border: `1px solid #333`,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: COLORS.textDim,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              K,V Computations Required
            </div>

            {/* Grid showing which K,V pairs are computed for each token generation */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {Array.from({ length: currentTokenIndex + 1 }).map((_, row) => (
                <div key={row} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span
                    style={{
                      width: 80,
                      fontSize: 12,
                      color: COLORS.textDim,
                      textAlign: "right",
                      paddingRight: 8,
                    }}
                  >
                    Gen tok {row + 1}:
                  </span>
                  {Array.from({ length: row + 1 }).map((_, col) => {
                    const isNew = col === row;
                    const isWaste = col < row && row < currentTokenIndex;
                    const isCurrent = row === currentTokenIndex;

                    return (
                      <div
                        key={col}
                        style={{
                          width: 32,
                          height: 24,
                          backgroundColor: isNew
                            ? COLORS.primary + "60"
                            : isCurrent
                            ? COLORS.waste + "60"
                            : COLORS.waste + "30",
                          borderRadius: 4,
                          border: `1px solid ${isNew ? COLORS.primary : COLORS.waste}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: isNew ? COLORS.primary : COLORS.waste,
                        }}
                      >
                        {col + 1}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 60,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.waste,
              }}
            >
              {totalComputations}
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              Total K,V computations
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.primary,
              }}
            >
              {necessaryComputations}
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              Actually necessary
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.waste,
              }}
            >
              {wastePercentage}%
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              Wasted computation
            </div>
          </div>
        </div>
      </div>

      {/* O(n²) complexity */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: complexityOpacity,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.waste + "20",
            border: `2px solid ${COLORS.waste}`,
            borderRadius: 12,
            padding: "16px 40px",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.waste,
              fontFamily: "JetBrains Mono",
            }}
          >
            O(n²) complexity
          </span>
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
          opacity: interpolate(
            localFrame,
            [phase3End + fps, phase4End],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <span style={{ fontSize: 22, color: COLORS.text }}>
          For 1,000 tokens: <span style={{ color: COLORS.waste, fontWeight: 700 }}>500,000</span> redundant computations
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene5Redundancy;
