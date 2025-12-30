#!/usr/bin/env node
/**
 * Render script for programmatic video generation.
 *
 * Usage:
 *   node scripts/render.mjs --composition ScenePlayer --storyboard ./projects/llm-inference/storyboard/storyboard.json --output ./output.mp4
 *   node scripts/render.mjs --project ../projects/llm-inference --output ./output.mp4
 *   node scripts/render.mjs --props ./props.json --output ./output.mp4
 *
 * The --project flag automatically finds storyboard.json and uses the project's
 * voiceover directory for audio files.
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync, existsSync } from "fs";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let propsPath = null;
  let storyboardPath = null;
  let projectDir = null;
  let outputPath = "./output.mp4";
  let compositionId = "ScenePlayer";
  let voiceoverBasePath = "voiceover";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--props" && args[i + 1]) {
      propsPath = args[i + 1];
      i++;
    } else if (args[i] === "--storyboard" && args[i + 1]) {
      storyboardPath = args[i + 1];
      i++;
    } else if (args[i] === "--project" && args[i + 1]) {
      projectDir = resolve(args[i + 1]);
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === "--composition" && args[i + 1]) {
      compositionId = args[i + 1];
      i++;
    } else if (args[i] === "--voiceover-path" && args[i + 1]) {
      voiceoverBasePath = args[i + 1];
      i++;
    }
  }

  // If project dir is specified, derive storyboard path from it
  if (projectDir && !storyboardPath) {
    storyboardPath = resolve(projectDir, "storyboard/storyboard.json");
  }

  // Build props based on arguments
  let props;

  if (storyboardPath) {
    // Scene-based storyboard (new format)
    if (!existsSync(storyboardPath)) {
      console.error(`Storyboard file not found: ${storyboardPath}`);
      process.exit(1);
    }

    const storyboard = JSON.parse(readFileSync(storyboardPath, "utf-8"));
    props = { storyboard, voiceoverBasePath };

    // Derive project directory from storyboard path if not specified
    if (!projectDir) {
      // storyboard is at projects/<name>/storyboard/storyboard.json
      projectDir = resolve(dirname(storyboardPath), "..");
    }

    console.log(`Loaded storyboard from ${storyboardPath}`);
    console.log(`Project directory: ${projectDir}`);
    console.log(`Title: ${storyboard.title}`);
    console.log(`Scenes: ${storyboard.scenes.length}`);
    console.log(`Composition: ${compositionId}`);
  } else if (propsPath) {
    // Legacy props file
    if (!existsSync(propsPath)) {
      console.error(`Props file not found: ${propsPath}`);
      process.exit(1);
    }

    props = JSON.parse(readFileSync(propsPath, "utf-8"));
    console.log(`Loaded props from ${propsPath}`);
    console.log(`Composition: ${compositionId}`);
  } else {
    console.error("Usage:");
    console.error("  node scripts/render.mjs --composition ScenePlayer --storyboard <storyboard.json> --output <output.mp4>");
    console.error("  node scripts/render.mjs [--composition <id>] --props <props.json> --output <output.mp4>");
    process.exit(1);
  }

  // Calculate total duration based on composition type
  let totalDuration;
  if (compositionId === "ScenePlayer" && props.storyboard) {
    // New scene-based format
    const buffer = props.storyboard.audio?.buffer_between_scenes_seconds ?? 1.0;
    totalDuration = props.storyboard.scenes.reduce(
      (acc, scene) => acc + scene.audio_duration_seconds + buffer,
      0
    );
    console.log(`Total duration: ${totalDuration.toFixed(1)}s (${props.storyboard.scenes.length} scenes)`);
  } else if (compositionId === "StoryboardPlayer" && props.storyboard) {
    // Old beat-based format
    totalDuration = props.storyboard.duration_seconds;
    console.log(`Storyboard: ${props.storyboard.title}`);
    console.log(`Beats: ${props.storyboard.beats.length}`);
  } else if (props.scenes) {
    totalDuration = props.scenes.reduce(
      (acc, scene) => acc + scene.durationInSeconds,
      0
    );
    console.log(`Title: ${props.title}`);
    console.log(`Scenes: ${props.scenes.length}`);
  } else {
    totalDuration = props.duration_seconds || 60;
  }
  console.log(`Total duration: ${totalDuration}s`);

  // Bundle the Remotion project
  console.log("\nBundling Remotion project...");
  const entryPoint = resolve(__dirname, "../src/index.ts");

  // Use project directory as public dir if available, otherwise use default
  const publicDir = projectDir || resolve(__dirname, "../public");
  console.log(`Public directory: ${publicDir}`);

  const bundleLocation = await bundle({
    entryPoint,
    publicDir,
    onProgress: (progress) => {
      if (progress % 20 === 0) {
        console.log(`  Bundle progress: ${progress}%`);
      }
    },
  });

  console.log("Bundle created successfully");

  // Select the composition
  console.log("\nPreparing composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps: props,
  });

  console.log(`Composition: ${composition.id}`);
  console.log(`Duration: ${composition.durationInFrames} frames @ ${composition.fps}fps`);
  console.log(`Resolution: ${composition.width}x${composition.height}`);

  // Render the video
  console.log(`\nRendering to ${outputPath}...`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: props,
    onProgress: ({ progress }) => {
      const percent = Math.round(progress * 100);
      if (percent % 10 === 0) {
        process.stdout.write(`\r  Render progress: ${percent}%`);
      }
    },
  });

  console.log(`\n\nVideo rendered successfully: ${outputPath}`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
