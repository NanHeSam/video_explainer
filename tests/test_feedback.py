"""Tests for the feedback system."""

import json
from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.feedback.models import (
    FeedbackHistory,
    FeedbackItem,
    FeedbackScope,
    FeedbackStatus,
)
from src.feedback.store import FeedbackStore
from src.feedback.processor import FeedbackProcessor


# =============================================================================
# FeedbackItem Tests
# =============================================================================


class TestFeedbackItem:
    """Tests for FeedbackItem model."""

    def test_create_feedback_item(self):
        """Test creating a basic feedback item."""
        item = FeedbackItem(
            id="fb_0001_12345",
            feedback_text="Make the text larger",
        )
        assert item.id == "fb_0001_12345"
        assert item.feedback_text == "Make the text larger"
        assert item.status == FeedbackStatus.PENDING
        assert item.scope is None
        assert item.affected_scenes == []
        assert item.files_modified == []

    def test_feedback_item_with_all_fields(self):
        """Test creating a feedback item with all fields."""
        item = FeedbackItem(
            id="fb_0002_12345",
            feedback_text="Update scene 2",
            status=FeedbackStatus.APPLIED,
            scope=FeedbackScope.SCENE,
            affected_scenes=["scene_02"],
            interpretation="User wants changes to scene 2",
            suggested_changes={"description": "Modify animation"},
            files_modified=["storyboard/storyboard.json"],
            preview_branch="feedback/fb_0002_12345",
            error_message=None,
        )
        assert item.status == FeedbackStatus.APPLIED
        assert item.scope == FeedbackScope.SCENE
        assert "scene_02" in item.affected_scenes
        assert item.preview_branch == "feedback/fb_0002_12345"

    def test_feedback_status_enum(self):
        """Test all feedback status values."""
        assert FeedbackStatus.PENDING == "pending"
        assert FeedbackStatus.PROCESSING == "processing"
        assert FeedbackStatus.APPLIED == "applied"
        assert FeedbackStatus.REJECTED == "rejected"
        assert FeedbackStatus.FAILED == "failed"

    def test_feedback_scope_enum(self):
        """Test all feedback scope values."""
        assert FeedbackScope.SCENE == "scene"
        assert FeedbackScope.STORYBOARD == "storyboard"
        assert FeedbackScope.PROJECT == "project"

    def test_feedback_item_timestamp_default(self):
        """Test that timestamp is set by default."""
        item = FeedbackItem(id="test", feedback_text="test")
        assert item.timestamp is not None
        # Should be close to now
        diff = datetime.now() - item.timestamp
        assert diff.total_seconds() < 5


# =============================================================================
# FeedbackHistory Tests
# =============================================================================


class TestFeedbackHistory:
    """Tests for FeedbackHistory model."""

    def test_create_empty_history(self):
        """Test creating empty history."""
        history = FeedbackHistory(project_id="test-project")
        assert history.project_id == "test-project"
        assert history.items == []

    def test_add_feedback(self):
        """Test adding feedback to history."""
        history = FeedbackHistory(project_id="test-project")
        item = history.add("Make text larger")

        assert len(history.items) == 1
        assert item.feedback_text == "Make text larger"
        assert item.status == FeedbackStatus.PENDING
        assert item.id.startswith("fb_0001_")

    def test_add_multiple_feedback(self):
        """Test adding multiple feedback items."""
        history = FeedbackHistory(project_id="test-project")
        item1 = history.add("First feedback")
        item2 = history.add("Second feedback")

        assert len(history.items) == 2
        assert item1.id.startswith("fb_0001_")
        assert item2.id.startswith("fb_0002_")

    def test_get_pending(self):
        """Test getting pending feedback items."""
        history = FeedbackHistory(project_id="test-project")
        history.add("Pending 1")
        history.add("Pending 2")

        # Manually mark one as applied
        history.items[0].status = FeedbackStatus.APPLIED

        pending = history.get_pending()
        assert len(pending) == 1
        assert pending[0].feedback_text == "Pending 2"

    def test_get_by_id(self):
        """Test getting feedback by ID."""
        history = FeedbackHistory(project_id="test-project")
        item = history.add("Test feedback")

        found = history.get_by_id(item.id)
        assert found is not None
        assert found.feedback_text == "Test feedback"

    def test_get_by_id_not_found(self):
        """Test getting nonexistent feedback."""
        history = FeedbackHistory(project_id="test-project")
        found = history.get_by_id("nonexistent")
        assert found is None

    def test_update_item(self):
        """Test updating a feedback item."""
        history = FeedbackHistory(project_id="test-project")
        item = history.add("Test feedback")

        # Update the item
        item.status = FeedbackStatus.APPLIED
        item.interpretation = "Updated interpretation"
        result = history.update_item(item)

        assert result is True
        updated = history.get_by_id(item.id)
        assert updated.status == FeedbackStatus.APPLIED
        assert updated.interpretation == "Updated interpretation"

    def test_update_item_not_found(self):
        """Test updating nonexistent item."""
        history = FeedbackHistory(project_id="test-project")
        fake_item = FeedbackItem(id="fake", feedback_text="fake")

        result = history.update_item(fake_item)
        assert result is False

    def test_get_applied(self):
        """Test getting applied feedback items."""
        history = FeedbackHistory(project_id="test-project")
        history.add("Item 1")
        history.add("Item 2")
        history.items[0].status = FeedbackStatus.APPLIED

        applied = history.get_applied()
        assert len(applied) == 1
        assert applied[0].feedback_text == "Item 1"

    def test_get_failed(self):
        """Test getting failed feedback items."""
        history = FeedbackHistory(project_id="test-project")
        history.add("Item 1")
        history.add("Item 2")
        history.items[1].status = FeedbackStatus.FAILED

        failed = history.get_failed()
        assert len(failed) == 1
        assert failed[0].feedback_text == "Item 2"


