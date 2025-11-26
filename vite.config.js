import { defineConfig } from 'vite';
import { resolve } from 'path';

import injectHTML from 'vite-plugin-html-inject';

export default defineConfig({  
  root: '',
  resolve: {
     alias: {
        '@': resolve(__dirname, 'src'),
        '@svg': resolve(__dirname, 'src/assets/svg'),
        '@styles': resolve(__dirname, 'src/assets/css'),
        '@~': resolve(__dirname, 'node_modules'),
        Notification: resolve(__dirname, 'src/assets/js/notification.js'),
        Menu: resolve(__dirname, 'src/assets/js/menu.js'),
      },
  },
  plugins: [injectHTML()],
  base:'/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets', // Leave `assetsDir` empty so that all static resources are placed in the root of the `dist` folder.    
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
      //   // Uncomment if you need to specify entry points for .html files
        index:  'index.html',        
      //   thoughts: resolve(__dirname, 'src/thoughts.html'),
      //   about: resolve(__dirname, 'src/about.html'),
      //   contact: resolve(__dirname, 'src/contact.html'),
      },
      output: {
        entryFileNames: 'assets/js/[name].js', // If you need a specific file name, comment out
        chunkFileNames: 'assets/js/[name].js', // these lines and uncomment the bottom ones
        // entryFileNames: chunk => {
        //   if (chunk.name === 'main') {
        //     return 'js/main.min.js';
        //   }
        //   return 'js/main.min.js';
        // },
        assetFileNames: assetInfo => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|webm|mp3)$/.test(assetInfo.name)) {
            return `assets/media/[name]-[hash].${extType}`;
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name].${extType}`;
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        },
      },
    },
  },
});