import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    // Dependencies were previously resolved from the parent frontend folder.
    // Keep the runtime and all libraries on this app's React instance.
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    react(),
    tailwindcss()
  ],
     
});
