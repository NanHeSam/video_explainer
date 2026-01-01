/**
 * Scene 8: Impact & Conclusion
 *
 * Tie everything together and show real-world impact:
 * 1. Recap: KV Cache eliminates redundant computation
 * 2. Real numbers: Memory vs Speed tradeoff
 * 3. Industry adoption (GPT-4, Claude, etc.)
 * 4. Final takeaway
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

interface ImpactSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  success: "#00ff88",
  warning: "#f1c40f",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

export const ImpactScene: React.FC<ImpactSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const localFrame = frame - startFrame;
  const scale = Math.min(width / 1920, height / 1080);

  // Phase timings
  const phase1End = Math.round(durationInFrames * 0.20); // Recap
  const phase2End = Math.round(durationInFrames * 0.48); // Numbers
  const phase3End = Math.round(durationInFrames * 0.72); // Industry
  const phase4End = Math.round(durationInFrames * 1.00); // Takeaway

  // Animations
  const recapProgress = interpolate(localFrame, [0, phase1End], [0, 1], {
    extrapolateRight: "clamp",
  });

  const numbersProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const industryProgress = interpolate(
    localFrame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const takeawayProgress = interpolate(
    localFrame,
    [phase3End, phase4End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const takeawayScale = spring({
    frame: localFrame - phase3End,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Stats for animated counters
  const speedupValue = interpolate(
    localFrame,
    [phase1End + Math.round(durationInFrames * 0.04), phase1End + Math.round(durationInFrames * 0.12)],
    [1, 87],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const memoryValue = interpolate(
    localFrame,
    [phase1End + Math.round(durationInFrames * 0.08), phase1End + Math.round(durationInFrames * 0.16)],
    [0, 32],
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
      <div style={{ ...getSceneIndicatorStyle(scale), opacity: recapProgress }}>
        <span style={getSceneIndicatorTextStyle(scale)}>8</span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: recapProgress,
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
          The Impact of KV Caching
        </h1>
      </div>

      {/* Recap section */}
      <div
        style={{
          position: "absolute",
          top: 120 * scale,
          left: 80 * scale,
          right: 80 * scale,
          opacity: recapProgress,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40 * scale,
            marginBottom: 40 * scale,
          }}
        >
          {/* Before */}
          <div
            style={{
              flex: 1,
              maxWidth: 400 * scale,
              backgroundColor: COLORS.surface,
              borderRadius: 16 * scale,
              padding: 24 * scale,
              border: "2px solid #ff4757",
              opacity: interpolate(localFrame, [Math.round(durationInFrames * 0.02), Math.round(durationInFrames * 0.04)], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontSize: 20 * scale,
                fontWeight: 700,
                color: "#ff4757",
                marginBottom: 16 * scale,
                textAlign: "center",
              }}
            >
              Without KV Cache
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 16 * scale,
                color: COLORS.textDim,
              }}
            >
              <li style={{ marginBottom: 8 * scale }}>• Recompute K,V every token</li>
              <li style={{ marginBottom: 8 * scale }}>• O(n²) computation</li>
              <li style={{ marginBottom: 8 * scale }}>• ~40 tokens/second</li>
              <li>• GPU mostly waiting</li>
            </ul>
          </div>

          {/* After */}
          <div
            style={{
              flex: 1,
              maxWidth: 400 * scale,
              backgroundColor: COLORS.surface,
              borderRadius: 16 * scale,
              padding: 24 * scale,
              border: `2px solid ${COLORS.success}`,
              opacity: interpolate(localFrame, [Math.round(durationInFrames * 0.06), Math.round(durationInFrames * 0.08)], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontSize: 20 * scale,
                fontWeight: 700,
                color: COLORS.success,
                marginBottom: 16 * scale,
                textAlign: "center",
              }}
            >
              With KV Cache
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 16 * scale,
                color: COLORS.textDim,
              }}
            >
              <li style={{ marginBottom: 8 * scale }}>• Compute K,V once</li>
              <li style={{ marginBottom: 8 * scale }}>• O(n) computation</li>
              <li style={{ marginBottom: 8 * scale }}>• ~3,500 tokens/second</li>
              <li>• Efficient memory access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Numbers section */}
      <div
        style={{
          position: "absolute",
          top: 380 * scale,
          left: 80 * scale,
          right: 80 * scale,
          opacity: numbersProgress,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 80 * scale,
          }}
        >
          {/* Speedup */}
          <div
            style={{
              textAlign: "center",
              opacity: interpolate(
                localFrame,
                [phase1End, phase1End + Math.round(durationInFrames * 0.04)],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <div
              style={{
                fontSize: 72 * scale,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.success,
              }}
            >
              {Math.round(speedupValue)}×
            </div>
            <div style={{ fontSize: 18 * scale, color: COLORS.textDim }}>
              Faster Inference
            </div>
          </div>

          {/* Memory tradeoff */}
          <div
            style={{
              textAlign: "center",
              opacity: interpolate(
                localFrame,
                [phase1End + Math.round(durationInFrames * 0.04), phase1End + Math.round(durationInFrames * 0.08)],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <div
              style={{
                fontSize: 72 * scale,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.warning,
              }}
            >
              {Math.round(memoryValue)} GB
            </div>
            <div style={{ fontSize: 18 * scale, color: COLORS.textDim }}>
              Cache Memory (70B model)
            </div>
          </div>

          {/* Latency */}
          <div
            style={{
              textAlign: "center",
              opacity: interpolate(
                localFrame,
                [phase1End + Math.round(durationInFrames * 0.08), phase1End + Math.round(durationInFrames * 0.12)],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <div
              style={{
                fontSize: 72 * scale,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.primary,
              }}
            >
              &lt;50ms
            </div>
            <div style={{ fontSize: 18 * scale, color: COLORS.textDim }}>
              Per Token Latency
            </div>
          </div>
        </div>

        {/* Tradeoff note */}
        <div
          style={{
            textAlign: "center",
            marginTop: 32 * scale,
            fontSize: 16 * scale,
            color: COLORS.textDim,
            opacity: interpolate(
              localFrame,
              [phase1End + Math.round(durationInFrames * 0.12), phase1End + Math.round(durationInFrames * 0.16)],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          The classic tradeoff: <span style={{ color: COLORS.success }}>Speed</span> ↔{" "}
          <span style={{ color: COLORS.warning }}>Memory</span>
        </div>
      </div>

      {/* Industry adoption */}
      <div
        style={{
          position: "absolute",
          top: 560 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: industryProgress,
        }}
      >
        <div
          style={{
            fontSize: 20 * scale,
            color: COLORS.textDim,
            marginBottom: 24 * scale,
          }}
        >
          Used by every major LLM provider
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48 * scale,
          }}
        >
          {["GPT-4", "Claude", "Gemini", "LLaMA", "Mistral"].map((name, i) => (
            <div
              key={name}
              style={{
                padding: `${12 * scale}px ${24 * scale}px`,
                backgroundColor: COLORS.surface,
                borderRadius: 8 * scale,
                border: `1px solid ${COLORS.primary}40`,
                fontSize: 18 * scale,
                fontWeight: 600,
                color: COLORS.text,
                opacity: interpolate(
                  localFrame,
                  [phase2End + i * Math.round(durationInFrames * 0.015), phase2End + i * Math.round(durationInFrames * 0.015) + Math.round(durationInFrames * 0.01)],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                ),
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Final takeaway */}
      <div
        style={{
          position: "absolute",
          bottom: 80 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: takeawayProgress,
          transform: `scale(${0.8 + takeawayScale * 0.2})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.success + "15",
            border: `3px solid ${COLORS.success}`,
            borderRadius: 16 * scale,
            padding: `${24 * scale}px ${48 * scale}px`,
          }}
        >
          <div
            style={{
              fontSize: 32 * scale,
              fontWeight: 700,
              color: COLORS.success,
              marginBottom: 8 * scale,
            }}
          >
            KV Cache: The Foundation of Fast LLM Inference
          </div>
          <div
            style={{
              fontSize: 20 * scale,
              color: COLORS.text,
            }}
          >
            Trade memory for speed. Never recompute what you can remember.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default ImpactScene;
