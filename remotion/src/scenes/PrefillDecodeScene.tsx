import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";
import { TokenRow } from "../components/TokenRow";
import { GPUGauge } from "../components/GPUGauge";

// Timing constants (in frames at 30fps)
const FPS = 30;
const BEAT_1_START = 0; // Setup: 0-5s
const BEAT_2_START = 5 * FPS; // Prefill intro: 5-15s
const BEAT_3_START = 15 * FPS; // GPU Prefill: 15-22s
const BEAT_4_START = 22 * FPS; // Transition: 22-27s
const BEAT_5_START = 27 * FPS; // Decode sequential: 27-38s
const BEAT_6_START = 38 * FPS; // GPU Decode: 38-48s
const BEAT_7_START = 48 * FPS; // Comparison: 48-55s
const BEAT_8_START = 55 * FPS; // Implication: 55-60s

const TOTAL_DURATION = 60 * FPS; // 60 seconds

export interface PrefillDecodeSceneProps {
  prompt?: string;
  inputTokens?: string[];
  outputTokens?: string[];
}

export const PrefillDecodeScene: React.FC<PrefillDecodeSceneProps> = ({
  prompt = "Explain quantum computing",
  inputTokens = ["Explain", "quantum", "computing"],
  outputTokens = ["Quantum", "computing", "is", "a", "type", "of"],
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // --- Beat 1: Prompt typing animation ---
  const promptVisible = frame >= BEAT_1_START;
  const promptChars = Math.min(
    prompt.length,
    Math.floor((frame - BEAT_1_START) / 2)
  );
  const displayedPrompt = prompt.slice(0, promptChars);

  // Prompt shrinks and moves after beat 1
  const promptScale = interpolate(
    frame,
    [BEAT_2_START - 15, BEAT_2_START],
    [1, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const promptY = interpolate(
    frame,
    [BEAT_2_START - 15, BEAT_2_START],
    [height / 2 - 50, 60],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const promptOpacity = interpolate(
    frame,
    [BEAT_4_START, BEAT_4_START + 15],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // --- Beat 2-3: Prefill section ---
  const prefillVisible = frame >= BEAT_2_START - 10;
  const prefillOpacity = interpolate(
    frame,
    [BEAT_2_START - 10, BEAT_2_START],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Prefill tokens activate simultaneously at beat 2 + 3 seconds
  const prefillActivateAt = BEAT_2_START + 3 * fps;

  // --- Beat 4: Transition to split view ---
  const isSplitView = frame >= BEAT_4_START;

  // Prefill section moves to left
  const prefillX = interpolate(
    frame,
    [BEAT_4_START, BEAT_4_START + 15],
    [width / 2, width / 4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );
  const prefillSectionScale = interpolate(
    frame,
    [BEAT_4_START, BEAT_4_START + 15],
    [1, 0.85],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const prefillSectionOpacity = interpolate(
    frame,
    [BEAT_4_START, BEAT_4_START + 15],
    [1, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Divider
  const dividerOpacity = interpolate(
    frame,
    [BEAT_4_START + 10, BEAT_4_START + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // --- Beat 5-6: Decode section ---
  const decodeVisible = frame >= BEAT_4_START + 15;
  const decodeOpacity = interpolate(
    frame,
    [BEAT_4_START + 15, BEAT_4_START + 25],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Decode tokens activate sequentially starting at beat 5
  const decodeActivateAt = BEAT_5_START;
  const decodeTokenDelay = 25; // Slower for emphasis

  // --- Beat 7-8: Final comparison view ---
  const comparisonHighlight = frame >= BEAT_7_START;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Beat 1: Prompt */}
      {promptVisible && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: promptY,
            transform: `translateX(-50%) scale(${promptScale})`,
            opacity: promptOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a2e",
              padding: "20px 32px",
              borderRadius: 12,
              border: "1px solid #3a3a4a",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 32,
                color: "#e0e0e0",
              }}
            >
              {displayedPrompt}
              <span
                style={{
                  opacity: Math.sin(frame / 8) > 0 ? 1 : 0,
                  color: "#00d9ff",
                }}
              >
                |
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Prefill Section */}
      {prefillVisible && (
        <div
          style={{
            position: "absolute",
            left: prefillX,
            top: "50%",
            transform: `translate(-50%, -50%) scale(${prefillSectionScale})`,
            opacity: prefillOpacity * prefillSectionOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          <TokenRow
            tokens={inputTokens}
            mode={frame >= prefillActivateAt ? "prefill" : "inactive"}
            activateAt={prefillActivateAt}
            label="PREFILL"
            showLabel={frame >= BEAT_2_START + 2 * fps}
          />

          {/* GPU Gauge for Prefill */}
          {frame >= BEAT_3_START - 10 && (
            <GPUGauge
              utilization={100}
              animateAt={BEAT_3_START}
              animationDuration={20}
              status="compute"
              label="GPU Utilization"
            />
          )}
        </div>
      )}

      {/* Divider */}
      {isSplitView && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "20%",
            height: "60%",
            width: 2,
            backgroundColor: "#3a3a4a",
            transform: "translateX(-50%)",
            opacity: dividerOpacity,
          }}
        />
      )}

      {/* Decode Section */}
      {decodeVisible && (
        <div
          style={{
            position: "absolute",
            left: (3 * width) / 4,
            top: "50%",
            transform: "translate(-50%, -50%) scale(0.85)",
            opacity: decodeOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          <TokenRow
            tokens={outputTokens}
            mode={frame >= decodeActivateAt ? "decode" : "inactive"}
            activateAt={decodeActivateAt}
            tokenDelay={decodeTokenDelay}
            label="DECODE"
            showLabel={true}
          />

          {/* GPU Gauge for Decode */}
          {frame >= BEAT_6_START - 10 && (
            <GPUGauge
              utilization={5}
              animateAt={BEAT_6_START}
              animationDuration={20}
              status="memory"
              label="GPU Utilization"
            />
          )}
        </div>
      )}

      {/* Beat 7-8: Summary text */}
      {frame >= BEAT_7_START && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: interpolate(
              frame,
              [BEAT_7_START, BEAT_7_START + 15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 24,
              color: "#a0a0a0",
              textAlign: "center",
            }}
          >
            Two phases, completely different bottlenecks
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default PrefillDecodeScene;
