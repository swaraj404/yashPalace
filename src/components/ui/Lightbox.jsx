import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Lightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [image, onClose]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`fixed inset-0 z-[8000] flex items-center justify-center bg-[#141a0c]/95 p-8 backdrop-blur-md transition-opacity duration-300 ${
        image ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
      aria-hidden={!image}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-7 top-6 grid h-12 w-12 place-items-center text-ivory transition-transform hover:scale-110"
      >
        <X size={32} />
      </button>
      {image && (
        <img
          src={image.src}
          alt={image.caption || ''}
          className={`max-h-[88vh] max-w-[92vw] rounded-xl shadow-2xl transition-transform duration-300 ${
            image ? 'scale-100' : 'scale-95'
          }`}
        />
      )}
    </div>
  );
}
