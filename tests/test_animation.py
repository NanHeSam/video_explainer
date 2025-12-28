"""Tests for animation rendering module."""

import subprocess
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.animation import MotionCanvasRenderer, RenderResult


class TestRenderResult:
    """Tests for RenderResult dataclass."""

    def test_render_result_creation(self, tmp_path):
        """Test creating a render result."""
        result = RenderResult(
            output_path=tmp_path / "video.mp4",
            duration_seconds=10.5,
            frame_count=315,
            success=True,
        )

        assert result.success
        assert result.duration_seconds == 10.5
        assert result.frame_count == 315
        assert result.error_message is None

    def test_render_result_with_error(self, tmp_path):
        """Test creating a failed render result."""
        result = RenderResult(
            output_path=tmp_path / "video.mp4",
            duration_seconds=0,
            frame_count=0,
            success=False,
            error_message="Something went wrong",
        )

        assert not result.success
        assert result.error_message == "Something went wrong"


class TestMotionCanvasRenderer:
    """Tests for MotionCanvasRenderer class."""

    @pytest.fixture
    def mock_subprocess(self):
        """Mock subprocess for tests."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
            yield mock_run

    def test_render_mock_creates_video(self, mock_subprocess, tmp_path):
        """Test that mock rendering creates a video file."""
        # Make FFmpeg create an actual file
        def create_output(*args, **kwargs):
            output_path = None
            cmd = args[0]
            for i, arg in enumerate(cmd):
                if arg == str(tmp_path / "test.mp4"):
                    output_path = Path(arg)
                    break
            if output_path:
                output_path.write_bytes(b"fake video data")
            return MagicMock(returncode=0, stdout="", stderr="")

        mock_subprocess.side_effect = create_output

        renderer = MotionCanvasRenderer()
        output_path = tmp_path / "test.mp4"

        result = renderer.render_mock(output_path, duration_seconds=5.0)

        assert result.success
        assert result.duration_seconds == 5.0
        assert result.frame_count == 150  # 5 seconds * 30 fps

    def test_render_mock_handles_error(self, mock_subprocess, tmp_path):
        """Test that mock rendering handles FFmpeg errors."""
        mock_subprocess.return_value = MagicMock(
            returncode=1,
            stdout="",
            stderr="FFmpeg error",
        )

        renderer = MotionCanvasRenderer()
        output_path = tmp_path / "test.mp4"

        result = renderer.render_mock(output_path)

        assert not result.success
        assert "FFmpeg" in result.error_message

    def test_check_dependencies(self, mock_subprocess):
        """Test dependency checking."""
        renderer = MotionCanvasRenderer()
        renderer._check_dependencies()

        # Should have checked for node and ffmpeg
        calls = [str(c) for c in mock_subprocess.call_args_list]
        assert any("node" in c for c in calls)
        assert any("ffmpeg" in c for c in calls)

    def test_check_dependencies_missing_node(self):
        """Test handling of missing Node.js."""
        with patch("subprocess.run") as mock_run:
            mock_run.side_effect = FileNotFoundError()

            renderer = MotionCanvasRenderer()
            with pytest.raises(RuntimeError, match="Node.js not found"):
                renderer._check_dependencies()

    def test_get_video_duration(self, mock_subprocess, tmp_path):
        """Test getting video duration."""
        mock_subprocess.return_value = MagicMock(
            returncode=0,
            stdout="10.5\n",
            stderr="",
        )

        renderer = MotionCanvasRenderer()
        duration = renderer._get_video_duration(tmp_path / "video.mp4")

        assert duration == 10.5


class TestRendererIntegration:
    """Integration tests for renderer (require FFmpeg)."""

    @pytest.fixture
    def check_ffmpeg(self):
        """Check if FFmpeg is available."""
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                capture_output=True,
            )
            if result.returncode != 0:
                pytest.skip("FFmpeg not available")
        except FileNotFoundError:
            pytest.skip("FFmpeg not available")

    def test_real_mock_render(self, check_ffmpeg, tmp_path):
        """Test actual mock rendering with FFmpeg."""
        renderer = MotionCanvasRenderer()
        output_path = tmp_path / "test_video.mp4"

        result = renderer.render_mock(
            output_path,
            duration_seconds=2.0,
            fps=30,
            width=640,
            height=480,
        )

        assert result.success
        assert output_path.exists()
        assert result.duration_seconds == 2.0
        assert result.frame_count == 60
