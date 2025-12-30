/**
 * Scene 10: The Memory Fragmentation Problem
 *
 * Key insight: Pre-allocating max-length buffers wastes memory.
 * Most responses are short, but we allocate for the worst case.
 *
 * Visual flow:
 * 1. Show memory pre-allocation for 4096 tokens
 * 2. Show actual usage (200 tokens average)
 * 3. Reveal 95% memory waste
 * 4. Show fragmentation building up
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface MemoryFragmentationSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  allocated: "#ff6b35",
  used: "#00ff88",
  wasted: "#ff4757",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

const MAX_TOKENS = 4096;
const SEQUENCES = [
  { id: 1, actualTokens: 150, label: "Req 1" },
  { id: 2, actualTokens: 320, label: "Req 2" },
  { id: 3, actualTokens: 80, label: "Req 3" },
  { id: 4, actualTokens: 250, label: "Req 4" },
  { id: 5, actualTokens: 120, label: "Req 5" },
  { id: 6, actualTokens: 180, label: "Req 6" },
];

export const MemoryFragmentationScene: React.FC<MemoryFragmentationSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 3; // Show allocation
  const phase2End = fps * 10; // Reveal actual usage
  const phase3End = fps * 17; // Stats
  const phase4End = fps * 22; // Final insight

  // Animation progress
  const allocationProgress = interpolate(
    localFrame,
    [fps * 1, phase1End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const usageRevealProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Calculate stats
  const totalAllocated = SEQUENCES.length * MAX_TOKENS;
  const totalUsed = SEQUENCES.reduce((sum, s) => sum + s.actualTokens, 0);
  const wastePercentage = Math.round((1 - totalUsed / totalAllocated) * 100);

  // Animations
  const introOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const statsOpacity = interpolate(
    localFrame,
    [phase2End, phase2End + fps],
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
          Memory Fragmentation
        </h1>
      </div>

      {/* Memory visualization */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          opacity: introOpacity,
        }}
      >
        {/* GPU Memory label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: COLORS.surface,
              borderRadius: 8,
              border: "1px solid #444",
              fontSize: 14,
              color: COLORS.textDim,
            }}
          >
            GPU Memory (40 GB)
          </div>
          <div
            style={{
              marginLeft: 20,
              fontSize: 14,
              color: COLORS.textDim,
            }}
          >
            Pre-allocate {MAX_TOKENS} tokens per sequence
          </div>
        </div>

        {/* Memory blocks */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {SEQUENCES.map((seq, index) => {
            const showAllocation = allocationProgress > index / SEQUENCES.length;
            const usedPercent = (seq.actualTokens / MAX_TOKENS) * 100;
            const showUsage = usageRevealProgress > index / SEQUENCES.length;

            return (
              <div
                key={seq.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: showAllocation ? 1 : 0.3,
                  transition: "opacity 0.3s",
                }}
              >
                {/* Label */}
                <div
                  style={{
                    width: 60,
                    fontSize: 14,
                    color: COLORS.textDim,
                    textAlign: "right",
                  }}
                >
                  {seq.label}
                </div>

                {/* Memory bar */}
                <div
                  style={{
                    flex: 1,
                    height: 48,
                    backgroundColor: COLORS.surface,
                    borderRadius: 8,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid #333",
                  }}
                >
                  {/* Allocated (full bar) */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: COLORS.allocated + "30",
                      borderRight: `3px solid ${COLORS.allocated}`,
                    }}
                  />

                  {/* Actually used */}
                  {showUsage && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${usedPercent}%`,
                        height: "100%",
                        backgroundColor: COLORS.used + "60",
                        borderRight: `3px solid ${COLORS.used}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLORS.used,
                        }}
                      >
                        {seq.actualTokens} tokens
                      </span>
                    </div>
                  )}

                  {/* Wasted indicator */}
                  {showUsage && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: `${usedPercent + 2}%`,
                        transform: "translateY(-50%)",
                        fontSize: 11,
                        color: COLORS.wasted,
                        opacity: 0.8,
                      }}
                    >
                      {Math.round(100 - usedPercent)}% wasted
                    </div>
                  )}
                </div>

                {/* Size indicator */}
                <div
                  style={{
                    width: 100,
                    fontSize: 12,
                    color: COLORS.allocated,
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {showUsage
                    ? `${seq.actualTokens}/${MAX_TOKENS}`
                    : `${MAX_TOKENS} alloc`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginBottom: 20,
            opacity: usageRevealProgress,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: COLORS.allocated + "30",
                border: `2px solid ${COLORS.allocated}`,
                borderRadius: 4,
              }}
            />
            <span style={{ fontSize: 14, color: COLORS.allocated }}>
              Pre-allocated
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: COLORS.used + "60",
                border: `2px solid ${COLORS.used}`,
                borderRadius: 4,
              }}
            />
            <span style={{ fontSize: 14, color: COLORS.used }}>
              Actually Used
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 80,
          opacity: statsOpacity,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color: COLORS.wasted,
            }}
          >
            {wastePercentage}%
          </div>
          <div style={{ fontSize: 14, color: COLORS.textDim }}>
            Memory Wasted
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color: COLORS.allocated,
            }}
          >
            97
          </div>
          <div style={{ fontSize: 14, color: COLORS.textDim }}>
            Max Sequences (could be 2000+)
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
            [phase3End, phase4End],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <span style={{ fontSize: 22, color: COLORS.text }}>
          Pre-allocation causes{" "}
          <span style={{ color: COLORS.wasted, fontWeight: 700 }}>
            20x efficiency loss
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default MemoryFragmentationScene;
