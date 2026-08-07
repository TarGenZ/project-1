import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, path = '/', noindex = false, structuredData }) {
  const url = `https://mentorship.arpansarkar.org${path}`;
  const schema = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      {schema.map((item, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(item)}</script>
      ))}
    </Helmet>
  );
}
