import { connection } from "next/server";
import { getAnnouncements } from "@/lib/cms";
import { CustomersSection, SalesSection } from "@/components/Panels";
import { REMOTES } from "@/lib/remotes";

export default async function OverviewPage() {
  // per-request render: the CSP nonce in src/proxy.ts must reach every script tag
  await connection();
  const announcements = await getAnnouncements();
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <dl className="hero__keys ob-label">
          <div>
            <dt>Modules</dt>
            <dd>{Object.keys(REMOTES).length} remotes · 1 shell</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>Module Federation 2</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>Seeded · 180 days</dd>
          </div>
        </dl>
        <h1 id="hero-title">Every number on one screen.</h1>
        <p className="hero__lede">
          Sales and customers are separate apps, built and deployed on their own, loaded into this shell at runtime and sharing one copy of React.
        </p>
      </section>
      {announcements.map((a) => (
        <aside key={a.id} className="announcement" aria-label="Announcement">
          <span className="ob-label">Notice</span>
          <h2>{a.title}</h2>
          <p>{a.body}</p>
        </aside>
      ))}
      <SalesSection />
      <CustomersSection />
    </>
  );
}