# =============================================================================
# FeedbackStore Tests
# =============================================================================


class TestFeedbackStore:
    """Tests for FeedbackStore persistence."""

    def test_store_init(self, tmp_path):
        """Test store initialization."""
        store = FeedbackStore(tmp_path, "test-project")
        assert store.project_root == tmp_path
        assert store.project_id == "test-project"
        assert store.feedback_file == tmp_path / "feedback" / "feedback.json"

    def test_store_uses_dir_name_as_project_id(self, tmp_path):
        """Test that store uses directory name as default project ID."""
        project_dir = tmp_path / "my-project"
        project_dir.mkdir()
        store = FeedbackStore(project_dir)
        assert store.project_id == "my-project"

    def test_load_nonexistent_file(self, tmp_path):
        """Test loading when file doesn't exist."""
        store = FeedbackStore(tmp_path, "test-project")
        history = store.load()

        assert history.project_id == "test-project"
        assert history.items == []

    def test_save_and_load(self, tmp_path):
        """Test saving and loading history."""
        store = FeedbackStore(tmp_path, "test-project")

        # Create and save history
        history = FeedbackHistory(project_id="test-project")
        history.add("Test feedback")
        store.save(history)

        # Verify file exists
        assert store.feedback_file.exists()

        # Load and verify
        loaded = store.load()
        assert len(loaded.items) == 1
        assert loaded.items[0].feedback_text == "Test feedback"

    def test_add_feedback(self, tmp_path):
        """Test adding feedback through store."""
        store = FeedbackStore(tmp_path, "test-project")
        item = store.add_feedback("New feedback")

        assert item.feedback_text == "New feedback"

        # Verify persisted
        loaded = store.load()
        assert len(loaded.items) == 1

    def test_update_item(self, tmp_path):
        """Test updating item through store."""
        store = FeedbackStore(tmp_path, "test-project")
        item = store.add_feedback("Test feedback")

        item.status = FeedbackStatus.APPLIED
        result = store.update_item(item)

        assert result is True
        loaded = store.load()
        assert loaded.items[0].status == FeedbackStatus.APPLIED

    def test_get_item(self, tmp_path):
        """Test getting item by ID."""
        store = FeedbackStore(tmp_path, "test-project")
        item = store.add_feedback("Test feedback")

        found = store.get_item(item.id)
        assert found is not None
        assert found.feedback_text == "Test feedback"

    def test_exists(self, tmp_path):
        """Test checking if feedback file exists."""
        store = FeedbackStore(tmp_path, "test-project")

        assert not store.exists()

        store.add_feedback("Test")
        assert store.exists()

    def test_load_corrupted_file(self, tmp_path):
        """Test loading when file is corrupted."""
        store = FeedbackStore(tmp_path, "test-project")

        # Create corrupted file
        store.feedback_dir.mkdir(parents=True)
        store.feedback_file.write_text("invalid json{{{")

        # Should return empty history
        history = store.load()
        assert history.project_id == "test-project"
        assert history.items == []


# =============================================================================
# FeedbackProcessor Tests
# =============================================================================


