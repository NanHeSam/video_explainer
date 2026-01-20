"""
CLI command for video refinement.

Implements the `refine` command for the video explainer CLI.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

from ..project import Project, load_project
from .models import RefinementPhase, RefinementResult
from .validation import validate_project_sync, ProjectValidator
from .visual import VisualInspector, ClaudeCodeVisualInspector


def cmd_refine(args: argparse.Namespace) -> int:
    """
    Refine a video project to high quality standards.

    This command implements a 3-phase refinement process:
    - Phase 1 (analyze): Compare source material against script to identify gaps
    - Phase 2 (script): Refine narrations and update script structure
    - Phase 3 (visual): Inspect and refine scene visuals

    Returns:
        0 on success, 1 on error.
    """
    # Load project
    try:
        project_path = Path(args.projects_dir) / args.project
        project = load_project(project_path)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(f"\n🎬 Video Refinement: {project.title}")
    print(f"   Project: {project.id}")
    print(f"   Path: {project.root_dir}")

    # Determine which phase to run
    phase = args.phase if hasattr(args, "phase") and args.phase else "visual"

    # Validate project sync first
    if not args.skip_validation:
        sync_status = validate_project_sync(project)
        if not sync_status.is_synced:
            print("\n⚠️  Project files are out of sync:")
            for issue in sync_status.issues:
                print(f"   - {issue.description}")
                if issue.suggestion:
                    print(f"     💡 {issue.suggestion}")

            if not args.force:
                print("\nRun with --force to continue anyway, or fix the sync issues first.")
                return 1
            print("\n--force specified, continuing with out-of-sync project...")

    # Route to appropriate phase
    if phase == "analyze":
        return _run_analyze_phase(project, args)
    elif phase == "script":
        return _run_script_phase(project, args)
    elif phase == "visual":
        return _run_visual_phase(project, args)
    else:
        print(f"Error: Unknown phase '{phase}'", file=sys.stderr)
        return 1


def _run_analyze_phase(project: Project, args: argparse.Namespace) -> int:
    """Run Phase 1: Gap analysis."""
    print("\n📊 Phase 1: Analyze (Gap Analysis)")
    print("   " + "=" * 40)
    print("\n   ⚠️ Phase 1 not yet implemented.")
    print("   This phase will compare source material against script to identify gaps.")
    print("\n   For now, please use the existing 'script' command to generate/update scripts.")
    return 0


def _run_script_phase(project: Project, args: argparse.Namespace) -> int:
    """Run Phase 2: Script refinement."""
    print("\n📝 Phase 2: Script Refinement")
    print("   " + "=" * 40)
    print("\n   ⚠️ Phase 2 not yet implemented.")
    print("   This phase will refine narrations and update script structure.")
    print("\n   For now, please use the existing 'narration' command to update narrations.")
    return 0


def _run_visual_phase(project: Project, args: argparse.Namespace) -> int:
    """Run Phase 3: Visual refinement."""
    print("\n🎨 Phase 3: Visual Refinement")
    print("   " + "=" * 40)

    # Determine which scene(s) to refine
    scene_index = getattr(args, "scene", None)
    use_legacy = getattr(args, "legacy", False)

    # Get scene count from storyboard
    validator = ProjectValidator(project)
    try:
        storyboard = project.load_storyboard()
        total_scenes = len(storyboard.get("scenes", []))
    except FileNotFoundError:
        print("\n   ❌ Storyboard not found. Run 'storyboard' command first.")
        return 1

    if total_scenes == 0:
        print("\n   ❌ No scenes found in storyboard.")
        return 1

    # Create inspector (use Claude Code by default, Playwright if --legacy)
    verbose = not getattr(args, "quiet", False)
    live_output = getattr(args, "live", False)

    if use_legacy:
        # Legacy mode: use Playwright-based screenshot capture
        print("\n   📷 Using legacy Playwright-based inspection...")
        screenshots_dir = project.root_dir / "output" / "refinement_screenshots"
        inspector = VisualInspector(
            project=project,
            screenshots_dir=screenshots_dir,
            verbose=verbose,
        )
    else:
        # Default: use Claude Code with --chrome for browser-based inspection
        print("\n   🌐 Using Claude Code with browser access for visual inspection...")
        print("   (Claude Code will start Remotion, navigate frames, inspect & fix)")
        if live_output:
            print("   📺 Live output mode: streaming Claude Code output in real-time")
        inspector = ClaudeCodeVisualInspector(
            project=project,
            verbose=verbose,
            live_output=live_output,
        )

    # Collect results
    results: list = []

    if scene_index is not None:
        # Refine specific scene (convert to 0-based index)
        idx = scene_index - 1
        if idx < 0 or idx >= total_scenes:
            print(f"\n   ❌ Invalid scene number {scene_index}. Valid range: 1-{total_scenes}")
            return 1

        print(f"\n   Refining scene {scene_index} of {total_scenes}...")
        result = inspector.refine_scene(idx)
        results.append(result)
    else:
        # Refine all scenes
        print(f"\n   Refining all {total_scenes} scenes...")
        for idx in range(total_scenes):
            result = inspector.refine_scene(idx)
            results.append(result)

    # Print summary
    _print_refinement_summary(results)

    # Save results to refinement directory in project folder
    refinement_dir = project.root_dir / "refinement"
    refinement_dir.mkdir(parents=True, exist_ok=True)

    # Save per-scene results
    for result in results:
        scene_filename = f"{result.scene_id}.json"
        scene_path = refinement_dir / scene_filename
        scene_data = {
            "project_id": project.id,
            "phase": "visual",
            "scene": result.to_dict(),
        }
        with open(scene_path, "w") as f:
            json.dump(scene_data, f, indent=2)
        print(f"   📄 Scene results saved to: {scene_path}")

    # Save summary if multiple scenes
    if len(results) > 1:
        summary_path = refinement_dir / "summary.json"
        summary_data = {
            "project_id": project.id,
            "phase": "visual",
            "summary": {
                "total_scenes": len(results),
                "scenes_passed": sum(1 for r in results if r.verification_passed),
                "total_issues_found": sum(len(r.issues_found) for r in results),
                "total_fixes_applied": sum(len(r.fixes_applied) for r in results),
            },
            "scenes": [{"scene_id": r.scene_id, "passed": r.verification_passed} for r in results],
        }
        with open(summary_path, "w") as f:
            json.dump(summary_data, f, indent=2)
        print(f"   📄 Summary saved to: {summary_path}")

    # Return success if all scenes passed verification
    all_passed = all(r.verification_passed for r in results)
    return 0 if all_passed else 1


def _print_refinement_summary(results: list) -> None:
    """Print a summary of refinement results."""
    print("\n" + "=" * 60)
    print("📋 REFINEMENT SUMMARY")
    print("=" * 60)

    total_issues = 0
    total_fixes = 0
    passed_count = 0

    for result in results:
        status = "✅" if result.verification_passed else "⚠️"
        issues = len(result.issues_found)
        fixes = len(result.fixes_applied)
        total_issues += issues
        total_fixes += fixes
        if result.verification_passed:
            passed_count += 1

        print(f"\n{status} Scene: {result.scene_title}")
        print(f"   Issues found: {issues}")
        print(f"   Fixes applied: {fixes}")
        if result.error_message:
            print(f"   ❌ Error: {result.error_message}")

    print("\n" + "-" * 40)
    print(f"Total scenes: {len(results)}")
    print(f"Passed: {passed_count}/{len(results)}")
    print(f"Total issues found: {total_issues}")
    print(f"Total fixes applied: {total_fixes}")
    print("=" * 60)


def add_refine_parser(subparsers: argparse._SubParsersAction) -> None:
    """
    Add the refine command parser to the CLI.

    Args:
        subparsers: The subparsers object from argparse.
    """
    refine_parser = subparsers.add_parser(
        "refine",
        help="Refine video project to high quality (3Blue1Brown/Veritasium level)",
        description="""
