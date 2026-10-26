import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';
import { PostSummary } from '../lib/api';
import { useApi } from '../lib/useApi';

export default function Blog() {
  usePageMeta('Blog', 'Technology tips and updates for small businesses from CyberSpark IT Solutions.');
  const { data, loading, error, reload } = useApi<PostSummary[]>('/posts');
  return (
    <>
      <section className="page-head"><div className="container"><h1>Blog</h1><p>Technology tips for small businesses.</p></div></section>
      <section className="section"><div className="container">
        {loading && <p className="status" role="status">Loading…</p>}
        {error && <div className="status" role="alert"><p>We could not load the articles.</p><button className="btn btn-outline" onClick={reload}>Try again</button></div>}
        {data && data.length === 0 && <div className="status"><p>No articles have been published yet. Check back soon.</p><Link className="btn btn-outline" to="/contact">Ask us a question</Link></div>}
        <div className="grid g3">{(data ?? []).map((p) => (
          <Link to={`/blog/${p.slug}`} className="card card-link" key={p.id}>
            <p className="tags">{new Date(p.published_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p><h3>{p.title}</h3>{p.excerpt && <p>{p.excerpt}</p>}<span className="more">Read more →</span>
          </Link>))}</div>
      </div></section>
    </>
  );
}
