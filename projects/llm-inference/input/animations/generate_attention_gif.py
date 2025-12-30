#!/usr/bin/env python3
"""
Generate a slick, smooth animated GIF showing the attention mechanism.
Designed for clarity and visual appeal.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.animation import FuncAnimation, PillowWriter
from matplotlib.colors import LinearSegmentedColormap
import matplotlib.patheffects as path_effects

# === STYLE CONFIGURATION ===
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Helvetica Neue', 'Arial', 'sans-serif'],
    'font.size': 11,
    'axes.linewidth': 0,
    'figure.facecolor': '#FAFAFA',
    'axes.facecolor': '#FAFAFA',
})

# Colors
BG_COLOR = '#FAFAFA'
TEXT_COLOR = '#1a1a1a'
TEXT_MUTED = '#666666'
ACCENT = '#2563EB'  # Blue
ACCENT_LIGHT = '#DBEAFE'
HIGHLIGHT = '#F59E0B'  # Amber
POSITIVE_COLOR = '#059669'  # Green
NEGATIVE_COLOR = '#DC2626'  # Red

# Custom colormap for matrices
colors_diverging = ['#3B82F6', '#FAFAFA', '#EF4444']
cmap_diverging = LinearSegmentedColormap.from_list('custom', colors_diverging, N=256)

colors_sequential = ['#FAFAFA', '#2563EB']
cmap_sequential = LinearSegmentedColormap.from_list('sequential', colors_sequential, N=256)

# === DATA ===
tokens = ['The', 'cat', 'sat']
X = np.array([
    [1.0, 0.5, -0.2, 0.8],
    [0.3, -0.7, 1.2, 0.1],
    [-0.5, 0.9, 0.4, -0.3]
])

W_Q = np.array([[0.1, 0.4], [0.3, -0.2], [-0.5, 0.1], [0.2, 0.6]])
W_K = np.array([[0.2, -0.1], [0.5, 0.3], [-0.3, 0.4], [0.1, -0.2]])
W_V = np.array([[-0.2, 0.5], [0.4, 0.1], [0.3, -0.4], [-0.1, 0.3]])

Q = X @ W_Q
K = X @ W_K
V = X @ W_V

d_k = K.shape[1]
scores = Q @ K.T
scaled_scores = scores / np.sqrt(d_k)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

attn_weights = softmax(scaled_scores)
output = attn_weights @ V


class SlickAttentionAnimation:
    def __init__(self):
        self.fig = plt.figure(figsize=(12, 7), facecolor=BG_COLOR)
        self.current_step = 0

    def draw_matrix(self, ax, data, title="", subtitle="", row_labels=None, col_labels=None,
                    highlight_cells=None, cmap=None, vmin=-1, vmax=1, show_values=True,
                    value_format=".2f", fontsize=11, alpha=1.0):
        """Draw a beautifully styled matrix."""
        ax.clear()
        ax.set_facecolor(BG_COLOR)

        rows, cols = data.shape

        # Use appropriate colormap
        if cmap is None:
            cmap = cmap_diverging

        # Draw cells
        for i in range(rows):
            for j in range(cols):
                val = data[i, j]
                # Normalize value for color
                norm_val = (val - vmin) / (vmax - vmin) if vmax != vmin else 0.5
                norm_val = np.clip(norm_val, 0, 1)
                color = cmap(norm_val)

                # Cell rectangle
                rect = patches.FancyBboxPatch(
                    (j - 0.45, rows - i - 1 - 0.45), 0.9, 0.9,
                    boxstyle="round,pad=0.02,rounding_size=0.1",
                    facecolor=color, edgecolor='#E5E5E5', linewidth=1,
                    alpha=alpha
                )
                ax.add_patch(rect)

                # Highlight specific cells
                if highlight_cells and (i, j) in highlight_cells:
                    highlight_rect = patches.FancyBboxPatch(
                        (j - 0.48, rows - i - 1 - 0.48), 0.96, 0.96,
                        boxstyle="round,pad=0.02,rounding_size=0.12",
                        facecolor='none', edgecolor=HIGHLIGHT, linewidth=3,
                        alpha=alpha
                    )
                    ax.add_patch(highlight_rect)

                # Value text
                if show_values:
                    text_color = '#FFFFFF' if abs(norm_val - 0.5) > 0.35 else TEXT_COLOR
                    ax.text(j, rows - i - 1, f'{val:{value_format}}',
                           ha='center', va='center', fontsize=fontsize,
                           color=text_color, fontweight='medium', alpha=alpha)

        # Row labels
        if row_labels:
            for i, label in enumerate(row_labels):
                ax.text(-0.7, rows - i - 1, label, ha='right', va='center',
                       fontsize=10, color=TEXT_MUTED, alpha=alpha)

        # Column labels
        if col_labels:
            for j, label in enumerate(col_labels):
                ax.text(j, rows + 0.3, label, ha='center', va='bottom',
                       fontsize=10, color=TEXT_MUTED, alpha=alpha)

        # Title
        if title:
            ax.text(cols/2 - 0.5, rows + 0.9, title, ha='center', va='bottom',
                   fontsize=14, color=TEXT_COLOR, fontweight='bold', alpha=alpha)
        if subtitle:
            ax.text(cols/2 - 0.5, rows + 0.55, subtitle, ha='center', va='bottom',
                   fontsize=10, color=TEXT_MUTED, alpha=alpha)

        ax.set_xlim(-1.5, cols)
        ax.set_ylim(-0.7, rows + 1.5)
        ax.set_aspect('equal')
        ax.axis('off')

    def draw_title_slide(self, ax, title, subtitle="", step_num=None):
        """Draw a title/transition slide."""
        ax.clear()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')

        # Step indicator
        if step_num is not None:
            circle = patches.Circle((5, 7.5), 0.6, facecolor=ACCENT, edgecolor='none')
            ax.add_patch(circle)
            ax.text(5, 7.5, str(step_num), ha='center', va='center',
                   fontsize=16, color='white', fontweight='bold')

        # Title
        ax.text(5, 5.5, title, ha='center', va='center',
               fontsize=24, color=TEXT_COLOR, fontweight='bold')

        # Subtitle
        if subtitle:
            ax.text(5, 4.2, subtitle, ha='center', va='center',
                   fontsize=14, color=TEXT_MUTED)

    def draw_equation(self, ax, equation, y_pos=0.5):
        """Draw an equation."""
        ax.text(0.5, y_pos, equation, ha='center', va='center',
               fontsize=16, color=TEXT_COLOR, fontweight='medium',
               family='monospace', transform=ax.transAxes)

    def draw_arrow(self, ax, start, end, color=ACCENT):
        """Draw a styled arrow."""
        ax.annotate('', xy=end, xytext=start,
                   arrowprops=dict(arrowstyle='->', color=color, lw=2,
                                  connectionstyle='arc3,rad=0'))

    def create_frames(self):
        """Generate all animation frames."""
        frames = []

        # === SECTION 1: INTRODUCTION ===
        for _ in range(3):
            frames.append(('title', 'The Attention Mechanism',
                          'A step-by-step visual guide', None))

        # === SECTION 2: INPUT EMBEDDINGS ===
        for _ in range(4):
            frames.append(('input', X, 'Input Embeddings',
                          '3 tokens x 4 dimensions', 1))

        # === SECTION 3: WEIGHT MATRICES ===
        for _ in range(3):
            frames.append(('weights_intro', 'Learned Projections',
                          'Three weight matrices transform the input', 2))

        for _ in range(3):
            frames.append(('weights_show', W_Q, W_K, W_V))

        # === SECTION 4: COMPUTE Q, K, V ===
        for _ in range(3):
            frames.append(('compute_q', X, W_Q, Q, 'Computing Query (Q)',
                          'Q = X x W_Q'))

        for _ in range(3):
            frames.append(('compute_k', X, W_K, K, 'Computing Key (K)',
                          'K = X x W_K'))

        for _ in range(3):
            frames.append(('compute_v', X, W_V, V, 'Computing Value (V)',
                          'V = X x W_V'))

        for _ in range(3):
            frames.append(('qkv_result', Q, K, V, 'Projections Complete', 3))

        # === SECTION 5: ATTENTION SCORES ===
        for _ in range(3):
            frames.append(('scores_intro', 'Computing Attention Scores',
                          'Q x K^T measures similarity between tokens', 4))

        # Animate score computation row by row
        for row in range(3):
            for _ in range(2):
                frames.append(('scores_compute', row, scores))

        for _ in range(3):
            frames.append(('scores_full', scores, 'Attention Scores',
                          'Raw similarity between all token pairs'))

        # === SECTION 6: SCALING ===
        for _ in range(3):
            frames.append(('scale', scaled_scores, 'Scale by sqrt(d)',
                          f'Divide by sqrt({d_k}) = {np.sqrt(d_k):.2f} for stability', 5))

        # === SECTION 7: SOFTMAX ===
        for _ in range(3):
            frames.append(('softmax_intro', 'Apply Softmax',
                          'Convert to probability distribution', 6))

        for _ in range(3):
            frames.append(('softmax_result', attn_weights, 'Attention Weights',
                          'Each row sums to 1.0'))

        for _ in range(4):
            frames.append(('softmax_interpret', attn_weights,
                          '"The" attends: 32% self, 28% "cat", 40% "sat"', 0))

        # === SECTION 8: OUTPUT ===
        for _ in range(3):
            frames.append(('output_intro', 'Weighted Sum of Values',
                          'Output = Attention Weights x V', 7))

        for _ in range(3):
            frames.append(('output_compute', attn_weights, V, output))

        for _ in range(4):
            frames.append(('output_final', output, 'Contextual Representations',
                          'Each token now has information from all tokens'))

        # === SECTION 9: SUMMARY ===
        for _ in range(4):
            frames.append(('summary', 'Complete Attention',
                          'Attention(Q,K,V) = softmax(QK^T / sqrt(d)) x V', None))

        for _ in range(3):
            frames.append(('multihead', 'Multi-Head Attention',
                          '8+ parallel attention operations', None))

        for _ in range(3):
            frames.append(('layers', 'Stack Many Layers',
                          '32+ layers refine representations', None))

        for _ in range(3):
            frames.append(('end', 'That\'s Attention!',
                          'The core of modern language models', None))

        return frames

    def render_frame(self, frame_data):
        """Render a single frame based on frame data."""
        self.fig.clear()
        frame_type = frame_data[0]

        if frame_type == 'title':
            ax = self.fig.add_subplot(111)
            self.draw_title_slide(ax, frame_data[1], frame_data[2], frame_data[3])

        elif frame_type == 'input':
            ax = self.fig.add_subplot(111)
            self.draw_matrix(ax, frame_data[1], frame_data[2], frame_data[3],
                           row_labels=tokens, col_labels=['d₀', 'd₁', 'd₂', 'd₃'])
            # Step indicator
            self._draw_step_indicator(ax, frame_data[4])

        elif frame_type == 'weights_intro':
            ax = self.fig.add_subplot(111)
            self.draw_title_slide(ax, frame_data[1], frame_data[2], frame_data[3])

        elif frame_type == 'weights_show':
            ax1 = self.fig.add_subplot(131)
            ax2 = self.fig.add_subplot(132)
            ax3 = self.fig.add_subplot(133)

            self.draw_matrix(ax1, frame_data[1], 'W_Q', '[4×2]', fontsize=9)
            self.draw_matrix(ax2, frame_data[2], 'W_K', '[4×2]', fontsize=9)
            self.draw_matrix(ax3, frame_data[3], 'W_V', '[4×2]', fontsize=9)

        elif frame_type in ['compute_q', 'compute_k', 'compute_v']:
            ax1 = self.fig.add_subplot(141)
            ax2 = self.fig.add_subplot(142)
            ax3 = self.fig.add_subplot(143)
            ax4 = self.fig.add_subplot(144)

            self.draw_matrix(ax1, frame_data[1], 'X', '', row_labels=tokens, fontsize=8)
            ax2.clear()
            ax2.set_facecolor(BG_COLOR)
            ax2.text(0.5, 0.5, '×', fontsize=30, ha='center', va='center',
                    color=ACCENT, transform=ax2.transAxes)
            ax2.axis('off')
            self.draw_matrix(ax3, frame_data[2], frame_data[4].split('(')[1].split(')')[0].replace('W_', 'W_'), '', fontsize=8)
            ax4.clear()
            ax4.set_facecolor(BG_COLOR)
            ax4.text(0.3, 0.5, '=', fontsize=30, ha='center', va='center',
                    color=ACCENT, transform=ax4.transAxes)
            ax4.axis('off')

            self.fig.suptitle(frame_data[4], fontsize=16, fontweight='bold', y=0.95, color=TEXT_COLOR)
            self.fig.text(0.5, 0.08, frame_data[5], fontsize=12, ha='center',
                         color=TEXT_MUTED, family='monospace')

        elif frame_type == 'qkv_result':
            ax1 = self.fig.add_subplot(131)
            ax2 = self.fig.add_subplot(132)
            ax3 = self.fig.add_subplot(133)

            self.draw_matrix(ax1, frame_data[1], 'Q (Query)', '[3×2]', row_labels=tokens)
            self.draw_matrix(ax2, frame_data[2], 'K (Key)', '[3×2]', row_labels=tokens)
            self.draw_matrix(ax3, frame_data[3], 'V (Value)', '[3×2]', row_labels=tokens)

            self.fig.suptitle(frame_data[4], fontsize=16, fontweight='bold', y=0.95, color=TEXT_COLOR)
            self._draw_step_indicator_fig(frame_data[5])

        elif frame_type == 'scores_intro':
            ax = self.fig.add_subplot(111)
            self.draw_title_slide(ax, frame_data[1], frame_data[2], frame_data[3])

        elif frame_type == 'scores_compute':
            row = frame_data[1]
            full_scores = frame_data[2]

            ax1 = self.fig.add_subplot(131)
            ax2 = self.fig.add_subplot(132)
            ax3 = self.fig.add_subplot(133)

            # Highlight current row in Q
            highlight_q = [(row, 0), (row, 1)]
            self.draw_matrix(ax1, Q, 'Q', '', row_labels=tokens,
                           highlight_cells=highlight_q)

            # Show K^T
            self.draw_matrix(ax2, K.T, 'K^T', '', col_labels=tokens)

            # Show partial scores
            partial = np.zeros_like(full_scores)
            partial[:row+1, :] = full_scores[:row+1, :]
            mask_alpha = np.ones_like(full_scores)
            mask_alpha[row+1:, :] = 0.2

            highlight_scores = [(row, j) for j in range(3)]
            self.draw_matrix(ax3, partial, 'Scores', '',
                           row_labels=[t+' ->' for t in tokens], col_labels=tokens,
                           highlight_cells=highlight_scores, vmin=-0.5, vmax=0.5)

            self.fig.suptitle(f'Computing row {row+1}: "{tokens[row]}" attending to all tokens',
                            fontsize=14, fontweight='bold', y=0.95, color=TEXT_COLOR)

        elif frame_type == 'scores_full':
            ax = self.fig.add_subplot(111)
            self.draw_matrix(ax, frame_data[1], frame_data[2], frame_data[3],
                           row_labels=[t+' ->' for t in tokens], col_labels=tokens,
                           vmin=-0.5, vmax=0.5)

        elif frame_type == 'scale':
            ax = self.fig.add_subplot(111)
            self.draw_matrix(ax, frame_data[1], frame_data[2], frame_data[3],
                           row_labels=[t+' ->' for t in tokens], col_labels=tokens,
                           vmin=-0.5, vmax=0.5)
            self._draw_step_indicator(ax, frame_data[4])

        elif frame_type == 'softmax_intro':
            ax = self.fig.add_subplot(111)
            self.draw_title_slide(ax, frame_data[1], frame_data[2], frame_data[3])

        elif frame_type == 'softmax_result':
            ax = self.fig.add_subplot(111)
            self.draw_matrix(ax, frame_data[1], frame_data[2], frame_data[3],
                           row_labels=[t+' ->' for t in tokens], col_labels=tokens,
                           cmap=cmap_sequential, vmin=0, vmax=0.5)

        elif frame_type == 'softmax_interpret':
            ax = self.fig.add_subplot(111)
            row = frame_data[3]
            highlight = [(row, j) for j in range(3)]
            self.draw_matrix(ax, frame_data[1], 'Attention Weights', '',
                           row_labels=[t+' ->' for t in tokens], col_labels=tokens,
                           highlight_cells=highlight, cmap=cmap_sequential, vmin=0, vmax=0.5)
            self.fig.text(0.5, 0.08, frame_data[2], fontsize=12, ha='center',
                         color=TEXT_COLOR, fontweight='medium')

        elif frame_type == 'output_intro':
            ax = self.fig.add_subplot(111)
            self.draw_title_slide(ax, frame_data[1], frame_data[2], frame_data[3])

        elif frame_type == 'output_compute':
            ax1 = self.fig.add_subplot(141)
            ax2 = self.fig.add_subplot(142)
            ax3 = self.fig.add_subplot(143)
            ax4 = self.fig.add_subplot(144)

            self.draw_matrix(ax1, frame_data[1], 'Weights', '',
                           row_labels=tokens, cmap=cmap_sequential, vmin=0, vmax=0.5, fontsize=8)
            ax2.clear()
            ax2.set_facecolor(BG_COLOR)
            ax2.text(0.5, 0.5, '×', fontsize=30, ha='center', va='center',
                    color=ACCENT, transform=ax2.transAxes)
            ax2.axis('off')
            self.draw_matrix(ax3, frame_data[2], 'V', '', row_labels=tokens, fontsize=8)
            ax4.clear()
            ax4.set_facecolor(BG_COLOR)
            ax4.text(0.3, 0.5, '=', fontsize=30, ha='center', va='center',
                    color=ACCENT, transform=ax4.transAxes)
            ax4.axis('off')

            self.fig.suptitle('Output = Attention × V', fontsize=16,
                            fontweight='bold', y=0.95, color=TEXT_COLOR)

        elif frame_type == 'output_final':
            ax = self.fig.add_subplot(111)
            self.draw_matrix(ax, frame_data[1], frame_data[2], frame_data[3],
                           row_labels=tokens, col_labels=['h₀', 'h₁'])

        elif frame_type == 'summary':
            ax = self.fig.add_subplot(111)
            ax.clear()
            ax.set_facecolor(BG_COLOR)
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')

            ax.text(5, 6, frame_data[1], ha='center', va='center',
                   fontsize=24, color=TEXT_COLOR, fontweight='bold')

            # Equation in a box
            rect = patches.FancyBboxPatch((1.5, 3.5), 7, 1.5,
                                         boxstyle="round,pad=0.1",
                                         facecolor=ACCENT_LIGHT, edgecolor=ACCENT,
                                         linewidth=2)
            ax.add_patch(rect)
            ax.text(5, 4.25, frame_data[2], ha='center', va='center',
                   fontsize=14, color=TEXT_COLOR, family='monospace', fontweight='medium')

        elif frame_type == 'multihead':
            ax = self.fig.add_subplot(111)
            ax.clear()
            ax.set_facecolor(BG_COLOR)
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')

            ax.text(5, 7.5, frame_data[1], ha='center', va='center',
                   fontsize=24, color=TEXT_COLOR, fontweight='bold')
            ax.text(5, 6.5, frame_data[2], ha='center', va='center',
                   fontsize=14, color=TEXT_MUTED)

            # Draw heads
            colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
                     '#10B981', '#06B6D4', '#6366F1', '#EF4444']
            for i, color in enumerate(colors):
                x = 1.5 + i * 0.9
                rect = patches.FancyBboxPatch((x, 3), 0.7, 2,
                                             boxstyle="round,pad=0.05",
                                             facecolor=color, alpha=0.8)
                ax.add_patch(rect)
                ax.text(x + 0.35, 4, f'H{i+1}', ha='center', va='center',
                       fontsize=10, color='white', fontweight='bold')

        elif frame_type == 'layers':
            ax = self.fig.add_subplot(111)
            ax.clear()
            ax.set_facecolor(BG_COLOR)
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')

            ax.text(5, 8.5, frame_data[1], ha='center', va='center',
                   fontsize=24, color=TEXT_COLOR, fontweight='bold')
            ax.text(5, 7.5, frame_data[2], ha='center', va='center',
                   fontsize=14, color=TEXT_MUTED)

            # Draw stacked layers
            for i in range(8):
                y = 1 + i * 0.7
                alpha = 0.3 + i * 0.09
                rect = patches.FancyBboxPatch((3, y), 4, 0.55,
                                             boxstyle="round,pad=0.02",
                                             facecolor=ACCENT, alpha=alpha)
                ax.add_patch(rect)
                if i < 3 or i > 5:
                    ax.text(5, y + 0.275, f'Layer {i+1}' if i < 3 else f'Layer {29+i-5}',
                           ha='center', va='center', fontsize=9, color='white')
                elif i == 4:
                    ax.text(5, y + 0.275, '...', ha='center', va='center',
                           fontsize=12, color='white')

        elif frame_type == 'end':
            ax = self.fig.add_subplot(111)
            ax.clear()
            ax.set_facecolor(BG_COLOR)
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)
            ax.axis('off')

            ax.text(5, 5.5, frame_data[1], ha='center', va='center',
                   fontsize=28, color=TEXT_COLOR, fontweight='bold')
            ax.text(5, 4.2, frame_data[2], ha='center', va='center',
                   fontsize=14, color=TEXT_MUTED)

        self.fig.tight_layout(pad=1.5)

    def _draw_step_indicator(self, ax, step_num):
        """Draw step indicator on axes."""
        if step_num:
            circle = patches.Circle((0.95, 0.95), 0.05, facecolor=ACCENT,
                                   transform=ax.transAxes, clip_on=False)
            ax.add_patch(circle)
            ax.text(0.95, 0.95, str(step_num), ha='center', va='center',
                   fontsize=10, color='white', fontweight='bold',
                   transform=ax.transAxes)

    def _draw_step_indicator_fig(self, step_num):
        """Draw step indicator on figure."""
        if step_num:
            ax = self.fig.add_axes([0.92, 0.88, 0.05, 0.08])
            ax.set_facecolor(BG_COLOR)
            circle = patches.Circle((0.5, 0.5), 0.4, facecolor=ACCENT)
            ax.add_patch(circle)
            ax.text(0.5, 0.5, str(step_num), ha='center', va='center',
                   fontsize=12, color='white', fontweight='bold')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')

    def save_gif(self, filename, fps=1):
        """Save the animation as a GIF."""
        frames = self.create_frames()
        print(f"Generating {len(frames)} frames at {fps} fps...")
        print(f"Total duration: {len(frames)/fps:.1f} seconds")

        def update(frame_idx):
            if frame_idx % 10 == 0:
                print(f"  Frame {frame_idx}/{len(frames)}")
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

    # Create images directory if needed
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, 'attention_mechanism.gif')

    anim = SlickAttentionAnimation()
    anim.save_gif(output_path, fps=1)  # 1 fps = 1 second per frame
    print("Done!")
