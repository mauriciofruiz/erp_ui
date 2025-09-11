import { defineConfig } from 'vite';
import million from 'million/compiler';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const commonConfig = {
    plugins: [
      nodePolyfills({
        globals: {
          Buffer: true, // can also be 'build', 'dev', or false
          global: true,
          process: true,
        },
      }),
      react(),
    ],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: 'stream', replacement: 'stream-browserify' },
        { find: 'events', replacement: 'events' },
        { find: 'util', replacement: 'util' },
      ],
    },
  };

  if (command === 'serve') {
    return {
      ...commonConfig,
      plugins: [million.vite({ auto: true }), ...commonConfig.plugins],
      server: {
        //host: '0.0.0.0', // Escuchar en todas las interfaces de red
        port: 5173, // El puerto que deseas utilizar
      },
    };
  } else {
    return {
      ...commonConfig,
      server: {
        //host: '0.0.0.0', // Escuchar en todas las interfaces de red
        port: 5173, // El puerto que deseas utilizar
      },
    };
  }
});
