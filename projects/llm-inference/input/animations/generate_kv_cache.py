#!/usr/bin/env python3
"""
Generate an animated GIF showing KV Cache optimization.
Shows the difference between O(n²) recomputation vs O(n) with caching.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.animation import FuncAnimation, PillowWriter

# Style
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
ACCENT_LIGHT = '#DBEAFE'
CACHED_COLOR = '#10B981'  # Green
NEW_COLOR = '#F59E0B'  # Amber
RECOMPUTE_COLOR = '#EF4444'  # Red


class KVCacheAnimation:
    def __init__(self):
        self.fig = plt.figure(figsize=(12, 7), facecolor=BG_COLOR)
        self.tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat']
        self.num_tokens = len(self.tokens)

    def create_frames(self):
        frames = []

        # Title
        for _ in range(4):
            frames.append(('title', 'KV Cache', 'From O(n²) to O(n) computation'))

        # Without cache - show quadratic growth
        for _ in range(3):
            frames.append(('without_title', 'Without KV Cache', 'Recompute K,V for ALL tokens at each step'))

        # Animate without cache
        for step in range(1, self.num_tokens + 1):
            for _ in range(2):
                frames.append(('without_cache', step))

        # Show total work without cache
        for _ in range(4):
            frames.append(('without_summary',))

        # With cache - show linear growth
        for _ in range(3):
            frames.append(('with_title', 'With KV Cache', 'Compute K,V only for NEW token, cache the rest'))

        # Animate with cache
        for step in range(1, self.num_tokens + 1):
            for _ in range(2):
                frames.append(('with_cache', step))

        # Show total work with cache
        for _ in range(4):
            frames.append(('with_summary',))

        # Comparison
        for _ in range(5):
            frames.append(('comparison',))

        return frames

    def draw_title(self, ax, title, subtitle):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 5.5, title, ha='center', va='center',
               fontsize=28, color=TEXT_COLOR, fontweight='bold')
        ax.text(5, 4.2, subtitle, ha='center', va='center',
               fontsize=14, color=TEXT_MUTED)

    def draw_without_cache(self, ax, step):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(-0.5, 12)
        ax.set_ylim(-1, 8)
        ax.axis('off')

        ax.text(6, 7.5, f'Step {step}: Generate token {step}', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)
        ax.text(6, 6.8, 'Must recompute K,V for all previous tokens',
               ha='center', fontsize=11, color=TEXT_MUTED)

        # Draw tokens
        for i in range(step):
            x = 1 + i * 1.8
            # Token box
            rect = patches.FancyBboxPatch(
                (x - 0.6, 4.5), 1.2, 0.8,
                boxstyle="round,pad=0.05",
                facecolor=RECOMPUTE_COLOR if i < step - 1 else NEW_COLOR,
                alpha=0.8
            )
            ax.add_patch(rect)
            ax.text(x, 4.9, self.tokens[i], ha='center', va='center',
                   fontsize=10, color='white', fontweight='bold')

            # K,V boxes below
            k_rect = patches.FancyBboxPatch(
                (x - 0.5, 3.2), 0.45, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=RECOMPUTE_COLOR if i < step - 1 else NEW_COLOR,
                alpha=0.6
            )
            ax.add_patch(k_rect)
            ax.text(x - 0.28, 3.5, 'K', ha='center', va='center',
                   fontsize=9, color='white', fontweight='bold')

            v_rect = patches.FancyBboxPatch(
                (x + 0.05, 3.2), 0.45, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=RECOMPUTE_COLOR if i < step - 1 else NEW_COLOR,
                alpha=0.6
            )
            ax.add_patch(v_rect)
            ax.text(x + 0.28, 3.5, 'V', ha='center', va='center',
                   fontsize=9, color='white', fontweight='bold')

        # Legend
        ax.add_patch(patches.Rectangle((1, 1.5), 0.4, 0.4, facecolor=RECOMPUTE_COLOR, alpha=0.8))
        ax.text(1.6, 1.7, 'Recomputed (wasted work)', fontsize=10, color=TEXT_COLOR, va='center')

        ax.add_patch(patches.Rectangle((6, 1.5), 0.4, 0.4, facecolor=NEW_COLOR, alpha=0.8))
        ax.text(6.6, 1.7, 'New computation', fontsize=10, color=TEXT_COLOR, va='center')

        # Work counter
        work = step * 2  # K and V for each token
        total_work = sum(range(1, step + 1)) * 2
        ax.text(6, 0.5, f'This step: {work} K,V computations | Total so far: {total_work}',
               ha='center', fontsize=11, color=ACCENT, fontweight='medium')

    def draw_without_summary(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 8, 'Without KV Cache', ha='center',
               fontsize=20, fontweight='bold', color=TEXT_COLOR)

        # Show quadratic formula
        total = sum(range(1, self.num_tokens + 1)) * 2
        ax.text(5, 6, f'Total K,V computations: {total}', ha='center',
               fontsize=16, color=RECOMPUTE_COLOR, fontweight='bold')

        ax.text(5, 4.5, 'Work per step grows: 2 + 4 + 6 + 8 + 10 + 12', ha='center',
               fontsize=12, color=TEXT_MUTED)

        ax.text(5, 3.5, 'Total = n(n+1) = O(n²)', ha='center',
               fontsize=14, color=TEXT_COLOR, fontweight='medium', family='monospace')

        # Visual bar
        rect = patches.FancyBboxPatch(
            (2, 1.5), 6, 0.8,
            boxstyle="round,pad=0.05",
            facecolor=RECOMPUTE_COLOR, alpha=0.3
        )
        ax.add_patch(rect)
        ax.text(5, 1.9, f'{total} operations', ha='center', va='center',
               fontsize=12, color=RECOMPUTE_COLOR, fontweight='bold')

    def draw_with_cache(self, ax, step):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(-0.5, 12)
        ax.set_ylim(-1, 8)
        ax.axis('off')

        ax.text(6, 7.5, f'Step {step}: Generate token {step}', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)
        ax.text(6, 6.8, 'Only compute K,V for new token, retrieve cached values',
               ha='center', fontsize=11, color=TEXT_MUTED)

        # Draw tokens
        for i in range(step):
            x = 1 + i * 1.8
            is_new = (i == step - 1)

            # Token box
            rect = patches.FancyBboxPatch(
                (x - 0.6, 4.5), 1.2, 0.8,
                boxstyle="round,pad=0.05",
                facecolor=NEW_COLOR if is_new else CACHED_COLOR,
                alpha=0.8
            )
            ax.add_patch(rect)
            ax.text(x, 4.9, self.tokens[i], ha='center', va='center',
                   fontsize=10, color='white', fontweight='bold')

            # K,V boxes below
            k_rect = patches.FancyBboxPatch(
                (x - 0.5, 3.2), 0.45, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=NEW_COLOR if is_new else CACHED_COLOR,
                alpha=0.6
            )
            ax.add_patch(k_rect)
            ax.text(x - 0.28, 3.5, 'K', ha='center', va='center',
                   fontsize=9, color='white', fontweight='bold')

            v_rect = patches.FancyBboxPatch(
                (x + 0.05, 3.2), 0.45, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=NEW_COLOR if is_new else CACHED_COLOR,
                alpha=0.6
            )
            ax.add_patch(v_rect)
            ax.text(x + 0.28, 3.5, 'V', ha='center', va='center',
                   fontsize=9, color='white', fontweight='bold')

        # Cache indicator
        if step > 1:
            cache_rect = patches.FancyBboxPatch(
                (0.5, 2), step * 1.8 - 1.3, 0.5,
                boxstyle="round,pad=0.02",
                facecolor=CACHED_COLOR, alpha=0.2,
                linestyle='--', edgecolor=CACHED_COLOR, linewidth=2
            )
            ax.add_patch(cache_rect)
            ax.text((step * 1.8) / 2, 2.25, 'KV Cache (instant retrieval)',
                   ha='center', va='center', fontsize=9, color=CACHED_COLOR, fontweight='medium')

        # Legend
        ax.add_patch(patches.Rectangle((1, 1), 0.4, 0.4, facecolor=CACHED_COLOR, alpha=0.8))
        ax.text(1.6, 1.2, 'Cached (free lookup)', fontsize=10, color=TEXT_COLOR, va='center')

        ax.add_patch(patches.Rectangle((6, 1), 0.4, 0.4, facecolor=NEW_COLOR, alpha=0.8))
        ax.text(6.6, 1.2, 'New computation', fontsize=10, color=TEXT_COLOR, va='center')

        # Work counter
        ax.text(6, 0.3, f'This step: 2 K,V computations | Total so far: {step * 2}',
               ha='center', fontsize=11, color=ACCENT, fontweight='medium')

    def draw_with_summary(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 8, 'With KV Cache', ha='center',
               fontsize=20, fontweight='bold', color=TEXT_COLOR)

        total = self.num_tokens * 2
        ax.text(5, 6, f'Total K,V computations: {total}', ha='center',
               fontsize=16, color=CACHED_COLOR, fontweight='bold')

        ax.text(5, 4.5, 'Work per step constant: 2 + 2 + 2 + 2 + 2 + 2', ha='center',
               fontsize=12, color=TEXT_MUTED)

        ax.text(5, 3.5, 'Total = 2n = O(n)', ha='center',
               fontsize=14, color=TEXT_COLOR, fontweight='medium', family='monospace')

        # Visual bar (much smaller)
        bar_width = 6 * (total / 42)  # Proportional to without cache
        rect = patches.FancyBboxPatch(
            (5 - bar_width/2, 1.5), bar_width, 0.8,
            boxstyle="round,pad=0.05",
            facecolor=CACHED_COLOR, alpha=0.3
        )
        ax.add_patch(rect)
        ax.text(5, 1.9, f'{total} operations', ha='center', va='center',
               fontsize=12, color=CACHED_COLOR, fontweight='bold')

    def draw_comparison(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 9, 'Comparison: 6 Tokens', ha='center',
               fontsize=20, fontweight='bold', color=TEXT_COLOR)

        # Without cache bar
        without_total = sum(range(1, self.num_tokens + 1)) * 2
        ax.text(1, 6.5, 'Without Cache:', ha='left', fontsize=12, color=TEXT_COLOR)
        rect1 = patches.FancyBboxPatch(
            (1, 5.5), 7, 0.7,
            boxstyle="round,pad=0.02",
            facecolor=RECOMPUTE_COLOR, alpha=0.7
        )
        ax.add_patch(rect1)
        ax.text(4.5, 5.85, f'{without_total} K,V ops', ha='center', va='center',
               fontsize=11, color='white', fontweight='bold')
        ax.text(8.2, 5.85, 'O(n²)', ha='left', va='center',
               fontsize=11, color=RECOMPUTE_COLOR, fontweight='bold', family='monospace')

        # With cache bar
        with_total = self.num_tokens * 2
        ax.text(1, 4, 'With Cache:', ha='left', fontsize=12, color=TEXT_COLOR)
        bar_width = 7 * (with_total / without_total)
        rect2 = patches.FancyBboxPatch(
            (1, 3), bar_width, 0.7,
            boxstyle="round,pad=0.02",
            facecolor=CACHED_COLOR, alpha=0.7
        )
        ax.add_patch(rect2)
        ax.text(1 + bar_width/2, 3.35, f'{with_total} K,V ops', ha='center', va='center',
               fontsize=11, color='white', fontweight='bold')
        ax.text(8.2, 3.35, 'O(n)', ha='left', va='center',
               fontsize=11, color=CACHED_COLOR, fontweight='bold', family='monospace')

        # Speedup
        speedup = without_total / with_total
        ax.text(5, 1.5, f'{speedup:.1f}x fewer operations', ha='center',
               fontsize=18, color=ACCENT, fontweight='bold')
        ax.text(5, 0.7, 'Savings grow with sequence length!', ha='center',
               fontsize=12, color=TEXT_MUTED)

    def render_frame(self, frame_data):
        self.fig.clear()
        ax = self.fig.add_subplot(111)
        frame_type = frame_data[0]

        if frame_type == 'title':
            self.draw_title(ax, frame_data[1], frame_data[2])
        elif frame_type == 'without_title':
            self.draw_title(ax, frame_data[1], frame_data[2])
        elif frame_type == 'without_cache':
            self.draw_without_cache(ax, frame_data[1])
        elif frame_type == 'without_summary':
            self.draw_without_summary(ax)
        elif frame_type == 'with_title':
            self.draw_title(ax, frame_data[1], frame_data[2])
        elif frame_type == 'with_cache':
            self.draw_with_cache(ax, frame_data[1])
        elif frame_type == 'with_summary':
            self.draw_with_summary(ax)
        elif frame_type == 'comparison':
            self.draw_comparison(ax)

        self.fig.tight_layout()

    def save_gif(self, filename, fps=1):
        frames = self.create_frames()
        print(f"KV Cache: Generating {len(frames)} frames...")

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

    anim = KVCacheAnimation()
    anim.save_gif(os.path.join(output_dir, 'kv_cache.gif'), fps=1)
    print("Done!")
