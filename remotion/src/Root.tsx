import { Composition } from "remotion";
import { ExplainerVideo } from "./scenes/ExplainerVideo";
import { PrefillDecodeScene } from "./scenes/PrefillDecodeScene";
import { StoryboardPlayer } from "./scenes/StoryboardPlayer";
import { defaultScriptProps, ScriptProps } from "./types/script";
import type { Storyboard } from "./types/storyboard";

// LLM Inference video scenes
import {
  LLMInferenceVideo,
  LLMInferenceWithAudio,
  TOTAL_DURATION_SECONDS as LLM_DURATION,
  TOTAL_DURATION_WITH_AUDIO as LLM_AUDIO_DURATION,
  Scene1Hook,
  Scene2Phases,
  Scene3Bottleneck,
  Scene4Attention,
  Scene5Redundancy,
  Scene6KVCache,
  Scene7Mechanics,
  Scene8Impact,
} from "./videos/llm-inference";

// Default storyboard for preview
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

/**
 * Root component that registers all compositions.
 * Each composition can be rendered independently.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main explainer video composition */}
      <Composition
        id="ExplainerVideo"
        component={ExplainerVideo}
        durationInFrames={30 * 180} // 180 seconds at 30fps (will be overridden by props)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultScriptProps}
        calculateMetadata={async ({ props }) => {
          // Calculate duration from script
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
        durationInFrames={60 * 30} // 60 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          prompt: "Explain quantum computing",
          inputTokens: ["Explain", "quantum", "computing"],
          outputTokens: ["Quantum", "computing", "is", "a", "type", "of"],
        }}
      />

      {/* Storyboard Player - renders any storyboard JSON */}
      <Composition
        id="StoryboardPlayer"
        component={StoryboardPlayer}
        durationInFrames={30 * 60} // Default 60 seconds, overridden by storyboard
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

      {/* ===== LLM Inference Video ===== */}

      {/* Full LLM Inference Video (all 8 scenes) */}
      <Composition
        id="LLM-Inference-Full"
        component={LLMInferenceVideo}
        durationInFrames={Math.ceil(LLM_DURATION * 30)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Full LLM Inference Video WITH AUDIO (narration) */}
      <Composition
        id="LLM-Inference-WithAudio"
        component={LLMInferenceWithAudio}
        durationInFrames={Math.ceil(LLM_AUDIO_DURATION * 30)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* ===== LLM Inference Video - Individual Scenes ===== */}

      {/* Scene 3: The Decode Bottleneck */}
      <Composition
        id="LLM-Scene3-Bottleneck"
        component={Scene3Bottleneck}
        durationInFrames={30 * 25} // 25 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 4: Understanding Attention */}
      <Composition
        id="LLM-Scene4-Attention"
        component={Scene4Attention}
        durationInFrames={30 * 25} // 25 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 6: The KV Cache Solution */}
      <Composition
        id="LLM-Scene6-KVCache"
        component={Scene6KVCache}
        durationInFrames={30 * 25} // 25 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 1: The Speed Problem (Hook) */}
      <Composition
        id="LLM-Scene1-Hook"
        component={Scene1Hook}
        durationInFrames={30 * 15} // 15 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 2: The Two Phases */}
      <Composition
        id="LLM-Scene2-Phases"
        component={Scene2Phases}
        durationInFrames={30 * 20} // 20 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 5: The Redundancy Problem */}
      <Composition
        id="LLM-Scene5-Redundancy"
        component={Scene5Redundancy}
        durationInFrames={30 * 25} // 25 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 7: How KV Cache Works (Mechanics) */}
      <Composition
        id="LLM-Scene7-Mechanics"
        component={Scene7Mechanics}
        durationInFrames={30 * 20} // 20 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Scene 8: Impact & Conclusion */}
      <Composition
        id="LLM-Scene8-Impact"
        component={Scene8Impact}
        durationInFrames={30 * 25} // 25 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
