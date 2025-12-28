# Storyboard: Prefill vs Decode

## Scene Overview

**Concept**: The two phases of LLM inference have fundamentally different computational characteristics.
- Prefill processes all input tokens in parallel → compute-bound
- Decode generates tokens one at a time → memory-bound

**Core Insight**: Decode is slow not because GPUs lack compute power, but because they're starved for data. The GPU sits idle waiting for weights to arrive from memory.

**Target Duration**: 45-60 seconds
**Voiceover Word Count**: ~120-150 words

---

## Visual Strategy

### Key Visual Metaphors

1. **Tokens as lit/unlit blocks**: Shows parallel vs sequential processing
2. **GPU utilization gauge**: Makes the efficiency difference visceral
3. **Data pipe visualization**: Shows the memory bandwidth bottleneck

### What NOT to do
- No walls of text
- No bullet point lists appearing on screen
- No generic "title card then explanation" pattern

### Design Principles
- Build complexity gradually (don't show everything at once)
- Voiceover carries the narrative; visuals demonstrate
- Every animation should answer "why" not just "what"

---

## Frame-by-Frame Storyboard

### Beat 1: Setup (0:00 - 0:05)
**Voiceover**: "When you send a prompt to an LLM, two very different things happen."

**Visual**:
- Black screen fades in to show a simple prompt: `"Explain quantum computing"`
- Prompt floats in center, styled as a chat bubble or terminal input
- Subtle glow effect on the text

**Animation**:
- Text types in character by character (0.5s)
- Slight pause, then arrow or indicator pointing down (0.3s)
- Transition: prompt shrinks and moves to top-left corner

**Technical Notes**:
- Font: JetBrains Mono for the prompt text
- Background: #0f0f1a
- Text color: #e0e0e0

---

### Beat 2: Prefill Introduction (0:05 - 0:15)
**Voiceover**: "First, the model processes your entire prompt at once. This is called prefill. All your input tokens are processed in parallel—simultaneously."

**Visual**:
- Show the prompt broken into tokens: `["Explain", "quantum", "computing"]`
- Each token is a rounded rectangle (pill shape)
- Tokens arranged in a horizontal row

**Animation Sequence**:
1. (0:05-0:07) Tokens appear one by one, fading in from left to right
2. (0:07-0:08) Brief pause - all tokens visible but dim/gray
3. (0:08-0:10) Label "PREFILL" appears above
4. (0:10-0:12) **KEY MOMENT**: All tokens light up SIMULTANEOUSLY with cyan glow (#00d9ff)
5. (0:12-0:15) Pulse effect - tokens pulse once together, showing they're processed as a unit

**Technical Notes**:
- Token initial color: #3a3a4a (dim gray)
- Token active color: #00d9ff (cyan) with glow/shadow
- Simultaneous activation is KEY - this is the core visual that shows "parallel"

---

### Beat 3: GPU Utilization - Prefill (0:15 - 0:22)
**Voiceover**: "During prefill, your GPU is working at full capacity. All those tensor cores are crunching numbers."

**Visual**:
- Split view: tokens remain visible (top half), GPU visualization appears (bottom half)
- GPU shown as a simplified chip icon with a utilization bar
- Label: "GPU Compute"

**Animation Sequence**:
1. (0:15-0:17) GPU chip fades in below the tokens
2. (0:17-0:19) Utilization bar fills rapidly to 100%
3. (0:19-0:20) "100%" label appears next to bar
4. (0:20-0:22) Small "COMPUTE BOUND" label fades in below, green color (#00ff88)

**Technical Notes**:
- GPU utilization bar: gradient from dark to bright cyan as it fills
- Keep the tokens visible and glowing above to maintain context
- The 100% fill should feel satisfying and fast

---

### Beat 4: Transition to Decode (0:22 - 0:27)
**Voiceover**: "But then comes decode—generating the response, one token at a time."

**Visual**:
- The prefill section dims/moves to left side
- New section appears on right side for decode
- Output area appears: empty slots where response tokens will go

**Animation Sequence**:
1. (0:22-0:24) Prefill section shrinks and moves left (but stays visible as reference)
2. (0:24-0:25) Vertical divider line appears
3. (0:25-0:27) Right side: "DECODE" label appears, empty token slots fade in below

**Technical Notes**:
- Side-by-side comparison layout
- Left side (prefill): slightly smaller, maybe 40% opacity to de-emphasize
- Right side (decode): full brightness, focal point

---

### Beat 5: Decode - Sequential Generation (0:27 - 0:38)
**Voiceover**: "Each new token depends on all the previous ones. So we generate them one... by... one. And for each token, we need to load the entire model from memory."

**Visual**:
- Right side shows output tokens appearing sequentially
- Show 5-6 tokens generating: `["Quantum", "computing", "is", "a", "type", "of"]`

**Animation Sequence**:
1. (0:27-0:29) First output token appears, lights up cyan (like prefill)
2. (0:29-0:30) Brief pause (showing the wait)
3. (0:30-0:31) Second token appears and lights up
4. (0:31-0:32) Pause
5. (0:32-0:38) Continue pattern - each token takes ~1 second, deliberate slowness

**Critical Detail**: The PACE of token appearance should feel slow and deliberate. Each token lighting up individually, with visible pauses between them. This contrast with prefill's simultaneous activation is the key visual insight.

**Technical Notes**:
- Same token style as prefill for consistency
- The slowness is intentional - viewer should feel "why is this so slow?"

---

### Beat 6: GPU Utilization - Decode (0:38 - 0:48)
**Voiceover**: "And here's the problem: all those tensor cores? Mostly sitting idle. The GPU isn't compute-limited—it's memory-limited. It's waiting for data."

**Visual**:
- GPU utilization gauge on decode side
- The gauge barely fills (5-10%)
- Memory bandwidth visualization: a "pipe" showing data trickling through

**Animation Sequence**:
1. (0:38-0:40) GPU utilization bar appears on decode side
2. (0:40-0:42) Bar fills... but only to about 5%
3. (0:42-0:43) "5%" label appears, RED color (#ff4757) to indicate problem
4. (0:43-0:45) "MEMORY BOUND" label appears in red below
5. (0:45-0:48) Optional: show a "memory pipe" with data trickling through slowly, GPU chip with a "waiting" indicator

**Technical Notes**:
- The contrast between 100% (prefill) and 5% (decode) should be striking
- Red color for memory-bound indicates this is the bottleneck/problem
- This is the "aha moment" - decode is slow because of memory, not compute

---

### Beat 7: Side-by-Side Comparison (0:48 - 0:55)
**Voiceover**: "Prefill: compute-bound, GPU at full blast. Decode: memory-bound, GPU starved for data. Two phases, completely different bottlenecks."

**Visual**:
- Clean side-by-side comparison
- Left: "PREFILL" label, tokens lit simultaneously, GPU at 100%, "COMPUTE BOUND" (green)
- Right: "DECODE" label, tokens lighting sequentially, GPU at 5%, "MEMORY BOUND" (red)

**Animation Sequence**:
1. (0:48-0:50) Both sides visible, clean layout
2. (0:50-0:52) Left side tokens pulse together (one more time)
3. (0:52-0:54) Right side shows another token appearing (sequential)
4. (0:54-0:55) Hold on comparison

**Technical Notes**:
- This is the summary frame - should be clean and readable
- Good "thumbnail" moment if someone pauses here

---

### Beat 8: The Implication (0:55 - 1:00)
**Voiceover**: "This is why generating long responses is so much slower than you'd expect. And why optimizing decode is where the real wins are."

**Visual**:
- Transition out of split view
- Perhaps show a simple stat: "87x improvement possible" with arrow pointing forward
- Or just fade to a cleaner "to be continued" state

**Animation Sequence**:
1. (0:55-0:57) Comparison view fades slightly
2. (0:57-1:00) Teaser for next section or clean fade out

---

## Timing Summary

| Beat | Time | Duration | Key Visual |
|------|------|----------|------------|
| 1. Setup | 0:00-0:05 | 5s | Prompt appears |
| 2. Prefill intro | 0:05-0:15 | 10s | Tokens light simultaneously |
| 3. GPU - Prefill | 0:15-0:22 | 7s | 100% utilization |
| 4. Transition | 0:22-0:27 | 5s | Split view setup |
| 5. Decode - Sequential | 0:27-0:38 | 11s | Tokens one by one |
| 6. GPU - Decode | 0:38-0:48 | 10s | 5% utilization, memory bound |
| 7. Comparison | 0:48-0:55 | 7s | Side by side |
| 8. Implication | 0:55-1:00 | 5s | Wrap up |

**Total**: ~60 seconds

---

## Voiceover Script (Complete)

```
When you send a prompt to an LLM, two very different things happen.

First, the model processes your entire prompt at once. This is called prefill.
All your input tokens are processed in parallel—simultaneously.

During prefill, your GPU is working at full capacity.
All those tensor cores are crunching numbers.

But then comes decode—generating the response, one token at a time.

Each new token depends on all the previous ones.
So we generate them one... by... one.
And for each token, we need to load the entire model from memory.

And here's the problem: all those tensor cores? Mostly sitting idle.
The GPU isn't compute-limited—it's memory-limited. It's waiting for data.

Prefill: compute-bound, GPU at full blast.
Decode: memory-bound, GPU starved for data.
Two phases, completely different bottlenecks.

This is why generating long responses is so much slower than you'd expect.
And why optimizing decode is where the real wins are.
```

**Word count**: ~150 words
**Estimated speaking time**: 55-65 seconds at conversational pace

---

## Component Requirements

To build this scene, we need these Remotion components:

### 1. Token Component
- Props: `text`, `isActive`, `index`
- States: dim (gray), active (cyan glow), generating (pulse animation)
- Animation: fade in, activate (color change + glow), pulse

### 2. TokenRow Component
- Props: `tokens[]`, `mode: "prefill" | "decode"`, `activeIndex`
- Prefill mode: all tokens activate simultaneously
- Decode mode: tokens activate sequentially with delays

### 3. GPUGauge Component
- Props: `utilization` (0-100), `label`, `status: "compute" | "memory"`
- Visual: horizontal bar that fills, percentage label
- Color: green for compute-bound, red for memory-bound

### 4. ComparisonLayout Component
- Props: `leftContent`, `rightContent`, `leftLabel`, `rightLabel`
- Handles the side-by-side split view with divider

### 5. Scene Container
- Background color
- Handles transitions between beats
- Coordinates timing across all elements

---

## Open Questions

1. Should we show the actual "memory pipe" visualization, or is GPU gauge enough?
2. For decode, should we show an "infinity" of tokens to generate, or keep it bounded?
3. Do we want sound effects for token activation, or music only?
4. Should the prompt be more technical (actual tokens) or readable (words)?

---

## Success Criteria

After watching this scene, the viewer should:
1. Understand that LLM inference has two distinct phases
2. Viscerally feel the difference between parallel (prefill) and sequential (decode)
3. Know that decode is memory-bound, not compute-bound
4. Be curious about how to optimize decode (setup for next section)
