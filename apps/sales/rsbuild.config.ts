import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

const port = 3001;
// dev serves from localhost; a build resolves its own URL at runtime ("auto"),
// so one artifact works on any host without a rebuild per environment
const devUrl = `http://localhost:${port}/`;

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "sales",
      exposes: { "./SalesPanel": "./src/SalesPanel.tsx" },
      // the shell provides its own React; singleton stops two copies (and broken hooks)
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
      },
      dts: false,
    }),
  ],
  html: { title: "sales (standalone)" },
  server: { port, headers: { "Access-Control-Allow-Origin": "*" } },
  dev: { assetPrefix: devUrl },
  output: { assetPrefix: "auto" },
});
