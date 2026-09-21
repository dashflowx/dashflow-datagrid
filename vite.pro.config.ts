import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: path.resolve(__dirname, './datagrid-pro/dist'),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, './src/pro/index.tsx'),
      name: 'dashflowxDatagridPro',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@dashflowx/core', '@dashflowx/datagrid'],
      output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
    },
  },
  plugins: [react(), dts({ rollupTypes: true, outDir: 'datagrid-pro/dist', skipDiagnostics: true })],
});
