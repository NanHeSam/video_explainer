# Video Explainer System - Progress Tracker

## Quick Context for Future Sessions

### One-Line Summary
Building a system to generate high-quality explainer videos from technical documents using Remotion (React-based) programmatic animations.

### Prompt for New Claude Code Session
```
I'm continuing work on the Video Explainer system. This project generates
explainer videos from technical documents.

Key context:
- Design doc: design.md (full architecture and visual style guide)
- Progress: progress.md (current state and next steps)
- Test content: /Users/prajwal/Desktop/Learning/inference/website/post.md

Current phase: Phase 4 - Quality & Generalization
- Phase 1 MVP: COMPLETE (112 tests)
- Phase 2 First Video: COMPLETE
- Phase 3 Automated Animation: COMPLETE
- Phase 3.5 Quality Focus: IN PROGRESS (169 tests passing)
  - Storyboard-first workflow implemented
  - JSON schema for storyboards
  - StoryboardPlayer (runtime interpreter)
  - Custom components: Token, TokenRow, GPUGauge
  - PrefillDecodeScene hand-crafted demo working

Key commands:
  source .venv/bin/activate && pytest tests/ -v  # Run all tests (169 passing)
  cd remotion && npm run dev                      # Start Remotion studio
  # Select "PrefillDecode" composition to see the hand-crafted demo
  # Select "StoryboardPlayer" to test storyboard rendering

Key files:
  storyboards/schema/storyboard.schema.json      # Storyboard JSON schema
  storyboards/examples/prefill_vs_decode.json    # Example storyboard
  storyboards/prefill_vs_decode.md               # Human-readable storyboard
  src/storyboard/                                 # Python storyboard module

Check "Next Actions" section below for current tasks.
```

---

## Project Overview

| Aspect | Details |
|--------|---------|
| **Goal** | Generate high-quality explainer videos from technical content |
| **First Topic** | LLM Inference (Prefill/Decode/KV Cache) |
| **Target Duration** | 3-4 minutes |
| **Animation Tool** | Remotion (React-based, programmatic rendering) |
| **TTS** | ElevenLabs (real API) or Mock for development |
| **LLM** | Mock responses during dev, Claude/GPT-4 for production |
| **Video Specs** | 1080p, 30fps, MP4 |

---

## Current Status

### Completed (Phase 1 MVP)
- [x] Project structure initialized
- [x] Git repository created
- [x] Python package setup (pyproject.toml)
- [x] Configuration system (config.py, config.yaml)
- [x] Core data models (models.py)
- [x] Content ingestion module (markdown parser)
- [x] Mock LLM provider with realistic responses
- [x] Content understanding/analyzer module
- [x] Script generation module with visual cues
- [x] CLI review interface (rich-based)
- [x] ElevenLabs TTS integration (with mock for testing)
- [x] Video composition with FFmpeg
- [x] Dockerfile for containerization
- [x] End-to-end tests
- [x] **112 tests, all passing**

### Completed (Phase 2 - First Real Video)
- [x] Video generation pipeline orchestrator (src/pipeline/)
- [x] Animation renderer module (src/animation/)
- [x] Motion Canvas FFmpeg plugin integration
- [x] MockTTS generates valid audio files via FFmpeg
- [x] Real ElevenLabs TTS integration tested
- [x] **First real explainer video generated!**

### Completed (Phase 3 - Automated Animation)
- [x] Remotion integration (React-based programmatic rendering)
- [x] Abstract AnimationRenderer interface for swappable backends
- [x] RemotionRenderer implementation with script-to-props conversion
- [x] Animation components library (TitleCard, TokenGrid, ProgressBar, TextReveal)
- [x] SceneRenderer to map visual cues to React components
- [x] Headless rendering via `@remotion/renderer` and `@remotion/bundler`
- [x] Full E2E pipeline generating 176-second videos from scripts
- [x] **119 tests, all passing**

### Phase 3 Complete!

Successfully migrated from manual Motion Canvas animations to fully automated Remotion-based rendering. The pipeline now generates complete explainer videos programmatically from any document.

### In Progress (Phase 3.5 - Quality & Generalization)
- [x] Identified quality issues with templated animations
- [x] Designed storyboard-first workflow (TTS → Storyboard → Animation)
- [x] Created detailed storyboard for Prefill vs Decode scene
- [x] Built custom Remotion components (Token, TokenRow, GPUGauge)
- [x] Built PrefillDecodeScene hand-crafted demo
- [x] Defined JSON schema for storyboards
- [x] Built StoryboardPlayer (runtime storyboard interpreter)
- [x] Created Python storyboard module (loader, validator, renderer)
- [x] **169 tests passing**
- [ ] Render storyboard JSON through StoryboardPlayer
- [ ] Build storyboard generator (LLM-assisted)
- [ ] Add TTS word-level timestamps for sync points

### Next Steps (Phase 4 - Production Ready)
- [ ] Enable real LLM API (Anthropic/OpenAI) for dynamic content analysis
- [ ] Add more animation components (code highlights, equations, diagrams)
- [ ] Build web interface for easier use
- [ ] Cloud deployment (Docker/Kubernetes)
- [ ] Support for more input formats (PDF, URL scraping)

---

## Architecture Summary

