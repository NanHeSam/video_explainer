#!/usr/bin/env python3
"""Create a real explainer video using the rendered Motion Canvas animation."""

import subprocess
from pathlib import Path

from src.audio.tts import MockTTS
from src.config import Config
from src.composition.composer import VideoComposer


def main():
    # Paths
    animation_path = Path("animations/output/project.mp4")
    output_dir = Path("output/real_video")
    output_dir.mkdir(parents=True, exist_ok=True)

    # The voiceover script for this animation (matches the ~9 second animation)
    voiceover_text = """
    LLM inference has two distinct phases.
    Prefill processes all input tokens in parallel - it's compute-bound, with the GPU working at full capacity.
    Decode generates tokens one at a time - it's memory-bound, waiting for data from GPU memory.
    This fundamental difference is the key to optimizing inference speed.
    """

    print("=" * 60)
    print("Creating Real Explainer Video")
    print("=" * 60)
    print(f"Animation: {animation_path}")
    print(f"Output: {output_dir}")
    print("=" * 60)

    # Check animation exists
    if not animation_path.exists():
        print(f"ERROR: Animation not found at {animation_path}")
        print("Please render the animation first using Motion Canvas editor.")
        return 1

    # Get animation duration
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(animation_path)],
        capture_output=True, text=True
    )
    duration = float(result.stdout.strip())
    print(f"Animation duration: {duration:.1f} seconds")

    # Generate audio (mock - will be silent but valid)
    print("\nGenerating audio...")
    config = Config()
    config.tts.provider = "mock"
    tts = MockTTS(config.tts)

    audio_path = output_dir / "narration.mp3"
    tts.generate(voiceover_text, audio_path)
    print(f"Audio saved to: {audio_path}")

    # Compose final video
    print("\nComposing final video...")
    composer = VideoComposer(config)

    final_path = output_dir / "prefill_decode_explainer.mp4"
    result = composer.compose_with_audio_overlay(
        animation_path,
        audio_path,
        final_path
    )

    print("\n" + "=" * 60)
    print("SUCCESS! Real explainer video created:")
    print(f"  Path: {result.output_path}")
    print(f"  Duration: {result.duration_seconds:.1f} seconds")
    print(f"  Size: {result.file_size_bytes / 1024:.1f} KB")
    print("=" * 60)

    # Also copy just the animation as a standalone file
    standalone = output_dir / "animation_only.mp4"
    subprocess.run(["cp", str(animation_path), str(standalone)])
    print(f"\nAnimation-only copy: {standalone}")

    return 0


if __name__ == "__main__":
    exit(main())
