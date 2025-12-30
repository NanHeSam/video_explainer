/**
 * Utility functions for render script.
 * Extracted for testability.
 */

/**
 * Parse command line arguments into configuration object.
 * @param {string[]} args - Command line arguments (without node and script path)
 * @returns {Object} Parsed configuration
 */
export function parseArgs(args) {
  const config = {
    propsPath: null,
    storyboardPath: null,
    projectDir: null,
    outputPath: "./output.mp4",
    compositionId: "ScenePlayer",
    voiceoverBasePath: "voiceover",
    width: null,
    height: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--props" && args[i + 1]) {
      config.propsPath = args[i + 1];
      i++;
    } else if (args[i] === "--storyboard" && args[i + 1]) {
      config.storyboardPath = args[i + 1];
      i++;
    } else if (args[i] === "--project" && args[i + 1]) {
      config.projectDir = args[i + 1];
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      config.outputPath = args[i + 1];
      i++;
    } else if (args[i] === "--composition" && args[i + 1]) {
      config.compositionId = args[i + 1];
      i++;
    } else if (args[i] === "--voiceover-path" && args[i + 1]) {
      config.voiceoverBasePath = args[i + 1];
      i++;
    } else if (args[i] === "--width" && args[i + 1]) {
      config.width = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--height" && args[i + 1]) {
      config.height = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return config;
}

/**
 * Calculate total duration based on storyboard/props format.
 * @param {string} compositionId - The composition ID
 * @param {Object} props - The props object containing storyboard or scenes
 * @returns {number} Total duration in seconds
 */
export function calculateDuration(compositionId, props) {
  if (compositionId === "ScenePlayer" && props.storyboard) {
    // New scene-based format
    const buffer = props.storyboard.audio?.buffer_between_scenes_seconds ?? 1.0;
    return props.storyboard.scenes.reduce(
      (acc, scene) => acc + scene.audio_duration_seconds + buffer,
      0
    );
  } else if (compositionId === "StoryboardPlayer" && props.storyboard) {
    // Old beat-based format
    return props.storyboard.duration_seconds;
  } else if (props.scenes) {
    // Legacy scenes format
    return props.scenes.reduce(
      (acc, scene) => acc + scene.durationInSeconds,
      0
    );
  } else {
    // Fallback
    return props.duration_seconds || 60;
  }
}

/**
 * Build props object from storyboard.
 * @param {Object} storyboard - The storyboard object
 * @param {string} voiceoverBasePath - Base path for voiceover files
 * @returns {Object} Props object for Remotion
 */
export function buildProps(storyboard, voiceoverBasePath) {
  return { storyboard, voiceoverBasePath };
}

/**
 * Resolution presets matching the CLI.
 */
export const RESOLUTION_PRESETS = {
  "4k": { width: 3840, height: 2160 },
  "1440p": { width: 2560, height: 1440 },
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
  "480p": { width: 854, height: 480 },
};

/**
 * Validate that required configuration is present.
 * @param {Object} config - The parsed configuration
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateConfig(config) {
  if (!config.storyboardPath && !config.propsPath) {
    return {
      valid: false,
      error: "Either --storyboard or --props is required",
    };
  }
  return { valid: true };
}

/**
 * Derive storyboard path from project directory.
 * @param {string} projectDir - The project directory path
 * @returns {string} Path to storyboard.json
 */
export function deriveStoryboardPath(projectDir) {
  return `${projectDir}/storyboard/storyboard.json`;
}

/**
 * Derive project directory from storyboard path.
 * @param {string} storyboardPath - Path to storyboard.json
 * @returns {string} Project directory path
 */
export function deriveProjectDir(storyboardPath) {
  // storyboard is at projects/<name>/storyboard/storyboard.json
  const parts = storyboardPath.split("/");
  parts.pop(); // remove storyboard.json
  parts.pop(); // remove storyboard/
  return parts.join("/");
}

/**
 * Get final resolution, using custom dimensions if provided.
 * @param {number|null} customWidth - Custom width or null
 * @param {number|null} customHeight - Custom height or null
 * @param {Object} composition - Remotion composition object
 * @returns {{ width: number, height: number, isCustom: boolean }}
 */
export function getFinalResolution(customWidth, customHeight, composition) {
  const width = customWidth || composition.width;
  const height = customHeight || composition.height;
  const isCustom = customWidth !== null || customHeight !== null;
  return { width, height, isCustom };
}
