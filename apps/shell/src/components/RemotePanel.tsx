"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createInstance } from "@module-federation/enhanced/runtime";
import { Loading } from "@opsboard/ui";
import { REMOTES, type RemoteName } from "@/lib/remotes";
import { RemoteBoundary } from "./RemoteBoundary";

// Next ships a canary React build ("19.x.y-canary-..."); strip the suffix so
// the remotes' "^19.0.0" range matches and they reuse this one copy.
const reactVersion = React.version.split("-")[0]!;

let mf: ReturnType<typeof createInstance> | null = null;
function federation() {
  mf ??= createInstance({
    name: "shell",
    remotes: (Object.keys(REMOTES) as RemoteName[]).map((name) => ({
      name,
      entry: `${REMOTES[name]}/mf-manifest.json`,
    })),
    shared: {
      react: { version: reactVersion, scope: "default", lib: () => React, shareConfig: { singleton: true, requiredVersion: "^19.0.0" } },
      "react-dom": { version: reactVersion, scope: "default", lib: () => ReactDOM, shareConfig: { singleton: true, requiredVersion: "^19.0.0" } },
    },
    // use the shell's already-loaded React instead of a newer copy from a remote
    shareStrategy: "loaded-first",
  });
  return mf;
}

type PanelProps = { apiBase: string };
const cache = new Map<string, React.LazyExoticComponent<React.ComponentType<PanelProps>>>();

function lazyRemote(name: RemoteName, module: string) {
  const id = `${name}/${module}`;
  let C = cache.get(id);
  if (!C) {
    C = React.lazy(async () => {
      const mod = await federation().loadRemote<{ default: React.ComponentType<PanelProps> }>(id);
      if (!mod) throw new Error(`remote ${id} returned nothing`);
      return mod;
    });
    cache.set(id, C);
  }
  return C;
}

export function RemotePanel({ name, module, label }: { name: RemoteName; module: string; label: string }) {
  const Panel = lazyRemote(name, module);
  const apiBase = typeof window === "undefined" ? "" : window.location.origin;
  return (
    <RemoteBoundary name={label}>
      <React.Suspense fallback={<Loading label={`Loading ${label}`} />}>
        <Panel apiBase={apiBase} />
      </React.Suspense>
    </RemoteBoundary>
  );
}
