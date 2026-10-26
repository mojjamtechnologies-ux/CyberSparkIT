import { Check } from 'lucide-react';
import { usePageMeta } from '../lib/meta';
import EnquiryForm from '../components/EnquiryForm';

const ITEMS = ['Automated enquiry handling', 'Website and WhatsApp chatbots', 'Lead collection and follow-up workflows', 'Email notifications and document processing', 'Customer onboarding automation', 'Appointment reminders', 'Invoice and reporting workflows', 'CRM synchronisation', 'AI-assisted customer support', 'Workflow integration using tools such as n8n', 'AI-powered internal business assistants'];

export default function Automation() {
  usePageMeta('AI & Business Automation', 'Automate repetitive business tasks with workflows, chatbots and AI assistants, with human review where it matters.');
  return (
    <>
      <section className="page-head"><div className="container"><h1>AI &amp; Business Automation</h1><p>Spend less time on repetitive tasks and more time on your customers.</p></div></section>
      <section className="section"><div className="container split">
        <div className="prose">
          <h2>What we can help automate</h2>
          <ul className="ticks">{ITEMS.map((i) => <li key={i}><Check size={18} />{i}</li>)}</ul>
          <h2>Honest expectations</h2>
          <p>AI is a helpful assistant, not a replacement for people. We design automations so that important replies, decisions and customer messages are reviewed by a person where appropriate. Some integrations depend on the tools you already use and on approvals from third-party platforms (for example WhatsApp Business), so we confirm what is possible during discovery before promising anything. Automated messages are only sent with customer consent.</p>
        </div>
        <div className="card"><h2>Tell us about your workflow</h2><EnquiryForm variant="automation" defaultService="ai-business-automation" /></div>
      </div></section>
    </>
  );
}
