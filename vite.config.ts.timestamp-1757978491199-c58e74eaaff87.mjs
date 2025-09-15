// vite.config.ts
import { defineConfig } from "file:///C:/Users/Mauricio/Documents/Development/SiconSuiteERP/erp_ui/node_modules/vite/dist/node/index.js";
import million from "file:///C:/Users/Mauricio/Documents/Development/SiconSuiteERP/erp_ui/node_modules/million/dist/packages/compiler.mjs";
import react from "file:///C:/Users/Mauricio/Documents/Development/SiconSuiteERP/erp_ui/node_modules/@vitejs/plugin-react/dist/index.mjs";
import * as path from "path";
import { nodePolyfills } from "file:///C:/Users/Mauricio/Documents/Development/SiconSuiteERP/erp_ui/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Mauricio\\Documents\\Development\\SiconSuiteERP\\erp_ui";
var vite_config_default = defineConfig(({ command }) => {
  const commonConfig = {
    plugins: [
      nodePolyfills({
        globals: {
          Buffer: true,
          // can also be 'build', 'dev', or false
          global: true,
          process: true
        }
      }),
      react()
    ],
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__vite_injected_original_dirname, "src") },
        { find: "stream", replacement: "stream-browserify" },
        { find: "events", replacement: "events" },
        { find: "util", replacement: "util" }
      ]
    }
  };
  if (command === "serve") {
    return {
      ...commonConfig,
      plugins: [million.vite({ auto: true }), ...commonConfig.plugins],
      server: {
        //host: '0.0.0.0', // Escuchar en todas las interfaces de red
        port: 5173
        // El puerto que deseas utilizar
      }
    };
  } else {
    return {
      ...commonConfig,
      server: {
        //host: '0.0.0.0', // Escuchar en todas las interfaces de red
        port: 5173
        // El puerto que deseas utilizar
      }
    };
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXVyaWNpb1xcXFxEb2N1bWVudHNcXFxcRGV2ZWxvcG1lbnRcXFxcU2ljb25TdWl0ZUVSUFxcXFxlcnBfdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1hdXJpY2lvXFxcXERvY3VtZW50c1xcXFxEZXZlbG9wbWVudFxcXFxTaWNvblN1aXRlRVJQXFxcXGVycF91aVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTWF1cmljaW8vRG9jdW1lbnRzL0RldmVsb3BtZW50L1NpY29uU3VpdGVFUlAvZXJwX3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCBtaWxsaW9uIGZyb20gJ21pbGxpb24vY29tcGlsZXInO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQgfSkgPT4ge1xyXG4gIGNvbnN0IGNvbW1vbkNvbmZpZyA9IHtcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgbm9kZVBvbHlmaWxscyh7XHJcbiAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgQnVmZmVyOiB0cnVlLCAvLyBjYW4gYWxzbyBiZSAnYnVpbGQnLCAnZGV2Jywgb3IgZmFsc2VcclxuICAgICAgICAgIGdsb2JhbDogdHJ1ZSxcclxuICAgICAgICAgIHByb2Nlc3M6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSksXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICBdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczogW1xyXG4gICAgICAgIHsgZmluZDogJ0AnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpIH0sXHJcbiAgICAgICAgeyBmaW5kOiAnc3RyZWFtJywgcmVwbGFjZW1lbnQ6ICdzdHJlYW0tYnJvd3NlcmlmeScgfSxcclxuICAgICAgICB7IGZpbmQ6ICdldmVudHMnLCByZXBsYWNlbWVudDogJ2V2ZW50cycgfSxcclxuICAgICAgICB7IGZpbmQ6ICd1dGlsJywgcmVwbGFjZW1lbnQ6ICd1dGlsJyB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9O1xyXG5cclxuICBpZiAoY29tbWFuZCA9PT0gJ3NlcnZlJykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgLi4uY29tbW9uQ29uZmlnLFxyXG4gICAgICBwbHVnaW5zOiBbbWlsbGlvbi52aXRlKHsgYXV0bzogdHJ1ZSB9KSwgLi4uY29tbW9uQ29uZmlnLnBsdWdpbnNdLFxyXG4gICAgICBzZXJ2ZXI6IHtcclxuICAgICAgICAvL2hvc3Q6ICcwLjAuMC4wJywgLy8gRXNjdWNoYXIgZW4gdG9kYXMgbGFzIGludGVyZmFjZXMgZGUgcmVkXHJcbiAgICAgICAgcG9ydDogNTE3MywgLy8gRWwgcHVlcnRvIHF1ZSBkZXNlYXMgdXRpbGl6YXJcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIC4uLmNvbW1vbkNvbmZpZyxcclxuICAgICAgc2VydmVyOiB7XHJcbiAgICAgICAgLy9ob3N0OiAnMC4wLjAuMCcsIC8vIEVzY3VjaGFyIGVuIHRvZGFzIGxhcyBpbnRlcmZhY2VzIGRlIHJlZFxyXG4gICAgICAgIHBvcnQ6IDUxNzMsIC8vIEVsIHB1ZXJ0byBxdWUgZGVzZWFzIHV0aWxpemFyXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gIH1cclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1gsU0FBUyxvQkFBb0I7QUFDalosT0FBTyxhQUFhO0FBQ3BCLE9BQU8sV0FBVztBQUNsQixZQUFZLFVBQVU7QUFDdEIsU0FBUyxxQkFBcUI7QUFKOUIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxRQUFRLE1BQU07QUFDM0MsUUFBTSxlQUFlO0FBQUEsSUFDbkIsU0FBUztBQUFBLE1BQ1AsY0FBYztBQUFBLFFBQ1osU0FBUztBQUFBLFVBQ1AsUUFBUTtBQUFBO0FBQUEsVUFDUixRQUFRO0FBQUEsVUFDUixTQUFTO0FBQUEsUUFDWDtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEVBQUUsTUFBTSxLQUFLLGFBQWtCLGFBQVEsa0NBQVcsS0FBSyxFQUFFO0FBQUEsUUFDekQsRUFBRSxNQUFNLFVBQVUsYUFBYSxvQkFBb0I7QUFBQSxRQUNuRCxFQUFFLE1BQU0sVUFBVSxhQUFhLFNBQVM7QUFBQSxRQUN4QyxFQUFFLE1BQU0sUUFBUSxhQUFhLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsTUFBSSxZQUFZLFNBQVM7QUFDdkIsV0FBTztBQUFBLE1BQ0wsR0FBRztBQUFBLE1BQ0gsU0FBUyxDQUFDLFFBQVEsS0FBSyxFQUFFLE1BQU0sS0FBSyxDQUFDLEdBQUcsR0FBRyxhQUFhLE9BQU87QUFBQSxNQUMvRCxRQUFRO0FBQUE7QUFBQSxRQUVOLE1BQU07QUFBQTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsRUFDRixPQUFPO0FBQ0wsV0FBTztBQUFBLE1BQ0wsR0FBRztBQUFBLE1BQ0gsUUFBUTtBQUFBO0FBQUEsUUFFTixNQUFNO0FBQUE7QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
