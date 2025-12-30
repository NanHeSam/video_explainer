#!/usr/bin/env node
/**
 * Render script for programmatic video generation.
 *
 * Usage:
 *   node scripts/render.mjs --project ../projects/llm-inference --output ./output.mp4
 *   node scripts/render.mjs --project ../projects/llm-inference --output ./output-4k.mp4 --width 3840 --height 2160
 *   node scripts/render.mjs --composition ScenePlayer --storyboard ./storyboard.json --output ./output.mp4
 *
 * The --project flag automatically finds storyboard.json and uses the project's
 * voiceover directory for audio files.
 *
 * Resolution options:
 *   --width <number>   Output width (default: 1920)
 *   --height <number>  Output height (default: 1080)
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync, existsSync } from "fs";

import {
  parseArgs,
  calculateDuration,
  buildProps,
  validateConfig,
  deriveStoryboardPath,
  deriveProjectDir,
  getFinalResolution,
} from "./render-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Parse command line arguments
  const config = parseArgs(process.argv.slice(2));

  // Resolve project directory path
  if (config.projectDir) {
    config.projectDir = resolve(config.projectDir);
  }

  // If project dir is specified, derive storyboard path from it
  if (config.projectDir && !config.storyboardPath) {
    config.storyboardPath = resolve(config.projectDir, "storyboard/storyboard.json");
  }

  // Build props based on arguments
  let props;
  let projectDir = config.projectDir;

  if (config.storyboardPath) {
    // Scene-based storyboard (new format)
    if (!existsSync(config.storyboardPath)) {
      console.error(`Storyboard file not found: ${config.storyboardPath}`);
      process.exit(1);
    }

    const storyboard = JSON.parse(readFileSync(config.storyboardPath, "utf-8"));
    props = buildProps(storyboard, config.voiceoverBasePath);

    // Derive project directory from storyboard path if not specified
    if (!projectDir) {
      projectDir = resolve(dirname(config.storyboardPath), "..");
    }

    console.log(`Loaded storyboard from ${config.storyboardPath}`);
    console.log(`Project directory: ${projectDir}`);
    console.log(`Title: ${storyboard.title}`);
    console.log(`Scenes: ${storyboard.scenes.length}`);
    console.log(`Composition: ${config.compositionId}`);
  } else if (config.propsPath) {
    // Legacy props file
    if (!existsSync(config.propsPath)) {
      console.error(`Props file not found: ${config.propsPath}`);
      process.exit(1);
    }

    props = JSON.parse(readFileSync(config.propsPath, "utf-8"));
    console.log(`Loaded props from ${config.propsPath}`);
    console.log(`Composition: ${config.compositionId}`);
  } else {
    console.error("Usage:");
    console.error("  node scripts/render.mjs --composition ScenePlayer --storyboard <storyboard.json> --output <output.mp4>");
    console.error("  node scripts/render.mjs [--composition <id>] --props <props.json> --output <output.mp4>");
    process.exit(1);
  }

  // Calculate total duration
  const totalDuration = calculateDuration(config.compositionId, props);
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
    id: config.compositionId,
    inputProps: props,
  });

  // Get final resolution
  const resolution = getFinalResolution(config.width, config.height, composition);

  console.log(`Composition: ${composition.id}`);
  console.log(`Duration: ${composition.durationInFrames} frames @ ${composition.fps}fps`);
  console.log(`Resolution: ${resolution.width}x${resolution.height}${resolution.isCustom ? " (custom)" : ""}`);

  // Render the video
  console.log(`\nRendering to ${config.outputPath}...`);
  await renderMedia({
    composition: {
      ...composition,
      width: resolution.width,
      height: resolution.height,
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: config.outputPath,
    inputProps: props,
    onProgress: ({ progress }) => {
      const percent = Math.round(progress * 100);
      if (percent % 10 === 0) {
        process.stdout.write(`\r  Render progress: ${percent}%`);
      }
    },
  });

  console.log(`\n\nVideo rendered successfully: ${config.outputPath}`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
