"""Text-to-Speech providers for voiceover generation."""

import os
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Iterator

import httpx

from ..config import Config, TTSConfig, load_config


class TTSProvider(ABC):
    """Abstract base class for TTS providers."""

    def __init__(self, config: TTSConfig):
        self.config = config

    @abstractmethod
    def generate(self, text: str, output_path: str | Path) -> Path:
        """Generate speech from text and save to file.

        Args:
            text: The text to convert to speech
            output_path: Path to save the audio file

        Returns:
            Path to the generated audio file
        """
        pass

    @abstractmethod
    def generate_stream(self, text: str) -> Iterator[bytes]:
        """Generate speech from text as a stream.

        Args:
            text: The text to convert to speech

        Yields:
            Audio data chunks
        """
        pass

    @abstractmethod
    def get_available_voices(self) -> list[dict]:
        """Get list of available voices.

        Returns:
            List of voice info dictionaries
        """
        pass


class ElevenLabsTTS(TTSProvider):
    """ElevenLabs TTS provider."""

    BASE_URL = "https://api.elevenlabs.io/v1"

    def __init__(self, config: TTSConfig, api_key: str | None = None):
        """Initialize ElevenLabs TTS.

        Args:
            config: TTS configuration
            api_key: ElevenLabs API key (defaults to ELEVENLABS_API_KEY env var)
        """
        super().__init__(config)
        self.api_key = api_key or os.environ.get("ELEVENLABS_API_KEY")
        if not self.api_key:
            raise ValueError(
                "ElevenLabs API key required. Set ELEVENLABS_API_KEY environment variable "
                "or pass api_key parameter."
            )

        # Default voice if not specified
        self.voice_id = config.voice_id or "21m00Tcm4TlvDq8ikWAM"  # Rachel voice

    def _get_headers(self) -> dict[str, str]:
        """Get request headers."""
        return {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }

    def generate(self, text: str, output_path: str | Path) -> Path:
        """Generate speech from text and save to file."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        url = f"{self.BASE_URL}/text-to-speech/{self.voice_id}"

        payload = {
            "text": text,
            "model_id": self.config.model,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
        }

        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                url,
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()

            with open(output_path, "wb") as f:
                f.write(response.content)

        return output_path

    def generate_stream(self, text: str) -> Iterator[bytes]:
        """Generate speech from text as a stream."""
        url = f"{self.BASE_URL}/text-to-speech/{self.voice_id}/stream"

        payload = {
            "text": text,
            "model_id": self.config.model,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
        }

        with httpx.Client(timeout=60.0) as client:
            with client.stream(
                "POST",
                url,
                headers=self._get_headers(),
                json=payload,
            ) as response:
                response.raise_for_status()
                for chunk in response.iter_bytes():
                    yield chunk

    def get_available_voices(self) -> list[dict]:
        """Get list of available voices."""
        url = f"{self.BASE_URL}/voices"

        with httpx.Client(timeout=30.0) as client:
            response = client.get(url, headers=self._get_headers())
            response.raise_for_status()
            data = response.json()

        return [
            {
                "voice_id": v["voice_id"],
                "name": v["name"],
                "category": v.get("category", "unknown"),
                "description": v.get("description", ""),
            }
            for v in data.get("voices", [])
        ]

    def estimate_cost(self, text: str) -> float:
        """Estimate cost for generating speech.

        ElevenLabs charges per character.
        Current pricing: ~$0.30 per 1000 characters (Starter plan)

        Args:
            text: The text to estimate cost for

        Returns:
            Estimated cost in USD
        """
        # Approximate cost per character (varies by plan)
        cost_per_char = 0.0003  # $0.30 per 1000 chars
        return len(text) * cost_per_char


class MockTTS(TTSProvider):
    """Mock TTS provider for testing."""

    def __init__(self, config: TTSConfig):
        super().__init__(config)

    def generate(self, text: str, output_path: str | Path) -> Path:
        """Generate a silent audio file for testing using FFmpeg."""
        import subprocess

        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Estimate duration based on text length (~150 words per minute)
        words = len(text.split())
        duration_seconds = max(1.0, (words / 150) * 60)

        # Use FFmpeg to generate silent audio
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"anullsrc=r=44100:cl=mono:d={duration_seconds}",
            "-c:a", "libmp3lame",
            "-b:a", "128k",
            str(output_path),
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode != 0:
                # Fallback: create minimal valid MP3 using sine wave
                cmd = [
                    "ffmpeg", "-y",
                    "-f", "lavfi",
                    "-i", f"sine=frequency=0:duration={duration_seconds}",
                    "-c:a", "libmp3lame",
                    "-b:a", "128k",
                    str(output_path),
                ]
                subprocess.run(cmd, capture_output=True, timeout=30)
        except (FileNotFoundError, subprocess.TimeoutExpired):
            # If FFmpeg not available, create a minimal file
            # This won't be playable but allows tests to pass
            output_path.write_bytes(b"\x00" * 1000)

        return output_path

    def generate_stream(self, text: str) -> Iterator[bytes]:
        """Generate mock audio stream."""
        # Return some bytes that represent silence
        for _ in range(100):
            yield b"\x00" * 100

    def get_available_voices(self) -> list[dict]:
        """Return mock voices."""
        return [
            {
                "voice_id": "mock_voice_1",
                "name": "Mock Voice",
                "category": "mock",
                "description": "A mock voice for testing",
            }
        ]


def get_tts_provider(config: Config | None = None) -> TTSProvider:
    """Get the appropriate TTS provider based on configuration.

    Args:
        config: Configuration object. If None, uses default config.

    Returns:
        A TTS provider instance
    """
    if config is None:
        config = load_config()

    provider_name = config.tts.provider.lower()

    if provider_name == "elevenlabs":
        return ElevenLabsTTS(config.tts)
    elif provider_name == "mock":
        return MockTTS(config.tts)
    else:
        raise ValueError(f"Unknown TTS provider: {provider_name}")
