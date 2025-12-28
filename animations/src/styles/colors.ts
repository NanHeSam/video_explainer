/**
 * Color palette for the LLM Inference explainer video.
 */

export const Colors = {
  // Backgrounds
  background: '#0f0f1a',
  backgroundAlt: '#1a1a2e',

  // Primary accent colors
  compute: '#00d9ff',    // Cyan - data flow, tokens, activations
  memory: '#ff6b35',     // Orange - GPU memory, HBM, bandwidth
  optimization: '#00ff88', // Green - improvements, solutions, gains
  warning: '#ff4757',    // Red - bottlenecks, problems

  // Text and UI
  text: '#e0e0e0',
  textDim: '#888888',
  accent: '#a855f7',     // Purple - highlights, emphasis

  // Token colors
  tokenActive: '#00d9ff',
  tokenInactive: '#3a3a5a',
  tokenCached: '#00ff88',
};

export const Fonts = {
  main: 'Inter, SF Pro Display, -apple-system, sans-serif',
  mono: 'JetBrains Mono, SF Mono, Menlo, monospace',
};
