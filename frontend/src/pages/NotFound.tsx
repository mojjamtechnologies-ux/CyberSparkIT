import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';
export default function NotFound() {
  usePageMeta('Page not found', 'The page you were looking for could not be found.');
  return (
    <section className="section"><div className="container center">
      <h1>404: Page not found</h1><p>The page you are looking for does not exist or has moved.</p>
      <p className="btns" style={{ justifyContent: 'center' }}><Link className="btn btn-primary" to="/">Back to Home</Link><Link className="btn btn-outline" to="/contact">Contact Us</Link></p>
    </div></section>
  );
}
