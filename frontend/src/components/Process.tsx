import { PROCESS } from '../lib/site';
export default function Process() {
  return (
    <ol className="process">
      {PROCESS.map(([t, d], i) => (<li key={t}><span className="num">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>))}
    </ol>
  );
}
