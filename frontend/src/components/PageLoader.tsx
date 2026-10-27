import { useEffect, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import './pageLoader.css';

const REVEAL_MS = 3000;          // the logo takes this long to appear from bottom to top
const FADE_MS = 300;             // then the screen fades away
const SHOW_ON_FIRST_LOAD = true; // also play when the site first opens or is refreshed

export default function PageLoader() {
  const { pathname } = useLocation();
  const [last, setLast] = useState(pathname);
  const [run, setRun] = useState(0);
  const [show, setShow] = useState(SHOW_ON_FIRST_LOAD);

  // Updating state during render makes the overlay appear in the same frame as the new page (no flash).
  if (pathname !== last) { setLast(pathname); setRun((n) => n + 1); setShow(true); }

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), REVEAL_MS + FADE_MS);
    return () => clearTimeout(t);
  }, [show, run]);

  return show ? (
    <div className="page-loader" key={run} aria-hidden="true" style={{ '--reveal': `${REVEAL_MS}ms`, '--fade': `${FADE_MS}ms` } as CSSProperties}>
      <img src="/logo.png" alt="" />
    </div>
  ) : null;
}
