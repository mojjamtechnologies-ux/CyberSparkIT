import { Faq } from '../lib/api';
import { useApi } from '../lib/useApi';

export default function Faqs() {
  const { data } = useApi<Faq[]>('/faqs');
  if (!data?.length) return null;
  return (
    <section className="section"><div className="container prose">
      <h2 className="h2">Frequently asked questions</h2>
      {data.map((f) => <details className="faq" key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>)}
    </div></section>
  );
}
