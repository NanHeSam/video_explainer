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
import { COLORS as STYLE_COLORS, getSceneIndicatorStyle, getSceneIndicatorTextStyle } from "./styles";

interface BottleneckSceneProps {
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

export const BottleneckScene: React.FC<BottleneckSceneProps> = ({
  startFrame = 0,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Responsive scaling based on viewport size
  const scale = Math.min(width / 1920, height / 1080);

  // Phase timings - proportional to total scene duration
  const phase1End = Math.round(durationInFrames * 0.14); // Show the setup (~14%)
  const phase2End = Math.round(durationInFrames * 0.36); // Animate weight loading (~36%)
  const phase3End = Math.round(durationInFrames * 0.68); // Show the problem (~68%)
  const phase4End = Math.round(durationInFrames * 1.00); // Key insight (100%)

  // ===== PHASE 1: Introduce the setup =====
  const setupOpacity = interpolate(localFrame, [0, Math.round(durationInFrames * 0.02)], [0, 1], {
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
    [phase1End, phase1End + Math.round(durationInFrames * 0.09)],
    [100, 5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const memoryBandwidthUsage = interpolate(
    localFrame,
    [phase1End, phase1End + Math.round(durationInFrames * 0.09)],
    [10, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Problem highlight
  const problemOpacity = interpolate(
    localFrame,
    [phase2End, phase2End + Math.round(durationInFrames * 0.02)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ===== PHASE 4: Key insight text =====
  const insightOpacity = interpolate(
    localFrame,
    [phase3End, phase3End + Math.round(durationInFrames * 0.02)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Weight particles animation
  const numParticles = 12;
  const particleInterval = Math.round(durationInFrames * 0.01);
  const particleDuration = Math.round(durationInFrames * 0.07);
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const particleProgress = interpolate(
      localFrame,
      [
        phase1End + i * particleInterval,
        phase1End + i * particleInterval + particleDuration,
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
      {/* Scene indicator */}
      <div style={{ ...getSceneIndicatorStyle(scale), opacity: setupOpacity }}>
        <span style={getSceneIndicatorTextStyle(scale)}>3</span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: setupOpacity,
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
          The Decode Bottleneck
        </h1>
      </div>

      {/* Main visualization area */}
      <div
        style={{
          position: "absolute",
          top: 150 * scale,
          left: 100 * scale,
          right: 100 * scale,
          bottom: 200 * scale,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: setupOpacity,
        }}
      >
        {/* GPU Box */}
        <div
          style={{
            width: 360 * scale,
            height: 350 * scale,
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            border: `${2 * scale}px solid ${COLORS.compute}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 24 * scale,
            boxShadow: `0 0 ${30 * scale}px ${COLORS.compute}30`,
          }}
        >
          <div
            style={{
              fontSize: 28 * scale,
              fontWeight: 600,
              color: COLORS.compute,
              marginBottom: 16 * scale,
            }}
          >
            GPU
          </div>
          <div
            style={{
              fontSize: 18 * scale,
              color: COLORS.textDim,
              marginBottom: 24 * scale,
            }}
          >
            Tensor Cores
          </div>

          {/* GPU Utilization Bar */}
          <div
            style={{
              width: "100%",
              marginBottom: 8 * scale,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8 * scale,
              }}
            >
              <span style={{ fontSize: 16 * scale, color: COLORS.textDim }}>
                Compute Usage
              </span>
              <span
                style={{
                  fontSize: 16 * scale,
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
                height: 24 * scale,
                backgroundColor: "#333",
                borderRadius: 12 * scale,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${gpuUtilization}%`,
                  height: "100%",
                  backgroundColor:
                    gpuUtilization < 20 ? COLORS.problem : COLORS.compute,
                  borderRadius: 12 * scale,
                  transition: "width 0.1s",
                }}
              />
            </div>
          </div>

          {/* Status text */}
          <div
            style={{
              marginTop: 24 * scale,
              fontSize: 20 * scale,
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
              fontSize: 22 * scale,
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
            height: 120 * scale,
            margin: `0 ${40 * scale}px`,
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
              height: 40 * scale,
              transform: "translateY(-50%)",
              backgroundColor: "#333",
              borderRadius: 20 * scale,
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
                width: 16 * scale,
                height: 16 * scale,
                borderRadius: "50%",
                backgroundColor: COLORS.memory,
                opacity: progress > 0 && progress < 1 ? 0.8 : 0,
                boxShadow: `0 0 ${10 * scale}px ${COLORS.memory}`,
              }}
            />
          ))}

          {/* Label */}
          <div
            style={{
              position: "absolute",
              bottom: -30 * scale,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 16 * scale,
              color: COLORS.textDim,
            }}
          >
            Memory Bandwidth: 2 TB/s
          </div>

          {/* Bandwidth usage */}
          <div
            style={{
              position: "absolute",
              top: -30 * scale,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 16 * scale,
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
            width: 360 * scale,
            height: 350 * scale,
            backgroundColor: COLORS.surface,
            borderRadius: 16 * scale,
            border: `${2 * scale}px solid ${COLORS.memory}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 24 * scale,
            boxShadow: `0 0 ${30 * scale}px ${COLORS.memory}30`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 28 * scale,
              fontWeight: 600,
              color: COLORS.memory,
              marginBottom: 16 * scale,
            }}
          >
            GPU Memory
          </div>
          <div
            style={{
              fontSize: 18 * scale,
              color: COLORS.textDim,
              marginBottom: 24 * scale,
            }}
          >
            HBM (High Bandwidth Memory)
          </div>

          {/* Weight blocks */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8 * scale,
              width: "100%",
            }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  backgroundColor: COLORS.memory + "40",
                  borderRadius: 4 * scale,
                  border: `${1 * scale}px solid ${COLORS.memory}60`,
                }}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 24 * scale,
              fontSize: 38 * scale,
              fontWeight: 700,
              color: COLORS.memory,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            14 GB
          </div>
          <div
            style={{
              fontSize: 18 * scale,
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
          bottom: 140 * scale,
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
            border: `${2 * scale}px solid ${COLORS.problem}`,
            borderRadius: 12 * scale,
            padding: `${16 * scale}px ${32 * scale}px`,
          }}
        >
          <span
            style={{
              fontSize: 24 * scale,
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
          bottom: 80 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: insightOpacity,
        }}
      >
        <span
          style={{
            fontSize: 28 * scale,
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

export default BottleneckScene;
