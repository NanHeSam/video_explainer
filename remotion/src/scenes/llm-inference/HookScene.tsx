/**
 * Scene 1: The Speed Problem (Hook)
 *
 * Goal: Grab attention with the dramatic speed difference
 * 40 tokens/second → 3,500 tokens/second = 87x improvement
 *
 * Visual flow:
 * 1. Show a prompt being typed
 * 2. Tokens appear slowly (naive approach)
 * 3. Counter shows 40 tok/s
 * 4. Reset and show optimized version
 * 5. Tokens stream rapidly
 * 6. "87x faster" reveal
 * 7. "This is how they do it" hook
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

interface HookSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  secondary: "#ff6b35",
  success: "#00ff88",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

const PROMPT = "Explain how transformers work";
const RESPONSE_TOKENS = [
  "Transformers", "are", "neural", "networks", "that", "use",
  "attention", "mechanisms", "to", "process", "sequences", "in", "parallel,",
  "enabling", "much", "faster", "training", "and", "inference", "compared",
  "to", "recurrent", "neural", "networks.", "The", "key", "innovation",
  "is", "the", "self-attention", "mechanism,", "which", "allows", "each",
  "token", "to", "attend", "to", "every", "other", "token", "in", "the",
  "sequence.", "This", "parallel", "processing", "capability", "makes",
  "transformers", "ideal", "for", "modern", "hardware", "like", "GPUs",
  "and", "TPUs,", "enabling", "massive", "speedups", "in", "both",
  "training", "and", "inference", "workloads.", "Combined", "with",
  "techniques", "like", "KV", "caching,", "batching,", "and", "quantization,",
  "modern", "LLMs", "can", "achieve", "remarkable", "throughput.",
];

export const HookScene: React.FC<HookSceneProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 2; // Show prompt
  const phase2End = fps * 7; // Slow tokens (40 tok/s demo)
  const phase3End = fps * 9; // Pause
  const phase4End = fps * 11; // Show optimized
  const phase5End = fps * 13; // Fast tokens
  const phase6End = fps * 15; // Reveal 87x

  // Prompt typing animation
  const promptProgress = interpolate(localFrame, [0, phase1End], [0, 1], {
    extrapolateRight: "clamp",
  });
  const visiblePromptChars = Math.floor(promptProgress * PROMPT.length);

  // Slow token generation (simulated 40 tok/s = 1 token per 0.75s for visual effect)
  const slowTokenCount = Math.min(
    RESPONSE_TOKENS.length,
    Math.floor(
      interpolate(localFrame, [phase1End, phase2End], [0, 12], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Speed counter for slow mode
  const slowSpeed = interpolate(
    localFrame,
    [phase1End + fps * 0.5, phase2End],
    [0, 40],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fast token generation (all at once for effect)
  const showOptimized = localFrame > phase3End;
  const fastTokenCount = showOptimized
    ? Math.min(
        RESPONSE_TOKENS.length,
        Math.floor(
          interpolate(localFrame, [phase4End, phase4End + fps * 0.5], [0, RESPONSE_TOKENS.length], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        )
      )
    : 0;

  // Speed counter for fast mode
  const fastSpeed = interpolate(
    localFrame,
    [phase4End, phase5End],
    [40, 3500],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 87x reveal
  const revealProgress = interpolate(
    localFrame,
    [phase5End, phase6End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const revealScale = spring({
    frame: localFrame - phase5End,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Which mode are we showing?
  const showingFast = localFrame > phase3End;
  const currentTokens = showingFast ? fastTokenCount : slowTokenCount;
  const currentSpeed = showingFast ? fastSpeed : slowSpeed;

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
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(localFrame, [0, fps * 0.5], [0, 1]),
        }}
      >
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
          }}
        >
          LLM Inference
        </h1>
        <p
          style={{
            fontSize: 24,
            color: COLORS.textDim,
            marginTop: 8,
          }}
        >
          How fast can we generate tokens?
        </p>
      </div>

      {/* Chat interface */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
        }}
      >
        {/* User prompt */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.primary + "30",
              border: `1px solid ${COLORS.primary}50`,
              borderRadius: 16,
              borderBottomRightRadius: 4,
              padding: "16px 24px",
              maxWidth: "70%",
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: COLORS.text,
              }}
            >
              {PROMPT.slice(0, visiblePromptChars)}
              <span
                style={{
                  opacity: Math.sin(localFrame * 0.3) > 0 ? 1 : 0,
                  color: COLORS.primary,
                }}
              >
                |
              </span>
            </span>
          </div>
        </div>

        {/* AI response */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            opacity: localFrame > phase1End ? 1 : 0,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid #333`,
              borderRadius: 16,
              borderBottomLeftRadius: 4,
              padding: "16px 24px",
              maxWidth: "80%",
              minHeight: 60,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {RESPONSE_TOKENS.slice(0, currentTokens).map((token, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 20,
                    color: COLORS.text,
                    backgroundColor: showingFast
                      ? COLORS.success + "20"
                      : COLORS.secondary + "20",
                    padding: "4px 8px",
                    borderRadius: 4,
                  }}
                >
                  {token}
                </span>
              ))}
              {currentTokens < RESPONSE_TOKENS.length && (
                <span
                  style={{
                    fontSize: 20,
                    color: COLORS.textDim,
                    opacity: Math.sin(localFrame * 0.2) > 0 ? 1 : 0.3,
                  }}
                >
                  ▋
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Speed indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: localFrame > phase1End ? 1 : 0,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: COLORS.textDim,
            marginBottom: 8,
          }}
        >
          {showingFast ? "Optimized" : "Naive Approach"}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
            color: showingFast ? COLORS.success : COLORS.secondary,
          }}
        >
          {Math.round(currentSpeed).toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 24,
            color: COLORS.textDim,
          }}
        >
          tokens/second
        </div>
      </div>

      {/* 87x faster reveal */}
      {revealProgress > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: revealProgress,
            transform: `scale(${0.5 + revealScale * 0.5})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: COLORS.success + "20",
              border: `3px solid ${COLORS.success}`,
              borderRadius: 16,
              padding: "16px 48px",
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.success,
              }}
            >
              87× faster
            </span>
          </div>
        </div>
      )}

      {/* Hook text */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(
            localFrame,
            [phase6End - fps * 0.5, phase6End],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <span
          style={{
            fontSize: 28,
            color: COLORS.text,
            fontStyle: "italic",
          }}
        >
          This is how they do it.
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default HookScene;
