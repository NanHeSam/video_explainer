/**
 * Tests for AnimatedCaptions component.
 *
 * Tests the single-word caption display for YouTube Shorts.
 */

import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock remotion modules
vi.mock("remotion", () => ({
  interpolate: (
    value: number,
    inputRange: number[],
    outputRange: number[],
    options?: { extrapolateRight?: string }
  ) => {
    const [inMin, inMax] = inputRange;
    const [outMin, outMax] = outputRange;

    let ratio = (value - inMin) / (inMax - inMin);

    if (options?.extrapolateRight === "clamp") {
      ratio = Math.min(Math.max(ratio, 0), 1);
    }

    return outMin + ratio * (outMax - outMin);
  },
  useVideoConfig: () => ({
    fps: 30,
    width: 1080,
    height: 1920,
    durationInFrames: 300,
  }),
}));

// Mock ShortsPlayer exports
vi.mock("./ShortsPlayer", () => ({
  SHORTS_COLORS: {
    text: "#ffffff",
    textDim: "#888888",
    textMuted: "#666666",
    primary: "#00d4ff",
    primaryGlow: "#00d4ff60",
  },
  SHORTS_FONTS: {
    primary: "Inter, sans-serif",
  },
}));

// Import after mocks
import { AnimatedCaptions, SimpleAnimatedCaptions } from "./AnimatedCaptions";

// ============================================================================
// Test Helpers
// ============================================================================

interface WordTimestamp {
  word: string;
  start_seconds: number;
  end_seconds: number;
}

const createWordTimestamps = (words: string[], startTime = 0): WordTimestamp[] => {
  return words.map((word, i) => ({
    word,
    start_seconds: startTime + i * 0.5,
    end_seconds: startTime + i * 0.5 + 0.4,
  }));
};

// ============================================================================
// AnimatedCaptions Tests
// ============================================================================

