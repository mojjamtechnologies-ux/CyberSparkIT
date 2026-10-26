import { usePageMeta } from '../lib/meta';
import { SITE } from '../lib/site';

export function Privacy() {
  usePageMeta('Privacy Policy', 'How CyberSpark IT Solutions collects and uses information submitted through this website.');
  return (
    <section className="section"><div className="container prose">
      <h1>Privacy Policy</h1>
      <p>{SITE.name} (“we”) respects your privacy. This policy explains what we collect through this website and why.</p>
      <h2>What we collect</h2><p>When you submit an enquiry or consultation request we collect the details you give us: your name, business name, email address, phone number, the service you are interested in, budget and timeline, your message, and your preferred contact method. We do not collect payment details through this website.</p>
      <h2>How we use it</h2><p>We use this information only to respond to your request, prepare proposals or quotations, and manage our relationship with you. We contact you only by the method you choose.</p>
      <h2>Where it is stored</h2><p>Enquiries are stored in a secured database hosted by our service providers, and email notifications may pass through our email provider. Access is limited to authorised CyberSpark staff.</p>
      <h2>How long we keep it</h2><p>We keep enquiries only as long as needed to respond and to manage any resulting work, then delete or anonymise them.</p>
      <h2>Your rights</h2><p>You may ask to see, correct or delete the information we hold about you, or withdraw your consent to be contacted, at any time by emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      <h2>Cookies and analytics</h2><p>This website does not currently use advertising cookies. If analytics are added, this policy will be updated first.</p>
    </div></section>
  );
}

export function Terms() {
  usePageMeta('Terms of Service', 'Terms for using the CyberSpark IT Solutions website.');
  return (
    <section className="section"><div className="container prose">
      <h1>Terms of Service</h1>
      <p>By using this website you agree to these terms.</p>
      <h2>Use of the website</h2><p>You may browse the site and submit enquiries for lawful purposes. Please do not attempt to disrupt the site or access areas that are not public.</p>
      <h2>Information on this site</h2><p>We aim to keep information accurate, but descriptions of services are general. The solutions listed are ones we can develop and customise; they are not necessarily ready-made products.</p>
      <h2>Projects and quotations</h2><p>Any project is governed by a written quotation or agreement between you and CyberSpark that sets out the scope, price, timeline and responsibilities. An enquiry on this site is not a contract.</p>
      <h2>Liability</h2><p>To the extent permitted by law, we are not liable for losses arising from your use of this website’s general information.</p>
      <h2>Contact</h2><p>Questions about these terms: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </div></section>
  );
}
