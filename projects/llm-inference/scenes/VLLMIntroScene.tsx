/**
 * Scene: Introducing vLLM
 *
 * Transition scene after the problems section to introduce vLLM
 * as the example we'll use to explain LLM inference optimizations.
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

interface VLLMIntroSceneProps {
  startFrame?: number;
  sceneNumber?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  vllm: "#ff6b35",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  success: "#00ff88",
};

export const VLLMIntroScene: React.FC<VLLMIntroSceneProps> = ({
  startFrame = 0,
  sceneNumber = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const localFrame = frame - startFrame;

  // Title fade in
  const titleOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // vLLM logo/text appears
  const vllmProgress = spring({
    frame: localFrame - 30,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Subtitle appears
  const subtitleOpacity = interpolate(localFrame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Features appear one by one
  const features = [
    { icon: "KV", text: "KV Cache Optimization", color: "#9b59b6" },
    { icon: "CB", text: "Continuous Batching", color: "#00d9ff" },
    { icon: "PA", text: "PagedAttention", color: "#00ff88" },
  ];

  const getFeatureOpacity = (index: number) => {
    const start = 100 + index * 30;
    return interpolate(localFrame, [start, start + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // Final insight
  const insightOpacity = interpolate(
    localFrame,
    [durationInFrames - 60, durationInFrames - 40],
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
      {/* Scene indicator */}
      <div style={{ ...getSceneIndicatorStyle(scale), opacity: titleOpacity }}>
        <span style={getSceneIndicatorTextStyle(scale)}>{sceneNumber}</span>
      </div>

      {/* Setup text */}
      <div
        style={{
          position: "absolute",
          top: 80 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <span
          style={{
            fontSize: 28 * scale,
            color: COLORS.textDim,
            fontWeight: 500,
          }}
        >
          To understand these optimizations, let's look at...
        </span>
      </div>

      {/* vLLM Main Title */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * vllmProgress})`,
          opacity: vllmProgress,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120 * scale,
            fontWeight: 800,
            background: `linear-gradient(135deg, ${COLORS.vllm}, ${COLORS.primary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "-2px",
          }}
        >
          vLLM
        </div>
        <div
          style={{
            fontSize: 24 * scale,
            color: COLORS.textDim,
            marginTop: 12 * scale,
            opacity: subtitleOpacity,
          }}
        >
          A high-throughput LLM serving engine
        </div>
      </div>

      {/* Key optimizations */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40 * scale,
            justifyContent: "center",
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                opacity: getFeatureOpacity(i),
                transform: `translateY(${(1 - getFeatureOpacity(i)) * 20}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12 * scale,
              }}
            >
              <div
                style={{
                  width: 70 * scale,
                  height: 70 * scale,
                  borderRadius: 16 * scale,
                  backgroundColor: feature.color + "20",
                  border: `3px solid ${feature.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 30px ${feature.color}40`,
                }}
              >
                <span
                  style={{
                    fontSize: 22 * scale,
                    fontWeight: 700,
                    color: feature.color,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {feature.icon}
                </span>
              </div>
              <span
                style={{
                  fontSize: 18 * scale,
                  color: COLORS.text,
                  fontWeight: 500,
                  textAlign: "center",
                  maxWidth: 140 * scale,
                }}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key insight at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: insightOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.surface,
            border: `3px solid ${COLORS.primary}`,
            borderRadius: 16 * scale,
            padding: `${20 * scale}px ${40 * scale}px`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 24 * scale,
              color: COLORS.text,
            }}
          >
            Let's dive into how{" "}
            <span style={{ color: COLORS.vllm, fontWeight: 700 }}>vLLM</span>{" "}
            solves each problem
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default VLLMIntroScene;
