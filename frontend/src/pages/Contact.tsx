import { useSearchParams } from 'react-router-dom';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { usePageMeta } from '../lib/meta';
import { SITE } from '../lib/site';
import { telOf, useSite } from '../lib/useSite';
import EnquiryForm from '../components/EnquiryForm';
import BookingPicker from '../components/BookingPicker';
import Faqs from '../components/Faqs';

export default function Contact() {
  const consult = useSearchParams()[0].get('intent') === 'consultation';
  const { contact } = useSite();
  usePageMeta('Contact', 'Contact CyberSpark IT Solutions in Oshodi, Lagos by phone, email or enquiry form.');
  return (
    <>
      <section className="page-head"><div className="container"><h1>{consult ? 'Book a Free Consultation' : 'Contact Us'}</h1><p>{consult ? 'Choose a time that suits you.' : 'Tell us what you need and we will get back to you.'}</p></div></section>
      <section className="section"><div className="container split">
        <div className="prose">
          <h2>Get in touch</h2>
          <ul className="contact-list">
            {contact.phones.map((p) => <li key={p}><Phone size={18} /><a href={`tel:${telOf(p)}`}>{p}</a></li>)}
            <li><Mail size={18} /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li><Globe size={18} /><a href={SITE.url}>{SITE.url}</a></li>
            <li><MapPin size={18} /><span>{contact.address}</span></li>
          </ul>
          {consult && <p><a href="/contact">Prefer to send a project enquiry instead?</a></p>}
          {!consult && <p><a href="/contact?intent=consultation">Want to book a free consultation time?</a></p>}
        </div>
        <div className="card">{consult ? <BookingPicker /> : <EnquiryForm />}</div>
      </div></section>
      <Faqs />
    </>
  );
}
