/**
 * Scene 7: How KV Cache Works (Mechanics)
 *
 * Technical details of the cache lookup operation:
 * 1. New token's Q vector is computed
 * 2. Q attends to ALL cached K vectors
 * 3. Attention weights computed via softmax(Q × K^T)
 * 4. Weighted sum of cached V vectors
 * 5. Result: contextualized representation without recomputation
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Scene7MechanicsProps {
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
};

export const Scene7Mechanics: React.FC<Scene7MechanicsProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 4; // Show new token and Q
  const phase2End = fps * 9; // Q queries K cache
  const phase3End = fps * 14; // Attention weights
  const phase4End = fps * 18; // V lookup
  const phase5End = fps * 20; // Result

  // Animation progress
  const qProgress = interpolate(localFrame, [0, phase1End], [0, 1], {
    extrapolateRight: "clamp",
  });

  const queryProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const attentionProgress = interpolate(
    localFrame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const vLookupProgress = interpolate(
    localFrame,
    [phase3End, phase4End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const resultProgress = interpolate(
    localFrame,
    [phase4End, phase5End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Simulated attention weights
  const attentionWeights = [0.35, 0.25, 0.15, 0.25];
  const cachedTokens = ["The", "cat", "sat", "on"];

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
          opacity: qProgress,
        }}
      >
        <h1
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
          }}
        >
          How KV Cache Works
        </h1>
      </div>

      {/* Main diagram */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          bottom: 100,
        }}
      >
        {/* New token section */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 40,
            width: 200,
            opacity: qProgress,
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
            New Token
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 20,
              border: `2px solid ${COLORS.query}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.query,
                marginBottom: 16,
              }}
            >
              "the"
            </div>

            {/* Q vector */}
            <div
              style={{
                backgroundColor: COLORS.query + "30",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLORS.query,
                }}
              >
                Q
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {[0.8, 0.3, 0.9, 0.5].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 40 * h,
                      backgroundColor: COLORS.query,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Query arrow */}
        <svg
          style={{
            position: "absolute",
            left: 200,
            top: 140,
            width: 150,
            height: 60,
            opacity: queryProgress,
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={COLORS.query}
              />
            </marker>
          </defs>
          <line
            x1="10"
            y1="30"
            x2="130"
            y2="30"
            stroke={COLORS.query}
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
            strokeDasharray={queryProgress < 1 ? "10,5" : "none"}
          />
          <text
            x="70"
            y="20"
            fill={COLORS.query}
            fontSize="14"
            textAnchor="middle"
          >
            queries
          </text>
        </svg>

        {/* K Cache */}
        <div
          style={{
            position: "absolute",
            left: 350,
            top: 0,
            width: 280,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: COLORS.key,
              fontWeight: 600,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            K Cache (Keys)
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 16,
              border: `2px solid ${COLORS.key}`,
            }}
          >
            {cachedTokens.map((token, i) => {
              const isHighlighted = queryProgress > (i + 1) / cachedTokens.length;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: i < cachedTokens.length - 1 ? 8 : 0,
                    padding: 8,
                    backgroundColor: isHighlighted
                      ? COLORS.key + "20"
                      : "transparent",
                    borderRadius: 6,
                    transition: "background-color 0.3s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: COLORS.textDim,
                      width: 40,
                    }}
                  >
                    {token}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 20,
                      backgroundColor: COLORS.key + "60",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: COLORS.key,
                        fontFamily: "JetBrains Mono",
                      }}
                    >
                      K{i + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attention weights */}
        <div
          style={{
            position: "absolute",
            left: 650,
            top: 0,
            width: 150,
            opacity: attentionProgress,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: COLORS.attention,
              fontWeight: 600,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Attention
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 16,
              border: `2px solid ${COLORS.attention}`,
            }}
          >
            {attentionWeights.map((weight, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: i < attentionWeights.length - 1 ? 8 : 0,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 20,
                    backgroundColor: "#333",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${weight * 100 * attentionProgress}%`,
                      height: "100%",
                      backgroundColor: COLORS.attention,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 14,
                    color: COLORS.attention,
                    fontFamily: "JetBrains Mono",
                    width: 45,
                    textAlign: "right",
                  }}
                >
                  {Math.round(weight * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* V Cache */}
        <div
          style={{
            position: "absolute",
            left: 350,
            top: 280,
            width: 280,
            opacity: vLookupProgress,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: COLORS.value,
              fontWeight: 600,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            V Cache (Values)
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 16,
              border: `2px solid ${COLORS.value}`,
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
                    gap: 12,
                    marginBottom: i < cachedTokens.length - 1 ? 8 : 0,
                    padding: 8,
                    backgroundColor: `rgba(0, 255, 136, ${weight * 0.3})`,
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: COLORS.textDim,
                      width: 40,
                    }}
                  >
                    {token}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 20,
                      backgroundColor: COLORS.value + "60",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: COLORS.value,
                        fontFamily: "JetBrains Mono",
                      }}
                    >
                      V{i + 1} × {Math.round(weight * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Result */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 200,
            width: 200,
            opacity: resultProgress,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: COLORS.text,
              fontWeight: 600,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Output
          </div>
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 20,
              border: `2px solid ${COLORS.text}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: COLORS.textDim,
                marginBottom: 8,
              }}
            >
              Weighted sum of V's
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {[0.7, 0.5, 0.8, 0.6].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 50 * h,
                    background: `linear-gradient(to top, ${COLORS.value}, ${COLORS.query})`,
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: COLORS.textDim,
              }}
            >
              Contextualized "the"
            </div>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: attentionProgress,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: "12px 32px",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontFamily: "JetBrains Mono",
              color: COLORS.text,
            }}
          >
            Output = softmax(
            <span style={{ color: COLORS.query }}>Q</span> ×{" "}
            <span style={{ color: COLORS.key }}>K<sub>cache</sub></span>
            <sup>T</sup>) ×{" "}
            <span style={{ color: COLORS.value }}>V<sub>cache</sub></span>
          </span>
        </div>
      </div>

      {/* Key insight */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: resultProgress,
        }}
      >
        <span style={{ fontSize: 20, color: COLORS.textDim }}>
          Cache lookup is{" "}
          <span style={{ color: COLORS.value, fontWeight: 600 }}>
            essentially free
          </span>{" "}
          — just matrix multiplies against tensors already in memory
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene7Mechanics;
