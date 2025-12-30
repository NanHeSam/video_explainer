/**
 * Scene 6: The KV Cache Solution
 *
 * Concrete step-by-step example showing how KV cache works:
 * 1. Token 1 generates K₁, V₁ → store in cache
 * 2. Token 2 generates K₂, V₂ → store, reuse K₁V₁ for attention
 * 3. Token 3 generates K₃, V₃ → store, reuse K₁V₁K₂V₂ for attention
 *
 * Visual: Growing memory box that expands with each cached K,V pair
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

interface Scene6KVCacheProps {
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
};

// Step data for the animation
const STEPS = [
  { token: "The", label: "Token 1", subscript: "₁" },
  { token: "cat", label: "Token 2", subscript: "₂" },
  { token: "sat", label: "Token 3", subscript: "₃" },
];

export const Scene6KVCache: React.FC<Scene6KVCacheProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings - each token step gets ~7 seconds
  const introEnd = fps * 3; // Title intro
  const step1Start = introEnd;
  const step1End = step1Start + fps * 7; // Token 1
  const step2Start = step1End;
  const step2End = step2Start + fps * 7; // Token 2
  const step3Start = step2End;
  const step3End = step3Start + fps * 7; // Token 3
  const insightStart = step3End;

  // Determine current step
  const getCurrentStep = () => {
    if (localFrame < step1Start) return -1;
    if (localFrame < step1End) return 0;
    if (localFrame < step2End) return 1;
    if (localFrame < step3End) return 2;
    return 3; // Insight phase
  };
  const currentStep = getCurrentStep();

  // Title opacity
  const titleOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Cache box expansion
  const cacheItemCount = Math.min(currentStep + 1, 3);
  const cacheWidth = interpolate(
    cacheItemCount,
    [0, 1, 2, 3],
    [200, 280, 420, 560],
    { extrapolateRight: "clamp" }
  );

  // Insight opacity
  const insightOpacity = interpolate(
    localFrame,
    [insightStart, insightStart + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
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
  const getPhaseProgress = (stepIndex: number, phase: "generate" | "store" | "reuse" | "attention") => {
    const progress = getStepProgress(stepIndex);
    switch (phase) {
      case "generate": // 0-30%
        return interpolate(progress, [0, 0.3], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      case "store": // 30-50%
        return interpolate(progress, [0.3, 0.5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      case "reuse": // 50-75%
        return interpolate(progress, [0.5, 0.75], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      case "attention": // 75-100%
        return interpolate(progress, [0.75, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
    }
  };

  // Render a single cached KV pair
  const renderCacheEntry = (index: number, isNew: boolean, opacity: number) => {
    const stepData = STEPS[index];
    const scaleSpring = spring({
      frame: localFrame - (index === 0 ? step1Start : index === 1 ? step2Start : step3Start) - fps * 1.5,
      fps,
      config: { damping: 12, stiffness: 100 },
    });
    const scale = isNew ? Math.min(scaleSpring, 1) * 0.2 + 0.8 : 1;

    return (
      <div
        key={index}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity,
          transform: `scale(${scale})`,
          padding: "8px 12px",
          backgroundColor: isNew ? COLORS.compute + "15" : "transparent",
          borderRadius: 8,
          border: isNew ? `2px solid ${COLORS.compute}40` : "2px solid transparent",
          transition: "background-color 0.3s, border 0.3s",
        }}
      >
        {/* Token label */}
        <div
          style={{
            fontSize: 12,
            color: isNew ? COLORS.compute : COLORS.textDim,
            fontWeight: 600,
          }}
        >
          {stepData.token}
        </div>

        {/* K vector */}
        <div
          style={{
            width: 80,
            height: 32,
            backgroundColor: isNew ? COLORS.key : COLORS.key + "60",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#000",
            fontFamily: "JetBrains Mono",
            boxShadow: isNew ? `0 0 12px ${COLORS.key}60` : "none",
          }}
        >
          K{stepData.subscript}
        </div>

        {/* V vector */}
        <div
          style={{
            width: 80,
            height: 32,
            backgroundColor: isNew ? COLORS.value : COLORS.value + "60",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#000",
            fontFamily: "JetBrains Mono",
            boxShadow: isNew ? `0 0 12px ${COLORS.value}60` : "none",
          }}
        >
          V{stepData.subscript}
        </div>
      </div>
    );
  };

  // Render the current token being processed
  const renderCurrentToken = () => {
    if (currentStep < 0 || currentStep > 2) return null;
    const stepData = STEPS[currentStep];
    const generateProgress = getPhaseProgress(currentStep, "generate");
    const storeProgress = getPhaseProgress(currentStep, "store");

    // Token fades out as it gets stored
    const tokenOpacity = interpolate(storeProgress, [0.5, 1], [1, 0.3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 200,
          opacity: generateProgress * tokenOpacity,
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
          {stepData.label}
        </div>
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: 24,
            border: `2px solid ${COLORS.compute}`,
            textAlign: "center",
            minWidth: 180,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.compute,
              marginBottom: 20,
            }}
          >
            "{stepData.token}"
          </div>

          {/* Generating K,V indicator */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: COLORS.key + "40",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.key,
                fontFamily: "JetBrains Mono",
              }}
            >
              → K{stepData.subscript}
            </div>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: COLORS.value + "40",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.value,
                fontFamily: "JetBrains Mono",
              }}
            >
              → V{stepData.subscript}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render arrow from token to cache
  const renderStoreArrow = () => {
    if (currentStep < 0 || currentStep > 2) return null;
    const storeProgress = getPhaseProgress(currentStep, "store");

    return (
      <svg
        style={{
          position: "absolute",
          left: 290,
          top: 280,
          width: 200,
          height: 60,
          opacity: storeProgress,
        }}
      >
        <defs>
          <marker
            id="storeArrow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.cache} />
          </marker>
        </defs>
        <line
          x1="10"
          y1="30"
          x2={10 + 160 * storeProgress}
          y2="30"
          stroke={COLORS.cache}
          strokeWidth="3"
          markerEnd={storeProgress > 0.5 ? "url(#storeArrow)" : ""}
        />
        <text
          x="90"
          y="18"
          fill={COLORS.cache}
          fontSize="14"
          textAnchor="middle"
          fontWeight="600"
        >
          store in cache
        </text>
      </svg>
    );
  };

  // Render attention reuse visualization
  const renderReuseVisualization = () => {
    if (currentStep < 1 || currentStep > 2) return null;
    const reuseProgress = getPhaseProgress(currentStep, "reuse");
    const attentionProgress = getPhaseProgress(currentStep, "attention");

    // Which cached entries to show being reused
    const reusedCount = currentStep; // Step 1 reuses 1, Step 2 reuses 2

    return (
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 180,
          opacity: reuseProgress,
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
          Reusing from cache
        </div>
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: 16,
            border: `2px solid ${COLORS.attention}40`,
          }}
        >
          {STEPS.slice(0, reusedCount).map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: i < reusedCount - 1 ? 8 : 0,
                padding: "6px 10px",
                backgroundColor: COLORS.attention + "15",
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: COLORS.textDim,
                  width: 36,
                }}
              >
                {step.token}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: COLORS.key,
                  fontFamily: "JetBrains Mono",
                  fontWeight: 600,
                }}
              >
                K{step.subscript}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: COLORS.value,
                  fontFamily: "JetBrains Mono",
                  fontWeight: 600,
                }}
              >
                V{step.subscript}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: COLORS.success,
                  fontWeight: 600,
                }}
              >
                ✓ cached
              </span>
            </div>
          ))}
        </div>

        {/* Attention indicator */}
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            opacity: attentionProgress,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: COLORS.success + "20",
              border: `1px solid ${COLORS.success}`,
              borderRadius: 8,
              fontSize: 14,
              color: COLORS.success,
              fontWeight: 600,
            }}
          >
            No recalculation needed!
          </div>
        </div>
      </div>
    );
  };

  // Render step indicator
  const renderStepIndicator = () => {
    if (currentStep < 0) return null;

    const stepDescriptions = [
      "Token 1: Generate K₁,V₁ → Store in cache",
      "Token 2: Generate K₂,V₂ → Store + Reuse K₁V₁",
      "Token 3: Generate K₃,V₃ → Store + Reuse K₁V₁K₂V₂",
    ];

    return (
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "10px 24px",
            backgroundColor: COLORS.surface,
            borderRadius: 24,
            border: `2px solid ${COLORS.compute}40`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              color: COLORS.text,
              fontWeight: 600,
            }}
          >
            {currentStep <= 2 ? stepDescriptions[currentStep] : "Cache grows with each token"}
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
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
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
          The KV Cache Solution
        </h1>
      </div>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Current token being processed */}
      {renderCurrentToken()}

      {/* Store arrow */}
      {renderStoreArrow()}

      {/* Growing Cache Box */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: currentStep >= 0 ? 1 : 0,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: COLORS.cache,
            fontWeight: 600,
            marginBottom: 12,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>📦</span>
          <span>KV Cache</span>
          <span
            style={{
              fontSize: 14,
              color: COLORS.textDim,
              fontWeight: 400,
            }}
          >
            (growing memory)
          </span>
        </div>

        {/* The cache box that grows */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: 20,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            border: `3px solid ${COLORS.cache}`,
            minWidth: cacheWidth,
            maxWidth: 600,
            justifyContent: "center",
            transition: "min-width 0.5s ease-out",
            boxShadow: `0 0 30px ${COLORS.cache}30`,
          }}
        >
          {/* Cached entries */}
          {currentStep >= 0 &&
            Array.from({ length: Math.min(currentStep + 1, 3) }).map((_, i) => {
              const isNew = i === currentStep && currentStep <= 2;
              const storeProgress = getPhaseProgress(i, "store");
              const opacity = i < currentStep ? 1 : storeProgress;
              return renderCacheEntry(i, isNew, opacity);
            })}

          {/* Empty slot indicators for remaining tokens */}
          {currentStep < 2 &&
            Array.from({ length: 2 - currentStep }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  opacity: 0.3,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.textDim,
                  }}
                >
                  ...
                </div>
                <div
                  style={{
                    width: 80,
                    height: 32,
                    backgroundColor: "#333",
                    borderRadius: 6,
                  }}
                />
                <div
                  style={{
                    width: 80,
                    height: 32,
                    backgroundColor: "#333",
                    borderRadius: 6,
                  }}
                />
              </div>
            ))}
        </div>
      </div>

      {/* Reuse visualization */}
      {renderReuseVisualization()}

      {/* Key insight */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: insightOpacity,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Each token adds <span style={{ color: COLORS.compute }}>one new pair</span>.
          {" "}The cache <span style={{ color: COLORS.cache }}>grows</span>,
          {" "}but work per token stays <span style={{ color: COLORS.success }}>constant</span>.
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene6KVCache;
