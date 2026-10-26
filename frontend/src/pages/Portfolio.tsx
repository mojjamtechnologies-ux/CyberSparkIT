import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';
import { Project } from '../lib/api';
import { useApi } from '../lib/useApi';
import { PROJECT_CATEGORIES } from '../data/content';

export default function Portfolio() {
  usePageMeta('Portfolio', 'Selected CyberSpark projects: websites, mobile apps, e-commerce, business systems and automation.');
  const { data, loading, error, reload } = useApi<Project[]>('/projects');
  const [cat, setCat] = useState<string>('All');
  const projects = data ?? [];
  const shown = projects.filter((p) => cat === 'All' || p.category === cat);
  return (
    <>
      <section className="page-head"><div className="container"><h1>Portfolio &amp; Case Studies</h1><p>Real projects, real results.</p></div></section>
      <section className="section"><div className="container">
        {loading && <p className="status" role="status">Loading…</p>}
        {error && <div className="status" role="alert"><p>We could not load the portfolio.</p><button className="btn btn-outline" onClick={reload}>Try again</button></div>}
        {!loading && !error && projects.length === 0 && (
          <div className="status"><p>Our project showcase is being prepared. Tell us what you need and we will walk you through relevant work.</p><Link className="btn btn-primary" to="/contact">Contact Us</Link></div>
        )}
        {projects.length > 0 && (
          <>
            <div className="filters" role="group" aria-label="Filter projects">
              {['All', ...PROJECT_CATEGORIES].map((c) => <button key={c} className={`chip ${cat === c ? 'on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
            </div>
            <div className="grid g3">
              {shown.map((p) => (
                <article className="card" key={p.id}>
                  {p.image_url && <img src={p.image_url} alt={`${p.title} screenshot`} loading="lazy" className="shot" />}
                  <h3>{p.title}</h3><p className="tags">{p.category}</p><p>{p.description}</p>
                  {p.problem && <p><strong>Problem:</strong> {p.problem}</p>}{p.solution && <p><strong>Solution:</strong> {p.solution}</p>}
                  {p.tech.length > 0 && <p className="tags">{p.tech.join(' · ')}</p>}
                  {p.features.length > 0 && <ul className="plain">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>}
                  {p.live_url && <a className="more" href={p.live_url} target="_blank" rel="noopener noreferrer">Live site →</a>}
                  {p.github_url && <a className="more" href={p.github_url} target="_blank" rel="noopener noreferrer">Repository →</a>}
                </article>
              ))}
            </div>
            {shown.length === 0 && <p className="status">No projects in this category yet.</p>}
          </>
        )}
      </div></section>
    </>
  );
}
