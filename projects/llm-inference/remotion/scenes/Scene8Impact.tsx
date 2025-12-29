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

interface Scene8ImpactProps {
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

export const Scene8Impact: React.FC<Scene8ImpactProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 5; // Recap
  const phase2End = fps * 12; // Numbers
  const phase3End = fps * 18; // Industry
  const phase4End = fps * 25; // Takeaway

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
    [phase1End + fps, phase1End + fps * 3],
    [1, 87],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const memoryValue = interpolate(
    localFrame,
    [phase1End + fps * 2, phase1End + fps * 4],
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
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: recapProgress,
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
          The Impact of KV Caching
        </h1>
      </div>

      {/* Recap section */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          opacity: recapProgress,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* Before */}
          <div
            style={{
              flex: 1,
              maxWidth: 400,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: 24,
              border: "2px solid #ff4757",
              opacity: interpolate(localFrame, [fps * 0.5, fps * 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#ff4757",
                marginBottom: 16,
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
                fontSize: 16,
                color: COLORS.textDim,
              }}
            >
              <li style={{ marginBottom: 8 }}>• Recompute K,V every token</li>
              <li style={{ marginBottom: 8 }}>• O(n²) computation</li>
              <li style={{ marginBottom: 8 }}>• ~40 tokens/second</li>
              <li>• GPU mostly waiting</li>
            </ul>
          </div>

          {/* After */}
          <div
            style={{
              flex: 1,
              maxWidth: 400,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: 24,
              border: `2px solid ${COLORS.success}`,
              opacity: interpolate(localFrame, [fps * 1.5, fps * 2], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.success,
                marginBottom: 16,
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
                fontSize: 16,
                color: COLORS.textDim,
              }}
            >
              <li style={{ marginBottom: 8 }}>• Compute K,V once</li>
              <li style={{ marginBottom: 8 }}>• O(n) computation</li>
              <li style={{ marginBottom: 8 }}>• ~3,500 tokens/second</li>
              <li>• Efficient memory access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Numbers section */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: 80,
          right: 80,
          opacity: numbersProgress,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 80,
          }}
        >
          {/* Speedup */}
          <div
            style={{
              textAlign: "center",
              opacity: interpolate(
                localFrame,
                [phase1End, phase1End + fps],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.success,
              }}
            >
              {Math.round(speedupValue)}×
            </div>
            <div style={{ fontSize: 18, color: COLORS.textDim }}>
              Faster Inference
            </div>
          </div>

          {/* Memory tradeoff */}
          <div
            style={{
              textAlign: "center",
              opacity: interpolate(
                localFrame,
                [phase1End + fps, phase1End + fps * 2],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.warning,
              }}
            >
              {Math.round(memoryValue)} GB
            </div>
            <div style={{ fontSize: 18, color: COLORS.textDim }}>
              Cache Memory (70B model)
            </div>
          </div>

          {/* Latency */}
          <div
            style={{
              textAlign: "center",
              opacity: interpolate(
                localFrame,
                [phase1End + fps * 2, phase1End + fps * 3],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.primary,
              }}
            >
              &lt;50ms
            </div>
            <div style={{ fontSize: 18, color: COLORS.textDim }}>
              Per Token Latency
            </div>
          </div>
        </div>

        {/* Tradeoff note */}
        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: 16,
            color: COLORS.textDim,
            opacity: interpolate(
              localFrame,
              [phase1End + fps * 3, phase1End + fps * 4],
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
          top: 560,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: industryProgress,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: COLORS.textDim,
            marginBottom: 24,
          }}
        >
          Used by every major LLM provider
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
          }}
        >
          {["GPT-4", "Claude", "Gemini", "LLaMA", "Mistral"].map((name, i) => (
            <div
              key={name}
              style={{
                padding: "12px 24px",
                backgroundColor: COLORS.surface,
                borderRadius: 8,
                border: `1px solid ${COLORS.primary}40`,
                fontSize: 18,
                fontWeight: 600,
                color: COLORS.text,
                opacity: interpolate(
                  localFrame,
                  [phase2End + i * 10, phase2End + i * 10 + fps * 0.3],
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
          bottom: 80,
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
            borderRadius: 16,
            padding: "24px 48px",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.success,
              marginBottom: 8,
            }}
          >
            KV Cache: The Foundation of Fast LLM Inference
          </div>
          <div
            style={{
              fontSize: 20,
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

export default Scene8Impact;
