import { Composition } from "remotion";
import { ExplainerVideo } from "./scenes/ExplainerVideo";
import { StoryboardPlayer } from "./scenes/StoryboardPlayer";
import {
  SceneStoryboardPlayer,
  SceneStoryboard,
  calculateStoryboardDuration,
} from "./scenes/SceneStoryboardPlayer";
import { defaultScriptProps } from "./types/script";
import type { Storyboard } from "./types/storyboard";

// Scene registry - used for data-driven rendering
import { getAllScenePaths } from "./scenes/index";

// Import individual scenes from project (via webpack alias configured at build time)
// @ts-ignore - alias is configured dynamically at build time
import {
  PrefillDecodeScene,
  HookScene,
  PhasesScene,
  BottleneckScene,
  AttentionScene,
  RedundancyScene,
  KVCacheScene,
  MechanicsScene,
  ImpactScene,
  StaticBatchingScene,
  MemoryFragmentationScene,
  ContinuousBatchingScene,
  PagedAttentionScene,
  QuantizationScene,
  SpeculativeDecodingScene,
  ScalingScene,
  EconomicsScene,
  ConclusionScene,
} from "@project-scenes";

// Default beat-based storyboard for preview (old format)
const defaultStoryboard: Storyboard = {
  id: "preview",
  title: "Storyboard Preview",
  duration_seconds: 10,
  beats: [
    {
      id: "test",
      start_seconds: 0,
      end_seconds: 10,
      voiceover: "This is a test storyboard.",
      elements: [
        {
          id: "test_tokens",
          component: "token_row",
          props: {
            tokens: ["Hello", "World"],
            mode: "prefill",
            label: "TEST",
          },
          position: { x: "center", y: "center" },
          animations: [
            { action: "activate_all", at_seconds: 2, duration_seconds: 0.5 },
          ],
        },
      ],
    },
  ],
};

// Default scene-based storyboard (new format)
const defaultSceneStoryboard: SceneStoryboard = {
  title: "Preview",
  description: "Default preview storyboard",
  version: "2.0.0",
  project: "preview",
  video: {
    width: 1920,
    height: 1080,
    fps: 30,
  },
  style: {
    background_color: "#0f0f1a",
    primary_color: "#00d9ff",
    secondary_color: "#ff6b35",
    font_family: "Inter",
  },
  scenes: [
    {
      id: "scene1",
      type: "llm-inference/hook",
      title: "Preview Scene",
      audio_file: "scene1_hook.mp3",
      audio_duration_seconds: 21.16,
    },
  ],
  audio: {
    voiceover_dir: "voiceover",
    buffer_between_scenes_seconds: 1.0,
  },
  total_duration_seconds: 22.16,
};

/**
 * Root component that registers all compositions.
 * Each composition can be rendered independently.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ===== Data-Driven Video Player ===== */}

      {/* Scene Storyboard Player - renders any project's storyboard.json */}
      <Composition
        id="ScenePlayer"
        component={SceneStoryboardPlayer}
        durationInFrames={30 * 60} // Default 60 seconds, overridden by storyboard
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          storyboard: defaultSceneStoryboard,
          voiceoverBasePath: "voiceover",
        }}
        calculateMetadata={async ({ props }) => {
          const storyboard = props.storyboard as SceneStoryboard;
          const duration = calculateStoryboardDuration(storyboard);
          return {
            durationInFrames: Math.ceil(duration * 30),
          };
        }}
      />

      {/* ===== Legacy Compositions (for backwards compatibility) ===== */}

      {/* Main explainer video composition */}
      <Composition
        id="ExplainerVideo"
        component={ExplainerVideo}
        durationInFrames={30 * 180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultScriptProps}
        calculateMetadata={async ({ props }) => {
          const totalDuration = props.scenes.reduce(
            (acc, scene) => acc + scene.durationInSeconds,
            0
          );
          return {
            durationInFrames: Math.ceil(totalDuration * 30),
          };
        }}
      />

      {/* Prefill vs Decode explainer scene */}
      <Composition
        id="PrefillDecode"
        component={PrefillDecodeScene}
        durationInFrames={60 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          prompt: "Explain quantum computing",
          inputTokens: ["Explain", "quantum", "computing"],
          outputTokens: ["Quantum", "computing", "is", "a", "type", "of"],
        }}
      />

      {/* Beat-based Storyboard Player (old format) */}
      <Composition
        id="StoryboardPlayer"
        component={StoryboardPlayer}
        durationInFrames={30 * 60}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          storyboard: defaultStoryboard,
        }}
        calculateMetadata={async ({ props }) => {
          const storyboard = props.storyboard as Storyboard | undefined;
          const duration = storyboard?.duration_seconds || 60;
          return {
            durationInFrames: Math.ceil(duration * 30),
          };
        }}
      />

      {/* ===== Individual Scene Previews ===== */}

      {/* Scene 1: The Speed Problem (Hook) */}
      <Composition
        id="Scene-Hook"
        component={HookScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 2: The Two Phases */}
      <Composition
        id="Scene-Phases"
        component={PhasesScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 3: The Decode Bottleneck */}
      <Composition
        id="Scene-Bottleneck"
        component={BottleneckScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 4: Understanding Attention */}
      <Composition
        id="Scene-Attention"
        component={AttentionScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 5: The Redundancy Problem */}
      <Composition
        id="Scene-Redundancy"
        component={RedundancyScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 6: Static Batching */}
      <Composition
        id="Scene-StaticBatching"
        component={StaticBatchingScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 7: Memory Fragmentation */}
      <Composition
        id="Scene-MemoryFragmentation"
        component={MemoryFragmentationScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 8: The KV Cache Solution */}
      <Composition
        id="Scene-KVCache"
        component={KVCacheScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 9: How KV Cache Works (Mechanics) */}
      <Composition
        id="Scene-Mechanics"
        component={MechanicsScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 10: Continuous Batching */}
      <Composition
        id="Scene-ContinuousBatching"
        component={ContinuousBatchingScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 11: PagedAttention */}
      <Composition
        id="Scene-PagedAttention"
        component={PagedAttentionScene}
        durationInFrames={30 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 12: Quantization */}
      <Composition
        id="Scene-Quantization"
        component={QuantizationScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 13: Speculative Decoding */}
      <Composition
        id="Scene-SpeculativeDecoding"
        component={SpeculativeDecodingScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 14: Scaling */}
      <Composition
        id="Scene-Scaling"
        component={ScalingScene}
        durationInFrames={30 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 15: Economics */}
      <Composition
        id="Scene-Economics"
        component={EconomicsScene}
        durationInFrames={30 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 16: Conclusion */}
      <Composition
        id="Scene-Conclusion"
        component={ConclusionScene}
        durationInFrames={30 * 40}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 17: Impact (legacy) */}
      <Composition
        id="Scene-Impact"
        component={ImpactScene}
        durationInFrames={30 * 25}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
