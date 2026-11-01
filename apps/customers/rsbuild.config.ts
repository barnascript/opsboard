import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

const port = 3002;
// where the built files are served from; override per environment in CI/CD
const publicUrl = process.env.PUBLIC_URL ?? `http://localhost:${port}/`;

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "customers",
      exposes: { "./CustomersPanel": "./src/CustomersPanel.tsx" },
      // the shell provides its own React; singleton stops two copies (and broken hooks)
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
      },
      dts: false,
    }),
  ],
  html: { title: "customers (standalone)" },
  server: { port, headers: { "Access-Control-Allow-Origin": "*" } },
  dev: { assetPrefix: publicUrl },
  output: { assetPrefix: publicUrl },
});
