/**
 * Scene 2: The Two Phases
 *
 * Key insight: LLM inference has two distinct phases with different characteristics
 * - Prefill: Process ALL input tokens in parallel (compute-bound)
 * - Decode: Generate output tokens one-by-one (memory-bound)
 *
 * Visual flow:
 * 1. Show input prompt tokens
 * 2. PREFILL: All tokens light up simultaneously
 * 3. Show GPU utilization at 100%
 * 4. Transition to decode
 * 5. DECODE: Tokens appear one at a time
 * 6. Show GPU waiting
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Scene2PhasesProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  prefill: "#00d9ff", // Cyan for prefill/compute
  decode: "#ff6b35", // Orange for decode/memory
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
  active: "#00ff88",
};

const INPUT_TOKENS = ["What", "is", "the", "capital", "of", "France", "?"];
const OUTPUT_TOKENS = ["The", "capital", "of", "France", "is", "Paris", "."];

export const Scene2Phases: React.FC<Scene2PhasesProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 3; // Show input tokens
  const phase2End = fps * 7; // Prefill animation
  const phase3End = fps * 10; // Transition
  const phase4End = fps * 18; // Decode animation
  const phase5End = fps * 20; // Summary

  // Prefill animation - all tokens light up at once
  const prefillProgress = interpolate(
    localFrame,
    [phase1End, phase1End + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // GPU utilization during prefill
  const prefillGPU = interpolate(
    localFrame,
    [phase1End, phase1End + fps],
    [10, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Decode animation - tokens appear one by one
  const decodeStartFrame = phase3End;
  const tokensPerSecond = 1.5; // Slower for visibility
  const decodeTokenCount = Math.min(
    OUTPUT_TOKENS.length,
    Math.floor(
      interpolate(
        localFrame,
        [decodeStartFrame, phase4End],
        [0, OUTPUT_TOKENS.length],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    )
  );

  // GPU utilization during decode (drops significantly)
  const decodeGPU = interpolate(
    localFrame,
    [phase3End, phase3End + fps],
    [100, 15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Current phase
  const inPrefill = localFrame >= phase1End && localFrame < phase3End;
  const inDecode = localFrame >= phase3End;
  const currentGPU = inDecode ? decodeGPU : inPrefill ? prefillGPU : 10;

  // Phase labels
  const showPrefillLabel = localFrame > phase1End;
  const showDecodeLabel = localFrame > phase3End;

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
          opacity: interpolate(localFrame, [0, fps * 0.5], [0, 1]),
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
          The Two Phases of Inference
        </h1>
      </div>

      {/* Split view container */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 60,
          right: 60,
          bottom: 150,
          display: "flex",
          gap: 40,
        }}
      >
        {/* PREFILL SIDE */}
        <div
          style={{
            flex: 1,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 24,
            border: `2px solid ${inPrefill ? COLORS.prefill : "#333"}`,
            opacity: interpolate(localFrame, [0, fps], [0, 1]),
            transition: "border-color 0.3s",
          }}
        >
          {/* Prefill header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.prefill,
                }}
              >
                PREFILL
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.textDim,
                  marginTop: 4,
                }}
              >
                Process input tokens
              </div>
            </div>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: COLORS.prefill + "20",
                borderRadius: 8,
                fontSize: 14,
                color: COLORS.prefill,
                fontWeight: 600,
                opacity: showPrefillLabel ? 1 : 0,
              }}
            >
              PARALLEL
            </div>
          </div>

          {/* Input tokens */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {INPUT_TOKENS.map((token, i) => {
              const isActive = prefillProgress > 0;
              return (
                <div
                  key={i}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: isActive
                      ? COLORS.prefill + "30"
                      : COLORS.surface,
                    border: `2px solid ${isActive ? COLORS.prefill : "#444"}`,
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 500,
                    color: isActive ? COLORS.prefill : COLORS.text,
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s",
                    boxShadow: isActive
                      ? `0 0 20px ${COLORS.prefill}40`
                      : "none",
                  }}
                >
                  {token}
                </div>
              );
            })}
          </div>

          {/* Prefill description */}
          <div
            style={{
              fontSize: 16,
              color: COLORS.textDim,
              lineHeight: 1.6,
              opacity: showPrefillLabel ? 1 : 0,
            }}
          >
            All {INPUT_TOKENS.length} tokens processed{" "}
            <span style={{ color: COLORS.prefill, fontWeight: 600 }}>
              simultaneously
            </span>{" "}
            in one forward pass. GPU tensor cores at full utilization.
          </div>
        </div>

        {/* DECODE SIDE */}
        <div
          style={{
            flex: 1,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 24,
            border: `2px solid ${inDecode ? COLORS.decode : "#333"}`,
            opacity: interpolate(localFrame, [phase2End, phase3End], [0.5, 1]),
            transition: "border-color 0.3s",
          }}
        >
          {/* Decode header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.decode,
                }}
              >
                DECODE
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.textDim,
                  marginTop: 4,
                }}
              >
                Generate output tokens
              </div>
            </div>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: COLORS.decode + "20",
                borderRadius: 8,
                fontSize: 14,
                color: COLORS.decode,
                fontWeight: 600,
                opacity: showDecodeLabel ? 1 : 0,
              }}
            >
              SEQUENTIAL
            </div>
          </div>

          {/* Output tokens */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 32,
              minHeight: 100,
            }}
          >
            {OUTPUT_TOKENS.slice(0, decodeTokenCount).map((token, i) => {
              const isLatest = i === decodeTokenCount - 1;
              return (
                <div
                  key={i}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: isLatest
                      ? COLORS.decode + "30"
                      : COLORS.active + "20",
                    border: `2px solid ${isLatest ? COLORS.decode : COLORS.active}`,
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 500,
                    color: isLatest ? COLORS.decode : COLORS.active,
                    boxShadow: isLatest
                      ? `0 0 20px ${COLORS.decode}40`
                      : "none",
                  }}
                >
                  {token}
                </div>
              );
            })}
            {decodeTokenCount < OUTPUT_TOKENS.length && inDecode && (
              <div
                style={{
                  padding: "12px 20px",
                  backgroundColor: "transparent",
                  border: `2px dashed #444`,
                  borderRadius: 8,
                  fontSize: 18,
                  color: COLORS.textDim,
                  opacity: Math.sin(localFrame * 0.2) > 0 ? 1 : 0.3,
                }}
              >
                ...
              </div>
            )}
          </div>

          {/* Decode description */}
          <div
            style={{
              fontSize: 16,
              color: COLORS.textDim,
              lineHeight: 1.6,
              opacity: showDecodeLabel ? 1 : 0,
            }}
          >
            Tokens generated{" "}
            <span style={{ color: COLORS.decode, fontWeight: 600 }}>
              one at a time
            </span>
            . Each token requires loading all model weights from memory.
          </div>
        </div>
      </div>

      {/* GPU Utilization Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          right: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 18, color: COLORS.text, fontWeight: 600 }}>
            GPU Compute Utilization
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color:
                currentGPU > 80
                  ? COLORS.prefill
                  : currentGPU < 30
                  ? COLORS.decode
                  : COLORS.text,
            }}
          >
            {Math.round(currentGPU)}%
          </span>
        </div>
        <div
          style={{
            height: 32,
            backgroundColor: "#333",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${currentGPU}%`,
              height: "100%",
              backgroundColor:
                currentGPU > 80 ? COLORS.prefill : COLORS.decode,
              borderRadius: 16,
              transition: "width 0.3s, background-color 0.3s",
              boxShadow: `0 0 20px ${currentGPU > 80 ? COLORS.prefill : COLORS.decode}60`,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 14,
            color: COLORS.textDim,
          }}
        >
          <span>Compute-bound (prefill)</span>
          <span>Memory-bound (decode)</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene2Phases;
