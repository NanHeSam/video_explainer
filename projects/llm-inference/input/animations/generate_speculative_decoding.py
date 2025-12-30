#!/usr/bin/env python3
"""
Generate an animated GIF showing Speculative Decoding.
Shows draft model speculation + large model verification.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.animation import FuncAnimation, PillowWriter

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Helvetica Neue', 'Arial', 'sans-serif'],
    'font.size': 11,
    'axes.linewidth': 0,
    'figure.facecolor': '#FAFAFA',
    'axes.facecolor': '#FAFAFA',
})

BG_COLOR = '#FAFAFA'
TEXT_COLOR = '#1a1a1a'
TEXT_MUTED = '#666666'
ACCENT = '#2563EB'
DRAFT_COLOR = '#8B5CF6'  # Purple for draft model
TARGET_COLOR = '#2563EB'  # Blue for target model
ACCEPT_COLOR = '#10B981'  # Green for accepted
REJECT_COLOR = '#EF4444'  # Red for rejected
PENDING_COLOR = '#F59E0B'  # Amber for pending


class SpeculativeDecodingAnimation:
    def __init__(self):
        self.fig = plt.figure(figsize=(12, 7), facecolor=BG_COLOR)
        # Example sequence
        self.prompt = "The quick brown"
        self.draft_tokens = ['fox', 'jumps', 'over', 'the']
        self.target_tokens = ['fox', 'jumped', 'over', 'a']  # 2 match, 2 reject
        self.final_output = ['fox', 'jumped']  # Accept up to first rejection + 1

    def create_frames(self):
        frames = []

        # Title
        for _ in range(4):
            frames.append(('title',))

        # Problem: Sequential decoding
        for _ in range(3):
            frames.append(('sequential_title',))

        for _ in range(4):
            frames.append(('sequential_problem',))

        # Solution intro
        for _ in range(3):
            frames.append(('speculative_title',))

        # Step 1: Draft model generates k tokens
        for _ in range(4):
            frames.append(('draft_generate',))

        # Step 2: Target model verifies in parallel
        for _ in range(4):
            frames.append(('verify',))

        # Step 3: Accept/reject decisions
        for _ in range(4):
            frames.append(('accept_reject',))

        # Step 4: Show accepted tokens
        for _ in range(4):
            frames.append(('result',))

        # Why it works
        for _ in range(4):
            frames.append(('why_works',))

        # Summary
        for _ in range(5):
            frames.append(('summary',))

        return frames

    def draw_sequential_problem(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Traditional Autoregressive Decoding', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)

        # Show sequential token generation
        tokens = ['The', 'quick', 'brown', 'fox', 'jumps', '...']
        y = 6.5

        ax.text(1, y + 1, 'Large Model (70B params)', fontsize=11,
               color=TARGET_COLOR, fontweight='bold')

        for i, token in enumerate(tokens):
            x = 1 + i * 1.7
            rect = patches.FancyBboxPatch(
                (x, y - 0.3), 1.4, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=TARGET_COLOR, alpha=0.7
            )
            ax.add_patch(rect)
            ax.text(x + 0.7, y, token, ha='center', va='center',
                   fontsize=10, color='white', fontweight='medium')

            # Arrow to next
            if i < len(tokens) - 1:
                ax.annotate('', xy=(x + 1.6, y), xytext=(x + 1.4, y),
                           arrowprops=dict(arrowstyle='->', color=TEXT_MUTED, lw=1))

        # Time indicators
        ax.text(6, 4.5, 'Each token requires full forward pass', ha='center',
               fontsize=11, color=TEXT_MUTED)

        # Time blocks
        for i in range(5):
            x = 1.5 + i * 2
            rect = patches.FancyBboxPatch(
                (x, 3), 1.5, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=REJECT_COLOR, alpha=0.2,
                edgecolor=REJECT_COLOR, linewidth=1
            )
            ax.add_patch(rect)
            ax.text(x + 0.75, 3.3, f't={i+1}', ha='center', va='center',
                   fontsize=9, color=REJECT_COLOR)

        ax.text(6, 2, 'Time', ha='center', fontsize=11, color=TEXT_MUTED)
        ax.annotate('', xy=(11, 2.5), xytext=(1, 2.5),
                   arrowprops=dict(arrowstyle='->', color=TEXT_MUTED, lw=1.5))

        ax.text(6, 0.8, 'Sequential -> Slow! 5 tokens = 5 forward passes',
               ha='center', fontsize=12, color=REJECT_COLOR, fontweight='medium')

    def draw_draft_generate(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Step 1: Draft Model Generates Quickly', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)

        # Prompt
        prompt_y = 7
        ax.text(1, prompt_y + 0.7, 'Prompt:', fontsize=10, color=TEXT_MUTED)
        prompt_rect = patches.FancyBboxPatch(
            (1, prompt_y - 0.3), 3.5, 0.6,
            boxstyle="round,pad=0.02",
            facecolor='#E5E5E5', alpha=0.5
        )
        ax.add_patch(prompt_rect)
        ax.text(2.75, prompt_y, self.prompt, ha='center', va='center',
               fontsize=11, color=TEXT_COLOR)

        # Draft model
        draft_y = 5
        ax.text(1, draft_y + 1.2, 'Draft Model (7B params)', fontsize=11,
               color=DRAFT_COLOR, fontweight='bold')
        ax.text(1, draft_y + 0.7, 'Fast but less accurate', fontsize=9,
               color=TEXT_MUTED)

        for i, token in enumerate(self.draft_tokens):
            x = 1 + i * 2.2
            rect = patches.FancyBboxPatch(
                (x, draft_y - 0.3), 1.8, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=DRAFT_COLOR, alpha=0.7
            )
            ax.add_patch(rect)
            ax.text(x + 0.9, draft_y, token, ha='center', va='center',
                   fontsize=10, color='white', fontweight='medium')

        # Time indicator
        ax.text(6, 3, 'All 4 tokens generated in ~1 large model step!', ha='center',
               fontsize=11, color=DRAFT_COLOR, fontweight='medium')

        # Speed comparison
        time_y = 1.5
        ax.text(1, time_y, 'Time cost:', fontsize=10, color=TEXT_MUTED)

        # Small time block
        rect = patches.FancyBboxPatch(
            (3, time_y - 0.25), 1.5, 0.5,
            boxstyle="round,pad=0.02",
            facecolor=DRAFT_COLOR, alpha=0.3
        )
        ax.add_patch(rect)
        ax.text(5, time_y, '~0.2x of large model', ha='left', fontsize=10,
               color=TEXT_MUTED)

    def draw_verify(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Step 2: Target Model Verifies in Parallel', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)

        # Draft tokens
        draft_y = 7
        ax.text(1, draft_y + 0.7, 'Draft predictions:', fontsize=10, color=DRAFT_COLOR)
        for i, token in enumerate(self.draft_tokens):
            x = 1 + i * 2.2
            rect = patches.FancyBboxPatch(
                (x, draft_y - 0.3), 1.8, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=DRAFT_COLOR, alpha=0.5
            )
            ax.add_patch(rect)
            ax.text(x + 0.9, draft_y, token, ha='center', va='center',
                   fontsize=10, color='white', fontweight='medium')

        # Arrows down
        for i in range(4):
            x = 1.9 + i * 2.2
            ax.annotate('', xy=(x, 5.5), xytext=(x, 6.5),
                       arrowprops=dict(arrowstyle='->', color=TEXT_MUTED, lw=1.5))

        # Target model verification (parallel!)
        target_y = 5
        ax.text(1, target_y + 0.7, 'Target model (parallel verification):', fontsize=10,
               color=TARGET_COLOR)

        for i, token in enumerate(self.target_tokens):
            x = 1 + i * 2.2
            rect = patches.FancyBboxPatch(
                (x, target_y - 0.3), 1.8, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=TARGET_COLOR, alpha=0.7
            )
            ax.add_patch(rect)
            ax.text(x + 0.9, target_y, token, ha='center', va='center',
                   fontsize=10, color='white', fontweight='medium')

        # Key insight
        ax.text(6, 3, 'Key: All positions verified in ONE forward pass!', ha='center',
               fontsize=12, color=ACCEPT_COLOR, fontweight='bold')

        ax.text(6, 2, 'Same compute as generating 1 token', ha='center',
               fontsize=11, color=TEXT_MUTED)

        # Bracket showing parallel
        bracket_left = 0.8
        bracket_right = 9.5
        bracket_y = 4.2
        ax.plot([bracket_left, bracket_left], [bracket_y, bracket_y - 0.3],
               color=TARGET_COLOR, lw=2)
        ax.plot([bracket_left, bracket_right], [bracket_y - 0.3, bracket_y - 0.3],
               color=TARGET_COLOR, lw=2)
        ax.plot([bracket_right, bracket_right], [bracket_y, bracket_y - 0.3],
               color=TARGET_COLOR, lw=2)

    def draw_accept_reject(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Step 3: Compare and Accept/Reject', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)

        # Comparison table
        y_start = 7
        headers = ['Position', 'Draft', 'Target', 'Match?']
        col_x = [1.5, 3.5, 5.5, 7.5]

        # Header row
        for x, h in zip(col_x, headers):
            rect = patches.FancyBboxPatch(
                (x - 0.7, y_start), 1.4, 0.5,
                boxstyle="round,pad=0.01",
                facecolor=ACCENT, alpha=0.8
            )
            ax.add_patch(rect)
            ax.text(x, y_start + 0.25, h, ha='center', va='center',
                   fontsize=10, color='white', fontweight='bold')

        # Data rows
        comparisons = [
            (1, 'fox', 'fox', True),
            (2, 'jumps', 'jumped', False),
            (3, 'over', 'over', None),  # Not checked after reject
            (4, 'the', 'a', None),  # Not checked after reject
        ]

        for i, (pos, draft, target, match) in enumerate(comparisons):
            y = y_start - 0.8 - i * 0.7

            # Position
            ax.text(col_x[0], y + 0.2, str(pos), ha='center', va='center',
                   fontsize=10, color=TEXT_COLOR)

            # Draft
            color = DRAFT_COLOR if match is not None else TEXT_MUTED
            alpha = 0.7 if match is not None else 0.3
            rect = patches.FancyBboxPatch(
                (col_x[1] - 0.6, y), 1.2, 0.4,
                boxstyle="round,pad=0.01",
                facecolor=color, alpha=alpha
            )
            ax.add_patch(rect)
            ax.text(col_x[1], y + 0.2, draft, ha='center', va='center',
                   fontsize=9, color='white' if match is not None else TEXT_MUTED)

            # Target
            rect = patches.FancyBboxPatch(
                (col_x[2] - 0.6, y), 1.2, 0.4,
                boxstyle="round,pad=0.01",
                facecolor=TARGET_COLOR if match is not None else TEXT_MUTED,
                alpha=0.7 if match is not None else 0.3
            )
            ax.add_patch(rect)
            ax.text(col_x[2], y + 0.2, target, ha='center', va='center',
                   fontsize=9, color='white' if match is not None else TEXT_MUTED)

            # Match indicator
            if match is True:
                ax.text(col_x[3], y + 0.2, 'ACCEPT', ha='center', va='center',
                       fontsize=9, color=ACCEPT_COLOR, fontweight='bold')
            elif match is False:
                ax.text(col_x[3], y + 0.2, 'REJECT', ha='center', va='center',
                       fontsize=9, color=REJECT_COLOR, fontweight='bold')
            else:
                ax.text(col_x[3], y + 0.2, '(skip)', ha='center', va='center',
                       fontsize=9, color=TEXT_MUTED)

        # Explanation
        ax.text(6, 2.5, 'Accept tokens until first rejection', ha='center',
               fontsize=12, color=TEXT_COLOR, fontweight='medium')
        ax.text(6, 1.8, 'Then use target model\'s token at rejection point', ha='center',
               fontsize=11, color=TEXT_MUTED)

    def draw_result(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Result: 2 Tokens in 1 Forward Pass!', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)

        # Original prompt
        y = 7
        ax.text(1, y + 0.5, 'Input:', fontsize=10, color=TEXT_MUTED)
        prompt_rect = patches.FancyBboxPatch(
            (1, y - 0.3), 3.5, 0.6,
            boxstyle="round,pad=0.02",
            facecolor='#E5E5E5', alpha=0.5
        )
        ax.add_patch(prompt_rect)
        ax.text(2.75, y, self.prompt, ha='center', va='center',
               fontsize=11, color=TEXT_COLOR)

        # Accepted tokens
        ax.text(5, y + 0.5, '+', fontsize=14, color=TEXT_MUTED)
        accepted_x = 5.5
        for i, token in enumerate(self.final_output):
            x = accepted_x + i * 2
            rect = patches.FancyBboxPatch(
                (x, y - 0.3), 1.6, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=ACCEPT_COLOR, alpha=0.7
            )
            ax.add_patch(rect)
            ax.text(x + 0.8, y, token, ha='center', va='center',
                   fontsize=11, color='white', fontweight='bold')

        # Comparison
        ax.text(6, 5, 'Traditional: 2 forward passes for 2 tokens', ha='center',
               fontsize=11, color=TEXT_MUTED)
        ax.text(6, 4.3, 'Speculative: 1 target + 1 draft pass for 2 tokens', ha='center',
               fontsize=11, color=ACCEPT_COLOR, fontweight='medium')

        # Speedup calculation
        calc_y = 2.5
        ax.text(3, calc_y + 0.8, 'Speedup calculation:', fontsize=11,
               color=TEXT_COLOR, fontweight='bold')
        ax.text(3, calc_y, 'Draft cost: ~0.2x target', fontsize=10, color=TEXT_MUTED)
        ax.text(3, calc_y - 0.5, 'Total cost: 1.2x target', fontsize=10, color=TEXT_MUTED)
        ax.text(3, calc_y - 1, 'Tokens generated: 2', fontsize=10, color=TEXT_MUTED)
        ax.text(3, calc_y - 1.5, 'Effective speedup: ~1.7x', fontsize=11,
               color=ACCEPT_COLOR, fontweight='bold')

    def draw_why_works(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 9, 'Why Does This Work?', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Key insight
        ax.text(5, 7.5, 'Most tokens are predictable!', ha='center',
               fontsize=14, color=ACCENT, fontweight='bold')

        # Examples
        examples = [
            ('"The Eiffel ___"', 'Tower', 'Very predictable'),
            ('"She said, ___"', '"hello"', 'Common pattern'),
            ('"import numpy as ___"', 'np', 'Code conventions'),
        ]

        for i, (context, predicted, reason) in enumerate(examples):
            y = 5.5 - i * 1.3
            ax.text(1.5, y, context, fontsize=11, color=TEXT_MUTED)
            rect = patches.FancyBboxPatch(
                (5.5, y - 0.25), 1.5, 0.5,
                boxstyle="round,pad=0.02",
                facecolor=ACCEPT_COLOR, alpha=0.6
            )
            ax.add_patch(rect)
            ax.text(6.25, y, predicted, ha='center', va='center',
                   fontsize=10, color='white', fontweight='medium')
            ax.text(7.5, y, reason, fontsize=9, color=TEXT_MUTED)

        # Acceptance rate
        ax.text(5, 1.5, 'Typical acceptance rate: 70-90%', ha='center',
               fontsize=12, color=TEXT_COLOR, fontweight='medium')
        ax.text(5, 0.8, 'Even small draft models predict well for common patterns', ha='center',
               fontsize=10, color=TEXT_MUTED)

    def draw_summary(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 8.5, 'Speculative Decoding Benefits', ha='center',
               fontsize=20, fontweight='bold', color=TEXT_COLOR)

        benefits = [
            ('2-3x speedup', 'Fewer large model forward passes'),
            ('Same output', 'Mathematically equivalent results'),
            ('No training', 'Use any compatible draft model'),
            ('Works with batching', 'Combines with other optimizations'),
        ]

        for i, (title, desc) in enumerate(benefits):
            y = 6.5 - i * 1.3
            circle = patches.Circle((1.5, y), 0.3, facecolor=ACCENT, alpha=0.8)
            ax.add_patch(circle)
            ax.text(1.5, y, str(i + 1), ha='center', va='center',
                   fontsize=11, color='white', fontweight='bold')
            ax.text(2.2, y + 0.1, title, ha='left', fontsize=13,
                   color=TEXT_COLOR, fontweight='bold')
            ax.text(2.2, y - 0.35, desc, ha='left', fontsize=10, color=TEXT_MUTED)

        ax.text(5, 1.3, 'Trade cheap speculation for expensive generation',
               ha='center', fontsize=12, color=ACCENT, fontweight='medium')

    def render_frame(self, frame_data):
        self.fig.clear()
        ax = self.fig.add_subplot(111)
        frame_type = frame_data[0]

        if frame_type == 'title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'Speculative Decoding', ha='center', fontsize=28,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Draft, verify, accelerate', ha='center',
                   fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'sequential_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Problem', ha='center', fontsize=24,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Sequential decoding is slow', ha='center',
                   fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'sequential_problem':
            self.draw_sequential_problem(ax)
        elif frame_type == 'speculative_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Solution', ha='center', fontsize=24,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Speculate with small model, verify with large', ha='center',
                   fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'draft_generate':
            self.draw_draft_generate(ax)
        elif frame_type == 'verify':
            self.draw_verify(ax)
        elif frame_type == 'accept_reject':
            self.draw_accept_reject(ax)
        elif frame_type == 'result':
            self.draw_result(ax)
        elif frame_type == 'why_works':
            self.draw_why_works(ax)
        elif frame_type == 'summary':
            self.draw_summary(ax)

        self.fig.tight_layout()

    def save_gif(self, filename, fps=1):
        frames = self.create_frames()
        print(f"Speculative Decoding: Generating {len(frames)} frames...")

        def update(frame_idx):
            self.render_frame(frames[frame_idx])
            return []

        anim = FuncAnimation(self.fig, update, frames=len(frames),
                            interval=1000/fps, blit=False)
        writer = PillowWriter(fps=fps)
        anim.save(filename, writer=writer, dpi=120)
        print(f"Saved to {filename}")


if __name__ == '__main__':
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'images')
    os.makedirs(output_dir, exist_ok=True)

    anim = SpeculativeDecodingAnimation()
    anim.save_gif(os.path.join(output_dir, 'speculative_decoding.gif'), fps=1)
    print("Done!")
