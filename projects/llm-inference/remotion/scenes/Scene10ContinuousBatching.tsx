/**
 * Scene 10: Continuous Batching
 *
 * Key insight: Unlike static batching where all sequences must complete before
 * accepting new ones, continuous batching fills empty slots immediately.
 *
 * A slot is a fixed memory allocation for one sequence in the GPU batch.
 *
 * Visual flow:
 * 1. Define what a "slot" is - fixed memory allocation for one sequence
 * 2. Show GPU with 4 labeled slots (Slot 1, Slot 2, Slot 3, Slot 4)
 * 3. Show sequences processing in slots
 * 4. When a sequence finishes, immediately show a NEW sequence entering
 * 5. Contrast with static batching text callout
 * 6. Show new sequences entering while others are still processing
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

interface Scene10ContinuousBatchingProps {
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
  gpu: "#2d2d44",
  gpuBorder: "#00d9ff",
  slotEmpty: "#3a3a4a",
  slotLabel: "#aabbcc",
  newSequence: "#ffcc00",
  // Sequence colors
  seq1: "#00d9ff", // Cyan
  seq2: "#ff6b35", // Orange
  seq3: "#9b59b6", // Purple
  seq4: "#00ff88", // Green
  seq5: "#ffcc00", // Yellow (new incoming)
  seq6: "#ff69b4", // Pink (new incoming)
  seq7: "#87ceeb", // Sky blue (new incoming)
};

// Initial sequences with different completion times (in steps)
const INITIAL_SEQUENCES = [
  { id: "A", completesAt: 4, color: COLORS.seq1 },
  { id: "B", completesAt: 8, color: COLORS.seq2 },
  { id: "C", completesAt: 6, color: COLORS.seq3 },
  { id: "D", completesAt: 10, color: COLORS.seq4 },
];

// New sequences that enter when slots become available
const INCOMING_SEQUENCES = [
  { id: "E", color: COLORS.seq5, arrivesAfter: 4 }, // Enters after A finishes
  { id: "F", color: COLORS.seq6, arrivesAfter: 6 }, // Enters after C finishes
  { id: "G", color: COLORS.seq7, arrivesAfter: 8 }, // Enters after B finishes
];

const TOTAL_STEPS = 12;
const SLOT_WIDTH = 180;
const SLOT_HEIGHT = 80;

export const Scene10ContinuousBatching: React.FC<Scene10ContinuousBatchingProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 4;   // Slot definition
  const phase2End = fps * 8;   // Show GPU with 4 labeled slots
  const phase3End = fps * 18;  // Animation - sequences processing and new ones entering
  const phase4End = fps * 23;  // Contrast callout

  // Animation progress for slot processing (0 to 1)
  const processingProgress = interpolate(
    localFrame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Current step in processing
  const currentStep = Math.floor(processingProgress * TOTAL_STEPS);

  // Calculate which sequences are in which slots
  const getSlotContents = () => {
    const slots: (typeof INITIAL_SEQUENCES[0] | typeof INCOMING_SEQUENCES[0] | null)[] = [
      null, null, null, null
    ];

    // Track completion order to know when slots freed up
    const completionOrder = [...INITIAL_SEQUENCES]
      .sort((a, b) => a.completesAt - b.completesAt);

    // Assign initial sequences to slots
    INITIAL_SEQUENCES.forEach((seq, idx) => {
      if (currentStep < seq.completesAt) {
        slots[idx] = seq;
      }
    });

    // Assign incoming sequences to freed slots
    let incomingIdx = 0;
    completionOrder.forEach((completedSeq) => {
      if (currentStep >= completedSeq.completesAt && incomingIdx < INCOMING_SEQUENCES.length) {
        const incoming = INCOMING_SEQUENCES[incomingIdx];
        if (currentStep >= incoming.arrivesAfter) {
          // Find the slot that was freed
          const slotIdx = INITIAL_SEQUENCES.findIndex(s => s.id === completedSeq.id);
          if (slots[slotIdx] === null) {
            slots[slotIdx] = incoming;
            incomingIdx++;
          }
        }
      }
    });

    return slots;
  };

  const slotContents = getSlotContents();

  // Opacities
  const definitionOpacity = interpolate(
    localFrame,
    [0, fps * 0.5, phase1End - fps * 0.5, phase1End],
    [0, 1, 1, 0.3],
    { extrapolateRight: "clamp" }
  );

  const gpuOpacity = interpolate(
    localFrame,
    [phase1End, phase1End + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const contrastOpacity = interpolate(
    localFrame,
    [phase3End, phase3End + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Spring animation for new sequences entering
  const newSeqSpring = (delay: number) => spring({
    frame: localFrame - delay,
    fps,
    config: { damping: 15, stiffness: 100 }
  });

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
          opacity: titleOpacity,
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
          Continuous Batching
        </h1>
      </div>

      {/* Slot Definition Box */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: definitionOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.surface,
            border: `2px solid ${COLORS.primary}`,
            borderRadius: 12,
            padding: "16px 32px",
            maxWidth: 700,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: COLORS.text,
              textAlign: "center",
            }}
          >
            <span style={{ color: COLORS.primary, fontWeight: 700 }}>Slot</span>
            {" = A "}
            <span style={{ fontWeight: 600 }}>fixed memory allocation</span>
            {" for "}
            <span style={{ fontWeight: 600 }}>one sequence</span>
            {" in the GPU batch"}
          </div>
        </div>
      </div>

      {/* GPU Container with 4 Labeled Slots */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: gpuOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.gpu,
            borderRadius: 20,
            border: `3px solid ${COLORS.gpuBorder}`,
            padding: 32,
            boxShadow: `0 0 40px ${COLORS.gpuBorder}30`,
          }}
        >
          {/* GPU Label */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: COLORS.gpuBorder,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              GPU - Continuous Batching
            </span>
          </div>

          {/* 4 Labeled Slots Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}
          >
            {[0, 1, 2, 3].map((slotIdx) => {
              const slotContent = slotContents[slotIdx];
              const isNewSequence = slotContent && INCOMING_SEQUENCES.some(
                s => s.id === slotContent.id
              );

              // Calculate if a sequence is about to complete
              const originalSeq = INITIAL_SEQUENCES[slotIdx];
              const isAboutToComplete = originalSeq &&
                currentStep >= originalSeq.completesAt - 1 &&
                currentStep < originalSeq.completesAt;

              // Calculate progress for current sequence
              let progress = 0;
              if (slotContent) {
                const seq = INITIAL_SEQUENCES.find(s => s.id === slotContent.id);
                if (seq) {
                  progress = Math.min(currentStep / seq.completesAt, 1);
                } else {
                  // For incoming sequences, calculate based on when they arrived
                  const incoming = INCOMING_SEQUENCES.find(s => s.id === slotContent.id);
                  if (incoming) {
                    const stepsProcessed = currentStep - incoming.arrivesAfter;
                    progress = Math.min(stepsProcessed / 6, 1); // Assume 6 steps for new sequences
                  }
                }
              }

              return (
                <div
                  key={slotIdx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Slot Label */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.slotLabel,
                      fontFamily: "JetBrains Mono, monospace",
                      textAlign: "center",
                    }}
                  >
                    Slot {slotIdx + 1}
                  </div>

                  {/* Slot Box */}
                  <div
                    style={{
                      width: SLOT_WIDTH,
                      height: SLOT_HEIGHT,
                      backgroundColor: slotContent ? slotContent.color + "30" : COLORS.slotEmpty,
                      border: `3px solid ${slotContent ? slotContent.color : COLORS.slotEmpty}`,
                      borderRadius: 12,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: isNewSequence
                        ? `0 0 20px ${slotContent?.color}60`
                        : isAboutToComplete
                        ? `0 0 15px ${COLORS.success}60`
                        : "none",
                      transform: isNewSequence
                        ? `scale(${newSeqSpring(phase2End + fps * (slotIdx * 0.5))})`
                        : "scale(1)",
                    }}
                  >
                    {slotContent ? (
                      <>
                        {/* Sequence ID */}
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: slotContent.color,
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          Seq {slotContent.id}
                        </div>

                        {/* Progress bar */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 6,
                            backgroundColor: COLORS.surface,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${progress * 100}%`,
                              backgroundColor: slotContent.color,
                              transition: "width 0.1s ease",
                            }}
                          />
                        </div>

                        {/* NEW label for incoming sequences */}
                        {isNewSequence && (
                          <div
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              backgroundColor: COLORS.success,
                              color: COLORS.background,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            NEW
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        style={{
                          fontSize: 14,
                          color: COLORS.textDim,
                          fontStyle: "italic",
                        }}
                      >
                        Available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Step Indicator */}
          <div
            style={{
              marginTop: 24,
              padding: "12px 0",
              borderTop: `1px solid ${COLORS.textDim}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 14, color: COLORS.textDim }}>
              Time Step:
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.primary,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {currentStep} / {TOTAL_STEPS}
            </span>
          </div>
        </div>
      </div>

      {/* Waiting Queue - Shows incoming sequences */}
      {localFrame > phase2End && (
        <div
          style={{
            position: "absolute",
            right: 60,
            top: 250,
            opacity: interpolate(
              localFrame,
              [phase2End, phase2End + fps * 0.5],
              [0, 1],
              { extrapolateRight: "clamp" }
            ),
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 16,
              border: `2px solid ${COLORS.textDim}40`,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: COLORS.textDim,
                marginBottom: 12,
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Waiting Queue
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {INCOMING_SEQUENCES.map((seq, idx) => {
                const hasEntered = currentStep >= seq.arrivesAfter;
                return (
                  <div
                    key={seq.id}
                    style={{
                      width: 80,
                      height: 36,
                      backgroundColor: hasEntered ? COLORS.slotEmpty : seq.color + "40",
                      border: `2px solid ${hasEntered ? COLORS.slotEmpty : seq.color}`,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: hasEntered ? 0.3 : 1,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: hasEntered ? COLORS.textDim : seq.color,
                        textDecoration: hasEntered ? "line-through" : "none",
                      }}
                    >
                      Seq {seq.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Contrast Callout */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: contrastOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "stretch",
          }}
        >
          {/* Static Batching (Bad) */}
          <div
            style={{
              backgroundColor: "#ff475720",
              border: "2px solid #ff4757",
              borderRadius: 12,
              padding: "16px 24px",
              maxWidth: 320,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#ff4757",
                marginBottom: 8,
              }}
            >
              ❌ Static Batching
            </div>
            <div
              style={{
                fontSize: 14,
                color: COLORS.text,
                lineHeight: 1.5,
              }}
            >
              Waits for <span style={{ fontWeight: 700 }}>ALL</span> sequences to finish before accepting new ones
            </div>
          </div>

          {/* Continuous Batching (Good) */}
          <div
            style={{
              backgroundColor: COLORS.success + "20",
              border: `2px solid ${COLORS.success}`,
              borderRadius: 12,
              padding: "16px 24px",
              maxWidth: 320,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.success,
                marginBottom: 8,
              }}
            >
              ✓ Continuous Batching
            </div>
            <div
              style={{
                fontSize: 14,
                color: COLORS.text,
                lineHeight: 1.5,
              }}
            >
              Fills empty slots <span style={{ fontWeight: 700 }}>immediately</span> - no waiting!
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic explanation text */}
      {localFrame > phase2End && localFrame < phase3End && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: interpolate(
              localFrame,
              [phase2End, phase2End + fps * 0.5],
              [0, 1],
              { extrapolateRight: "clamp" }
            ),
          }}
        >
          <span style={{ fontSize: 18, color: COLORS.text }}>
            {currentStep < 4 ? (
              <>All 4 slots processing sequences...</>
            ) : currentStep < 6 ? (
              <>
                <span style={{ color: COLORS.seq1 }}>Seq A</span> finished!{" "}
                <span style={{ color: COLORS.seq5 }}>Seq E</span> enters{" "}
                <span style={{ fontWeight: 700, color: COLORS.success }}>immediately</span>
              </>
            ) : currentStep < 8 ? (
              <>
                <span style={{ color: COLORS.seq3 }}>Seq C</span> finished!{" "}
                <span style={{ color: COLORS.seq6 }}>Seq F</span> takes its slot{" "}
                <span style={{ fontWeight: 700, color: COLORS.success }}>right away</span>
              </>
            ) : currentStep < 10 ? (
              <>
                <span style={{ color: COLORS.seq2 }}>Seq B</span> done →{" "}
                <span style={{ color: COLORS.seq7 }}>Seq G</span> starts immediately.{" "}
                <span style={{ color: COLORS.success }}>No wasted compute!</span>
              </>
            ) : (
              <>
                GPU stays at <span style={{ fontWeight: 700, color: COLORS.success }}>maximum utilization</span> - every slot always doing useful work!
              </>
            )}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Scene10ContinuousBatching;
