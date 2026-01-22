"""LLM prompts for feedback processing."""

PARSE_FEEDBACK_SYSTEM_PROMPT = """You are analyzing user feedback for a video explainer project.

Your task is to:
1. Determine what KIND of change is being requested (intent)
2. Identify which SCENES are affected
3. Provide a clear INTERPRETATION of what the user wants

Be precise and specific. The feedback will be used to generate patches that modify project files."""


PARSE_FEEDBACK_PROMPT = """Analyze this user feedback for a video project.

## Project: {project_id}

## Available Scenes:
{scene_list}

## User Feedback:
"{feedback_text}"

## Intent Categories
Choose the most specific intent:
- script_content: Changing what is SAID in the narration (voiceover text)
- script_structure: Adding, removing, or reordering SCENES
- visual_cue: Changing the DESCRIPTION of what should be visualized (in script.json)
- visual_impl: Changing the ACTUAL CODE that renders the scene (.tsx files)
- timing: Adjusting scene DURATIONS
- style: Changing visual STYLING patterns (colors, fonts, shadows, etc.)
- mixed: Multiple types of changes (specify sub_intents)

## Instructions
1. Read the feedback carefully
2. Identify the primary intent
3. List affected scene IDs (use the slug format like "the_impossible_leap")
4. Provide a clear interpretation

Respond with JSON:
{{
    "intent": "script_content|script_structure|visual_cue|visual_impl|timing|style|mixed",
    "sub_intents": ["intent1", "intent2"],  // Only if intent is "mixed"
    "affected_scene_ids": ["scene_id_1", "scene_id_2"],  // Empty list for project-wide
    "scope": "scene|multi_scene|project",
    "interpretation": "Clear, actionable description of what the user wants changed"
}}
"""


GENERATE_SCRIPT_PATCH_PROMPT = """Generate patches to modify the narration/script based on this feedback.

## Scene Information
Scene ID: {scene_id}
Scene Title: {scene_title}
Current Narration:
"{current_narration}"

## Feedback:
"{feedback_text}"

## Interpretation:
{interpretation}

## Instructions
Generate specific text changes. Be precise about what to change.

Respond with JSON:
{{
    "changes": [
        {{
            "field": "voiceover",  // or "title"
            "old_text": "exact text to find (or null for additions)",
            "new_text": "replacement text",
            "reason": "why this change addresses the feedback"
        }}
    ]
}}
"""


GENERATE_VISUAL_CUE_PATCH_PROMPT = """Generate patches to update the visual_cue specification.

## Scene Information
Scene ID: {scene_id}
Scene Title: {scene_title}
Scene Type: {scene_type}
Narration: "{narration}"

## Current Visual Cue:
{current_visual_cue}

## Feedback:
"{feedback_text}"

## Interpretation:
{interpretation}

## Visual Styling Guidelines
- BACKGROUND: Scene canvas/backdrop (gradients, colors, patterns)
- UI COMPONENTS: Floating dark glass panels with:
  - Dark glass: rgba(18,20,25,0.98) backgrounds
  - Multi-layer shadows (5-7 layers) for depth
  - Bezel borders: light top/left, dark bottom/right
  - Inner shadows for recessed depth
  - Colored accent glows based on content

## Instructions
Generate an improved visual_cue that addresses the feedback while following styling guidelines.

Respond with JSON:
{{
    "needs_update": true,
    "new_visual_cue": {{
        "description": "BACKGROUND: [describe backdrop]. UI COMPONENTS: [describe panels].",
        "visual_type": "animation",
        "elements": [
            "BACKGROUND: description",
            "UI Component 1 with styling details",
            "UI Component 2 with styling details"
        ],
        "duration_seconds": {duration}
    }},
    "reason": "Why this change addresses the feedback"
}}
"""


GENERATE_STRUCTURE_PATCH_PROMPT = """Generate patches to modify the scene structure.

## Current Scenes:
{scene_list}

## Feedback:
"{feedback_text}"

## Interpretation:
{interpretation}

## Instructions
Determine what structural changes are needed:
- Adding a new scene (provide title, narration, visual description)
- Removing a scene (specify which one)
- Reordering scenes (provide new order)

Respond with JSON:
{{
    "action": "add|remove|reorder",
    "details": {{
        // For "add":
        "insert_after": "scene_id or null for beginning",
        "new_scene": {{
            "title": "Scene Title",
            "scene_type": "hook|context|explanation|insight|conclusion",
            "narration": "The voiceover text...",
            "visual_description": "What should be visualized",
            "duration_seconds": 25
        }},
        // For "remove":
        "scene_id": "scene_to_remove",
        // For "reorder":
        "new_order": ["scene_id_1", "scene_id_2", ...]
    }},
    "reason": "Why this structural change addresses the feedback"
}}
"""
