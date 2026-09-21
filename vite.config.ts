import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/free/index.ts'),
      name: 'dashflowxDatagrid',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@dashflowx/core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@dashflowx/core': 'dashflowx',
        },
      },
    },
  },
  plugins: [react(), dts({ rollupTypes: true, skipDiagnostics: true })],
});
