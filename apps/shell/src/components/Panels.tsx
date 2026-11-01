"use client";

import dynamic from "next/dynamic";

// remotes are browser-only: render them on the client, keep the shell server-rendered
const RemotePanel = dynamic(() => import("./RemotePanel").then((m) => m.RemotePanel), { ssr: false });

export function SalesSection() {
  return <RemotePanel name="sales" module="SalesPanel" label="Sales" />;
}

export function CustomersSection() {
  return <RemotePanel name="customers" module="CustomersPanel" label="Customers" />;
}
