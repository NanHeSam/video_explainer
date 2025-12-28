"""Storyboard module for video explainer system.

This module handles loading, validating, and rendering storyboards.
"""

from .loader import (
    load_storyboard,
    validate_storyboard,
    StoryboardError,
)
from .models import (
    Storyboard,
    Beat,
    Element,
    Animation,
    Position,
    Transition,
    SyncPoint,
    AudioConfig,
    StyleConfig,
)
from .renderer import StoryboardRenderer

__all__ = [
    # Loader
    "load_storyboard",
    "validate_storyboard",
    "StoryboardError",
    # Models
    "Storyboard",
    "Beat",
    "Element",
    "Animation",
    "Position",
    "Transition",
    "SyncPoint",
    "AudioConfig",
    "StyleConfig",
    # Renderer
    "StoryboardRenderer",
]
