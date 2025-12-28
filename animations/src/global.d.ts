/// <reference types="@motion-canvas/2d/lib/jsx-runtime" />

declare module '*?scene' {
  import {FullSceneDescription} from '@motion-canvas/core';
  const scene: FullSceneDescription<unknown>;
  export default scene;
}
