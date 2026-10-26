import { useEffect, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import './pageLoader.css';

const HOLD_MS = 3000; // how long the loading screen stays up on every page change

// Covers the screen with the logo rising from bottom to top each time the page changes.
export default function PageLoader() {
  const { pathname } = useLocation();
  const [last, setLast] = useState(pathname);
  const [run, setRun] = useState(0);
  const [show, setShow] = useState(false);

  // Updating state during render makes the overlay appear in the same frame as the new page (no flash).
  if (pathname !== last) { setLast(pathname); setRun((n) => n + 1); setShow(true); }

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), HOLD_MS);
    return () => clearTimeout(t);
  }, [show, run]);

  return show ? (
    <div className="page-loader" key={run} aria-hidden="true" style={{ '--hold': `${HOLD_MS}ms` } as CSSProperties}>
      <img src="/logo.png" alt="" />
    </div>
  ) : null;
}
