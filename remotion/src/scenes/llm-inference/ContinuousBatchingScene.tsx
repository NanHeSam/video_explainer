/**
 * Scene 11: Continuous Batching
 *
 * Key insight: Make scheduling decisions at every decode step.
 * When a request finishes, immediately fill its slot.
 *
 * Visual flow:
 * 1. Show batch running
 * 2. Short request finishes
 * 3. New request immediately fills the slot
 * 4. Show 100% utilization
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface ContinuousBatchingSceneProps {
  startFrame?: number;
}

const COLORS = {
  background: "#0f0f1a",
  primary: "#00d9ff",
  slot1: "#00d9ff",
  slot2: "#ff6b35",
  slot3: "#00ff88",
  slot4: "#f1c40f",
  newRequest: "#9b59b6",
  success: "#2ecc71",
  text: "#ffffff",
  textDim: "#888888",
  surface: "#1a1a2e",
};

export const ContinuousBatchingScene: React.FC<ContinuousBatchingSceneProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Phase timings
  const phase1End = fps * 3; // Intro
  const phase2End = fps * 8; // First completion
  const phase3End = fps * 12; // Slot replacement
  const phase4End = fps * 18; // Show continuous flow
  const phase5End = fps * 25; // Final stats

  // Animation progress (0 to 20 steps)
  const stepProgress = interpolate(
    localFrame,
    [phase1End, phase4End],
    [0, 20],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Slot states
  const slots = [
    { id: 1, completesAt: 5, color: COLORS.slot1, label: "Req A" },
    { id: 2, completesAt: 15, color: COLORS.slot2, label: "Req B" },
    { id: 3, completesAt: 8, color: COLORS.slot3, label: "Req C" },
    { id: 4, completesAt: 12, color: COLORS.slot4, label: "Req D" },
  ];

  // New requests that fill completed slots
  const newRequests = [
    { fillsSlot: 1, startsAt: 5, completesAt: 18, color: COLORS.newRequest, label: "Req E" },
    { fillsSlot: 3, startsAt: 8, completesAt: 20, color: "#e74c3c", label: "Req F" },
    { fillsSlot: 4, startsAt: 12, completesAt: 19, color: "#3498db", label: "Req G" },
  ];

  // Animations
  const introOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const statsOpacity = interpolate(
    localFrame,
    [phase4End, phase4End + fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Get current request for each slot
  const getSlotState = (slotIndex: number) => {
    const originalSlot = slots[slotIndex];

    // Check if original request is still running
    if (stepProgress < originalSlot.completesAt) {
      return {
        active: true,
        progress: stepProgress / originalSlot.completesAt,
        color: originalSlot.color,
        label: originalSlot.label,
        isNew: false,
      };
    }

    // Check if a new request has filled this slot
    const newReq = newRequests.find(r => r.fillsSlot === originalSlot.id);
    if (newReq && stepProgress >= newReq.startsAt) {
      return {
        active: stepProgress < newReq.completesAt,
        progress: Math.min(1, (stepProgress - newReq.startsAt) / (newReq.completesAt - newReq.startsAt)),
        color: newReq.color,
        label: newReq.label,
        isNew: true,
      };
    }

    return { active: false, progress: 0, color: "#333", label: "Empty", isNew: false };
  };

  const activeSlots = slots.filter((_, i) => getSlotState(i).active).length;

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
          Continuous Batching
        </h1>
        <p
          style={{
            fontSize: 20,
            color: COLORS.success,
            marginTop: 8,
          }}
        >
          The Solution
        </p>
      </div>

      {/* Batch visualization */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 80,
          right: 80,
          opacity: introOpacity,
        }}
      >
        {/* Slots grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {slots.map((slot, index) => {
            const state = getSlotState(index);

            return (
              <div
                key={slot.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Slot box */}
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    backgroundColor: COLORS.surface,
                    borderRadius: 12,
                    border: `2px solid ${state.active ? state.color : "#333"}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: state.color + "30",
                      borderBottom: `1px solid ${state.color}40`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: state.color,
                      }}
                    >
                      Slot {index + 1}
                    </span>
                    {state.isNew && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          backgroundColor: COLORS.success + "40",
                          borderRadius: 4,
                          color: COLORS.success,
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: state.active ? state.color : COLORS.textDim,
                        marginBottom: 12,
                      }}
                    >
                      {state.label}
                    </span>

                    {/* Progress bar */}
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        backgroundColor: "#222",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${state.progress * 100}%`,
                          height: "100%",
                          backgroundColor: state.color,
                          borderRadius: 4,
                        }}
                      />
                    </div>

                    {/* Status */}
                    <span
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: state.active ? COLORS.text : COLORS.textDim,
                      }}
                    >
                      {state.active
                        ? `${Math.round(state.progress * 100)}%`
                        : "Completed"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div
          style={{
            marginBottom: 32,
            padding: 20,
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            border: "1px solid #333",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span style={{ color: COLORS.textDim, fontSize: 14 }}>
              Decode Step: {Math.floor(stepProgress)}
            </span>
            <span
              style={{
                color: COLORS.success,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {activeSlots}/4 slots active
            </span>
          </div>

          {/* Timeline bar */}
          <div
            style={{
              height: 12,
              backgroundColor: "#222",
              borderRadius: 6,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${(stepProgress / 20) * 100}%`,
                height: "100%",
                backgroundColor: COLORS.success,
                borderRadius: 6,
              }}
            />

            {/* Markers for slot completions */}
            {slots.map((slot) => (
              <div
                key={`marker-${slot.id}`}
                style={{
                  position: "absolute",
                  left: `${(slot.completesAt / 20) * 100}%`,
                  top: -4,
                  width: 2,
                  height: 20,
                  backgroundColor: slot.color,
                  opacity: stepProgress > slot.completesAt ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Key difference explanation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <div
            style={{
              padding: 16,
              backgroundColor: "#ff475720",
              borderRadius: 8,
              border: "1px solid #ff475740",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: "#ff4757", marginBottom: 4 }}>
              Static Batching
            </div>
            <div style={{ fontSize: 12, color: COLORS.textDim }}>
              Wait for all to finish
            </div>
          </div>

          <div
            style={{
              padding: 16,
              backgroundColor: COLORS.success + "20",
              borderRadius: 8,
              border: `1px solid ${COLORS.success}40`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: COLORS.success, marginBottom: 4 }}>
              Continuous Batching
            </div>
            <div style={{ fontSize: 12, color: COLORS.textDim }}>
              Fill slots immediately
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 80,
          opacity: statsOpacity,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color: COLORS.success,
            }}
          >
            100%
          </div>
          <div style={{ fontSize: 14, color: COLORS.textDim }}>
            GPU Utilization
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color: COLORS.primary,
            }}
          >
            0
          </div>
          <div style={{ fontSize: 14, color: COLORS.textDim }}>
            Wasted Slots
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(
            localFrame,
            [phase4End + fps, phase5End],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <span style={{ fontSize: 22, color: COLORS.text }}>
          Every slot is{" "}
          <span style={{ color: COLORS.success, fontWeight: 700 }}>
            always doing useful work
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default ContinuousBatchingScene;
