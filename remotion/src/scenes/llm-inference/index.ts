/**
 * LLM Inference Scene Registry
 *
 * Exports all scene components for the LLM Inference explainer video
 * and a registry mapping scene type names to components.
 */

import React from "react";

// Scene component exports
export { HookScene } from "./HookScene";
export { PhasesScene } from "./PhasesScene";
export { BottleneckScene } from "./BottleneckScene";
export { AttentionScene } from "./AttentionScene";
export { RedundancyScene } from "./RedundancyScene";
export { KVCacheScene } from "./KVCacheScene";
export { MechanicsScene } from "./MechanicsScene";
export { ImpactScene } from "./ImpactScene";
export { StaticBatchingScene } from "./StaticBatchingScene";
export { MemoryFragmentationScene } from "./MemoryFragmentationScene";
export { ContinuousBatchingScene } from "./ContinuousBatchingScene";
export { PagedAttentionScene } from "./PagedAttentionScene";
export { QuantizationScene } from "./QuantizationScene";
export { SpeculativeDecodingScene } from "./SpeculativeDecodingScene";
export { ScalingScene } from "./ScalingScene";
export { EconomicsScene } from "./EconomicsScene";
export { ConclusionScene } from "./ConclusionScene";

// Import for registry
import { HookScene } from "./HookScene";
import { PhasesScene } from "./PhasesScene";
import { BottleneckScene } from "./BottleneckScene";
import { AttentionScene } from "./AttentionScene";
import { RedundancyScene } from "./RedundancyScene";
import { KVCacheScene } from "./KVCacheScene";
import { MechanicsScene } from "./MechanicsScene";
import { ImpactScene } from "./ImpactScene";
import { StaticBatchingScene } from "./StaticBatchingScene";
import { MemoryFragmentationScene } from "./MemoryFragmentationScene";
import { ContinuousBatchingScene } from "./ContinuousBatchingScene";
import { PagedAttentionScene } from "./PagedAttentionScene";
import { QuantizationScene } from "./QuantizationScene";
import { SpeculativeDecodingScene } from "./SpeculativeDecodingScene";
import { ScalingScene } from "./ScalingScene";
import { EconomicsScene } from "./EconomicsScene";
import { ConclusionScene } from "./ConclusionScene";

/**
 * Scene component type - any React component that can be rendered as a scene
 */
export type SceneComponent = React.FC<{ startFrame?: number }>;

/**
 * Registry mapping scene type names to their React components.
 * Used by StoryboardPlayer to dynamically render scenes based on storyboard.json
 */
export const LLM_INFERENCE_SCENES: Record<string, SceneComponent> = {
  hook: HookScene,
  phases: PhasesScene,
  bottleneck: BottleneckScene,
  attention: AttentionScene,
  redundancy: RedundancyScene,
  kvcache: KVCacheScene,
  mechanics: MechanicsScene,
  impact: ImpactScene,
  static_batching: StaticBatchingScene,
  memory_fragmentation: MemoryFragmentationScene,
  continuous_batching: ContinuousBatchingScene,
  paged_attention: PagedAttentionScene,
  quantization: QuantizationScene,
  speculative_decoding: SpeculativeDecodingScene,
  scaling: ScalingScene,
  economics: EconomicsScene,
  conclusion: ConclusionScene,
};

/**
 * Get a scene component by type name
 */
export function getScene(type: string): SceneComponent | undefined {
  return LLM_INFERENCE_SCENES[type];
}

/**
 * List all available scene types
 */
export function getAvailableSceneTypes(): string[] {
  return Object.keys(LLM_INFERENCE_SCENES);
}
