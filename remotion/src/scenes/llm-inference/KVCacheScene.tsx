/**
 * Scene 6: The KV Cache Solution
 *
 * Key insight: Compute K,V once for each token, cache them forever.
 * This transforms O(n²) into O(n).
 *
 * Visual flow:
 * 1. Show problem recap (recomputing K,V)
 * 2. Introduce the cache concept
 * 3. Show cache growing as tokens are processed
 * 4. Show lookup vs recompute comparison
 * 5. "Compute once, remember forever"
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface KVCacheSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  compute: "#00d9ff",
  key: "#ff6b35",
  value: "#00ff88",
  cache: "#9b59b6", // Purple for cache
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  success: "#2ecc71",
  problem: "#ff4757",
};

const TOKENS = ["The", "cat", "sat", "on", "the", "mat"];

export const KVCacheScene: React.FC<KVCacheSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 4; // Problem recap
  const phase2End = fps * 10; // Introduce cache
  const phase3End = fps * 20; // Cache growing animation
  const phase4End = fps * 25; // Final insight

  // Current token being processed
  const currentTokenIndex = Math.min(
    TOKENS.length - 1,
    Math.floor(
      interpolate(localFrame, [phase2End, phase3End], [0, TOKENS.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Cache entries (tokens that have been processed)
  const cacheSize = localFrame > phase2End ? currentTokenIndex + 1 : 0;

  // Phase opacities
  const problemOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const solutionOpacity = interpolate(
    localFrame,
    [phase1End, phase1End + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const insightOpacity = interpolate(
    localFrame,
    [phase3End, phase3End + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Computation counter
  const naiveComputation = Math.floor(
    (currentTokenIndex * (currentTokenIndex + 1)) / 2
  );
  const cachedComputation = currentTokenIndex + 1;
  const savings = naiveComputation > 0
    ? Math.round((1 - cachedComputation / naiveComputation) * 100)
    : 0;

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
          opacity: problemOpacity,
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

      {/* Problem recap (left side) */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          width: 400,
          opacity: problemOpacity,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: COLORS.problem,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          ❌ Without Cache
        </div>
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: 20,
            border: `2px solid ${COLORS.problem}40`,
          }}
        >
          <div style={{ fontSize: 16, color: COLORS.textDim, marginBottom: 12 }}>
            For token {currentTokenIndex + 1}, recompute K,V for:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOKENS.slice(0, currentTokenIndex + 1).map((token, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    i === currentTokenIndex ? COLORS.compute + "40" : COLORS.problem + "20",
                  borderRadius: 6,
                  fontSize: 14,
                  color: i === currentTokenIndex ? COLORS.compute : COLORS.problem,
                  border: `1px solid ${i === currentTokenIndex ? COLORS.compute : COLORS.problem}40`,
                }}
              >
                {token}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 18,
              color: COLORS.problem,
              fontFamily: "JetBrains Mono",
            }}
          >
            Computations: {naiveComputation}
          </div>
        </div>
      </div>

      {/* Solution (right side) */}
      <div
        style={{
          position: "absolute",
          top: 120,
          right: 80,
          width: 400,
          opacity: solutionOpacity,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: COLORS.success,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          ✓ With KV Cache
        </div>
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: 20,
            border: `2px solid ${COLORS.success}40`,
          }}
        >
          <div style={{ fontSize: 16, color: COLORS.textDim, marginBottom: 12 }}>
            Only compute K,V for new token:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOKENS.slice(0, currentTokenIndex + 1).map((token, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    i === currentTokenIndex ? COLORS.compute + "40" : COLORS.cache + "20",
                  borderRadius: 6,
                  fontSize: 14,
                  color: i === currentTokenIndex ? COLORS.compute : COLORS.cache,
                  border: `1px solid ${i === currentTokenIndex ? COLORS.compute : COLORS.cache}40`,
                }}
              >
                {i === currentTokenIndex ? token : `${token} ✓`}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 18,
              color: COLORS.success,
              fontFamily: "JetBrains Mono",
            }}
          >
            Computations: {cachedComputation}
          </div>
        </div>
      </div>

      {/* KV Cache visualization */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: solutionOpacity,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: COLORS.cache,
            fontWeight: 600,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          KV Cache
        </div>

        {/* Cache stack */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 20,
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            border: `2px solid ${COLORS.cache}`,
            minWidth: 600,
            justifyContent: "center",
          }}
        >
          {TOKENS.slice(0, cacheSize).map((token, i) => {
            const isNew = i === cacheSize - 1 && localFrame > phase2End;
            const entryOpacity = interpolate(
              localFrame,
              [phase2End + (i / TOKENS.length) * (phase3End - phase2End),
               phase2End + ((i + 0.5) / TOKENS.length) * (phase3End - phase2End)],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  opacity: entryOpacity,
                  transform: `scale(${isNew ? 1.1 : 1})`,
                  transition: "transform 0.2s",
                }}
              >
                {/* Token */}
                <div
                  style={{
                    padding: "4px 8px",
                    backgroundColor: isNew ? COLORS.compute + "40" : COLORS.cache + "20",
                    borderRadius: 4,
                    fontSize: 12,
                    color: isNew ? COLORS.compute : COLORS.text,
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {token}
                </div>

                {/* K vector */}
                <div
                  style={{
                    width: 60,
                    height: 24,
                    backgroundColor: COLORS.key + (isNew ? "80" : "40"),
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  K{i + 1}
                </div>

                {/* V vector */}
                <div
                  style={{
                    width: 60,
                    height: 24,
                    backgroundColor: COLORS.value + (isNew ? "80" : "40"),
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  V{i + 1}
                </div>
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, TOKENS.length - cacheSize) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  opacity: 0.3,
                }}
              >
                <div
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#333",
                    borderRadius: 4,
                    fontSize: 12,
                    color: COLORS.textDim,
                  }}
                >
                  ...
                </div>
                <div
                  style={{
                    width: 60,
                    height: 24,
                    backgroundColor: "#333",
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: 60,
                    height: 24,
                    backgroundColor: "#333",
                    borderRadius: 4,
                  }}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Savings indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: solutionOpacity * (cacheSize > 1 ? 1 : 0),
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.success + "20",
            border: `2px solid ${COLORS.success}`,
            borderRadius: 12,
            padding: "12px 32px",
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.success,
              fontFamily: "JetBrains Mono",
            }}
          >
            {savings}% less computation
          </span>
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
          opacity: insightOpacity,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Compute once.{" "}
          <span style={{ color: COLORS.cache }}>Remember forever.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default KVCacheScene;
