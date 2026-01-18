/**
 * AnimatedCaptions - Single word captions for shorts
 *
 * Features:
 * - Shows ONE word at a time, big and bold (viral TikTok/Reels style)
 * - Word-by-word sync to voiceover
 * - Large, eye-catching text optimized for mobile
 * - Dark background for readability
 */

import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { SHORTS_COLORS, SHORTS_FONTS } from "./ShortsPlayer";

interface WordTimestamp {
  word: string;
  start_seconds: number;
  end_seconds: number;
}

interface AnimatedCaptionsProps {
  text: string;
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  beatStartTime: number;
  scale: number;
}

export const AnimatedCaptions: React.FC<AnimatedCaptionsProps> = ({
  text,
  wordTimestamps,
  currentTime,
  beatStartTime,
  scale,
}) => {
  const { fps } = useVideoConfig();

  // Show only ONE word at a time for maximum impact
  const MAX_VISIBLE_WORDS = 1;

  // If we have word timestamps, use them for highlighting
  // Otherwise, fall back to showing the full text
  const hasTimestamps = wordTimestamps.length > 0;

  // Split text into words for rendering
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  // Calculate beat-local time (timestamps are relative to beat start)
  const beatLocalTime = currentTime - beatStartTime;

  // Determine which word is currently being spoken
  const getCurrentWordIndex = (): number => {
    if (!hasTimestamps) {
      // Without timestamps, highlight based on position in beat
      const beatDuration = 3; // Assume ~3 seconds per beat as fallback
      const beatProgress = beatLocalTime / beatDuration;
      return Math.floor(Math.min(beatProgress, 1) * words.length);
    }

    // Use beat-local time to compare against beat-relative timestamps
    for (let i = 0; i < wordTimestamps.length; i++) {
      const wt = wordTimestamps[i];
      if (beatLocalTime >= wt.start_seconds && beatLocalTime < wt.end_seconds) {
        return i;
      }
      if (beatLocalTime < wt.start_seconds) {
        return Math.max(0, i - 1);
      }
    }
    return wordTimestamps.length - 1;
  };

  const currentWordIndex = getCurrentWordIndex();

  // Calculate visible word window (current word is always at the end/rightmost)
  // This creates a teleprompter effect: words flow in and the highlight follows
  const getVisibleWordRange = (): { start: number; end: number } => {
    const totalWords = words.length;

    if (totalWords <= MAX_VISIBLE_WORDS) {
      return { start: 0, end: totalWords };
    }

    // Current word is always at the end (rightmost position)
    // Show up to MAX_VISIBLE_WORDS-1 previous words for context
    const end = currentWordIndex + 1;  // Include current word
    const start = Math.max(0, end - MAX_VISIBLE_WORDS);

    return { start, end };
  };

  const { start: visibleStart, end: visibleEnd } = getVisibleWordRange();
  const currentWord = words[currentWordIndex] || "";

  const fadeIn = interpolate(beatLocalTime, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
        padding: `${20 * scale}px`,
      }}
    >
      {/* Single word - big and bold */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(12px)",
          borderRadius: 20 * scale,
          padding: `${32 * scale}px ${48 * scale}px`,
          minWidth: 200 * scale,
          minHeight: 100 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 72 * scale,
            fontFamily: SHORTS_FONTS.primary,
            fontWeight: 800,
            color: SHORTS_COLORS.primary,
            textShadow: `0 0 30px ${SHORTS_COLORS.primaryGlow}, 0 0 60px ${SHORTS_COLORS.primaryGlow}40`,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          {currentWord}
        </span>
      </div>
    </div>
  );
};

interface CaptionWordProps {
  word: string;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
  scale: number;
  fps: number;
  index: number;
  currentWordIndex: number;
}

const CaptionWord: React.FC<CaptionWordProps> = ({
  word,
  isActive,
  isPast,
  isFuture,
  scale,
  fps,
  index,
  currentWordIndex,
}) => {
  // Animation for active word
  const activeScale = isActive ? 1.05 : 1;

  // Color based on state
  let color = SHORTS_COLORS.textMuted; // Future words - dimmed
  if (isActive) {
    color = SHORTS_COLORS.primary; // Active word - highlighted
  } else if (isPast) {
    color = SHORTS_COLORS.text; // Past words - normal white
  }

  // Glow effect for active word
  const glowOpacity = isActive ? 0.8 : 0;

  return (
    <span
      style={{
        fontSize: 42 * scale,
        fontFamily: SHORTS_FONTS.primary,
        fontWeight: isActive ? 700 : 500,
        color,
        transform: `scale(${activeScale})`,
        transition: "all 0.15s ease-out",
        textShadow: isActive
          ? `0 0 20px ${SHORTS_COLORS.primaryGlow}, 0 0 40px ${SHORTS_COLORS.primaryGlow}40`
          : "none",
        display: "inline-block",
      }}
    >
      {word}
    </span>
  );
};

/**
 * Simplified captions without word-level sync
 * Shows text with a typewriter effect
 */
export const SimpleAnimatedCaptions: React.FC<{
  text: string;
  progress: number; // 0-1 progress through the beat
  scale: number;
}> = ({ text, progress, scale }) => {
  // Show more characters as progress increases
  const visibleLength = Math.floor(text.length * Math.min(progress * 1.5, 1));
  const visibleText = text.slice(0, visibleLength);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: `${20 * scale}px`,
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(10px)",
          borderRadius: 16 * scale,
          padding: `${24 * scale}px ${32 * scale}px`,
          maxWidth: 1000 * scale,
        }}
      >
        <div
          style={{
            fontSize: 42 * scale,
            fontFamily: SHORTS_FONTS.primary,
            fontWeight: 600,
            color: SHORTS_COLORS.text,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {visibleText}
          {visibleLength < text.length && (
            <span
              style={{
                opacity: 0.5,
                animation: "blink 0.5s infinite",
              }}
            >
              |
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedCaptions;
