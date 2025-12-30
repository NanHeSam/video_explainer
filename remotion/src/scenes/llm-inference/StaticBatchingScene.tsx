/**
 * Scene 9: The Static Batching Problem
 *
 * Key insight: Static batching makes short requests wait for long ones.
 * Empty slots waste compute when requests finish at different times.
 *
 * Visual flow:
 * 1. Show batch of 4 requests starting together
 * 2. Short request finishes but waits
 * 3. Show empty slots wasting compute
 * 4. Reveal inefficiency metrics
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface StaticBatchingSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  request1: "#00d9ff",
  request2: "#ff6b35",
  request3: "#00ff88",
  request4: "#f1c40f",
  waste: "#ff4757",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

// Requests with different lengths
const REQUESTS = [
  { id: 1, label: "2+2=?", tokens: 3, color: COLORS.request1 },
  { id: 2, label: "Essay...", tokens: 20, color: COLORS.request2 },
  { id: 3, label: "Hi!", tokens: 5, color: COLORS.request3 },
  { id: 4, label: "Code...", tokens: 15, color: COLORS.request4 },
];

const MAX_TOKENS = 20;

export const StaticBatchingScene: React.FC<StaticBatchingSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 3; // Intro
  const phase2End = fps * 15; // Animation running
  const phase3End = fps * 20; // Stats reveal
  const phase4End = fps * 22; // Final insight

  // Animation progress (0 to MAX_TOKENS)
  const tokenProgress = interpolate(
    localFrame,
    [phase1End, phase2End],
    [0, MAX_TOKENS],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Calculate stats
  const totalSlots = REQUESTS.length * MAX_TOKENS;
  const usedSlots = REQUESTS.reduce(
    (sum, r) => sum + Math.min(r.tokens, tokenProgress),
    0
  );
  const wastedSlots = REQUESTS.reduce((sum, r) => {
    if (tokenProgress > r.tokens) {
      return sum + (Math.min(tokenProgress, MAX_TOKENS) - r.tokens);
    }
    return sum;
  }, 0);
  const efficiency =
    tokenProgress > 0
      ? Math.round(((usedSlots - wastedSlots) / (REQUESTS.length * tokenProgress)) * 100)
      : 100;

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
          The Static Batching Problem
        </h1>
      </div>

      {/* Batch visualization */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          opacity: introOpacity,
        }}
      >
        {/* Request rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {REQUESTS.map((request, rowIndex) => {
            const isFinished = tokenProgress >= request.tokens;
            const currentTokens = Math.min(request.tokens, tokenProgress);
            const waitingTokens = isFinished
              ? Math.min(tokenProgress, MAX_TOKENS) - request.tokens
              : 0;

            return (
              <div
                key={request.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {/* Request label */}
                <div
                  style={{
                    width: 100,
                    padding: "8px 12px",
                    backgroundColor: request.color + "30",
                    borderRadius: 8,
                    border: `2px solid ${request.color}`,
                    fontSize: 14,
                    fontWeight: 600,
                    color: request.color,
                    textAlign: "center",
                  }}
                >
                  {request.label}
                </div>

                {/* Token progress bar */}
                <div
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: COLORS.surface,
                    borderRadius: 8,
                    display: "flex",
                    overflow: "hidden",
                    border: "1px solid #333",
                  }}
                >
                  {/* Active tokens */}
                  {Array.from({ length: Math.ceil(currentTokens) }).map((_, i) => (
                    <div
                      key={`active-${i}`}
                      style={{
                        width: `${100 / MAX_TOKENS}%`,
                        height: "100%",
                        backgroundColor: request.color + "80",
                        borderRight: "1px solid #222",
                      }}
                    />
                  ))}

                  {/* Waiting/wasted slots */}
                  {Array.from({ length: Math.ceil(waitingTokens) }).map((_, i) => (
                    <div
                      key={`waiting-${i}`}
                      style={{
                        width: `${100 / MAX_TOKENS}%`,
                        height: "100%",
                        backgroundColor: COLORS.waste + "40",
                        borderRight: "1px solid #222",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 10, color: COLORS.waste }}>
                        WAIT
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status */}
                <div
                  style={{
                    width: 80,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: isFinished ? COLORS.waste : COLORS.primary,
                  }}
                >
                  {isFinished ? "Waiting..." : `${Math.floor(currentTokens)}/${request.tokens}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <span style={{ color: COLORS.textDim, fontSize: 14 }}>
            Decode Step:
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              backgroundColor: COLORS.surface,
              borderRadius: 4,
            }}
          >
            <div
              style={{
                width: `${(tokenProgress / MAX_TOKENS) * 100}%`,
                height: "100%",
                backgroundColor: COLORS.primary,
                borderRadius: 4,
              }}
            />
          </div>
          <span
            style={{
              color: COLORS.primary,
              fontSize: 14,
              fontFamily: "JetBrains Mono",
            }}
          >
            {Math.floor(tokenProgress)}/{MAX_TOKENS}
          </span>
        </div>

        {/* Problem explanation */}
        <div
          style={{
            textAlign: "center",
            padding: 20,
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            border: `1px solid ${COLORS.waste}40`,
          }}
        >
          <div style={{ fontSize: 18, color: COLORS.text, marginBottom: 8 }}>
            Short request{" "}
            <span style={{ color: COLORS.request1, fontWeight: 700 }}>
              "2+2=?"
            </span>{" "}
            finished at step 3
          </div>
          <div style={{ fontSize: 16, color: COLORS.waste }}>
            But must wait until step {MAX_TOKENS} for the batch to complete
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 60,
          opacity: statsOpacity,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color: COLORS.waste,
            }}
          >
            {Math.round(wastedSlots)}
          </div>
          <div style={{ fontSize: 14, color: COLORS.textDim }}>
            Wasted Compute Slots
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color: efficiency > 50 ? COLORS.primary : COLORS.waste,
            }}
          >
            {efficiency}%
          </div>
          <div style={{ fontSize: 14, color: COLORS.textDim }}>
            Batch Efficiency
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
          Static batching:{" "}
          <span style={{ color: COLORS.waste, fontWeight: 700 }}>
            everyone waits for the slowest request
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default StaticBatchingScene;
