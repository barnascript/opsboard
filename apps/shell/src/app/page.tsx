import { connection } from "next/server";
import { getAnnouncements } from "@/lib/cms";
import { CustomersSection, SalesSection } from "@/components/Panels";

export default async function OverviewPage() {
  // per-request render: the CSP nonce in src/proxy.ts must reach every script tag
  await connection();
  const announcements = await getAnnouncements();
  return (
    <>
      <h1>Overview</h1>
      {announcements.map((a) => (
        <aside key={a.id} className="announcement" aria-label="Announcement">
          <h2>{a.title}</h2>
          <p>{a.body}</p>
        </aside>
      ))}
      <SalesSection />
      <CustomersSection />
    </>
  );
}
