"""Voiceover generator using TTS providers."""

import json
from dataclasses import dataclass, field, asdict
from pathlib import Path

from ..audio import EdgeTTS, TTSResult, WordTimestamp, get_tts_provider
from ..config import Config, TTSConfig, load_config
from .narration import SceneNarration, get_all_narrations


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
        narrations: list[SceneNarration] | None = None,
    ) -> VoiceoverResult:
        """Generate voiceovers for all scenes.

        Args:
            output_dir: Directory to save audio files.
            narrations: List of narrations. If None, uses LLM inference narrations.

        Returns:
            VoiceoverResult with all generated audio.
        """
        if narrations is None:
            narrations = get_all_narrations()

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


def generate_llm_inference_voiceover(
    output_dir: str | Path = "output/voiceover",
    voice: str = "en-US-GuyNeural",
) -> VoiceoverResult:
    """Generate voiceover for the LLM Inference video.

    Args:
        output_dir: Directory to save audio files.
        voice: Edge TTS voice name.

    Returns:
        VoiceoverResult with all generated audio.
    """
    generator = VoiceoverGenerator(voice=voice)
    return generator.generate_all_voiceovers(Path(output_dir))
