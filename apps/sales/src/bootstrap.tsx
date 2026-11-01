import { createRoot } from "react-dom/client";
import "@opsboard/ui/src/styles.css";
import SalesPanel from "./SalesPanel";

// standalone mode: lets the team develop this panel without running the shell
const apiBase = process.env.PUBLIC_API_BASE ?? "http://localhost:3000";
createRoot(document.getElementById("root")!).render(
  <main className="ob-standalone">
    <SalesPanel apiBase={apiBase} />
  </main>,
);
