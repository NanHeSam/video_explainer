"""LLM Provider abstraction and implementations."""

import json
from abc import ABC, abstractmethod
from typing import Any

from ..config import Config, LLMConfig
from ..models import ContentAnalysis, Concept, Script, ScriptScene, VisualCue


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    def __init__(self, config: LLMConfig):
        self.config = config

    @abstractmethod
    def generate(self, prompt: str, system_prompt: str | None = None) -> str:
        """Generate a response from the LLM.

        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt

        Returns:
            The generated text response
        """
        pass

    @abstractmethod
    def generate_json(
        self, prompt: str, system_prompt: str | None = None
    ) -> dict[str, Any]:
        """Generate a JSON response from the LLM.

        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt

        Returns:
            Parsed JSON response as a dictionary
        """
        pass


class MockLLMProvider(LLMProvider):
    """Mock LLM provider that returns pre-computed responses for testing.

    This provider recognizes certain patterns in prompts and returns
    realistic responses for the LLM inference article content.
    """

    def generate(self, prompt: str, system_prompt: str | None = None) -> str:
        """Generate a mock response based on prompt patterns."""
        # For now, return a generic response
        # Specific responses are handled in generate_json for structured outputs
        return "This is a mock LLM response for testing purposes."

    def generate_json(
        self, prompt: str, system_prompt: str | None = None
    ) -> dict[str, Any]:
        """Generate mock JSON responses for known prompt patterns."""
        prompt_lower = prompt.lower()

        # Content analysis request
        if "analyze" in prompt_lower and ("content" in prompt_lower or "document" in prompt_lower):
            return self._mock_content_analysis()

        # Storyboard generation request - check BEFORE script to avoid false match
        # (storyboard prompts contain "Visual Cue from Script" which would match script check)
        if "storyboard" in prompt_lower or "scene id:" in prompt_lower:
            return self._mock_storyboard_generation(prompt)

        # Script generation request
        if "script" in prompt_lower and ("generate" in prompt_lower or "create" in prompt_lower):
            return self._mock_script_generation()

        # Default empty response
        return {}

    def _mock_content_analysis(self) -> dict[str, Any]:
        """Return mock content analysis for LLM inference article."""
        return {
            "core_thesis": "LLM inference can be optimized from 40 to 3,500+ tokens/second through KV caching, continuous batching, and PagedAttention, because the decode phase is memory-bandwidth bound rather than compute bound.",
            "key_concepts": [
                {
                    "name": "Prefill Phase",
                    "explanation": "The initial phase where all input tokens are processed in parallel. This phase is compute-bound, fully utilizing GPU tensor cores for matrix multiplications.",
                    "complexity": 6,
                    "prerequisites": ["transformer architecture", "matrix multiplication"],
                    "analogies": ["Like reading an entire book before answering questions about it"],
                    "visual_potential": "high"
                },
                {
                    "name": "Decode Phase",
                    "explanation": "The autoregressive phase where output tokens are generated one at a time. Each token requires loading all model weights from memory, making it memory-bandwidth bound.",
                    "complexity": 7,
                    "prerequisites": ["prefill phase", "GPU memory architecture"],
                    "analogies": ["Like typing one letter at a time, waiting for each to appear before typing the next"],
                    "visual_potential": "high"
                },
                {
                    "name": "Attention Mechanism",
                    "explanation": "The operation that allows each token to 'look at' every other token using Query, Key, and Value vectors. Computes relevance scores via softmax(QK^T/√d)V.",
                    "complexity": 8,
                    "prerequisites": ["linear algebra", "softmax function"],
                    "analogies": ["Like a spotlight that can focus on multiple parts of a sentence at once to understand context"],
                    "visual_potential": "high"
                },
                {
                    "name": "KV Cache",
                    "explanation": "An optimization that stores computed Key and Value vectors for previous tokens, avoiding redundant recomputation during decode. Transforms O(n²) work to O(n).",
                    "complexity": 6,
                    "prerequisites": ["attention mechanism", "decode phase"],
                    "analogies": ["Like keeping notes instead of re-reading the entire book for each new question"],
                    "visual_potential": "high"
                },
                {
                    "name": "Memory Bandwidth Bottleneck",
                    "explanation": "The fundamental limitation in decode: we must load 14GB of weights for each token, but can only transfer 2TB/s on an A100, limiting us to ~140 tokens/second per sequence.",
                    "complexity": 7,
                    "prerequisites": ["GPU architecture", "arithmetic intensity"],
                    "analogies": ["Like a highway that can only carry so many cars, no matter how fast the cars can go"],
                    "visual_potential": "medium"
                }
            ],
            "target_audience": "Technical professionals interested in ML infrastructure, GPU programming, or AI systems",
            "suggested_duration_seconds": 240,
            "complexity_score": 7
        }

    def _mock_script_generation(self) -> dict[str, Any]:
        """Return mock script for the Prefill/Decode/KV Cache explanation."""
        return {
            "title": "How LLM Inference Actually Works: From 40 to 3,500 Tokens Per Second",
            "total_duration_seconds": 210,
            "source_document": "post.md",
            "scenes": [
                {
                    "scene_id": 1,
                    "scene_type": "hook",
                    "title": "The Speed Problem",
                    "voiceover": "Every time you send a message to ChatGPT, something remarkable happens. A neural network with billions of parameters generates a response, one token at a time. The naive approach? Forty tokens per second. What the best systems achieve? Over three thousand five hundred. This is how they do it.",
                    "visual_cue": {
                        "description": "Show a chat interface with tokens appearing slowly, then speed up dramatically",
                        "visual_type": "animation",
                        "elements": ["chat_bubble", "token_counter", "speed_indicator"],
                        "duration_seconds": 15.0
                    },
                    "duration_seconds": 15.0,
                    "notes": "Build intrigue with the 87x improvement"
                },
                {
                    "scene_id": 2,
                    "scene_type": "context",
                    "title": "The Two Phases",
                    "voiceover": "LLM inference has two distinct phases, and understanding them is the key to everything. The first is called prefill. When you send a prompt, the model processes all your input tokens in parallel, in one forward pass. This phase is compute-bound. The GPU's tensor cores are working at full capacity.",
                    "visual_cue": {
                        "description": "Split screen showing prefill: multiple tokens lighting up simultaneously, GPU utilization at 100%",
                        "visual_type": "animation",
                        "elements": ["token_grid", "gpu_utilization_bar", "parallel_arrows"],
                        "duration_seconds": 20.0
                    },
                    "duration_seconds": 20.0,
                    "notes": "Establish the parallel nature of prefill"
                },
                {
                    "scene_id": 3,
                    "scene_type": "explanation",
                    "title": "The Decode Bottleneck",
                    "voiceover": "Then comes decode, and everything changes. Now we generate tokens one at a time. For each single token, we must load the entire model, all fourteen gigabytes of weights, from GPU memory. On an A100 with two terabytes per second bandwidth, that's seven milliseconds minimum per token. The GPU sits mostly idle, waiting for data. We're not limited by compute. We're limited by memory bandwidth.",
                    "visual_cue": {
                        "description": "Show decode: single token lighting up, weights streaming from memory, GPU utilization dropping to ~5%, memory bandwidth bar full",
                        "visual_type": "animation",
                        "elements": ["single_token", "weight_stream", "gpu_bar_low", "memory_bar_high", "roofline_diagram"],
                        "duration_seconds": 30.0
                    },
                    "duration_seconds": 30.0,
                    "notes": "Key insight: memory-bound, not compute-bound"
                },
                {
                    "scene_id": 4,
                    "scene_type": "explanation",
                    "title": "Understanding Attention",
                    "voiceover": "To understand the solution, we need to understand attention. For each token, we compute three vectors: Query, Key, and Value. The Query asks 'what am I looking for?' The Key says 'what do I contain?' And the Value provides the actual information. Attention computes how much each token should focus on every other token, then aggregates the values accordingly.",
                    "visual_cue": {
                        "description": "Animated attention: show tokens, Q/K/V vectors emerging, attention matrix forming with softmax, values being weighted",
                        "visual_type": "animation",
                        "elements": ["tokens", "qkv_vectors", "attention_matrix", "softmax_highlight", "weighted_sum"],
                        "duration_seconds": 25.0
                    },
                    "duration_seconds": 25.0,
                    "notes": "Build up the attention mechanism visually"
                },
                {
                    "scene_id": 5,
                    "scene_type": "explanation",
                    "title": "The Redundancy Problem",
                    "voiceover": "Here's the problem with naive decode. To generate token one hundred, we need to compute attention over all previous tokens. That means computing Keys and Values for tokens one through ninety-nine, even though they haven't changed since we computed them before. The work grows quadratically. For a thousand-token response, we're doing five hundred thousand times more work than necessary.",
                    "visual_cue": {
                        "description": "Show growing computation: token counter climbing, work multiplying, O(n²) visualized as expanding grid",
                        "visual_type": "animation",
                        "elements": ["token_counter", "work_counter", "quadratic_grid", "waste_highlight"],
                        "duration_seconds": 25.0
                    },
                    "duration_seconds": 25.0,
                    "notes": "Make the waste viscerally clear"
                },
                {
                    "scene_id": 6,
                    "scene_type": "insight",
                    "title": "The KV Cache Solution",
                    "voiceover": "The solution is elegant: compute each Key and Value exactly once, then cache them. When we generate token one hundred, we only compute K and V for that new token, then look up the cached values for tokens one through ninety-nine. This transforms quadratic work into linear. We're no longer recomputing. We're just remembering.",
                    "visual_cue": {
                        "description": "Show KV cache growing: new K/V added to cache stack, lookup arrows to previous values, O(n²)→O(n) transformation",
                        "visual_type": "animation",
                        "elements": ["kv_cache_stack", "new_kv_entry", "lookup_arrows", "complexity_counter"],
                        "duration_seconds": 25.0
                    },
                    "duration_seconds": 25.0,
                    "notes": "The aha moment - caching eliminates redundancy"
                },
                {
                    "scene_id": 7,
                    "scene_type": "explanation",
                    "title": "How KV Cache Works",
                    "voiceover": "During decode, the new token's Query vector attends to all the cached Keys. We compute Q times K-transpose, apply softmax to get attention weights, then multiply by the cached Values. The cache lookup is essentially free, it's just a matrix multiply against tensors already in memory. No recomputation needed.",
                    "visual_cue": {
                        "description": "Technical diagram: Q vector querying K cache, attention weights visualized, V cache multiplication",
                        "visual_type": "animation",
                        "elements": ["q_vector", "k_cache", "attention_weights", "v_cache", "output_vector"],
                        "duration_seconds": 20.0
                    },
                    "duration_seconds": 20.0,
                    "notes": "Show the mechanics clearly"
                },
                {
                    "scene_id": 8,
                    "scene_type": "conclusion",
                    "title": "The Impact",
                    "voiceover": "This single optimization is always enabled in production systems. It's so fundamental that there's no off switch. Combined with other techniques like continuous batching and PagedAttention, we go from forty tokens per second to over thirty-five hundred. An eighty-seven times improvement. And it all starts with one insight: don't recompute what you can remember.",
                    "visual_cue": {
                        "description": "Before/after comparison: throughput bars rising from 40 to 3500, then fade to key insight text",
                        "visual_type": "animation",
                        "elements": ["throughput_comparison", "optimization_stack", "key_insight_text"],
                        "duration_seconds": 25.0
                    },
                    "duration_seconds": 25.0,
                    "notes": "End with the concrete improvement and memorable takeaway"
                }
            ]
        }

    def _mock_storyboard_generation(self, prompt: str = "") -> dict[str, Any]:
        """Return mock storyboard beats based on scene in prompt."""
        prompt_lower = prompt.lower()

        # Match scene by ID (formats: "Scene ID: 1", "scene_id=1", etc.)
        # or by scene title keywords
        if "scene id: 1" in prompt_lower or "scene_id=1" in prompt_lower or "the speed problem" in prompt_lower:
            return self._storyboard_scene_1_hook()
        elif "scene id: 2" in prompt_lower or "scene_id=2" in prompt_lower or "the two phases" in prompt_lower:
            return self._storyboard_scene_2_phases()
        elif "scene id: 3" in prompt_lower or "scene_id=3" in prompt_lower or "the decode bottleneck" in prompt_lower:
            return self._storyboard_scene_3_decode()
        elif "scene id: 4" in prompt_lower or "scene_id=4" in prompt_lower or "understanding attention" in prompt_lower:
            return self._storyboard_scene_4_attention()
        elif "scene id: 5" in prompt_lower or "scene_id=5" in prompt_lower or "the redundancy problem" in prompt_lower:
            return self._storyboard_scene_5_redundancy()
        elif "scene id: 6" in prompt_lower or "scene_id=6" in prompt_lower or "the kv cache solution" in prompt_lower:
            return self._storyboard_scene_6_kv_solution()
        elif "scene id: 7" in prompt_lower or "scene_id=7" in prompt_lower or "how kv cache works" in prompt_lower:
            return self._storyboard_scene_7_kv_mechanics()
        elif "scene id: 8" in prompt_lower or "scene_id=8" in prompt_lower or "the impact" in prompt_lower:
            return self._storyboard_scene_8_conclusion()

        # Fallback: try to extract scene number from prompt
        import re
        scene_match = re.search(r'scene\s*(?:id)?[:\s]*(\d+)', prompt_lower)
        if scene_match:
            scene_num = int(scene_match.group(1))
            scene_methods = {
                1: self._storyboard_scene_1_hook,
                2: self._storyboard_scene_2_phases,
                3: self._storyboard_scene_3_decode,
                4: self._storyboard_scene_4_attention,
                5: self._storyboard_scene_5_redundancy,
                6: self._storyboard_scene_6_kv_solution,
                7: self._storyboard_scene_7_kv_mechanics,
                8: self._storyboard_scene_8_conclusion,
            }
            if scene_num in scene_methods:
                return scene_methods[scene_num]()

        # Default fallback - return a simple beat
        return {
            "beats": [
                {
                    "id": "fallback_beat",
                    "start_seconds": 0,
                    "end_seconds": 10,
                    "voiceover": "Fallback content",
                    "elements": []
                }
            ]
        }

    def _storyboard_scene_1_hook(self) -> dict[str, Any]:
        """Scene 1: The Speed Problem - Hook (15s)."""
        return {
            "beats": [
                {
                    "id": "hook_intro",
                    "start_seconds": 0,
                    "end_seconds": 6,
                    "voiceover": "Every time you send a message to ChatGPT, something remarkable happens.",
                    "elements": [
                        {
                            "id": "title",
                            "component": "title_card",
                            "props": {
                                "title": "LLM Inference",
                                "subtitle": "How it actually works"
                            },
                            "position": {"x": "center", "y": "center"},
                            "enter": {"type": "fade", "duration_seconds": 0.8},
                            "exit": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 4}
                        }
                    ]
                },
                {
                    "id": "hook_speed_comparison",
                    "start_seconds": 6,
                    "end_seconds": 15,
                    "voiceover": "A neural network with billions of parameters generates a response, one token at a time. The naive approach? Forty tokens per second. What the best systems achieve? Over three thousand five hundred. This is how they do it.",
                    "elements": [
                        {
                            "id": "slow_tokens",
                            "component": "token_row",
                            "props": {
                                "tokens": ["The", "answer", "is"],
                                "mode": "decode",
                                "label": "NAIVE: 40 tok/s"
                            },
                            "position": {"x": "center", "y": 350},
                            "enter": {"type": "fade", "duration_seconds": 0.3},
                            "animations": [
                                {"action": "activate_sequential", "at_seconds": 6.5, "duration_seconds": 3, "params": {"delay_between": 1.0}}
                            ]
                        },
                        {
                            "id": "fast_tokens",
                            "component": "token_row",
                            "props": {
                                "tokens": ["The", "answer", "is", "forty", "two"],
                                "mode": "prefill",
                                "label": "OPTIMIZED: 3,500 tok/s"
                            },
                            "position": {"x": "center", "y": 650},
                            "enter": {"type": "fade", "duration_seconds": 0.3, "delay_seconds": 3},
                            "animations": [
                                {"action": "activate_all", "at_seconds": 10, "duration_seconds": 0.3}
                            ]
                        },
                        {
                            "id": "speedup_text",
                            "component": "text_reveal",
                            "props": {"text": "87x faster", "fontSize": 48},
                            "position": {"x": "center", "y": 850},
                            "enter": {"type": "scale", "duration_seconds": 0.4, "delay_seconds": 5}
                        }
                    ],
                    "sync_points": [
                        {"trigger_word": "forty", "trigger_seconds": 8.5, "target": "slow_tokens", "action": "highlight"},
                        {"trigger_word": "three thousand", "trigger_seconds": 11, "target": "fast_tokens", "action": "activate_all"}
                    ]
                }
            ]
        }

    def _storyboard_scene_2_phases(self) -> dict[str, Any]:
        """Scene 2: The Two Phases (20s)."""
        return {
            "beats": [
                {
                    "id": "phases_intro",
                    "start_seconds": 15,
                    "end_seconds": 22,
                    "voiceover": "LLM inference has two distinct phases, and understanding them is the key to everything.",
                    "elements": [
                        {
                            "id": "phase_title",
                            "component": "text_reveal",
                            "props": {"text": "Two Phases of Inference", "fontSize": 36},
                            "position": {"x": "center", "y": 150},
                            "enter": {"type": "fade", "duration_seconds": 0.5}
                        }
                    ]
                },
                {
                    "id": "prefill_explanation",
                    "start_seconds": 22,
                    "end_seconds": 35,
                    "voiceover": "The first is called prefill. When you send a prompt, the model processes all your input tokens in parallel, in one forward pass. This phase is compute-bound. The GPU's tensor cores are working at full capacity.",
                    "elements": [
                        {
                            "id": "prefill_tokens",
                            "component": "token_row",
                            "props": {
                                "tokens": ["Explain", "quantum", "computing", "in", "simple", "terms"],
                                "mode": "prefill",
                                "label": "PREFILL PHASE"
                            },
                            "position": {"x": "center", "y": 400},
                            "enter": {"type": "fade", "duration_seconds": 0.5},
                            "animations": [
                                {"action": "activate_all", "at_seconds": 25, "duration_seconds": 0.5}
                            ]
                        },
                        {
                            "id": "gpu_prefill",
                            "component": "gpu_gauge",
                            "props": {
                                "utilization": 95,
                                "status": "compute",
                                "label": "GPU Compute",
                                "showPercentage": True
                            },
                            "position": {"x": "center", "y": 650},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 2},
                            "animations": [
                                {"action": "fill", "at_seconds": 27, "duration_seconds": 1.5, "easing": "ease-out"}
                            ]
                        }
                    ],
                    "sync_points": [
                        {"trigger_word": "parallel", "trigger_seconds": 26, "target": "prefill_tokens", "action": "activate_all"},
                        {"trigger_word": "full capacity", "trigger_seconds": 33, "target": "gpu_prefill", "action": "pulse"}
                    ]
                }
            ]
        }

    def _storyboard_scene_3_decode(self) -> dict[str, Any]:
        """Scene 3: The Decode Bottleneck (30s)."""
        return {
            "beats": [
                {
                    "id": "decode_intro",
                    "start_seconds": 35,
                    "end_seconds": 45,
                    "voiceover": "Then comes decode, and everything changes. Now we generate tokens one at a time.",
                    "elements": [
                        {
                            "id": "decode_tokens",
                            "component": "token_row",
                            "props": {
                                "tokens": ["Quantum", "computing", "is", "a", "type", "of"],
                                "mode": "decode",
                                "label": "DECODE PHASE"
                            },
                            "position": {"x": "center", "y": 400},
                            "enter": {"type": "fade", "duration_seconds": 0.5},
                            "animations": [
                                {"action": "activate_sequential", "at_seconds": 37, "duration_seconds": 8, "params": {"delay_between": 1.2}}
                            ]
                        }
                    ]
                },
                {
                    "id": "memory_bottleneck",
                    "start_seconds": 45,
                    "end_seconds": 55,
                    "voiceover": "For each single token, we must load the entire model, all fourteen gigabytes of weights, from GPU memory. On an A100 with two terabytes per second bandwidth, that's seven milliseconds minimum per token.",
                    "elements": [
                        {
                            "id": "weight_counter",
                            "component": "text_reveal",
                            "props": {"text": "14 GB weights per token", "fontSize": 28},
                            "position": {"x": "center", "y": 250},
                            "enter": {"type": "fade", "duration_seconds": 0.5}
                        },
                        {
                            "id": "memory_bar",
                            "component": "progress_bar",
                            "props": {
                                "label": "Memory Bandwidth",
                                "percentage": 100,
                                "color": "#ff6b35"
                            },
                            "position": {"x": "center", "y": 600},
                            "enter": {"type": "fade", "duration_seconds": 0.5},
                            "animations": [
                                {"action": "fill", "at_seconds": 47, "duration_seconds": 2}
                            ]
                        }
                    ]
                },
                {
                    "id": "gpu_idle",
                    "start_seconds": 55,
                    "end_seconds": 65,
                    "voiceover": "The GPU sits mostly idle, waiting for data. We're not limited by compute. We're limited by memory bandwidth.",
                    "elements": [
                        {
                            "id": "gpu_decode",
                            "component": "gpu_gauge",
                            "props": {
                                "utilization": 5,
                                "status": "memory",
                                "label": "GPU Compute",
                                "showPercentage": True
                            },
                            "position": {"x": "center", "y": 500},
                            "enter": {"type": "fade", "duration_seconds": 0.5},
                            "animations": [
                                {"action": "fill", "at_seconds": 56, "duration_seconds": 1.5}
                            ]
                        },
                        {
                            "id": "bottleneck_text",
                            "component": "text_reveal",
                            "props": {"text": "Memory-Bound, Not Compute-Bound", "fontSize": 32},
                            "position": {"x": "center", "y": 750},
                            "enter": {"type": "scale", "duration_seconds": 0.5, "delay_seconds": 3}
                        }
                    ],
                    "sync_points": [
                        {"trigger_word": "memory bandwidth", "trigger_seconds": 63, "target": "bottleneck_text", "action": "highlight"}
                    ]
                }
            ]
        }

    def _storyboard_scene_4_attention(self) -> dict[str, Any]:
        """Scene 4: Understanding Attention (25s)."""
        return {
            "beats": [
                {
                    "id": "attention_intro",
                    "start_seconds": 65,
                    "end_seconds": 75,
                    "voiceover": "To understand the solution, we need to understand attention. For each token, we compute three vectors: Query, Key, and Value.",
                    "elements": [
                        {
                            "id": "attention_title",
                            "component": "text_reveal",
                            "props": {"text": "The Attention Mechanism", "fontSize": 36},
                            "position": {"x": "center", "y": 120},
                            "enter": {"type": "fade", "duration_seconds": 0.5}
                        },
                        {
                            "id": "token_example",
                            "component": "token_row",
                            "props": {
                                "tokens": ["The", "cat", "sat"],
                                "mode": "inactive",
                                "label": "Input Tokens"
                            },
                            "position": {"x": "center", "y": 300},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 1}
                        },
                        {
                            "id": "qkv_labels",
                            "component": "text_reveal",
                            "props": {"text": "Q  K  V", "fontSize": 48},
                            "position": {"x": "center", "y": 500},
                            "enter": {"type": "scale", "duration_seconds": 0.5, "delay_seconds": 3}
                        }
                    ]
                },
                {
                    "id": "attention_meaning",
                    "start_seconds": 75,
                    "end_seconds": 90,
                    "voiceover": "The Query asks 'what am I looking for?' The Key says 'what do I contain?' And the Value provides the actual information. Attention computes how much each token should focus on every other token, then aggregates the values accordingly.",
                    "elements": [
                        {
                            "id": "query_text",
                            "component": "text_reveal",
                            "props": {"text": "Query: \"What am I looking for?\"", "fontSize": 24},
                            "position": {"x": "center", "y": 350},
                            "enter": {"type": "slide", "duration_seconds": 0.4}
                        },
                        {
                            "id": "key_text",
                            "component": "text_reveal",
                            "props": {"text": "Key: \"What do I contain?\"", "fontSize": 24},
                            "position": {"x": "center", "y": 450},
                            "enter": {"type": "slide", "duration_seconds": 0.4, "delay_seconds": 2}
                        },
                        {
                            "id": "value_text",
                            "component": "text_reveal",
                            "props": {"text": "Value: \"Here's my information\"", "fontSize": 24},
                            "position": {"x": "center", "y": 550},
                            "enter": {"type": "slide", "duration_seconds": 0.4, "delay_seconds": 4}
                        },
                        {
                            "id": "formula",
                            "component": "text_reveal",
                            "props": {"text": "Attention = softmax(QK^T / √d) × V", "fontSize": 28},
                            "position": {"x": "center", "y": 750},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 8}
                        }
                    ]
                }
            ]
        }

    def _storyboard_scene_5_redundancy(self) -> dict[str, Any]:
        """Scene 5: The Redundancy Problem (25s)."""
        return {
            "beats": [
                {
                    "id": "redundancy_intro",
                    "start_seconds": 90,
                    "end_seconds": 102,
                    "voiceover": "Here's the problem with naive decode. To generate token one hundred, we need to compute attention over all previous tokens. That means computing Keys and Values for tokens one through ninety-nine, even though they haven't changed since we computed them before.",
                    "elements": [
                        {
                            "id": "token_counter",
                            "component": "text_reveal",
                            "props": {"text": "Generating token #100", "fontSize": 32},
                            "position": {"x": "center", "y": 200},
                            "enter": {"type": "fade", "duration_seconds": 0.5}
                        },
                        {
                            "id": "recompute_tokens",
                            "component": "token_row",
                            "props": {
                                "tokens": ["1", "2", "3", "...", "98", "99", "100"],
                                "mode": "decode",
                                "label": "Recomputing K,V for ALL"
                            },
                            "position": {"x": "center", "y": 450},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 2},
                            "animations": [
                                {"action": "activate_sequential", "at_seconds": 94, "duration_seconds": 6, "params": {"delay_between": 0.8}}
                            ]
                        }
                    ]
                },
                {
                    "id": "quadratic_waste",
                    "start_seconds": 102,
                    "end_seconds": 115,
                    "voiceover": "The work grows quadratically. For a thousand-token response, we're doing five hundred thousand times more work than necessary.",
                    "elements": [
                        {
                            "id": "complexity_label",
                            "component": "text_reveal",
                            "props": {"text": "O(n²) Complexity", "fontSize": 48},
                            "position": {"x": "center", "y": 300},
                            "enter": {"type": "scale", "duration_seconds": 0.5}
                        },
                        {
                            "id": "waste_counter",
                            "component": "text_reveal",
                            "props": {"text": "500,000x wasted computation", "fontSize": 36},
                            "position": {"x": "center", "y": 500},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 3}
                        },
                        {
                            "id": "waste_bar",
                            "component": "progress_bar",
                            "props": {
                                "label": "Redundant Work",
                                "percentage": 99,
                                "color": "#ff4757"
                            },
                            "position": {"x": "center", "y": 700},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 5},
                            "animations": [
                                {"action": "fill", "at_seconds": 109, "duration_seconds": 2}
                            ]
                        }
                    ]
                }
            ]
        }

    def _storyboard_scene_6_kv_solution(self) -> dict[str, Any]:
        """Scene 6: The KV Cache Solution (25s)."""
        return {
            "beats": [
                {
                    "id": "solution_intro",
                    "start_seconds": 115,
                    "end_seconds": 128,
                    "voiceover": "The solution is elegant: compute each Key and Value exactly once, then cache them. When we generate token one hundred, we only compute K and V for that new token, then look up the cached values for tokens one through ninety-nine.",
                    "elements": [
                        {
                            "id": "solution_title",
                            "component": "text_reveal",
                            "props": {"text": "The KV Cache", "fontSize": 48},
                            "position": {"x": "center", "y": 150},
                            "enter": {"type": "scale", "duration_seconds": 0.5}
                        },
                        {
                            "id": "cache_visual",
                            "component": "token_row",
                            "props": {
                                "tokens": ["K₁V₁", "K₂V₂", "K₃V₃", "...", "K₉₉V₉₉"],
                                "mode": "prefill",
                                "label": "CACHED (computed once)"
                            },
                            "position": {"x": "center", "y": 400},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 2},
                            "animations": [
                                {"action": "activate_all", "at_seconds": 119, "duration_seconds": 0.5}
                            ]
                        },
                        {
                            "id": "new_token",
                            "component": "token_row",
                            "props": {
                                "tokens": ["K₁₀₀V₁₀₀"],
                                "mode": "decode",
                                "label": "NEW (compute only this)"
                            },
                            "position": {"x": "center", "y": 600},
                            "enter": {"type": "slide", "duration_seconds": 0.5, "delay_seconds": 5},
                            "animations": [
                                {"action": "activate_sequential", "at_seconds": 124, "duration_seconds": 1}
                            ]
                        }
                    ]
                },
                {
                    "id": "linear_improvement",
                    "start_seconds": 128,
                    "end_seconds": 140,
                    "voiceover": "This transforms quadratic work into linear. We're no longer recomputing. We're just remembering.",
                    "elements": [
                        {
                            "id": "complexity_change",
                            "component": "text_reveal",
                            "props": {"text": "O(n²) → O(n)", "fontSize": 64},
                            "position": {"x": "center", "y": 350},
                            "enter": {"type": "scale", "duration_seconds": 0.6}
                        },
                        {
                            "id": "insight_text",
                            "component": "text_reveal",
                            "props": {"text": "Don't recompute. Remember.", "fontSize": 36},
                            "position": {"x": "center", "y": 550},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 3}
                        }
                    ],
                    "sync_points": [
                        {"trigger_word": "remembering", "trigger_seconds": 138, "target": "insight_text", "action": "highlight"}
                    ]
                }
            ]
        }

    def _storyboard_scene_7_kv_mechanics(self) -> dict[str, Any]:
        """Scene 7: How KV Cache Works (20s)."""
        return {
            "beats": [
                {
                    "id": "mechanics_explanation",
                    "start_seconds": 140,
                    "end_seconds": 160,
                    "voiceover": "During decode, the new token's Query vector attends to all the cached Keys. We compute Q times K-transpose, apply softmax to get attention weights, then multiply by the cached Values. The cache lookup is essentially free, it's just a matrix multiply against tensors already in memory. No recomputation needed.",
                    "elements": [
                        {
                            "id": "mechanics_title",
                            "component": "text_reveal",
                            "props": {"text": "How It Works", "fontSize": 36},
                            "position": {"x": "center", "y": 120},
                            "enter": {"type": "fade", "duration_seconds": 0.5}
                        },
                        {
                            "id": "step1",
                            "component": "text_reveal",
                            "props": {"text": "1. New token → Query vector", "fontSize": 24},
                            "position": {"x": "center", "y": 300},
                            "enter": {"type": "slide", "duration_seconds": 0.4, "delay_seconds": 1}
                        },
                        {
                            "id": "step2",
                            "component": "text_reveal",
                            "props": {"text": "2. Query × Cached Keys → Attention scores", "fontSize": 24},
                            "position": {"x": "center", "y": 400},
                            "enter": {"type": "slide", "duration_seconds": 0.4, "delay_seconds": 4}
                        },
                        {
                            "id": "step3",
                            "component": "text_reveal",
                            "props": {"text": "3. Softmax → Attention weights", "fontSize": 24},
                            "position": {"x": "center", "y": 500},
                            "enter": {"type": "slide", "duration_seconds": 0.4, "delay_seconds": 7}
                        },
                        {
                            "id": "step4",
                            "component": "text_reveal",
                            "props": {"text": "4. Weights × Cached Values → Output", "fontSize": 24},
                            "position": {"x": "center", "y": 600},
                            "enter": {"type": "slide", "duration_seconds": 0.4, "delay_seconds": 10}
                        },
                        {
                            "id": "free_label",
                            "component": "text_reveal",
                            "props": {"text": "Cache lookup: essentially free!", "fontSize": 28},
                            "position": {"x": "center", "y": 780},
                            "enter": {"type": "scale", "duration_seconds": 0.5, "delay_seconds": 14}
                        }
                    ]
                }
            ]
        }

    def _storyboard_scene_8_conclusion(self) -> dict[str, Any]:
        """Scene 8: The Impact - Conclusion (25s)."""
        return {
            "beats": [
                {
                    "id": "impact_stats",
                    "start_seconds": 160,
                    "end_seconds": 175,
                    "voiceover": "This single optimization is always enabled in production systems. It's so fundamental that there's no off switch. Combined with other techniques like continuous batching and PagedAttention, we go from forty tokens per second to over thirty-five hundred.",
                    "elements": [
                        {
                            "id": "before_bar",
                            "component": "gpu_gauge",
                            "props": {
                                "utilization": 3,
                                "status": "memory",
                                "label": "Before: 40 tok/s"
                            },
                            "position": {"x": 600, "y": 400},
                            "enter": {"type": "fade", "duration_seconds": 0.5},
                            "animations": [
                                {"action": "fill", "at_seconds": 162, "duration_seconds": 1}
                            ]
                        },
                        {
                            "id": "after_bar",
                            "component": "gpu_gauge",
                            "props": {
                                "utilization": 95,
                                "status": "compute",
                                "label": "After: 3,500 tok/s"
                            },
                            "position": {"x": 1320, "y": 400},
                            "enter": {"type": "fade", "duration_seconds": 0.5, "delay_seconds": 3},
                            "animations": [
                                {"action": "fill", "at_seconds": 168, "duration_seconds": 2, "easing": "ease-out"}
                            ]
                        },
                        {
                            "id": "improvement_text",
                            "component": "text_reveal",
                            "props": {"text": "87× Improvement", "fontSize": 48},
                            "position": {"x": "center", "y": 650},
                            "enter": {"type": "scale", "duration_seconds": 0.5, "delay_seconds": 8}
                        }
                    ]
                },
                {
                    "id": "takeaway",
                    "start_seconds": 175,
                    "end_seconds": 185,
                    "voiceover": "An eighty-seven times improvement. And it all starts with one insight: don't recompute what you can remember.",
                    "elements": [
                        {
                            "id": "final_insight",
                            "component": "title_card",
                            "props": {
                                "title": "Don't recompute",
                                "subtitle": "what you can remember"
                            },
                            "position": {"x": "center", "y": "center"},
                            "enter": {"type": "fade", "duration_seconds": 1}
                        }
                    ],
                    "sync_points": [
                        {"trigger_word": "remember", "trigger_seconds": 183, "target": "final_insight", "action": "pulse"}
                    ]
                }
            ]
        }


