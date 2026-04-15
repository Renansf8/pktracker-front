import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Alertar apenas para chunks acima de 800kb (padrão é 500kb)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Divide o bundle em chunks menores por categoria de lib.
        // O navegador pode cachear cada chunk separadamente — quando o código
        // da aplicação muda, os chunks de vendor (que mudam raramente) ficam em cache.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react/jsx-runtime"],
          "vendor-router": ["react-router"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts", "@tremor/react"],
          "vendor-radix": [
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@headlessui/react",
          ],
          "vendor-utils": ["axios", "date-fns", "zod", "clsx", "tailwind-merge"],
          "vendor-icons": ["lucide-react", "@remixicon/react"],
        },
      },
    },
  },
});
