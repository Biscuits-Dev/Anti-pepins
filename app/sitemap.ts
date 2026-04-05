import type { MetadataRoute } from "next";

const BASE = "https://anti-pepins.biscuits-ia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                        lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/analyze`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/report`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/faq`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/temoignage`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/about`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contribuer`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/mentions-legales`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/rgpd`,              lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/cgu`,               lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/politique-cookies`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/accessibilite`,     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  ];
}
