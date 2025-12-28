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

Current phase: Phase 2 - First Video Generation
- Phase 1 MVP is COMPLETE (95 tests passing)
- Target: Generate first video using mock data (no API costs)
- Motion Canvas animation exists at animations/src/scenes/prefillDecode.tsx
- Need to: render animation, combine with mock audio, produce final video

Key commands:
  source .venv/bin/activate && pytest tests/ -v  # Run all tests
  cd animations && npm run dev                    # Start Motion Canvas editor

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
- [x] **95 tests, all passing**

### Phase 1 MVP Complete!

The foundational pipeline is working end-to-end with mock LLM responses.

### Next Steps (Phase 2)
- [ ] Enable real LLM API calls (Claude/OpenAI)
- [ ] Connect Motion Canvas rendering to pipeline
- [ ] Add more animation scenes
- [ ] Test with real TTS

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
│   └── composition/       # Video assembly
│       └── composer.py    # FFmpeg-based composer
├── animations/            # Motion Canvas project
│   ├── src/scenes/        # Animation scenes
│   │   └── prefillDecode.tsx  # Prefill vs Decode animation
│   └── src/styles/        # Color palette, fonts
├── tests/                 # 95 passing tests
├── Dockerfile             # Container setup
└── output/                # Generated assets
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

1. **Render Motion Canvas animation** - Use npm run render to export the
   prefillDecode.tsx scene to video file

2. **Generate mock audio** - Use MockTTS to create placeholder audio files
   for each scene

3. **Compose final video** - Use VideoComposer to combine rendered animation
   with audio track

4. **Test full pipeline** - Verify the complete flow works end-to-end with
   mock data before enabling real APIs

5. **Enable real LLM API** - Switch from mock to Claude/OpenAI when ready
   for production content generation

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

---

*Last Updated: December 2024*
*Session: Phase 2 - First Video Generation*
