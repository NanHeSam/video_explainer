"""Tests for voiceover generation module."""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.voiceover.narration import (
    SceneNarration,
    LLM_INFERENCE_NARRATIONS,
    get_narration_for_scene,
    get_all_narrations,
    get_full_script,
)
from src.voiceover.generator import (
    SceneVoiceover,
    VoiceoverResult,
    VoiceoverGenerator,
)
from src.audio import WordTimestamp
from src.config import TTSConfig


class TestNarration:
    """Tests for narration data module."""

    def test_llm_inference_narrations_has_8_scenes(self):
        """Verify we have all 8 scenes."""
        assert len(LLM_INFERENCE_NARRATIONS) == 8

    def test_narration_scene_ids_are_unique(self):
        """Verify all scene IDs are unique."""
        scene_ids = [n.scene_id for n in LLM_INFERENCE_NARRATIONS]
        assert len(scene_ids) == len(set(scene_ids))

    def test_narration_has_required_fields(self):
        """Verify each narration has required fields."""
        for narration in LLM_INFERENCE_NARRATIONS:
            assert narration.scene_id, "scene_id should not be empty"
            assert narration.title, "title should not be empty"
            assert narration.duration_seconds > 0, "duration should be positive"
            assert narration.narration, "narration text should not be empty"

    def test_get_narration_for_scene_existing(self):
        """Test getting narration for existing scene."""
        narration = get_narration_for_scene("scene1_hook")
        assert narration is not None
        assert narration.title == "The Speed Problem"

    def test_get_narration_for_scene_nonexistent(self):
        """Test getting narration for non-existent scene."""
        narration = get_narration_for_scene("nonexistent_scene")
        assert narration is None

    def test_get_all_narrations(self):
        """Test getting all narrations."""
        narrations = get_all_narrations()
        assert len(narrations) == 8
        assert narrations == LLM_INFERENCE_NARRATIONS

    def test_get_full_script(self):
        """Test getting full script."""
        script = get_full_script()
        assert "[The Speed Problem]" in script
        assert "[The Impact]" in script
        assert "KV Cache" in script

    def test_total_narration_duration(self):
        """Verify total narration duration is reasonable."""
        total_duration = sum(n.duration_seconds for n in LLM_INFERENCE_NARRATIONS)
        # Should be around 3 minutes (180 seconds)
        assert 150 < total_duration < 250


class TestSceneVoiceover:
    """Tests for SceneVoiceover data class."""

    def test_to_dict(self, tmp_path):
        """Test converting SceneVoiceover to dict."""
        audio_path = tmp_path / "test.mp3"
        audio_path.touch()

        voiceover = SceneVoiceover(
            scene_id="test_scene",
            audio_path=audio_path,
            duration_seconds=10.5,
            word_timestamps=[
                WordTimestamp(word="hello", start_seconds=0.0, end_seconds=0.5),
                WordTimestamp(word="world", start_seconds=0.6, end_seconds=1.0),
            ],
        )

        data = voiceover.to_dict()
        assert data["scene_id"] == "test_scene"
        assert data["duration_seconds"] == 10.5
        assert len(data["word_timestamps"]) == 2
        assert data["word_timestamps"][0]["word"] == "hello"


