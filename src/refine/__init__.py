"""
Video Refinement Module

This module provides tools to refine video projects to high quality standards
(3Blue1Brown / Veritasium level). It implements a 3-phase refinement process:

Phase 1 (Analyze): Compare source material against script to identify gaps
Phase 2 (Script): Refine narrations and update script structure
Phase 3 (Visual): Inspect and refine scene visuals

The refinement process is designed to be human-in-the-loop, with AI handling
tedious work while humans make creative judgments.

Example usage:
    from src.refine import VisualInspector, validate_project_sync
    from src.project import load_project

    project = load_project("projects/my-project")

    # Check project sync
    sync_status = validate_project_sync(project)
    if not sync_status.is_synced:
        print("Project files are out of sync!")

    # Run visual refinement
    inspector = VisualInspector(project)
    result = inspector.refine_scene(0)  # Refine scene 1
"""

from .models import (
    Beat,
    Issue,
    IssueType,
    Fix,
    FixStatus,
    RefinementPhase,
    RefinementResult,
    SceneRefinementResult,
    ProjectSyncStatus,
    SyncIssue,
    SyncIssueType,
)
from .principles import (
    GUIDING_PRINCIPLES,
    Principle,
    format_principles_for_prompt,
    format_checklist_for_prompt,
    get_principle_by_id,
)
from .validation import validate_project_sync, ProjectValidator
from .visual import BeatParser, ScreenshotCapture, VisualInspector

__all__ = [
    # Models
    "Beat",
    "Issue",
    "IssueType",
    "Fix",
    "FixStatus",
    "RefinementPhase",
    "RefinementResult",
    "SceneRefinementResult",
    "ProjectSyncStatus",
    "SyncIssue",
    "SyncIssueType",
    # Principles
    "GUIDING_PRINCIPLES",
    "Principle",
    "format_principles_for_prompt",
    "format_checklist_for_prompt",
    "get_principle_by_id",
    # Validation
    "validate_project_sync",
    "ProjectValidator",
    # Visual
    "BeatParser",
    "ScreenshotCapture",
    "VisualInspector",
]
