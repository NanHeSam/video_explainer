"""Main CLI entry point for video explainer pipeline.

Usage:
    python -m src.cli list                          # List all projects
    python -m src.cli info <project>                # Show project info
    python -m src.cli voiceover <project>           # Generate voiceovers
    python -m src.cli storyboard <project>          # Generate storyboard
    python -m src.cli render <project>              # Render video
    python -m src.cli render <project> --preview    # Quick preview render
"""

import argparse
import json
import sys
from pathlib import Path


def cmd_list(args: argparse.Namespace) -> int:
    """List all available projects."""
    from ..project import list_projects

    projects = list_projects(args.projects_dir)

    if not projects:
        print(f"No projects found in {args.projects_dir}/")
        return 0

    print(f"Found {len(projects)} project(s):\n")
    for project in projects:
        print(f"  {project.id}")
        print(f"    Title: {project.title}")
        print(f"    Path: {project.root_dir}")
        print()

    return 0


def cmd_info(args: argparse.Namespace) -> int:
    """Show detailed project information."""
    from ..project import load_project

    try:
        project = load_project(Path(args.projects_dir) / args.project)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(f"Project: {project.id}")
    print(f"Title: {project.title}")
    print(f"Description: {project.description}")
    print(f"Version: {project.version}")
    print(f"Path: {project.root_dir}")
    print()

    print("Video Settings:")
    print(f"  Resolution: {project.video.width}x{project.video.height}")
    print(f"  FPS: {project.video.fps}")
    print(f"  Target Duration: {project.video.target_duration_seconds}s")
    print()

    print("TTS Settings:")
    print(f"  Provider: {project.tts.provider}")
    print(f"  Voice ID: {project.tts.voice_id}")
    print()

    # Check what files exist
    print("Files:")
    narration_path = project.get_path("narration")
    print(f"  Narrations: {'[exists]' if narration_path.exists() else '[missing]'} {narration_path}")

    voiceover_files = project.get_voiceover_files()
    print(f"  Voiceovers: {len(voiceover_files)} audio files")

    storyboard_path = project.get_path("storyboard")
    print(f"  Storyboard: {'[exists]' if storyboard_path.exists() else '[missing]'} {storyboard_path}")

    output_files = list(project.output_dir.glob("*.mp4"))
    print(f"  Output: {len(output_files)} video files")

    return 0


def cmd_voiceover(args: argparse.Namespace) -> int:
    """Generate voiceovers for a project."""
    from ..project import load_project
    from ..audio import get_tts_provider
    from ..config import Config, TTSConfig

    try:
        project = load_project(Path(args.projects_dir) / args.project)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    # Load narrations
    try:
        narrations = project.load_narrations()
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(f"Generating voiceovers for {project.id}")
    print(f"Found {len(narrations)} scenes")
    print()

    # Determine TTS provider
    provider_name = args.provider or project.tts.provider
    if args.mock:
        provider_name = "mock"

    print(f"Using TTS provider: {provider_name}")

    # Create TTS config
    config = Config()
    config.tts.provider = provider_name
    if project.tts.voice_id:
        config.tts.voice_id = project.tts.voice_id

    tts = get_tts_provider(config)

    # Generate voiceovers
    output_dir = project.voiceover_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    results = []
    total_duration = 0.0

    for narration in narrations:
        print(f"  Generating: {narration.title}...")
        output_path = output_dir / f"{narration.scene_id}.mp3"

        try:
            result = tts.generate_with_timestamps(narration.narration, output_path)
            results.append({
                "scene_id": narration.scene_id,
                "audio_path": str(output_path),
                "duration_seconds": result.duration_seconds,
                "word_timestamps": [
                    {
                        "word": ts.word,
                        "start_seconds": ts.start_seconds,
                        "end_seconds": ts.end_seconds,
                    }
                    for ts in result.word_timestamps
                ],
            })
            total_duration += result.duration_seconds
            print(f"    Duration: {result.duration_seconds:.2f}s")
        except Exception as e:
            print(f"    Error: {e}", file=sys.stderr)
            if not args.continue_on_error:
                return 1

    # Save manifest
    manifest = {
        "scenes": results,
        "total_duration_seconds": total_duration,
        "output_dir": str(output_dir),
    }

    manifest_path = output_dir / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print()
    print(f"Generated {len(results)} voiceovers")
    print(f"Total duration: {total_duration:.2f}s ({total_duration/60:.1f} min)")
    print(f"Manifest saved to: {manifest_path}")

    return 0


def cmd_storyboard(args: argparse.Namespace) -> int:
    """Generate or view storyboard for a project."""
    from ..project import load_project

    try:
        project = load_project(Path(args.projects_dir) / args.project)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    storyboard_path = project.get_path("storyboard")

    if args.view:
        # View existing storyboard
        if not storyboard_path.exists():
            print(f"Error: Storyboard not found: {storyboard_path}", file=sys.stderr)
            return 1

        with open(storyboard_path) as f:
            storyboard = json.load(f)

        print(f"Storyboard: {storyboard.get('title', 'Untitled')}")
        print(f"Duration: {storyboard.get('duration_seconds', 0)}s")
        print(f"Beats: {len(storyboard.get('beats', []))}")
        print()

        for i, beat in enumerate(storyboard.get("beats", []), 1):
            print(f"  Beat {i}: {beat.get('id', 'unnamed')}")
            print(f"    Time: {beat.get('start_seconds', 0):.1f}s - {beat.get('end_seconds', 0):.1f}s")
            print(f"    Elements: {len(beat.get('elements', []))}")

        return 0

    # Generate storyboard (placeholder - would use LLM)
    print("Storyboard generation from LLM not yet implemented.")
    print("Use --view to view existing storyboard.")
    return 0


