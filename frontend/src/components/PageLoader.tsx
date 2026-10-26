import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './pageLoader.css';

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
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, [show, run]);

  return show ? <div className="page-loader" key={run} aria-hidden="true"><img src="/logo.png" alt="" /></div> : null;
}
