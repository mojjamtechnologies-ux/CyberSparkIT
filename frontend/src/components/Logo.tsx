export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="logo">
      <img src="/logo.png" alt="" width={40} height={40} className="logo-img" />
      <span className="logo-text" style={{ color: light ? '#fff' : 'var(--ink)' }}>
        CyberSpark<small style={{ color: light ? '#FFD35C' : 'var(--link)' }}>IT Solutions</small>
      </span>
    </span>
  );
}
