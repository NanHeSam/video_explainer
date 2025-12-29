"""Narration scripts for video explainer projects.

This module provides:
1. SceneNarration dataclass for representing narrations
2. Functions to load narrations from project JSON files
3. Legacy support for the LLM inference narrations (deprecated)
"""

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass
class SceneNarration:
    """Narration for a single scene."""

    scene_id: str
    title: str
    duration_seconds: int
    narration: str


def load_narrations_from_file(path: str | Path) -> list[SceneNarration]:
    """Load narrations from a JSON file.

    Args:
        path: Path to the narrations JSON file.

    Returns:
        List of SceneNarration objects.

    The JSON file should have this format:
    {
        "scenes": [
            {
                "scene_id": "scene1",
                "title": "Scene Title",
                "duration_seconds": 15,
                "narration": "The narration text..."
            },
            ...
        ]
    }
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Narration file not found: {path}")

    with open(path) as f:
        data = json.load(f)

    return [
        SceneNarration(
            scene_id=scene["scene_id"],
            title=scene["title"],
            duration_seconds=scene["duration_seconds"],
            narration=scene["narration"],
        )
        for scene in data.get("scenes", [])
    ]


def load_narrations_from_project(project_path: str | Path) -> list[SceneNarration]:
    """Load narrations from a project directory.

    Args:
        project_path: Path to the project directory.

    Returns:
        List of SceneNarration objects.
    """
    project_path = Path(project_path)
    narration_path = project_path / "narration" / "narrations.json"
    return load_narrations_from_file(narration_path)


# =============================================================================
# DEPRECATED: Legacy LLM Inference Narrations
# These are kept for backward compatibility but should not be used for new code.
# Use load_narrations_from_project("projects/llm-inference") instead.
# =============================================================================

# Narration scripts for each scene of the LLM Inference video
# DEPRECATED: Use projects/llm-inference/narration/narrations.json instead
LLM_INFERENCE_NARRATIONS = [
    SceneNarration(
        scene_id="scene1_hook",
        title="The Speed Problem",
        duration_seconds=15,
        narration=(
            "Every time you chat with an AI, something remarkable happens. "
            "A neural network generates your response, one word at a time. "
            "The naive approach? Forty tokens per second. "
            "The best systems? Over three thousand. "
            "That's eighty-seven times faster. Here's how they do it."
        ),
    ),
    SceneNarration(
        scene_id="scene2_phases",
        title="The Two Phases",
        duration_seconds=20,
        narration=(
            "LLM inference has two distinct phases. "
            "First, the prefill phase processes your entire prompt in parallel. "
            "The GPU loves this - it can crunch all tokens at once. "
            "Then comes the decode phase, generating one token at a time. "
            "Each new token depends on the previous one. "
            "This is where the bottleneck hides."
        ),
    ),
    SceneNarration(
        scene_id="scene3_bottleneck",
        title="The Decode Bottleneck",
        duration_seconds=25,
        narration=(
            "During decode, something surprising happens. "
            "The GPU sits mostly idle, waiting for data. "
            "Why? Because we're not limited by compute power. "
            "We're limited by memory bandwidth. "
            "The model weights are massive - billions of parameters. "
            "Moving them from memory to GPU takes time. "
            "And we do this for every single token."
        ),
    ),
    SceneNarration(
        scene_id="scene4_attention",
        title="Understanding Attention",
        duration_seconds=25,
        narration=(
            "To understand the solution, we need to understand attention. "
            "For each token, we compute three vectors: Query, Key, and Value. "
            "The Query asks: what am I looking for? "
            "Keys answer: what information do I have? "
            "Values hold the actual content. "
            "Attention scores tell us which past tokens matter most for the current prediction."
        ),
    ),
    SceneNarration(
        scene_id="scene5_redundancy",
        title="The Redundancy Problem",
        duration_seconds=25,
        narration=(
            "Here's the problem with naive decoding. "
            "For each new token, we recompute Keys and Values for ALL previous tokens. "
            "Token one? Compute once. Token two? Compute everything twice. "
            "Token ten? Ten times the work. Token one hundred? You see the pattern. "
            "This is O of n squared complexity. "
            "Most of this computation is completely redundant."
        ),
    ),
    SceneNarration(
        scene_id="scene6_kvcache",
        title="The KV Cache Solution",
        duration_seconds=25,
        narration=(
            "The solution is elegant: the KV Cache. "
            "Compute each Key and Value exactly once, then store them. "
            "When generating the next token, just look up what you've already computed. "
            "No redundant calculations. No wasted work. "
            "We trade memory for speed. "
            "Compute once. Remember forever."
        ),
    ),
    SceneNarration(
        scene_id="scene7_mechanics",
        title="How KV Cache Works",
        duration_seconds=20,
        narration=(
            "Here's how it works in practice. "
            "The new token's Query looks up against the cached Keys. "
            "This gives us attention weights. "
            "Those weights select from cached Values. "
            "The result? Same output, fraction of the compute. "
            "Each new token only needs one new Key-Value pair added to the cache."
        ),
    ),
    SceneNarration(
        scene_id="scene8_impact",
        title="The Impact",
        duration_seconds=25,
        narration=(
            "The impact is massive. "
            "Eighty-seven times faster inference. "
            "The tradeoff? Memory. A seventy billion parameter model needs about thirty-two gigabytes just for the cache. "
            "But it's worth it. "
            "Every major LLM uses this technique. GPT-4, Claude, Gemini, LLaMA. "
            "KV caching is the foundation of fast LLM inference. "
            "Trade memory for speed. Never recompute what you can remember."
        ),
    ),
]


def get_narration_for_scene(scene_id: str) -> SceneNarration | None:
    """Get narration for a specific scene.

    DEPRECATED: Use load_narrations_from_project() instead.
    """
    for narration in LLM_INFERENCE_NARRATIONS:
        if narration.scene_id == scene_id:
            return narration
    return None


def get_all_narrations() -> list[SceneNarration]:
    """Get all narration scripts.

    DEPRECATED: Use load_narrations_from_project() instead.
    """
    return LLM_INFERENCE_NARRATIONS


def get_full_script() -> str:
    """Get the complete narration script as a single string.

    DEPRECATED: Use load_narrations_from_project() instead.
    """
    return "\n\n".join(
        f"[{n.title}]\n{n.narration}" for n in LLM_INFERENCE_NARRATIONS
    )
