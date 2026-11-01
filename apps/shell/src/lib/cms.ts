import { createClient } from "contentful";

export interface Announcement {
  id: string;
  title: string;
  body: string;
}

const FALLBACK: Announcement[] = [
  {
    id: "local-1",
    title: "Real data, frozen in time",
    body: "Figures are real UCI Online Retail II transactions (Dec 2009 to Dec 2011), so \"last 30 days\" ends on 9 Dec 2011. This notice comes from Contentful when CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are set.",
  },
];

interface AnnouncementFields {
  title: string;
  body: string;
}

/**
 * Editors publish announcements in Contentful; results are cached for
 * 5 minutes so content changes need no deploy. A CMS outage falls back to
 * local copy instead of breaking the dashboard.
 */
const TTL_MS = 5 * 60_000;
let cached: { at: number; value: Promise<Announcement[]> } | null = null;

export function getAnnouncements(): Promise<Announcement[]> {
  if (!cached || Date.now() - cached.at > TTL_MS) cached = { at: Date.now(), value: fetchAnnouncements() };
  return cached.value;
}

async function fetchAnnouncements(): Promise<Announcement[]> {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!space || !accessToken) return FALLBACK;
  try {
    const client = createClient({ space, accessToken });
    const res = await client.getEntries({ content_type: "announcement", limit: 3, order: ["-sys.createdAt"] });
    return res.items.map((e) => {
      const f = e.fields as unknown as AnnouncementFields;
      return { id: e.sys.id, title: f.title, body: f.body };
    });
  } catch (err) {
    console.error("contentful fetch failed, using fallback", err);
    return FALLBACK;
  }
}
