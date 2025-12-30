"""Comprehensive tests for CLI module."""

import json
import subprocess
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, call

import pytest

from src.cli.main import (
    cmd_list,
    cmd_info,
    cmd_create,
    cmd_voiceover,
    cmd_storyboard,
    cmd_render,
    main,
    RESOLUTION_PRESETS,
)


class TestResolutionPresets:
    """Tests for resolution presets configuration."""

    def test_all_presets_defined(self):
        """Verify all expected resolution presets exist."""
        expected = ["4k", "1440p", "1080p", "720p", "480p"]
        assert set(RESOLUTION_PRESETS.keys()) == set(expected)

    def test_4k_resolution(self):
        """Verify 4K resolution is correct."""
        assert RESOLUTION_PRESETS["4k"] == (3840, 2160)

    def test_1440p_resolution(self):
        """Verify 1440p resolution is correct."""
        assert RESOLUTION_PRESETS["1440p"] == (2560, 1440)

    def test_1080p_resolution(self):
        """Verify 1080p resolution is correct."""
        assert RESOLUTION_PRESETS["1080p"] == (1920, 1080)

    def test_720p_resolution(self):
        """Verify 720p resolution is correct."""
        assert RESOLUTION_PRESETS["720p"] == (1280, 720)

    def test_480p_resolution(self):
        """Verify 480p resolution is correct."""
        assert RESOLUTION_PRESETS["480p"] == (854, 480)

    def test_aspect_ratios_are_16_9(self):
        """Verify all resolutions maintain 16:9 aspect ratio."""
        for name, (width, height) in RESOLUTION_PRESETS.items():
            ratio = width / height
            # Allow small tolerance for 480p which rounds
            assert abs(ratio - 16/9) < 0.01, f"{name} ratio is {ratio:.3f}, expected ~1.778"


