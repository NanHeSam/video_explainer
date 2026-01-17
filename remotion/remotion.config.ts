import { Config } from "@remotion/cli/config";
import path from "path";
import fs from "fs";
import webpack from "webpack";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");

// Get project name from environment variable, default to llm-image-understanding
const projectName = process.env.PROJECT || "llm-image-understanding";

// Use process.cwd() which is the remotion directory when running npm run dev
const remotionDir = process.cwd();
const projectDir = path.resolve(remotionDir, `../projects/${projectName}`);
const projectScenesDir = path.resolve(projectDir, "scenes");
const storyboardPath = path.resolve(projectDir, "storyboard/storyboard.json");

console.log(`[remotion.config] Project: ${projectName}`);
console.log(`[remotion.config] Project dir: ${projectDir}`);

// Load storyboard.json at build time for dev preview
let storyboardJson = "null";
if (fs.existsSync(storyboardPath)) {
  storyboardJson = fs.readFileSync(storyboardPath, "utf-8");
  console.log(`[remotion.config] Loaded storyboard.json`);
} else {
  console.warn(`[remotion.config] Warning: storyboard.json not found at ${storyboardPath}`);
}

// Set public directory to project directory for assets (voiceover, music, sfx)
Config.setPublicDir(projectDir);

// Configure webpack alias for @project-scenes and inject storyboard
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@project-scenes": projectScenesDir,
        "@remotion-components": path.resolve(remotionDir, "src/components"),
      },
    },
    plugins: [
      ...(config.plugins || []),
      // Inject storyboard as a global variable for dev preview
      new webpack.DefinePlugin({
        "process.env.__STORYBOARD_JSON__": storyboardJson,
      }),
    ],
  };
});