class TestFeedbackProcessor:
    """Tests for FeedbackProcessor."""

    @pytest.fixture
    def mock_project(self, tmp_path):
        """Create a mock project for testing."""
        from src.project.loader import Project, VideoConfig, TTSConfig, StyleConfig

        # Create storyboard directory and file first
        storyboard_dir = tmp_path / "storyboard"
        storyboard_dir.mkdir()
        storyboard = {
            "title": "Test",
            "scenes": [
                {"scene_id": "scene_01", "title": "Scene 1"},
                {"scene_id": "scene_02", "title": "Scene 2"},
            ],
        }
        (storyboard_dir / "storyboard.json").write_text(json.dumps(storyboard))

        # Create project with proper paths config
        project = Project(
            id="test-project",
            title="Test Project",
            description="Test",
            version="1.0.0",
            root_dir=tmp_path,
            video=VideoConfig(),
            tts=TTSConfig(),
            style=StyleConfig(),
            _config={
                "paths": {
                    "storyboard": "storyboard/storyboard.json",
                    "narration": "narration/narrations.json",
                }
            },
        )

        return project

    def test_processor_init(self, mock_project):
        """Test processor initialization."""
        processor = FeedbackProcessor(mock_project, dry_run=True)

        assert processor.project == mock_project
        assert processor.dry_run is True
        assert processor.verbose is False
        assert processor.store is not None
        assert processor.llm is not None

    def test_processor_init_verbose(self, mock_project):
        """Test processor with verbose mode enabled."""
        processor = FeedbackProcessor(
            mock_project, dry_run=True, verbose=True
        )
        assert processor.verbose is True

    def test_get_scene_list(self, mock_project):
        """Test getting scene list from project."""
        processor = FeedbackProcessor(mock_project, dry_run=True)
        scenes = processor._get_scene_list()

        assert scenes == ["scene_01", "scene_02"]

    def test_get_scene_list_no_storyboard(self, mock_project, tmp_path):
        """Test getting scene list when storyboard doesn't exist."""
        # Remove storyboard
        storyboard_file = tmp_path / "storyboard" / "storyboard.json"
        storyboard_file.unlink()

        processor = FeedbackProcessor(mock_project, dry_run=True)
        scenes = processor._get_scene_list()

        assert scenes == []  # No storyboard, no narrations

    @patch("src.feedback.processor.ClaudeCodeLLMProvider")
    def test_process_feedback_dry_run(self, mock_llm_class, mock_project):
        """Test processing feedback in dry run mode."""
        # Setup mock
        mock_llm = MagicMock()
        mock_llm.generate_json.return_value = {
            "scope": "scene",
            "affected_scenes": ["scene_01"],
            "interpretation": "User wants larger text",
            "suggested_changes": {"description": "Increase font size"},
        }
        mock_llm_class.return_value = mock_llm

        processor = FeedbackProcessor(mock_project, dry_run=True)
        item = processor.process_feedback("Make text larger in scene 1")

        assert item.status == FeedbackStatus.PENDING  # Dry run doesn't apply
        assert item.scope == FeedbackScope.SCENE
        assert "scene_01" in item.affected_scenes
        assert item.interpretation == "User wants larger text"
        assert item.files_modified == []  # No changes in dry run

    @patch("src.feedback.processor.ClaudeCodeLLMProvider")
    def test_process_feedback_with_changes(self, mock_llm_class, mock_project):
        """Test processing feedback with actual changes."""
        # Setup mock
        mock_llm = MagicMock()
        mock_llm.generate_json.return_value = {
            "scope": "scene",
            "affected_scenes": ["scene_01"],
            "interpretation": "User wants larger text",
            "suggested_changes": {"description": "Increase font size"},
        }
        mock_llm.generate_with_file_access.return_value = MagicMock(
            success=True,
            modified_files=["storyboard/storyboard.json"],
        )
        mock_llm_class.return_value = mock_llm

        processor = FeedbackProcessor(mock_project, dry_run=False)
        item = processor.process_feedback("Make text larger")

        assert item.status == FeedbackStatus.APPLIED
        assert "storyboard/storyboard.json" in item.files_modified

    @patch("src.feedback.processor.ClaudeCodeLLMProvider")
    def test_process_feedback_failure(self, mock_llm_class, mock_project):
        """Test processing feedback when changes fail."""
        # Setup mock - simulate a complete failure where success=False
        mock_llm = MagicMock()
        mock_llm.generate_json.return_value = {
            "scope": "scene",
            "affected_scenes": [],
            "interpretation": "Test",
            "suggested_changes": {},
        }
        mock_llm.generate_with_file_access.return_value = MagicMock(
            success=False,
            modified_files=[],
            error_message="Write failed",
        )
        mock_llm_class.return_value = mock_llm

        processor = FeedbackProcessor(mock_project, dry_run=False)
        item = processor.process_feedback("Invalid feedback")

        assert item.status == FeedbackStatus.FAILED
        # Error comes from the LLM response when success=False
        assert item.error_message == "Write failed"

    def test_list_feedback(self, mock_project):
        """Test listing feedback."""
        processor = FeedbackProcessor(mock_project, dry_run=True)

        # Add some feedback directly to store
        processor.store.add_feedback("Feedback 1")
        processor.store.add_feedback("Feedback 2")

        items = processor.list_feedback()
        assert len(items) == 2

    def test_get_feedback(self, mock_project):
        """Test getting specific feedback."""
        processor = FeedbackProcessor(mock_project, dry_run=True)

        item = processor.store.add_feedback("Test feedback")
        found = processor.get_feedback(item.id)

        assert found is not None
        assert found.feedback_text == "Test feedback"

    def test_get_feedback_not_found(self, mock_project):
        """Test getting nonexistent feedback."""
        processor = FeedbackProcessor(mock_project, dry_run=True)
        found = processor.get_feedback("nonexistent")
        assert found is None


