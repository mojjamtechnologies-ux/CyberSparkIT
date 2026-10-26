// Temporary, editable logo concept. Replace with the official CyberSpark logo file when available.
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="logo">
      <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#0B65D8" /><path d="M36 8 16 36h14l-4 20 22-30H34z" fill="#FFB800" /></svg>
      <span className="logo-text" style={{ color: light ? '#fff' : 'var(--navy)' }}>
        CyberSpark<small style={{ color: light ? '#FFD35C' : 'var(--blue)' }}>IT Solutions</small>
      </span>
    </span>
  );
}
