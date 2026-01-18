"""Voiceover generator using TTS providers."""

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

from ..audio import EdgeTTS, TTSResult, WordTimestamp, get_tts_provider
from ..config import Config, TTSConfig, load_config
from .narration import SceneNarration

if TYPE_CHECKING:
    from ..short.models import ShortScript, ShortsStoryboard


@dataclass
class SceneVoiceover:
    """Generated voiceover for a single scene."""

    scene_id: str
    audio_path: Path
    duration_seconds: float
    word_timestamps: list[WordTimestamp] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "scene_id": self.scene_id,
            "audio_path": str(self.audio_path),
            "duration_seconds": self.duration_seconds,
            "word_timestamps": [
                {
                    "word": ts.word,
                    "start_seconds": ts.start_seconds,
                    "end_seconds": ts.end_seconds,
                }
                for ts in self.word_timestamps
            ],
        }


@dataclass
class ShortVoiceover:
    """Generated voiceover for a YouTube Short."""

    audio_path: Path
    duration_seconds: float
    word_timestamps: list[WordTimestamp] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "audio_path": str(self.audio_path),
            "duration_seconds": self.duration_seconds,
            "word_timestamps": [
                {
                    "word": ts.word,
                    "start_seconds": ts.start_seconds,
                    "end_seconds": ts.end_seconds,
                }
                for ts in self.word_timestamps
            ],
        }

    def save_manifest(self, path: Path) -> Path:
        """Save voiceover manifest to JSON file."""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2)
        return path

    @classmethod
    def load_manifest(cls, path: Path) -> "ShortVoiceover":
        """Load short voiceover from manifest file."""
        with open(path) as f:
            data = json.load(f)

        return cls(
            audio_path=Path(data["audio_path"]),
            duration_seconds=data["duration_seconds"],
            word_timestamps=[
                WordTimestamp(
                    word=ts["word"],
                    start_seconds=ts["start_seconds"],
                    end_seconds=ts["end_seconds"],
                )
                for ts in data["word_timestamps"]
            ],
        )


@dataclass
class VoiceoverResult:
    """Result of voiceover generation for all scenes."""

    scenes: list[SceneVoiceover]
    total_duration_seconds: float
    output_dir: Path

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "scenes": [s.to_dict() for s in self.scenes],
            "total_duration_seconds": self.total_duration_seconds,
            "output_dir": str(self.output_dir),
        }

    def save_manifest(self, path: Path | None = None) -> Path:
        """Save voiceover manifest to JSON file."""
        if path is None:
            path = self.output_dir / "voiceover_manifest.json"

        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2)

        return path

    @classmethod
    def load_manifest(cls, path: Path) -> "VoiceoverResult":
        """Load voiceover result from manifest file."""
        with open(path) as f:
            data = json.load(f)

        scenes = [
            SceneVoiceover(
                scene_id=s["scene_id"],
                audio_path=Path(s["audio_path"]),
                duration_seconds=s["duration_seconds"],
                word_timestamps=[
                    WordTimestamp(
                        word=ts["word"],
                        start_seconds=ts["start_seconds"],
                        end_seconds=ts["end_seconds"],
                    )
                    for ts in s["word_timestamps"]
                ],
            )
            for s in data["scenes"]
        ]

        return cls(
            scenes=scenes,
            total_duration_seconds=data["total_duration_seconds"],
            output_dir=Path(data["output_dir"]),
        )


class VoiceoverGenerator:
    """Generates voiceover audio for video scenes."""

    def __init__(
        self,
        config: Config | None = None,
        voice: str = "en-US-GuyNeural",
    ):
        """Initialize voiceover generator.

        Args:
            config: Configuration object. If None, uses default config.
            voice: Voice to use for TTS (Edge TTS voice name).
        """
        self.config = config or load_config()
        self.voice = voice

        # Force Edge TTS for voiceover generation
        tts_config = TTSConfig(provider="edge", voice_id=voice)
        self.tts = EdgeTTS(tts_config, voice=voice)

    def generate_scene_voiceover(
        self,
        narration: SceneNarration,
        output_dir: Path,
    ) -> SceneVoiceover:
        """Generate voiceover for a single scene.

        Args:
            narration: Scene narration data.
            output_dir: Directory to save audio files.

        Returns:
            SceneVoiceover with audio path and timestamps.
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        audio_path = output_dir / f"{narration.scene_id}.mp3"

        result = self.tts.generate_with_timestamps(
            narration.narration,
            audio_path,
        )

        return SceneVoiceover(
            scene_id=narration.scene_id,
            audio_path=result.audio_path,
            duration_seconds=result.duration_seconds,
            word_timestamps=result.word_timestamps,
        )

    def generate_all_voiceovers(
        self,
        output_dir: Path,
        narrations: list[SceneNarration],
    ) -> VoiceoverResult:
        """Generate voiceovers for all scenes.

        Args:
            output_dir: Directory to save audio files.
            narrations: List of narrations to generate voiceovers for.

        Returns:
            VoiceoverResult with all generated audio.
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        scenes = []
        total_duration = 0.0

        for narration in narrations:
            print(f"Generating voiceover for: {narration.title}...")
            scene_voiceover = self.generate_scene_voiceover(narration, output_dir)
            scenes.append(scene_voiceover)
            total_duration += scene_voiceover.duration_seconds
            print(f"  Duration: {scene_voiceover.duration_seconds:.2f}s")

        result = VoiceoverResult(
            scenes=scenes,
            total_duration_seconds=total_duration,
            output_dir=output_dir,
        )

        # Save manifest
        manifest_path = result.save_manifest()
        print(f"\nVoiceover manifest saved to: {manifest_path}")
        print(f"Total duration: {total_duration:.2f}s ({total_duration/60:.1f} min)")

        return result

    def generate_short_voiceover(
        self,
        short_script: "ShortScript",
        output_dir: Path,
        filename: str = "short_voiceover.mp3",
    ) -> ShortVoiceover:
        """Generate voiceover for a YouTube Short.

        Combines all scene narrations and CTA into a single audio file
        with word-level timestamps for caption sync.

        Args:
            short_script: The short script with condensed narrations.
            output_dir: Directory to save audio files.
            filename: Name of the output audio file.

        Returns:
            ShortVoiceover with audio path and word timestamps.
        """
        from ..short.models import ShortScript  # Import here to avoid circular

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        audio_path = output_dir / filename

        # Combine all narrations with natural pauses
        # Use period + space for natural TTS pausing between scenes
        narration_parts = []
        for scene in short_script.scenes:
            narration_parts.append(scene.condensed_narration.strip())

        # Add CTA narration at the end
        if short_script.cta_narration:
            narration_parts.append(short_script.cta_narration.strip())

        # Join with pauses (TTS will add natural pauses at periods)
        full_narration = " ".join(narration_parts)

        print(f"Generating short voiceover ({len(full_narration)} chars)...")

        # Generate with timestamps
        result = self.tts.generate_with_timestamps(
            full_narration,
            audio_path,
        )

        short_voiceover = ShortVoiceover(
            audio_path=result.audio_path,
            duration_seconds=result.duration_seconds,
            word_timestamps=result.word_timestamps,
        )

        # Save manifest
        manifest_path = output_dir / "short_voiceover_manifest.json"
        short_voiceover.save_manifest(manifest_path)

        print(f"  Audio: {audio_path}")
        print(f"  Duration: {result.duration_seconds:.2f}s")
        print(f"  Words: {len(result.word_timestamps)}")

        return short_voiceover