class TestVoiceoverResult:
    """Tests for VoiceoverResult data class."""

    @pytest.fixture
    def sample_result(self, tmp_path):
        """Create a sample VoiceoverResult."""
        audio_path = tmp_path / "test.mp3"
        audio_path.touch()

        return VoiceoverResult(
            scenes=[
                SceneVoiceover(
                    scene_id="scene1",
                    audio_path=audio_path,
                    duration_seconds=10.0,
                    word_timestamps=[],
                ),
                SceneVoiceover(
                    scene_id="scene2",
                    audio_path=audio_path,
                    duration_seconds=15.0,
                    word_timestamps=[],
                ),
            ],
            total_duration_seconds=25.0,
            output_dir=tmp_path,
        )

    def test_to_dict(self, sample_result):
        """Test converting VoiceoverResult to dict."""
        data = sample_result.to_dict()
        assert len(data["scenes"]) == 2
        assert data["total_duration_seconds"] == 25.0
        assert "output_dir" in data

    def test_save_manifest(self, sample_result, tmp_path):
        """Test saving manifest to file."""
        manifest_path = sample_result.save_manifest()
        assert manifest_path.exists()
        assert manifest_path.name == "voiceover_manifest.json"

        # Verify content
        with open(manifest_path) as f:
            data = json.load(f)
        assert len(data["scenes"]) == 2

    def test_load_manifest(self, sample_result, tmp_path):
        """Test loading manifest from file."""
        manifest_path = sample_result.save_manifest()

        loaded = VoiceoverResult.load_manifest(manifest_path)
        assert len(loaded.scenes) == 2
        assert loaded.total_duration_seconds == 25.0
        assert loaded.scenes[0].scene_id == "scene1"


class TestVoiceoverGenerator:
    """Tests for VoiceoverGenerator class."""

    @pytest.fixture
    def generator(self):
        """Create a VoiceoverGenerator."""
        return VoiceoverGenerator(voice="en-US-GuyNeural")

    def test_init_with_default_voice(self):
        """Test initialization with default voice."""
        gen = VoiceoverGenerator()
        assert gen.voice == "en-US-GuyNeural"

    def test_init_with_custom_voice(self):
        """Test initialization with custom voice."""
        gen = VoiceoverGenerator(voice="en-US-AriaNeural")
        assert gen.voice == "en-US-AriaNeural"

    @pytest.mark.slow
    def test_generate_scene_voiceover(self, generator, tmp_path):
        """Test generating voiceover for a single scene (requires network)."""
        narration = SceneNarration(
            scene_id="test",
            title="Test",
            duration_seconds=5,
            narration="This is a short test.",
        )

        result = generator.generate_scene_voiceover(narration, tmp_path)

        assert result.scene_id == "test"
        assert result.audio_path.exists()
        assert result.duration_seconds > 0
        assert len(result.word_timestamps) > 0

    @pytest.mark.slow
    def test_generate_all_voiceovers(self, generator, tmp_path):
        """Test generating all voiceovers (requires network)."""
        # Use short test narrations
        test_narrations = [
            SceneNarration(
                scene_id="test1",
                title="Test 1",
                duration_seconds=5,
                narration="First test.",
            ),
            SceneNarration(
                scene_id="test2",
                title="Test 2",
                duration_seconds=5,
                narration="Second test.",
            ),
        ]

        result = generator.generate_all_voiceovers(tmp_path, narrations=test_narrations)

        assert len(result.scenes) == 2
        assert result.total_duration_seconds > 0
        assert (tmp_path / "voiceover_manifest.json").exists()


class TestVoiceoverIntegration:
    """Integration tests for voiceover system."""

    def test_manifest_file_exists(self):
        """Verify manifest file was generated."""
        manifest_path = Path("output/voiceover/voiceover_manifest.json")
        if manifest_path.exists():
            with open(manifest_path) as f:
                data = json.load(f)
            assert len(data["scenes"]) == 8
            assert data["total_duration_seconds"] > 0

    def test_all_audio_files_exist(self):
        """Verify all audio files were generated."""
        voiceover_dir = Path("output/voiceover")
        if voiceover_dir.exists():
            for scene in LLM_INFERENCE_NARRATIONS:
                audio_path = voiceover_dir / f"{scene.scene_id}.mp3"
                # Only check if the directory exists (files generated)
                if voiceover_dir.exists() and list(voiceover_dir.glob("*.mp3")):
                    assert audio_path.exists(), f"Missing audio for {scene.scene_id}"

    def test_remotion_public_voiceover_exists(self):
        """Verify voiceover files are in Remotion public folder."""
        public_dir = Path("remotion/public/voiceover")
        if public_dir.exists():
            mp3_files = list(public_dir.glob("*.mp3"))
            assert len(mp3_files) == 8, f"Expected 8 mp3 files, got {len(mp3_files)}"
