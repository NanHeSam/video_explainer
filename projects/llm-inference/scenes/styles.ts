/**
 * Shared Style Constants for LLM Inference Video
 *
 * This file centralizes all visual styling to ensure consistency across all 16+ scenes.
 * Import STYLE_CONSTANTS in each scene component to use standardized styling.
 */

// ===== COLOR PALETTE =====
export const COLORS = {
  // Primary colors
  primary: "#00d9ff",      // Primary cyan - used for titles and highlights
  secondary: "#ff6b35",    // Orange - used for secondary elements
  success: "#00ff88",      // Green - positive indicators
  warning: "#f1c40f",      // Yellow - caution/warning
  error: "#ff4757",        // Red - errors/problems

  // Neutral colors
  background: "#0f0f1a",   // Dark background
  surface: "#1a1a2e",      // Surface/card background
  text: "#ffffff",         // Primary text
  textDim: "#888888",      // Dimmed/secondary text
  textMuted: "#666666",    // Even more muted text

  // Specific use cases
  compute: "#00d9ff",      // Compute-related (same as primary)
  memory: "#ff6b35",       // Memory-related
  cache: "#9b59b6",        // Cache/storage related (purple)
  query: "#00d9ff",        // Query vector (cyan)
  key: "#ff6b35",          // Key vector (orange)
  value: "#00ff88",        // Value vector (green)
  attention: "#9b59b6",    // Attention scores (purple)

  // GPU/Hardware
  gpu: "#2d2d44",          // GPU background
  gpuBorder: "#00d9ff",    // GPU border
};

// ===== TYPOGRAPHY =====
export const TYPOGRAPHY = {
  // Title styling (56px, primary cyan, bold)
  title: {
    fontSize: 56,
    fontWeight: 700 as const,
    color: COLORS.primary,
    margin: 0,
  },

  // Subtitle styling (28px, lighter weight, secondary color)
  subtitle: {
    fontSize: 28,
    fontWeight: 400 as const,
    color: COLORS.textDim,
    marginTop: 8,
  },

  // Section headers
  sectionHeader: {
    fontSize: 32,
    fontWeight: 700 as const,
    color: COLORS.text,
  },

  // Body text
  body: {
    fontSize: 22,
    fontWeight: 400 as const,
    color: COLORS.text,
    lineHeight: 1.6,
  },

  // Code/monospace text
  mono: {
    fontFamily: "JetBrains Mono, monospace",
  },
};

// ===== SCENE INDICATOR =====
export const SCENE_INDICATOR = {
  container: {
    position: "absolute" as const,
    top: 20,
    left: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primary + "20",
    border: `2px solid ${COLORS.primary}`,
  },
  text: {
    fontSize: 18,
    fontWeight: 700 as const,
    color: COLORS.primary,
    fontFamily: "JetBrains Mono, monospace",
  },
};

// ===== KEY INSIGHT BOX =====
export const KEY_INSIGHT = {
  container: {
    position: "absolute" as const,
    bottom: 80,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
  },
  box: {
    backgroundColor: COLORS.primary + "1A", // 0.1 opacity (hex: 1A ≈ 10%)
    borderRadius: 12,
    padding: "20px 30px",
    border: `1px solid ${COLORS.primary}40`,
    maxWidth: 900,
    textAlign: "center" as const,
  },
  text: {
    fontSize: 26,
    fontWeight: 500 as const,
    color: COLORS.text,
    lineHeight: 1.5,
  },
  highlight: {
    fontWeight: 700 as const,
  },
};

// ===== LAYOUT =====
export const LAYOUT = {
  // Title position from top
  titleTop: 50,

  // Content area margins
  contentMarginHorizontal: 80,
  contentMarginTop: 140,

  // Key insight position from bottom
  keyInsightBottom: 80,

  // Scene indicator position
  sceneIndicatorTop: 20,
  sceneIndicatorLeft: 20,
};

