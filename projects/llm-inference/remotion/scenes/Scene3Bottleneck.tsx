/**
 * Scene 3: The Decode Bottleneck
 *
 * Key insight: During decode, the GPU is mostly idle waiting for memory.
 * We must load 14GB of weights for EACH token, but memory bandwidth is limited.
 *
 * Visual metaphor: A fast factory (GPU) that sits idle because the delivery
 * truck (memory bus) can only bring materials so fast.
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

interface Scene3BottleneckProps {
  /** Scene start time in frames */
  startFrame?: number;
  /** Scene duration in frames */
  durationFrames?: number;
}

// Colors from design system
const COLORS = {
  background: "#0f0f1a",
  compute: "#00d9ff", // Cyan for compute
  memory: "#ff6b35", // Orange for memory
  problem: "#ff4757", // Red for problems
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

export const Scene3Bottleneck: React.FC<Scene3BottleneckProps> = ({
  startFrame = 0,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings (in local frames)
  const phase1End = fps * 3; // Show the setup
  const phase2End = fps * 8; // Animate weight loading
  const phase3End = fps * 15; // Show the problem
  const phase4End = fps * 22; // Key insight

  // ===== PHASE 1: Introduce the setup =====
  const setupOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ===== PHASE 2: Animate weight loading =====
  const weightFlowProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Token counter (appears during weight loading)
  const tokenCount = Math.floor(
    interpolate(localFrame, [phase1End, phase2End], [0, 3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // ===== PHASE 3: Show the bottleneck =====
  const gpuUtilization = interpolate(
    localFrame,
    [phase1End, phase1End + fps * 2],
    [100, 5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const memoryBandwidthUsage = interpolate(
    localFrame,
    [phase1End, phase1End + fps * 2],
    [10, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Problem highlight
  const problemOpacity = interpolate(
    localFrame,
    [phase2End, phase2End + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ===== PHASE 4: Key insight text =====
  const insightOpacity = interpolate(
    localFrame,
    [phase3End, phase3End + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Weight particles animation
  const numParticles = 12;
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const particleProgress = interpolate(
      localFrame,
      [
        phase1End + (i * fps) / 4,
        phase1End + (i * fps) / 4 + fps * 1.5,
      ],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return particleProgress;
  });

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
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: setupOpacity,
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
          The Decode Bottleneck
        </h1>
      </div>

      {/* Main visualization area */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 100,
          right: 100,
          bottom: 200,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: setupOpacity,
        }}
      >
        {/* GPU Box */}
        <div
          style={{
            width: 300,
            height: 350,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            border: `2px solid ${COLORS.compute}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 24,
            boxShadow: `0 0 30px ${COLORS.compute}30`,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.compute,
              marginBottom: 16,
            }}
          >
            GPU
          </div>
          <div
            style={{
              fontSize: 14,
              color: COLORS.textDim,
              marginBottom: 24,
            }}
          >
            Tensor Cores
          </div>

          {/* GPU Utilization Bar */}
          <div
            style={{
              width: "100%",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: COLORS.textDim }}>
                Compute Usage
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: gpuUtilization < 20 ? COLORS.problem : COLORS.compute,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {Math.round(gpuUtilization)}%
              </span>
            </div>
            <div
              style={{
                height: 24,
                backgroundColor: "#333",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${gpuUtilization}%`,
                  height: "100%",
                  backgroundColor:
                    gpuUtilization < 20 ? COLORS.problem : COLORS.compute,
                  borderRadius: 12,
                  transition: "width 0.1s",
                }}
              />
            </div>
          </div>

          {/* Status text */}
          <div
            style={{
              marginTop: 24,
              fontSize: 16,
              color: gpuUtilization < 20 ? COLORS.problem : COLORS.textDim,
              textAlign: "center",
              opacity: problemOpacity,
            }}
          >
            {gpuUtilization < 20 ? "Waiting for data..." : "Processing"}
          </div>

          {/* Token counter */}
          <div
            style={{
              marginTop: "auto",
              fontSize: 18,
              color: COLORS.text,
            }}
          >
            Tokens: <span style={{ fontFamily: "JetBrains Mono" }}>{tokenCount}</span>
          </div>
        </div>

        {/* Memory Bandwidth Pipe */}
        <div
          style={{
            flex: 1,
            height: 120,
            margin: "0 40px",
            position: "relative",
          }}
        >
          {/* Pipe background */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 40,
              transform: "translateY(-50%)",
              backgroundColor: "#333",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Bandwidth usage indicator */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, ${COLORS.memory}40 ${memoryBandwidthUsage}%, transparent ${memoryBandwidthUsage}%)`,
              }}
            />
          </div>

          {/* Weight particles */}
          {particles.map((progress, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: `${progress * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: COLORS.memory,
                opacity: progress > 0 && progress < 1 ? 0.8 : 0,
                boxShadow: `0 0 10px ${COLORS.memory}`,
              }}
            />
          ))}

          {/* Label */}
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 14,
              color: COLORS.textDim,
            }}
          >
            Memory Bandwidth: 2 TB/s
          </div>

          {/* Bandwidth usage */}
          <div
            style={{
              position: "absolute",
              top: -30,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 16,
              fontWeight: 600,
              color: memoryBandwidthUsage > 90 ? COLORS.memory : COLORS.textDim,
            }}
          >
            {Math.round(memoryBandwidthUsage)}% saturated
          </div>
        </div>

        {/* Memory Box */}
        <div
          style={{
            width: 300,
            height: 350,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            border: `2px solid ${COLORS.memory}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 24,
            boxShadow: `0 0 30px ${COLORS.memory}30`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.memory,
              marginBottom: 16,
            }}
          >
            GPU Memory
          </div>
          <div
            style={{
              fontSize: 14,
              color: COLORS.textDim,
              marginBottom: 24,
            }}
          >
            HBM (High Bandwidth Memory)
          </div>

          {/* Weight blocks */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              width: "100%",
            }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  backgroundColor: COLORS.memory + "40",
                  borderRadius: 4,
                  border: `1px solid ${COLORS.memory}60`,
                }}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.memory,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            14 GB
          </div>
          <div
            style={{
              fontSize: 14,
              color: COLORS.textDim,
            }}
          >
            Model Weights
          </div>
        </div>
      </div>

      {/* Problem callout */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: problemOpacity,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.problem + "20",
            border: `2px solid ${COLORS.problem}`,
            borderRadius: 12,
            padding: "16px 32px",
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.problem,
            }}
          >
            For each token: Load ALL 14GB of weights
          </span>
        </div>
      </div>

      {/* Key insight */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: insightOpacity,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.text,
          }}
        >
          We're not limited by compute. We're limited by{" "}
          <span style={{ color: COLORS.memory, fontWeight: 700 }}>
            memory bandwidth
          </span>
          .
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene3Bottleneck;
