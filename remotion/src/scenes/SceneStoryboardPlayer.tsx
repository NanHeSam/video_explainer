/**
 * SceneStoryboardPlayer - Data-driven scene renderer
 *
 * Renders a video from a storyboard.json file that references scene components
 * by type path (e.g., "llm-inference/hook").
 *
 * This approach allows:
 * - Scene components to be reused across projects
 * - Project-specific data (audio, timing) to live in project directories
 * - Easy creation of new videos by just creating new storyboard.json files
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { getSceneByPath } from "./index";

/**
 * SFX cue definition - frame-accurate sound effect trigger
 */
export interface SFXCue {
  /** Sound file name (without extension, looked up in sfx/ directory) */
  sound: string;
  /** Frame offset from scene start when sound should play */
  frame: number;
  /** Volume (0-1), defaults to 0.1 for subtle mix */
  volume?: number;
  /** Optional duration in frames (for looping sounds) */
  duration_frames?: number;
}

/**
 * Scene definition in storyboard.json
 */
export interface StoryboardScene {
  id: string;
  type: string; // e.g., "llm-inference/hook"
  title: string;
  audio_file: string;
  audio_duration_seconds: number;
  /** Frame-accurate SFX cues for this scene */
  sfx_cues?: SFXCue[];
}

/**
 * Video configuration
 */
export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
}

/**
 * Style configuration
 */
export interface StyleConfig {
  background_color: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

/**
 * Background music configuration
 */
export interface BackgroundMusicConfig {
  /** Path to the music file (relative to public directory) */
  path: string;
  /** Volume level (0-1), defaults to 0.1 */
  volume?: number;
}

/**
 * Audio configuration
 */
export interface AudioConfig {
  voiceover_dir: string;
  buffer_between_scenes_seconds: number;
  /** Optional background music configuration */
  background_music?: BackgroundMusicConfig;
}

/**
 * Scene-based storyboard format
 */
export interface SceneStoryboard {
  title: string;
  description: string;
  version: string;
  project: string;
  video: VideoConfig;
  style: StyleConfig;
  scenes: StoryboardScene[];
  audio: AudioConfig;
  total_duration_seconds: number;
}

export interface SceneStoryboardPlayerProps {
  storyboard?: SceneStoryboard;
  /** Base path for voiceover files (for staticFile) */
  voiceoverBasePath?: string;
}

// Transition duration in seconds
const TRANSITION_DURATION = 0.7;

/**
 * Fade transition component with cinematic scale and motion effects
 */
const FadeTransition: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transitionFrames = Math.floor(TRANSITION_DURATION * fps);
  const easing = Easing.out(Easing.cubic);

  // Fade in at start (opacity: 0 -> 1)
  const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

  // Scale in at start (0.98 -> 1)
  const scaleIn = interpolate(frame, [0, transitionFrames], [0.98, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

  // Translate Y in at start (-10px -> 0)
  const translateYIn = interpolate(frame, [0, transitionFrames], [-10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

  // Fade out at end (opacity: 1 -> 0)
  const fadeOut = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing,
    }
  );

  // Scale out at end (1 -> 0.98)
  const scaleOut = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0.98],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing,
    }
  );

  // Translate Y out at end (0 -> 10px)
  const translateYOut = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [0, 10],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing,
    }
  );

  // Combine fade in and fade out
  const opacity = Math.min(fadeIn, fadeOut);

  // Combine scale in and scale out
  const scale = Math.min(scaleIn, scaleOut);

  // Combine translateY in and out (use in value during fade-in, out value during fade-out)
  const isInFadeOutPhase = frame > durationInFrames - transitionFrames;
  const translateY = isInFadeOutPhase ? translateYOut : translateYIn;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};

/**
 * Background music component with fade-in and fade-out effects
 * Plays throughout the entire video with looping support
 *
 * Wrapped in a Sequence to ensure proper timing across the full composition.
 */
