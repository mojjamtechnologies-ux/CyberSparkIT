export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="logo">
      <img src="/logo.png" alt="" width={40} height={40} className="logo-img" />
      <span className="logo-text" style={{ color: light ? '#fff' : 'var(--navy)' }}>
        CyberSpark<small style={{ color: light ? '#FFD35C' : 'var(--blue)' }}>IT Solutions</small>
      </span>
    </span>
  );
}
