/**
 * Scene 7: The Attention Computation
 *
 * Now that we've seen how the cache grows, this scene focuses on
 * the actual attention computation: Q × K^T → softmax → weighted V sum.
 *
 * This is a follow-up to the step-by-step cache example, showing
 * how the cached K,V pairs are actually used in the attention formula.
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS as STYLE_COLORS, getSceneIndicatorStyle, getSceneIndicatorTextStyle } from "./styles";

interface MechanicsSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  query: "#00d9ff",
  key: "#ff6b35",
  value: "#00ff88",
  cache: "#9b59b6",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  attention: "#f1c40f",
  success: "#2ecc71",
};

export const MechanicsScene: React.FC<MechanicsSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = Math.round(durationInFrames * 0.28); // Show formula components
  const phase2End = Math.round(durationInFrames * 0.56); // Q × K^T step
  const phase3End = Math.round(durationInFrames * 0.78); // softmax step
  const phase4End = Math.round(durationInFrames * 1.00); // × V step

  // Animation progress for each phase
  const formulaProgress = interpolate(localFrame, [0, phase1End], [0, 1], {
    extrapolateRight: "clamp",
  });

  const dotProductProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const softmaxProgress = interpolate(
    localFrame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const weightedSumProgress = interpolate(
    localFrame,
    [phase3End, phase4End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Simulated attention computation
  const cachedTokens = ["The", "cat", "sat"];
  const dotProducts = [2.1, 1.4, 0.8]; // Raw scores
  const attentionWeights = [0.52, 0.31, 0.17]; // After softmax

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Scene indicator */}
      <div style={{ ...getSceneIndicatorStyle(scale), opacity: formulaProgress }}>
        <span style={getSceneIndicatorTextStyle(scale)}>7</span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: formulaProgress,
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
          The Attention Computation
        </h1>
      </div>

      {/* Main formula at top */}
      <div
        style={{
          position: "absolute",
          top: 110 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: formulaProgress,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            padding: `${16 * scale}px ${40 * scale}px`,
            border: `${2 * scale}px solid ${COLORS.text}30`,
          }}
        >
          <span
            style={{
              fontSize: 28 * scale,
              fontFamily: "JetBrains Mono",
              color: COLORS.text,
            }}
          >
            Output = softmax(
            <span style={{
              color: COLORS.query,
              textDecoration: dotProductProgress > 0.5 ? "underline" : "none",
              textDecorationColor: COLORS.query,
            }}>Q</span>
            {" × "}
            <span style={{
              color: COLORS.key,
              textDecoration: dotProductProgress > 0.5 ? "underline" : "none",
              textDecorationColor: COLORS.key,
            }}>K<sup>T</sup></span>
            ) ×{" "}
            <span style={{
              color: COLORS.value,
              textDecoration: weightedSumProgress > 0.5 ? "underline" : "none",
              textDecorationColor: COLORS.value,
            }}>V</span>
          </span>
        </div>
      </div>

      {/* Visual breakdown */}
      <div
        style={{
          position: "absolute",
          top: 200 * scale,
          left: 60 * scale,
          right: 60 * scale,
          display: "flex",
          justifyContent: "space-between",
          gap: 20 * scale,
        }}
      >
        {/* Step 1: Q vector */}
        <div
          style={{
            flex: 1,
            opacity: formulaProgress,
          }}
        >
          <div
            style={{
              fontSize: 16 * scale,
              color: COLORS.query,
              fontWeight: 600,
              marginBottom: 12 * scale,
              textAlign: "center",
            }}
          >
            New Token's Query
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12 * scale,
              padding: 16 * scale,
              border: `${2 * scale}px solid ${COLORS.query}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 20 * scale,
                fontWeight: 700,
                color: COLORS.query,
                marginBottom: 12 * scale,
              }}
            >
              "on"
            </div>
            <div
              style={{
                backgroundColor: COLORS.query + "30",
                borderRadius: 8 * scale,
                padding: `${10 * scale}px ${16 * scale}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6 * scale,
              }}
            >
              <span
                style={{
                  fontSize: 18 * scale,
                  fontWeight: 700,
                  color: COLORS.query,
                }}
              >
                Q
              </span>
              <div style={{ display: "flex", gap: 3 * scale }}>
                {[0.7, 0.4, 0.9, 0.5].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10 * scale,
                      height: 36 * h * scale,
                      backgroundColor: COLORS.query,
                      borderRadius: 2 * scale,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Dot product with K cache */}
        <div
          style={{
            flex: 1.5,
            opacity: dotProductProgress,
          }}
        >
          <div
            style={{
              fontSize: 16 * scale,
              color: COLORS.key,
              fontWeight: 600,
              marginBottom: 12 * scale,
              textAlign: "center",
            }}
          >
            Q × K<sup>T</sup> (Dot Products)
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12 * scale,
              padding: 16 * scale,
              border: `${2 * scale}px solid ${COLORS.key}`,
            }}
          >
            {cachedTokens.map((token, i) => {
              const animatedScore = dotProducts[i] * dotProductProgress;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12 * scale,
                    marginBottom: i < cachedTokens.length - 1 ? 10 * scale : 0,
                    padding: 8 * scale,
                    backgroundColor: COLORS.key + "15",
                    borderRadius: 6 * scale,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15 * scale,
                      color: COLORS.textDim,
                      width: 44 * scale,
                    }}
                  >
                    {token}
                  </span>
                  <span
                    style={{
                      fontSize: 15 * scale,
                      color: COLORS.key,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 600,
                      width: 34 * scale,
                    }}
                  >
                    K{i + 1}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 16 * scale,
                      backgroundColor: "#333",
                      borderRadius: 4 * scale,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(animatedScore / 3) * 100}%`,
                        height: "100%",
                        backgroundColor: COLORS.key,
                        borderRadius: 4 * scale,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 15 * scale,
                      color: COLORS.key,
                      fontFamily: "JetBrains Mono",
                      width: 44 * scale,
                      textAlign: "right",
                    }}
                  >
                    {animatedScore.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Softmax */}
        <div
          style={{
            flex: 1,
            opacity: softmaxProgress,
          }}
        >
          <div
            style={{
              fontSize: 16 * scale,
              color: COLORS.attention,
              fontWeight: 600,
              marginBottom: 12 * scale,
              textAlign: "center",
            }}
          >
            softmax → Weights
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12 * scale,
              padding: 16 * scale,
              border: `${2 * scale}px solid ${COLORS.attention}`,
            }}
          >
            {cachedTokens.map((token, i) => {
              const weight = attentionWeights[i] * softmaxProgress;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8 * scale,
                    marginBottom: i < cachedTokens.length - 1 ? 10 * scale : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15 * scale,
                      color: COLORS.textDim,
                      width: 40 * scale,
                    }}
                  >
                    {token}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 18 * scale,
                      backgroundColor: "#333",
                      borderRadius: 4 * scale,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${weight * 100}%`,
                        height: "100%",
                        backgroundColor: COLORS.attention,
                        borderRadius: 4 * scale,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 15 * scale,
                      color: COLORS.attention,
                      fontFamily: "JetBrains Mono",
                      width: 48 * scale,
                      textAlign: "right",
                    }}
                  >
                    {(weight * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Weighted sum of V */}
        <div
          style={{
            flex: 1.2,
            opacity: weightedSumProgress,
          }}
        >
          <div
            style={{
              fontSize: 16 * scale,
              color: COLORS.value,
              fontWeight: 600,
              marginBottom: 12 * scale,
              textAlign: "center",
            }}
          >
            × V (Weighted Sum)
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12 * scale,
              padding: 16 * scale,
              border: `${2 * scale}px solid ${COLORS.value}`,
            }}
          >
            {cachedTokens.map((token, i) => {
              const weight = attentionWeights[i];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8 * scale,
                    marginBottom: i < cachedTokens.length - 1 ? 10 * scale : 0,
                    padding: 8 * scale,
                    backgroundColor: `rgba(0, 255, 136, ${weight * 0.4 * weightedSumProgress})`,
                    borderRadius: 6 * scale,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15 * scale,
                      color: COLORS.value,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 600,
                    }}
                  >
                    V{i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 14 * scale,
                      color: COLORS.textDim,
                    }}
                  >
                    × {(weight * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}

            {/* Result */}
            <div
              style={{
                marginTop: 12 * scale,
                paddingTop: 12 * scale,
                borderTop: `${1 * scale}px solid ${COLORS.value}40`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 14 * scale,
                  color: COLORS.textDim,
                  marginBottom: 6 * scale,
                }}
              >
                = Output
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3 * scale,
                }}
              >
                {[0.65, 0.45, 0.8, 0.55].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12 * scale,
                      height: 40 * h * weightedSumProgress * scale,
                      background: `linear-gradient(to top, ${COLORS.value}, ${COLORS.query})`,
                      borderRadius: 2 * scale,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 100 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: weightedSumProgress,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.success + "15",
            border: `${2 * scale}px solid ${COLORS.success}`,
            borderRadius: 12 * scale,
            padding: `${14 * scale}px ${28 * scale}px`,
          }}
        >
          <span
            style={{
              fontSize: 22 * scale,
              color: COLORS.text,
            }}
          >
            Each new token only computes <span style={{ color: COLORS.query, fontWeight: 600 }}>one Q</span>.
            {" "}All <span style={{ color: COLORS.key, fontWeight: 600 }}>K</span>s and{" "}
            <span style={{ color: COLORS.value, fontWeight: 600 }}>V</span>s come from the cache.
          </span>
        </div>
      </div>

      {/* Key insight */}
      <div
        style={{
          position: "absolute",
          bottom: 40 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: weightedSumProgress,
        }}
      >
        <span style={{ fontSize: 18 * scale, color: COLORS.textDim }}>
          Cache lookup is{" "}
          <span style={{ color: COLORS.success, fontWeight: 600 }}>
            essentially free
          </span>{" "}
          — just matrix multiplies against tensors already in memory
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default MechanicsScene;
