/**
 * Scene 14: Speculative Decoding
 *
 * Key insight: Use a small fast model to draft tokens,
 * then verify them in parallel with the large model.
 *
 * Visual flow:
 * 1. Show draft model generating 5 tokens quickly
 * 2. Target model verifies all 5 in one pass
 * 3. Accept matching tokens, reject mismatches
 * 4. Show 2-3x speedup for easy tokens
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

interface SpeculativeDecodingSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  draft: "#f1c40f",
  target: "#9b59b6",
  accept: "#00ff88",
  reject: "#ff4757",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

const DRAFT_TOKENS = ["The", "quick", "brown", "fox", "jumps"];
const TARGET_TOKENS = ["The", "quick", "brown", "fox", "leaps"]; // Last one differs

export const SpeculativeDecodingScene: React.FC<SpeculativeDecodingSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 4; // Show draft model
  const phase2End = fps * 10; // Draft generates tokens
  const phase3End = fps * 16; // Target verifies
  const phase4End = fps * 22; // Show accept/reject
  const phase5End = fps * 28; // Stats

  // Draft generation progress
  const draftProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, DRAFT_TOKENS.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Verification progress
  const verifyProgress = interpolate(
    localFrame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Accept/reject reveal
  const resultProgress = interpolate(
    localFrame,
    [phase3End, phase4End],
    [0, DRAFT_TOKENS.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animations
  const introOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const statsOpacity = interpolate(
    localFrame,
    [phase4End, phase4End + fps],
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
          Speculative Decoding
        </h1>
        <p style={{ fontSize: 18, color: COLORS.draft, marginTop: 8 }}>
          Draft, Verify, Accelerate
        </p>
      </div>

      {/* Main visualization */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 80,
          right: 80,
          opacity: introOpacity,
        }}
      >
        {/* Two model boxes */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 60,
            marginBottom: 40,
          }}
        >
          {/* Draft Model */}
          <div
            style={{
              width: 350,
              padding: 24,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: `2px solid ${COLORS.draft}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.draft,
                }}
              >
                Draft Model
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.textDim,
                  padding: "4px 8px",
                  backgroundColor: "#222",
                  borderRadius: 4,
                }}
              >
                1.5B params (fast)
              </div>
            </div>

            {/* Draft tokens */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                minHeight: 44,
              }}
            >
              {DRAFT_TOKENS.slice(0, Math.floor(draftProgress)).map((token, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: COLORS.draft + "30",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.draft}`,
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.draft,
                    transform: `scale(${
                      i === Math.floor(draftProgress) - 1 ? 1.1 : 1
                    })`,
                    transition: "transform 0.2s",
                  }}
                >
                  {token}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 14,
                color: COLORS.textDim,
                textAlign: "center",
              }}
            >
              Generates {Math.floor(draftProgress)} tokens in ~5ms
            </div>
          </div>

          {/* Arrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 32,
              color: COLORS.textDim,
              opacity: verifyProgress,
            }}
          >
            →
          </div>

          {/* Target Model */}
          <div
            style={{
              width: 350,
              padding: 24,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: `2px solid ${COLORS.target}`,
              opacity: 0.3 + verifyProgress * 0.7,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.target,
                }}
              >
                Target Model
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.textDim,
                  padding: "4px 8px",
                  backgroundColor: "#222",
                  borderRadius: 4,
                }}
              >
                7B params (accurate)
              </div>
            </div>

            {/* Verify indicator */}
            <div
              style={{
                padding: 16,
                backgroundColor: verifyProgress > 0 ? COLORS.target + "20" : "#222",
                borderRadius: 8,
                textAlign: "center",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {verifyProgress > 0 && verifyProgress < 1 && (
                <span style={{ color: COLORS.target }}>
                  Verifying all 5 tokens in parallel...
                </span>
              )}
              {verifyProgress >= 1 && (
                <span style={{ color: COLORS.accept }}>
                  Verification complete!
                </span>
              )}
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 14,
                color: COLORS.textDim,
                textAlign: "center",
              }}
            >
              Verifies all {DRAFT_TOKENS.length} in one forward pass
            </div>
          </div>
        </div>

        {/* Comparison results */}
        <div
          style={{
            padding: 24,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            border: "1px solid #333",
            marginBottom: 32,
            opacity: resultProgress > 0 ? 1 : 0,
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
            Token Verification Results
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}
          >
            {DRAFT_TOKENS.map((token, i) => {
              const isRevealed = i < Math.floor(resultProgress);
              const isMatch = DRAFT_TOKENS[i] === TARGET_TOKENS[i];

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    opacity: isRevealed ? 1 : 0.3,
                  }}
                >
                  {/* Draft token */}
                  <div
                    style={{
                      padding: "6px 12px",
                      backgroundColor: COLORS.draft + "30",
                      borderRadius: 6,
                      fontSize: 14,
                      color: COLORS.draft,
                    }}
                  >
                    {token}
                  </div>

                  {/* Match indicator */}
                  {isRevealed && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: isMatch
                          ? COLORS.accept + "40"
                          : COLORS.reject + "40",
                        border: `2px solid ${isMatch ? COLORS.accept : COLORS.reject}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: isMatch ? COLORS.accept : COLORS.reject,
                      }}
                    >
                      {isMatch ? "✓" : "✗"}
                    </div>
                  )}

                  {/* Target token */}
                  <div
                    style={{
                      padding: "6px 12px",
                      backgroundColor: COLORS.target + "30",
                      borderRadius: 6,
                      fontSize: 14,
                      color: COLORS.target,
                    }}
                  >
                    {TARGET_TOKENS[i]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result summary */}
          {resultProgress >= DRAFT_TOKENS.length && (
            <div
              style={{
                marginTop: 20,
                textAlign: "center",
                padding: 12,
                backgroundColor: COLORS.accept + "15",
                borderRadius: 8,
                border: `1px solid ${COLORS.accept}40`,
              }}
            >
              <span style={{ color: COLORS.accept, fontSize: 16 }}>
                4/5 tokens accepted! Generated 4 tokens for cost of 1 forward pass
              </span>
            </div>
          )}
        </div>

        {/* Acceptance rate visualization */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            opacity: statsOpacity,
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.accept,
              }}
            >
              70-80%
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              Typical Acceptance Rate
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.primary,
              }}
            >
              2-3×
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              Latency Speedup
            </div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(
            localFrame,
            [phase4End + fps, phase5End],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <span style={{ fontSize: 22, color: COLORS.text }}>
          Easy tokens:{" "}
          <span style={{ color: COLORS.accept, fontWeight: 700 }}>
            draft is right
          </span>
          . Hard tokens:{" "}
          <span style={{ color: COLORS.target, fontWeight: 700 }}>
            fall back to target
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default SpeculativeDecodingScene;
