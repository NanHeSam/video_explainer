/**
 * LLM Inference Full Video
 *
 * Complete ~3 minute explainer video about LLM inference optimization.
 * Sequences all 8 scenes with transitions.
 *
 * Scene order:
 * 1. Hook - The dramatic speed difference (15s)
 * 2. Two Phases - Prefill vs Decode (20s)
 * 3. Bottleneck - Memory bandwidth problem (25s)
 * 4. Attention - Understanding Q, K, V (25s)
 * 5. Redundancy - The O(n²) waste (25s)
 * 6. KV Cache - The solution (25s)
 * 7. Mechanics - How cache lookup works (20s)
 * 8. Impact - Real-world results (25s)
 *
 * Total: 180 seconds = 3 minutes
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
} from "remotion";

import { Scene1Hook } from "./Scene1Hook";
import { Scene2Phases } from "./Scene2Phases";
import { Scene3Bottleneck } from "./Scene3Bottleneck";
import { Scene4Attention } from "./Scene4Attention";
import { Scene5Redundancy } from "./Scene5Redundancy";
import { Scene6KVCache } from "./Scene6KVCache";
import { Scene7Mechanics } from "./Scene7Mechanics";
import { Scene8Impact } from "./Scene8Impact";

// Scene configuration with durations in seconds
const SCENES = [
  { id: "hook", component: Scene1Hook, durationSeconds: 15 },
  { id: "phases", component: Scene2Phases, durationSeconds: 20 },
  { id: "bottleneck", component: Scene3Bottleneck, durationSeconds: 25 },
  { id: "attention", component: Scene4Attention, durationSeconds: 25 },
  { id: "redundancy", component: Scene5Redundancy, durationSeconds: 25 },
  { id: "kvcache", component: Scene6KVCache, durationSeconds: 25 },
  { id: "mechanics", component: Scene7Mechanics, durationSeconds: 20 },
  { id: "impact", component: Scene8Impact, durationSeconds: 25 },
] as const;

// Transition duration in seconds
const TRANSITION_DURATION = 0.5;

interface LLMInferenceVideoProps {
  /** Optional: skip to a specific scene (0-indexed) */
  startFromScene?: number;
}

/**
 * Fade transition component
 */
const FadeTransition: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transitionFrames = Math.floor(TRANSITION_DURATION * fps);

  // Fade in at start
  const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return <div style={{ opacity }}>{children}</div>;
};

export const LLMInferenceVideo: React.FC<LLMInferenceVideoProps> = ({
  startFromScene = 0,
}) => {
  const { fps } = useVideoConfig();

  // Calculate frame offsets for each scene
  let currentFrame = 0;
  const sceneOffsets = SCENES.map((scene) => {
    const offset = currentFrame;
    currentFrame += Math.floor(scene.durationSeconds * fps);
    return offset;
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
      }}
    >
      {SCENES.map((scene, index) => {
        if (index < startFromScene) return null;

        const SceneComponent = scene.component;
        const startFrame = sceneOffsets[index];
        const durationInFrames = Math.floor(scene.durationSeconds * fps);

        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={durationInFrames}
            name={`Scene ${index + 1}: ${scene.id}`}
          >
            <FadeTransition durationInFrames={durationInFrames}>
              <SceneComponent />
            </FadeTransition>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Export scene metadata for external use
export const SCENE_METADATA = SCENES.map((scene, index) => ({
  index,
  id: scene.id,
  durationSeconds: scene.durationSeconds,
}));

// Total duration in seconds
export const TOTAL_DURATION_SECONDS = SCENES.reduce(
  (sum, scene) => sum + scene.durationSeconds,
  0
);

export default LLMInferenceVideo;
