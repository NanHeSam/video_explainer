#!/usr/bin/env python3
"""
Generate an animated GIF showing Quantization.
Shows how reducing precision saves memory while preserving quality.
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
FP16_COLOR = '#EF4444'  # Red for full precision
INT8_COLOR = '#F59E0B'  # Amber for INT8
INT4_COLOR = '#10B981'  # Green for INT4
IMPORTANT_COLOR = '#8B5CF6'  # Purple for important weights


class QuantizationAnimation:
    def __init__(self):
        self.fig = plt.figure(figsize=(12, 7), facecolor=BG_COLOR)

    def create_frames(self):
        frames = []

        # Title
        for _ in range(4):
            frames.append(('title',))

        # Problem: Memory requirements
        for _ in range(3):
            frames.append(('memory_title',))

        for _ in range(4):
            frames.append(('memory_problem',))

        # Solution intro
        for _ in range(3):
            frames.append(('quantization_title',))

        # Precision comparison
        for _ in range(4):
            frames.append(('precision_levels',))

        # Memory savings
        for _ in range(4):
            frames.append(('memory_savings',))

        # AWQ concept
        for _ in range(4):
            frames.append(('awq_concept',))

        # Quality comparison
        for _ in range(4):
            frames.append(('quality',))

        # Summary
        for _ in range(5):
            frames.append(('summary',))

        return frames

    def draw_memory_problem(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'The Memory Problem', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Model sizes
        models = [
            ('Llama 2 7B', 14, 'GB'),
            ('Llama 2 13B', 26, 'GB'),
            ('Llama 2 70B', 140, 'GB'),
        ]

        ax.text(1, 7.2, 'Model weights in FP16:', fontsize=12,
               color=TEXT_COLOR, fontweight='medium')

        bar_max = 150
        bar_width = 8

        for i, (name, size, unit) in enumerate(models):
            y = 6 - i * 1.5
            width = (size / bar_max) * bar_width

            # Background bar
            bg_rect = patches.FancyBboxPatch(
                (1, y - 0.3), bar_width, 0.6,
                boxstyle="round,pad=0.02",
                facecolor='#E5E5E5', alpha=0.3
            )
            ax.add_patch(bg_rect)

            # Filled bar
            rect = patches.FancyBboxPatch(
                (1, y - 0.3), width, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=FP16_COLOR, alpha=0.7
            )
            ax.add_patch(rect)

            ax.text(0.8, y, name, ha='right', va='center',
                   fontsize=10, color=TEXT_COLOR)
            ax.text(1 + width + 0.2, y, f'{size} {unit}', ha='left', va='center',
                   fontsize=10, color=FP16_COLOR, fontweight='bold')

        # GPU memory reference
        ax.plot([1 + (80/bar_max)*bar_width, 1 + (80/bar_max)*bar_width],
               [2, 7], color=ACCENT, linestyle='--', linewidth=2)
        ax.text(1 + (80/bar_max)*bar_width, 1.5, 'A100 80GB',
               ha='center', fontsize=10, color=ACCENT, fontweight='medium')

        # Problem text
        ax.text(6, 0.5, '70B model doesn\'t fit on a single GPU!',
               ha='center', fontsize=12, color=FP16_COLOR, fontweight='bold')

    def draw_precision_levels(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Precision Levels', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Show different precision representations
        precisions = [
            ('FP16', '16 bits', '0.00123456789...', FP16_COLOR, 1.0),
            ('INT8', '8 bits', '0.0012', INT8_COLOR, 0.5),
            ('INT4', '4 bits', '0.001', INT4_COLOR, 0.25),
        ]

        for i, (name, bits, example, color, ratio) in enumerate(precisions):
            y = 7 - i * 2

            # Label
            ax.text(1, y, name, ha='left', fontsize=14, color=color, fontweight='bold')
            ax.text(2.5, y, f'({bits})', ha='left', fontsize=11, color=TEXT_MUTED)

            # Bit visualization
            bit_x = 4.5
            bit_count = int(16 * ratio)
            for j in range(16):
                rect_color = color if j < bit_count else '#E5E5E5'
                alpha = 0.7 if j < bit_count else 0.2
                rect = patches.Rectangle(
                    (bit_x + j * 0.3, y - 0.2), 0.25, 0.4,
                    facecolor=rect_color, alpha=alpha,
                    edgecolor='white', linewidth=0.5
                )
                ax.add_patch(rect)

            # Example value
            ax.text(10, y, example, ha='left', fontsize=10, color=TEXT_MUTED,
                   family='monospace')

        # Key insight
        ax.text(6, 1.5, 'Fewer bits = Less memory, but less precision',
               ha='center', fontsize=11, color=TEXT_COLOR, fontweight='medium')

        ax.text(6, 0.8, 'The key: Find the sweet spot!',
               ha='center', fontsize=11, color=ACCENT, fontweight='medium')

    def draw_memory_savings(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Memory Savings: Llama 2 70B', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Size comparisons
        sizes = [
            ('FP16', 140, FP16_COLOR),
            ('INT8', 70, INT8_COLOR),
            ('INT4', 35, INT4_COLOR),
        ]

        max_size = 150
        bar_width = 6

        for i, (name, size, color) in enumerate(sizes):
            y = 6.5 - i * 2
            width = (size / max_size) * bar_width

            # Bar
            rect = patches.FancyBboxPatch(
                (2, y - 0.4), width, 0.8,
                boxstyle="round,pad=0.02",
                facecolor=color, alpha=0.7
            )
            ax.add_patch(rect)

            ax.text(1.8, y, name, ha='right', va='center',
                   fontsize=12, color=color, fontweight='bold')
            ax.text(2 + width + 0.3, y, f'{size} GB', ha='left', va='center',
                   fontsize=12, color=TEXT_COLOR, fontweight='medium')

            # Savings annotation
            if name == 'INT8':
                ax.text(9, y, '2x smaller', ha='left', fontsize=11,
                       color=INT8_COLOR, fontweight='medium')
            elif name == 'INT4':
                ax.text(9, y, '4x smaller', ha='left', fontsize=11,
                       color=INT4_COLOR, fontweight='bold')

        # GPU fit indicator
        gpu_line = (80 / max_size) * bar_width + 2
        ax.plot([gpu_line, gpu_line], [1.5, 7.5],
               color=ACCENT, linestyle='--', linewidth=2)
        ax.text(gpu_line, 1, 'A100 80GB', ha='center', fontsize=10,
               color=ACCENT, fontweight='medium')

        # Conclusion
        ax.text(6, 0.3, 'INT4: 70B model fits on a single GPU!',
               ha='center', fontsize=12, color=INT4_COLOR, fontweight='bold')

    def draw_awq_concept(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'AWQ: Activation-Aware Quantization', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)

        # Key insight
        ax.text(6, 7.5, 'Not all weights are equally important!', ha='center',
               fontsize=12, color=ACCENT, fontweight='medium')

        # Weight distribution visualization
        weight_y = 5.5
        ax.text(1, weight_y + 1, 'Weight importance distribution:', fontsize=11,
               color=TEXT_MUTED)

        # Draw weights as circles of varying sizes
        np.random.seed(42)
        n_weights = 20
        importance = np.random.exponential(0.3, n_weights)
        importance = importance / importance.max()

        for i in range(n_weights):
            x = 1 + (i % 10) * 1
            y = weight_y - (i // 10) * 1.2
            size = 0.1 + importance[i] * 0.3

            # Color based on importance
            if importance[i] > 0.7:
                color = IMPORTANT_COLOR
                alpha = 0.9
            else:
                color = INT4_COLOR
                alpha = 0.5

            circle = patches.Circle((x, y), size, facecolor=color, alpha=alpha)
            ax.add_patch(circle)

        # Legend
        ax.text(1, 2.8, 'Legend:', fontsize=10, color=TEXT_MUTED)
        circle1 = patches.Circle((2.5, 2.8), 0.15, facecolor=IMPORTANT_COLOR, alpha=0.9)
        ax.add_patch(circle1)
        ax.text(2.9, 2.8, 'Important (keep precision)', fontsize=9,
               va='center', color=TEXT_COLOR)

        circle2 = patches.Circle((6.5, 2.8), 0.15, facecolor=INT4_COLOR, alpha=0.5)
        ax.add_patch(circle2)
        ax.text(6.9, 2.8, 'Less important (quantize)', fontsize=9,
               va='center', color=TEXT_COLOR)

        # Strategy
        ax.text(6, 1.5, 'AWQ Strategy: Protect the 1% of weights that matter most',
               ha='center', fontsize=11, color=TEXT_COLOR, fontweight='medium')

        ax.text(6, 0.8, 'Result: Better quality than naive INT4 quantization',
               ha='center', fontsize=10, color=ACCENT)

    def draw_quality(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Quality vs Memory Trade-off', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Quality comparison table
        methods = [
            ('FP16 (baseline)', 100, 140, FP16_COLOR),
            ('INT8', 99.5, 70, INT8_COLOR),
            ('INT4 (naive)', 95, 35, '#999999'),
            ('INT4 (AWQ)', 98, 35, INT4_COLOR),
        ]

        # Headers
        ax.text(4, 7, 'Method', ha='center', fontsize=11,
               color=TEXT_MUTED, fontweight='medium')
        ax.text(7, 7, 'Quality %', ha='center', fontsize=11,
               color=TEXT_MUTED, fontweight='medium')
        ax.text(9.5, 7, 'Memory', ha='center', fontsize=11,
               color=TEXT_MUTED, fontweight='medium')

        for i, (method, quality, memory, color) in enumerate(methods):
            y = 5.8 - i * 1.2

            # Method name
            ax.text(4, y, method, ha='center', fontsize=10,
                   color=color, fontweight='medium')

            # Quality bar
            bar_width = quality / 100 * 1.5
            rect = patches.FancyBboxPatch(
                (6.2, y - 0.2), bar_width, 0.4,
                boxstyle="round,pad=0.02",
                facecolor=color, alpha=0.7
            )
            ax.add_patch(rect)
            ax.text(6.2 + bar_width + 0.1, y, f'{quality}%', ha='left',
                   fontsize=9, va='center', color=color)

            # Memory
            ax.text(9.5, y, f'{memory}GB', ha='center', fontsize=10,
                   color=TEXT_COLOR)

        # Key takeaway
        ax.text(6, 1.5, 'AWQ INT4: 4x memory reduction with <2% quality loss',
               ha='center', fontsize=12, color=INT4_COLOR, fontweight='bold')

        ax.text(6, 0.8, 'Best bang for buck in production deployments',
               ha='center', fontsize=11, color=TEXT_MUTED)

    def draw_summary(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 8.5, 'Quantization Benefits', ha='center',
               fontsize=20, fontweight='bold', color=TEXT_COLOR)

        benefits = [
            ('4x memory reduction', 'INT4 vs FP16'),
            ('Fit larger models', '70B on single GPU'),
            ('Faster inference', 'Less memory bandwidth'),
            ('Minimal quality loss', 'With AWQ techniques'),
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

        ax.text(5, 1.3, 'Standard practice for production LLM deployment',
               ha='center', fontsize=12, color=ACCENT, fontweight='medium')

    def render_frame(self, frame_data):
        self.fig.clear()
        ax = self.fig.add_subplot(111)
        frame_type = frame_data[0]

        if frame_type == 'title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'Quantization', ha='center', fontsize=28,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Shrink models, keep quality', ha='center',
                   fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'memory_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Problem', ha='center', fontsize=24,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'LLMs are too large for GPU memory', ha='center',
                   fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'memory_problem':
            self.draw_memory_problem(ax)
        elif frame_type == 'quantization_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Solution', ha='center', fontsize=24,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Reduce numerical precision', ha='center',
                   fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'precision_levels':
            self.draw_precision_levels(ax)
        elif frame_type == 'memory_savings':
            self.draw_memory_savings(ax)
        elif frame_type == 'awq_concept':
            self.draw_awq_concept(ax)
        elif frame_type == 'quality':
            self.draw_quality(ax)
        elif frame_type == 'summary':
            self.draw_summary(ax)

        self.fig.tight_layout()

    def save_gif(self, filename, fps=1):
        frames = self.create_frames()
        print(f"Quantization: Generating {len(frames)} frames...")

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

    anim = QuantizationAnimation()
    anim.save_gif(os.path.join(output_dir, 'quantization.gif'), fps=1)
    print("Done!")
