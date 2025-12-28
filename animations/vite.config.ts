import {defineConfig} from 'vite';
import motionCanvasPkg from '@motion-canvas/vite-plugin';
import ffmpegPkg from '@motion-canvas/ffmpeg';

const motionCanvas = motionCanvasPkg.default || motionCanvasPkg;
const ffmpegPlugin = ffmpegPkg.default || ffmpegPkg;

export default defineConfig({
  plugins: [
    motionCanvas({
      project: ['./src/project.ts'],
    }),
    ffmpegPlugin(),
  ],
});
