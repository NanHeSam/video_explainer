import { Composition } from "remotion";
import { ExplainerVideo } from "./scenes/ExplainerVideo";
import { PrefillDecodeScene } from "./scenes/PrefillDecodeScene";
import { StoryboardPlayer } from "./scenes/StoryboardPlayer";
import { defaultScriptProps, ScriptProps } from "./types/script";
import type { Storyboard } from "./types/storyboard";

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
    </>
  );
};
