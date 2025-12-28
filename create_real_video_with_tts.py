#!/usr/bin/env python3
"""Create a real explainer video with ElevenLabs TTS narration."""

import subprocess
from pathlib import Path

from src.audio.tts import ElevenLabsTTS
from src.config import Config
from src.composition.composer import VideoComposer


def main():
    # Paths
    animation_path = Path("animations/output/project.mp4")
    output_dir = Path("output/real_video")
    output_dir.mkdir(parents=True, exist_ok=True)

    # The voiceover script for this animation (~9 seconds)
    # Keeping it concise to match animation timing
    voiceover_text = """
LLM inference has two distinct phases.
Prefill processes all your input tokens in parallel. It's compute-bound, with the GPU working at full capacity.
Then comes decode, generating tokens one at a time. It's memory-bound, constantly waiting for data.
This difference is the key to understanding inference optimization.
    """.strip()

    print("=" * 60)
    print("Creating Real Explainer Video with ElevenLabs TTS")
    print("=" * 60)
    print(f"Animation: {animation_path}")
    print(f"Output: {output_dir}")
    print("=" * 60)

    # Check animation exists
    if not animation_path.exists():
        print(f"ERROR: Animation not found at {animation_path}")
        return 1

    # Get animation duration
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(animation_path)],
        capture_output=True, text=True
    )
    duration = float(result.stdout.strip())
    print(f"Animation duration: {duration:.1f} seconds")

    # Generate real audio with ElevenLabs
    print("\nGenerating narration with ElevenLabs...")
    config = Config()
    config.tts.provider = "elevenlabs"

    tts = ElevenLabsTTS(config.tts)

    # Estimate cost
    cost = tts.estimate_cost(voiceover_text)
    print(f"Estimated cost: ${cost:.4f}")
    print(f"Text length: {len(voiceover_text)} characters")

    audio_path = output_dir / "narration_real.mp3"
    tts.generate(voiceover_text, audio_path)
    print(f"Audio saved to: {audio_path}")

    # Get audio duration
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)],
        capture_output=True, text=True
    )
    audio_duration = float(result.stdout.strip())
    print(f"Audio duration: {audio_duration:.1f} seconds")

    # Compose final video
    print("\nComposing final video...")
    composer = VideoComposer(config)

    final_path = output_dir / "prefill_decode_explainer_real.mp4"
    result = composer.compose_with_audio_overlay(
        animation_path,
        audio_path,
        final_path
    )

    print("\n" + "=" * 60)
    print("SUCCESS! Real explainer video with narration created:")
    print(f"  Path: {result.output_path}")
    print(f"  Duration: {result.duration_seconds:.1f} seconds")
    print(f"  Size: {result.file_size_bytes / 1024:.1f} KB")
    print("=" * 60)
    print(f"\nPlay it with: open {final_path}")

    return 0


if __name__ == "__main__":
    exit(main())
