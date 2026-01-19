"""
Data models for the refinement module.
"""

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Optional


class IssueType(str, Enum):
    """Types of issues that can be identified during refinement."""

    SHOW_DONT_TELL = "show_dont_tell"
    ANIMATION_REVEALS = "animation_reveals"
    PROGRESSIVE_DISCLOSURE = "progressive_disclosure"
    TEXT_COMPLEMENTS = "text_complements"
    VISUAL_HIERARCHY = "visual_hierarchy"
    BREATHING_ROOM = "breathing_room"
    PURPOSEFUL_MOTION = "purposeful_motion"
    EMOTIONAL_RESONANCE = "emotional_resonance"
    PROFESSIONAL_POLISH = "professional_polish"
    SYNC_WITH_NARRATION = "sync_with_narration"
    OTHER = "other"


class FixStatus(str, Enum):
    """Status of a fix."""

    PENDING = "pending"
    APPLIED = "applied"
    VERIFIED = "verified"
    FAILED = "failed"


class RefinementPhase(str, Enum):
    """Phases of the refinement process."""

    ANALYZE = "analyze"
    SCRIPT = "script"
    VISUAL = "visual"


@dataclass
class Beat:
    """
    A visual beat in the narration - a key phrase that should trigger
    a specific visual change.
    """

    index: int
    start_seconds: float
    end_seconds: float
    text: str
    expected_visual: str = ""  # Description of what should be visible

    @property
    def duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds

    @property
    def mid_seconds(self) -> float:
        """Middle point of the beat, useful for screenshot timing."""
        return (self.start_seconds + self.end_seconds) / 2

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "start_seconds": self.start_seconds,
            "end_seconds": self.end_seconds,
            "text": self.text,
            "expected_visual": self.expected_visual,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Beat":
        return cls(
            index=data["index"],
            start_seconds=data["start_seconds"],
            end_seconds=data["end_seconds"],
            text=data["text"],
            expected_visual=data.get("expected_visual", ""),
        )


@dataclass
class Issue:
    """An issue identified during visual inspection."""

    beat_index: int
    principle_violated: IssueType
    description: str
    severity: str = "medium"  # low, medium, high
    screenshot_path: Optional[Path] = None

    def to_dict(self) -> dict:
        return {
            "beat_index": self.beat_index,
            "principle_violated": self.principle_violated.value,
            "description": self.description,
            "severity": self.severity,
            "screenshot_path": str(self.screenshot_path) if self.screenshot_path else None,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Issue":
        return cls(
            beat_index=data["beat_index"],
            principle_violated=IssueType(data["principle_violated"]),
            description=data["description"],
            severity=data.get("severity", "medium"),
            screenshot_path=Path(data["screenshot_path"]) if data.get("screenshot_path") else None,
        )


@dataclass
class Fix:
    """A fix to be applied to address an issue."""

    issue: Issue
    file_path: Path
    description: str
    code_change: str  # Description or diff of the change
    status: FixStatus = FixStatus.PENDING
    error_message: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "issue": self.issue.to_dict(),
            "file_path": str(self.file_path),
            "description": self.description,
            "code_change": self.code_change,
            "status": self.status.value,
            "error_message": self.error_message,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Fix":
        return cls(
            issue=Issue.from_dict(data["issue"]),
            file_path=Path(data["file_path"]),
            description=data["description"],
            code_change=data["code_change"],
            status=FixStatus(data["status"]),
            error_message=data.get("error_message"),
        )


@dataclass
class SceneRefinementResult:
    """Result of refining a single scene."""

    scene_id: str
    scene_title: str
    scene_file: Path
    beats: list[Beat] = field(default_factory=list)
    issues_found: list[Issue] = field(default_factory=list)
    fixes_applied: list[Fix] = field(default_factory=list)
    verification_passed: bool = False
    error_message: Optional[str] = None

    @property
    def success(self) -> bool:
        return self.verification_passed and self.error_message is None

    def to_dict(self) -> dict:
        return {
            "scene_id": self.scene_id,
            "scene_title": self.scene_title,
            "scene_file": str(self.scene_file),
            "beats": [b.to_dict() for b in self.beats],
            "issues_found": [i.to_dict() for i in self.issues_found],
            "fixes_applied": [f.to_dict() for f in self.fixes_applied],
            "verification_passed": self.verification_passed,
            "error_message": self.error_message,
        }


@dataclass
class RefinementResult:
    """Overall result of the refinement process."""

    project_id: str
    phase: RefinementPhase
    scenes_refined: list[SceneRefinementResult] = field(default_factory=list)
    total_issues_found: int = 0
    total_fixes_applied: int = 0
    success: bool = False
    error_message: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "project_id": self.project_id,
            "phase": self.phase.value,
            "scenes_refined": [s.to_dict() for s in self.scenes_refined],
            "total_issues_found": self.total_issues_found,
            "total_fixes_applied": self.total_fixes_applied,
            "success": self.success,
            "error_message": self.error_message,
        }


class SyncIssueType(str, Enum):
    """Types of project sync issues."""

    SCENE_COUNT_MISMATCH = "scene_count_mismatch"
    MISSING_VOICEOVER = "missing_voiceover"
    DURATION_MISMATCH = "duration_mismatch"
    MISSING_SCENE_FILE = "missing_scene_file"
    STORYBOARD_OUTDATED = "storyboard_outdated"


@dataclass
class SyncIssue:
    """A project synchronization issue."""

    issue_type: SyncIssueType
    description: str
    affected_scene: Optional[str] = None
    suggestion: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "issue_type": self.issue_type.value,
            "description": self.description,
            "affected_scene": self.affected_scene,
            "suggestion": self.suggestion,
        }


@dataclass
class ProjectSyncStatus:
    """Status of project file synchronization."""

    is_synced: bool
    issues: list[SyncIssue] = field(default_factory=list)
    storyboard_scene_count: int = 0
    narration_scene_count: int = 0
    voiceover_file_count: int = 0
    scene_file_count: int = 0

    def to_dict(self) -> dict:
        return {
            "is_synced": self.is_synced,
            "issues": [i.to_dict() for i in self.issues],
            "storyboard_scene_count": self.storyboard_scene_count,
            "narration_scene_count": self.narration_scene_count,
            "voiceover_file_count": self.voiceover_file_count,
            "scene_file_count": self.scene_file_count,
        }
