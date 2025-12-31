/**
 * Scene: More Optimizations Transition
 *
 * Transition scene after PagedAttention to introduce
 * the remaining optimizations (Quantization, Speculative Decoding).
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

interface MoreOptimizationsSceneProps {
  startFrame?: number;
  sceneNumber?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  success: "#00ff88",
  warning: "#f1c40f",
  purple: "#9b59b6",
};

export const MoreOptimizationsScene: React.FC<MoreOptimizationsSceneProps> = ({
  startFrame = 0,
  sceneNumber = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const localFrame = frame - startFrame;

  // Title fade in
  const titleOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Checkmarks for completed topics
  const completedTopics = [
    { name: "KV Cache", color: "#9b59b6" },
    { name: "Continuous Batching", color: "#00d9ff" },
    { name: "PagedAttention", color: "#00ff88" },
  ];

  const getCheckOpacity = (index: number) => {
    const start = 30 + index * 20;
    return spring({
      frame: localFrame - start,
      fps,
      config: { damping: 15, stiffness: 120 },
    });
  };

  // "But wait, there's more" text
  const moreTextOpacity = interpolate(localFrame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Upcoming topics
  const upcomingTopics = [
    { name: "Quantization", icon: "Q4", description: "Smaller, faster models" },
    { name: "Speculative Decoding", icon: "2x", description: "Parallel token prediction" },
  ];

  const getUpcomingOpacity = (index: number) => {
    const start = 140 + index * 30;
    return interpolate(localFrame, [start, start + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
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
        <span style={getSceneIndicatorTextStyle(scale)}>{sceneNumber}</span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 52 * scale,
            fontWeight: 700,
            color: STYLE_COLORS.primary,
            margin: 0,
          }}
        >
          We've Covered a Lot...
        </h1>
      </div>

      {/* Completed topics with checkmarks */}
      <div
        style={{
          position: "absolute",
          top: 160 * scale,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 50 * scale,
            justifyContent: "center",
          }}
        >
          {completedTopics.map((topic, i) => {
            const progress = getCheckOpacity(i);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12 * scale,
                  opacity: progress,
                  transform: `scale(${0.8 + 0.2 * progress})`,
                }}
              >
                <div
                  style={{
                    width: 36 * scale,
                    height: 36 * scale,
                    borderRadius: "50%",
                    backgroundColor: COLORS.success + "30",
                    border: `3px solid ${COLORS.success}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 20 * scale,
                      color: COLORS.success,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 22 * scale,
                    color: topic.color,
                    fontWeight: 600,
                  }}
                >
                  {topic.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* "But there's more" transition */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: moreTextOpacity,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 36 * scale,
            color: COLORS.warning,
            fontWeight: 600,
          }}
        >
          But wait, there's more!
        </span>
      </div>

      {/* Upcoming topics */}
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 60 * scale,
            justifyContent: "center",
          }}
        >
          {upcomingTopics.map((topic, i) => {
            const progress = getUpcomingOpacity(i);
            return (
              <div
                key={i}
                style={{
                  opacity: progress,
                  transform: `translateY(${(1 - progress) * 30}px)`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: 20 * scale,
                    padding: `${30 * scale}px ${40 * scale}px`,
                    border: `3px solid ${COLORS.primary}`,
                    boxShadow: `0 0 30px ${COLORS.primary}30`,
                    minWidth: 220 * scale,
                  }}
                >
                  <div
                    style={{
                      fontSize: 40 * scale,
                      fontWeight: 800,
                      color: COLORS.primary,
                      fontFamily: "JetBrains Mono, monospace",
                      marginBottom: 12 * scale,
                    }}
                  >
                    {topic.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 24 * scale,
                      fontWeight: 700,
                      color: COLORS.text,
                      marginBottom: 8 * scale,
                    }}
                  >
                    {topic.name}
                  </div>
                  <div
                    style={{
                      fontSize: 16 * scale,
                      color: COLORS.textDim,
                    }}
                  >
                    {topic.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 80 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: getUpcomingOpacity(1),
        }}
      >
        <span
          style={{
            fontSize: 22 * scale,
            color: COLORS.textDim,
          }}
        >
          Two more powerful techniques to maximize LLM performance
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default MoreOptimizationsScene;
