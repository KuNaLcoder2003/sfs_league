import { defineConfig } from "vite";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://sfs-league.kunalserver.live',
        changeOrigin: true,
      },
    },
  },

}));
