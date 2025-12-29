/**
 * LLM Inference Explainer Video
 *
 * A comprehensive explainer about how LLM inference works,
 * covering prefill/decode phases, attention, and KV caching.
 *
 * Target duration: ~3 minutes
 * 8 Scenes total
 */

// Full video exports
export { LLMInferenceVideo, SCENE_METADATA, TOTAL_DURATION_SECONDS } from "./LLMInferenceVideo";
export { LLMInferenceWithAudio, TOTAL_DURATION_WITH_AUDIO, AUDIO_SCENE_METADATA } from "./LLMInferenceWithAudio";

// Individual scene exports
export { Scene1Hook } from "./Scene1Hook";
export { Scene2Phases } from "./Scene2Phases";
export { Scene3Bottleneck } from "./Scene3Bottleneck";
export { Scene4Attention } from "./Scene4Attention";
export { Scene5Redundancy } from "./Scene5Redundancy";
export { Scene6KVCache } from "./Scene6KVCache";
export { Scene7Mechanics } from "./Scene7Mechanics";
export { Scene8Impact } from "./Scene8Impact";

// Scene metadata for composition
export const LLM_INFERENCE_SCENES = {
  scene1: {
    id: "Scene1Hook",
    title: "The Speed Problem",
    durationSeconds: 15,
  },
  scene2: {
    id: "Scene2Phases",
    title: "The Two Phases",
    durationSeconds: 20,
  },
  scene3: {
    id: "Scene3Bottleneck",
    title: "The Decode Bottleneck",
    durationSeconds: 25,
  },
  scene4: {
    id: "Scene4Attention",
    title: "Understanding Attention",
    durationSeconds: 25,
  },
  scene5: {
    id: "Scene5Redundancy",
    title: "The Redundancy Problem",
    durationSeconds: 25,
  },
  scene6: {
    id: "Scene6KVCache",
    title: "The KV Cache Solution",
    durationSeconds: 25,
  },
  scene7: {
    id: "Scene7Mechanics",
    title: "How KV Cache Works",
    durationSeconds: 20,
  },
  scene8: {
    id: "Scene8Impact",
    title: "The Impact",
    durationSeconds: 25,
  },
} as const;
