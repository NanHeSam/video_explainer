import {makeScene2D, Rect, Txt, Circle, Line} from '@motion-canvas/2d';
import {
  createRef,
  all,
  sequence,
  waitFor,
  chain,
  loop,
  createSignal,
  easeInOutCubic,
} from '@motion-canvas/core';
import {Colors, Fonts} from '../styles/colors';

/**
 * Scene: Prefill vs Decode comparison
 *
 * This scene demonstrates the fundamental difference between the two phases
 * of LLM inference:
 * - Prefill: All tokens processed in parallel (compute-bound)
 * - Decode: Tokens generated one at a time (memory-bound)
 */
export default makeScene2D(function* (view) {
  // Title
  const title = createRef<Txt>();

  view.add(
    <Txt
      ref={title}
      text="The Two Phases of Inference"
      fontSize={64}
      fontFamily={Fonts.main}
      fill={Colors.text}
      y={-450}
      opacity={0}
    />
  );

  // Animate title in
  yield* title().opacity(1, 0.5);
  yield* waitFor(0.5);

  // Create containers for prefill and decode sides
  const prefillContainer = createRef<Rect>();
  const decodeContainer = createRef<Rect>();

  // Labels
  const prefillLabel = createRef<Txt>();
  const decodeLabel = createRef<Txt>();

  // GPU utilization bars
  const prefillGpuBar = createRef<Rect>();
  const decodeGpuBar = createRef<Rect>();
  const prefillGpuFill = createRef<Rect>();
  const decodeGpuFill = createRef<Rect>();

  // Memory bandwidth bars
  const prefillMemBar = createRef<Rect>();
  const decodeMemBar = createRef<Rect>();
  const prefillMemFill = createRef<Rect>();
  const decodeMemFill = createRef<Rect>();

  // Add containers
  view.add(
    <>
      {/* Prefill Side */}
      <Rect
        ref={prefillContainer}
        x={-450}
        y={0}
        width={700}
        height={600}
        fill={Colors.backgroundAlt}
        radius={20}
        opacity={0}
      >
        <Txt
          ref={prefillLabel}
          text="PREFILL"
          fontSize={42}
          fontFamily={Fonts.main}
          fontWeight={700}
          fill={Colors.compute}
          y={-240}
        />
      </Rect>

      {/* Decode Side */}
      <Rect
        ref={decodeContainer}
        x={450}
        y={0}
        width={700}
        height={600}
        fill={Colors.backgroundAlt}
        radius={20}
        opacity={0}
      >
        <Txt
          ref={decodeLabel}
          text="DECODE"
          fontSize={42}
          fontFamily={Fonts.main}
          fontWeight={700}
          fill={Colors.memory}
          y={-240}
        />
      </Rect>
    </>
  );

  // Animate containers in
  yield* all(
    prefillContainer().opacity(1, 0.5),
    decodeContainer().opacity(1, 0.5),
  );

  // Create tokens for prefill side (8 tokens in a row)
  const prefillTokenRefs: ReturnType<typeof createRef<Rect>>[] = [];
  const tokenWidth = 60;
  const tokenGap = 10;
  const startX = -3.5 * (tokenWidth + tokenGap);

  for (let i = 0; i < 8; i++) {
    const token = createRef<Rect>();
    prefillTokenRefs.push(token);
    prefillContainer().add(
      <Rect
        ref={token}
        x={startX + i * (tokenWidth + tokenGap)}
        y={-100}
        width={tokenWidth}
        height={tokenWidth}
        fill={Colors.tokenInactive}
        radius={10}
        opacity={0}
      />
    );
  }

  // Create tokens for decode side (showing one-at-a-time generation)
  const decodeTokenRefs: ReturnType<typeof createRef<Rect>>[] = [];
  for (let i = 0; i < 8; i++) {
    const token = createRef<Rect>();
    decodeTokenRefs.push(token);
    decodeContainer().add(
      <Rect
        ref={token}
        x={startX + i * (tokenWidth + tokenGap)}
        y={-100}
        width={tokenWidth}
        height={tokenWidth}
        fill={Colors.tokenInactive}
        radius={10}
        opacity={0}
      />
    );
  }

  // Show tokens
  yield* all(
    ...prefillTokenRefs.map((t) => t().opacity(1, 0.3)),
    ...decodeTokenRefs.map((t) => t().opacity(1, 0.3)),
  );

  yield* waitFor(0.5);

  // Add GPU and Memory bars
  const barWidth = 300;
  const barHeight = 30;
  const barY = 80;

  // GPU Utilization label and bars
  prefillContainer().add(
    <>
      <Txt
        text="GPU Compute"
        fontSize={24}
        fontFamily={Fonts.main}
        fill={Colors.textDim}
        y={barY - 40}
      />
      <Rect
        ref={prefillGpuBar}
        y={barY}
        width={barWidth}
        height={barHeight}
        fill={'#2a2a3a'}
        radius={5}
      >
        <Rect
          ref={prefillGpuFill}
          x={-barWidth / 2}
          width={0}
          height={barHeight}
          fill={Colors.compute}
          radius={5}
        />
      </Rect>
    </>
  );

  decodeContainer().add(
    <>
      <Txt
        text="GPU Compute"
        fontSize={24}
        fontFamily={Fonts.main}
        fill={Colors.textDim}
        y={barY - 40}
      />
      <Rect
        ref={decodeGpuBar}
        y={barY}
        width={barWidth}
        height={barHeight}
        fill={'#2a2a3a'}
        radius={5}
      >
        <Rect
          ref={decodeGpuFill}
          x={-barWidth / 2}
          width={0}
          height={barHeight}
          fill={Colors.compute}
          radius={5}
        />
      </Rect>
    </>
  );

  // Memory Bandwidth label and bars
  const memBarY = barY + 80;
  prefillContainer().add(
    <>
      <Txt
        text="Memory Bandwidth"
        fontSize={24}
        fontFamily={Fonts.main}
        fill={Colors.textDim}
        y={memBarY - 40}
      />
      <Rect
        ref={prefillMemBar}
        y={memBarY}
        width={barWidth}
        height={barHeight}
        fill={'#2a2a3a'}
        radius={5}
      >
        <Rect
          ref={prefillMemFill}
          x={-barWidth / 2}
          width={0}
          height={barHeight}
          fill={Colors.memory}
          radius={5}
        />
      </Rect>
    </>
  );

  decodeContainer().add(
    <>
      <Txt
        text="Memory Bandwidth"
        fontSize={24}
        fontFamily={Fonts.main}
        fill={Colors.textDim}
        y={memBarY - 40}
      />
      <Rect
        ref={decodeMemBar}
        y={memBarY}
        width={barWidth}
        height={barHeight}
        fill={'#2a2a3a'}
        radius={5}
      >
        <Rect
          ref={decodeMemFill}
          x={-barWidth / 2}
          width={0}
          height={barHeight}
          fill={Colors.memory}
          radius={5}
        />
      </Rect>
    </>
  );

  // Add bottleneck labels
  const prefillBottleneck = createRef<Txt>();
  const decodeBottleneck = createRef<Txt>();

  prefillContainer().add(
    <Txt
      ref={prefillBottleneck}
      text="Compute-bound"
      fontSize={28}
      fontFamily={Fonts.main}
      fontWeight={600}
      fill={Colors.compute}
      y={240}
      opacity={0}
    />
  );

  decodeContainer().add(
    <Txt
      ref={decodeBottleneck}
      text="Memory-bound"
      fontSize={28}
      fontFamily={Fonts.main}
      fontWeight={600}
      fill={Colors.memory}
      y={240}
      opacity={0}
    />
  );

  yield* waitFor(0.5);

  // Animate Prefill: all tokens light up at once, high GPU, low memory
  yield* all(
    ...prefillTokenRefs.map(t => t().fill(Colors.tokenActive, 0.3)),
    prefillGpuFill().width(barWidth * 0.95, 0.5, easeInOutCubic),
    prefillMemFill().width(barWidth * 0.3, 0.5, easeInOutCubic),
  );

  yield* prefillBottleneck().opacity(1, 0.3);

  yield* waitFor(1);

  // Animate Decode: tokens light up one at a time, low GPU, high memory
  yield* sequence(
    0.3,
    ...decodeTokenRefs.map((t) =>
      chain(
        t().fill(Colors.tokenActive, 0.2),
        all(
          decodeGpuFill().width(barWidth * 0.05, 0.1, easeInOutCubic),
          decodeMemFill().width(barWidth * 0.95, 0.1, easeInOutCubic),
        ),
        waitFor(0.1),
      )
    ),
  );

  yield* decodeBottleneck().opacity(1, 0.3);

  yield* waitFor(2);
});
