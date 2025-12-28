"""Motion Canvas renderer for exporting animations to video."""

import os
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

from ..config import Config, load_config


@dataclass
class RenderResult:
    """Result of rendering an animation."""

    output_path: Path
    duration_seconds: float
    frame_count: int
    success: bool
    error_message: str | None = None


class MotionCanvasRenderer:
    """Render Motion Canvas animations to video files."""

    def __init__(self, config: Config | None = None):
        """Initialize the renderer.

        Args:
            config: Configuration object. If None, loads default.
        """
        self.config = config or load_config()
        self.animations_dir = Path(__file__).parent.parent.parent / "animations"

    def _check_dependencies(self) -> None:
        """Check if required dependencies are available."""
        # Check Node.js
        try:
            result = subprocess.run(
                ["node", "--version"],
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                raise RuntimeError("Node.js not working properly")
        except FileNotFoundError:
            raise RuntimeError("Node.js not found. Required for Motion Canvas.")

        # Check FFmpeg
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                raise RuntimeError("FFmpeg not working properly")
        except FileNotFoundError:
            raise RuntimeError("FFmpeg not found. Required for video export.")

    def render_scene(
        self,
        scene_name: str,
        output_path: Path | str,
        fps: int = 30,
        width: int = 1920,
        height: int = 1080,
    ) -> RenderResult:
        """Render a specific scene to video.

        This method starts the Motion Canvas dev server, triggers rendering
        via the FFmpeg plugin, and returns the result.

        Args:
            scene_name: Name of the scene to render (e.g., "prefillDecode")
            output_path: Path for the output video file
            fps: Frames per second (default 30)
            width: Video width (default 1920)
            height: Video height (default 1080)

        Returns:
            RenderResult with output info
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        self._check_dependencies()

        # Motion Canvas with FFmpeg plugin exports to output/ directory
        render_output_dir = self.animations_dir / "output"
        render_output_dir.mkdir(exist_ok=True)

        # Start vite in render mode
        # Motion Canvas FFmpeg plugin handles the rendering automatically
        env = os.environ.copy()
        env["MOTION_CANVAS_RENDER"] = "true"

        try:
            # Run vite build which will trigger rendering
            result = subprocess.run(
                ["npm", "run", "build"],
                cwd=self.animations_dir,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                env=env,
            )

            if result.returncode != 0:
                return RenderResult(
                    output_path=output_path,
                    duration_seconds=0,
                    frame_count=0,
                    success=False,
                    error_message=f"Build failed: {result.stderr}",
                )

            # Look for rendered output
            # Motion Canvas FFmpeg exports to output/project/scene.mp4
            expected_output = render_output_dir / "project" / f"{scene_name}.mp4"

            if expected_output.exists():
                # Move to desired location
                import shutil
                shutil.move(str(expected_output), str(output_path))

                # Get duration using ffprobe
                duration = self._get_video_duration(output_path)

                return RenderResult(
                    output_path=output_path,
                    duration_seconds=duration,
                    frame_count=int(duration * fps),
                    success=True,
                )
            else:
                return RenderResult(
                    output_path=output_path,
                    duration_seconds=0,
                    frame_count=0,
                    success=False,
                    error_message=f"Output file not found: {expected_output}",
                )

        except subprocess.TimeoutExpired:
            return RenderResult(
                output_path=output_path,
                duration_seconds=0,
                frame_count=0,
                success=False,
                error_message="Render timeout exceeded (5 minutes)",
            )

    def render_mock(
        self,
        output_path: Path | str,
        duration_seconds: float = 10.0,
        fps: int = 30,
        width: int = 1920,
        height: int = 1080,
    ) -> RenderResult:
        """Generate a mock video for testing without actually rendering.

        Creates a simple test video using FFmpeg directly.

        Args:
            output_path: Path for the output video file
            duration_seconds: Duration of the mock video
            fps: Frames per second
            width: Video width
            height: Video height

        Returns:
            RenderResult with output info
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Generate a test pattern video with FFmpeg
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"testsrc2=size={width}x{height}:rate={fps}:duration={duration_seconds}",
            "-f", "lavfi",
            "-i", f"sine=frequency=440:duration={duration_seconds}",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-pix_fmt", "yuv420p",
            str(output_path),
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
            )

            if result.returncode != 0:
                return RenderResult(
                    output_path=output_path,
                    duration_seconds=0,
                    frame_count=0,
                    success=False,
                    error_message=f"FFmpeg failed: {result.stderr}",
                )

            return RenderResult(
                output_path=output_path,
                duration_seconds=duration_seconds,
                frame_count=int(duration_seconds * fps),
                success=True,
            )

        except subprocess.TimeoutExpired:
            return RenderResult(
                output_path=output_path,
                duration_seconds=0,
                frame_count=0,
                success=False,
                error_message="Render timeout",
            )

    def _get_video_duration(self, video_path: Path) -> float:
        """Get the duration of a video file using ffprobe."""
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                return float(result.stdout.strip())
        except (ValueError, subprocess.SubprocessError):
            pass

        return 0.0