class TestCmdList:
    """Tests for the list command."""

    @pytest.fixture
    def mock_args(self, tmp_path):
        """Create mock args with projects_dir."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        return args

    def test_list_empty_directory(self, mock_args, capsys):
        """Test listing when no projects exist."""
        result = cmd_list(mock_args)
        assert result == 0
        captured = capsys.readouterr()
        assert "No projects found" in captured.out

    def test_list_with_projects(self, mock_args, tmp_path, capsys):
        """Test listing multiple projects."""
        # Create two projects
        for name in ["project-a", "project-b"]:
            project_dir = tmp_path / name
            project_dir.mkdir()
            config = {"id": name, "title": f"Title {name}"}
            with open(project_dir / "config.json", "w") as f:
                json.dump(config, f)

        result = cmd_list(mock_args)
        assert result == 0
        captured = capsys.readouterr()
        assert "Found 2 project(s)" in captured.out
        assert "project-a" in captured.out
        assert "project-b" in captured.out


class TestCmdInfo:
    """Tests for the info command."""

    @pytest.fixture
    def sample_project(self, tmp_path):
        """Create a sample project for testing."""
        project_dir = tmp_path / "test-project"
        project_dir.mkdir()

        config = {
            "id": "test-project",
            "title": "Test Project",
            "description": "A test project",
            "version": "1.0.0",
            "video": {
                "resolution": {"width": 1920, "height": 1080},
                "fps": 30,
                "target_duration_seconds": 120,
            },
            "tts": {
                "provider": "mock",
                "voice_id": "test-voice",
            },
        }
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        # Create narration directory
        narration_dir = project_dir / "narration"
        narration_dir.mkdir()
        narrations = {
            "scenes": [
                {"scene_id": "s1", "title": "S1", "duration_seconds": 10, "narration": "Test"}
            ]
        }
        with open(narration_dir / "narrations.json", "w") as f:
            json.dump(narrations, f)

        return project_dir

    def test_info_shows_project_details(self, sample_project, tmp_path, capsys):
        """Test info command shows project details."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "test-project"

        result = cmd_info(args)
        assert result == 0

        captured = capsys.readouterr()
        assert "Project: test-project" in captured.out
        assert "Title: Test Project" in captured.out
        assert "1920x1080" in captured.out
        assert "mock" in captured.out

    def test_info_nonexistent_project(self, tmp_path, capsys):
        """Test info command with nonexistent project."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "nonexistent"

        result = cmd_info(args)
        assert result == 1
        captured = capsys.readouterr()
        assert "Error" in captured.err


class TestCmdCreate:
    """Tests for the create command."""

    def test_create_new_project(self, tmp_path, capsys):
        """Test creating a new project."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project_id = "new-project"
        args.title = "New Project"
        args.description = "A new project"

        result = cmd_create(args)
        assert result == 0

        # Verify project was created
        project_dir = tmp_path / "new-project"
        assert project_dir.exists()
        assert (project_dir / "config.json").exists()

        captured = capsys.readouterr()
        assert "Created project: new-project" in captured.out

    def test_create_project_default_title(self, tmp_path, capsys):
        """Test creating project with default title from ID."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project_id = "my-cool-project"
        args.title = None
        args.description = None

        result = cmd_create(args)
        assert result == 0

        # Verify config has derived title
        with open(tmp_path / "my-cool-project" / "config.json") as f:
            config = json.load(f)
        assert config["title"] == "My Cool Project"

    def test_create_existing_project_fails(self, tmp_path, capsys):
        """Test creating project that already exists fails."""
        # Create existing project
        existing = tmp_path / "existing"
        existing.mkdir()
        with open(existing / "config.json", "w") as f:
            json.dump({"id": "existing"}, f)

        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project_id = "existing"
        args.title = "Existing"
        args.description = None

        result = cmd_create(args)
        assert result == 1
        captured = capsys.readouterr()
        assert "Error" in captured.err


class TestCmdVoiceover:
    """Tests for the voiceover command."""

    @pytest.fixture
    def project_with_narrations(self, tmp_path):
        """Create a project with narrations."""
        project_dir = tmp_path / "test-project"
        project_dir.mkdir()

        config = {
            "id": "test-project",
            "title": "Test Project",
            "tts": {"provider": "mock", "voice_id": "test"},
            "paths": {"narration": "narration/narrations.json"},
        }
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        narration_dir = project_dir / "narration"
        narration_dir.mkdir()
        narrations = {
            "scenes": [
                {"scene_id": "scene1", "title": "Scene 1", "duration_seconds": 10, "narration": "Hello world."},
                {"scene_id": "scene2", "title": "Scene 2", "duration_seconds": 15, "narration": "Goodbye world."},
            ]
        }
        with open(narration_dir / "narrations.json", "w") as f:
            json.dump(narrations, f)

        return project_dir

    def test_voiceover_with_mock_provider(self, project_with_narrations, tmp_path, capsys):
        """Test voiceover generation with mock provider."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "test-project"
        args.provider = None
        args.mock = True
        args.continue_on_error = False

        result = cmd_voiceover(args)
        assert result == 0

        # Verify voiceovers were created
        voiceover_dir = project_with_narrations / "voiceover"
        assert voiceover_dir.exists()
        assert (voiceover_dir / "scene1.mp3").exists()
        assert (voiceover_dir / "scene2.mp3").exists()
        assert (voiceover_dir / "manifest.json").exists()

        captured = capsys.readouterr()
        assert "Generated 2 voiceovers" in captured.out

    def test_voiceover_nonexistent_project(self, tmp_path, capsys):
        """Test voiceover with nonexistent project."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "nonexistent"
        args.provider = None
        args.mock = True
        args.continue_on_error = False

        result = cmd_voiceover(args)
        assert result == 1
        captured = capsys.readouterr()
        assert "Error" in captured.err

    def test_voiceover_missing_narrations(self, tmp_path, capsys):
        """Test voiceover when narrations file is missing."""
        # Create project without narrations
        project_dir = tmp_path / "no-narrations"
        project_dir.mkdir()
        config = {"id": "no-narrations", "title": "No Narrations", "tts": {"provider": "mock"}}
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "no-narrations"
        args.provider = None
        args.mock = True
        args.continue_on_error = False

        result = cmd_voiceover(args)
        assert result == 1


class TestCmdStoryboard:
    """Tests for the storyboard command."""

    @pytest.fixture
    def project_with_storyboard(self, tmp_path):
        """Create a project with storyboard."""
        project_dir = tmp_path / "test-project"
        project_dir.mkdir()

        config = {
            "id": "test-project",
            "title": "Test Project",
            "paths": {"storyboard": "storyboard/storyboard.json"},
        }
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        storyboard_dir = project_dir / "storyboard"
        storyboard_dir.mkdir()
        storyboard = {
            "title": "Test Storyboard",
            "duration_seconds": 60,
            "beats": [
                {"id": "beat1", "start_seconds": 0, "end_seconds": 30, "elements": []},
                {"id": "beat2", "start_seconds": 30, "end_seconds": 60, "elements": []},
            ],
        }
        with open(storyboard_dir / "storyboard.json", "w") as f:
            json.dump(storyboard, f)

        return project_dir

    def test_storyboard_view(self, project_with_storyboard, tmp_path, capsys):
        """Test viewing existing storyboard."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "test-project"
        args.view = True

        result = cmd_storyboard(args)
        assert result == 0

        captured = capsys.readouterr()
        assert "Storyboard: Test Storyboard" in captured.out
        assert "Duration: 60s" in captured.out
        assert "Beats: 2" in captured.out

    def test_storyboard_view_missing(self, tmp_path, capsys):
        """Test viewing nonexistent storyboard."""
        # Create project without storyboard
        project_dir = tmp_path / "no-storyboard"
        project_dir.mkdir()
        config = {"id": "no-storyboard", "title": "No Storyboard"}
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "no-storyboard"
        args.view = True

        result = cmd_storyboard(args)
        assert result == 1
        captured = capsys.readouterr()
        assert "Error" in captured.err

    def test_storyboard_generate_not_implemented(self, project_with_storyboard, tmp_path, capsys):
        """Test storyboard generation shows not implemented."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "test-project"
        args.view = False

        result = cmd_storyboard(args)
        assert result == 0

        captured = capsys.readouterr()
        assert "not yet implemented" in captured.out


class TestCmdRender:
    """Tests for the render command."""

    @pytest.fixture
    def render_project(self, tmp_path):
        """Create a project ready for rendering."""
        project_dir = tmp_path / "render-project"
        project_dir.mkdir()

        config = {"id": "render-project", "title": "Render Project"}
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        # Create storyboard
        storyboard_dir = project_dir / "storyboard"
        storyboard_dir.mkdir()
        storyboard = {
            "title": "Test",
            "scenes": [{"scene_id": "s1", "audio_duration_seconds": 5}],
        }
        with open(storyboard_dir / "storyboard.json", "w") as f:
            json.dump(storyboard, f)

        # Create voiceover directory
        voiceover_dir = project_dir / "voiceover"
        voiceover_dir.mkdir()

        # Create output directory
        output_dir = project_dir / "output"
        output_dir.mkdir()

        return project_dir

    def test_render_nonexistent_project(self, tmp_path, capsys):
        """Test render with nonexistent project."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "nonexistent"
        args.preview = False
        args.resolution = "1080p"

        result = cmd_render(args)
        assert result == 1
        captured = capsys.readouterr()
        assert "Error" in captured.err

    def test_render_missing_storyboard(self, tmp_path, capsys):
        """Test render when storyboard is missing."""
        # Create project without storyboard
        project_dir = tmp_path / "no-storyboard"
        project_dir.mkdir()
        config = {"id": "no-storyboard", "title": "No Storyboard"}
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "no-storyboard"
        args.preview = False
        args.resolution = "1080p"

        result = cmd_render(args)
        assert result == 1
        captured = capsys.readouterr()
        assert "Storyboard not found" in captured.err

    def test_render_resolution_in_command(self, render_project, tmp_path, capsys):
        """Test that resolution is passed to render command."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "render-project"
        args.preview = False
        args.resolution = "4k"

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            result = cmd_render(args)

            # Verify subprocess was called with resolution args
            call_args = mock_run.call_args
            cmd = call_args[0][0]
            assert "--width" in cmd
            assert "3840" in cmd
            assert "--height" in cmd
            assert "2160" in cmd

    def test_render_preview_output_path(self, render_project, tmp_path, capsys):
        """Test preview render uses preview output path."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "render-project"
        args.preview = True
        args.resolution = "720p"

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            result = cmd_render(args)

            captured = capsys.readouterr()
            assert "preview" in captured.out.lower()

    def test_render_output_filename_includes_resolution(self, render_project, tmp_path, capsys):
        """Test non-1080p renders include resolution in filename."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "render-project"
        args.preview = False
        args.resolution = "4k"

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            result = cmd_render(args)

            call_args = mock_run.call_args
            cmd = call_args[0][0]
            # Find output path in command
            output_idx = cmd.index("--output") + 1
            output_path = cmd[output_idx]
            assert "final-4k.mp4" in output_path

    def test_render_1080p_default_filename(self, render_project, tmp_path, capsys):
        """Test 1080p renders use default filename without resolution suffix."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "render-project"
        args.preview = False
        args.resolution = "1080p"

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            result = cmd_render(args)

            call_args = mock_run.call_args
            cmd = call_args[0][0]
            output_idx = cmd.index("--output") + 1
            output_path = cmd[output_idx]
            # Should not have resolution in filename
            assert "-1080p" not in output_path

    def test_render_node_not_found(self, render_project, tmp_path, capsys):
        """Test handling when Node.js is not installed."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "render-project"
        args.preview = False
        args.resolution = "1080p"

        with patch("subprocess.run") as mock_run:
            mock_run.side_effect = FileNotFoundError("node not found")
            result = cmd_render(args)

            assert result == 1
            captured = capsys.readouterr()
            assert "Node.js not found" in captured.err

    def test_render_subprocess_failure(self, render_project, tmp_path, capsys):
        """Test handling subprocess failure."""
        args = MagicMock()
        args.projects_dir = str(tmp_path)
        args.project = "render-project"
        args.preview = False
        args.resolution = "1080p"

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=1)
            result = cmd_render(args)

            assert result == 1
            captured = capsys.readouterr()
            assert "failed" in captured.err.lower()


class TestMainEntrypoint:
    """Tests for the main CLI entrypoint."""

    def test_main_no_args_shows_help(self, capsys):
        """Test running with no args shows help."""
        with patch("sys.argv", ["cli"]):
            result = main()
            assert result == 0
            captured = capsys.readouterr()
            assert "usage" in captured.out.lower() or "Video Explainer" in captured.out

    def test_main_list_command(self, tmp_path, capsys):
        """Test main with list command."""
        with patch("sys.argv", ["cli", "--projects-dir", str(tmp_path), "list"]):
            result = main()
            assert result == 0

    def test_main_unknown_command(self, capsys):
        """Test main with unknown command."""
        with patch("sys.argv", ["cli", "unknown"]):
            with pytest.raises(SystemExit):
                main()


class TestCLIArgumentParsing:
    """Tests for CLI argument parsing."""

    def test_render_resolution_choices(self):
        """Test that only valid resolution choices are accepted."""
        # This is tested implicitly through argparse
        # Invalid resolutions should cause argparse to error
        with patch("sys.argv", ["cli", "render", "project", "--resolution", "invalid"]):
            with pytest.raises(SystemExit):
                main()

    def test_render_resolution_short_flag(self, tmp_path):
        """Test -r short flag works for resolution."""
        project_dir = tmp_path / "test-proj"
        project_dir.mkdir()
        config = {"id": "test-proj", "title": "Test"}
        with open(project_dir / "config.json", "w") as f:
            json.dump(config, f)

        # Create storyboard
        storyboard_dir = project_dir / "storyboard"
        storyboard_dir.mkdir()
        with open(storyboard_dir / "storyboard.json", "w") as f:
            json.dump({"title": "Test", "scenes": []}, f)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            with patch("sys.argv", ["cli", "--projects-dir", str(tmp_path), "render", "test-proj", "-r", "720p"]):
                result = main()
                # Verify 720p resolution was used
                call_args = mock_run.call_args
                cmd = call_args[0][0]
                assert "1280" in cmd  # 720p width


class TestCLIIntegration:
    """Integration tests for CLI with real projects."""

    def test_llm_inference_project_list(self):
        """Test listing includes llm-inference project."""
        project_path = Path("projects/llm-inference")
        if not project_path.exists():
            pytest.skip("llm-inference project not found")

        result = subprocess.run(
            [sys.executable, "-m", "src.cli", "list"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "llm-inference" in result.stdout

    def test_llm_inference_project_info(self):
        """Test info command works for llm-inference project."""
        project_path = Path("projects/llm-inference")
        if not project_path.exists():
            pytest.skip("llm-inference project not found")

        result = subprocess.run(
            [sys.executable, "-m", "src.cli", "info", "llm-inference"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "llm-inference" in result.stdout

    def test_render_help(self):
        """Test render --help shows resolution options."""
        result = subprocess.run(
            [sys.executable, "-m", "src.cli", "render", "--help"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "4k" in result.stdout
        assert "1080p" in result.stdout
        assert "720p" in result.stdout
        assert "--resolution" in result.stdout