Refine a video project to high quality standards using a 3-phase process:

Phase 1 (analyze): Compare source material against script to identify gaps
Phase 2 (script): Refine narrations and update script structure
Phase 3 (visual): Inspect and refine scene visuals (default)

The visual phase uses AI to:
1. Parse narration into visual "beats"
2. Capture screenshots at key moments
3. Analyze against 10 quality principles
4. Generate and apply fixes
5. Verify improvements

Example usage:
  python -m src.cli.main refine my-project                     # Refine all scenes (visual)
  python -m src.cli.main refine my-project --scene 1           # Refine specific scene
  python -m src.cli.main refine my-project --phase analyze     # Run gap analysis
  python -m src.cli.main refine my-project --phase script      # Refine narrations
        """,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    refine_parser.add_argument(
        "project",
        help="Project ID to refine",
    )

    refine_parser.add_argument(
        "--phase",
        choices=["analyze", "script", "visual"],
        default="visual",
        help="Refinement phase to run (default: visual)",
    )

    refine_parser.add_argument(
        "--scene",
        type=int,
        help="Specific scene number to refine (1-based). If not specified, refines all scenes.",
    )

    refine_parser.add_argument(
        "--force",
        action="store_true",
        help="Continue even if project files are out of sync",
    )

    refine_parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Skip project sync validation",
    )

    refine_parser.add_argument(
        "--quiet",
        "-q",
        action="store_true",
        help="Suppress progress messages",
    )

    refine_parser.add_argument(
        "--legacy",
        action="store_true",
        help="Use legacy Playwright-based screenshot capture instead of Claude Code with browser",
    )

    refine_parser.add_argument(
        "--live",
        action="store_true",
        help="Stream Claude Code output in real-time (useful for debugging)",
    )

    refine_parser.add_argument(
        "--projects-dir",
        default="projects",
        help="Directory containing projects (default: projects)",
    )

    refine_parser.set_defaults(func=cmd_refine)