const BackgroundMusic: React.FC<{
  musicPath: string;
  volume: number;
  totalDurationInFrames: number;
}> = ({ musicPath, volume, totalDurationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade-in: first 2 seconds
  const fadeInDurationFrames = 2 * fps;
  // Fade-out: last 3 seconds
  const fadeOutDurationFrames = 3 * fps;

  // Calculate fade-in volume (0 -> target volume over first 2 seconds)
  const fadeInVolume = interpolate(
    frame,
    [0, fadeInDurationFrames],
    [0, volume],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  // Calculate fade-out volume (target volume -> 0 over last 3 seconds)
  const fadeOutVolume = interpolate(
    frame,
    [totalDurationInFrames - fadeOutDurationFrames, totalDurationInFrames],
    [volume, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );

  // Combined volume: use fade-in at start, fade-out at end, full volume in between
  const currentVolume = Math.min(fadeInVolume, fadeOutVolume);

  return (
    <Sequence from={0} durationInFrames={totalDurationInFrames} name="Background Music">
      <Audio
        src={staticFile(musicPath)}
        volume={currentVolume}
        loop
      />
    </Sequence>
  );
};

/**
 * Fallback scene for missing components
 */
const MissingScene: React.FC<{ sceneType: string }> = ({ sceneType }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#ff4757",
          marginBottom: 20,
        }}
      >
        Scene Not Found
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#888",
        }}
      >
        Missing: {sceneType}
      </div>
    </AbsoluteFill>
  );
};

// Empty storyboard for fallback
const emptyStoryboard: SceneStoryboard = {
  title: "Empty",
  description: "",
  version: "2.0.0",
  project: "empty",
  video: { width: 1920, height: 1080, fps: 30 },
  style: {
    background_color: "#0f0f1a",
    primary_color: "#00d9ff",
    secondary_color: "#ff6b35",
    font_family: "Inter",
  },
  scenes: [],
  audio: { voiceover_dir: "voiceover", buffer_between_scenes_seconds: 1.0 },
  total_duration_seconds: 0,
};

export const SceneStoryboardPlayer: React.FC<SceneStoryboardPlayerProps> = ({
  storyboard = emptyStoryboard,
  voiceoverBasePath = "voiceover",
}) => {
  const { fps } = useVideoConfig();
  const buffer = storyboard.audio?.buffer_between_scenes_seconds ?? 1.0;

  // Calculate frame offsets for each scene
  let currentFrame = 0;
  const sceneData = storyboard.scenes.map((scene) => {
    const startFrame = currentFrame;
    // Scene duration = audio duration + buffer
    const durationSeconds = scene.audio_duration_seconds + buffer;
    const durationInFrames = Math.ceil(durationSeconds * fps);
    currentFrame += durationInFrames;

    // Look up scene component from registry
    const SceneComponent = getSceneByPath(scene.type);

    return {
      ...scene,
      startFrame,
      durationInFrames,
      durationSeconds,
      SceneComponent,
    };
  });

  // Calculate total duration for background music fade-out
  const totalDurationInFrames = currentFrame;

  // Background music configuration
  const backgroundMusic = storyboard.audio?.background_music;
  const musicVolume = backgroundMusic?.volume ?? 0.1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: storyboard.style?.background_color || "#0f0f1a",
      }}
    >
      {/* Background music - plays throughout entire video with fade-in/fade-out */}
      {backgroundMusic?.path && (
        <BackgroundMusic
          musicPath={backgroundMusic.path}
          volume={musicVolume}
          totalDurationInFrames={totalDurationInFrames}
        />
      )}

      {sceneData.map((scene, index) => {
        const SceneComponent = scene.SceneComponent;
        const audioPath = `${voiceoverBasePath}/${scene.audio_file}`;

        return (
          <Sequence
            key={scene.id}
            from={scene.startFrame}
            durationInFrames={scene.durationInFrames}
            name={`Scene ${index + 1}: ${scene.title}`}
          >
            {/* Visual content with fade transition */}
            <FadeTransition durationInFrames={scene.durationInFrames}>
              {SceneComponent ? (
                <SceneComponent startFrame={0} />
              ) : (
                <MissingScene sceneType={scene.type} />
              )}
            </FadeTransition>

            {/* Voiceover/mixed audio track */}
            <Audio src={staticFile(audioPath)} volume={1} />

            {/* Frame-accurate SFX cues */}
            {scene.sfx_cues?.map((cue, cueIndex) => (
              <Sequence
                key={`sfx-${scene.id}-${cueIndex}`}
                from={cue.frame}
                durationInFrames={cue.duration_frames || 60}
                name={`SFX: ${cue.sound}`}
              >
                <Audio
                  src={staticFile(`sfx/${cue.sound}.wav`)}
                  volume={cue.volume ?? 0.1}
                />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Calculate total duration from storyboard
 */
export function calculateStoryboardDuration(storyboard: SceneStoryboard): number {
  const buffer = storyboard.audio?.buffer_between_scenes_seconds ?? 1.0;
  return storyboard.scenes.reduce(
    (sum, scene) => sum + scene.audio_duration_seconds + buffer,
    0
  );
}

export default SceneStoryboardPlayer;
