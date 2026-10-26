import { usePageMeta } from '../lib/meta';
import UtilityGrid from '../components/UtilityGrid';

export default function Solutions() {
  usePageMeta('Business Utility Apps', 'Custom utility apps for small businesses: POS, inventory, booking, loyalty, invoicing, staff, CRM, accounting, messaging and more.');
  return (
    <>
      <section className="page-head"><div className="container"><h1>Custom Utility Apps &amp; Digital Solutions We Build for Small Businesses</h1>
        <p>These are solutions CyberSpark can develop and customise for your business, not necessarily ready-made, off-the-shelf products.</p></div></section>
      <section className="section"><div className="container"><UtilityGrid /></div></section>
    </>
  );
}
