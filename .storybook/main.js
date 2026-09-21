import { mergeConfig } from 'vite';

const config = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  typescript: { check: false, reactDocgen: 'none' },
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        dedupe: ['react', 'react-dom'],
      },
    }),
};
export default config;