def cmd_render(args: argparse.Namespace) -> int:
    """Render video for a project."""
    import subprocess

    from ..project import load_project

    try:
        project = load_project(Path(args.projects_dir) / args.project)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(f"Rendering video for {project.id}")

    # Determine composition and setup
    remotion_dir = Path(__file__).parent.parent.parent / "remotion"
    render_script = remotion_dir / "scripts" / "render.mjs"

    if not render_script.exists():
        print(f"Error: Render script not found: {render_script}", file=sys.stderr)
        return 1

    # Check for storyboard
    storyboard_path = project.get_path("storyboard")
    if not storyboard_path.exists():
        print(f"Error: Storyboard not found: {storyboard_path}", file=sys.stderr)
        print("Run storyboard generation first or create storyboard/storyboard.json")
        return 1

    # Check for voiceover files
    voiceover_files = list(project.voiceover_dir.glob("*.mp3"))
    print(f"Found {len(voiceover_files)} voiceover files")

    # Determine output path
    if args.preview:
        output_path = project.output_dir / "preview" / "preview.mp4"
    else:
        output_path = project.get_path("final_video")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Build render command using new data-driven architecture
    # The render script uses the project directory to serve static files (voiceovers)
    cmd = [
        "node",
        str(render_script),
        "--project", str(project.root_dir),
        "--output", str(output_path),
    ]

    print(f"Project: {project.root_dir}")
    print(f"Output: {output_path}")
    print(f"Running: {' '.join(cmd)}")
    print()

    try:
        result = subprocess.run(cmd, cwd=str(remotion_dir))
        if result.returncode != 0:
            print(f"Render failed with exit code {result.returncode}", file=sys.stderr)
            return result.returncode
    except FileNotFoundError:
        print("Error: Node.js not found. Please install Node.js.", file=sys.stderr)
        return 1

    print()
    print(f"Video rendered to: {output_path}")
    return 0


def cmd_create(args: argparse.Namespace) -> int:
    """Create a new project."""
    from ..project.loader import create_project

    try:
        project = create_project(
            project_id=args.project_id,
            title=args.title or args.project_id.replace("-", " ").title(),
            projects_dir=args.projects_dir,
            description=args.description or "",
        )
        print(f"Created project: {project.id}")
        print(f"Path: {project.root_dir}")
        print()
        print("Next steps:")
        print(f"  1. Add source document to {project.input_dir}/")
        print(f"  2. Add narrations to {project.narration_dir}/narrations.json")
        print(f"  3. Run: python -m src.cli voiceover {project.id}")
        return 0
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


def main() -> int:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Video Explainer Pipeline CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--projects-dir",
        default="projects",
        help="Path to projects directory (default: projects)",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # list command
    list_parser = subparsers.add_parser("list", help="List all projects")
    list_parser.set_defaults(func=cmd_list)

    # info command
    info_parser = subparsers.add_parser("info", help="Show project information")
    info_parser.add_argument("project", help="Project ID")
    info_parser.set_defaults(func=cmd_info)

    # create command
    create_parser = subparsers.add_parser("create", help="Create a new project")
    create_parser.add_argument("project_id", help="Project ID (used as directory name)")
    create_parser.add_argument("--title", help="Project title")
    create_parser.add_argument("--description", help="Project description")
    create_parser.set_defaults(func=cmd_create)

    # voiceover command
    voiceover_parser = subparsers.add_parser("voiceover", help="Generate voiceovers")
    voiceover_parser.add_argument("project", help="Project ID")
    voiceover_parser.add_argument(
        "--provider",
        choices=["elevenlabs", "edge", "mock"],
        help="TTS provider to use",
    )
    voiceover_parser.add_argument(
        "--mock",
        action="store_true",
        help="Use mock TTS (for testing)",
    )
    voiceover_parser.add_argument(
        "--continue-on-error",
        action="store_true",
        help="Continue even if some scenes fail",
    )
    voiceover_parser.set_defaults(func=cmd_voiceover)

    # storyboard command
    storyboard_parser = subparsers.add_parser("storyboard", help="Generate or view storyboard")
    storyboard_parser.add_argument("project", help="Project ID")
    storyboard_parser.add_argument(
        "--view",
        action="store_true",
        help="View existing storyboard instead of generating",
    )
    storyboard_parser.set_defaults(func=cmd_storyboard)

    # render command
    render_parser = subparsers.add_parser("render", help="Render video")
    render_parser.add_argument("project", help="Project ID")
    render_parser.add_argument(
        "--preview",
        action="store_true",
        help="Quick preview render",
    )
    render_parser.set_defaults(func=cmd_render)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
