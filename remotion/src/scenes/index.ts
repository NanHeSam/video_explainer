/**
 * Main Scene Registry
 *
 * Combines scene registries from all projects and provides
 * a unified interface for looking up scenes by "project/type" format.
 */

import React from "react";
import { LLM_INFERENCE_SCENES, SceneComponent } from "./llm-inference";

// Re-export project-specific registries
export * from "./llm-inference";

/**
 * All project scene registries
 */
const PROJECT_REGISTRIES: Record<string, Record<string, SceneComponent>> = {
  "llm-inference": LLM_INFERENCE_SCENES,
  // Add more projects here as they're created:
  // "another-video": ANOTHER_VIDEO_SCENES,
};

/**
 * Get a scene component by full path (e.g., "llm-inference/hook")
 *
 * @param scenePath - Full scene path in "project/type" format
 * @returns The scene component or undefined if not found
 */
export function getSceneByPath(scenePath: string): SceneComponent | undefined {
  const parts = scenePath.split("/");

  if (parts.length === 2) {
    const [project, type] = parts;
    const registry = PROJECT_REGISTRIES[project];
    if (registry) {
      return registry[type];
    }
  }

  // Fallback: try to find in any registry (for backwards compatibility)
  for (const registry of Object.values(PROJECT_REGISTRIES)) {
    if (registry[scenePath]) {
      return registry[scenePath];
    }
  }

  return undefined;
}

/**
 * Get all available scene paths across all projects
 */
export function getAllScenePaths(): string[] {
  const paths: string[] = [];
  for (const [project, registry] of Object.entries(PROJECT_REGISTRIES)) {
    for (const type of Object.keys(registry)) {
      paths.push(`${project}/${type}`);
    }
  }
  return paths;
}

/**
 * Check if a scene path exists
 */
export function hasScene(scenePath: string): boolean {
  return getSceneByPath(scenePath) !== undefined;
}

/**
 * Get all projects that have registered scenes
 */
export function getProjects(): string[] {
  return Object.keys(PROJECT_REGISTRIES);
}

/**
 * Get all scene types for a specific project
 */
export function getProjectSceneTypes(project: string): string[] {
  const registry = PROJECT_REGISTRIES[project];
  return registry ? Object.keys(registry) : [];
}
