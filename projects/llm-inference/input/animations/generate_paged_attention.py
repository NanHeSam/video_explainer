#!/usr/bin/env python3
"""
Generate an animated GIF showing PagedAttention.
Shows how virtual memory concepts enable efficient KV cache management.
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

# Request colors
REQ_COLORS = {
    'A': '#3B82F6',  # Blue
    'B': '#8B5CF6',  # Purple
    'C': '#EC4899',  # Pink
}
FREE_COLOR = '#E5E5E5'
FRAGMENT_COLOR = '#EF4444'


class PagedAttentionAnimation:
    def __init__(self):
        self.fig = plt.figure(figsize=(12, 7), facecolor=BG_COLOR)
        self.num_physical_blocks = 8
        self.block_size = 4  # tokens per block

    def create_frames(self):
        frames = []

        # Title
        for _ in range(4):
            frames.append(('title',))

        # Problem: Contiguous allocation
        for _ in range(3):
            frames.append(('contiguous_title',))

        for _ in range(4):
            frames.append(('contiguous_problem',))

        # Solution intro
        for _ in range(3):
            frames.append(('paged_title',))

        # Show block concept
        for _ in range(4):
            frames.append(('block_concept',))

        # Animate allocation steps
        # Step 1: Request A arrives (needs 3 blocks)
        for _ in range(3):
            frames.append(('allocation', 1))

        # Step 2: Request B arrives (needs 2 blocks)
        for _ in range(3):
            frames.append(('allocation', 2))

        # Step 3: Request A finishes (frees blocks)
        for _ in range(3):
            frames.append(('allocation', 3))

        # Step 4: Request C arrives (needs 2 blocks) - uses freed space
        for _ in range(3):
            frames.append(('allocation', 4))

        # Show block table mapping
        for _ in range(4):
            frames.append(('block_table',))

        # Summary
        for _ in range(5):
            frames.append(('summary',))

        return frames

    def draw_contiguous_problem(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Contiguous Allocation Problem', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Draw memory bar
        memory_y = 6
        total_width = 10
        memory_start = 1

        # Show fragmented memory
        segments = [
            ('A', 2.5, REQ_COLORS['A']),
            ('free', 0.5, FREE_COLOR),
            ('B', 2, REQ_COLORS['B']),
            ('free', 1, FREE_COLOR),
            ('C', 1.5, REQ_COLORS['C']),
            ('free', 0.5, FREE_COLOR),
            ('free', 2, FRAGMENT_COLOR),
        ]

        x = memory_start
        for name, width, color in segments:
            alpha = 0.3 if color == FRAGMENT_COLOR else 0.7
            rect = patches.FancyBboxPatch(
                (x, memory_y - 0.5), width, 1,
                boxstyle="round,pad=0.02",
                facecolor=color, alpha=alpha,
                edgecolor=color if color == FRAGMENT_COLOR else 'none',
                linestyle='--' if color == FRAGMENT_COLOR else '-',
                linewidth=1
            )
            ax.add_patch(rect)
            if name not in ('free',) and color != FRAGMENT_COLOR:
                ax.text(x + width/2, memory_y, name, ha='center', va='center',
                       fontsize=11, color='white', fontweight='bold')
            x += width

        ax.text(6, 4.5, 'GPU Memory', ha='center', fontsize=12, color=TEXT_MUTED)

        # Problem description
        ax.text(1, 3, 'Problems:', fontsize=12, fontweight='bold', color=TEXT_COLOR)
        problems = [
            'Memory fragmentation - small gaps unusable',
            'Must reserve max possible length upfront',
            'Cannot grow sequences dynamically',
        ]
        for i, problem in enumerate(problems):
            ax.text(1.5, 2.3 - i * 0.6, f'• {problem}', fontsize=10, color='#EF4444')

        # Wasted memory indicator
        ax.annotate('Wasted!', xy=(10, memory_y), xytext=(10.5, memory_y + 1),
                   fontsize=10, color=FRAGMENT_COLOR, fontweight='bold',
                   arrowprops=dict(arrowstyle='->', color=FRAGMENT_COLOR, lw=1))

    def draw_block_concept(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'PagedAttention: Block-Based Allocation', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Show a block
        block_x, block_y = 2, 6
        block_width = 3
        block_height = 1.5

        rect = patches.FancyBboxPatch(
            (block_x, block_y), block_width, block_height,
            boxstyle="round,pad=0.03",
            facecolor=ACCENT, alpha=0.2,
            edgecolor=ACCENT, linewidth=2
        )
        ax.add_patch(rect)

        # Show tokens inside block
        token_width = block_width / 4
        for i in range(4):
            token_rect = patches.FancyBboxPatch(
                (block_x + i * token_width + 0.05, block_y + 0.3),
                token_width - 0.1, block_height - 0.6,
                boxstyle="round,pad=0.02",
                facecolor=ACCENT, alpha=0.7
            )
            ax.add_patch(token_rect)
            ax.text(block_x + i * token_width + token_width/2, block_y + block_height/2,
                   f'T{i+1}', ha='center', va='center',
                   fontsize=10, color='white', fontweight='bold')

        ax.text(block_x + block_width/2, block_y - 0.4, '1 Block = 4 KV Pairs',
               ha='center', fontsize=11, color=TEXT_MUTED)

        # Key insight
        ax.text(7, 7, 'Key Insight:', fontsize=12, fontweight='bold', color=TEXT_COLOR)
        insights = [
            'Fixed-size blocks (like memory pages)',
            'Blocks can be anywhere in memory',
            'Block table tracks the mapping',
            'No fragmentation waste!',
        ]
        for i, insight in enumerate(insights):
            ax.text(7, 6.3 - i * 0.5, f'• {insight}', fontsize=10, color=TEXT_COLOR)

        # Virtual memory analogy
        ax.text(6, 2.5, 'Inspired by Operating System Virtual Memory',
               ha='center', fontsize=11, color=ACCENT, fontweight='medium',
               style='italic')

        ax.text(6, 1.8, 'Logical (sequence) -> Physical (GPU memory) mapping',
               ha='center', fontsize=10, color=TEXT_MUTED)

    def draw_allocation(self, ax, step):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 14)
        ax.set_ylim(-1, 9)
        ax.axis('off')

        ax.text(7, 8.5, f'Dynamic Block Allocation - Step {step}',
               ha='center', fontsize=16, fontweight='bold', color=TEXT_COLOR)

        # Physical memory blocks
        block_y = 5.5
        block_width = 1.2
        block_height = 1

        # State at each step
        if step == 1:
            # Request A needs 3 blocks
            block_states = ['A', 'A', 'A', '-', '-', '-', '-', '-']
            message = 'Request A arrives (needs 3 blocks)'
            msg_color = REQ_COLORS['A']
        elif step == 2:
            # Request B needs 2 blocks
            block_states = ['A', 'A', 'A', 'B', 'B', '-', '-', '-']
            message = 'Request B arrives (needs 2 blocks)'
            msg_color = REQ_COLORS['B']
        elif step == 3:
            # Request A finishes
            block_states = ['-', '-', '-', 'B', 'B', '-', '-', '-']
            message = 'Request A completes - blocks freed!'
            msg_color = '#10B981'
        else:
            # Request C uses freed blocks (non-contiguous!)
            block_states = ['C', '-', 'C', 'B', 'B', '-', '-', '-']
            message = 'Request C uses non-contiguous blocks!'
            msg_color = REQ_COLORS['C']

        ax.text(1, block_y + 1.5, 'Physical Memory Blocks:', fontsize=11,
               color=TEXT_MUTED, fontweight='medium')

        for i, state in enumerate(block_states):
            x = 1 + i * (block_width + 0.15)

            if state == '-':
                color = FREE_COLOR
                alpha = 0.3
            else:
                color = REQ_COLORS[state]
                alpha = 0.7

            rect = patches.FancyBboxPatch(
                (x, block_y), block_width, block_height,
                boxstyle="round,pad=0.02",
                facecolor=color, alpha=alpha,
                edgecolor=color if state != '-' else '#CCCCCC',
                linewidth=1.5 if state != '-' else 1
            )
            ax.add_patch(rect)

            # Block number
            ax.text(x + block_width/2, block_y - 0.3, str(i),
                   ha='center', fontsize=9, color=TEXT_MUTED)

            if state != '-':
                ax.text(x + block_width/2, block_y + block_height/2, state,
                       ha='center', va='center',
                       fontsize=14, color='white', fontweight='bold')

        # Message
        ax.text(7, 3, message, ha='center', fontsize=13,
               color=msg_color, fontweight='bold')

        # Show block tables for active requests
        table_y = 1
        ax.text(1, table_y + 1, 'Block Tables:', fontsize=11,
               color=TEXT_MUTED, fontweight='medium')

        if step >= 1 and step < 3:
            # Request A's block table
            ax.text(1.5, table_y, 'A:', fontsize=10, color=REQ_COLORS['A'],
                   fontweight='bold')
            ax.text(2.2, table_y, '[0, 1, 2]', fontsize=10, color=TEXT_COLOR)

        if step >= 2:
            # Request B's block table
            offset = 0 if step >= 3 else 3.5
            ax.text(1.5 + offset, table_y if step >= 3 else table_y,
                   'B:', fontsize=10, color=REQ_COLORS['B'], fontweight='bold')
            ax.text(2.2 + offset, table_y if step >= 3 else table_y,
                   '[3, 4]', fontsize=10, color=TEXT_COLOR)

        if step == 4:
            # Request C's block table (non-contiguous!)
            ax.text(5, table_y, 'C:', fontsize=10, color=REQ_COLORS['C'],
                   fontweight='bold')
            ax.text(5.7, table_y, '[0, 2]', fontsize=10, color=TEXT_COLOR)
            ax.text(7.5, table_y, '<- Non-contiguous!', fontsize=10,
                   color='#10B981', fontweight='medium')

    def draw_block_table(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Block Table Mapping', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Logical view (sequence)
        ax.text(2, 7.5, 'Logical View', ha='center', fontsize=12,
               color=TEXT_MUTED, fontweight='medium')
        ax.text(2, 7, '(Sequence)', ha='center', fontsize=10, color=TEXT_MUTED)

        logical_y = 5.5
        for i in range(3):
            rect = patches.FancyBboxPatch(
                (0.5 + i * 1.2, logical_y), 1, 0.8,
                boxstyle="round,pad=0.02",
                facecolor=REQ_COLORS['C'], alpha=0.7
            )
            ax.add_patch(rect)
            ax.text(1 + i * 1.2, logical_y + 0.4, f'L{i}',
                   ha='center', va='center',
                   fontsize=10, color='white', fontweight='bold')

        # Block table
        ax.text(6, 7.5, 'Block Table', ha='center', fontsize=12,
               color=ACCENT, fontweight='medium')

        table_x, table_y = 5, 5
        headers = ['Logical', 'Physical']
        mappings = [(0, 0), (1, 2), (2, 5)]

        # Header
        for j, h in enumerate(headers):
            rect = patches.FancyBboxPatch(
                (table_x + j * 1.5, table_y + 1), 1.3, 0.6,
                boxstyle="round,pad=0.01",
                facecolor=ACCENT, alpha=0.8
            )
            ax.add_patch(rect)
            ax.text(table_x + j * 1.5 + 0.65, table_y + 1.3, h,
                   ha='center', va='center',
                   fontsize=9, color='white', fontweight='bold')

        # Rows
        for i, (log, phys) in enumerate(mappings):
            for j, val in enumerate([log, phys]):
                rect = patches.FancyBboxPatch(
                    (table_x + j * 1.5, table_y - i * 0.6), 1.3, 0.5,
                    boxstyle="round,pad=0.01",
                    facecolor='white', edgecolor='#E5E5E5', linewidth=1
                )
                ax.add_patch(rect)
                ax.text(table_x + j * 1.5 + 0.65, table_y - i * 0.6 + 0.25, str(val),
                       ha='center', va='center',
                       fontsize=10, color=TEXT_COLOR)

        # Physical view
        ax.text(10, 7.5, 'Physical View', ha='center', fontsize=12,
               color=TEXT_MUTED, fontweight='medium')
        ax.text(10, 7, '(GPU Memory)', ha='center', fontsize=10, color=TEXT_MUTED)

        physical_y = 4
        physical_blocks = [('C', 0), ('-', 1), ('C', 2), ('-', 3), ('-', 4), ('C', 5)]

        for i, (state, _) in enumerate(physical_blocks):
            y = physical_y + (5 - i) * 0.7
            if state == 'C':
                color = REQ_COLORS['C']
                alpha = 0.7
            else:
                color = FREE_COLOR
                alpha = 0.3

            rect = patches.FancyBboxPatch(
                (9, y), 1.5, 0.5,
                boxstyle="round,pad=0.02",
                facecolor=color, alpha=alpha
            )
            ax.add_patch(rect)
            ax.text(8.7, y + 0.25, str(i), ha='center', va='center',
                   fontsize=9, color=TEXT_MUTED)

        # Arrows showing mapping
        arrow_props = dict(arrowstyle='->', color=REQ_COLORS['C'], lw=1.5,
                          connectionstyle='arc3,rad=0.2')
        # L0 -> P0
        ax.annotate('', xy=(9, 7.2), xytext=(3.7, logical_y + 0.4), arrowprops=arrow_props)
        # L1 -> P2
        ax.annotate('', xy=(9, 5.8), xytext=(3.7, logical_y + 0.4),
                   arrowprops=dict(arrowstyle='->', color=REQ_COLORS['C'], lw=1.5,
                                  connectionstyle='arc3,rad=0.1'))
        # L2 -> P5
        ax.annotate('', xy=(9, 4.4), xytext=(3.7, logical_y + 0.4),
                   arrowprops=dict(arrowstyle='->', color=REQ_COLORS['C'], lw=1.5,
                                  connectionstyle='arc3,rad=-0.1'))

        ax.text(6, 1.5, 'Blocks can be scattered across memory',
               ha='center', fontsize=11, color=TEXT_COLOR, fontweight='medium')
        ax.text(6, 0.9, 'Block table provides indirection for O(1) lookup',
               ha='center', fontsize=10, color=TEXT_MUTED)

    def draw_summary(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 8.5, 'PagedAttention Benefits', ha='center',
               fontsize=20, fontweight='bold', color=TEXT_COLOR)

        benefits = [
            ('Near-zero waste', 'Only ~4% memory wasted (last block)'),
            ('Dynamic growth', 'Sequences grow on-demand'),
            ('Memory sharing', 'Common prefixes share blocks'),
            ('Efficient batching', 'No reserved capacity needed'),
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

        ax.text(5, 1.3, 'vLLM achieves 2-4x higher throughput', ha='center',
               fontsize=12, color=ACCENT, fontweight='medium')
        ax.text(5, 0.7, 'with PagedAttention vs. HuggingFace', ha='center',
               fontsize=11, color=TEXT_MUTED)

    def render_frame(self, frame_data):
        self.fig.clear()
        ax = self.fig.add_subplot(111)
        frame_type = frame_data[0]

        if frame_type == 'title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'PagedAttention', ha='center', fontsize=28,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Virtual memory for KV cache', ha='center',
                   fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'contiguous_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Problem', ha='center', fontsize=24,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Contiguous memory allocation wastes GPU memory',
                   ha='center', fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'contiguous_problem':
            self.draw_contiguous_problem(ax)
        elif frame_type == 'paged_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Solution', ha='center', fontsize=24,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Block-based allocation like OS virtual memory',
                   ha='center', fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'block_concept':
            self.draw_block_concept(ax)
        elif frame_type == 'allocation':
            self.draw_allocation(ax, frame_data[1])
        elif frame_type == 'block_table':
            self.draw_block_table(ax)
        elif frame_type == 'summary':
            self.draw_summary(ax)

        self.fig.tight_layout()

    def save_gif(self, filename, fps=1):
        frames = self.create_frames()
        print(f"PagedAttention: Generating {len(frames)} frames...")

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

    anim = PagedAttentionAnimation()
    anim.save_gif(os.path.join(output_dir, 'paged_attention.gif'), fps=1)
    print("Done!")
