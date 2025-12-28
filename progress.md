# Video Explainer System - Progress Tracker

## Quick Context for Future Sessions

### One-Line Summary
Building a system to generate high-quality explainer videos from technical documents (starting with an LLM inference article).

### Prompt for New Claude Code Session
```
I'm continuing work on the Video Explainer system. This project generates
explainer videos from technical documents.

Key context:
- Design doc: design.md (full architecture and visual style guide)
- Progress: progress.md (current state and next steps)
- Test content: /Users/prajwal/Desktop/Learning/inference/website/post.md

Current phase: Phase 3 - Extending the System
- Phase 1 MVP: COMPLETE (112 tests passing)
- Phase 2 First Video: COMPLETE
- First real explainer video generated with Motion Canvas + ElevenLabs TTS
- Output: output/real_video/prefill_decode_explainer_real.mp4

Key commands:
  source .venv/bin/activate && pytest tests/ -v  # Run all tests (112 passing)
  cd animations && npm run dev                    # Start Motion Canvas editor
  python generate_video.py                        # Generate video with mock data
  python create_real_video_with_tts.py           # Generate with real TTS

Check "Next Actions" section below for current tasks.
```

---

## Project Overview

| Aspect | Details |
|--------|---------|
| **Goal** | Generate high-quality explainer videos from technical content |
| **First Topic** | LLM Inference (Prefill/Decode/KV Cache) |
| **Target Duration** | 3-4 minutes |
| **Animation Tool** | Motion Canvas (TypeScript) |
| **TTS** | ElevenLabs (real API) |
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
- [x] Motion Canvas setup and validation
- [x] Manual test animation (Prefill vs Decode scene)
- [x] ElevenLabs TTS integration (with mock for testing)
- [x] Video composition with FFmpeg
- [x] Dockerfile for containerization
- [x] End-to-end tests
- [x] **112 tests, all passing**

### Completed (Phase 2 - First Real Video)
- [x] Video generation pipeline orchestrator (src/pipeline/)
- [x] Animation renderer module (src/animation/)
- [x] Motion Canvas FFmpeg plugin integration
- [x] Fixed animation ref bug in prefillDecode.tsx
- [x] MockTTS generates valid audio files via FFmpeg
- [x] Real ElevenLabs TTS integration tested
- [x] **First real explainer video generated!**
  - Animation: Prefill vs Decode visualization
  - Audio: ElevenLabs TTS narration
  - Output: output/real_video/prefill_decode_explainer_real.mp4

### Phase 2 Complete!

Generated first real explainer video with Motion Canvas animation and ElevenLabs voiceover.

### Next Steps (Phase 3)
- [ ] Extend animation to match full narration length (~21s)
- [ ] Add more animation scenes (KV Cache, Batching, etc.)
- [ ] Enable real LLM API for dynamic script generation
- [ ] Build web interface for easier use
- [ ] Add more visual elements (code highlights, equations)

---

## Architecture Summary

```
Pipeline: Source → Parse → Analyze → Script → Review → TTS → Animation → Compose → Video

Key files:
├── src/
│   ├── config.py          # Configuration management
│   ├── models.py          # Pydantic data models
│   ├── ingestion/         # Document parsing
│   │   ├── markdown.py    # Markdown parser
│   │   └── parser.py      # Main parser interface
│   ├── understanding/     # Content analysis
│   │   ├── llm_provider.py # Mock + real LLM providers
│   │   └── analyzer.py    # Content analyzer
│   ├── script/            # Script generation
│   │   └── generator.py   # Script with visual cues
│   ├── review/            # CLI review interface
│   │   └── cli.py         # Rich-based review CLI
│   ├── audio/             # TTS integration
│   │   └── tts.py         # ElevenLabs + Mock TTS
│   ├── animation/         # Animation rendering
│   │   └── renderer.py    # Motion Canvas renderer
│   ├── composition/       # Video assembly
│   │   └── composer.py    # FFmpeg-based composer
│   └── pipeline/          # End-to-end orchestration
│       └── orchestrator.py # Video generation pipeline
├── animations/            # Motion Canvas project
│   ├── src/scenes/        # Animation scenes
│   │   └── prefillDecode.tsx  # Prefill vs Decode animation
│   └── src/styles/        # Color palette, fonts
├── tests/                 # 112 passing tests
├── output/real_video/     # Generated videos
├── Dockerfile             # Container setup
├── generate_video.py      # Quick generation script
└── create_real_video_with_tts.py  # Real TTS generation
```

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Animation Library | Motion Canvas | TypeScript, modern, good for LLM code gen |
| TTS Provider | ElevenLabs | High quality, voice cloning support |
| LLM During Dev | Mock responses | Save money, test pipeline |
| Video Resolution | 1080p (4K later) | Standard YouTube, can scale |
| Review Interface | CLI first | Simple, fast to implement |
| Deployment | Docker/Containerized | Easy cloud deployment later |

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
```

---

## Next Actions

1. **Extend Prefill/Decode animation** - Increase duration from 9s to ~21s
   to match the full narration length

2. **Add KV Cache animation scene** - Create new scene explaining KV Cache
   optimization in LLM inference

3. **Add Batching animation scene** - Visualize continuous batching and
   how it improves throughput

4. **Enable real LLM API** - Switch from mock to Claude for dynamic
   script generation from any document

5. **Create web interface** - Simple UI for uploading documents and
   generating videos without CLI

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

---

*Last Updated: December 2024*
*Session: Phase 2 Complete - First Real Video Generated*
