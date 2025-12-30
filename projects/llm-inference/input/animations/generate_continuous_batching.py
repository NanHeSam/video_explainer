#!/usr/bin/env python3
"""
Generate an animated GIF showing Continuous Batching.
Shows requests dynamically entering and leaving the batch.
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
SLOT_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4']
EMPTY_COLOR = '#E5E5E5'
NEW_COLOR = '#10B981'


class ContinuousBatchingAnimation:
    def __init__(self):
        self.fig = plt.figure(figsize=(12, 7), facecolor=BG_COLOR)
        self.num_slots = 4
        # Request: (name, start_step, length)
        self.requests = [
            ('A', 0, 8),   # Long request
            ('B', 0, 3),   # Short request
            ('C', 0, 5),   # Medium request
            ('D', 0, 4),   # Medium request
            ('E', 3, 4),   # Arrives when B finishes
            ('F', 4, 3),   # Arrives when D finishes
            ('G', 5, 5),   # Arrives when C finishes
            ('H', 7, 2),   # Late arrival
        ]
        self.total_steps = 12

    def get_active_requests(self, step):
        """Get which requests are active at a given step."""
        active = []
        for name, start, length in self.requests:
            if start <= step < start + length:
                progress = step - start + 1
                active.append((name, progress, length))
        return active[:self.num_slots]  # Limit to batch size

    def create_frames(self):
        frames = []

        # Title
        for _ in range(4):
            frames.append(('title', 'Continuous Batching', 'Dynamic scheduling at every decode step'))

        # Static batching problem
        for _ in range(3):
            frames.append(('static_title',))

        for _ in range(4):
            frames.append(('static_problem',))

        # Continuous batching solution
        for _ in range(3):
            frames.append(('continuous_title',))

        # Animate timeline
        for step in range(self.total_steps):
            for _ in range(2):
                frames.append(('timeline', step))

        # Summary
        for _ in range(5):
            frames.append(('summary',))

        return frames

    def draw_static_problem(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(6, 9, 'Static Batching Problem', ha='center',
               fontsize=18, fontweight='bold', color=TEXT_COLOR)

        # Draw batch slots
        slot_names = ['A', 'B', 'C', 'D']
        slot_lengths = [8, 3, 5, 4]
        max_len = max(slot_lengths)

        for i, (name, length) in enumerate(zip(slot_names, slot_lengths)):
            y = 7 - i * 1.5

            # Slot label
            ax.text(0.5, y, name, ha='center', va='center',
                   fontsize=12, fontweight='bold', color=SLOT_COLORS[i])

            # Active portion
            width = length / max_len * 8
            rect = patches.FancyBboxPatch(
                (1, y - 0.3), width, 0.6,
                boxstyle="round,pad=0.02",
                facecolor=SLOT_COLORS[i], alpha=0.7
            )
            ax.add_patch(rect)

            # Waiting/wasted portion
            if length < max_len:
                waste_width = (max_len - length) / max_len * 8
                waste_rect = patches.FancyBboxPatch(
                    (1 + width, y - 0.3), waste_width, 0.6,
                    boxstyle="round,pad=0.02",
                    facecolor='#EF4444', alpha=0.2,
                    linestyle='--', edgecolor='#EF4444', linewidth=1
                )
                ax.add_patch(waste_rect)

            ax.text(1 + width/2, y, f'{length} tokens', ha='center', va='center',
                   fontsize=9, color='white', fontweight='medium')

        # Time arrow
        ax.annotate('', xy=(10, 1.5), xytext=(1, 1.5),
                   arrowprops=dict(arrowstyle='->', color=TEXT_MUTED, lw=1.5))
        ax.text(5.5, 1, 'Time', ha='center', fontsize=10, color=TEXT_MUTED)

        # Problem text
        ax.text(6, 0.3, 'Short requests wait for longest. GPU slots wasted after completion.',
               ha='center', fontsize=11, color='#EF4444', fontweight='medium')

    def draw_timeline(self, ax, step):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(-0.5, 14)
        ax.set_ylim(-1, 9)
        ax.axis('off')

        ax.text(7, 8.5, f'Continuous Batching - Step {step + 1}', ha='center',
               fontsize=16, fontweight='bold', color=TEXT_COLOR)

        active = self.get_active_requests(step)

        # Draw batch slots
        for i in range(self.num_slots):
            y = 6.5 - i * 1.5
            slot_x = 1

            # Slot box
            if i < len(active):
                name, progress, length = active[i]
                color_idx = ord(name) - ord('A')

                # Progress bar background
                bg_rect = patches.FancyBboxPatch(
                    (slot_x, y - 0.4), 5, 0.8,
                    boxstyle="round,pad=0.02",
                    facecolor=EMPTY_COLOR, alpha=0.5
                )
                ax.add_patch(bg_rect)

                # Progress bar fill
                fill_width = (progress / length) * 5
                fill_rect = patches.FancyBboxPatch(
                    (slot_x, y - 0.4), fill_width, 0.8,
                    boxstyle="round,pad=0.02",
                    facecolor=SLOT_COLORS[color_idx % len(SLOT_COLORS)], alpha=0.8
                )
                ax.add_patch(fill_rect)

                # Request label
                ax.text(slot_x - 0.5, y, name, ha='center', va='center',
                       fontsize=14, fontweight='bold',
                       color=SLOT_COLORS[color_idx % len(SLOT_COLORS)])

                # Progress text
                ax.text(slot_x + 2.5, y, f'{progress}/{length}', ha='center', va='center',
                       fontsize=10, color=TEXT_COLOR, fontweight='medium')

                # Status indicator
                if progress == length:
                    ax.text(slot_x + 5.5, y, 'DONE', ha='left', va='center',
                           fontsize=10, color=NEW_COLOR, fontweight='bold')
            else:
                # Empty slot
                empty_rect = patches.FancyBboxPatch(
                    (slot_x, y - 0.4), 5, 0.8,
                    boxstyle="round,pad=0.02",
                    facecolor=EMPTY_COLOR, alpha=0.3,
                    linestyle='--', edgecolor=EMPTY_COLOR, linewidth=1
                )
                ax.add_patch(empty_rect)
                ax.text(slot_x - 0.5, y, '-', ha='center', va='center',
                       fontsize=14, color=TEXT_MUTED)
                ax.text(slot_x + 2.5, y, 'Empty', ha='center', va='center',
                       fontsize=10, color=TEXT_MUTED)

        # Queue indicator
        waiting = []
        for name, start, length in self.requests:
            if start > step:
                waiting.append(name)
            elif start <= step < start + length:
                pass  # Active
            # Completed requests not shown

        if waiting:
            ax.text(9, 6.5, 'Queue:', ha='left', fontsize=11, color=TEXT_MUTED)
            for i, name in enumerate(waiting[:3]):
                color_idx = ord(name) - ord('A')
                circle = patches.Circle((10 + i * 0.8, 6.5), 0.3,
                                        facecolor=SLOT_COLORS[color_idx % len(SLOT_COLORS)],
                                        alpha=0.7)
                ax.add_patch(circle)
                ax.text(10 + i * 0.8, 6.5, name, ha='center', va='center',
                       fontsize=9, color='white', fontweight='bold')

        # Legend
        ax.text(1, 0.5, 'Key:', fontsize=10, color=TEXT_MUTED)
        ax.add_patch(patches.Rectangle((2, 0.3), 0.4, 0.4, facecolor=ACCENT, alpha=0.7))
        ax.text(2.6, 0.5, 'Active', fontsize=9, color=TEXT_COLOR, va='center')
        ax.add_patch(patches.Rectangle((4, 0.3), 0.4, 0.4, facecolor=NEW_COLOR, alpha=0.7))
        ax.text(4.6, 0.5, 'Just finished', fontsize=9, color=TEXT_COLOR, va='center')
        ax.add_patch(patches.Rectangle((7, 0.3), 0.4, 0.4, facecolor=EMPTY_COLOR, alpha=0.5))
        ax.text(7.6, 0.5, 'Ready for new request', fontsize=9, color=TEXT_COLOR, va='center')

        # Status message
        completed = []
        newly_added = []
        for name, start, length in self.requests:
            if start + length - 1 == step:
                completed.append(name)
            if start == step:
                newly_added.append(name)

        if completed or newly_added:
            msg_parts = []
            if completed:
                msg_parts.append(f'{", ".join(completed)} completed')
            if newly_added:
                msg_parts.append(f'{", ".join(newly_added)} started')
            ax.text(7, -0.5, ' | '.join(msg_parts), ha='center',
                   fontsize=11, color=ACCENT, fontweight='medium')

    def draw_summary(self, ax):
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        ax.text(5, 8.5, 'Continuous Batching Benefits', ha='center',
               fontsize=20, fontweight='bold', color=TEXT_COLOR)

        benefits = [
            ('No waiting', 'Short requests complete immediately'),
            ('No waste', 'Empty slots filled instantly'),
            ('Max throughput', 'GPU always at full utilization'),
            ('Low latency', 'Requests served as fast as possible'),
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

        ax.text(5, 1, 'Iteration-level scheduling = Maximum efficiency', ha='center',
               fontsize=12, color=ACCENT, fontweight='medium')

    def render_frame(self, frame_data):
        self.fig.clear()
        ax = self.fig.add_subplot(111)
        frame_type = frame_data[0]

        if frame_type == 'title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, frame_data[1], ha='center', fontsize=28,
                   fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, frame_data[2], ha='center', fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'static_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Problem: Static Batching', ha='center',
                   fontsize=24, fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'All requests must wait for the longest one',
                   ha='center', fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'static_problem':
            self.draw_static_problem(ax)
        elif frame_type == 'continuous_title':
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')
            ax.text(5, 5.5, 'The Solution: Continuous Batching', ha='center',
                   fontsize=24, fontweight='bold', color=TEXT_COLOR)
            ax.text(5, 4.2, 'Schedule at every iteration',
                   ha='center', fontsize=14, color=TEXT_MUTED)
        elif frame_type == 'timeline':
            self.draw_timeline(ax, frame_data[1])
        elif frame_type == 'summary':
            self.draw_summary(ax)

        self.fig.tight_layout()

    def save_gif(self, filename, fps=1):
        frames = self.create_frames()
        print(f"Continuous Batching: Generating {len(frames)} frames...")

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

    anim = ContinuousBatchingAnimation()
    anim.save_gif(os.path.join(output_dir, 'continuous_batching.gif'), fps=1)
    print("Done!")