```
Pipeline (Evolved - Quality Focus):

Document → Parse → Analyze → Script → TTS → Storyboard → Animation → Compose → Video
                                       │         ↑
                                       │    (JSON schema)
                                       └─────────┘
                                    (word timestamps)

Key files:
├── src/
│   ├── config.py          # Configuration management
│   ├── models.py          # Pydantic data models
│   ├── ingestion/         # Document parsing
│   ├── understanding/     # Content analysis (LLM)
│   ├── script/            # Script generation
│   ├── review/            # CLI review interface
│   ├── audio/             # TTS integration
│   ├── storyboard/        # NEW: Storyboard module
│   │   ├── models.py      # Pydantic models for storyboard
│   │   ├── loader.py      # Load/validate storyboard JSON
│   │   └── renderer.py    # Render via Remotion
│   ├── animation/         # Animation rendering
│   ├── composition/       # Video assembly
│   └── pipeline/          # End-to-end orchestration
├── storyboards/           # NEW: Storyboard files
│   ├── schema/
│   │   └── storyboard.schema.json  # JSON schema
│   ├── examples/
│   │   └── prefill_vs_decode.json  # Example storyboard
│   └── prefill_vs_decode.md        # Human-readable design
├── remotion/              # Remotion project
│   ├── src/
│   │   ├── components/    # Animation components
│   │   │   ├── Token.tsx          # NEW: Token with glow
│   │   │   ├── TokenRow.tsx       # NEW: Prefill/decode modes
│   │   │   ├── GPUGauge.tsx       # NEW: Utilization bar
│   │   │   ├── registry.ts        # NEW: Component registry
│   │   │   └── ...
│   │   ├── scenes/
│   │   │   ├── PrefillDecodeScene.tsx  # NEW: Hand-crafted demo
│   │   │   ├── StoryboardPlayer.tsx    # NEW: Runtime interpreter
│   │   │   └── ...
│   │   └── types/
│   │       ├── script.ts
│   │       └── storyboard.ts      # NEW: Storyboard types
│   └── scripts/
│       └── render.mjs
├── tests/                 # 169 passing tests
├── output/                # Generated videos
└── generate_video.py      # CLI entry point
```

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Animation Library | Remotion (React) | Headless rendering, programmatic, actively maintained |
| Previous Choice | Motion Canvas | Moved away - no native headless rendering support |
| TTS Provider | ElevenLabs | High quality, voice cloning support |
| LLM During Dev | Mock responses | Save money, test pipeline |
| Video Resolution | 1080p (4K later) | Standard YouTube, can scale |
| Review Interface | CLI first | Simple, fast to implement |
| Deployment | Docker/Containerized | Easy cloud deployment later |
| Renderer Interface | Abstract base class | Easy to swap backends (Remotion, Mock, future options) |

---

## Visual Style (for LLM Inference topic)

```
Background: #0f0f1a (dark slate)
Compute/Data: #00d9ff (cyan)
Memory: #ff6b35 (orange)
Optimization: #00ff88 (green)
Problems: #ff4757 (red)

Typography: Inter/SF Pro for text, JetBrains Mono for code
Animation: easeInOutCubic, 0.3-0.5s transitions
```

---

## Test Content Location

The source document for our first video:
```
/Users/prajwal/Desktop/Learning/inference/website/post.md
```

Sections to cover in Phase 1:
- "The Two Phases of Inference" (Prefill vs Decode)
- "Quick Primer: The Attention Operation"
- "KV Cache" explanation

---

## Running the Project

```bash
# Activate virtual environment
source .venv/bin/activate

# Run tests
pytest tests/ -v

# Run specific test file
pytest tests/test_ingestion.py -v

# Start Remotion studio for development
cd remotion && npm run dev

# Generate video (mock data)
python generate_video.py --test

# Generate video from document
python generate_video.py --source path/to/document.md
```

---

## Next Actions

### Immediate (Phase 3.5 Completion)

1. **Test StoryboardPlayer with example JSON** - Verify the runtime
   interpreter renders prefill_vs_decode.json correctly

2. **Add TTS word timestamps** - ElevenLabs provides word-level timing;
   integrate this into audio module for sync points

3. **Build storyboard generator** - LLM-assisted module that:
   - Takes script + audio timing
   - Uses example storyboards as context
   - Outputs valid storyboard JSON

### Future (Phase 4)

4. **Enable real LLM API** - Switch from mock to Claude/GPT-4 for dynamic
   content analysis and script generation

5. **Add more animation components** - Create components for:
   - Code block highlighting with syntax colors
   - Mathematical equation rendering
   - Diagram animations (flowcharts, architecture)

6. **Create web interface** - Simple UI for uploading documents

7. **Cloud deployment** - Docker/Kubernetes for production

---

## Notes for Future Sessions

- Always run tests before committing: `pytest tests/ -v`
- The ingestion module successfully parses the real inference article
- Mock LLM should return realistic responses for the specific test content
- Budget constraint: ~$50 for the test video
- Human review checkpoints at: script, storyboard, final

---

## Commits Made

| Date | Commit | Description |
|------|--------|-------------|
| Dec 2024 | d770b7c | Initial project setup with ingestion, understanding, and script modules |
| Dec 2024 | 609b95a | Add CLI review interface and Motion Canvas animation setup |
| Dec 2024 | b3fc60d | Add TTS and video composition modules |
| Dec 2024 | 1237125 | Complete Phase 1 MVP with Dockerfile and E2E tests |
| Dec 2024 | 43799de | Add video generation pipeline and first video output |
| Dec 2024 | ff2b337 | Add comprehensive README.md |
| Dec 2024 | 41ceadc | Complete Phase 2: First real explainer video generated |
| Dec 2024 | 50dbc3f | Refactor pipeline: remove one-off scripts, use config-based providers |
| Dec 2024 | - | Phase 3: Remotion integration for automated animation rendering |
| Dec 2024 | - | Phase 3.5: Storyboard system, quality focus, hand-crafted demo |

---

*Last Updated: December 2024*
*Session: Phase 3.5 - Storyboard-first workflow, 169 tests passing*