class AnthropicProvider(LLMProvider):
    """Anthropic Claude API provider (placeholder)."""

    def generate(self, prompt: str, system_prompt: str | None = None) -> str:
        raise NotImplementedError("Anthropic provider not yet implemented")

    def generate_json(
        self, prompt: str, system_prompt: str | None = None
    ) -> dict[str, Any]:
        raise NotImplementedError("Anthropic provider not yet implemented")


class OpenAIProvider(LLMProvider):
    """OpenAI API provider (placeholder)."""

    def generate(self, prompt: str, system_prompt: str | None = None) -> str:
        raise NotImplementedError("OpenAI provider not yet implemented")

    def generate_json(
        self, prompt: str, system_prompt: str | None = None
    ) -> dict[str, Any]:
        raise NotImplementedError("OpenAI provider not yet implemented")


def get_llm_provider(config: Config | None = None) -> LLMProvider:
    """Get the appropriate LLM provider based on configuration.

    Args:
        config: Configuration object. If None, uses default config.

    Returns:
        An LLM provider instance
    """
    if config is None:
        from ..config import load_config
        config = load_config()

    provider_name = config.llm.provider.lower()

    if provider_name == "mock":
        return MockLLMProvider(config.llm)
    elif provider_name == "anthropic":
        return AnthropicProvider(config.llm)
    elif provider_name == "openai":
        return OpenAIProvider(config.llm)
    else:
        raise ValueError(f"Unknown LLM provider: {provider_name}")
