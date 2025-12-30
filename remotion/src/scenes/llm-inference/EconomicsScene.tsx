/**
 * Scene 16: The Economics of Scale
 *
 * Key insight: Real numbers show how expensive inference is,
 * and why every optimization matters.
 *
 * Visual flow:
 * 1. 1M users calculation
 * 2. GPU requirements
 * 3. Monthly cost
 * 4. Impact of 2x throughput improvement
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

interface EconomicsSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  money: "#2ecc71",
  cost: "#ff6b35",
  savings: "#00ff88",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

export const EconomicsScene: React.FC<EconomicsSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 6; // Requirements calculation
  const phase2End = fps * 14; // Cost reveal
  const phase3End = fps * 22; // Optimization impact
  const phase4End = fps * 30; // Final insight

  // Animated counters
  const usersCounter = interpolate(
    localFrame,
    [fps * 1, fps * 3],
    [0, 1000000],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const tokensCounter = interpolate(
    localFrame,
    [fps * 2, fps * 4],
    [0, 50000000],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const gpusCounter = interpolate(
    localFrame,
    [phase1End, phase1End + fps * 2],
    [0, 25000],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const costCounter = interpolate(
    localFrame,
    [phase1End + fps * 2, phase2End],
    [0, 50],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animations
  const introOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const optimizationOpacity = interpolate(
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
          The Economics of Scale
        </h1>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          opacity: introOpacity,
        }}
      >
        {/* Calculation chain */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          {/* Users */}
          <div
            style={{
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              border: `2px solid ${COLORS.primary}`,
              textAlign: "center",
              minWidth: 160,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.primary,
              }}
            >
              {Math.round(usersCounter).toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              Concurrent Users
            </div>
          </div>

          <div style={{ fontSize: 24, color: COLORS.textDim }}>×</div>

          {/* Tokens per user */}
          <div
            style={{
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              border: "1px solid #333",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.text,
              }}
            >
              50
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              tokens/sec each
            </div>
          </div>

          <div style={{ fontSize: 24, color: COLORS.textDim }}>=</div>

          {/* Total throughput */}
          <div
            style={{
              padding: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              border: `2px solid ${COLORS.cost}`,
              textAlign: "center",
              minWidth: 180,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.cost,
              }}
            >
              {Math.round(tokensCounter / 1000000)}M
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim }}>
              tokens/sec total
            </div>
          </div>
        </div>

        {/* GPU and Cost calculation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginBottom: 40,
            opacity: interpolate(
              localFrame,
              [phase1End, phase1End + fps * 0.5],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          {/* GPU requirement */}
          <div
            style={{
              padding: 24,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: "1px solid #333",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, color: COLORS.textDim, marginBottom: 8 }}>
              At 2,000 tok/s per GPU
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.cost,
              }}
            >
              {Math.round(gpusCounter).toLocaleString()}
            </div>
            <div style={{ fontSize: 18, color: COLORS.text }}>GPUs Required</div>
          </div>

          {/* Monthly cost */}
          <div
            style={{
              padding: 24,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              border: `2px solid ${COLORS.cost}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, color: COLORS.textDim, marginBottom: 8 }}>
              At $2/GPU-hour
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: COLORS.cost,
              }}
            >
              ${Math.round(costCounter)}M
            </div>
            <div style={{ fontSize: 18, color: COLORS.text }}>Per Month</div>
          </div>
        </div>

        {/* Optimization impact */}
        <div
          style={{
            padding: 24,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            border: `2px solid ${COLORS.savings}`,
            opacity: optimizationOpacity,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: COLORS.text,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Impact of 2× Throughput Improvement
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 40,
            }}
          >
            {/* Before */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 8 }}>
                Before
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: "JetBrains Mono",
                  color: COLORS.cost,
                }}
              >
                $50M/mo
              </div>
              <div style={{ fontSize: 14, color: COLORS.textDim }}>
                25,000 GPUs
              </div>
            </div>

            {/* Arrow */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  padding: "8px 16px",
                  backgroundColor: COLORS.savings + "20",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.savings,
                }}
              >
                2× faster
              </div>
              <div style={{ fontSize: 24, color: COLORS.savings }}>→</div>
            </div>

            {/* After */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 8 }}>
                After
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: "JetBrains Mono",
                  color: COLORS.savings,
                }}
              >
                $25M/mo
              </div>
              <div style={{ fontSize: 14, color: COLORS.textDim }}>
                12,500 GPUs
              </div>
            </div>

            {/* Savings */}
            <div
              style={{
                padding: 16,
                backgroundColor: COLORS.savings + "15",
                borderRadius: 12,
                border: `2px solid ${COLORS.savings}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.savings,
                }}
              >
                $25M
              </div>
              <div style={{ fontSize: 14, color: COLORS.savings }}>
                Monthly Savings
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
            [phase3End, phase4End],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <span style={{ fontSize: 22, color: COLORS.text }}>
          Every optimization in this video{" "}
          <span style={{ color: COLORS.savings, fontWeight: 700 }}>
            directly reduces your infrastructure bill
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default EconomicsScene;