// ===== ANIMATION CONSTANTS =====
export const ANIMATION = {
  // Standard fade in duration in frames (at 30fps)
  fadeInDuration: 15,

  // Spring config for smooth animations
  springConfig: {
    damping: 12,
    stiffness: 100,
    mass: 1,
  },

  // Quick spring for snappy animations
  quickSpring: {
    damping: 15,
    stiffness: 200,
  },
};

// ===== COMPONENT STYLES =====
export const STYLE_CONSTANTS = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  sceneIndicator: SCENE_INDICATOR,
  keyInsight: KEY_INSIGHT,
  layout: LAYOUT,
  animation: ANIMATION,
};

// ===== HELPER FUNCTIONS =====

/**
 * Get scaled value based on viewport size
 * Reference resolution: 1920x1080
 */
export const getScale = (width: number, height: number): number => {
  return Math.min(width / 1920, height / 1080);
};

/**
 * Get title style with scale applied
 */
export const getTitleStyle = (scale: number): React.CSSProperties => ({
  fontSize: TYPOGRAPHY.title.fontSize * scale,
  fontWeight: TYPOGRAPHY.title.fontWeight,
  color: TYPOGRAPHY.title.color,
  margin: 0,
});

/**
 * Get subtitle style with scale applied
 */
export const getSubtitleStyle = (scale: number): React.CSSProperties => ({
  fontSize: TYPOGRAPHY.subtitle.fontSize * scale,
  fontWeight: TYPOGRAPHY.subtitle.fontWeight,
  color: TYPOGRAPHY.subtitle.color,
  marginTop: TYPOGRAPHY.subtitle.marginTop * scale,
});

/**
 * Get scene indicator container style with scale applied
 */
export const getSceneIndicatorStyle = (scale: number): React.CSSProperties => ({
  position: "absolute",
  top: SCENE_INDICATOR.container.top * scale,
  left: SCENE_INDICATOR.container.left * scale,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: SCENE_INDICATOR.container.width * scale,
  height: SCENE_INDICATOR.container.height * scale,
  borderRadius: SCENE_INDICATOR.container.borderRadius * scale,
  backgroundColor: SCENE_INDICATOR.container.backgroundColor,
  border: `${2 * scale}px solid ${COLORS.primary}`,
});

/**
 * Get scene indicator text style with scale applied
 */
export const getSceneIndicatorTextStyle = (scale: number): React.CSSProperties => ({
  fontSize: SCENE_INDICATOR.text.fontSize * scale,
  fontWeight: SCENE_INDICATOR.text.fontWeight,
  color: SCENE_INDICATOR.text.color,
  fontFamily: SCENE_INDICATOR.text.fontFamily,
});

/**
 * Get key insight container style with scale applied
 */
export const getKeyInsightContainerStyle = (scale: number): React.CSSProperties => ({
  position: "absolute",
  bottom: KEY_INSIGHT.container.bottom * scale,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
});

/**
 * Get key insight box style with scale applied
 */
export const getKeyInsightBoxStyle = (scale: number): React.CSSProperties => ({
  backgroundColor: KEY_INSIGHT.box.backgroundColor,
  borderRadius: KEY_INSIGHT.box.borderRadius * scale,
  padding: `${20 * scale}px ${30 * scale}px`,
  border: KEY_INSIGHT.box.border,
  maxWidth: KEY_INSIGHT.box.maxWidth * scale,
  textAlign: KEY_INSIGHT.box.textAlign,
});

/**
 * Get key insight text style with scale applied
 */
export const getKeyInsightTextStyle = (scale: number): React.CSSProperties => ({
  fontSize: KEY_INSIGHT.text.fontSize * scale,
  fontWeight: KEY_INSIGHT.text.fontWeight,
  color: KEY_INSIGHT.text.color,
  lineHeight: KEY_INSIGHT.text.lineHeight,
});

// ===== SHARED COMPONENTS =====

/**
 * Scene indicator component props
 */
export interface SceneIndicatorProps {
  sceneNumber: number;
  scale: number;
  opacity?: number;
}

/**
 * Key insight component props
 */
export interface KeyInsightProps {
  children: React.ReactNode;
  scale: number;
  opacity?: number;
}

export default STYLE_CONSTANTS;
