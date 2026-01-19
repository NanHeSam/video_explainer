"""Tests for refine principles."""

import pytest

from src.refine.principles import (
    GUIDING_PRINCIPLES,
    Principle,
    format_principles_for_prompt,
    format_checklist_for_prompt,
    get_principle_by_id,
    get_principle_by_issue_type,
)
from src.refine.models import IssueType


class TestPrinciple:
    """Tests for Principle dataclass."""

    def test_principle_creation(self):
        """Test creating a Principle."""
        principle = Principle(
            id=1,
            name="Test Principle",
            issue_type=IssueType.SHOW_DONT_TELL,
            description="A test principle",
            good_example="Do this",
            bad_example="Not this",
            checklist_question="Is this good?",
        )
        assert principle.id == 1
        assert principle.name == "Test Principle"
        assert principle.issue_type == IssueType.SHOW_DONT_TELL
        assert principle.checklist_question == "Is this good?"

    def test_principle_to_dict(self):
        """Test Principle serialization."""
        principle = Principle(
            id=1,
            name="Test Principle",
            issue_type=IssueType.VISUAL_HIERARCHY,
            description="A test",
            good_example="Good",
            bad_example="Bad",
            checklist_question="Check?",
        )
        data = principle.to_dict()

        assert data["id"] == 1
        assert data["name"] == "Test Principle"
        assert data["issue_type"] == "visual_hierarchy"
        assert data["checklist_question"] == "Check?"


class TestGuidingPrinciples:
    """Tests for GUIDING_PRINCIPLES list."""

    def test_has_10_principles(self):
        """Test that there are exactly 10 guiding principles."""
        assert len(GUIDING_PRINCIPLES) == 10

    def test_principles_have_unique_ids(self):
        """Test that all principles have unique IDs."""
        ids = [p.id for p in GUIDING_PRINCIPLES]
        assert len(ids) == len(set(ids))

    def test_principles_have_unique_names(self):
        """Test that all principles have unique names."""
        names = [p.name for p in GUIDING_PRINCIPLES]
        assert len(names) == len(set(names))

    def test_principles_cover_all_issue_types(self):
        """Test that principles cover all issue types (except 'other')."""
        covered_types = {p.issue_type for p in GUIDING_PRINCIPLES}
        expected_types = {
            IssueType.SHOW_DONT_TELL,
            IssueType.ANIMATION_REVEALS,
            IssueType.PROGRESSIVE_DISCLOSURE,
            IssueType.TEXT_COMPLEMENTS,
            IssueType.VISUAL_HIERARCHY,
            IssueType.BREATHING_ROOM,
            IssueType.PURPOSEFUL_MOTION,
            IssueType.EMOTIONAL_RESONANCE,
            IssueType.PROFESSIONAL_POLISH,
            IssueType.SYNC_WITH_NARRATION,
        }
        assert covered_types == expected_types

    def test_each_principle_has_checklist_question(self):
        """Test that each principle has a checklist question."""
        for principle in GUIDING_PRINCIPLES:
            assert principle.checklist_question, f"Principle {principle.name} has no checklist question"

    def test_each_principle_has_examples(self):
        """Test that each principle has good and bad examples."""
        for principle in GUIDING_PRINCIPLES:
            assert principle.good_example, f"Principle {principle.name} has no good example"
            assert principle.bad_example, f"Principle {principle.name} has no bad example"

    def test_principles_sequential_ids(self):
        """Test that principle IDs are sequential 1-10."""
        ids = sorted([p.id for p in GUIDING_PRINCIPLES])
        assert ids == list(range(1, 11))


class TestGetPrincipleById:
    """Tests for get_principle_by_id function."""

    def test_get_existing_principle(self):
        """Test retrieving an existing principle by ID."""
        principle = get_principle_by_id(1)
        assert principle is not None
        assert principle.id == 1
        assert principle.name == "Show, don't tell"

    def test_get_nonexistent_principle(self):
        """Test retrieving a non-existent principle returns None."""
        principle = get_principle_by_id(999)
        assert principle is None

    def test_get_all_principles_by_id(self):
        """Test that all principles can be retrieved by their IDs."""
        for i in range(1, 11):
            principle = get_principle_by_id(i)
            assert principle is not None
            assert principle.id == i


class TestGetPrincipleByIssueType:
    """Tests for get_principle_by_issue_type function."""

    def test_get_by_issue_type(self):
        """Test retrieving principle by issue type."""
        principle = get_principle_by_issue_type(IssueType.SHOW_DONT_TELL)
        assert principle is not None
        assert principle.id == 1

    def test_get_by_each_issue_type(self):
        """Test that each issue type maps to a principle."""
        issue_types = [
            IssueType.SHOW_DONT_TELL,
            IssueType.ANIMATION_REVEALS,
            IssueType.PROGRESSIVE_DISCLOSURE,
            IssueType.TEXT_COMPLEMENTS,
            IssueType.VISUAL_HIERARCHY,
            IssueType.BREATHING_ROOM,
            IssueType.PURPOSEFUL_MOTION,
            IssueType.EMOTIONAL_RESONANCE,
            IssueType.PROFESSIONAL_POLISH,
            IssueType.SYNC_WITH_NARRATION,
        ]
        for issue_type in issue_types:
            principle = get_principle_by_issue_type(issue_type)
            assert principle is not None


class TestFormatPrinciplesForPrompt:
    """Tests for format_principles_for_prompt function."""

    def test_format_includes_all_principles(self):
        """Test that formatted output includes all principles."""
        formatted = format_principles_for_prompt()
        for principle in GUIDING_PRINCIPLES:
            assert principle.name in formatted

    def test_format_includes_descriptions(self):
        """Test that formatted output includes descriptions."""
        formatted = format_principles_for_prompt()
        assert "Show, don't tell" in formatted
        assert "Animation reveals" in formatted

    def test_format_includes_examples(self):
        """Test that formatted output includes examples."""
        formatted = format_principles_for_prompt()
        assert "Good:" in formatted
        assert "Bad:" in formatted

    def test_format_includes_checklist(self):
        """Test that formatted output includes checklist questions."""
        formatted = format_principles_for_prompt()
        assert "Check:" in formatted


class TestFormatChecklistForPrompt:
    """Tests for format_checklist_for_prompt function."""

    def test_format_checklist_has_items(self):
        """Test checklist has items for all principles."""
        checklist = format_checklist_for_prompt()
        # Should have checkbox notation
        assert "[ ]" in checklist

    def test_format_checklist_has_all_principles(self):
        """Test checklist includes all principles."""
        checklist = format_checklist_for_prompt()
        for principle in GUIDING_PRINCIPLES:
            # Each principle should have its number and name
            assert str(principle.id) in checklist
            assert principle.name in checklist

    def test_format_checklist_has_questions(self):
        """Test checklist includes questions."""
        checklist = format_checklist_for_prompt()
        # Should include checklist questions
        assert "?" in checklist

    def test_format_checklist_has_10_items(self):
        """Test checklist has 10 items."""
        checklist = format_checklist_for_prompt()
        # Count checkbox occurrences
        checkbox_count = checklist.count("[ ]")
        assert checkbox_count == 10
