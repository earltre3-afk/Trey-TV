// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
const isVercelBuild = process.env.VERCEL === "1";

export default defineConfig({
  cloudflare: isVercelBuild ? false : undefined,
  plugins: isVercelBuild ? [nitro()] : [],
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;

            if (id.includes("livekit-client")) return "vendor-livekit";
            if (id.includes("@elevenlabs/") || id.includes("@livekit/")) return "vendor-voice";
            if (id.includes("protobufjs")) return "vendor-protobuf";
            if (id.includes("@google/genai")) return "vendor-genai";
            if (id.includes("zod")) return "vendor-zod";
            if (id.includes("@supabase/auth-js")) return "vendor-supabase-auth";
            if (id.includes("@supabase/postgrest-js")) return "vendor-supabase-postgrest";
            if (id.includes("@supabase/realtime-js")) return "vendor-supabase-realtime";
            if (id.includes("@supabase/storage-js") || id.includes("@supabase/functions-js")) {
              return "vendor-supabase-storage";
            }
            if (id.includes("@supabase/supabase-js")) return "vendor-supabase";
            if (id.includes("@tanstack/")) return "vendor-tanstack";
            if (
              id.includes("@radix-ui/") ||
              id.includes("react-dom") ||
              id.includes("\\react\\") ||
              id.includes("/react/") ||
              id.includes("scheduler")
            ) {
              return "vendor-react";
            }
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true,
    },
  },
});
// Trigger server restart
