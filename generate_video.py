#!/usr/bin/env python3
"""Script to generate a video from the inference article using mock data."""

from pathlib import Path

from src.config import Config
from src.pipeline import VideoPipeline


def main():
    """Generate the first video using mock data."""
    # Configure for mock mode
    config = Config()
    config.llm.provider = "mock"
    config.tts.provider = "mock"

    # Path to the inference document
    source_path = Path("/Users/prajwal/Desktop/Learning/inference/website/post.md")

    # Create output directory
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    print("=" * 60)
    print("Video Explainer - First Video Generation")
    print("=" * 60)
    print(f"Source: {source_path}")
    print(f"Output: {output_dir}")
    print(f"Mode: Mock (no API costs)")
    print("=" * 60)

    # Initialize pipeline with progress callback
    pipeline = VideoPipeline(config=config, output_dir=output_dir)

    def progress_callback(stage: str, progress: float):
        print(f"  [{stage}] {progress:.0f}%")

    pipeline.set_progress_callback(progress_callback)

    print("\nGenerating video...")
    print("-" * 40)

    # Generate the video
    result = pipeline.generate_from_document(
        source_path,
        target_duration=180,  # 3 minute video
        use_mock=True,
    )

    print("-" * 40)

    if result.success:
        print("\n[SUCCESS] Video generated successfully!")
        print(f"  Output: {result.output_path}")
        print(f"  Duration: {result.duration_seconds:.1f} seconds")
        print(f"  Stages completed: {', '.join(result.stages_completed)}")

        if result.metadata:
            print("\nMetadata:")
            for key, value in result.metadata.items():
                print(f"  {key}: {value}")
    else:
        print("\n[FAILED] Video generation failed")
        print(f"  Error: {result.error_message}")
        print(f"  Stages completed: {', '.join(result.stages_completed)}")

    print("\n" + "=" * 60)

    return 0 if result.success else 1


if __name__ == "__main__":
    exit(main())
