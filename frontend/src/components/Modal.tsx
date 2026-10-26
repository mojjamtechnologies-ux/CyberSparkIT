import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="modal" aria-label={title} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {open && (
        <div className="modal-body">
          <button className="modal-x" onClick={onClose} aria-label="Close"><X size={20} /></button>
          <h2>{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