describe("AnimatedCaptions", () => {
  const defaultProps = {
    text: "This is a test caption",
    wordTimestamps: createWordTimestamps(["This", "is", "a", "test", "caption"]),
    currentTime: 0,
    beatStartTime: 0,
    scale: 1,
  };

  describe("Single Word Display", () => {
    it("should show only one word at a time", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: 0.2, // During "This"
      });

      // The component returns a div structure
      // We verify the structure is correct for single-word display
      expect(result).toBeDefined();
      expect(result.props.children).toBeDefined();
    });

    it("should show the correct word based on currentTime", () => {
      // Test word at different times
      const times = [
        { time: 0.2, expectedWord: "This" },
        { time: 0.7, expectedWord: "is" },
        { time: 1.2, expectedWord: "a" },
        { time: 1.7, expectedWord: "test" },
        { time: 2.2, expectedWord: "caption" },
      ];

      times.forEach(({ time, expectedWord }) => {
        const result = AnimatedCaptions({
          ...defaultProps,
          currentTime: time,
        });

        // Traverse to find the word text
        const captionBox = result.props.children;
        const wordSpan = captionBox.props.children;

        expect(wordSpan.props.children).toBe(expectedWord);
      });
    });

    it("should handle beat-local time correctly", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: 5.7, // 0.7s into beat that starts at 5s
        beatStartTime: 5.0,
      });

      // Should show "is" (second word, at 0.5-0.9s beat-local)
      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;
      expect(wordSpan.props.children).toBe("is");
    });
  });

  describe("Word Index Calculation", () => {
    it("should return first word before any timestamp", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: -0.1,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;
      expect(wordSpan.props.children).toBe("This");
    });

    it("should return last word after all timestamps", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: 10.0, // Well past all timestamps
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;
      expect(wordSpan.props.children).toBe("caption");
    });

    it("should handle empty word timestamps gracefully", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        wordTimestamps: [],
        currentTime: 1.0,
      });

      // Should not crash and should show first word from text
      expect(result).toBeDefined();
    });
  });

  describe("Styling", () => {
    it("should apply large font size for mobile readability", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        scale: 1,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      // Font size should be 72 * scale
      expect(wordSpan.props.style.fontSize).toBe(72);
    });

    it("should scale font size with scale prop", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        scale: 0.5,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      expect(wordSpan.props.style.fontSize).toBe(36); // 72 * 0.5
    });

    it("should apply uppercase text transform", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      expect(wordSpan.props.style.textTransform).toBe("uppercase");
    });

    it("should apply bold font weight", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      expect(wordSpan.props.style.fontWeight).toBe(800);
    });

    it("should have glow text shadow", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      expect(wordSpan.props.style.textShadow).toContain("0 0 30px");
    });
  });

  describe("Container Styling", () => {
    it("should have dark background with blur", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;

      expect(captionBox.props.style.background).toContain("rgba(0, 0, 0");
      expect(captionBox.props.style.backdropFilter).toContain("blur");
    });

    it("should have rounded corners", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        scale: 1,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;

      expect(captionBox.props.style.borderRadius).toBe(20);
    });

    it("should have minimum dimensions", () => {
      const result = AnimatedCaptions({
        ...defaultProps,
        scale: 1,
        currentTime: 0.2,
      });

      const captionBox = result.props.children;

      expect(captionBox.props.style.minWidth).toBe(200);
      expect(captionBox.props.style.minHeight).toBe(100);
    });
  });

  describe("Fade Animation", () => {
    it("should fade in at the start of the beat", () => {
      // At time 0, opacity should be starting to fade in
      const resultAtStart = AnimatedCaptions({
        ...defaultProps,
        currentTime: 0,
      });

      // At time 0.3, should be fully faded in
      const resultFadedIn = AnimatedCaptions({
        ...defaultProps,
        currentTime: 0.3,
      });

      expect(resultAtStart.props.style.opacity).toBeLessThan(
        resultFadedIn.props.style.opacity
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle single word text", () => {
      const result = AnimatedCaptions({
        text: "Hello",
        wordTimestamps: [{ word: "Hello", start_seconds: 0, end_seconds: 0.5 }],
        currentTime: 0.2,
        beatStartTime: 0,
        scale: 1,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      expect(wordSpan.props.children).toBe("Hello");
    });

    it("should handle text with punctuation", () => {
      const result = AnimatedCaptions({
        text: "Hello, world!",
        wordTimestamps: [
          { word: "Hello,", start_seconds: 0, end_seconds: 0.5 },
          { word: "world!", start_seconds: 0.6, end_seconds: 1.0 },
        ],
        currentTime: 0.2,
        beatStartTime: 0,
        scale: 1,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      expect(wordSpan.props.children).toBe("Hello,");
    });

    it("should handle mismatched word count between text and timestamps", () => {
      // More words in text than timestamps
      const result = AnimatedCaptions({
        text: "This has more words than timestamps",
        wordTimestamps: [
          { word: "This", start_seconds: 0, end_seconds: 0.5 },
          { word: "has", start_seconds: 0.6, end_seconds: 1.0 },
        ],
        currentTime: 0.2,
        beatStartTime: 0,
        scale: 1,
      });

      // Should not crash
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// SimpleAnimatedCaptions Tests
// ============================================================================

describe("SimpleAnimatedCaptions", () => {
  it("should show partial text based on progress", () => {
    const text = "Hello World";

    // At 0% progress
    const result0 = SimpleAnimatedCaptions({
      text,
      progress: 0,
      scale: 1,
    });

    // At 100% progress
    const result100 = SimpleAnimatedCaptions({
      text,
      progress: 1,
      scale: 1,
    });

    expect(result0).toBeDefined();
    expect(result100).toBeDefined();
  });

  it("should scale text size with scale prop", () => {
    const result = SimpleAnimatedCaptions({
      text: "Test",
      progress: 1,
      scale: 0.5,
    });

    const container = result.props.children;
    const textDiv = container.props.children;

    expect(textDiv.props.style.fontSize).toBe(21); // 42 * 0.5
  });

  it("should have dark background", () => {
    const result = SimpleAnimatedCaptions({
      text: "Test",
      progress: 0.5,
      scale: 1,
    });

    const container = result.props.children;

    expect(container.props.style.background).toContain("rgba(0, 0, 0");
  });
});

// ============================================================================
// Visible Word Range Tests
// ============================================================================

describe("Visible Word Range Logic", () => {
  it("should always include only the current word", () => {
    const words = ["one", "two", "three", "four", "five"];
    const timestamps = createWordTimestamps(words);

    // Test at each word position
    words.forEach((expectedWord, index) => {
      const result = AnimatedCaptions({
        text: words.join(" "),
        wordTimestamps: timestamps,
        currentTime: index * 0.5 + 0.2, // Middle of each word
        beatStartTime: 0,
        scale: 1,
      });

      const captionBox = result.props.children;
      const wordSpan = captionBox.props.children;

      expect(wordSpan.props.children).toBe(expectedWord);
    });
  });

  it("should work with MAX_VISIBLE_WORDS = 1", () => {
    // This tests the teleprompter behavior where only current word shows
    const words = ["alpha", "beta", "gamma", "delta", "epsilon"];
    const timestamps = createWordTimestamps(words);

    const result = AnimatedCaptions({
      text: words.join(" "),
      wordTimestamps: timestamps,
      currentTime: 1.2, // Should be on "gamma" (3rd word)
      beatStartTime: 0,
      scale: 1,
    });

    const captionBox = result.props.children;
    const wordSpan = captionBox.props.children;

    // Only "gamma" should be visible
    expect(wordSpan.props.children).toBe("gamma");
  });
});
