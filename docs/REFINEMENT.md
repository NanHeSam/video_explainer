# Refinement System

The refinement system helps elevate video quality to professional standards through a 4-phase process.

## Overview

| Phase | Name | Purpose |
|-------|------|---------|
| 1 | Analyze | Gap analysis - identifies missing concepts and generates patches |
| 2 | Script | Applies patches + storytelling refinements to script |
| 3 | Visual-Cue | Improves visual specifications in script.json |
| 4 | Visual | AI-powered visual inspection and code fixes |

**Key Design:** Phases 1 and 2 are connected. Phase 1 outputs patches that Phase 2 consumes and applies.

## Quick Start

```bash
# Run all phases in sequence
python -m src.cli refine <project> --phase analyze
python -m src.cli refine <project> --phase script --batch-approve
python -m src.cli refine <project> --phase visual-cue --apply
python -m src.cli refine <project> --phase visual

# Or just run visual refinement (default)
python -m src.cli refine <project>
```

## Phase 1: Gap Analysis

Compares source material against the generated script to identify gaps and generate patches.

**Prerequisites:** Input source material (`input/*.md` or `input/*.txt`) and narrations

```bash
python -m src.cli refine <project> --phase analyze
```

**What it detects:**
- **Missing concepts** - Important topics from source not covered in script
- **Shallow coverage** - Concepts mentioned but not explained deeply enough
- **Narrative gaps** - Logical jumps between scenes that confuse viewers

**How it works:**
1. Loads source material from `input/*.md` or `input/*.txt`
2. Extracts key concepts with importance ratings (critical, high, medium, low)
3. Analyzes script coverage depth (not_covered, mentioned, explained, deep_dive)
4. Identifies narrative gaps between scenes
5. Generates patches to fix identified gaps

**Patch Types:**

| Type | Description |
|------|-------------|
| `add_scene` | Insert a new scene to cover missing concepts |
| `modify_scene` | Update existing scene content |
| `expand_scene` | Add more detail to shallow coverage |
| `add_bridge` | Add transitional content between scenes |

**Output:** `projects/<project>/refine/gap_analysis.json`

Returns exit code 1 if critical gaps are found.

---

## Phase 2: Script Refinement

Loads patches from Phase 1, generates additional storytelling refinements, and applies approved changes.

**Prerequisites:** Run Phase 1 first to generate patches

```bash
python -m src.cli refine <project> --phase script              # Interactive
python -m src.cli refine <project> --phase script --batch-approve  # Auto-approve
```

**How it works:**
1. Loads patches from Phase 1 (`gap_analysis.json`)
2. Analyzes each scene against 10 narration principles
3. Generates additional storytelling patches for quality issues
4. Combines Phase 1 patches + storytelling patches
5. Interactive mode: Presents each patch for approval (y/n/e to edit)
6. Applies approved patches to update `script.json` and `narrations.json`

### 10 Narration Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | Hook in the first sentence | Grab attention with surprising facts, questions, or stakes |
| 2 | Build tension before release | Create anticipation before revealing solutions |
| 3 | Seamless transitions | Connect scenes with callback phrases |
| 4 | One insight per scene | Focus each scene on a single memorable takeaway |
| 5 | Concrete analogies | Use familiar comparisons for abstract concepts |
| 6 | Emotional beats | Include moments of wonder, surprise, or satisfaction |
| 7 | Match length to complexity | Simple ideas = short scenes, complex = more time |
| 8 | Rhetorical questions | Plant questions before answering |
| 9 | Clear stakes | Explain why the audience should care |
| 10 | Strong scene endings | End with memorable phrases or setup for next scene |

**Scoring weights:**
- Hook strength: 15%
- Flow quality: 15%
- Tension/buildup: 15%
- Insight clarity: 20%
- Emotional engagement: 15%
- Factual accuracy: 10%
- Length appropriateness: 10%

**Output:** Updates `script/script.json` and `narration/narrations.json`

---

## Phase 3: Visual-Cue Refinement

Analyzes and improves the `visual_cue` specifications in `script.json`.

**Prerequisites:** Script with visual_cue fields in `script/script.json`

```bash
python -m src.cli refine <project> --phase visual-cue           # Analyze
python -m src.cli refine <project> --phase visual-cue --scene 0 # Specific scene
python -m src.cli refine <project> --phase visual-cue --apply   # Apply patches
```

**How it works:**
1. Reads `script/script.json` and extracts visual_cue for each scene
2. Evaluates each visual_cue against established patterns
3. Creates `UpdateVisualCuePatch` for scenes needing improvement
4. With `--apply`, updates `script.json` with improved visual_cues

### Visual Pattern Guidelines

The refiner ensures visual_cues specify:
- **Material style** - Dark glass panels vs light panels
- **Shadow layers** - Multi-layer shadows with specific opacities
- **3D depth** - Layered compositions with clear z-ordering
- **Color values** - Specific rgba ranges for backgrounds

**Output:**
- Analysis: `projects/<project>/refine/visual_cue_analysis.json`
- With `--apply`: Updates `script/script.json`

---

## Phase 4: Visual Refinement

AI-powered visual inspection using Claude Code with browser access.

**Prerequisites:** Scene components generated and storyboard created

```bash
python -m src.cli refine <project> --phase visual
python -m src.cli refine <project> --phase visual --scene 3 --live
```

**How it works:**
1. **Beat Parsing** - Narration analyzed to identify key visual moments
2. **Visual Inspection** - Claude Code opens scene in Remotion Studio
3. **Quality Assessment** - Screenshots analyzed against 13 guiding principles
4. **Fix Application** - Claude Code edits scene components to fix issues
5. **Verification** - New screenshots verify improvements

### 13 Guiding Principles

| Principle | Description |
|-----------|-------------|
| Show Don't Tell | Use visuals, not just text |
| Animation Reveals | Animate elements in sync with narration |
| Progressive Disclosure | Show info as it's mentioned |
| Text Complements | Text supports visuals, doesn't replace |
| Visual Hierarchy | Guide viewer's eye |
| Breathing Room | Don't clutter |
| Purposeful Motion | Every animation has meaning |
| Emotional Resonance | Connect with viewer |
| Professional Polish | Clean, consistent |
| Sync with Narration | Timing matches speech |
| Screen Space Utilization | Use full canvas effectively |
| Material Depth | Multi-layer shadows and 3D depth |
| Visual Spec Match | Match visual_cue from script.json |

**Technical Details:**

Uses `SingleScenePlayer` Remotion composition that loads individual scenes starting at frame 0, eliminating navigation through the entire video.

**Output:** Scene files modified in place (`projects/<project>/scenes/*.tsx`)

---

## CLI Options

| Option | Description |
|--------|-------------|
| `--phase` | Phase to run: `analyze`, `script`, `visual-cue`, or `visual` (default: visual) |
| `--scene N` | Refine only scene N (0-indexed for visual-cue, 1-indexed for visual) |
| `--apply` | Apply generated patches to script.json (visual-cue phase) |
| `--batch-approve` | Auto-approve all suggested changes (script phase) |
| `--live` | Stream Claude Code output in real-time |
| `-v, --verbose` | Show detailed progress |
