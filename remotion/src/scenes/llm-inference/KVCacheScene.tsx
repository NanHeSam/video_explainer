/**
 * Scene 6: The KV Cache Solution
 *
 * Enhanced visualization showing how KV cache works with:
 * - Clear token labels (Token 1, Token 2, Token 3)
 * - Horizontal timeline cache that grows from right
 * - Visual cache reuse with glow effects and "REUSED" labels
 * - Before/after comparison
 * - Computations Saved counter
 * - Unmistakable "aha moment"
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

interface KVCacheSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  compute: "#00d9ff",
  key: "#ff6b35",
  value: "#00ff88",
  cache: "#9b59b6",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  success: "#2ecc71",
  attention: "#f1c40f",
  newToken: "#00d9ff",
  reused: "#00d9ff",
  error: "#e74c3c",
};

// Step data for the animation
const STEPS = [
  { token: "The", label: "Token 1", subscript: "₁", number: 1 },
  { token: "cat", label: "Token 2", subscript: "₂", number: 2 },
  { token: "sat", label: "Token 3", subscript: "₃", number: 3 },
];

export const KVCacheScene: React.FC<KVCacheSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const localFrame = frame - startFrame;
  const scale = Math.min(width / 1920, height / 1080);

  // Phase timings
  const introEnd = Math.round(durationInFrames * 0.08);
  const step1Start = introEnd;
  const step1End = step1Start + Math.round(durationInFrames * 0.22);
  const step2Start = step1End;
  const step2End = step2Start + Math.round(durationInFrames * 0.22);
  const step3Start = step2End;
  const step3End = step3Start + Math.round(durationInFrames * 0.22);
  const comparisonStart = step3End;
  const comparisonEnd = comparisonStart + Math.round(durationInFrames * 0.18);
  const insightStart = comparisonEnd;

  // Determine current step
  const getCurrentStep = () => {
    if (localFrame < step1Start) return -1;
    if (localFrame < step1End) return 0;
    if (localFrame < step2End) return 1;
    if (localFrame < step3End) return 2;
    if (localFrame < comparisonEnd) return 3; // Comparison phase
    return 4; // Final insight
  };
  const currentStep = getCurrentStep();

  // Title opacity
  const titleOpacity = interpolate(
    localFrame,
    [0, Math.round(durationInFrames * 0.02)],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // Helper to get step progress (0-1) within a step
  const getStepProgress = (stepIndex: number) => {
    const stepStarts = [step1Start, step2Start, step3Start];
    const stepEnds = [step1End, step2End, step3End];
    if (stepIndex < 0 || stepIndex > 2) return 0;
    return interpolate(
      localFrame,
      [stepStarts[stepIndex], stepEnds[stepIndex]],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  };

  // Animation phases within each step
  const getPhaseProgress = (
    stepIndex: number,
    phase: "generate" | "store" | "reuse" | "attention"
  ) => {
    const progress = getStepProgress(stepIndex);
    switch (phase) {
      case "generate":
        return interpolate(progress, [0, 0.25], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      case "store":
        return interpolate(progress, [0.25, 0.45], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      case "reuse":
        return interpolate(progress, [0.45, 0.7], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      case "attention":
        return interpolate(progress, [0.7, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
    }
  };

  // Computations saved counter (must be after getPhaseProgress)
  const getComputationsSaved = () => {
    if (currentStep < 1) return 0;
    if (currentStep === 1) {
      const reuseProgress = getPhaseProgress(1, "reuse");
      return reuseProgress > 0.5 ? 1 : 0;
    }
    if (currentStep === 2) {
      const reuseProgress = getPhaseProgress(2, "reuse");
      return reuseProgress > 0.5 ? 3 : 1;
    }
    return 3;
  };
  const computationsSaved = getComputationsSaved();

  // Comparison phase progress
  const comparisonProgress = interpolate(
    localFrame,
    [comparisonStart, comparisonStart + Math.round(durationInFrames * 0.06)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Insight phase progress
  const insightProgress = interpolate(
    localFrame,
    [insightStart, insightStart + Math.round(durationInFrames * 0.04)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Glow pulse animation for reused entries
  const glowPulse =
    0.5 + 0.5 * Math.sin((localFrame / fps) * Math.PI * 3);

  // Render the horizontal cache timeline
  const renderCacheTimeline = () => {
    if (currentStep < 0) return null;

    const cachedCount = Math.min(currentStep + 1, 3);
    const isComparisonPhase = currentStep >= 3;

    return (
      <div
        style={{
          position: "absolute",
          bottom: isComparisonPhase ? 400 * scale : 320 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          transition: "bottom 0.5s ease",
        }}
      >
        {/* Cache label */}
        <div
          style={{
            fontSize: 20 * scale,
            color: COLORS.cache,
            fontWeight: 700,
            marginBottom: 16 * scale,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10 * scale,
          }}
        >
          <span style={{ fontSize: 24 * scale }}>📦</span>
          <span>KV CACHE TIMELINE</span>
        </div>

        {/* Timeline container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            padding: `${20 * scale}px ${30 * scale}px`,
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            border: `${3 * scale}px solid ${COLORS.cache}`,
            boxShadow: `0 0 ${40 * scale}px ${COLORS.cache}40`,
            overflow: "hidden",
          }}
        >
          {/* Timeline entries */}
          {Array.from({ length: cachedCount }).map((_, i) => {
            const stepData = STEPS[i];
            const isNew = i === currentStep && currentStep <= 2;
            const isBeingReused =
              currentStep > i &&
              currentStep <= 2 &&
              getPhaseProgress(currentStep, "reuse") > 0.3;

            // Slide in animation
            const slideProgress = spring({
              frame:
                localFrame -
                (i === 0 ? step1Start : i === 1 ? step2Start : step3Start) -
                Math.round(durationInFrames * 0.06),
              fps,
              config: { damping: 15, stiffness: 80 },
            });

            const slideX = interpolate(slideProgress, [0, 1], [100, 0]);
            const entryOpacity = interpolate(slideProgress, [0, 0.5], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <React.Fragment key={i}>
                {/* Connector line */}
                {i > 0 && (
                  <div
                    style={{
                      width: 40 * scale,
                      height: 3 * scale,
                      backgroundColor: COLORS.cache,
                      opacity: 0.6,
                    }}
                  />
                )}

                {/* Cache entry */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8 * scale,
                    padding: `${12 * scale}px ${16 * scale}px`,
                    backgroundColor: isBeingReused
                      ? `rgba(0, 217, 255, ${0.15 + glowPulse * 0.1})`
                      : isNew
                      ? COLORS.compute + "15"
                      : "transparent",
                    borderRadius: 12 * scale,
                    border: isBeingReused
                      ? `${3 * scale}px solid ${COLORS.reused}`
                      : isNew
                      ? `${2 * scale}px solid ${COLORS.compute}60`
                      : `${2 * scale}px solid transparent`,
                    transform: `translateX(${slideX}px)`,
                    opacity: entryOpacity,
                    boxShadow: isBeingReused
                      ? `0 0 ${20 + glowPulse * 15}px ${COLORS.reused}80`
                      : isNew
                      ? `0 0 ${15 * scale}px ${COLORS.compute}40`
                      : "none",
                    position: "relative",
                  }}
                >
                  {/* REUSED badge */}
                  {isBeingReused && (
                    <div
                      style={{
                        position: "absolute",
                        top: -12 * scale,
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: COLORS.reused,
                        color: "#000",
                        fontSize: 10 * scale,
                        fontWeight: 800,
                        padding: `${3 * scale}px ${8 * scale}px`,
                        borderRadius: 4 * scale,
                        letterSpacing: 1,
                      }}
                    >
                      REUSED
                    </div>
                  )}

                  {/* Token label */}
                  <div
                    style={{
                      fontSize: 14 * scale,
                      color: COLORS.text,
                      fontWeight: 700,
                      backgroundColor: isNew ? COLORS.compute : COLORS.textDim,
                      padding: `${4 * scale}px ${10 * scale}px`,
                      borderRadius: 6 * scale,
                      marginBottom: 4 * scale,
                    }}
                  >
                    <span style={{ color: isNew ? "#000" : "#fff" }}>
                      Token {stepData.number}
                    </span>
                  </div>

                  {/* Token text */}
                  <div
                    style={{
                      fontSize: 16 * scale,
                      color: isNew ? COLORS.compute : COLORS.text,
                      fontWeight: 600,
                      fontStyle: "italic",
                    }}
                  >
                    "{stepData.token}"
                  </div>

                  {/* K/V pair */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8 * scale,
                    }}
                  >
                    <div
                      style={{
                        width: 50 * scale,
                        height: 32 * scale,
                        backgroundColor: COLORS.key,
                        borderRadius: 6 * scale,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14 * scale,
                        fontWeight: 700,
                        color: "#000",
                        fontFamily: "JetBrains Mono",
                        boxShadow:
                          isNew || isBeingReused
                            ? `0 0 ${10 * scale}px ${COLORS.key}`
                            : "none",
                      }}
                    >
                      K{stepData.subscript}
                    </div>
                    <div
                      style={{
                        width: 50 * scale,
                        height: 32 * scale,
                        backgroundColor: COLORS.value,
                        borderRadius: 6 * scale,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14 * scale,
                        fontWeight: 700,
                        color: "#000",
                        fontFamily: "JetBrains Mono",
                        boxShadow:
                          isNew || isBeingReused
                            ? `0 0 ${10 * scale}px ${COLORS.value}`
                            : "none",
                      }}
                    >
                      V{stepData.subscript}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Empty slots indicator */}
          {currentStep < 2 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                opacity: 0.4,
              }}
            >
              <div
                style={{
                  width: 40 * scale,
                  height: 3 * scale,
                  backgroundColor: COLORS.cache,
                  opacity: 0.4,
                }}
              />
              <div
                style={{
                  fontSize: 24 * scale,
                  color: COLORS.textDim,
                  padding: `0 ${16 * scale}px`,
                }}
              >
                →
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render current token being processed
  const renderCurrentToken = () => {
    if (currentStep < 0 || currentStep > 2) return null;
    const stepData = STEPS[currentStep];
    const generateProgress = getPhaseProgress(currentStep, "generate");

    const tokenSpring = spring({
      frame:
        localFrame -
        (currentStep === 0
          ? step1Start
          : currentStep === 1
          ? step2Start
          : step3Start),
      fps,
      config: { damping: 12, stiffness: 100 },
    });

    return (
      <div
        style={{
          position: "absolute",
          left: 120 * scale,
          top: 180 * scale,
          opacity: generateProgress,
          transform: `scale(${tokenSpring})`,
        }}
      >
        {/* Token label badge */}
        <div
          style={{
            backgroundColor: COLORS.compute,
            color: "#000",
            fontSize: 18 * scale,
            fontWeight: 800,
            padding: `${8 * scale}px ${20 * scale}px`,
            borderRadius: 8 * scale,
            marginBottom: 16 * scale,
            textAlign: "center",
            boxShadow: `0 0 ${20 * scale}px ${COLORS.compute}80`,
          }}
        >
          {stepData.label.toUpperCase()}
        </div>

        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            padding: 28 * scale,
            border: `${3 * scale}px solid ${COLORS.compute}`,
            textAlign: "center",
            boxShadow: `0 0 ${30 * scale}px ${COLORS.compute}40`,
          }}
        >
          <div
            style={{
              fontSize: 32 * scale,
              fontWeight: 700,
              color: COLORS.compute,
              marginBottom: 24 * scale,
            }}
          >
            "{stepData.token}"
          </div>

          {/* Generating K,V indicator */}
          <div
            style={{
              display: "flex",
              gap: 16 * scale,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                padding: `${10 * scale}px ${20 * scale}px`,
                backgroundColor: COLORS.key,
                borderRadius: 8 * scale,
                fontSize: 18 * scale,
                fontWeight: 700,
                color: "#000",
                fontFamily: "JetBrains Mono",
                boxShadow: `0 0 ${12 * scale}px ${COLORS.key}`,
              }}
            >
              → K{stepData.subscript}
            </div>
            <div
              style={{
                padding: `${10 * scale}px ${20 * scale}px`,
                backgroundColor: COLORS.value,
                borderRadius: 8 * scale,
                fontSize: 18 * scale,
                fontWeight: 700,
                color: "#000",
                fontFamily: "JetBrains Mono",
                boxShadow: `0 0 ${12 * scale}px ${COLORS.value}`,
              }}
            >
              → V{stepData.subscript}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render arrow from token to cache with store animation
  const renderStoreArrow = () => {
    if (currentStep < 0 || currentStep > 2) return null;
    const storeProgress = getPhaseProgress(currentStep, "store");

    if (storeProgress < 0.1) return null;

    return (
      <svg
        style={{
          position: "absolute",
          left: 350 * scale,
          top: 250 * scale,
          width: 220 * scale,
          height: 100 * scale,
          opacity: storeProgress,
        }}
      >
        <defs>
          <marker
            id="storeArrowHead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.cache} />
          </marker>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.compute} />
            <stop offset="100%" stopColor={COLORS.cache} />
          </linearGradient>
        </defs>

        {/* Animated arrow path */}
        <path
          d={`M ${10 * scale} ${30 * scale} Q ${110 * scale} ${30 * scale} ${
            110 * scale
          } ${70 * scale} T ${200 * scale} ${70 * scale}`}
          fill="none"
          stroke="url(#arrowGradient)"
          strokeWidth={4 * scale}
          strokeDasharray={`${200 * storeProgress * scale} ${200 * scale}`}
          markerEnd={storeProgress > 0.7 ? "url(#storeArrowHead)" : ""}
        />

        {/* Store label */}
        <text
          x={110 * scale}
          y={20 * scale}
          fill={COLORS.cache}
          fontSize={16 * scale}
          textAnchor="middle"
          fontWeight="700"
        >
          STORE →
        </text>
      </svg>
    );
  };

  // Render reuse arrows from cache to computation
  const renderReuseArrows = () => {
    if (currentStep < 1 || currentStep > 2) return null;
    const reuseProgress = getPhaseProgress(currentStep, "reuse");

    if (reuseProgress < 0.2) return null;

    const reusedCount = currentStep;

    return (
      <div
        style={{
          position: "absolute",
          right: 100 * scale,
          top: 180 * scale,
          opacity: reuseProgress,
        }}
      >
        {/* Reuse panel */}
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            padding: 24 * scale,
            border: `${3 * scale}px solid ${COLORS.reused}`,
            boxShadow: `0 0 ${30 + glowPulse * 20}px ${COLORS.reused}60`,
          }}
        >
          {/* Header with arrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12 * scale,
              marginBottom: 16 * scale,
            }}
          >
            <div
              style={{
                fontSize: 28 * scale,
              }}
            >
              ⬅️
            </div>
            <div
              style={{
                fontSize: 18 * scale,
                color: COLORS.reused,
                fontWeight: 700,
              }}
            >
              FETCHING FROM CACHE
            </div>
          </div>

          {/* Reused entries */}
          {STEPS.slice(0, reusedCount).map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12 * scale,
                marginBottom: i < reusedCount - 1 ? 12 * scale : 0,
                padding: `${10 * scale}px ${14 * scale}px`,
                backgroundColor: `rgba(0, 217, 255, ${0.1 + glowPulse * 0.05})`,
                borderRadius: 8 * scale,
                border: `${2 * scale}px solid ${COLORS.reused}60`,
              }}
            >
              <span
                style={{
                  fontSize: 14 * scale,
                  color: COLORS.text,
                  fontWeight: 600,
                  width: 60 * scale,
                }}
              >
                Token {step.number}
              </span>
              <span
                style={{
                  fontSize: 16 * scale,
                  color: COLORS.key,
                  fontFamily: "JetBrains Mono",
                  fontWeight: 700,
                }}
              >
                K{step.subscript}
              </span>
              <span
                style={{
                  fontSize: 16 * scale,
                  color: COLORS.value,
                  fontFamily: "JetBrains Mono",
                  fontWeight: 700,
                }}
              >
                V{step.subscript}
              </span>
              <span
                style={{
                  fontSize: 16 * scale,
                  color: COLORS.success,
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
            </div>
          ))}

          {/* No recalculation message */}
          <div
            style={{
              marginTop: 16 * scale,
              padding: `${10 * scale}px ${16 * scale}px`,
              backgroundColor: COLORS.success + "20",
              border: `${2 * scale}px solid ${COLORS.success}`,
              borderRadius: 8 * scale,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: 16 * scale,
                color: COLORS.success,
                fontWeight: 700,
              }}
            >
              ✨ No recalculation needed!
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render computations saved counter
  const renderComputationsSaved = () => {
    if (computationsSaved === 0 && currentStep < 1) return null;

    const counterSpring = spring({
      frame: localFrame - step2Start,
      fps,
      config: { damping: 15, stiffness: 100 },
    });

    return (
      <div
        style={{
          position: "absolute",
          top: 130 * scale,
          right: 80 * scale,
          opacity: currentStep >= 1 ? Math.min(counterSpring, 1) : 0,
          transform: `scale(${0.8 + counterSpring * 0.2})`,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.success + "20",
            borderRadius: 12 * scale,
            padding: `${16 * scale}px ${24 * scale}px`,
            border: `${3 * scale}px solid ${COLORS.success}`,
            boxShadow: `0 0 ${20 * scale}px ${COLORS.success}40`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 14 * scale,
              color: COLORS.success,
              fontWeight: 600,
              marginBottom: 8 * scale,
              letterSpacing: 1,
            }}
          >
            COMPUTATIONS SAVED
          </div>
          <div
            style={{
              fontSize: 48 * scale,
              fontWeight: 800,
              color: COLORS.success,
              fontFamily: "JetBrains Mono",
              textShadow: `0 0 ${20 * scale}px ${COLORS.success}`,
            }}
          >
            {computationsSaved}
          </div>
        </div>
      </div>
    );
  };

  // Render before/after comparison
  const renderComparison = () => {
    if (currentStep < 3) return null;

    const comparisonScale = spring({
      frame: localFrame - comparisonStart,
      fps,
      config: { damping: 15, stiffness: 80 },
    });

    return (
      <div
        style={{
          position: "absolute",
          bottom: 80 * scale,
          left: "50%",
          transform: `translateX(-50%) scale(${comparisonScale})`,
          opacity: comparisonProgress,
          display: "flex",
          gap: 40 * scale,
        }}
      >
        {/* Without Cache */}
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            padding: 24 * scale,
            border: `${3 * scale}px solid ${COLORS.error}`,
            width: 320 * scale,
          }}
        >
          <div
            style={{
              fontSize: 18 * scale,
              color: COLORS.error,
              fontWeight: 700,
              marginBottom: 16 * scale,
              textAlign: "center",
            }}
          >
            ❌ WITHOUT CACHE
          </div>

          {/* Crossed out computations */}
          {["Token 1 → K₁V₁", "Token 2 → K₁V₁ K₂V₂", "Token 3 → K₁V₁ K₂V₂ K₃V₃"].map(
            (text, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10 * scale,
                  marginBottom: i < 2 ? 10 * scale : 0,
                  padding: `${8 * scale}px ${12 * scale}px`,
                  backgroundColor: COLORS.error + "15",
                  borderRadius: 6 * scale,
                }}
              >
                <span
                  style={{
                    fontSize: 14 * scale,
                    color: COLORS.error,
                    textDecoration: "line-through",
                    flex: 1,
                  }}
                >
                  {text}
                </span>
                <span style={{ fontSize: 18 * scale }}>❌</span>
              </div>
            )
          )}

          <div
            style={{
              marginTop: 16 * scale,
              fontSize: 14 * scale,
              color: COLORS.error,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Recomputes ALL pairs every time
          </div>
        </div>

        {/* VS divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 28 * scale,
              fontWeight: 800,
              color: COLORS.text,
              backgroundColor: COLORS.surface,
              padding: `${16 * scale}px ${20 * scale}px`,
              borderRadius: 50,
              border: `${2 * scale}px solid ${COLORS.textDim}`,
            }}
          >
            VS
          </div>
        </div>

        {/* With Cache */}
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            padding: 24 * scale,
            border: `${3 * scale}px solid ${COLORS.success}`,
            width: 320 * scale,
            boxShadow: `0 0 ${30 * scale}px ${COLORS.success}30`,
          }}
        >
          <div
            style={{
              fontSize: 18 * scale,
              color: COLORS.success,
              fontWeight: 700,
              marginBottom: 16 * scale,
              textAlign: "center",
            }}
          >
            ✅ WITH KV CACHE
          </div>

          {/* Efficient lookups */}
          {[
            { text: "Token 1 → K₁V₁", action: "compute" },
            { text: "Token 2 → K₂V₂ + cache lookup", action: "lookup" },
            { text: "Token 3 → K₃V₃ + cache lookup", action: "lookup" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10 * scale,
                marginBottom: i < 2 ? 10 * scale : 0,
                padding: `${8 * scale}px ${12 * scale}px`,
                backgroundColor: COLORS.success + "15",
                borderRadius: 6 * scale,
              }}
            >
              <span
                style={{
                  fontSize: 14 * scale,
                  color: COLORS.success,
                  flex: 1,
                }}
              >
                {item.text}
              </span>
              <span style={{ fontSize: 18 * scale }}>✅</span>
            </div>
          ))}

          <div
            style={{
              marginTop: 16 * scale,
              fontSize: 14 * scale,
              color: COLORS.success,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Only computes NEW pairs!
          </div>
        </div>
      </div>
    );
  };

  // Render final insight / aha moment
  const renderInsight = () => {
    if (currentStep < 4) return null;

    const insightScale = spring({
      frame: localFrame - insightStart,
      fps,
      config: { damping: 12, stiffness: 80 },
    });

    return (
      <div
        style={{
          position: "absolute",
          bottom: 40 * scale,
          left: "50%",
          transform: `translateX(-50%) scale(${insightScale})`,
          opacity: insightProgress,
          textAlign: "center",
        }}
      >
        <div
          style={{
            backgroundColor: `rgba(46, 204, 113, 0.15)`,
            borderRadius: 20 * scale,
            padding: `${24 * scale}px ${48 * scale}px`,
            border: `${4 * scale}px solid ${COLORS.success}`,
            boxShadow: `0 0 ${50 * scale}px ${COLORS.success}50`,
          }}
        >
          <div
            style={{
              fontSize: 32 * scale,
              fontWeight: 800,
              color: COLORS.text,
              marginBottom: 12 * scale,
            }}
          >
            💡 THE KEY INSIGHT
          </div>
          <div
            style={{
              fontSize: 24 * scale,
              fontWeight: 600,
              color: COLORS.text,
              lineHeight: 1.5,
            }}
          >
            Each token adds{" "}
            <span style={{ color: COLORS.compute }}>one new K/V pair</span>.
            <br />
            The cache <span style={{ color: COLORS.cache }}>grows</span>, but
            work per token stays{" "}
            <span style={{ color: COLORS.success }}>constant</span>!
          </div>
        </div>
      </div>
    );
  };

  // Render step indicator
  const renderStepIndicator = () => {
    if (currentStep < 0 || currentStep > 2) return null;

    const stepDescriptions = [
      "STEP 1: Generate K₁,V₁ → Store in cache",
      "STEP 2: Generate K₂,V₂ → Store + REUSE K₁V₁ from cache",
      "STEP 3: Generate K₃,V₃ → Store + REUSE K₁V₁K₂V₂ from cache",
    ];

    return (
      <div
        style={{
          position: "absolute",
          top: 130 * scale,
          left: 80 * scale,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: `${12 * scale}px ${28 * scale}px`,
            backgroundColor: COLORS.surface,
            borderRadius: 12 * scale,
            border: `${2 * scale}px solid ${COLORS.compute}60`,
          }}
        >
          <span
            style={{
              fontSize: 18 * scale,
              color: COLORS.text,
              fontWeight: 600,
            }}
          >
            {stepDescriptions[currentStep]}
          </span>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Scene indicator */}
      <div style={{ ...getSceneIndicatorStyle(scale), opacity: titleOpacity }}>
        <span style={getSceneIndicatorTextStyle(scale)}>6</span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40 * scale,
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
            textShadow: `0 0 ${30 * scale}px ${COLORS.cache}40`,
          }}
        >
          The KV Cache Solution
        </h1>
      </div>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Current token being processed */}
      {renderCurrentToken()}

      {/* Store arrow */}
      {renderStoreArrow()}

      {/* Cache timeline */}
      {renderCacheTimeline()}

      {/* Reuse arrows and panel */}
      {renderReuseArrows()}

      {/* Computations saved counter */}
      {renderComputationsSaved()}

      {/* Before/After comparison */}
      {renderComparison()}

      {/* Final insight */}
      {renderInsight()}
    </AbsoluteFill>
  );
};

export default KVCacheScene;
