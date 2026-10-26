import { Link, useParams } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';
import { Post } from '../lib/api';
import { useApi } from '../lib/useApi';
import NotFound from './NotFound';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const { data, loading, error } = useApi<Post>(`/posts/${encodeURIComponent(slug)}`);
  usePageMeta(data?.title ?? 'Blog', data?.excerpt ?? 'CyberSpark IT Solutions blog');
  if (loading) return <section className="section"><div className="container"><p className="status" role="status">Loading…</p></div></section>;
  if (error === 404 || !data) return error && error !== 404 ? <section className="section"><div className="container"><p className="status" role="alert">We could not load this article.</p></div></section> : <NotFound />;
  return (
    <>
      <section className="page-head"><div className="container"><h1>{data.title}</h1><p>{new Date(data.published_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p></div></section>
      <section className="section"><article className="container prose">
        {data.body.split(/\n{2,}/).map((para, i) => para.startsWith('## ') ? <h2 key={i}>{para.slice(3)}</h2> : <p key={i} style={{ whiteSpace: 'pre-line' }}>{para}</p>)}
        <p><Link to="/blog">← Back to blog</Link></p>
      </article></section>
    </>
  );
}