# =============================================================================
# CLI Integration Tests
# =============================================================================


class TestFeedbackCLI:
    """Tests for feedback CLI commands."""

    @pytest.fixture
    def project_with_storyboard(self, tmp_path):
        """Create a project with storyboard for CLI testing."""
        project_dir = tmp_path / "test-project"
        project_dir.mkdir()

        # Create config
        config = {
            "id": "test-project",
            "title": "Test Project",
            "description": "Test",
            "version": "1.0.0",
            "paths": {"storyboard": "storyboard/storyboard.json"},
        }
        (project_dir / "config.json").write_text(json.dumps(config))

        # Create storyboard
        storyboard_dir = project_dir / "storyboard"
        storyboard_dir.mkdir()
        storyboard = {
            "title": "Test",
            "scenes": [{"scene_id": "scene_01"}],
        }
        (storyboard_dir / "storyboard.json").write_text(json.dumps(storyboard))

        return project_dir

    def test_feedback_list_empty(self, project_with_storyboard, tmp_path, capsys):
        """Test feedback list command with no feedback."""
        import sys
        from src.cli.main import main

        project_dir = project_with_storyboard

        with patch.object(
            sys, "argv",
            ["cli", "--projects-dir", str(tmp_path), "feedback", "test-project", "list"],
        ):
            result = main()

        assert result == 0
        captured = capsys.readouterr()
        assert "No feedback found" in captured.out

    def test_feedback_show_not_found(self, project_with_storyboard, tmp_path, capsys):
        """Test feedback show command with nonexistent ID."""
        import sys
        from src.cli.main import main

        with patch.object(
            sys, "argv",
            [
                "cli", "--projects-dir", str(tmp_path),
                "feedback", "test-project", "show", "nonexistent",
            ],
        ):
            result = main()

        assert result == 1
        captured = capsys.readouterr()
        assert "not found" in captured.err

    def test_feedback_no_subcommand(self, project_with_storyboard, tmp_path, capsys):
        """Test feedback command without subcommand."""
        import sys
        from src.cli.main import main

        with patch.object(
            sys, "argv",
            ["cli", "--projects-dir", str(tmp_path), "feedback", "test-project"],
        ):
            result = main()

        assert result == 1
        captured = capsys.readouterr()
        assert "Usage:" in captured.out


# =============================================================================
# Prompts Tests
# =============================================================================


class TestFeedbackPrompts:
    """Tests for feedback prompt templates."""

    def test_analyze_feedback_prompt_format(self):
        """Test that analyze prompt can be formatted."""
        from src.feedback.prompts import ANALYZE_FEEDBACK_PROMPT

        formatted = ANALYZE_FEEDBACK_PROMPT.format(
            feedback_text="Make text larger",
            project_id="test-project",
            scene_list="scene_01, scene_02",
        )

        assert "Make text larger" in formatted
        assert "test-project" in formatted
        assert "scene_01" in formatted

    def test_apply_feedback_prompt_format(self):
        """Test that apply prompt can be formatted."""
        from src.feedback.prompts import APPLY_FEEDBACK_PROMPT

        formatted = APPLY_FEEDBACK_PROMPT.format(
            feedback_text="Make text larger",
            interpretation="User wants bigger fonts",
            suggested_changes='{"files": ["test.json"]}',
        )

        assert "Make text larger" in formatted
        assert "bigger fonts" in formatted

    def test_system_prompts_exist(self):
        """Test that system prompts are defined."""
        from src.feedback.prompts import (
            SYSTEM_PROMPT,
            APPLY_FEEDBACK_SYSTEM_PROMPT,
        )

        assert len(SYSTEM_PROMPT) > 100  # Should be substantial
        assert len(APPLY_FEEDBACK_SYSTEM_PROMPT) > 100
        assert "storyboard" in SYSTEM_PROMPT.lower()
