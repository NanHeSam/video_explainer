#!/usr/bin/env python3
"""Create explainer video using macOS built-in TTS."""

import subprocess
from pathlib import Path


def main():
    animation_path = Path("animations/output/project.mp4")
    output_dir = Path("output/real_video")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Voiceover script (~9 seconds to match animation)
    voiceover_text = """
LLM inference has two distinct phases.
Prefill processes all your input tokens in parallel. It's compute-bound, with the GPU working at full capacity.
Then comes decode, generating tokens one at a time. It's memory-bound, constantly waiting for data.
This difference is the key to understanding inference optimization.
    """.strip()

    print("=" * 60)
    print("Creating Explainer Video with macOS TTS")
    print("=" * 60)

    if not animation_path.exists():
        print(f"ERROR: Animation not found at {animation_path}")
        return 1

    # Generate audio with macOS 'say' command
    print("\nGenerating narration with macOS TTS...")
    aiff_path = output_dir / "narration.aiff"
    mp3_path = output_dir / "narration_macos.mp3"

    # Use 'say' to generate AIFF
    subprocess.run([
        "say", "-v", "Samantha",  # Good quality voice
        "-r", "160",  # Slightly slower for clarity
        "-o", str(aiff_path),
        voiceover_text
    ], check=True)

    # Convert to MP3 with ffmpeg
    subprocess.run([
        "ffmpeg", "-y", "-i", str(aiff_path),
        "-c:a", "libmp3lame", "-b:a", "192k",
        str(mp3_path)
    ], capture_output=True, check=True)

    # Clean up AIFF
    aiff_path.unlink()
    print(f"Audio saved to: {mp3_path}")

    # Get durations
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(animation_path)],
        capture_output=True, text=True
    )
    video_duration = float(result.stdout.strip())

    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(mp3_path)],
        capture_output=True, text=True
    )
    audio_duration = float(result.stdout.strip())

    print(f"Video duration: {video_duration:.1f}s")
    print(f"Audio duration: {audio_duration:.1f}s")

    # Compose final video
    print("\nComposing final video...")
    final_path = output_dir / "prefill_decode_explainer_narrated.mp4"

    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(animation_path),
        "-i", str(mp3_path),
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-map", "0:v:0", "-map", "1:a:0",
        "-shortest",
        str(final_path)
    ], capture_output=True, check=True)

    # Get final size
    size = final_path.stat().st_size

    print("\n" + "=" * 60)
    print("SUCCESS! Narrated explainer video created:")
    print(f"  Path: {final_path}")
    print(f"  Size: {size / 1024:.1f} KB")
    print("=" * 60)
    print(f"\nPlay it: open {final_path}")

    return 0


if __name__ == "__main__":
    exit(main())
