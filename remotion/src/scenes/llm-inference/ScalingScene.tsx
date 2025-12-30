/**
 * Scene 15: Scaling to Millions
 *
 * Key insight: Scale vertically (tensor/pipeline parallelism) and
 * horizontally (replicas) to serve millions of users.
 *
 * Visual flow:
 * 1. Single GPU limit
 * 2. Tensor parallelism - split layers across GPUs
 * 3. Pipeline parallelism - chain GPUs
 * 4. Horizontal scaling - replicas with load balancer
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface ScalingSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  tensor: "#ff6b35",
  pipeline: "#9b59b6",
  horizontal: "#00ff88",
  gpu: "#f1c40f",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

export const ScalingScene: React.FC<ScalingSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 6; // Tensor parallelism
  const phase2End = fps * 12; // Pipeline parallelism
  const phase3End = fps * 20; // Horizontal scaling
  const phase4End = fps * 28; // Summary

  // Animations
  const introOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const tensorOpacity = interpolate(
    localFrame,
    [fps * 1, fps * 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pipelineOpacity = interpolate(
    localFrame,
    [phase1End, phase1End + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const horizontalOpacity = interpolate(
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
          Scaling to Millions
        </h1>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 60,
          right: 60,
          opacity: introOpacity,
        }}
      >
        {/* Three scaling approaches */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 32,
          }}
        >
          {/* Tensor Parallelism */}
          <div
            style={{
              flex: 1,
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: `2px solid ${COLORS.tensor}`,
              opacity: tensorOpacity,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.tensor,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Tensor Parallelism
            </div>

            {/* Visual: Layer split across GPUs */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.textDim }}>
                One Layer Split Across GPUs
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  width: "100%",
                  height: 48,
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.gpu + "60",
                      borderRadius: 6,
                      border: `2px solid ${COLORS.gpu}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.gpu,
                    }}
                  >
                    GPU {i}
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.tensor,
                  textAlign: "center",
                }}
              >
                ↕ All-reduce sync
              </div>
            </div>

            <div style={{ fontSize: 12, color: COLORS.textDim, textAlign: "center" }}>
              Split weight matrices across GPUs
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "6px 12px",
                backgroundColor: COLORS.tensor + "20",
                borderRadius: 6,
                textAlign: "center",
                fontSize: 12,
                color: COLORS.tensor,
              }}
            >
              Requires NVLink (fast interconnect)
            </div>
          </div>

          {/* Pipeline Parallelism */}
          <div
            style={{
              flex: 1,
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: `2px solid ${COLORS.pipeline}`,
              opacity: pipelineOpacity,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.pipeline,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Pipeline Parallelism
            </div>

            {/* Visual: GPUs in sequence */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.textDim }}>
                Different Layers on Each GPU
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {[
                  { label: "GPU 0", layers: "L1-8" },
                  { label: "GPU 1", layers: "L9-16" },
                  { label: "GPU 2", layers: "L17-24" },
                  { label: "GPU 3", layers: "L25-32" },
                ].map((gpu, i) => (
                  <React.Fragment key={i}>
                    <div
                      style={{
                        width: 60,
                        height: 56,
                        backgroundColor: COLORS.gpu + "60",
                        borderRadius: 6,
                        border: `2px solid ${COLORS.gpu}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: COLORS.gpu,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{gpu.label}</span>
                      <span style={{ fontSize: 9, color: COLORS.textDim }}>
                        {gpu.layers}
                      </span>
                    </div>
                    {i < 3 && (
                      <span style={{ color: COLORS.pipeline, fontSize: 14 }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: COLORS.textDim, textAlign: "center" }}>
              Chain GPUs sequentially
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "6px 12px",
                backgroundColor: COLORS.pipeline + "20",
                borderRadius: 6,
                textAlign: "center",
                fontSize: 12,
                color: COLORS.pipeline,
              }}
            >
              Lower communication overhead
            </div>
          </div>

          {/* Horizontal Scaling */}
          <div
            style={{
              flex: 1,
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: `2px solid ${COLORS.horizontal}`,
              opacity: horizontalOpacity,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.horizontal,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Horizontal Scaling
            </div>

            {/* Visual: Load balancer with replicas */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {/* Load balancer */}
              <div
                style={{
                  padding: "6px 16px",
                  backgroundColor: COLORS.primary + "40",
                  borderRadius: 6,
                  border: `2px solid ${COLORS.primary}`,
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.primary,
                }}
              >
                Load Balancer
              </div>

              {/* Arrows */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  color: COLORS.textDim,
                  fontSize: 12,
                }}
              >
                <span>↓</span>
                <span>↓</span>
                <span>↓</span>
              </div>

              {/* Replicas */}
              <div style={{ display: "flex", gap: 8 }}>
                {["R1", "R2", "R3"].map((replica) => (
                  <div
                    key={replica}
                    style={{
                      width: 48,
                      height: 40,
                      backgroundColor: COLORS.horizontal + "40",
                      borderRadius: 6,
                      border: `2px solid ${COLORS.horizontal}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.horizontal,
                    }}
                  >
                    {replica}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: COLORS.textDim, textAlign: "center" }}>
              Independent model replicas
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "6px 12px",
                backgroundColor: COLORS.horizontal + "20",
                borderRadius: 6,
                textAlign: "center",
                fontSize: 12,
                color: COLORS.horizontal,
              }}
            >
              Linearly scalable
            </div>
          </div>
        </div>

        {/* Combined approach */}
        <div
          style={{
            padding: 24,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            border: "1px solid #333",
            opacity: interpolate(
              localFrame,
              [phase3End, phase3End + fps],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: COLORS.text,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Production Setup: Combine All Approaches
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 24,
            }}
          >
            {/* Example config */}
            <div
              style={{
                padding: 16,
                backgroundColor: "#222",
                borderRadius: 8,
                fontFamily: "JetBrains Mono",
                fontSize: 14,
              }}
            >
              <div style={{ color: COLORS.tensor }}>TP=4</div>
              <div style={{ color: COLORS.pipeline }}>PP=2</div>
              <div style={{ color: COLORS.horizontal }}>Replicas=1000+</div>
            </div>

            <div style={{ color: COLORS.textDim, fontSize: 24 }}>=</div>

            {/* Result */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: "JetBrains Mono",
                  color: COLORS.primary,
                }}
              >
                8+ GPUs/replica
              </div>
              <div style={{ fontSize: 14, color: COLORS.textDim }}>
                Thousands of total GPUs
              </div>
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
            [phase3End + fps, phase4End],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <span style={{ fontSize: 22, color: COLORS.text }}>
          Smart routing sends similar requests to same replica for{" "}
          <span style={{ color: COLORS.primary, fontWeight: 700 }}>
            better cache hits
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default ScalingScene;
